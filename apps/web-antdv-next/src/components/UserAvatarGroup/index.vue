<script lang="ts" setup>
import { computed } from 'vue';
import { Avatar, AvatarGroup, Tooltip } from 'antdv-next';
interface UserAvatarGroup {
  avatar: string;
  realName: string;
  userId: string;
}

const props = defineProps({
  userList: {
    type: Array<UserAvatarGroup>,
    required: true,
  },
  maxCount: {
    type: Number,
    default: 3,
  },
});

const data: any = computed(() => props.userList);
const isEmpty = computed(() => !data.value || data.value.length === 0);
</script>
<template>
  <span v-if="isEmpty"> -- </span>
  <AvatarGroup v-else :max-count="maxCount">
    <Tooltip
      v-for="item in data"
      :key="item.userId"
      :title="item.realName"
      :overlay-style="{ width: '120px' }"
    >
      <Avatar :src="item.avatar" style="background-color: #ccc">
        {{ item.realName?.charAt(0) }}
      </Avatar>
    </Tooltip>
  </AvatarGroup>
</template>
