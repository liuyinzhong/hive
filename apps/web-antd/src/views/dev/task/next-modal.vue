<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import CommonPhrase from '#/components/CommonPhrase/index.vue';
import { getLocalDictList } from '#/dicts';
import { nextTaskApi } from '#/api/dev/task';

import { useNextFormSchema } from './data';
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

      const taskStatus = modalApi.getData().taskStatus;
      current.value = stepsItems.findIndex(
        (item: any) => item.value === taskStatus,
      );
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
    await nextTaskApi(values.taskId, values);
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
          :text-list="['已完成，已更新至测试环境']"
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
