<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createVersion, updateVersion } from '#/api/dev';

import { useFormSchema } from './data';

defineOptions({
  name: 'VersionsAddFormModel',
});
const emit = defineEmits<{
  success: [];
}>();
const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  fieldMappingTime: [['timeArr', ['endDate', 'startDate'], 'YYYY-MM-DD']],
  schema: useFormSchema(),
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
      const data = modalApi.getData();
      if (data.versionId) {
        modalApi.setState({
          title: '编辑版本',
        });
      }
      formApi.setValues(data);
    }
  },
});

async function onSubmit(values: Record<string, any>) {
  modalApi.lock();
  (values.versionId
    ? updateVersion(values.versionId, values)
    : createVersion(values)
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
