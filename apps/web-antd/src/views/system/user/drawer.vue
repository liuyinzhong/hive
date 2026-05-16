<script lang="ts" setup>
import { useVbenDrawer, useVbenForm } from '@vben/common-ui';

import { createUser, updateUser } from '#/api/system';
import { useFormSchema } from './data';

defineOptions({
  name: 'FormModelDemo',
});
const emit = defineEmits<{
  success: [];
}>();

const [Drawer, drawerApi] = useVbenDrawer({
  title: '添加用户',
  onConfirm: async () => {
    const { valid } = await formApi.validate();
    if (valid) {
      const data = await formApi.getValues();
      drawerApi.lock();
      (data.userId ? updateUser(data.userId, data) : createUser(data))
        .then(() => {
          drawerApi.close();
        })
        .catch(() => {
          drawerApi.unlock();
        })
        .finally(() => {
          emit('success');
        });
    }
  },
  onOpenChange: (isOpen: boolean) => {
    if (isOpen) {
      const data = drawerApi.getData();
      formApi.setValues(data);
      if (data.userId) {
        drawerApi.setState({ title: '修改用户' });
      }
    }
  },
});
const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },

  schema: useFormSchema(),
});
</script>
<template>
  <Drawer class="w-[600px]">
    <Form />
  </Drawer>
</template>
