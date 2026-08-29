<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createStoryApi, updateStoryApi } from '#/api/dev';
import { deepClone, filesToUrlString, urlStringToFiles, sleep } from '#/utils';
import { getStoryDetailApi } from '#/api/dev/story';
import type { DevStoryApi } from '#/api/dev/story';
import { useFormSchema } from './data';
import { message } from 'antdv-next';
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
  // layout: 'vertical',
  wrapperClass: 'grid-cols-7',
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  title: '添加需求',
  onConfirm: async () => {
    await formApi.validateAndSubmit();
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      let storyRow: DevStoryApi.DevStoryFace =
        modalApi.getData() as DevStoryApi.DevStoryFace;
      if (storyRow.storyNum) {
        storyRow = await getStoryDetailApi(storyRow.storyNum);
        storyRow.fileIds = storyRow.fileList?.map((item: any) => ({
          ...item,
          name: item.originalName,
          uid: item.fileId,
          status: 'done',
        }));
        modalApi.setState({ title: '编辑需求' });
        // 先设置除 userList 外的值,避免 projectId 联动触发 dependencies
        // 导致 ApiSelect 数据未加载完时清空已回显的 userList
        const userList = storyRow.userList;
        delete storyRow.userList;
        formApi.setValues(storyRow, true, true);
        // 等待 dependencies 触发的 api 请求完成后再设置 userList
        await sleep(300);
        formApi.setFieldValue('userList', userList);
      } else {
        formApi.setValues(storyRow, true, true);
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
      message.success('操作成功');
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
  <Modal class="w-[80%]">
    <Form />
  </Modal>
</template>
