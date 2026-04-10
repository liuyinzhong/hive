<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createBug, updateBug } from '#/api/dev';
import CommonPhrase from '#/components/CommonPhrase/index.vue';
import { getLocalDictList } from '#/dicts';

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
      if (formData.value.openModalSource === 'confirmBug') {
        modalApi.setState({ title: '缺陷确认' });
      }

      /* if (formData.value.openModalSource === 'confirmBug') {
        formApi.updateSchema([{ fieldName: 'bugConfirmStatus', hide: true }]);
      } else {
        formApi.updateSchema([{ fieldName: 'bugStatus', hide: true }]);
      } */

      formApi.setValues(data);

      /* 设置当前步骤 */
      current.value = stepsItems.findIndex(
        (item: any) => item.value === data.bugStatus,
      );
    }
  },
});

function onSubmit(values: Record<string, any>) {
  modalApi.lock();
  (values.bugId ? updateBug(values.bugId, values) : createBug(values))
    .then(() => {
      modalApi.close();
    })
    .catch(() => {
      modalApi.unlock();
    });
  emit('success');
}
// #endregion

function setChangeRichText(value: string) {
  formApi.setFieldValue('changeRichText', value);
}
</script>
<template>
  <Modal
    :class="
      formData.openModalSource === 'confirmBug' ? 'w-[800px]' : 'w-[1000px]'
    "
  >
    <a-row :gutter="24">
      <a-col :span="6">
        <div v-if="formData.openModalSource === 'next'">
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
        </div>
      </a-col>
      <a-col :span="formData.openModalSource === 'confirmBug' ? 24 : 18">
        <Form />
      </a-col>
    </a-row>
  </Modal>
</template>
