<script lang="ts" setup>
import type { WorkflowDefinitionApi } from '#/api/workflow';

import { computed, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';

import {
  Button,
  CheckboxGroup,
  DatePicker,
  Empty,
  Input,
  InputNumber,
  RadioGroup,
  Select,
  Switch,
  TextArea,
} from 'antdv-next';

import { $t } from '#/locales';

interface FieldPaletteItem {
  icon: string;
  type: WorkflowDefinitionApi.WorkflowFormFieldType;
}

const props = defineProps<{
  modelValue: WorkflowDefinitionApi.WorkflowFormSchema;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: WorkflowDefinitionApi.WorkflowFormSchema];
}>();

const selectedFieldId = ref<string>();
const draggedFieldId = ref<string>();

const palette: FieldPaletteItem[] = [
  { icon: 'lucide:type', type: 'input' },
  { icon: 'lucide:align-left', type: 'textarea' },
  { icon: 'lucide:hash', type: 'number' },
  { icon: 'lucide:list-filter', type: 'select' },
  { icon: 'lucide:circle-dot', type: 'radio' },
  { icon: 'lucide:list-checks', type: 'checkbox' },
  { icon: 'lucide:calendar-days', type: 'date' },
  { icon: 'lucide:toggle-left', type: 'switch' },
];

const selectedField = computed(() =>
  props.modelValue.fields.find((field) => field.id === selectedFieldId.value),
);

const selectedFieldIndex = computed(() =>
  props.modelValue.fields.findIndex(
    (field) => field.id === selectedFieldId.value,
  ),
);

const hasOptions = computed(() =>
  ['checkbox', 'radio', 'select'].includes(selectedField.value?.type ?? ''),
);

/** 返回指定字段类型的国际化名称。 */
function fieldTypeLabel(type: WorkflowDefinitionApi.WorkflowFormFieldType) {
  return $t(`flow.form.fieldType.${type}`);
}

/** 生成当前表单内唯一的字段标识。 */
function nextFieldKey(type: WorkflowDefinitionApi.WorkflowFormFieldType) {
  const keys = new Set(props.modelValue.fields.map((field) => field.key));
  let index = props.modelValue.fields.length + 1;
  let key = `${type}${index}`;
  while (keys.has(key)) {
    index += 1;
    key = `${type}${index}`;
  }
  return key;
}

/** 生成不依赖后端的表单字段ID。 */
function createFieldId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `field_${Date.now()}_${Math.random().toString(16).slice(2)}`
  );
}

/** 向表单末尾新增一个指定类型的字段并立即选中。 */
function addField(type: WorkflowDefinitionApi.WorkflowFormFieldType) {
  const id = createFieldId();
  const field: WorkflowDefinitionApi.WorkflowFormField = {
    id,
    key: nextFieldKey(type),
    label: fieldTypeLabel(type),
    required: false,
    type,
  };
  if (['checkbox', 'radio', 'select'].includes(type)) {
    field.options = [
      { label: $t('flow.form.designer.optionDefault'), value: 'option1' },
    ];
  }
  emitSchema([...props.modelValue.fields, field]);
  selectedFieldId.value = id;
}

/** 删除当前字段并选择相邻字段。 */
function removeField(id: string) {
  const index = props.modelValue.fields.findIndex((field) => field.id === id);
  const fields = props.modelValue.fields.filter((field) => field.id !== id);
  emitSchema(fields);
  selectedFieldId.value = fields[Math.min(index, fields.length - 1)]?.id;
}

/** 将当前字段向上或向下移动一个位置。 */
function moveField(id: string, offset: number) {
  const fields = [...props.modelValue.fields];
  const from = fields.findIndex((field) => field.id === id);
  const to = from + offset;
  if (from < 0 || to < 0 || to >= fields.length) return;
  const [field] = fields.splice(from, 1);
  if (!field) return;
  fields.splice(to, 0, field);
  emitSchema(fields);
}

/** 记录当前开始拖拽的表单字段。 */
function onDragStart(id: string) {
  draggedFieldId.value = id;
}

