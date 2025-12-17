<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';
import type { SystemVersionApi } from '#/api/dev/versions';
import { useVbenForm, z } from '#/adapter/form';
import { getDictList } from '#/dicts';
import { changeVersionType } from '#/utils/versionExtendApi';
import { createVersion, getLastVersion } from '#/api/dev/versions';
import { getProjectsList } from '#/api/dev/project';

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
      component: 'Input',
      fieldName: 'versionId',
      dependencies: {
        show() {
          return false;
        },
        triggerFields: ['versionId'],
      },
    },
    {
      component: 'Input',
      fieldName: 'pordVersion',
      label: '线上版本号',
      componentProps: {
        readonly: true,
        bordered: false,
      },
      dependencies: {
        show(values) {
          return !!values.pordVersion;
        },
        triggerFields: ['pordVersion'],
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
      dependencies: {
        disabled(values) {
          return !!values.versionId;
        },
        triggerFields: ['versionId'],
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
      dependencies: {
        disabled(values) {
          return !!values.versionId;
        },
        triggerFields: ['versionId'],
      },
    },
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
      component: 'ApiSelect',
      fieldName: 'projectId',
      label: '关联项目',
      rules: 'required',
      componentProps: {
        api: () => getProjectsList(),
        labelField: 'projectTitle',
        valueField: 'projectId',
        autoSelect: 'first',
      },
      dependencies: {
        disabled(values) {
          return !!values.versionId;
        },
        triggerFields: ['versionId'],
      },
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: '备注',
    },
    {
      component: 'RangePicker',
      fieldName: 'timeArr',
      label: '起止时间',
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
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      formApi.resetForm();

      const row: SystemVersionApi.SystemVersion = modalApi.getData();

      if (!row.version) {
        const lastVersion: SystemVersionApi.SystemVersion =
          await getLastVersion('');

        const newVersion = changeVersionType(lastVersion.version, '20');

        row.version = newVersion;
        row.versionType = '20';
        row.pordVersion = lastVersion.version;
      }
      formApi.setValues(row);
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

  await createVersion(values);

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
