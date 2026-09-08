<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'antdv-next';

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

// 业务类型→可写字段元数据缓存:弹窗打开时预加载,目标字段下拉按业务类型联动
const fieldMetaMap = ref<Record<string, { dictType: string; field: string; label: string }[]>>({});

const [Form, formApi] = useVbenForm({
  commonConfig: {
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
        placeholder: '决定可修改的目标字段',
        // 切换业务类型后原目标字段/目标值不再属于新类型的白名单,联动清空防止残留脏值提交
        onChange: () => {
          formApi.setValues({ targetField: undefined, targetValue: undefined });
        },
      },
    },
    {
      component: 'Select',
      fieldName: 'actionType',
      label: '动作类型',
      rules: 'required',
      componentProps: {
        options: automationActionTypeOptions,
      },
      help: '修改字段值:节点完成时把当前关联业务对象的指定字段改为固定值',
    },
    {
      component: 'Select',
      fieldName: 'targetField',
      label: '目标字段',
      rules: 'required',
      dependencies: {
        triggerFields: ['businessType'],
        componentProps: (values) => ({
          options: (fieldMetaMap.value[values.businessType] ?? []).map(
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
        triggerFields: ['businessType', 'targetField'],
        componentProps: (values) => {
          const meta = (fieldMetaMap.value[values.businessType] ?? []).find(
            (item) => item.field === values.targetField,
          );
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
    await loadFieldMetas();
    formApi.setValues({
      status: '0',
      actionType: 'update_field',
      ...data,
      // 列表行是展开结构,还原为表单嵌套结构
      actionConfig: undefined,
      targetField: data.targetField,
      targetValue: data.targetValue,
    });
  },
  title: '新建自动化动作',
});

/** 预加载各业务类型的可写字段元数据(业务类型固定四种,一次拉全供联动)。 */
async function loadFieldMetas() {
  const types = getLocalDictList('BUSINESS_TYPE')
    .map((item) => item.value)
    .filter((value): value is string => typeof value === 'string');
  const results = await Promise.all(
    types.map(async (type) => [type, await getAutomationFieldsApi(type)] as const),
  );
  fieldMetaMap.value = Object.fromEntries(results);
}

async function onSubmit(values: Record<string, any>) {
  modalApi.lock();
  try {
    // 版本1 动作类型下拉只有修改字段值,提交统一收敛为 update_field
    const actionType: WorkflowAutomationApi.AutomationActionType =
      'update_field';
    const payload: WorkflowAutomationApi.WfAutomation = {
      automationName: String(values.automationName ?? ''),
      businessType: String(values.businessType ?? ''),
      actionType,
      actionConfig: {
        targetField: String(values.targetField ?? ''),
        targetValue: String(values.targetValue ?? ''),
      },
      // 后端 DTO 为整型,状态提交数字(表单值为字符串'0'/'1')
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
  <Modal class="w-[560px]">
    <Form />
  </Modal>
</template>
