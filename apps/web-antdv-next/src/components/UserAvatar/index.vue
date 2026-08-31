<script lang="ts" setup>
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';
import { Avatar, TypographyText, Space } from 'antdv-next';
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
  <Space :size="5">
    <Avatar
      :src="avatar || preferences.app.defaultAvatar"
      :size="30"
      style="max-width: 30px; max-height: 30px"
    />
    <TypographyText
      v-if="name"
      :ellipsis="{ tooltip: true }"
      style="width: 60px"
    >
      {{ name }}
    </TypographyText>
    <TypographyText v-else> -- </TypographyText>
  </Space>
</template>
