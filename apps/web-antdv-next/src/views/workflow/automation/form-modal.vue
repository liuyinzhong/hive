<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Input, message, Select } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import type { WorkflowAutomationApi } from '#/api/workflow';
import {
  createAutomationApi,
  getAutomationFieldsApi,
  updateAutomationApi,
} from '#/api/workflow';
import { getLocalDictList } from '#/dicts';

import { automationActionTypeOptions } from './data';

defineOptions({
  name: 'WorkflowAutomationFormModal',
});

const emit = defineEmits<{
  success: [];
}>();

// 修改字段值参数用的状态字段元数据缓存:按动作库业务类型(挂载过滤维度)缓存
const updateFieldMetaMap = ref<
  Record<string, { dictType: string; field: string; label: string }[]>
>({});
// 动作类型本地镜像:控制参数区切换与提交收集
const actionType = ref<string>('update_field');

// 插入记录参数区状态:目标业务类型 + 可插字段目录行(每行独立配置值来源与值)
interface InsertRowState {
  dictType?: string;
  field: string;
  formField?: string;
  label: string;
  required?: boolean;
  sourceType: 'fixed' | 'form';
  value?: string;
}
const insertRows = ref<InsertRowState[]>([]);
const insertRowTouched = reactive<Record<string, boolean>>({});
// 业务类型本地镜像:插入记录的插入目标即动作业务类型,目录按它加载
const currentBusinessType = ref<string>();

