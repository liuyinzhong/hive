<script lang="ts" setup>
import { useVbenDrawer, useVbenForm } from '@vben/common-ui';
import { useFormSchema } from './data';
import { createUser, updateUser } from '#/api/system';
import { nextTick } from 'vue';
import { sleep } from '#/utils';

defineOptions({
  name: 'FormModelDemo',
});
const emit = defineEmits<{
  success: [];
}>();

const [Drawer, drawerApi] = useVbenDrawer({
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
        });
      emit('success');
    }
  },
  onOpenChange: (isOpen: boolean) => {
    if (isOpen) {
      formApi.setValues(drawerApi.getData());
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
  <Drawer title="添加人员" class="w-[600px]">
    <Form />
  </Drawer>
</template>
