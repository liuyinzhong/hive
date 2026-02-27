<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { message } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import { createModule } from '#/api/dev';
import { useFormModuleSchema } from './data';
defineOptions({
  name: 'AddModuleModal',
});

const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  schema: useFormModuleSchema(),
  showDefaultActions: false,
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
});
const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: async () => {
    await formApi.validateAndSubmitForm();
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      let data = modalApi.getData();
      formApi.setValues(data);
      modalApi.setState({ title: data.moduleId ? '编辑模块' : '添加模块' });
    } else {
      formApi.resetForm();
    }
  },
});

async function onSubmit(values: Record<string, any>) {
  message.loading({
    content: '正在提交中...',
    duration: 0,
    key: 'is-form-submitting',
  });
  modalApi.lock();

  await createModule(values);

  modalApi.close();

  message.success({
    content: `提交成功`,
    duration: 2,
    key: 'is-form-submitting',
  });
}
</script>
<template>
  <Modal class="w-[450px]">
    <Form />
  </Modal>
</template>
