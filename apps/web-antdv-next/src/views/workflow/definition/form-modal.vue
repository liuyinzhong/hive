<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import type { WorkflowDefinitionApi } from '#/api/workflow';
import {
  createWorkflowDefinitionApi,
  updateWorkflowDefinitionApi,
} from '#/api/workflow';
import { getLocalDictList } from '#/dicts';

defineOptions({
  name: 'WorkflowDefinitionFormModal',
});

const emit = defineEmits<{
  success: [];
}>();

const startTypeOptions = [
  { label: '手动发起流程', value: 0 },
  { label: '被动触发流程', value: 1 },
];

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
      fieldName: 'definitionId',
      label: '流程定义ID',
      dependencies: {
        triggerFields: ['definitionId'],
        show() {
          return false;
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'definitionName',
      label: '流程名称',
      rules: 'required',
      componentProps: {
        allowClear: true,
        maxlength: 128,
      },
    },
    {
      component: 'Select',
      fieldName: 'category',
      label: '流程分类',
      componentProps: {
        options: getLocalDictList('WORKFLOW_CATEGORY'),
      },
    },
    {
      component: 'Select',
      fieldName: 'businessType',
      label: '业务类型',
      rules: 'required',
      componentProps: {
        options: getLocalDictList('BUSINESS_TYPE'),
        placeholder: '请选择业务类型,节点可挂载的自动化动作按此过滤',
        // 业务类型变化后默认标志归属失效,联动清空(同类型唯一,归属新类型需重新勾选)
        onChange: () => {
          formApi.setValues({ isDefault: false });
        },
      },
    },
    {
      component: 'Select',
      fieldName: 'startType',
      label: '启动类型',
      componentProps: {
        options: startTypeOptions,
        placeholder: '默认手动发起',
        // 切回手动发起时默认流程不可用,联动禁用并清为 false
        onChange: (value: number) => {
          if (value !== 1) {
            formApi.setValues({ isDefault: false });
          }
        },
      },
      help: '手动发起:出现在发起申请入口,纯流程不绑定业务对象;被动触发:由业务对象发起(创建后自动匹配默认流程),可挂载自动化动作',
    },
    {
      component: 'RadioGroup',
      fieldName: 'isDefault',
      label: '默认流程',
      componentProps: {
        options: [
          { label: '是', value: true },
          { label: '否', value: false },
        ],
        optionType: 'button',
        buttonStyle: 'solid',
      },
      dependencies: {
        // 仅被动触发流程可设默认,手动发起时禁用
        triggerFields: ['startType'],
        componentProps: (values) => ({
          disabled: values.startType !== 1,
        }),
      },
      help: '同业务类型唯一:勾选后自动顶掉该类型原默认;该类型业务对象创建时自动发起本流程(须已发布)',
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
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      return;
    }
    formApi.reset();
    const data: any = modalApi.getData() || {};
    modalApi.setState({
      title: data.definitionId ? '编辑流程定义' : '新建流程定义',
    });
    formApi.setValues({
      startType: 0,
      isDefault: false,
      ...data,
    });
  },
  title: '新建流程定义',
});

async function onSubmit(values: Record<string, any>) {
  modalApi.lock();
  try {
    const payload: Omit<
      WorkflowDefinitionApi.WorkflowDefinition,
      'definitionId'
    > = {
      definitionName: values.definitionName,
      category: values.category,
      businessType: values.businessType,
      startType: values.startType === 1 ? 1 : 0,
      isDefault: values.startType === 1 && values.isDefault === true,
      remark: values.remark,
    };
    await (values.definitionId
      ? updateWorkflowDefinitionApi(values.definitionId, payload)
      : createWorkflowDefinitionApi(payload));
    message.success('操作成功');
    modalApi.close();
    emit('success');
  } finally {
    modalApi.unlock();
  }
}
</script>

<template>
  <Modal class="w-[520px]">
    <Form />
  </Modal>
</template>
