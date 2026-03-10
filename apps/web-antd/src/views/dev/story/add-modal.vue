<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { message } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import { useFormSchema } from './data';
import { createStory, updateStory } from '#/api/dev';
import { filesToUrlString, urlStringToFiles, deepClone } from '#/utils';

defineOptions({
  name: 'StoryAddFormModel',
});
const emit = defineEmits<{
  success: [];
}>();
const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  handleValuesChange(_values, fieldsChanged) {
    if (fieldsChanged.includes('projectId')) {
      formApi.setFieldValue('versionId', undefined);
      formApi.setFieldValue('moduleId', undefined);
    }
  },
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  wrapperClass: 'grid-cols-3',
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
      if (data.storyId) {
        modalApi.setState({ title: '编辑需求' });
      }
      formApi.setValues(data);
    }
  },
});

async function onSubmit(values: Record<string, any>) {
  modalApi.lock();
  values.files = filesToUrlString(values.files || []);
  (values.storyId ? updateStory(values.storyId, values) : createStory(values))
    .then(() => {
      modalApi.close();
    })
    .catch(() => {
      modalApi.unlock();
    });

  emit('success');
}
</script>
<template>
  <Modal class="w-[1000px]">
    <Form />
  </Modal>
</template>
