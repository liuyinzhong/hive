<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { message } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import { getDictList } from '#/dicts';
import { changeVersionType } from '#/utils/versionExtendApi';
import { z } from '#/adapter/form';
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
  fieldMappingTime: [['timeArr', ['startTime', 'endTime'], 'YYYY-MM-DD']],
  schema: [
    {
      component: 'Select',
      fieldName: 'releaseStatus',
      label: '发布状态',
      rules: 'required',
      defaultValue: '0',
      disabled: false,
      componentProps: {
        options: getDictList('RELEASE_STATUS'),
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'versionType',
      label: '更新类型',
      rules: 'required',
      componentProps: {
        onChange: (e: any) => {
          const oldVersion = '1.0.0';
          const newVersion = changeVersionType(oldVersion, e.target.value);
          formApi.setFieldValue('version', newVersion);
        },
        options: getDictList('VERSION_TYPE'),
      },
    },
    {
      component: 'Input',
      fieldName: 'version',
      label: '版本号',
      rules: z
        .string()
        .min(1, { message: '请输入版本号' })
        .refine((value) => /^\d+\.\d+\.\d+$/.test(value), {
          message: '格式：x.y.z，x/y/z 为非负整数',
        }),
    },
    {
      component: 'ApiSelect',
      fieldName: 'projectId',
      label: '关联项目',
      rules: 'required',
      componentProps: {
        api: () => getDictList('STORY_STATUS'),
        allowClear: true,
      },
    },
    {
      component: 'RangePicker',
      fieldName: 'timeArr',
      label: '起止时间',
      rules: 'required',
      componentProps: {
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
      },
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
  }, 1500);
}
</script>
<template>
  <Modal class="w-[450px]">
    <Form> </Form>
  </Modal>
</template>
