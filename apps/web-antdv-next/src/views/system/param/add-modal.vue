<script lang="ts" setup>
import type { SystemParamApi } from '#/api/system';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { createParamApi, updateParamApi } from '#/api/system';
import { $t } from '#/locales';

import { useFormSchema } from './data';

const emit = defineEmits(['success']);
const formData = ref<SystemParamApi.SystemParamFace>();

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

/** 重置表单为初始数据 */
function resetFormHandler() {
  formApi.reset();
  formApi.setValues(formData.value || {});
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();

      // paramValue 统一转换为字符串(后端按字符串存储,InputNumber/RadioGroup 等控件可能返回非字符串)
      if (data.paramValue != null) {
        data.paramValue = String(data.paramValue);
      }

      (data.id ? updateParamApi(data.id, data) : createParamApi(data))
        .then(() => {
          modalApi.close();
          emit('success');
        })
        .catch(() => {})
        .finally(() => {
          modalApi.unlock();
        });
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data =
        modalApi.getData<SystemParamApi.SystemParamFace>() || {};
      formData.value = data;
      formApi.setValues(data);
      modalApi.setState({
        title: data.id
          ? $t('system.param.edit')
          : $t('system.param.create'),
      });
    }
  },
});
</script>

<template>
  <Modal>
    <Form class="mx-4" />
    <template #prepend-footer>
      <div class="flex-auto">
        <Button type="primary" danger @click="resetFormHandler">
          {{ $t('common.reset') }}
        </Button>
      </div>
    </template>
  </Modal>
</template>
