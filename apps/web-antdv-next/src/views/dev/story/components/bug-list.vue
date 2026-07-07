<script lang="ts" setup>
import DictTag from '#/components/DictTag/index.vue';
import { Avatar, Empty } from 'antdv-next';

/**
 * 缺陷列表组件
 * @property {Array} bugList - 缺陷列表数据
 */
const props = defineProps({
  bugList: {
    type: Array<any>,
    default: () => [],
  },
});
</script>
<template>
  <div>
    <Empty v-if="!props.bugList || props.bugList.length === 0" />
    <div v-else class="bug-list">
      <div
        v-for="item in props.bugList"
        :key="item.bugId"
        class="bug-list-item"
      >
        <div class="bug-list-item-avatar">
          <Avatar :src="item.avatar" />
        </div>
        <div class="bug-list-item-content">
          <div class="bug-list-item-title">
            <a target="_blank" :href="`/dev/bug/detail/${item.bugNum}`">
              {{ item.bugTitle }}
            </a>
          </div>
          <div class="bug-list-item-desc">
            <DictTag dict-type="BUG_STATUS" :value="item.bugStatus" />
            <DictTag dict-type="BUG_LEVEL" :value="item.bugLevel" />
            <DictTag dict-type="BUG_ENV" :value="item.bugEnv" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.bug-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bug-list-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

.bug-list-item-avatar {
  flex-shrink: 0;
}

.bug-list-item-content {
  flex: 1;
  min-width: 0;
}

.bug-list-item-title {
  margin-bottom: 6px;
  font-weight: 500;
}

.bug-list-item-desc {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