const [Form, formApi] = useVbenForm({
  commonConfig: {
    labelWidth: 'auto',
    colon: true,
    componentProps: {
      class: 'w-full',
    },
  },
  handleSubmit: onSubmit,
  schema: [
    {
      component: 'Input',
      fieldName: 'automationId',
      label: '动作ID',
      dependencies: {
        triggerFields: ['automationId'],
        show() {
          return false;
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'automationName',
      label: '动作名称',
      rules: 'required',
      componentProps: {
        allowClear: true,
        maxlength: 128,
      },
    },
    {
      component: 'Select',
      fieldName: 'businessType',
      label: '业务类型',
      rules: 'required',
      componentProps: {
        options: getLocalDictList('BUSINESS_TYPE'),
        placeholder: '流程的业务类型,决定该动作可挂载到哪些流程',
        onChange: (value: string) => {
          currentBusinessType.value = value;
          // 修改字段值的目标字段依赖业务类型,切换后清空防残留
          formApi.setValues({ targetField: undefined, targetValue: undefined });
          if (actionType.value === 'insert_record' && value) {
            void loadInsertMetas(value);
          }
        },
      },
      help: '动作按此类型被流程设计器过滤;修改字段值作用于该类型的业务对象,插入记录写入该类型的业务表',
    },
    {
      component: 'Select',
      fieldName: 'actionType',
      label: '动作类型',
      rules: 'required',
      componentProps: {
        options: automationActionTypeOptions,
        onChange: (value: string) => {
          actionType.value = value;
          if (value === 'insert_record' && currentBusinessType.value) {
            void loadInsertMetas(currentBusinessType.value);
          }
        },
      },
      help: '修改字段值:更新关联业务对象的状态字段(挂被动触发流程);插入记录:向本动作业务类型对应的业务表插入新记录(挂手动发起流程)',
    },
    {
      component: 'Select',
      fieldName: 'targetField',
      label: '目标字段',
      rules: 'required',
      dependencies: {
        triggerFields: ['actionType', 'businessType'],
        if: (values) => values.actionType !== 'insert_record',
        componentProps: (values) => ({
          options: (updateFieldMetaMap.value[values.businessType] ?? []).map(
            (item) => ({ label: item.label, value: item.field }),
          ),
          placeholder: '先选择业务类型',
        }),
      },
    },
    {
      component: 'Select',
      fieldName: 'targetValue',
      label: '目标值',
      rules: 'required',
      dependencies: {
        triggerFields: ['actionType', 'businessType', 'targetField'],
        if: (values) => values.actionType !== 'insert_record',
        componentProps: (values) => {
          const meta = (
            updateFieldMetaMap.value[values.businessType] ?? []
          ).find((item) => item.field === values.targetField);
          return {
            options: meta ? getLocalDictList(meta.dictType) : [],
            placeholder: meta ? '请选择目标值' : '先选择目标字段',
          };
        },
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '状态',
      componentProps: {
        options: [
          { label: '启用', value: '0' },
          { label: '停用', value: '1' },
        ],
      },
      defaultValue: '0',
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: '备注',
      componentProps: {
        maxlength: 256,
        rows: 3,
        showCount: true,
      },
    },
  ],
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: async () => {
    await formApi.validateAndSubmit();
  },
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return;
    }
    formApi.reset();
    const data: any = modalApi.getData() || {};
    modalApi.setState({
      title: data.automationId ? '编辑自动化动作' : '新建自动化动作',
    });
    actionType.value = data.actionType ?? 'update_field';
    resetInsertState();
    await loadUpdateFieldMetas();
    if (data.updateField) {
      // 列表行展开结构还原为表单字段
      formApi.setValues({
        status: '0',
        actionType: 'update_field',
        ...data,
        targetField: data.updateField.targetField,
        targetValue: data.updateField.targetValue,
      });
    } else if (data.insertRecord) {
      currentBusinessType.value = data.businessType;
      formApi.setValues({ status: '0', ...data });
      await loadInsertMetas(data.businessType);
      applyInsertRecord(data.insertRecord);
    } else {
      formApi.setValues({ status: '0', actionType: 'update_field' });
    }
  },
  title: '新建自动化动作',
});

const showInsertConfig = computed(() => actionType.value === 'insert_record');

// 插入区标题用的业务类型中文名
const businessTypeLabel = computed(() => {
  const matched = getLocalDictList('BUSINESS_TYPE').find(
    (item) => item.value === currentBusinessType.value,
  );
  return matched?.label ?? currentBusinessType.value ?? '';
});

/** 预加载各业务类型的状态字段元数据(修改字段值参数联动用)。 */
async function loadUpdateFieldMetas() {
  const types = getLocalDictList('BUSINESS_TYPE')
    .map((item) => item.value)
    .filter((value): value is string => typeof value === 'string');
  const results = await Promise.all(
    types.map(
      async (type) => [type, await getAutomationFieldsApi(type)] as const,
    ),
  );
  updateFieldMetaMap.value = Object.fromEntries(results);
}

async function loadInsertMetas(type: string) {
  const metas = await getAutomationFieldsApi(type, 'insert');
  const previous = new Map(insertRows.value.map((row) => [row.field, row]));
  insertRows.value = metas.map((meta) => {
    const old = previous.get(meta.field);
    return {
      dictType: meta.dictType,
      field: meta.field,
      formField: old?.formField,
      label: meta.label,
      required: meta.required,
      sourceType: old?.sourceType ?? 'fixed',
      value: old?.value,
    };
  });
}

/** 编辑回显:把响应中的插入配置还原到映射行。 */
function applyInsertRecord(
  config: WorkflowAutomationApi.InsertRecordConfigResponse,
) {
  const configMap = new Map(config.mappings.map((item) => [item.field, item]));
  insertRows.value = insertRows.value.map((row) => {
    const item = configMap.get(row.field);
    if (!item) return row;
    insertRowTouched[row.field] = true;
    return {
      ...row,
      formField: item.formField,
      sourceType: item.sourceType,
      value: item.value,
    };
  });
}

function resetInsertState() {
  insertRows.value = [];
  Object.keys(insertRowTouched).forEach((key) => delete insertRowTouched[key]);
}

function onRowSourceTypeChange(
  row: InsertRowState,
  sourceType: 'fixed' | 'form',
) {
  row.sourceType = sourceType;
  insertRowTouched[row.field] = true;
}

/** 行是否配置了有效值。 */
function rowFilled(row: InsertRowState) {
  return row.sourceType === 'fixed'
    ? !!row.value?.trim()
    : !!row.formField?.trim();
}

/** 前端必填拦截:必填目录字段必须配置有效映射(与后端配置期校验对齐)。 */
function validateInsertConfig(): string | undefined {
  for (const row of insertRows.value) {
    if (row.required && !rowFilled(row)) {
      return `必填字段「${row.label}」未配置映射`;
    }
  }
  return undefined;
}

async function onSubmit(values: Record<string, any>) {
  modalApi.lock();
  try {
    // 版本动作类型下拉收敛:切换参数区后以本地镜像为准
    let actionConfig:
      | WorkflowAutomationApi.UpdateFieldConfig
      | WorkflowAutomationApi.InsertRecordConfig;
    if (actionType.value === 'insert_record') {
      const invalid = validateInsertConfig();
      if (invalid) {
        message.warning(invalid);
        modalApi.unlock();
        return;
      }
      actionConfig = {
        mappings: insertRows.value
          .filter((row) => rowFilled(row))
          .map((row) => ({
            field: row.field,
            sourceType: row.sourceType,
            ...(row.sourceType === 'fixed'
              ? { value: row.value?.trim() ?? '' }
              : { formField: row.formField?.trim() ?? '' }),
          })),
      };
    } else {
      actionConfig = {
        targetField: String(values.targetField ?? ''),
        targetValue: String(values.targetValue ?? ''),
      };
    }
    const payload: WorkflowAutomationApi.WfAutomation = {
      automationName: String(values.automationName ?? ''),
      businessType: String(values.businessType ?? ''),
      actionType:
        actionType.value as WorkflowAutomationApi.AutomationActionType,
      actionConfig,
      status: values.status === '1' ? 1 : 0,
      remark: values.remark,
    };
    await (values.automationId
      ? updateAutomationApi(values.automationId, payload)
      : createAutomationApi(payload));
    message.success('操作成功');
    modalApi.close();
    emit('success');
  } finally {
    modalApi.unlock();
  }
}
</script>

<template>
  <Modal class="w-[640px]">
    <Form />
    <div v-if="showInsertConfig" class="insert-config">
      <div class="insert-config-heading">
        字段映射(插入到{{ businessTypeLabel }})
      </div>
      <template v-if="insertRows.length">
        <div v-for="row in insertRows" :key="row.field" class="insert-row">
          <span class="insert-row-label">
            <template v-if="row.required">*</template>
            {{ row.label }}
          </span>
          <Select
            class="insert-row-source"
            :options="[
              { label: '固定值', value: 'fixed' },
              { label: '表单字段', value: 'form' },
            ]"
            :value="row.sourceType"
            @change="
              (value) => onRowSourceTypeChange(row, value as 'fixed' | 'form')
            "
          />
          <Select
            v-if="row.sourceType === 'fixed' && row.dictType"
            class="insert-row-value"
            :options="getLocalDictList(row.dictType)"
            :value="row.value"
            placeholder="请选择固定值"
            @change="
              (value) => {
                row.value = value as string;
                insertRowTouched[row.field] = true;
              }
            "
          />
          <Input
            v-else-if="row.sourceType === 'fixed'"
            v-model:value="row.value"
            class="insert-row-value"
            :placeholder="`请输入${row.label}`"
            @change="insertRowTouched[row.field] = true"
          />
          <Input
            v-else
            v-model:value="row.formField"
            class="insert-row-value"
            placeholder="表单字段名,如 story_title"
            @change="insertRowTouched[row.field] = true"
          />
        </div>
        <div class="insert-config-hint">
          未配置的行不会写入;带 *
          为目标业务必填字段;表单字段名将在设计器挂载和发布时按流程表单校验。
        </div>
      </template>
    </div>
  </Modal>
</template>

<style scoped>
.insert-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid hsl(var(--border));
}

.insert-config-heading {
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.insert-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.insert-field :deep(.ant-select) {
  width: 100%;
}

.insert-row {
  display: grid;
  grid-template-columns: 110px 110px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
}

.insert-row-label {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  color: hsl(var(--foreground));
  white-space: nowrap;
}

.insert-config-hint {
  padding: 4px 8px;
  font-size: 12px;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
  border-left: 3px solid hsl(var(--primary));
}
</style>
