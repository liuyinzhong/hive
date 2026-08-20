<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MedicalRegistrationApi } from '#/api/medical';

import { h } from 'vue';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Input, message, Modal } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  cancelRegistrationApi,
  checkInRegistrationApi,
  completeRegistrationRefundApi,
  confirmRegistrationPaymentApi,
  getRegistrationListApi,
  markRegistrationNoShowApi,
  processRegistrationRefundApi,
  startRegistrationRefundApi,
} from '#/api/medical';
import { $t } from '#/locales';
import { formatSorts } from '#/utils';

import CreateDrawerComponent from './create-drawer.vue';
import { useRegistrationColumns, useRegistrationSearchSchema } from './data';
import DetailDrawerComponent from './detail-drawer.vue';

const { hasAccessByCodes } = useAccess();

const [CreateDrawer, createDrawerApi] = useVbenDrawer({
  connectedComponent: CreateDrawerComponent,
  destroyOnClose: true,
});
const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: DetailDrawerComponent,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['visitDate', ['startDate', 'endDate']]],
    schema: useRegistrationSearchSchema(),
    showCollapseButton: true,
    wrapperClass: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  },
  gridOptions: {
    columns: useRegistrationColumns(),
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, formValues) =>
          getRegistrationListApi({
            ...formValues,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatSorts(sorts),
          }),
      },
    },
    rowConfig: { keyField: 'registrationId' },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<MedicalRegistrationApi.Registration>,
});

function openDetail(row: MedicalRegistrationApi.Registration) {
  detailDrawerApi.setData({ registrationId: row.registrationId }).open();
}

function runAction<T extends MedicalRegistrationApi.Registration>(
  title: string,
  action: () => Promise<T>,
  successMessage?: (result: T) => string,
) {
  Modal.confirm({
    content: title,
    async onOk() {
      const result = await action();
      message.success(
        successMessage?.(result) ?? $t('medical.registration.actionSuccess'),
      );
      await gridApi.query();
    },
    title: $t('common.confirm'),
  });
}

function runReasonAction(
  title: string,
  placeholder: string,
  action: (reason: string) => Promise<MedicalRegistrationApi.Registration>,
) {
  let reason = '';
  Modal.confirm({
    content: () =>
      h(Input.TextArea, {
        maxlength: 512,
        'onUpdate:value': (value?: number | string) => {
          reason = String(value ?? '');
        },
        placeholder,
        rows: 4,
        showCount: true,
      }),
    async onOk() {
      const value = reason.trim();
      if (!value) {
        message.warning(placeholder);
        throw new Error('reason required');
      }
      await action(value);
      message.success($t('medical.registration.actionSuccess'));
      await gridApi.query();
    },
    title,
  });
}

function noShowAvailable(row: MedicalRegistrationApi.Registration) {
  return dayjs(`${row.scheduleDate} ${row.endTime}`).isBefore(dayjs());
}

function actions(row: MedicalRegistrationApi.Registration) {
  const result: Record<string, unknown>[] = [
    {
      auth: 'medical:registration:detail',
      icon: 'lucide:eye',
      onClick: () => openDetail(row),
      text: $t('medical.registration.detail'),
    },
  ];
  if (row.status === 0) {
    result.push(
      {
        auth: 'medical:registration:confirmPayment',
        icon: 'lucide:badge-check',
        onClick: () =>
          runAction($t('medical.registration.confirmPaymentConfirm'), () =>
            confirmRegistrationPaymentApi(row.registrationId),
          ),
        text: $t('medical.registration.confirmPayment'),
      },
      {
        auth: 'medical:registration:cancel',
        icon: 'lucide:x-circle',
        onClick: () =>
          runReasonAction(
            $t('medical.registration.cancel'),
            $t('medical.registration.cancelReasonRequired'),
            (reason) => cancelRegistrationApi(row.registrationId, reason),
          ),
        text: $t('medical.registration.cancel'),
      },
    );
  }
  if (row.status === 10) {
    result.push(
      {
        auth: 'medical:registration:checkIn',
        icon: 'lucide:log-in',
        onClick: () =>
          runAction(
            $t('medical.registration.checkInConfirm'),
            () => checkInRegistrationApi(row.registrationId),
            (result) =>
              $t('medical.registration.checkInSuccess', [
                result.queueInfo.queueSequence,
              ]),
          ),
        text: $t('medical.registration.checkIn'),
      },
      {
        auth: 'medical:registration:noShow',
        disabled: !noShowAvailable(row),
        icon: 'lucide:user-x',
        onClick: () =>
          runAction($t('medical.registration.noShowConfirm'), () =>
            markRegistrationNoShowApi(row.registrationId),
          ),
        text: $t('medical.registration.noShow'),
      },
      {
        auth: 'medical:registration:refundStart',
        icon: 'lucide:undo-2',
        onClick: () =>
          runReasonAction(
            $t('medical.registration.refundStart'),
            $t('medical.registration.refundReasonRequired'),
            (reason) => startRegistrationRefundApi(row.registrationId, reason),
          ),
        text: $t('medical.registration.refundStart'),
      },
    );
  }
  if (row.status === 80) {
    result.push({
      auth: 'medical:registration:refundProcess',
      icon: 'lucide:loader-circle',
      onClick: () =>
        runAction($t('medical.registration.refundProcessConfirm'), () =>
          processRegistrationRefundApi(row.registrationId),
        ),
      text: $t('medical.registration.refundProcess'),
    });
  }
  if (row.status === 90) {
    result.push({
      auth: 'medical:registration:refundComplete',
      icon: 'lucide:circle-dollar-sign',
      onClick: () =>
        runAction($t('medical.registration.refundCompleteConfirm'), () =>
          completeRegistrationRefundApi(row.registrationId),
        ),
      text: $t('medical.registration.refundComplete'),
    });
  }
  return result;
}
</script>

<template>
  <Page auto-content-height>
    <CreateDrawer @success="gridApi.query()" />
    <DetailDrawer />
    <Grid :table-title="$t('medical.registration.list')">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['medical:registration:create'])"
          type="primary"
          @click="createDrawerApi.open()"
        >
          <Plus class="size-5" />
          {{ $t('medical.registration.create') }}
        </Button>
      </template>
      <template #action="{ row }">
        <VbenTableAction :actions="actions(row)" align="center" />
      </template>
    </Grid>
  </Page>
</template>
