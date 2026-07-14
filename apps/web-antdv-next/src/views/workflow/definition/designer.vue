<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import LogicFlow from '@logicflow/core';
import { Menu, SelectionSelect } from '@logicflow/extension';
import '@logicflow/core/es/index.css';
import '@logicflow/extension/es/index.css';

import { Page } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Button, message, Space } from 'antdv-next';

import {
  getWorkflowDefinitionDetailApi,
  publishWorkflowDefinitionApi,
  saveWorkflowDefinitionCanvasApi,
  type WorkflowDefinitionApi,
} from '#/api/workflow';
import { $t } from '#/locales';

import NodePanel from './components/node-panel.vue';
import PropertyPanel from './components/property-panel.vue';
import type {
  WorkflowElement,
  WorkflowGraphData,
  WorkflowPaletteNode,
  WorkflowPropertyValues,
} from './types';

defineOptions({
  name: 'WorkflowDefinitionDesigner',
});

type LogicFlowInstance = InstanceType<typeof LogicFlow>;

const route = useRoute();
const router = useRouter();
const containerRef = ref<HTMLDivElement>();
const lfRef = ref<LogicFlowInstance>();
const selectedElement = ref<WorkflowElement>();
const definition = ref<WorkflowDefinitionApi.WorkflowDefinition>();
const loading = ref(false);
const zoomPercent = ref('100%');

const isConditionEdge = computed(() => {
  const edge = selectedElement.value;
  if (!edge?.sourceNodeId) {
    return false;
  }
  const sourceNode = lfRef.value?.getDataById(edge.sourceNodeId);
  return sourceNode?.properties?.nodeType === 'condition';
});

const definitionId = String(route.params.definitionId ?? '');

onMounted(async () => {
  await initDesigner();
});

onBeforeUnmount(() => {
  lfRef.value?.destroy();
});

/** 加载流程定义并初始化设计器。 */
async function initDesigner() {
  loading.value = true;
  try {
    definition.value = await getWorkflowDefinitionDetailApi(definitionId);
    await nextTick();
    initLogicFlow();
  } finally {
    loading.value = false;
  }
}

/** 初始化 LogicFlow 实例、主题和画布事件。 */
function initLogicFlow() {
  if (!containerRef.value) {
    return;
  }

  const lf = new LogicFlow({
    background: {
      backgroundColor: '#f8fafc',
    },
    container: containerRef.value,
    grid: true,
    keyboard: {
      enabled: true,
    },
    plugins: [Menu, SelectionSelect],
    snapline: true,
  });

  lf.setTheme({
    circle: {
      fill: '#f8fafc',
      r: 24,
      stroke: '#16a34a',
      strokeWidth: 1.5,
    },
    diamond: {
      fill: '#fffbeb',
      stroke: '#d97706',
      strokeWidth: 1.5,
    },
    rect: {
      fill: '#eff6ff',
      radius: 6,
      stroke: '#2563eb',
      strokeWidth: 1.5,
    },
  });

  lf.on('node:click', ({ data }: { data: unknown }) => {
    setSelectedElement(data);
  });
  lf.on('edge:click', ({ data }: { data: unknown }) => {
    setSelectedElement(data);
  });
  lf.on('blank:click', () => {
    selectedElement.value = undefined;
  });
  lf.on('selection:selected', ({ data }: { data?: unknown[] }) => {
    setSelectedElement(data?.[0]);
  });

  lf.render(resolveGraphData(definition.value?.flowData));
  lfRef.value = lf;
  onResetZoom();
}

/** 解析后端画布数据，解析失败时返回默认画布。 */
function resolveGraphData(flowData?: string): WorkflowGraphData {
  if (!flowData) {
    return getInitialGraphData();
  }

  try {
    const graphData: unknown = JSON.parse(flowData);
    if (isWorkflowGraphData(graphData) && graphData.nodes.length) {
      return graphData;
    }
  } catch {
    message.warning($t('flow.designer.message.canvasParseFailed'));
  }

  return getInitialGraphData();
}

/** 创建包含开始和结束节点的初始画布。 */
function getInitialGraphData(): WorkflowGraphData {
  return {
    edges: [
      {
        id: 'edge_start_end',
        sourceNodeId: 'start',
        targetNodeId: 'end',
        type: 'polyline',
      },
    ],
    nodes: [
      {
        id: 'start',
        properties: { nodeType: 'start' },
        text: $t('flow.designer.node.startShort'),
        type: 'circle',
        x: 220,
        y: 240,
      },
      {
        id: 'end',
        properties: { nodeType: 'end' },
        text: $t('flow.designer.node.endShort'),
        type: 'circle',
        x: 620,
        y: 240,
      },
    ],
  };
}

/** 从节点面板开始拖拽一个新节点。 */
function onDragStart(node: WorkflowPaletteNode) {
  lfRef.value?.dnd.startDrag({
    properties: {
      branchMode: node.nodeType === 'condition' ? 'firstMatch' : undefined,
      nodeType: node.nodeType,
    },
    text: node.text,
    type: node.type,
  });
}

