<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createVersionApi, updateVersionApi } from '#/api/dev';

import { useFormSchema } from './data';
import dayjs from 'dayjs';

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
  fieldMappingTime: [
    [
      'timeArr',
      ['startDate', 'endDate'],
      (value: any, fieldName: string) => {
        if (fieldName === 'startDate') {
          return dayjs(value).startOf('day').format('YYYY-MM-DD HH:mm:ss');
        } else {
          return dayjs(value).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        }
      },
    ],
  ],
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
    ? updateVersionApi(values.versionId, values)
    : createVersionApi(values)
  )
    .then(() => {
      modalApi.close();
      emit('success');
    })
    .finally(() => {
      modalApi.unlock();
    });
}
</script>
<template>
  <Modal class="w-[450px]">
    <Form />
  </Modal>
</template>
