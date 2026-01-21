<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useFormSchema } from './data';
import { createTask } from '#/api/dev/task';

defineOptions({
  name: 'TaskAddFormModel',
});

const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-3',
  fieldMappingTime: [
    ['timeArr', ['endDate', 'startDate'], 'YYYY-MM-DD HH:mm:ss'],
  ],
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  title: '添加任务',
  fullscreenButton: false,
  onConfirm: async () => {
    await formApi.validateAndSubmitForm();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      formApi.setValues(modalApi.getData());
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
  await createTask(values);
  modalApi.close();
  message.success({
    content: `提交成功`,
    duration: 2,
    key: 'is-form-submitting',
  });
}
</script>
<template>
  <Modal class="w-[800px]">
    <Form />
  </Modal>
</template>
