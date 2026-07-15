<script lang="ts" setup>
import type { WorkflowDefinitionApi } from '#/api/workflow';

import { IconifyIcon } from '@vben/icons';

import {
  Button,
  CheckboxGroup,
  DatePicker,
  Input,
  InputNumber,
  RadioGroup,
  Select,
  Switch,
  TextArea,
} from 'antdv-next';

import { $t } from '#/locales';

defineProps<{
  compact?: boolean;
  field: WorkflowDefinitionApi.WorkflowFormField;
  first: boolean;
  last: boolean;
  selected: boolean;
}>();

const emit = defineEmits<{
  dragStart: [];
  drop: [];
  moveDown: [];
  moveUp: [];
  remove: [];
  select: [];
}>();
</script>

<template>
  <div
    class="form-field"
    :class="{ compact, selected }"
    draggable="true"
    @click.stop="emit('select')"
    @dragover.prevent
    @dragstart.stop="emit('dragStart')"
    @drop.stop="emit('drop')"
  >
    <div class="field-heading">
      <div class="field-label">
        <span v-if="field.required" class="required-mark">*</span>
        {{ field.label }}
        <span class="field-key">{{ field.key }}</span>
      </div>
      <div class="field-actions">
        <Button
          :disabled="first"
          size="small"
          type="text"
          :title="$t('flow.form.designer.moveUp')"
          @click.stop="emit('moveUp')"
        >
          <IconifyIcon class="size-4" icon="lucide:arrow-up" />
        </Button>
        <Button
          :disabled="last"
          size="small"
          type="text"
          :title="$t('flow.form.designer.moveDown')"
          @click.stop="emit('moveDown')"
        >
          <IconifyIcon class="size-4" icon="lucide:arrow-down" />
        </Button>
        <Button
          danger
          size="small"
          type="text"
          :title="$t('flow.designer.delete')"
          @click.stop="emit('remove')"
        >
          <IconifyIcon class="size-4" icon="lucide:trash-2" />
        </Button>
      </div>
    </div>
    <Input
      v-if="field.type === 'input'"
      disabled
      :placeholder="field.placeholder"
    />
    <TextArea
      v-else-if="field.type === 'textarea'"
      disabled
      :rows="3"
      :placeholder="field.placeholder"
    />
    <InputNumber
      v-else-if="field.type === 'number'"
      class="full-width-control"
      disabled
      :placeholder="field.placeholder"
    />
    <Select
      v-else-if="field.type === 'select'"
      class="full-width-control"
      disabled
      :options="field.options"
      :placeholder="field.placeholder"
    />
    <RadioGroup
      v-else-if="field.type === 'radio'"
      disabled
      :options="field.options"
    />
    <CheckboxGroup
      v-else-if="field.type === 'checkbox'"
      disabled
      :options="field.options"
    />
    <DatePicker
      v-else-if="field.type === 'date'"
      class="full-width-control"
      disabled
      :placeholder="field.placeholder"
    />
    <Switch v-else-if="field.type === 'switch'" disabled />
  </div>
</template>

<style scoped>
.form-field {
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--background));
  cursor: pointer;
  padding: 14px 16px 16px;
}

.form-field.selected {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 1px hsl(var(--primary));
}

.field-heading,
.field-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-heading {
  min-height: 28px;
  margin-bottom: 9px;
}

.form-field.compact .field-heading {
  align-items: flex-start;
  flex-direction: column;
  gap: 4px;
}

.form-field.compact .field-actions {
  width: 100%;
  justify-content: flex-end;
}

.field-label {
  min-width: 0;
  color: hsl(var(--foreground));
  font-size: 14px;
  font-weight: 500;
}

.form-field.compact .field-label {
  width: 100%;
  overflow-wrap: anywhere;
}

.field-key {
  margin-left: 8px;
  color: hsl(var(--muted-foreground));
  font-size: 11px;
  font-weight: 400;
}

.form-field.compact .field-key {
  display: block;
  margin-top: 2px;
  margin-left: 0;
}

.required-mark {
  margin-right: 3px;
  color: hsl(var(--destructive));
}

.full-width-control {
  width: 100%;
}
</style>
