<script lang="ts" setup>
const props = defineProps({
  avatar: {
    type: String,
    required: true,
  },
  name: {
    required: true,
  },
});
</script>
<template>
  <a-space :size="5">
    <a-avatar
      :src="avatar"
      size="30"
      style="max-width: 30px; max-height: 30px"
    />
    <a-typography-text
      :ellipsis="{ tooltip: true }"
      :content="name"
      style="width: 60px"
    />
  </a-space>
</template>
