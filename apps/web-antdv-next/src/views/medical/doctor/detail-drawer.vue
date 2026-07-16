<script lang="ts" setup>
import type { MedicalDoctorApi } from '#/api/medical';

import { computed, ref } from 'vue';

import { useVbenDrawer, VbenDescriptions } from '@vben/common-ui';

import { Avatar, Divider, Spin } from 'antdv-next';

import { getDoctorDetailApi } from '#/api/medical';
import { $t } from '#/locales';

import {
  useDoctorBasicDescriptionItems,
  useDoctorPracticeDescriptionItems,
} from './data';

const detail = ref<MedicalDoctorApi.Doctor>();
const loading = ref(false);
const basicItems = computed(() => useDoctorBasicDescriptionItems(detail.value));
const practiceItems = computed(() =>
  useDoctorPracticeDescriptionItems(detail.value),
);

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const data = drawerApi.getData<Pick<MedicalDoctorApi.Doctor, 'doctorId'>>();
    loading.value = true;
    try {
      detail.value = await getDoctorDetailApi(data.doctorId);
    } finally {
      loading.value = false;
    }
  },
});
</script>

<template>
  <Drawer :footer="false" :title="$t('medical.doctor.detail')">
    <Spin :spinning="loading">
      <template v-if="detail">
        <div class="mb-6 flex items-center gap-4">
          <Avatar :size="72" :src="detail.avatar">{{ detail.name }}</Avatar>
          <div>
            <div class="text-lg font-semibold">{{ detail.name }}</div>
            <div class="text-muted-foreground">{{ detail.doctorNo }}</div>
          </div>
        </div>

        <Divider>{{ $t('medical.doctor.basicInformation') }}</Divider>
        <VbenDescriptions
          bordered
          :column="1"
          :items="basicItems"
          size="small"
        />

        <Divider>{{ $t('medical.doctor.practiceInformation') }}</Divider>
        <VbenDescriptions
          bordered
          :column="1"
          :items="practiceItems"
          size="small"
        />
      </template>
    </Spin>
  </Drawer>
</template>
