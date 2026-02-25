<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
  userList: {
    type: Array,
    required: true,
  },
  maxCount: {
    type: Number,
    default: 3,
  },
});

const data: any = computed(() => props.userList);
</script>
<template>
  <a-avatar-group :maxCount="maxCount">
    <a-tooltip
      v-for="item in data"
      :key="item.userId"
      :title="item.realName"
      :overlay-style="{ width: '120px' }"
    >
      <a-avatar :src="item.avatar || undefined" style="background-color: #ccc">
        {{ item.realName?.charAt(0) }}
      </a-avatar>
    </a-tooltip>
  </a-avatar-group>
</template>
