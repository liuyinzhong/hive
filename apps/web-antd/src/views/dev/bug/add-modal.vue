<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { getDictList } from '#/dicts';

defineOptions({
  name: 'BugAddFormModel',
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
      component: 'Textarea',
      fieldName: 'bugTitle',
      label: '标题',
      rules: 'required',
      formItemClass: 'col-span-2',
    },
    {
      component: 'Select',
      fieldName: 'bugStatus',
      label: '状态',
      defaultValue: '0',
      formItemClass: 'col-span-2',
      componentProps: {
        options: getDictList('BUG_STATUS'),
      },
    },
    {
      component: 'UserSelect',
      fieldName: 'fixUserId',
      label: '修复人',
    },
    {
      component: 'Input',
      fieldName: 'bugUa',
      label: '浏览器信息',
      disabled: true,
      defaultValue: navigator.userAgent,
    },
    {
      component: 'Select',
      fieldName: 'versionId',
      label: '关联版本',
      componentProps: {
        options: [],
      },
    },
    {
      component: 'Select',
      fieldName: 'moduleId',
      label: '关联模块',
      componentProps: {
        options: [],
      },
    },

    {
      component: 'Select',
      fieldName: 'bugLevel',
      label: '级别',
      defaultValue: '2',
      componentProps: {
        options: getDictList('BUG_LEVEL'),
      },
    },
    {
      component: 'Select',
      fieldName: 'bugEnv',
      label: '环境',
      defaultValue: 'TEST',
      componentProps: {
        options: getDictList('BUG_ENV'),
      },
    },
    {
      component: 'Select',
      fieldName: 'bugSource',
      label: '来源',
      defaultValue: '0',
      componentProps: {
        options: getDictList('BUG_SOURCE'),
      },
    },
    {
      component: 'Select',
      fieldName: 'bugType',
      label: '类型',
      defaultValue: '0',
      componentProps: {
        options: getDictList('BUG_TYPE'),
      },
    },

    {
      component: 'AiEditor',
      fieldName: 'bugRichText',
      label: '内容',
      formItemClass: 'col-span-2',
      componentProps: {},
    },
  ],
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  title: '添加缺陷',
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
