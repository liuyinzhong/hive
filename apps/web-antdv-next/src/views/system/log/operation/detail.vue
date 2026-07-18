<script lang="ts" setup>
import type { SystemLogApi } from '#/api/system';

import { ref } from 'vue';

import { JsonViewer, useVbenDrawer } from '@vben/common-ui';

import {
  Alert,
  Descriptions,
  DescriptionsItem,
  Divider,
  Spin,
} from 'antdv-next';

import { getOperationLogDetailApi } from '#/api/system';
import { $t } from '#/locales';

const detail = ref<SystemLogApi.OperationLogDetail>();
const loading = ref(false);

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const { logId } =
      drawerApi.getData<Pick<SystemLogApi.OperationLog, 'logId'>>();
    loading.value = true;
    try {
      detail.value = await getOperationLogDetailApi(logId);
    } finally {
      loading.value = false;
    }
  },
});

function viewerValue(value: string) {
  if (!value) return {};
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}
</script>

<template>
  <Drawer
    :footer="false"
    :title="$t('system.log.operationDetail')"
    class="w-[min(900px,90vw)]"
  >
    <Spin :spinning="loading">
      <template v-if="detail">
        <Descriptions bordered :column="2" size="small">
          <DescriptionsItem :label="$t('system.log.username')">{{
            detail.username || '-'
          }}</DescriptionsItem>
          <DescriptionsItem :label="$t('system.log.realName')">{{
            detail.realName || '-'
          }}</DescriptionsItem>
          <DescriptionsItem :label="$t('system.log.requestMethod')">{{
            detail.requestMethod
          }}</DescriptionsItem>
          <DescriptionsItem :label="$t('system.log.httpStatus')">{{
            detail.httpStatus
          }}</DescriptionsItem>
          <DescriptionsItem :label="$t('system.log.requestUrl')" :span="2">{{
            detail.requestUrl
          }}</DescriptionsItem>
          <DescriptionsItem :label="$t('system.log.ip')">{{
            detail.ip || '-'
          }}</DescriptionsItem>
          <DescriptionsItem :label="$t('system.log.duration')">{{
            $t('system.log.milliseconds', [detail.durationMs])
          }}</DescriptionsItem>
          <DescriptionsItem :label="$t('system.log.contentType')" :span="2">{{
            detail.contentType || '-'
          }}</DescriptionsItem>
          <DescriptionsItem :label="$t('system.log.userAgent')" :span="2">{{
            detail.userAgent || '-'
          }}</DescriptionsItem>
          <DescriptionsItem :label="$t('system.log.createDate')" :span="2">{{
            detail.createDate
          }}</DescriptionsItem>
        </Descriptions>

        <Alert
          v-if="
            detail.queryTruncated ||
            detail.requestTruncated ||
            detail.responseTruncated
          "
          class="mt-4"
          show-icon
          type="warning"
          :message="$t('system.log.truncatedTip')"
        />

        <Divider>{{ $t('system.log.queryParams') }}</Divider>
        <JsonViewer
          boxed
          copyable
          :expand-depth="3"
          :value="viewerValue(detail.queryParams)"
        />
        <Divider>{{ $t('system.log.requestBody') }}</Divider>
        <JsonViewer
          boxed
          copyable
          :expand-depth="3"
          :value="viewerValue(detail.requestBody)"
        />
        <Divider>{{ $t('system.log.responseBody') }}</Divider>
        <JsonViewer
          boxed
          copyable
          :expand-depth="3"
          :value="viewerValue(detail.responseBody)"
        />
      </template>
    </Spin>
  </Drawer>
</template>
