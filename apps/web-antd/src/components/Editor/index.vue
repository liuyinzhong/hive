<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { VbenTiptap } from '@vben/plugins/tiptap';

import Mention from '@tiptap/extension-mention';

import { getUserListAll } from '#/api/system';

const userList = ref<any[]>([]);

onMounted(async () => {
  userList.value = await _getUserListAll('');
  console.log(userList.value);
  console.log(Mention);
});

/* 获取用户列表 */
const _getUserListAll = async (query: string) => {
  const a = await getUserListAll({ realName: query });
  // return a;
  return a.map((item) => ({
    label: item.realName,
    id: item.userId,
    avatar: item.avatar,
  }));
};
// 暴露方法
defineExpose({});
</script>

<template>
  <div><VbenTiptap v-bind="$attrs" /></div>
</template>

<style></style>
