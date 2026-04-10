<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createModule, updateModule } from '#/api/dev';

import { useFormModuleSchema } from './data';
defineOptions({
  name: 'AddModuleModal',
});

const emit = defineEmits<{
  success: [];
}>();

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
      const data = modalApi.getData();
      formApi.setValues(data);
      modalApi.setState({ title: data.moduleId ? '编辑模块' : '添加模块' });
    } else {
      formApi.resetForm();
    }
  },
});

async function onSubmit(values: Record<string, any>) {
  modalApi.lock();
  (values.moduleId
    ? updateModule(values.moduleId, values)
    : createModule(values)
  )
    .then(() => {
      modalApi.close();
    })
    .catch(() => {
      modalApi.unlock();
    });
  emit('success');
}
</script>
<template>
  <Modal class="w-[450px]">
    <Form />
  </Modal>
</template>
