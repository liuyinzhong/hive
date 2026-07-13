<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
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

import NodePanel from './components/node-panel.vue';
import PropertyPanel from './components/property-panel.vue';

defineOptions({
  name: 'WorkflowDefinitionDesigner',
});

type LogicFlowInstance = InstanceType<typeof LogicFlow>;

const route = useRoute();
const router = useRouter();
const containerRef = ref<HTMLDivElement>();
const lfRef = ref<LogicFlowInstance>();
const selectedElement = ref<any>();
const definition = ref<WorkflowDefinitionApi.WorkflowDefinition>();
const loading = ref(false);

const definitionId = String(route.params.definitionId ?? '');

onMounted(async () => {
  await initDesigner();
});

onBeforeUnmount(() => {
  lfRef.value?.destroy();
});

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

  lf.on('node:click', ({ data }: any) => {
    selectedElement.value = data;
  });
  lf.on('edge:click', ({ data }: any) => {
    selectedElement.value = data;
  });
  lf.on('blank:click', () => {
    selectedElement.value = undefined;
  });
  lf.on('selection:selected', ({ data }: any) => {
    selectedElement.value = data?.[0];
  });

  lf.render(resolveGraphData(definition.value?.flowData));
  lf.fitView(24, 24);
  lfRef.value = lf;
}

function resolveGraphData(flowData?: string) {
  if (!flowData) {
    return getInitialGraphData();
  }

  try {
    const graphData = JSON.parse(flowData);
    if (graphData?.nodes?.length) {
      return graphData;
    }
  } catch {
    message.warning('流程画布数据解析失败，已载入默认画布');
  }

  return getInitialGraphData();
}

function getInitialGraphData() {
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
        text: '开始',
        type: 'circle',
        x: 220,
        y: 240,
      },
      {
        id: 'end',
        properties: { nodeType: 'end' },
        text: '结束',
        type: 'circle',
        x: 620,
        y: 240,
      },
    ],
  };
}

function onDragStart(node: any) {
  lfRef.value?.dnd.startDrag({
    properties: {
      nodeType: node.nodeType,
    },
    text: node.text,
    type: node.type,
  });
}

function onPropertyChange(values: Record<string, any>) {
  const lf = lfRef.value;
  const element = selectedElement.value;
  if (!lf || !element?.id) {
    return;
  }

  lf.updateText(element.id, values.text ?? '');
  lf.setProperties(element.id, {
    assigneeType: values.assigneeType,
    conditionExpression: values.conditionExpression,
    copyType: values.copyType,
    nodeType: element.properties?.nodeType,
  });
  selectedElement.value = lf.getDataById(element.id);
  message.success('属性已应用');
}

function onRemoveElement(id: string) {
  if (!id) {
    return;
  }
  lfRef.value?.deleteElement(id);
  selectedElement.value = undefined;
}

async function onSave() {
  const lf = lfRef.value;
  if (!lf) {
    return;
  }

  await saveWorkflowDefinitionCanvasApi(
    definitionId,
    JSON.stringify(lf.getGraphData()),
  );
  message.success('保存成功');
}

async function onPublish() {
  await onSave();
  await publishWorkflowDefinitionApi(definitionId);
  message.success('发布成功');
  definition.value = await getWorkflowDefinitionDetailApi(definitionId);
}

function onBack() {
  router.push('/workflow/definition/list');
}
</script>

<template>
  <Page auto-content-height>
    <div class="workflow-designer" v-loading="loading">
      <header class="designer-header">
        <div class="title-block">
          <Button @click="onBack">
            <IconifyIcon class="size-4" icon="lucide:arrow-left" />
            返回
          </Button>
          <div>
            <div class="title">{{ definition?.definitionName || '流程设计器' }}</div>
            <div class="meta">
              {{ definition?.definitionKey }} · v{{ definition?.version ?? 0 }}
            </div>
          </div>
        </div>
        <Space>
          <Button @click="lfRef?.undo()">
            <IconifyIcon class="size-4" icon="lucide:undo-2" />
            撤销
          </Button>
          <Button @click="lfRef?.redo()">
            <IconifyIcon class="size-4" icon="lucide:redo-2" />
            重做
          </Button>
          <Button @click="lfRef?.fitView(24, 24)">
            <IconifyIcon class="size-4" icon="lucide:scan" />
            适应
          </Button>
          <Button type="primary" @click="onSave">
            <IconifyIcon class="size-4" icon="lucide:save" />
            保存
          </Button>
          <Button type="primary" @click="onPublish">
            <IconifyIcon class="size-4" icon="lucide:rocket" />
            发布
          </Button>
        </Space>
      </header>

      <div class="designer-body">
        <NodePanel @drag-start="onDragStart" />
        <main class="canvas-wrap">
          <div ref="containerRef" class="logicflow-canvas"></div>
        </main>
        <PropertyPanel
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
