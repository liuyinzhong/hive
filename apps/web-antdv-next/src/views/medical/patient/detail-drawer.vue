<script lang="ts" setup>
import type { MedicalPatientApi } from '#/api/medical';

import { computed, ref } from 'vue';

import { useVbenDrawer, VbenDescriptions } from '@vben/common-ui';

import { Divider, Spin } from 'antdv-next';

import { getPatientDetailApi } from '#/api/medical';
import { $t } from '#/locales';

import {
  usePatientBasicDescriptionItems,
  usePatientContactDescriptionItems,
} from './data';

const detail = ref<MedicalPatientApi.Patient>();
const loading = ref(false);
const basicItems = computed(() =>
  usePatientBasicDescriptionItems(detail.value),
);
const contactItems = computed(() =>
  usePatientContactDescriptionItems(detail.value),
);

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const data =
      drawerApi.getData<Pick<MedicalPatientApi.Patient, 'patientId'>>();
    loading.value = true;
    try {
      detail.value = await getPatientDetailApi(data.patientId);
    } finally {
      loading.value = false;
    }
  },
});
</script>

<template>
  <Drawer :footer="false" :title="$t('medical.patient.detail')">
    <Spin :spinning="loading">
      <template v-if="detail">
        <Divider>{{ $t('medical.patient.basicInformation') }}</Divider>
        <VbenDescriptions
          bordered
          :column="1"
          :items="basicItems"
          size="small"
        />

        <Divider>{{ $t('medical.patient.contactInformation') }}</Divider>
        <VbenDescriptions
          bordered
          :column="1"
          :items="contactItems"
          size="small"
        />
      </template>
    </Spin>
  </Drawer>
</template>
