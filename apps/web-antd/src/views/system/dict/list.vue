<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { Button, message } from 'ant-design-vue';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { $t } from '#/locales';
import type { DictFace } from '#/dicts';
import { getTestData } from './testdata';

import Form from './modules/form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

/**
 * 编辑字典
 * @param row
 */
function onEdit(row: DictFace) {
  formModalApi.setData(row).open();
}

/**
 * 添加下级字典
 * @param row
 */
function onAppend(row: DictFace) {
  formModalApi.setData({ pid: row.id }).open();
}

/**
 * 创建新字典
 */
function onCreate() {
  formModalApi.setData(null).open();
}

/**
 * 删除字典
 * @param row
 */
function onDelete(row: DictFace) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.label]),
    duration: 0,
    key: 'action_process_msg',
  });
  hideLoading();
}

/**
 * 表格操作按钮的回调函数
 */
function onActionClick({ code, row }: OnActionClickParams<DictFace>) {
  switch (code) {
    case 'append': {
      onAppend(row);
      break;
    }
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
  }
}

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents: {},
  gridOptions: {
    data: getTestData(5),
    columns: [
      {
        align: 'left',
        field: 'label',
        title: $t('system.dict.dictName'),
        treeNode: true,
        width: 150,
      },
      {
        field: 'value',
        title: $t('system.dict.value'),
        align: 'left',
      },
      {
        field: 'type',
        title: $t('system.dict.type'),
        align: 'left',
      },
      {
        cellRender: { name: 'CellSwitch' },
        field: 'disabled',
        title: $t('system.dept.status'),
      },

      {
        field: 'remark',
        title: $t('system.dept.remark'),
        align: 'left',
      },
      {
        field: 'color',
        title: 'color',
        cellRender: { name: 'CellTag' },
      },
      {
        field: 'createDate',
        title: $t('system.dept.createDate'),
      },
      {
        align: 'right',
        cellRender: {
          attrs: {
            nameField: 'label',
            nameTitle: $t('system.dict.name'),
            onClick: onActionClick,
          },
          name: 'CellOperation',
          options: [
            {
              code: 'append',
              text: '新增下级',
            },
            'edit', // 默认的编辑按钮
            {
              code: 'delete', // 默认的删除按钮
              disabled: (row: DictFace) => {
                return !!(row.children && row.children.length > 0);
              },
            },
          ],
        },
        field: 'operation',
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: $t('system.dept.operation'),
        width: 200,
      },
    ],
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {},
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      zoom: true,
    },
    treeConfig: {
      parentField: 'pid',
      rowField: 'id',
      transform: false,
    },
  } as VxeTableGridOptions,
});

/**
 * 刷新表格
 */
function refreshGrid() {
  gridApi.query();
}
</script>
<template>
  <Page auto-content-height>
    <FormModal @success="refreshGrid" />
    <Grid table-title="字典列表">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.dict.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
