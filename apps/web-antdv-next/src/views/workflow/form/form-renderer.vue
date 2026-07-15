<script lang="ts" setup>
import type { WorkflowDefinitionApi } from '#/api/workflow';

import { computed, reactive, ref, watch } from 'vue';

import {
  CheckboxGroup,
  Col,
  DatePicker,
  Form,
  FormItem,
  Input,
  InputNumber,
  RadioGroup,
  Row,
  Select,
  Switch,
  TextArea,
} from 'antdv-next';
import dayjs from 'dayjs';

import { $t } from '#/locales';

import { isWorkflowFormGrid } from './schema';

interface FormApi {
  validate: () => Promise<void>;
}

interface FormRenderRow {
  columns: WorkflowDefinitionApi.WorkflowFormGridColumn[];
  id: string;
}

const props = defineProps<{
  fieldPermissions?: Record<
    string,
    WorkflowDefinitionApi.WorkflowFormFieldPermission
  >;
  modelValue?: Record<string, unknown>;
  readonly?: boolean;
  schema: WorkflowDefinitionApi.WorkflowFormSchema;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>];
}>();

const formRef = ref<FormApi>();
const formValues = reactive<Record<string, unknown>>({});
const renderRows = computed(() => createRenderRows(props.readonly ? 12 : 24));

watch(
  () => props.modelValue,
  (value) => {
    Object.keys(formValues).forEach((key) => delete formValues[key]);
    Object.assign(formValues, value ?? {});
  },
  { deep: true, immediate: true },
);

/** 更新一个表单字段并向父组件同步完整申请数据。 */
function updateValue(key: string, value: unknown) {
  formValues[key] = value;
  emit('update:modelValue', { ...formValues });
}

