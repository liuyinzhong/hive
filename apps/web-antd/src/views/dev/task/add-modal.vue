<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useFormSchema } from './data';
import { createTask } from '#/api/dev/task';

defineOptions({
  name: 'TaskAddFormModel',
});

const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  handleValuesChange(_values, fieldsChanged) {
    if (
      fieldsChanged.includes('projectId') &&
      !_values.openModalSource &&
      !_values.taskId
    ) {
      formApi.setFieldValue('versionId', undefined);
      formApi.setFieldValue('moduleId', undefined);
      formApi.setFieldValue('storyId', undefined);
    }
  },
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-3',
  fieldMappingTime: [
    ['timeArr', ['endDate', 'startDate'], 'YYYY-MM-DD HH:mm:ss'],
  ],
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  title: '添加任务',
  fullscreenButton: false,
  onConfirm: async () => {
    await formApi.validateAndSubmitForm();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      let data = modalApi.getData();
      if (data.taskId) {
        modalApi.setState({
          title: '编辑任务',
        });
      }

      // 设置表单值, 默认会过滤不在schema中定义的field,
      // 可通过filterFields形参关闭过滤 为false的话可以配合 hide属性
      // 可通过 shouldValidate 来控制是否立马校验一次表单值
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
  debugger;
  await createTask(values);
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
