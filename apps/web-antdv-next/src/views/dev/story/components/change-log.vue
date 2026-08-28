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
        <div v-html="item.changeRichText"></div>
      </TimelineItem>
    </Timeline>
  </div>
</template>