/** 将拖拽字段移动到目标字段所在位置。 */
function onDrop(targetId: string) {
  const sourceId = draggedFieldId.value;
  draggedFieldId.value = undefined;
  if (!sourceId || sourceId === targetId) return;
  const fields = [...props.modelValue.fields];
  const from = fields.findIndex((field) => field.id === sourceId);
  const to = fields.findIndex((field) => field.id === targetId);
  const [field] = fields.splice(from, 1);
  if (!field || to < 0) return;
  fields.splice(to, 0, field);
  emitSchema(fields);
}

/** 更新当前选中字段的一个属性。 */
function updateSelectedField(
  values: Partial<WorkflowDefinitionApi.WorkflowFormField>,
) {
  const index = selectedFieldIndex.value;
  if (index < 0) return;
  const fields = props.modelValue.fields.map((field, fieldIndex) =>
    fieldIndex === index ? { ...field, ...values } : field,
  );
  emitSchema(fields);
}

/** 切换字段类型并按新类型重置选项和默认值。 */
function updateFieldType(type: WorkflowDefinitionApi.WorkflowFormFieldType) {
  updateSelectedField({
    defaultValue:
      type === 'checkbox' ? [] : type === 'switch' ? false : undefined,
    options: ['checkbox', 'radio', 'select'].includes(type)
      ? selectedField.value?.options?.length
        ? selectedField.value.options
        : [{ label: $t('flow.form.designer.optionDefault'), value: 'option1' }]
      : undefined,
    type,
  });
}

/** 校验下拉组件输出后切换当前字段类型。 */
function onFieldTypeChange(value: unknown) {
  if (
    typeof value === 'string' &&
    palette.some((item) => item.type === value)
  ) {
    updateFieldType(value as WorkflowDefinitionApi.WorkflowFormFieldType);
  }
}

/** 将开关组件输出规范为布尔值后更新字段必填状态。 */
function updateRequired(value: unknown) {
  updateSelectedField({ required: Boolean(value) });
}

/** 在选中字段末尾新增一个可配置选项。 */
function addOption() {
  const options = [...(selectedField.value?.options ?? [])];
  const index = options.length + 1;
  options.push({
    label: $t('flow.form.designer.optionNumber', [index]),
    value: `option${index}`,
  });
  updateSelectedField({ options });
}

/** 更新选择类字段的指定选项。 */
function updateOption(
  index: number,
  values: Partial<WorkflowDefinitionApi.WorkflowFormOption>,
) {
  const options = (selectedField.value?.options ?? []).map(
    (option, itemIndex) =>
      itemIndex === index ? { ...option, ...values } : option,
  );
  updateSelectedField({ options });
}

/** 删除选择类字段的指定选项。 */
function removeOption(index: number) {
  const options = (selectedField.value?.options ?? []).filter(
    (_, itemIndex) => itemIndex !== index,
  );
  updateSelectedField({ options });
}

