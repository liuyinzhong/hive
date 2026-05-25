<script lang="ts" setup>
import type { DevBugApi } from '#/api/dev';

import { ref } from 'vue';

import DictTag from '#/components/DictTag/index.vue';

/**
 * 基本信息组件
 * @property {String} storyId - 需求id
 */
const props = defineProps({
  bugList: {
    type: [String],
    required: true,
  },
});
</script>
<template>
  <div>
    <a-list
      item-layout="horizontal"
      bordered
      :data-source="props.bugList"
      size="small"
    >
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta>
            <template #title>
              <a :href="`/dev/bug/detail/${item.bugNum}`">
                {{ item.bugTitle }}
              </a>
            </template>

            <template #description>
              <DictTag dict-type="BUG_STATUS" :value="item.bugStatus" />
              <DictTag dict-type="BUG_LEVEL" :value="item.bugLevel" />
              <DictTag dict-type="BUG_ENV" :value="item.bugEnv" />
            </template>

            <template #avatar>
              <a-avatar :src="item.avatar" />
            </template>
          </a-list-item-meta>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>
