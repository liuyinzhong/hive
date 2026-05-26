<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { nextBugApi } from '#/api/dev/bug';
import CommonPhrase from '#/components/CommonPhrase/index.vue';
import { getLocalDictList } from '#/dicts';
import { message } from 'ant-design-vue';
import { useNextFormSchema } from './data';
defineOptions({
  name: 'BugNextModal',
});
const emit = defineEmits<{
  success: [];
}>();

const formData = ref<any>({});

const stepsItems: any = getLocalDictList('BUG_STATUS').map((item: any) => ({
  title: item.label,
  description: item.remark,
  value: item.value,
}));
const current = ref(0);
const changeCurrent = (index: number) => {
  current.value = index;
  formApi.setFieldValue('bugStatus', stepsItems[index].value);
};

// #region
const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  schema: useNextFormSchema(),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  title: '流转缺陷',
  onConfirm: async () => {
    await formApi.validateAndSubmitForm();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData();
      formData.value = data;
      formApi.setValues(data);

      /* 设置当前步骤 */
      current.value = stepsItems.findIndex(
        (item: any) => item.value === data.bugStatus,
      );
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
    await nextBugApi(values.bugId, values);
    message.success('流转成功');
    modalApi.close();
    emit('success');
  } finally {
    hideLoading();
    modalApi.unlock();
  }
}
// #endregion

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
            '已修复，已更新至测试环境',
            '测试验证完毕，已关闭',
            '非BUG，已关闭',
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
