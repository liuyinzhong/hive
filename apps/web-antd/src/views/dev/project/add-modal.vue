<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { message } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import { createProject } from '#/api/dev/project';
import { upload_file } from '#/api/examples/upload';
import { filesToUrlString, urlStringToFiles } from '#/utils';
defineOptions({
  name: 'AddProjectModal',
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
  fieldMappingTime: [['timeArr', ['startTime', 'endTime'], 'YYYY-MM-DD']],
  schema: [
    {
      component: 'Input',
      label: '项目标题',
      fieldName: 'projectTitle',
      rules: 'required',
      componentProps: {
        maxlength: 10,
        showCount: true,
      },
    },
    {
      component: 'Textarea',
      label: '项目描述',
      fieldName: 'description',
      rules: 'required',
      componentProps: {
        maxlength: 150,
      },
    },
    {
      component: 'Upload',
      componentProps: {
        // 更多属性见：https://ant.design/components/upload-cn
        accept: '.png,.jpg,.jpeg',
        // 自动携带认证信息
        customRequest: upload_file,
        disabled: false,
        maxCount: 1,
        multiple: false,
        showUploadList: true,
        // 上传列表的内建样式，支持四种基本样式 text, picture, picture-card 和 picture-circle
        listType: 'picture-card',
      },
      fieldName: 'projectLogo',
      label: '项目logo',
      renderComponentContent: () => {
        return {
          default: () => '请选择',
        };
      },
      rules: 'required',
    },
  ],
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
      formApi.resetForm();
      formApi.setFieldValue(
        'projectLogo',
        urlStringToFiles(
          'https://unpkg.com/@vbenjs/static-source@0.1.7/source/logo-v1.webp',
        ),
      );
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

  // 处理项目logo文件数组
  if (values.projectLogo?.length) {
    values.projectLogo = filesToUrlString(values.projectLogo);
  }

  await createProject(values);

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