/** 合并并应用属性面板提交的节点或连线配置。 */
function onPropertyChange(values: WorkflowPropertyValues) {
  const lf = lfRef.value;
  const element = selectedElement.value;
  if (!lf || !element?.id) {
    return;
  }

  const { text, ...propertyValues } = values;
  lf.updateText(element.id, text ?? '');
  lf.setProperties(element.id, {
    ...element.properties,
    ...propertyValues,
    nodeType: element.properties?.nodeType,
  });

  if (propertyValues.isDefaultBranch === true && element.sourceNodeId) {
    clearSiblingDefaultBranches(element.id, element.sourceNodeId);
  }
  setSelectedElement(lf.getDataById(element.id));
  message.success($t('flow.designer.message.propertyApplied'));
}

/** 清除同一条件节点其它出线的默认分支标记。 */
function clearSiblingDefaultBranches(edgeId: string, sourceNodeId: string) {
  const lf = lfRef.value;
  if (!lf) {
    return;
  }
  const graphData = getWorkflowGraphData(lf);
  graphData.edges
    .filter(
      (edge) =>
        edge.id !== edgeId &&
        edge.sourceNodeId === sourceNodeId &&
        edge.properties?.isDefaultBranch === true,
    )
    .forEach((edge) => {
      lf.setProperties(edge.id, {
        ...edge.properties,
        isDefaultBranch: false,
      });
    });
}

/** 删除指定节点或连线。 */
function onRemoveElement(id: string) {
  if (!id) {
    return;
  }
  lfRef.value?.deleteElement(id);
  selectedElement.value = undefined;
}

/** 保存当前 LogicFlow 画布数据。 */
async function onSave() {
  const lf = lfRef.value;
  if (!lf) {
    return;
  }

  await saveWorkflowDefinitionCanvasApi(
    definitionId,
    JSON.stringify(lf.getGraphData()),
  );
  message.success($t('flow.designer.message.saveSuccess'));
}

/** 校验并发布当前流程定义。 */
async function onPublish() {
  if (!validateConditionBranches()) {
    return;
  }
  await onSave();
  await publishWorkflowDefinitionApi(definitionId);
  message.success($t('flow.designer.message.publishSuccess'));
  definition.value = await getWorkflowDefinitionDetailApi(definitionId);
}

/** 发布前校验条件节点的出线、默认分支和分支表达式。 */
function validateConditionBranches() {
  const lf = lfRef.value;
  if (!lf) {
    return false;
  }
  const graphData = getWorkflowGraphData(lf);
  const conditionNodes = graphData.nodes.filter(
    (node) => node.properties?.nodeType === 'condition',
  );

  for (const node of conditionNodes) {
    const nodeName =
      typeof node.text === 'string' ? node.text : node.text?.value || node.id;
    const outgoingEdges = graphData.edges.filter(
      (edge) => edge.sourceNodeId === node.id,
    );
    if (outgoingEdges.length < 2) {
      message.error(
        $t('flow.designer.message.outgoingRequired', [nodeName]),
      );
      return false;
    }
    const defaultEdges = outgoingEdges.filter(
      (edge) => edge.properties?.isDefaultBranch === true,
    );
    if (defaultEdges.length !== 1) {
      message.error($t('flow.designer.message.defaultRequired', [nodeName]));
      return false;
    }
    const invalidEdge = outgoingEdges.find(
      (edge) =>
        edge.properties?.isDefaultBranch !== true &&
        !edge.properties?.conditionExpression,
    );
    if (invalidEdge) {
      message.error($t('flow.designer.message.conditionMissing', [nodeName]));
      return false;
    }
    const conditionEdges = outgoingEdges.filter(
      (edge) => edge.properties?.isDefaultBranch !== true,
    );
    const priorities = conditionEdges.map((edge) => edge.properties?.priority);
    if (
      priorities.some(
        (priority) =>
          !Number.isInteger(priority) || Number(priority) <= 0,
      )
    ) {
      message.error($t('flow.designer.message.priorityInvalid', [nodeName]));
      return false;
    }
    if (new Set(priorities).size !== priorities.length) {
      message.error($t('flow.designer.message.priorityDuplicate', [nodeName]));
      return false;
    }
  }

  return true;
}

/** 将未知 LogicFlow 数据设置为当前选中元素。 */
function setSelectedElement(value: unknown) {
  selectedElement.value = isWorkflowElement(value) ? value : undefined;
}

/** 获取经过结构校验的 LogicFlow 画布数据。 */
function getWorkflowGraphData(lf: LogicFlowInstance): WorkflowGraphData {
  const graphData = lf.getGraphData();
  return isWorkflowGraphData(graphData) ? graphData : { edges: [], nodes: [] };
}

/** 判断未知值是否为流程画布数据。 */
function isWorkflowGraphData(value: unknown): value is WorkflowGraphData {
  if (!isRecord(value)) {
    return false;
  }
  return Array.isArray(value.edges) && Array.isArray(value.nodes);
}

