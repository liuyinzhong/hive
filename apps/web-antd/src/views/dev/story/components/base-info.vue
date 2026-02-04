<script lang="ts" setup>
import { type DevStoryApi } from '#/api/dev';
import UserAvatarGroup from '#/adapter/component/table/UserAvatarGroup';
import { _vNodeDictTag } from '#/dicts';

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

let userList = UserAvatarGroup.renderTableDefault(
  { name: 'UserAvatarGroup', props: { size: 'small' } },
  { row: props.storyInfo },
);
</script>
<template>
  <a-descriptions :column="1" bordered size="small">
    <a-descriptions-item label="关联版本">
      {{ storyInfo.version || '-' }}
    </a-descriptions-item>
    <a-descriptions-item label="关联项目">
      {{ storyInfo.projectTitle || '-' }}
    </a-descriptions-item>
    <a-descriptions-item label="关联模块">
      {{ storyInfo.moduleTitle || '-' }}
    </a-descriptions-item>
    <a-descriptions-item label="需求来源">
      <component :is="_vNodeDictTag('STORY_SOURCE', storyInfo.source)" />
    </a-descriptions-item>
    <a-descriptions-item label="需求类型">
      <component :is="_vNodeDictTag('STORY_TYPE', storyInfo.storyType)" />
    </a-descriptions-item>
    <a-descriptions-item label="需求优先级">
      <component :is="_vNodeDictTag('STORY_LEVEL', storyInfo.storyLevel)" />
    </a-descriptions-item>
    <a-descriptions-item label="参与人">
      <component :is="userList" />
    </a-descriptions-item>
  </a-descriptions>
</template>
