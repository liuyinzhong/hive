<script lang="ts" setup>
import { computed } from 'vue';
import { Avatar, AvatarGroup, Tooltip } from 'antdv-next';

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
  <AvatarGroup :max-count="maxCount">
    <Tooltip
      v-for="item in data"
      :key="item.userId"
      :title="item.realName"
      :overlay-style="{ width: '120px' }"
    >
      <Avatar :src="item.avatar || undefined" style="background-color: #ccc">
        {{ item.realName?.charAt(0) }}
      </Avatar>
    </Tooltip>
  </AvatarGroup>
</template>
