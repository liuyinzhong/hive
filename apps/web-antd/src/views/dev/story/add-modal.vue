<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createStoryApi, updateStoryApi } from '#/api/dev';
import { deepClone, filesToUrlString, urlStringToFiles, sleep } from '#/utils';
import { getStoryDetailApi } from '#/api/dev/story';
import type { DevStoryApi } from '#/api/dev/story';
import { useFormSchema } from './data';

defineOptions({
  name: 'StoryAddFormModel',
});
const emit = defineEmits<{
  success: [];
}>();
const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  handleValuesChange(_values, fieldsChanged) {
    if (fieldsChanged.includes('projectId')) {
      formApi.setFieldValue('versionId', undefined);
      formApi.setFieldValue('moduleId', undefined);
    }
  },
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  wrapperClass: 'grid-cols-3',
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  title: '添加需求',
  onConfirm: async () => {
    await formApi.validateAndSubmitForm();
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      let storyRow: DevStoryApi.DevStoryFace = modalApi.getData();
      if (storyRow.storyNum) {
        storyRow = await getStoryDetailApi(storyRow.storyNum);
        debugger;
        storyRow.fileIds = storyRow.fileList.map((item: any) => ({
          ...item,
          name: item.originalName,
          uid: item.fileId,
          status: 'done',
        }));
        modalApi.setState({ title: '编辑需求' });
        formApi.setValues(storyRow);
      }
    }
  },
});

async function onSubmit(values: Record<string, any>) {
  modalApi.lock();
  values.fileIds = filesToUrlString(values.fileIds, 'fileId', 'array');
  (values.storyId
    ? updateStoryApi(values.storyId, values)
    : createStoryApi(values)
  )
    .then(() => {
      modalApi.close();
      emit('success');
    })
    .catch(() => {})
    .finally(() => {
      modalApi.unlock();
    });
}
</script>
<template>
  <Modal class="w-[1000px]">
    <Form />
  </Modal>
</template>
