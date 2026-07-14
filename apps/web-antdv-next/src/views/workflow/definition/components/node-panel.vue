<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';

import { $t } from '#/locales';

import type { WorkflowPaletteNode } from '../types';

const emit = defineEmits<{
  dragStart: [node: WorkflowPaletteNode];
}>();

const nodes: WorkflowPaletteNode[] = [
  {
    icon: 'lucide:circle-play',
    nodeType: 'start',
    text: $t('flow.designer.node.start'),
    type: 'circle',
  },
  {
    icon: 'lucide:user-check',
    nodeType: 'approve',
    text: $t('flow.designer.node.approve'),
    type: 'rect',
  },
  {
    icon: 'lucide:git-branch',
    nodeType: 'condition',
    text: $t('flow.designer.node.condition'),
    type: 'diamond',
  },
  {
    icon: 'lucide:send',
    nodeType: 'copy',
    text: $t('flow.designer.node.copy'),
    type: 'rect',
  },
  {
    icon: 'lucide:circle-stop',
    nodeType: 'end',
    text: $t('flow.designer.node.end'),
    type: 'circle',
  },
];
</script>

<template>
  <aside class="workflow-node-panel">
    <div class="panel-title">{{ $t('flow.designer.nodePanel') }}</div>
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
