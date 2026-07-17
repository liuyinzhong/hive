<script lang="ts" setup>
import type { MedicalScheduleApi } from '#/api/medical';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Input, message } from 'antdv-next';

import { stopScheduleApi } from '#/api/medical';
import { $t } from '#/locales';

const emit = defineEmits<{ success: [] }>();
const schedule = ref<MedicalScheduleApi.Schedule>();
const reason = ref('');

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    if (!schedule.value || !reason.value.trim()) {
      message.warning($t('medical.schedule.stopReasonRequired'));
      return;
    }
    modalApi.lock();
    try {
      await stopScheduleApi(schedule.value.scheduleId, reason.value.trim());
      message.success($t('medical.schedule.stopSuccess'));
      modalApi.close();
      emit('success');
    } finally {
      modalApi.unlock();
    }
  },
  onOpenChange(isOpen) {
    if (!isOpen) return;
    schedule.value = modalApi.getData<MedicalScheduleApi.Schedule>();
    reason.value = '';
  },
});
</script>

<template>
  <Modal :title="$t('medical.schedule.stop')">
    <p class="mb-3 text-muted-foreground">
      {{ schedule?.doctorName }} · {{ schedule?.scheduleDate }}
      {{ schedule?.startTime.slice(0, 5) }}–{{ schedule?.endTime.slice(0, 5) }}
    </p>
    <Input.TextArea
      v-model:value="reason"
      :maxlength="512"
      :placeholder="$t('medical.schedule.stopReasonPlaceholder')"
      :rows="4"
      show-count
    />
  </Modal>
</template>
