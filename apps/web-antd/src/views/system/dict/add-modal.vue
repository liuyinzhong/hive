<script lang="ts" setup>
import { computed, ref } from 'vue';

import { useVbenModal, z } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { $t } from '#/locales';
import type { SystemDictApi } from '#/api/system';
import { useFormSchema } from './data';

const emit = defineEmits(['success']);
const formData = ref<SystemDictApi.SystemDictFace>();

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  commonConfig: {
    colon: true,
    formItemClass: 'col-span-2 md:col-span-1',
  },
  wrapperClass: 'grid-cols-2 gap-x-4',
  schema: useFormSchema(),
  showDefaultActions: false,
});

function resetForm() {
  formApi.resetForm();
  formApi.setValues(formData.value || {});
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();
      console.log(data);
      modalApi.close();
      emit('success');
      modalApi.lock(false);
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<SystemDictApi.SystemDictFace>() || {};
      formData.value = data;
      formApi.setValues(data);
      modalApi.setState({ title: data.id ? '编辑字典' : '添加字典' });
    }
  },
});
</script>

<template>
  <Modal>
    <Form class="mx-4" />
    <template #prepend-footer>
      <div class="flex-auto">
        <Button type="primary" danger @click="resetForm">
          {{ $t('common.reset') }}
        </Button>
      </div>
    </template>
  </Modal>
</template>
