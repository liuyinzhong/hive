<script lang="ts" setup>
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
</script>
<template>
  <Space :size="5">
    <Avatar :src="avatar" style="max-width: 30px; max-height: 30px">
      {{ name?.charAt(0) }}
    </Avatar>
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
