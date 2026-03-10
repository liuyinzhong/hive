<script lang="ts" setup>
import { ref, reactive, nextTick } from 'vue';
import { useVbenModal, EllipsisText } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { useNextFormSchema } from './data';
import { message } from 'ant-design-vue';
import { getLocalDictList } from '#/dicts';
import CommonPhrase from '#/components/CommonPhrase/index.vue';
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
      let data = modalApi.getData();

      formApi.setValues(data);

      /* 设置当前步骤 */
      current.value = stepsItems.findIndex(
        (item: any) => item.value === data.storyStatus,
      );

      /* 禁用已完成的步骤 */
      stepsItems.forEach((item: any, index: number) => {
        item.disabled = index < current.value ? true : false;
      });
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
  emit('success');
}

function setCommentRichText(value: string) {
  formApi.setFieldValue('commentRichText', value);
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
          :textList="[
            '已更新至测试环境',
            '需求开发完成，转由测试验证，已更新至测试环境',
            '测试通过，转由产品验收',
            '产品验收通过，转由业务验收',
            '业务验收通过，可安排发版',
          ]"
          @dblClick="setCommentRichText"
        />
      </a-col>
      <a-col :span="18">
        <Form />
      </a-col>
    </a-row>
  </Modal>
</template>
<style></style>
