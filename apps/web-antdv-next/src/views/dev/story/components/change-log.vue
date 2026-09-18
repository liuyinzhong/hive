<script lang="ts" setup>
import type { DevChangeApi } from '#/api/dev';

import { ref, watch } from 'vue';

import { useAccess } from '@vben/access';
import { prompt } from '@vben/common-ui';
import { VbenTiptap } from '@vben/plugins/tiptap';
import { useUserStore } from '@vben/stores';

import { getChangeListApi, updateChangeApi } from '#/api/dev';
import { getLocalDictText } from '#/dicts';
import { Timeline, TimelineItem, Empty, Tag } from 'antdv-next';
/**
 * 变更记录组件
 * @property {String} businessId - 关联id
 */
const props = defineProps({
  businessId: {
    type: [String],
    required: true,
  },
});

const userStore = useUserStore();
// 当前用户ID,用于判断评论是否本人可编辑
const currentUserId = userStore.userInfo?.userId;
// 编辑评论的原子权限码,未授予时不显示编辑入口
const { hasAccessByCodes } = useAccess();
const canEditComment = hasAccessByCodes(['dev:changeHistory:update']);

// #region 变更记录
const changeLogList = ref<DevChangeApi.DevChangeFace[]>([]);

/**
 * 按业务ID加载变更记录时间线
 */
function loadChangeLog() {
  getChangeListApi({
    businessId: props.businessId,
  }).then((res: DevChangeApi.DevChangeFace[]) => {
    changeLogList.value = res || [];
  });
}

watch(
  () => props.businessId,
  (newVal) => {
    if (newVal) {
      loadChangeLog();
    }
  },
);
// #endregion

/**
 * 判断记录是否为本人创建的评论(可编辑)
 */
function isOwnComment(item: DevChangeApi.DevChangeFace) {
  return (
    item.changeBehavior === '30' &&
    !!item.changeId &&
    !!item.creatorId &&
    item.creatorId === currentUserId
  );
}

/**
 * 编辑自己的评论:富文本弹窗预填原内容,保存后仅保留最新内容,不记录编辑历史
 */
function handleEditComment(item: DevChangeApi.DevChangeFace) {
  prompt({
    component: VbenTiptap,
    defaultValue: item.changeRichText ?? '',
    title: '编辑评论',
    modelPropName: 'modelValue',
    componentProps: {
      placeholder: '请输入内容',
    },
  })
    .then((val) => {
      updateChangeApi(item.changeId!, { changeRichText: val ?? '' }).then(() => {
        loadChangeLog();
      });
    })
    .catch(() => {
      // 取消编辑,不做处理
    });
}

/**
 * 格式化变更明细的旧值/新值展示文本
 * 字典值按 dictType 翻译,翻译不命中(如后端固化的"空")时回退原始文本
 */
function formatChangeValue(
  change: DevChangeApi.ChangeItem,
  side: 'new' | 'old',
) {
  const raw = side === 'old' ? change.oldValue : change.newValue;
  if (change.dictType) {
    return getLocalDictText(change.dictType, raw || '') || raw || '空';
  }
  return raw || '空';
}
</script>
<template>
  <div>
    <Empty v-if="changeLogList.length === 0" />
    <Timeline v-else>
      <TimelineItem v-for="item in changeLogList" :key="item.changeId">
        <div>
          <div>
            {{ item.createDate }}
          </div>
          <Tag>
            {{ item.creatorName }}
            {{ getLocalDictText('CHANGE_BEHAVIOR', item.changeBehavior)
            }}{{ getLocalDictText('BUSINESS_TYPE', item.businessType) }}
          </Tag>
          <a
            v-if="canEditComment && isOwnComment(item)"
            class="comment-edit-link"
            @click="handleEditComment(item)"
          >
            编辑
          </a>
        </div>
        <div v-if="item.changeItems?.length" class="change-items">
          <div
            v-for="change in item.changeItems"
            :key="change.fieldKey"
            class="change-item"
          >
            <span class="change-item-label">{{ change.fieldLabel }}：</span>
            <span v-if="change.oldValue">
              {{ formatChangeValue(change, 'old') }}
            </span>
            <span v-if="change.oldValue && change.newValue" class="change-item-arrow">
              →
            </span>
            <span v-if="change.newValue">
              {{ formatChangeValue(change, 'new') }}
            </span>
          </div>
        </div>
        <div v-html="item.changeRichText"></div>
      </TimelineItem>
    </Timeline>
  </div>
</template>
<style lang="scss" scoped>
.change-items {
  margin: 4px 0;
}

.change-item {
  font-size: 13px;
  line-height: 22px;
}

.change-item-arrow {
  padding: 0 4px;
}

.comment-edit-link {
  margin-left: 8px;
  font-size: 13px;
}
</style>
