<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { IconifyIcon } from '@vben/icons';

import { Button, Input, Select, TextArea } from 'antdv-next';

const props = defineProps<{
  element?: any;
}>();

const emit = defineEmits<{
  change: [values: Record<string, any>];
  remove: [id: string];
}>();

const formState = reactive({
  assigneeType: 'user',
  conditionExpression: '',
  copyType: 'user',
  text: '',
});

const nodeType = computed(() => props.element?.properties?.nodeType ?? '');
const elementId = computed(() => props.element?.id ?? '');
const isEdge = computed(() => props.element?.sourceNodeId && props.element?.targetNodeId);

watch(
  () => props.element,
  (element) => {
    formState.text = normalizeText(element?.text);
    formState.assigneeType = element?.properties?.assigneeType ?? 'user';
    formState.conditionExpression =
      element?.properties?.conditionExpression ?? '';
    formState.copyType = element?.properties?.copyType ?? 'user';
  },
  { immediate: true },
);

function normalizeText(text: any) {
  if (typeof text === 'string') {
    return text;
  }
  return text?.value ?? '';
}

function submit() {
  emit('change', {
    assigneeType: formState.assigneeType,
    conditionExpression: formState.conditionExpression,
    copyType: formState.copyType,
    text: formState.text,
  });
}
</script>

<template>
  <aside class="workflow-property-panel">
    <div class="panel-title">属性</div>

    <div v-if="!element" class="empty-state">
      <IconifyIcon class="size-8" icon="lucide:mouse-pointer-click" />
      <span>请选择节点或连线</span>
    </div>

    <div v-else class="property-form">
      <label class="field">
        <span>ID</span>
        <Input :value="elementId" disabled />
      </label>

      <label class="field">
        <span>名称</span>
        <Input v-model:value="formState.text" />
      </label>

      <label v-if="nodeType === 'approve'" class="field">
        <span>审批人类型</span>
        <Select
          v-model:value="formState.assigneeType"
          :options="[
            { label: '指定用户', value: 'user' },
            { label: '发起人主管', value: 'leader' },
            { label: '角色', value: 'role' },
          ]"
        />
      </label>

      <label v-if="nodeType === 'condition' || isEdge" class="field">
        <span>条件表达式</span>
        <TextArea
          v-model:value="formState.conditionExpression"
          :rows="4"
          placeholder="如 amount > 1000"
        />
      </label>

      <label v-if="nodeType === 'copy'" class="field">
        <span>抄送类型</span>
        <Select
          v-model:value="formState.copyType"
          :options="[
            { label: '指定用户', value: 'user' },
            { label: '角色', value: 'role' },
          ]"
        />
      </label>

      <div class="actions">
        <Button type="primary" @click="submit">应用</Button>
        <Button danger @click="emit('remove', elementId)">删除</Button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.workflow-property-panel {
  width: 280px;
  flex: none;
  border-left: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  padding: 12px;
}

.panel-title {
  margin-bottom: 10px;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
  font-weight: 600;
}

.empty-state {
  display: flex;
  min-height: 180px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
}

.property-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 4px;
}
</style>
