<script lang="ts" setup>
import type { SystemVersionApi } from '#/api/dev/versions';
import { useVbenModal } from '@vben/common-ui';
import { message } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import { changeVersionType } from '#/utils/versionExtendApi';
import { createVersion, getLastVersion } from '#/api/dev/versions';
import { useFormSchema } from './data';
import { computed } from 'vue';

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
  schema: useFormSchema(formApi),
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
