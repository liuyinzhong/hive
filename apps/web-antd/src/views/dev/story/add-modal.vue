<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { message } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import { useFormSchema } from './data';
import { createStory } from '#/api/dev';
import { filesToUrlString, urlStringToFiles, deepClone } from '#/utils';

defineOptions({
  name: 'StoryAddFormModel',
});

const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  handleValuesChange(_values, fieldsChanged) {
    // message.info(`表单以下字段发生变化：${fieldsChanged.join('，')}`);
  },
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1 md:grid-cols-3',
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  title: '添加需求',
  onConfirm: async () => {
    await formApi.validateAndSubmitForm();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      let data = deepClone(modalApi.getData());
      data.files = urlStringToFiles(data.files || '');
      data.userList = (data.userList ||= []).map((item: any) => item.userId);
      formApi.setValues(data);
    }
  },
});

async function onSubmit(values: Record<string, any>) {
  message.loading({
    content: '正在提交中...',
    duration: 0,
    key: 'is-form-submitting',
  });
  modalApi.lock();

  values.files = filesToUrlString(values.files || []);
  await createStory(values);

  modalApi.close();
  message.success({
    content: `提交成功`,
    duration: 2,
    key: 'is-form-submitting',
  });
}
</script>
<template>
  <Modal class="w-[800px]">
    <Form />
  </Modal>
</template>
