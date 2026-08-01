<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { VbenFormSchema } from '#/adapter/form';
import type { SystemMenuApi } from '#/api/system';

import { h, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { Page } from '@vben/common-ui';

import { Button, Card, message } from 'antdv-next';

import { useVbenForm, z } from '#/adapter/form';
import {
  createMenuMessageDemoApi,
  getMenuListApi,
  getUserListAllApi,
} from '#/api/system';
import { $t } from '#/locales';

type MenuTreeOption = Omit<SystemMenuApi.SystemMenuFace, 'children'> & {
  children?: MenuTreeOption[];
  disabled?: boolean;
};

function buildMenuOptions(
  menus: SystemMenuApi.SystemMenuFace[],
): MenuTreeOption[] {
  return menus.map((menu) => {
    const children = menu.children ? buildMenuOptions(menu.children) : [];
    return {
      ...menu,
      children,
      disabled: menu.type === 'catalog' || children.length > 0,
    };
  });
}

async function getMessageMenuOptions() {
  const menus = await getMenuListApi({ status: 1 });
  return buildMenuOptions(menus);
}

const formLoading = ref(false);

const schema: VbenFormSchema[] = [
  {
    component: 'ApiSelect',
    componentProps: {
      api: getUserListAllApi,
      class: 'w-full',
      labelField: 'realName',
      maxTagCount: 3,
      mode: 'multiple',
      optionFilterProp: 'label',
      resultField: '',
      showSearch: true,
      valueField: 'userId',
    },
    fieldName: 'userIds',
    label: $t('system.message.user'),
    rules: 'required',
  },
  {
    component: 'ApiTreeSelect',
    componentProps: {
      allowClear: true,
      api: getMessageMenuOptions,
      class: 'w-full',
      filterTreeNode(input: string, node: Recordable<any>) {
        if (!input) {
          return true;
        }
        const title = String(node.meta?.title ?? '');
        return title.includes(input) || $t(title).includes(input);
      },
      labelField: 'meta.title',
      labelFn(item: MenuTreeOption) {
        const title = item.meta?.title;
        const icon = item.meta?.icon;
        if (!title) {
          return '';
        }
        return h('div', { class: 'flex items-center gap-1' }, [
          icon ? h(IconifyIcon, { class: 'size-4', icon }) : null,
          h('span', {}, $t(title)),
        ]);
      },
      showSearch: true,
      treeDefaultExpandAll: true,
      valueField: 'id',
      childrenField: 'children',
    },
    fieldName: 'pid',
    help: $t('system.message.menuHelp'),
    label: $t('system.message.menu'),
    rules: 'required',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      max: 1000,
      min: 1,
      precision: 0,
    },
    fieldName: 'count',
    label: $t('system.message.count'),
    rules: z.number().int().min(1).max(1000),
  },
];

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'vertical',
  schema,
  showDefaultActions: false,
});

async function handleSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return;
  }

  formLoading.value = true;
  try {
    const values = await formApi.getValues();
    await createMenuMessageDemoApi({
      count: values.count,
      menuId: values.pid,
      userIds: values.userIds,
    });
    message.success($t('system.message.createSuccess'));
    formApi.reset();
  } finally {
    formLoading.value = false;
  }
}
</script>

<template>
  <Page auto-content-height>
    <Card :title="$t('system.message.title')" class="mx-auto w-full max-w-2xl">
      <Form />
      <div class="mt-4 flex justify-end">
        <Button :loading="formLoading" type="primary" @click="handleSubmit">
          {{ $t('system.message.create') }}
        </Button>
      </div>
    </Card>
  </Page>
</template>