/** 将未知值转换为组件可用的字符串。 */
function stringValue(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

/** 将未知值转换为组件可用的字符串数组。 */
function stringArrayValue(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

/** 将日期字符串转换为日期组件需要的 Dayjs 对象。 */
function dateValue(value: unknown) {
  return typeof value === 'string' && value ? dayjs(value) : undefined;
}

/** 处理日期组件输出并统一保存为 YYYY-MM-DD 字符串。 */
function updateDateValue(key: string, value: string | string[]) {
  updateValue(key, Array.isArray(value) ? value[0] : value);
}

/** 将表单字段值格式化为详情页可读文本。 */
function displayValue(field: WorkflowDefinitionApi.WorkflowFormField) {
  const value = formValues[field.key];
  if (value === null || value === undefined || value === '') return '-';
  if (field.type === 'switch') {
    return value ? $t('flow.form.common.yes') : $t('flow.form.common.no');
  }
  if (field.type === 'checkbox') {
    return stringArrayValue(value)
      .map((item) => optionLabel(field, item))
      .join($t('flow.form.common.separator'));
  }
  if (field.type === 'radio' || field.type === 'select') {
    return optionLabel(field, String(value));
  }
  return String(value);
}

/** 根据选项值返回用户可读的选项名称。 */
function optionLabel(
  field: WorkflowDefinitionApi.WorkflowFormField,
  value: string,
) {
  return field.options?.find((item) => item.value === value)?.label ?? value;
}

/** 返回字段在当前渲染场景中的权限。 */
function fieldPermission(field: WorkflowDefinitionApi.WorkflowFormField) {
  if (props.readonly) return 'readonly';
  if (!props.fieldPermissions) return 'editable';
  return props.fieldPermissions[field.key] ?? 'readonly';
}

function isFieldVisible(field: WorkflowDefinitionApi.WorkflowFormField) {
  return fieldPermission(field) !== 'hidden';
}

/** 将顶层字段和栅格容器转换为统一渲染行。 */
function createRenderRows(defaultSpan: number) {
  const rows: FormRenderRow[] = [];
  let fieldRow: FormRenderRow | undefined;
  for (const element of props.schema.fields) {
    if (isWorkflowFormGrid(element)) {
      fieldRow = undefined;
      const columns = element.columns
        .map((column) => ({
          ...column,
          fields: column.fields.filter(isFieldVisible),
        }))
        .filter((column) => column.fields.length > 0);
      if (columns.length > 0) rows.push({ columns, id: element.id });
      continue;
    }
    if (!isFieldVisible(element)) continue;
    const usedSpan = fieldRow?.columns.reduce(
      (total, column) => total + column.span,
      0,
    );
    if (!fieldRow || (usedSpan ?? 0) + defaultSpan > 24) {
      fieldRow = { columns: [], id: `row_${element.id}` };
      rows.push(fieldRow);
    }
    fieldRow.columns.push({
      fields: [element],
      id: `column_${element.id}`,
      span: defaultSpan,
    });
  }
  return rows;
}

/** 校验当前动态表单并在失败时抛出组件校验异常。 */
async function validate() {
  await formRef.value?.validate();
}

/** 仅返回当前节点允许修改的字段，供审批接口提交。 */
function getEditableValues() {
  return Object.fromEntries(
    props.schema.fields
      .flatMap((element) =>
        isWorkflowFormGrid(element)
          ? element.columns.flatMap((column) => column.fields)
          : [element],
      )
      .filter((field) => fieldPermission(field) === 'editable')
      .map((field) => [field.key, formValues[field.key]]),
  );
}

defineExpose({ getEditableValues, validate });
</script>

<template>
  <div v-if="readonly" class="readonly-form">
    <Row v-for="row in renderRows" :key="row.id" :gutter="[12, 12]">
      <Col
        v-for="column in row.columns"
        :key="column.id"
        :sm="column.span"
        :xs="24"
      >
        <div class="readonly-column">
          <div
            v-for="field in column.fields"
            :key="field.id"
            class="readonly-field"
          >
            <div class="readonly-label">{{ field.label }}</div>
            <div class="readonly-value">{{ displayValue(field) }}</div>
          </div>
        </div>
      </Col>
    </Row>
  </div>

  <Form v-else ref="formRef" :model="formValues" layout="vertical">
    <Row v-for="row in renderRows" :key="row.id" :gutter="[16, 0]">
      <Col
        v-for="column in row.columns"
        :key="column.id"
        :sm="column.span"
        :xs="24"
      >
        <template v-for="field in column.fields" :key="field.id">
          <div
            v-if="fieldPermission(field) === 'readonly'"
            class="readonly-field mixed-readonly-field"
          >
            <div class="readonly-label">{{ field.label }}</div>
            <div class="readonly-value">{{ displayValue(field) }}</div>
          </div>
          <FormItem
            v-else
            :label="field.label"
            :name="field.key"
            :rules="
              field.required
                ? [
                    {
                      required: true,
                      message: $t('flow.form.runtime.required', [field.label]),
                    },
                  ]
                : []
            "
          >
            <Input
              v-if="field.type === 'input'"
              allow-clear
              :maxlength="256"
              :placeholder="field.placeholder"
              :value="stringValue(formValues[field.key])"
              @update:value="updateValue(field.key, $event)"
            />
            <TextArea
              v-else-if="field.type === 'textarea'"
              :auto-size="{ maxRows: 8, minRows: 3 }"
              :maxlength="2000"
              :placeholder="field.placeholder"
              :value="stringValue(formValues[field.key])"
              @update:value="updateValue(field.key, $event)"
            />
            <InputNumber
              v-else-if="field.type === 'number'"
              class="full-width-control"
              :placeholder="field.placeholder"
              :value="formValues[field.key] as number"
              @update:value="updateValue(field.key, $event)"
            />
            <Select
              v-else-if="field.type === 'select'"
              allow-clear
              class="full-width-control"
              :options="field.options"
              :placeholder="field.placeholder"
              :value="stringValue(formValues[field.key])"
              @update:value="updateValue(field.key, $event)"
            />
            <RadioGroup
              v-else-if="field.type === 'radio'"
              :options="field.options"
              :value="stringValue(formValues[field.key])"
              @update:value="updateValue(field.key, $event)"
            />
            <CheckboxGroup
              v-else-if="field.type === 'checkbox'"
              :options="field.options"
              :value="stringArrayValue(formValues[field.key])"
              @update:value="updateValue(field.key, $event)"
            />
            <DatePicker
              v-else-if="field.type === 'date'"
              class="w-full"
              format="YYYY-MM-DD"
              :placeholder="field.placeholder"
              :value="dateValue(formValues[field.key])"
              value-format="YYYY-MM-DD"
              @change="(_, dateText) => updateDateValue(field.key, dateText)"
            />
            <Switch
              v-else-if="field.type === 'switch'"
              :checked="Boolean(formValues[field.key])"
              @update:checked="updateValue(field.key, $event)"
            />
          </FormItem>
        </template>
      </Col>
    </Row>
  </Form>
</template>

<style scoped>
.readonly-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.full-width-control {
  width: 100%;
}

.readonly-field {
  min-width: 0;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  padding: 14px 16px;
}

.readonly-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mixed-readonly-field {
  margin-bottom: 24px;
}

.readonly-label {
  margin-bottom: 6px;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.readonly-value {
  overflow-wrap: anywhere;
  color: hsl(var(--foreground));
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>
