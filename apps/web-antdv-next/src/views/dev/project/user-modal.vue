<script lang="ts" setup>
import type { DevProjectUserApi } from '#/api/dev';
import type { VbenFormSchema } from '#/adapter/form';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { getUserListAllApi } from '#/api/system';
import {
  getProjectUsersApi,
  saveProjectUsersApi,
} from '#/api/dev';
import { $t } from '#/locales';

defineOptions({
  name: 'ProjectUserModal',
});

const emit = defineEmits<{
  success: [];
}>();

const projectId = ref('');

/**
 * 项目用户管理表单schema:数组字段,每行=用户
 */
function useFormSchema(): VbenFormSchema[] {
  return [
    {
      arrayProps: {
        addButtonText: $t('dev.project.addUser'),
        createRow: () => ({
          userId: '',
        }),
        max: 50,
        min: 0,
      },
      children: [
        {
          component: 'ApiSelect',
          componentProps: {
            allowClear: true,
            api: () => getUserListAllApi(),
            labelField: 'realName',
            valueField: 'userId',
            resultField: 'items',
            showSearch: true,
            filterOption: true,
            optionFilterProp: 'label',
          },
          fieldName: 'userId',
          label: $t('dev.project.user'),
          rules: 'required',
        },
      ],
      fieldName: 'users',
      label: $t('dev.project.userManagement'),
      formItemClass: 'col-span-2 items-baseline',
      type: 'array',
    },
  ];
}

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: { class: 'w-full' },
  },
  handleSubmit: onSubmit,
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  title: $t('dev.project.userManagement'),
  class: 'w-[700px]',
  onConfirm: async () => {
    await formApi.validateAndSubmit();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data: any = modalApi.getData();
      projectId.value = data.projectId;
      loadUsers(data.projectId);
    }
  },
});

/**
 * 加载项目用户并回显
 */
async function loadUsers(pid: string) {
  const res = await getProjectUsersApi(pid);
  const users = (res || []).map((item: DevProjectUserApi.ProjectUserFace) => ({
    userId: item.userId,
  }));
  formApi.setValues({ users }, true, true);
}

/**
 * 提交保存:校验用户不重复后全量提交
 */
async function onSubmit(values: Record<string, any>) {
  const users = (values.users || []).map(
    (item: { userId: string }) => ({
      userId: item.userId,
    }),
  );

  /* 校验用户不重复 */
  const seen = new Set<string>();
  for (const u of users) {
    if (seen.has(u.userId)) {
      message.error($t('dev.project.userDuplicate'));
      return;
    }
    seen.add(u.userId);
  }

  modalApi.lock();
  try {
    await saveProjectUsersApi({ projectId: projectId.value, users });
    message.success($t('dev.project.saveSuccess'));
    modalApi.close();
    emit('success');
  } catch {
    // 错误由请求拦截器处理
  } finally {
    modalApi.unlock();
  }
}
</script>

<template>
  <Modal>
    <Form />
  </Modal>
</template>
