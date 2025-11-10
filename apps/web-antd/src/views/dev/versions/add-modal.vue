<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { message } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import { getDictList } from '#/dicts';
import { h } from 'vue';

defineOptions({
  name: 'VersionsAddFormModel',
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
  fieldMappingTime: [
    ['timeArr', ['startTime', 'endTime'], 'YYYY-MM-DD HH:mm:ss'],
  ],
  schema: [
    {
      component: 'Textarea',
      fieldName: 'taskTitle',
      label: '任务标题',
      rules: 'required',
      formItemClass: 'col-span-2',
    },
    {
      component: 'ApiSelect',
      fieldName: 'storyTitle',
      label: '关联需求',
      rules: 'required',
      componentProps: {
        api: () => getDictList('STORY_STATUS'),
        allowClear: true,
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'executeName',
      label: '执行人',
      rules: 'required',
      componentProps: {
        api: () => getDictList('STORY_STATUS'),
        allowClear: true,
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'planHours',
      label: '计划工时',
      defaultValue: 0,
    },
    {
      component: 'InputNumber',
      fieldName: 'actualHours',
      label: '实际工时',
      defaultValue: 0,
    },
    {
      component: 'RangePicker',
      fieldName: 'timeArr',
      label: '开始时间',
      rules: 'required',
      componentProps: {
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
    },

    {
      component: 'ApiSelect',
      fieldName: 'taskType',
      label: '任务类型',
      rules: 'required',
      componentProps: {
        api: () => getDictList('STORY_STATUS'),
        allowClear: true,
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'taskStatus',
      label: '任务状态',
      rules: 'required',
      componentProps: {
        api: () => getDictList('STORY_STATUS'),
        allowClear: true,
      },
    },
    {
      component: 'AiEditor',
      fieldName: 'taskRichText',
      label: '内容',
      formItemClass: 'col-span-2',
      componentProps: {},
    },
  ],
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  title: '添加版本',
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
