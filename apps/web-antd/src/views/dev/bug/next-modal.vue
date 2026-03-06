<script lang="ts" setup>
import { ref, computed } from 'vue';
import { createBug, updateBug } from '#/api/dev';
import { useVbenModal, VbenCheckButtonGroup } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { useNextFormSchema } from './data';
import { message } from 'ant-design-vue';

import { getLocalDictList } from '#/dicts';

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

//#region
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
      let data = modalApi.getData();
      formData.value = data;
      if (formData.value.openModalSource === 'confirmBug') {
        modalApi.setState({ title: '缺陷确认' });
      }
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
//#endregion
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
        </div>
      </a-col>
      <a-col :span="formData.openModalSource === 'confirmBug' ? 24 : 18">
        <Form />
      </a-col>
    </a-row>
  </Modal>
</template>
