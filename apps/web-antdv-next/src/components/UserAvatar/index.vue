<script lang="ts" setup>
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';
defineProps({
  avatar: {
    default: '',
    required: false,
    type: String,
  },
  name: {
    default: '',
    required: false,
    type: String,
  },
});
const userStore = useUserStore();
</script>
<template>
  <a-space :size="5">
    <a-avatar
      :src="
        avatar || userStore.userInfo?.avatar || preferences.app.defaultAvatar
      "
      size="30"
      style="max-width: 30px; max-height: 30px"
    />
    <a-typography-text
      v-if="name"
      :ellipsis="{ tooltip: true }"
      :content="name"
      style="width: 60px"
    />
  </a-space>
</template>
