<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  createWorkflowDefinitionApi,
  getBusinessHooksApi,
  updateWorkflowDefinitionApi,
} from '#/api/workflow';

import { useFormSchema } from './data';

defineOptions({
  name: 'WorkflowDefinitionFormModal',
});

const emit = defineEmits<{
  success: [];
}>();

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  handleSubmit: onSubmit,
  schema: useFormSchema(),
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
    // 加载业务类型下拉选项(从后端已注册的钩子元数据获取,让用户知情可选值)
    try {
      const hooks = await getBusinessHooksApi();
      formApi.updateSchema([
        {
          fieldName: 'businessType',
          componentProps: {
            options: hooks.items.map((item) => ({
              label: `${item.label} (${item.businessType})`,
              value: item.businessType,
            })),
          },
        },
      ]);
    } catch {
      // 选项加载失败不阻塞表单打开,用户可清空或后续重试
    }
    const data: any = modalApi.getData() || {};
    modalApi.setState({
      title: data.definitionId ? '编辑流程定义' : '新建流程定义',
    });
    formApi.setValues(data);
  },
  title: '新建流程定义',
});

async function onSubmit(values: Record<string, any>) {
  modalApi.lock();
  try {
    await (values.definitionId
      ? updateWorkflowDefinitionApi(values.definitionId, values)
      : createWorkflowDefinitionApi(values));
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
