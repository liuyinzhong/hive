<script lang="ts" setup>
import type { DevStoryApi } from '#/api/dev';
import { getTaskStatusOptions } from '#/views/workflow/runtime/data';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Descriptions, DescriptionsItem, Tag } from 'antdv-next';
import DictTag from '#/components/DictTag/index.vue';
import UserAvatarGroup from '#/components/UserAvatarGroup/index.vue';
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

const router = useRouter();

const userList = computed(() => props.storyInfo.userList || []);

/**
 * 跳转流程实例详情页
 */
const goWorkflowDetail = () => {
  const instanceId = props.storyInfo.workflowInstanceId;
  if (instanceId) {
    router.push(`/workflow/instance/detail/${instanceId}`);
  }
};
</script>
<template>
  <Descriptions :column="1" bordered size="small">
    <DescriptionsItem label="需求编号">
      <Tag>#{{ storyInfo.storyNum || '-' }}</Tag>
    </DescriptionsItem>
    <DescriptionsItem label="关联流程">
      <template v-if="storyInfo.workflowInstanceNo">
        <a class="workflow-link" @click="goWorkflowDetail">
          {{ storyInfo.workflowInstanceNo }}
        </a>
        {{
          getTaskStatusOptions().find(
            (item) => item.value === storyInfo.workflowStatus,
          )?.label || '-'
        }}
      </template>
      <template v-else>-</template>
    </DescriptionsItem>
    <DescriptionsItem label="关联版本">
      <Tag>{{ storyInfo.version || '-' }}</Tag>
    </DescriptionsItem>
    <DescriptionsItem label="关联项目">
      {{ storyInfo.projectTitle || '-' }}
    </DescriptionsItem>
    <DescriptionsItem label="关联模块">
      {{ storyInfo.moduleTitle || '-' }}
    </DescriptionsItem>
    <DescriptionsItem label="需求类型">
      <DictTag dict-type="STORY_TYPE" :value="storyInfo.storyType" />
    </DescriptionsItem>
    <DescriptionsItem label="需求优先级">
      <DictTag dict-type="STORY_LEVEL" :value="storyInfo.storyLevel" />
    </DescriptionsItem>
    <DescriptionsItem label="需求来源">
      <DictTag dict-type="STORY_SOURCE" :value="storyInfo.source" />
    </DescriptionsItem>
    <DescriptionsItem label="参与人">
      <UserAvatarGroup :user-list="userList" />
    </DescriptionsItem>
  </Descriptions>
</template>
