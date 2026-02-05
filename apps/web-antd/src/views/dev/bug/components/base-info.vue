<script lang="ts" setup>
import UserAvatar from '#/components/UserAvatar/index.vue';
import { type DevBugApi } from '#/api/dev';
import DictTag from '#/components/DictTag/index.vue';
/**
 * 基本信息组件
 * @property {Object} bugInfo - 缺陷信息对象
 */
const props = defineProps({
  bugInfo: {
    type: Object as () => DevBugApi.DevBugFace,
    required: true,
  },
});
</script>
<template>
  <a-descriptions :column="1" bordered size="small">
    <a-descriptions-item label="缺陷编号">
      <a-tag>#{{ bugInfo.bugNum || '-' }}</a-tag>
    </a-descriptions-item>
    <a-descriptions-item label="关联版本">
      <a-tag>{{ bugInfo.version || '-' }}</a-tag>
    </a-descriptions-item>
    <a-descriptions-item label="关联项目">
      {{ bugInfo.projectTitle || '-' }}
    </a-descriptions-item>
    <a-descriptions-item label="关联模块">
      {{ bugInfo.moduleTitle || '-' }}
    </a-descriptions-item>
    <a-descriptions-item label="缺陷状态">
      <DictTag dictType="BUG_STATUS" :value="bugInfo.bugStatus" />
    </a-descriptions-item>
    <a-descriptions-item label="BUG级别">
      <DictTag dictType="BUG_LEVEL" :value="bugInfo.bugLevel" />
    </a-descriptions-item>
    <a-descriptions-item label="BUG环境">
      <DictTag dictType="BUG_ENV" :value="bugInfo.bugEnv" />
    </a-descriptions-item>
    <a-descriptions-item label="缺陷类型">
      <DictTag dictType="BUG_TYPE" :value="bugInfo.bugType" />
    </a-descriptions-item>
    <a-descriptions-item label="缺陷来源">
      <DictTag dictType="BUG_SOURCE" :value="bugInfo.bugSource" />
    </a-descriptions-item>

    <a-descriptions-item label="修复人">
      <UserAvatar :avatar="bugInfo.avatar" :name="bugInfo.realName" />
    </a-descriptions-item>
  </a-descriptions>
</template>
