<script lang="ts" setup>
import type { DevBugApi } from '#/api/dev';
import { Descriptions, DescriptionsItem } from 'antdv-next';

import DictTag from '#/components/DictTag/index.vue';
import UserAvatar from '#/components/UserAvatar/index.vue';
/**
 * 基本信息组件
 * @property {Object} bugInfo - 缺陷信息对象
 */
// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps({
  bugInfo: {
    type: Object as () => DevBugApi.DevBugFace,
    required: true,
  },
});
</script>
<template>
  <Descriptions :column="1" bordered size="small">
    <DescriptionsItem label="缺陷编号">
      <Tag>#{{ bugInfo.bugNum || '-' }}</Tag>
    </DescriptionsItem>
    <DescriptionsItem label="关联版本">
      <Tag>{{ bugInfo.version || '-' }}</Tag>
    </DescriptionsItem>
    <DescriptionsItem label="关联项目">
      {{ bugInfo.projectTitle || '-' }}
    </DescriptionsItem>
    <DescriptionsItem label="关联模块">
      {{ bugInfo.moduleTitle || '-' }}
    </DescriptionsItem>
    <DescriptionsItem label="缺陷状态">
      <DictTag dict-type="BUG_STATUS" :value="bugInfo.bugStatus" />
    </DescriptionsItem>
    <DescriptionsItem label="BUG级别">
      <DictTag dict-type="BUG_LEVEL" :value="bugInfo.bugLevel" />
    </DescriptionsItem>
    <DescriptionsItem label="BUG环境">
      <DictTag dict-type="BUG_ENV" :value="bugInfo.bugEnv" />
    </DescriptionsItem>
    <DescriptionsItem label="缺陷类型">
      <DictTag dict-type="BUG_TYPE" :value="bugInfo.bugType" />
    </DescriptionsItem>
    <DescriptionsItem label="缺陷来源">
      <DictTag dict-type="BUG_SOURCE" :value="bugInfo.bugSource" />
    </DescriptionsItem>

    <DescriptionsItem label="修复人">
      <UserAvatar
        :avatar="bugInfo.fixUserInfo?.avatar"
        :name="bugInfo.fixUserInfo?.realName"
      />
    </DescriptionsItem>
    <DescriptionsItem label="验证人">
      <UserAvatar
        :avatar="bugInfo.verifierUserInfo?.avatar"
        :name="bugInfo.verifierUserInfo?.realName"
      />
    </DescriptionsItem>
  </Descriptions>
</template>
