<script lang="ts" setup>
import { type DevStoryApi } from '#/api/dev';
import UserAvatarGroup from '#/components/UserAvatarGroup/index.vue';
import DictTag from '#/components/DictTag/index.vue';
import { computed } from 'vue';
/**
 * 基本信息组件
 * @property {Object} storyInfo - 需求信息对象
 */
const props = defineProps({
  storyInfo: {
    type: Object as () => DevStoryApi.DevStoryFace,
    required: true,
  },
});

let userList = computed(() => props.storyInfo.userList || []);
</script>
<template>
  <a-descriptions :column="1" bordered size="small">
    <a-descriptions-item label="需求编号">
      <a-tag>#{{ storyInfo.storyNum || '-' }}</a-tag>
    </a-descriptions-item>
    <a-descriptions-item label="关联版本">
      <a-tag>{{ storyInfo.version || '-' }}</a-tag>
    </a-descriptions-item>
    <a-descriptions-item label="关联项目">
      {{ storyInfo.projectTitle || '-' }}
    </a-descriptions-item>
    <a-descriptions-item label="关联模块">
      {{ storyInfo.moduleTitle || '-' }}
    </a-descriptions-item>
    <a-descriptions-item label="需求类型">
      <DictTag dictType="STORY_TYPE" :value="storyInfo.storyType" />
    </a-descriptions-item>
    <a-descriptions-item label="需求优先级">
      <DictTag dictType="STORY_LEVEL" :value="storyInfo.storyLevel" />
    </a-descriptions-item>
    <a-descriptions-item label="需求来源">
      <DictTag dictType="STORY_SOURCE" :value="storyInfo.source" />
    </a-descriptions-item>
    <a-descriptions-item label="参与人">
      <UserAvatarGroup :userList="userList" />
    </a-descriptions-item>
  </a-descriptions>
</template>
