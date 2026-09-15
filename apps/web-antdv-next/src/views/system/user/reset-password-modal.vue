<script lang="ts" setup>
import type { SystemUserApi } from '#/api/system';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { resetUserPasswordApi } from '#/api/system';

import { useResetPasswordFormSchema } from './data';

const emit = defineEmits(['success']);
const userData = ref<SystemUserApi.SystemUserFace>();

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  commonConfig: {
    colon: true,
  },
  schema: useResetPasswordFormSchema(),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();

      resetUserPasswordApi(userData.value?.userId ?? '', {
        newPassword: data.newPassword,
      })
        .then(() => {
          message.success('密码已重置，该用户需使用新密码重新登录');
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
      userData.value = modalApi.getData() as
        | SystemUserApi.SystemUserFace
        | undefined;
      formApi.reset();
      modalApi.setState({
        title: `重置密码 - ${userData.value?.realName ?? ''}`,
      });
    }
  },
});
</script>

<template>
  <Modal>
    <Form class="mx-4" />
  </Modal>
</template>
