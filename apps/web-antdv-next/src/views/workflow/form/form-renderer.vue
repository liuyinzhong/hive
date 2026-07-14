<script lang="ts" setup>
import type { WorkflowDefinitionApi } from '#/api/workflow';

import { reactive, ref, watch } from 'vue';

import {
  CheckboxGroup,
  DatePicker,
  Form,
  FormItem,
  Input,
  InputNumber,
  RadioGroup,
  Select,
  Switch,
  TextArea,
} from 'antdv-next';
import dayjs from 'dayjs';

import { $t } from '#/locales';

interface FormApi {
  validate: () => Promise<void>;
}

const props = defineProps<{
  modelValue?: Record<string, unknown>;
  readonly?: boolean;
  schema: WorkflowDefinitionApi.WorkflowFormSchema;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>];
}>();

const formRef = ref<FormApi>();
const formValues = reactive<Record<string, unknown>>({});

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

/** 校验当前动态表单并在失败时抛出组件校验异常。 */
async function validate() {
  await formRef.value?.validate();
}

defineExpose({ validate });
</script>

<template>
  <div v-if="readonly" class="readonly-form">
    <div v-for="field in schema.fields" :key="field.id" class="readonly-field">
      <div class="readonly-label">{{ field.label }}</div>
      <div class="readonly-value">{{ displayValue(field) }}</div>
    </div>
  </div>

  <Form v-else ref="formRef" :model="formValues" layout="vertical">
    <FormItem
      v-for="field in schema.fields"
      :key="field.id"
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
        class="w-full"
        :placeholder="field.placeholder"
        :value="formValues[field.key] as number"
        @update:value="updateValue(field.key, $event)"
      />
      <Select
        v-else-if="field.type === 'select'"
        allow-clear
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
  </Form>
</template>

<style scoped>
.readonly-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid hsl(var(--border));
  border-left: 1px solid hsl(var(--border));
}

.readonly-field {
  min-width: 0;
  border-right: 1px solid hsl(var(--border));
  border-bottom: 1px solid hsl(var(--border));
  padding: 14px 16px;
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

@media (max-width: 640px) {
  .readonly-form {
    grid-template-columns: 1fr;
  }
}
</style>
