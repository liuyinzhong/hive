<script lang="ts" setup>
import type { SystemUserApi } from "#/api/system/user";

import { computed, ref } from "vue";

import { useVbenDrawer, VbenDescriptions } from "@vben/common-ui";

import { $t } from "#/locales";

import { useDescriptionItems } from "./data";

const detailData = ref<SystemUserApi.SystemUserFace>();

const items = computed(() => useDescriptionItems(detailData.value));

const [Drawer, drawerApi] = useVbenDrawer<SystemUserApi.SystemUserFace>({
  onOpenChange(isOpen) {
    if (isOpen) {
      detailData.value = drawerApi.getData();
    }
  },
});
</script>
<template>
  <Drawer :footer="false" :title="$t('common.detail')">
    <VbenDescriptions bordered :column="1" :items="items" />
  </Drawer>
</template>
