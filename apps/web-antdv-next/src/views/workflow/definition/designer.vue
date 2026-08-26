<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import LogicFlow from '@logicflow/core';
import { Menu, SelectionSelect } from '@logicflow/extension';
import '@logicflow/core/es/index.css';
import '@logicflow/extension/es/index.css';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Button, message, Select, Space } from 'antdv-next';

import type { FormSchemaApi } from '#/api/form';
import { getAllFormSchemasApi } from '#/api/form';
import {
  getBusinessHooksApi,
  getWorkflowDefinitionDetailApi,
  publishWorkflowDefinitionApi,
  saveWorkflowDefinitionCanvasApi,
  saveWorkflowDefinitionFormApi,
} from '#/api/workflow';
import type {
  BusinessHookRegistryItem,
  WorkflowDefinitionApi,
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

interface PropertyPanelExpose {
  submit: () => void;
}

const route = useRoute();
const router = useRouter();
const containerRef = ref<HTMLDivElement>();
const lfRef = ref<LogicFlowInstance>();
const propertyPanelRef = ref<PropertyPanelExpose>();
const selectedElement = ref<WorkflowElement>();
const definition = ref<WorkflowDefinitionApi.WorkflowDefinition>();
const loading = ref(false);
const zoomPercent = ref('100%');
const formSchemas = ref<FormSchemaApi.FormSchemaRecord[]>([]);
const businessHookRegistry = ref<BusinessHookRegistryItem[]>([]);
const selectedFormSchemaId = ref<string>();
const selectedFormSchema = computed(() =>
  formSchemas.value.find(
    (item) => item.formSchemaId === selectedFormSchemaId.value,
  ),
);
const formFields = computed(() => selectedFormSchema.value?.schema ?? []);
const formSchemaOptions = computed(() =>
  formSchemas.value.map((item) => ({
    label: item.schemaName,
    value: item.formSchemaId,
  })),
);

const [PropertyDrawer, propertyDrawerApi] = useVbenDrawer({
  confirmText: $t('flow.designer.apply'),
  onConfirm() {
    propertyPanelRef.value?.submit();
  },
  title: $t('flow.designer.property'),
});

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
    const [definitionRecord, schemaRecords, hookRegistry] = await Promise.all([
      getWorkflowDefinitionDetailApi(definitionId),
      getAllFormSchemasApi({ status: '1' }),
      getBusinessHooksApi(),
    ]);
    definition.value = definitionRecord;
    formSchemas.value = schemaRecords;
    businessHookRegistry.value = hookRegistry.items;
    selectedFormSchemaId.value = definitionRecord.formSchemaId ?? undefined;
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
    setSelectedElement(undefined);
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
    if (isWorkflowGraphData(graphData) && graphData.nodes.length > 0) {
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
        text: {
          value: $t('flow.designer.node.startShort'),
          x: 220,
          y: 240,
        },
        type: 'circle',
        x: 220,
        y: 240,
      },
      {
        id: 'end',
        properties: { nodeType: 'end' },
        text: {
          value: $t('flow.designer.node.endShort'),
          x: 620,
          y: 240,
        },
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
  const updatedElement = lf.getDataById(element.id);
  selectedElement.value = isWorkflowElement(updatedElement)
    ? updatedElement
    : undefined;
  message.success($t('flow.designer.message.propertyApplied'));
  propertyDrawerApi.close();
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
  propertyDrawerApi.close();
}

/** 保存流程绑定的表单 Schema 和当前画布。 */
async function onSave() {
  if (!(await saveFormSchemaBinding())) return;
  await saveFlowData();
}

/** 保存当前 LogicFlow 画布数据。 */
async function saveFlowData() {
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

/** 保存流程定义与独立表单 Schema 的绑定关系。
 *  表单 Schema 为可选绑定:未选时跳过绑定不阻塞画布保存,让流程画布与外部业务表单解耦;
 *  选了 Schema 但 Schema 无字段时仍报错,防止绑定空表单。 */
async function saveFormSchemaBinding() {
  if (!selectedFormSchemaId.value) {
    return true;
  }
  if (formFields.value.length === 0) {
    message.error($t('flow.designer.message.formSchemaRequired'));
    return false;
  }
  await saveWorkflowDefinitionFormApi(definitionId, selectedFormSchemaId.value);
  return true;
}

/** 校验并发布当前流程定义。 */
async function onPublish() {
  if (!validateConditionBranches() || !(await saveFormSchemaBinding())) {
    return;
  }
  await saveFlowData();
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
    const nodeName = node.text?.value || node.id;
    const outgoingEdges = graphData.edges.filter(
      (edge) => edge.sourceNodeId === node.id,
    );
    if (outgoingEdges.length < 2) {
      message.error($t('flow.designer.message.outgoingRequired', [nodeName]));
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
        (!edge.properties?.conditionRules?.length ||
          !['and', 'or'].includes(edge.properties.conditionLogic ?? '')),
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
        (priority) => !Number.isInteger(priority) || Number(priority) <= 0,
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
  const element = isWorkflowElement(value) ? value : undefined;
  selectedElement.value = element;
  if (element) {
    propertyDrawerApi.open();
    return;
  }
  propertyDrawerApi.close();
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
  return (
    Array.isArray(value.edges) &&
    value.edges.every(isWorkflowElement) &&
    Array.isArray(value.nodes) &&
    value.nodes.every(isWorkflowElement)
  );
}

/** 判断未知值是否为 LogicFlow 节点或连线数据。 */
function isWorkflowElement(value: unknown): value is WorkflowElement {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    (value.text === undefined || isWorkflowElementText(value.text))
  );
}

/** 判断未知值是否为当前 LogicFlow 文本对象。 */
function isWorkflowElementText(value: unknown) {
  return (
    isRecord(value) &&
    typeof value.value === 'string' &&
    typeof value.x === 'number' &&
    typeof value.y === 'number'
  );
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
          <div class="form-schema-binding">
            <span>{{ $t('flow.designer.formSchema') }}</span>
            <Select
              v-model:value="selectedFormSchemaId"
              class="form-schema-select"
              :options="formSchemaOptions"
              :placeholder="$t('flow.designer.selectFormSchema')"
              option-filter-prop="label"
              show-search
            />
          </div>
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
      </div>

      <PropertyDrawer class="w-[440px]">
        <PropertyPanel
          ref="propertyPanelRef"
          :business-hook-registry="businessHookRegistry"
          :business-type="definition?.businessType"
          :condition-edge="isConditionEdge"
          :element="selectedElement"
          :form-fields="formFields"
          @change="onPropertyChange"
        />
        <template #prepend-footer>
          <div class="mr-auto">
            <Button
              v-if="selectedElement"
              danger
              @click="onRemoveElement(selectedElement.id)"
            >
              <IconifyIcon class="size-4" icon="lucide:trash-2" />
              {{ $t('flow.designer.delete') }}
            </Button>
          </div>
        </template>
      </PropertyDrawer>
    </div>
  </Page>
</template>

<style scoped>
.workflow-designer {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 680px;
  overflow: hidden;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.designer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 58px;
  padding: 10px 12px;
  border-bottom: 1px solid hsl(var(--border));
}

.title-block {
  display: flex;
  gap: 12px;
  align-items: center;
}

.title {
  font-size: 15px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.meta {
  margin-top: 2px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.zoom-actions {
  display: inline-flex;
  overflow: hidden;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
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
  font-variant-numeric: tabular-nums;
  color: hsl(var(--foreground));
}

.form-schema-binding {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.form-schema-select {
  width: 220px;
}

.designer-body {
  display: flex;
  flex: 1;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.canvas-wrap {
  flex: 1;
  min-width: 0;
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
