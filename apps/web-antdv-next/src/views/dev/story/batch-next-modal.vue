<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { batchNextStoryApi } from '#/api/dev/story';
import { getLocalDictList } from '#/dicts';
import { $t } from '#/locales';
import { userIdSchema } from '#/views/dev/base/baseSchema';

defineOptions({
  name: 'StoryBatchNextModal',
});
const emit = defineEmits<{
  success: [];
}>();

const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  commonConfig: {
    componentProps: { class: 'w-full' },
  },
  wrapperClass: 'grid-cols-1',
  schema: [
    {
      component: 'Input',
      fieldName: 'projectId',
      label: '项目id',
      dependencies: {
        triggerFields: ['storyStatus'],
        show: false,
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'storyStatus',
      label: '目标状态',
      rules: 'required',
      componentProps: {
        api: () => getLocalDictList('STORY_STATUS'),
      },
    },
    userIdSchema({
      label: $t('dev.story.nextOwner'),
      dependencies: {
        // 流转到 99(已关闭) 时不再需要指定负责人
        rules(values: any) {
          return String(values.storyStatus) === '99' ? null : 'required';
        },
        triggerFields: ['storyStatus', 'projectId'],
      },
    }),
    {
      component: 'RichEditor',
      fieldName: 'changeRichText',
      label: '流转说明',
    },
  ],
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  title: '批量流转需求',
  onConfirm: async () => {
    await formApi.validateAndSubmit();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data: any = modalApi.getData();
      formApi.setValues({ projectId: data.projectId });
    }
  },
});

async function onSubmit(values: Record<string, any>) {
  const { storyIds } = modalApi.getData() as { storyIds: string[] };
  modalApi.lock();
  try {
    await batchNextStoryApi({
      storyIds,
      storyStatus: values.storyStatus,
      userId: values.userId,
      changeRichText: values.changeRichText,
    });
    message.success('批量流转成功');
    modalApi.close();
    emit('success');
  } finally {
    modalApi.unlock();
  }
}
</script>
<template>
  <Modal class="w-[700px]">
    <Form />
  </Modal>
</template>
