<script lang="ts" setup>
import { ref } from 'vue';
import { useVbenDrawer, useVbenForm } from '@vben/common-ui';
import { message } from 'ant-design-vue';

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

  schema: [
    {
      component: 'Input',
      fieldName: 'username',
      label: '登录用户名',
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'realName',
      label: '用户昵称',
    },
    {
      component: 'Input',
      fieldName: 'avatar',
      label: '用户头像',
    },
    {
      component: 'InputPassword',
      fieldName: 'password',
      label: '密码',
    },
    {
      component: 'Select',
      fieldName: 'depts',
      label: '部门(多选)',
      componentProps: {
        mode: 'multiple',
        options: [
          {
            label: '部门1',
            value: '1',
          },
          {
            label: '部门2',
            value: '2',
          },
        ],
      },
    },
    {
      component: 'Textarea',
      fieldName: 'desc',
      label: '描述',
    },
  ],
});
</script>
<template>
  <Drawer title="组件抽离示例" class="w-[600px]">
    <Form />
  </Drawer>
</template>
