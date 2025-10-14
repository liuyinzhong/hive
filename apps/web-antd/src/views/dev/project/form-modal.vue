<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { message } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import { getDictList } from '#/dicts';

defineOptions({
  name: 'ProjectAddFormModelDemo',
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
  wrapperClass: 'grid-cols-2',
  schema: [
    {
      component: 'Input',
      fieldName: 'projectTitle',
      label: '标题',
      rules: 'required',
      formItemClass: 'col-span-2',
    },

    {
      component: 'Input',
      fieldName: 'project_logo',
      label: '项目logo',
    },
    {
      component: 'Input',
      fieldName: 'cover_url',
      label: '项目封面',
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: '项目描述',
      formItemClass: 'col-span-2',
    },
  ],
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  title: '添加项目',
  onConfirm: async () => {
    await formApi.validateAndSubmitForm();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      formApi.setValues(modalApi.getData());
    }
  },
});

function onSubmit(values: Record<string, any>) {
  message.loading({
    content: '正在提交中...',
    duration: 0,
    key: 'is-form-submitting',
  });
  modalApi.lock();
  setTimeout(() => {
    modalApi.close();
    message.success({
      content: `提交成功：${JSON.stringify(values)}`,
      duration: 2,
      key: 'is-form-submitting',
    });
  }, 3000);
}
</script>
<template>
  <Modal class="w-[800px]">
    <Form />
  </Modal>
</template>
