<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';

interface NodeItem {
  icon: string;
  nodeType: string;
  text: string;
  type: string;
}

const emit = defineEmits<{
  dragStart: [node: NodeItem];
}>();

const nodes: NodeItem[] = [
  {
    icon: 'lucide:circle-play',
    nodeType: 'start',
    text: '开始节点',
    type: 'circle',
  },
  {
    icon: 'lucide:user-check',
    nodeType: 'approve',
    text: '审批节点',
    type: 'rect',
  },
  {
    icon: 'lucide:git-branch',
    nodeType: 'condition',
    text: '条件节点',
    type: 'diamond',
  },
  {
    icon: 'lucide:send',
    nodeType: 'copy',
    text: '抄送节点',
    type: 'rect',
  },
  {
    icon: 'lucide:circle-stop',
    nodeType: 'end',
    text: '结束节点',
    type: 'circle',
  },
];
</script>

<template>
  <aside class="workflow-node-panel">
    <div class="panel-title">节点</div>
    <button
      v-for="node in nodes"
      :key="node.nodeType"
      class="node-item"
      type="button"
      @mousedown="emit('dragStart', node)"
    >
      <IconifyIcon class="size-4" :icon="node.icon" />
      <span>{{ node.text }}</span>
    </button>
  </aside>
</template>

<style scoped>
.workflow-node-panel {
  width: 168px;
  flex: none;
  border-right: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  padding: 12px;
}

.panel-title {
  margin-bottom: 10px;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
  font-weight: 600;
}

.node-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--card));
  color: hsl(var(--foreground));
  cursor: grab;
  font-size: 13px;
  line-height: 1;
  margin-bottom: 8px;
  padding: 10px;
  text-align: left;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.node-item:hover {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 2px hsl(var(--primary) / 12%);
}
</style>
