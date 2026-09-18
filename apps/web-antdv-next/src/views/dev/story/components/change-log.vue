<script lang="ts" setup>
import type { DevChangeApi } from '#/api/dev';

import { ref, watch } from 'vue';

import { getChangeListApi } from '#/api/dev';
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

// #region 变更记录
const changeLogList = ref<DevChangeApi.DevChangeFace[]>([]);
watch(
  () => props.businessId,
  (newVal) => {
    if (newVal) {
      getChangeListApi({
        businessId: newVal,
      }).then((res: DevChangeApi.DevChangeFace[]) => {
        changeLogList.value = res || [];
      });
    }
  },
);
// #endregion

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
</style>
