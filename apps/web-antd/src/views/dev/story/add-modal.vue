<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { message } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import { getDictList } from '#/dicts';
import { h } from 'vue';

defineOptions({
  name: 'FormModelDemo',
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
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1 md:grid-cols-3',
  schema: [
    {
      component: 'Input',
      fieldName: 'storyTitle',
      label: '需求名称',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'pmLink',
      label: '需求链接',
    },
    {
      component: 'ApiSelect',
      fieldName: 'storyStatus',
      label: '需求状态',
      rules: 'required',
      defaultValue: '20',
      componentProps: {
        api: () => getDictList('STORY_STATUS'),
        allowClear: true,
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'storyType',
      label: '需求类别',
      defaultValue: '0',
      componentProps: {
        api: () => getDictList('STORY_TYPE'),
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'userList',
      label: '参与人员',
      componentProps: {
        allowClear: true,
        filterOption: true,
        showSearch: true,
        multiple: true,
        api: () => getDictList('STORY_TYPE'),
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'version',
      label: '迭代',
      componentProps: {
        api: () => getDictList('STORY_TYPE'),
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'storyLevel',
      label: '优先级',
      defaultValue: '1',
      rules: 'required',
      componentProps: {
        api: () => getDictList('STORY_LEVEL'),
      },
    },
    {
      component: 'AiEditor',
      fieldName: 'storyRichText',
      label: '内容',
      formItemClass: 'col-span-3',
      componentProps: {},
    },
  ],
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
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
