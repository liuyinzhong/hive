<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useVbenModal } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { useNextFormSchema } from './data';
import { message } from 'ant-design-vue';
import { getLocalDictList } from '#/dicts';
import CommonPhrase from '#/components/CommonPhrase/index.vue';
defineOptions({
  name: 'TaskNextModal',
});

const emit = defineEmits<{
  success: [];
}>();

const stepsItems: any = getLocalDictList('TASK_STATUS').map((item: any) => ({
  title: item.label,
  description: item.remark,
  value: item.value,
}));
const current = ref(0);
const changeCurrent = (index: number) => {
  current.value = index;
  formApi.setFieldValue('taskStatus', stepsItems[index].value);
};

const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  schema: useNextFormSchema(),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  title: '流转任务',
  onConfirm: async () => {
    await formApi.validateAndSubmitForm();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      formApi.setValues(modalApi.getData());

      let taskStatus = modalApi.getData().taskStatus;
      current.value = stepsItems.findIndex(
        (item: any) => item.value === taskStatus,
      );
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
          :textList="['已完成，已更新至测试环境']"
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
