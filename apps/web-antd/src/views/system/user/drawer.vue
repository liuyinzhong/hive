<script lang="ts" setup>
import { ref } from 'vue';
import { useVbenDrawer, useVbenForm } from '@vben/common-ui';
import { message } from 'ant-design-vue';
import { useFormSchema } from './data';

defineOptions({
  name: 'FormModelDemo',
});

const [Drawer, drawerApi] = useVbenDrawer({
  onConfirm: async () => {
    await formApi.validateAndSubmitForm();
    drawerApi.close();

    // 提交表单...
    message.success('提交成功');
  },
  onOpenChange(isOpen: boolean) {
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
