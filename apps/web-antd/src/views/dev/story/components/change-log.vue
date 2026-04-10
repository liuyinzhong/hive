<script lang="ts" setup>
import type { DevChangeApi } from '#/api/dev';

import { ref, watch } from 'vue';

import { getChangeList } from '#/api/dev';
import DictTag from '#/components/DictTag/index.vue';
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
      getChangeList({
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
    <a-empty v-if="changeLogList.length === 0" />
    <a-timeline v-else>
      <a-timeline-item v-for="item in changeLogList" :key="item.changeId">
        <div>
          {{ item.createDate }}
          <span style="margin-right: 8px">{{ item.creatorName }}</span>
          <DictTag dict-type="CHANGE_BEHAVIOR" :value="item.changeBehavior" />
          <DictTag dict-type="CHANGE_TYPE" :value="item.businessType" />
        </div>

        <div v-html="item.changeRichText"></div>
      </a-timeline-item>
    </a-timeline>
  </div>
</template>
