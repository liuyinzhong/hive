<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { message } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import { createProject, updateProject } from '#/api/dev';
import { useFormProjectSchema } from './data';

import { filesToUrlString, urlStringToFiles } from '#/utils';
defineOptions({
  name: 'AddProjectModal',
});

const emit = defineEmits<{
  success: [];
}>();

const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  schema: useFormProjectSchema(),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  title: '添加项目',
  fullscreenButton: false,
  onConfirm: async () => {
    await formApi.validateAndSubmitForm();
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      let data = modalApi.getData();
      data.projectLogo = urlStringToFiles(data.projectLogo);
      formApi.setValues(data);
      modalApi.setState({ title: data.projectId ? '编辑项目' : '添加项目' });
    }
  },
});

async function onSubmit(values: Record<string, any>) {
  modalApi.lock();
  // 处理项目logo文件数组
  if (values.projectLogo?.length) {
    values.projectLogo = filesToUrlString(values.projectLogo);
  }

  (values.projectId
    ? updateProject(values.projectId, values)
    : createProject(values)
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