/** 判断未知值是否为 LogicFlow 节点或连线数据。 */
function isWorkflowElement(value: unknown): value is WorkflowElement {
  return isRecord(value) && typeof value.id === 'string';
}

/** 判断未知值是否为可读取字段的对象。 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** 返回流程定义列表。 */
function onBack() {
  router.push('/workflow/definition/list');
}

/** 根据 LogicFlow 变换矩阵同步缩放百分比。 */
function syncZoomPercent() {
  const transform = lfRef.value?.getTransform();
  if (!transform) {
    zoomPercent.value = '100%';
    return;
  }
  zoomPercent.value = `${Math.round(transform.SCALE_X * 100)}%`;
}

/** 放大画布。 */
function onZoomIn() {
  lfRef.value?.zoom(true);
  syncZoomPercent();
}

/** 缩小画布。 */
function onZoomOut() {
  lfRef.value?.zoom(false);
  syncZoomPercent();
}

/** 将画布缩放重置为百分之百。 */
function onResetZoom() {
  lfRef.value?.resetZoom();
  syncZoomPercent();
}

/** 缩放画布以适应当前全部元素。 */
function onFitView() {
  lfRef.value?.fitView(24, 24);
  syncZoomPercent();
}
</script>

<template>
  <Page auto-content-height>
    <div class="workflow-designer" v-loading="loading">
      <header class="designer-header">
        <div class="title-block">
          <Button @click="onBack">
            <IconifyIcon class="size-4" icon="lucide:arrow-left" />
            {{ $t('flow.designer.back') }}
          </Button>
          <div>
            <div class="title">
              {{ definition?.definitionName || $t('flow.designer.title') }}
            </div>
            <div class="meta">
              {{ definition?.definitionKey }} · v{{ definition?.version ?? 0 }}
            </div>
          </div>
        </div>
        <Space>
          <Button @click="lfRef?.undo()">
            <IconifyIcon class="size-4" icon="lucide:undo-2" />
            {{ $t('flow.designer.undo') }}
          </Button>
          <Button @click="lfRef?.redo()">
            <IconifyIcon class="size-4" icon="lucide:redo-2" />
            {{ $t('flow.designer.redo') }}
          </Button>
          <div class="zoom-actions">
            <Button class="zoom-button" @click="onZoomOut">
              <IconifyIcon class="size-4" icon="lucide:zoom-out" />
            </Button>
            <Button class="zoom-percent" @click="onResetZoom">
              {{ zoomPercent }}
            </Button>
            <Button class="zoom-button" @click="onZoomIn">
              <IconifyIcon class="size-4" icon="lucide:zoom-in" />
            </Button>
          </div>
          <Button @click="onFitView">
            <IconifyIcon class="size-4" icon="lucide:scan" />
            {{ $t('flow.designer.fitView') }}
          </Button>
          <Button type="primary" @click="onSave">
            <IconifyIcon class="size-4" icon="lucide:save" />
            {{ $t('flow.designer.save') }}
          </Button>
          <Button type="primary" @click="onPublish">
            <IconifyIcon class="size-4" icon="lucide:rocket" />
            {{ $t('flow.designer.publish') }}
          </Button>
        </Space>
      </header>

      <div class="designer-body">
        <NodePanel @drag-start="onDragStart" />
        <main class="canvas-wrap">
          <div ref="containerRef" class="logicflow-canvas"></div>
        </main>
        <PropertyPanel
          :condition-edge="isConditionEdge"
          :element="selectedElement"
          @change="onPropertyChange"
          @remove="onRemoveElement"
        />
      </div>
    </div>
  </Page>
</template>

<style scoped>
.workflow-designer {
  display: flex;
  overflow: hidden;
  height: 100%;
  min-height: 680px;
  flex-direction: column;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--background));
}

.designer-header {
  display: flex;
  min-height: 58px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid hsl(var(--border));
  padding: 10px 12px;
}

.title-block {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  color: hsl(var(--foreground));
  font-size: 15px;
  font-weight: 600;
}

.meta {
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  margin-top: 2px;
}

.zoom-actions {
  display: inline-flex;
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--background));
}

.zoom-actions :deep(.ant-btn) {
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.zoom-button {
  width: 34px;
  padding-inline: 0;
}

.zoom-percent {
  min-width: 64px;
  padding-inline: 8px;
  color: hsl(var(--foreground));
  font-variant-numeric: tabular-nums;
}

.designer-body {
  display: flex;
  min-height: 0;
  flex: 1;
}

.canvas-wrap {
  min-width: 0;
  flex: 1;
  background:
    linear-gradient(90deg, rgb(15 23 42 / 4%) 1px, transparent 1px),
    linear-gradient(rgb(15 23 42 / 4%) 1px, transparent 1px);
  background-color: #f8fafc;
  background-size: 20px 20px;
}

.logicflow-canvas {
  width: 100%;
  height: 100%;
}
</style>
