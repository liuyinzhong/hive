<script lang="ts" setup>
import type { PayChannelApi } from '#/api/system';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { createPayChannelApi, updatePayChannelApi } from '#/api/system';
import { $t } from '#/locales';

import { collectExtraConfig, flattenExtraConfig, useFormSchema } from './data';

const emit = defineEmits(['success']);
const formData = ref<PayChannelApi.PayChannelFace>();

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  commonConfig: {
    colon: true,
    formItemClass: 'col-span-2 md:col-span-1',
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  wrapperClass: 'grid-cols-2 gap-x-4',
  schema: useFormSchema(),
  showDefaultActions: false,
});

/** 重置表单为初始数据 */
function resetFormHandler() {
  formApi.reset();
  if (formData.value) {
    formApi.setValues(expandFormValues(formData.value));
  }
}

/**
 * 将接口返回的渠道对象展开为表单值(含 extraConfig 子字段)
 * @param data 接口返回的渠道对象
 */
function expandFormValues(
  data: PayChannelApi.PayChannelFace,
): Record<string, any> {
  const {
    id,
    channelName,
    channelType,
    envMode,
    appId,
    notifyUrl,
    status,
    isDefault,
    remark,
  } = data;
  return {
    id,
    channelName,
    channelType,
    envMode,
    appId,
    notifyUrl,
    status,
    isDefault,
    remark,
    ...flattenExtraConfig(data.extraConfig, data.channelType),
  };
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const values = await formApi.getValues();

      // 收集 extraConfig 子字段为 JSON 字符串
      const extraConfig = collectExtraConfig(values);

      const payload: PayChannelApi.PayChannelMutation = {
        channelName: values.channelName,
        channelType: values.channelType,
        envMode: values.envMode,
        appId: values.appId,
        extraConfig,
        notifyUrl: values.notifyUrl,
        status: values.status,
        isDefault: values.isDefault,
        remark: values.remark,
      };

      (values.id
        ? updatePayChannelApi(values.id, payload)
        : createPayChannelApi(payload)
      )
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
      const data = modalApi.getData<PayChannelApi.PayChannelFace>() || {};
      formData.value = data;
      formApi.setValues(expandFormValues(data));
      modalApi.setState({
        title: data.id
          ? $t('system.payChannel.edit')
          : $t('system.payChannel.create'),
      });
    }
  },
});
</script>

<template>
  <Modal class="w-[1000px]">
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
