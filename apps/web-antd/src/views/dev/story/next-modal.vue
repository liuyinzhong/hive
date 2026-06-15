<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import CommonPhrase from '#/components/CommonPhrase/index.vue';
import { getLocalDictList } from '#/dicts';
import { nextStoryApi } from '#/api/dev/story';

import { useNextFormSchema } from './data';
defineOptions({
  name: 'StoryNextModal',
});
const emit = defineEmits<{
  success: [];
}>();
const stepsItems: any = getLocalDictList('STORY_STATUS').map((item: any) => ({
  title: item.label,
  description: item.remark,
  value: item.value,
}));
const current = ref(0);
const changeCurrent = (index: number) => {
  current.value = index;
  formApi.setFieldValue('storyStatus', stepsItems[index].value);
};

const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  schema: useNextFormSchema(),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  title: '流转需求',
  onConfirm: async () => {
    await formApi.validateAndSubmitForm();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData();

      formApi.setValues(data);

      /* 设置当前步骤 */
      current.value = stepsItems.findIndex(
        (item: any) => item.value === data.storyStatus,
      );

      /* 禁用已完成的步骤 */
      stepsItems.forEach((item: any, index: number) => {
        item.disabled = index < current.value;
      });
    }
  },
});

async function onSubmit(values: Record<string, any>) {
  const hideLoading = message.loading({
    content: '正在流转中...',
    duration: 0,
  });
  modalApi.lock();
  try {
    await nextStoryApi(values.storyId, values);
    message.success('流转成功');
    modalApi.close();
    emit('success');
  } catch (error) {
  } finally {
    hideLoading();
    modalApi.unlock();
  }
}

function setChangeRichText(value: string) {
  formApi.setFieldValue('changeRichText', value);
}
</script>
<template>
  <Modal class="w-[1000px]">
    <a-row :gutter="24">
      <a-col :span="6">
        <a-steps
          v-model:current="current"
          direction="vertical"
          @change="changeCurrent"
          :items="stepsItems"
        />
        <a-divider dashed>常用语(双击)</a-divider>
        <CommonPhrase
          :text-list="[
            '已更新至测试环境',
            '需求开发完成，转由测试验证，已更新至测试环境',
            '测试通过，转由产品验收',
            '产品验收通过，转由业务验收',
            '业务验收通过，可安排发版',
          ]"
          @dbl-click="setChangeRichText"
        />
      </a-col>
      <a-col :span="18">
        <Form />
      </a-col>
    </a-row>
  </Modal>
</template>
<style></style>