/** 将未知默认值转换为文本组件可用的字符串。 */
function defaultStringValue(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

/** 将未知默认值转换为多选组件可用的字符串数组。 */
function defaultArrayValue(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

/** 向父组件提交一份新的不可变表单结构。 */
function emitSchema(fields: WorkflowDefinitionApi.WorkflowFormField[]) {
  emit('update:modelValue', { fields, version: 1 });
}
</script>

<template>
  <div class="form-designer">
    <aside class="field-palette">
      <div class="panel-title">{{ $t('flow.form.designer.components') }}</div>
      <div class="palette-grid">
        <button
          v-for="item in palette"
          :key="item.type"
          class="palette-item"
          type="button"
          @click="addField(item.type)"
        >
          <IconifyIcon class="size-5" :icon="item.icon" />
          <span>{{ fieldTypeLabel(item.type) }}</span>
        </button>
      </div>
    </aside>

    <main class="form-canvas">
      <div class="canvas-title">{{ $t('flow.form.designer.preview') }}</div>
      <Empty
        v-if="modelValue.fields.length === 0"
        :description="$t('flow.form.designer.empty')"
      />
      <div v-else class="field-list">
        <div
          v-for="(field, index) in modelValue.fields"
          :key="field.id"
          class="form-field"
          :class="{ selected: field.id === selectedFieldId }"
          draggable="true"
          @click="selectedFieldId = field.id"
          @dragover.prevent
          @dragstart="onDragStart(field.id)"
          @drop="onDrop(field.id)"
        >
          <div class="field-heading">
            <div class="field-label">
              <span v-if="field.required" class="required-mark">*</span>
              {{ field.label }}
              <span class="field-key">{{ field.key }}</span>
            </div>
            <div class="field-actions">
              <Button
                :disabled="index === 0"
                size="small"
                type="text"
                :title="$t('flow.form.designer.moveUp')"
                @click.stop="moveField(field.id, -1)"
              >
                <IconifyIcon class="size-4" icon="lucide:arrow-up" />
              </Button>
              <Button
                :disabled="index === modelValue.fields.length - 1"
                size="small"
                type="text"
                :title="$t('flow.form.designer.moveDown')"
                @click.stop="moveField(field.id, 1)"
              >
                <IconifyIcon class="size-4" icon="lucide:arrow-down" />
              </Button>
              <Button
                danger
                size="small"
                type="text"
                :title="$t('flow.designer.delete')"
                @click.stop="removeField(field.id)"
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
            class="w-full"
            disabled
            :placeholder="field.placeholder"
          />
          <Select
            v-else-if="field.type === 'select'"
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
            class="w-full"
            disabled
            :placeholder="field.placeholder"
          />
          <Switch v-else-if="field.type === 'switch'" disabled />
        </div>
      </div>
    </main>

    <aside class="field-properties">
      <div class="panel-title">{{ $t('flow.form.designer.properties') }}</div>
      <Empty
        v-if="!selectedField"
        :description="$t('flow.form.designer.selectField')"
      />
      <div v-else class="property-list">
        <label class="property-field">
          <span>{{ $t('flow.form.designer.fieldType') }}</span>
          <Select
            :options="
              palette.map((item) => ({
                label: fieldTypeLabel(item.type),
                value: item.type,
              }))
            "
            :value="selectedField.type"
            @update:value="onFieldTypeChange"
          />
        </label>
        <label class="property-field">
          <span>{{ $t('flow.form.designer.fieldLabel') }}</span>
          <Input
            :maxlength="128"
            :value="selectedField.label"
            @update:value="updateSelectedField({ label: $event })"
          />
        </label>
        <label class="property-field">
          <span>{{ $t('flow.form.designer.fieldKey') }}</span>
          <Input
            :maxlength="64"
            :value="selectedField.key"
            @update:value="updateSelectedField({ key: $event })"
          />
          <small>{{ $t('flow.form.designer.fieldKeyHint') }}</small>
        </label>
        <label v-if="selectedField.type !== 'switch'" class="property-field">
          <span>{{ $t('flow.form.designer.placeholder') }}</span>
          <Input
            :maxlength="128"
            :value="selectedField.placeholder"
            @update:value="updateSelectedField({ placeholder: $event })"
          />
        </label>
        <div class="switch-property">
          <span>{{ $t('flow.form.designer.required') }}</span>
          <Switch
            :checked="selectedField.required"
            @update:checked="updateRequired"
          />
        </div>

        <label class="property-field">
          <span>{{ $t('flow.form.designer.defaultValue') }}</span>
          <Switch
            v-if="selectedField.type === 'switch'"
            :checked="Boolean(selectedField.defaultValue)"
            @update:checked="updateSelectedField({ defaultValue: $event })"
          />
          <Select
            v-else-if="selectedField.type === 'checkbox'"
            allow-clear
            mode="multiple"
            :options="selectedField.options"
            :value="defaultArrayValue(selectedField.defaultValue)"
            @update:value="updateSelectedField({ defaultValue: $event })"
          />
          <Select
            v-else-if="['radio', 'select'].includes(selectedField.type)"
            allow-clear
            :options="selectedField.options"
            :value="defaultStringValue(selectedField.defaultValue)"
            @update:value="updateSelectedField({ defaultValue: $event })"
          />
          <InputNumber
            v-else-if="selectedField.type === 'number'"
            class="w-full"
            :value="selectedField.defaultValue as number"
            @update:value="updateSelectedField({ defaultValue: $event })"
          />
          <Input
            v-else
            allow-clear
            :placeholder="
              selectedField.type === 'date'
                ? $t('flow.form.designer.dateDefaultHint')
                : undefined
            "
            :value="defaultStringValue(selectedField.defaultValue)"
            @update:value="updateSelectedField({ defaultValue: $event })"
          />
        </label>

        <div v-if="hasOptions" class="options-section">
          <div class="options-heading">
            <span>{{ $t('flow.form.designer.options') }}</span>
            <Button size="small" @click="addOption">
              <IconifyIcon class="size-4" icon="lucide:plus" />
              {{ $t('flow.designer.add') }}
            </Button>
          </div>
          <div
            v-for="(option, index) in selectedField.options"
            :key="index"
            class="option-row"
          >
            <Input
              :placeholder="$t('flow.form.designer.optionLabel')"
              :value="option.label"
              @update:value="updateOption(index, { label: $event })"
            />
            <Input
              :placeholder="$t('flow.form.designer.optionValue')"
              :value="option.value"
              @update:value="updateOption(index, { value: $event })"
            />
            <Button danger type="text" @click="removeOption(index)">
              <IconifyIcon class="size-4" icon="lucide:trash-2" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.form-designer {
  display: grid;
  overflow: hidden;
  height: 100%;
  min-height: 0;
  grid-template-columns: 220px minmax(360px, 1fr) 300px;
}

.field-palette,
.field-properties {
  overflow-y: auto;
  min-height: 0;
  background: hsl(var(--background));
}

.field-palette {
  border-right: 1px solid hsl(var(--border));
  padding: 16px;
}

.field-properties {
  border-left: 1px solid hsl(var(--border));
  padding: 16px;
}

.panel-title,
.canvas-title {
  margin-bottom: 14px;
  color: hsl(var(--foreground));
  font-size: 14px;
  font-weight: 600;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.palette-item {
  display: flex;
  min-height: 72px;
  align-items: center;
  justify-content: center;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  cursor: pointer;
  flex-direction: column;
  gap: 7px;
  font-size: 12px;
}

.palette-item:hover {
  border-color: hsl(var(--primary));
  color: hsl(var(--primary));
}

.form-canvas {
  overflow-y: auto;
  min-height: 0;
  background: hsl(var(--muted) / 0.45);
  padding: 18px 24px 32px;
}

.field-list {
  display: flex;
  max-width: 760px;
  margin: 0 auto;
  flex-direction: column;
  gap: 10px;
}

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
.field-actions,
.options-heading,
.switch-property {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-heading {
  min-height: 28px;
  margin-bottom: 9px;
}

.field-label {
  min-width: 0;
  color: hsl(var(--foreground));
  font-size: 14px;
  font-weight: 500;
}

.field-key {
  margin-left: 8px;
  color: hsl(var(--muted-foreground));
  font-size: 11px;
  font-weight: 400;
}

.required-mark {
  margin-right: 3px;
  color: hsl(var(--destructive));
}

.property-list,
.property-field,
.options-section {
  display: flex;
  flex-direction: column;
}

.property-list {
  gap: 16px;
}

.property-field {
  gap: 7px;
  color: hsl(var(--foreground));
  font-size: 13px;
}

.property-field small {
  color: hsl(var(--muted-foreground));
  line-height: 1.5;
}

.switch-property {
  min-height: 32px;
  color: hsl(var(--foreground));
  font-size: 13px;
}

.options-section {
  gap: 10px;
  border-top: 1px solid hsl(var(--border));
  padding-top: 14px;
}

.option-row {
  display: grid;
  align-items: center;
  gap: 6px;
  grid-template-columns: 1fr 1fr 32px;
}

@media (max-width: 1100px) {
  .form-designer {
    grid-template-columns: 180px minmax(320px, 1fr) 260px;
  }
}
</style>
