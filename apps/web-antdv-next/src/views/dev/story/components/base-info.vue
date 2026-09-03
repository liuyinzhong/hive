<script lang="ts" setup>
import type { DevStoryApi } from '#/api/dev';
import { getTaskStatusOptions } from '#/views/workflow/runtime/data';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Descriptions, DescriptionsItem, Tag } from 'antdv-next';
import DictTag from '#/components/DictTag/index.vue';
import UserAvatar from '#/components/UserAvatar/index.vue';
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
const thisUser = computed(() => props.storyInfo.thisUser);
// 关联流程列表:按绑定时间倒序,含自动发起的需求流程和审批落地创建的来源审批实例
const workflowInstances = computed(
  () => props.storyInfo.workflowInstances ?? [],
);

/**
 * 跳转流程实例详情页
 */
const goWorkflowDetail = (instanceId: string) => {
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
      <div v-if="workflowInstances.length" class="workflow-list">
        <div
          v-for="item in workflowInstances"
          :key="item.bindingId"
          class="workflow-item"
        >
          <a class="workflow-link" @click="goWorkflowDetail(item.instanceId)">
            {{ item.instanceNo }}
          </a>
          <span class="workflow-definition">{{ item.definitionName }}</span>
          <span>
            {{
              getTaskStatusOptions().find(
                (option) => option.value === item.status,
              )?.label || '-'
            }}
          </span>
        </div>
      </div>
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
    <DescriptionsItem label="当前负责人">
      <UserAvatar
        :avatar="thisUser?.avatar ?? ''"
        :name="thisUser?.realName ?? ''"
      />
    </DescriptionsItem>
    <DescriptionsItem label="参与人">
      <UserAvatarGroup :user-list="userList" />
    </DescriptionsItem>
  </Descriptions>
</template>

<style scoped>
.workflow-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.workflow-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.workflow-definition {
  color: hsl(var(--muted-foreground));
}
</style>
