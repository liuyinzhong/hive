<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { PayChannelApi } from '#/api/system';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Tag } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  deletePayChannelApi,
  getPayChannelListApi,
  updatePayChannelDefaultApi,
  updatePayChannelStatusApi,
} from '#/api/system';
import { $t } from '#/locales';

import addFormModal from './add-modal.vue';
import { useColumns, useGridFormSchema } from './data';
import { formatSorts } from '#/utils';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: addFormModal,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    wrapperClass:
      'sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4',
    showCollapseButton: false,
    schema: useGridFormSchema(),
  },
  gridOptions: {
    columns: useColumns(),
    height: 'auto',
    keepSource: true,
    sortConfig: {
      remote: true,
      multiple: true,
    },
    proxyConfig: {
      sort: true,
      ajax: {
        query: async (
          { page, sorts }: any,
          formValues: Recordable<any>,
        ) => {
          return await getPayChannelListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatSorts(sorts),
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      zoom: true,
      custom: true,
      refresh: true,
    },
  } as VxeTableGridOptions<PayChannelApi.PayChannelFace>,
});

/**
 * 编辑支付渠道
 * @param row 当前行
 */
function onEdit(row: PayChannelApi.PayChannelFace) {
  formModalApi.setData(row).open();
}

/**
 * 创建新支付渠道
 */
function onCreate() {
  formModalApi.setData({}).open();
}

/**
 * 删除支付渠道
 * @param row 当前行
 */
function onDelete(row: PayChannelApi.PayChannelFace) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.channelName]),
    duration: 0,
    key: 'action_process_msg',
  });
  deletePayChannelApi([row.id as string])
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.channelName]),
        key: 'action_process_msg',
      });
      refreshGrid();
    })
    .catch(() => {
      hideLoading();
    });
}

/**
 * 切换启用状态
 * @param row 当前行
 */
function onToggleStatus(row: PayChannelApi.PayChannelFace) {
  const next = row.status === 1 ? 0 : 1;
  updatePayChannelStatusApi(row.id as string, next as 0 | 1)
    .then(() => {
      message.success($t('ui.actionMessage.updateSuccess'));
      refreshGrid();
    })
    .catch(() => {});
}

/**
 * 设为默认
 * @param row 当前行
 */
function onSetDefault(row: PayChannelApi.PayChannelFace) {
  updatePayChannelDefaultApi(row.id as string, 1)
    .then(() => {
      message.success($t('ui.actionMessage.updateSuccess'));
      refreshGrid();
    })
    .catch(() => {});
}

/** 刷新表格 */
function refreshGrid() {
  gridApi.query();
}

/** 环境模式标签颜色 */
function envModeColor(envMode: string): string {
  const map: Record<string, string> = {
    development: 'default',
    testing: 'blue',
    staging: 'orange',
    production: 'red',
  };
  return map[envMode] ?? 'default';
}

/** 环境模式标签文案(已翻译) */
function envModeLabel(envMode: string): string {
  const map: Record<string, string> = {
    development: $t('system.payChannel.development'),
    testing: $t('system.payChannel.testing'),
    staging: $t('system.payChannel.staging'),
    production: $t('system.payChannel.production'),
  };
  return map[envMode] ?? envMode;
}
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="refreshGrid" />
    <Grid>
      <template #channelType="{ row }">
        <Tag :color="row.channelType === 'wechat' ? 'green' : 'blue'">
          {{
            row.channelType === 'wechat'
              ? $t('system.payChannel.wechat')
              : $t('system.payChannel.alipay')
          }}
        </Tag>
      </template>
      <template #envMode="{ row }">
        <Tag :color="envModeColor(row.envMode)">
          {{ envModeLabel(row.envMode) }}
        </Tag>
      </template>
      <template #status="{ row }">
        <Tag :color="row.status === 1 ? 'green' : 'default'">
          {{
            row.status === 1
              ? $t('system.payChannel.enabled')
              : $t('system.payChannel.disabled')
          }}
        </Tag>
      </template>
      <template #isDefault="{ row }">
        <Tag :color="row.isDefault === 1 ? 'gold' : 'default'">
          {{
            row.isDefault === 1
              ? $t('system.payChannel.yes')
              : $t('system.payChannel.no')
          }}
        </Tag>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              text: $t('system.payChannel.edit'),
              icon: 'lucide:edit',
              onClick: () => onEdit(row),
            },
          ]"
          :dropdown-actions="[
            {
              text:
                row.status === 1
                  ? $t('system.payChannel.disable')
                  : $t('system.payChannel.enable'),
              icon:
                row.status === 1 ? 'lucide:pause' : 'lucide:play',
              onClick: () => onToggleStatus(row),
            },
            {
              text: $t('system.payChannel.setDefault'),
              icon: 'lucide:star',
              ifShow: () => row.isDefault !== 1,
              onClick: () => onSetDefault(row),
            },
            {
              text: $t('system.payChannel.delete'),
              icon: 'lucide:trash-2',
              danger: true,
              popConfirm: {
                title: $t('ui.actionMessage.deleteConfirm', [
                  row.channelName,
                ]),
                confirm: () => onDelete(row),
              },
            },
          ]"
          align="center"
        />
      </template>
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.payChannel.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>

