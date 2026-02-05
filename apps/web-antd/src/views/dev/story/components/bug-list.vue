<script lang="ts" setup>
import { bugListByStoryId, type DevBugApi } from '#/api/dev';
import { _vNodeDictTag } from '#/dicts';
import { ref } from 'vue';

/**
 * 基本信息组件
 * @property {String} storyId - 需求id
 */
const props = defineProps({
  storyId: {
    type: [String],
    required: true,
  },
});

//#region 获取任务列表
const bugList = ref<DevBugApi.DevBugFace[]>([]);
bugListByStoryId({
  storyId: props.storyId,
}).then((res: DevBugApi.DevBugFace[]) => {
  bugList.value = res || [];
});
//#endregion
</script>
<template>
  <div>
    <a-list
      item-layout="horizontal"
      bordered
      :data-source="bugList"
      size="small"
    >
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta>
            <template #title>
              <a :href="'/dev/bug/detail/' + item.bugNum">
                {{ item.bugTitle }}
              </a>
            </template>

            <template #description>
              <component :is="_vNodeDictTag('BUG_STATUS', item.bugStatus)" />
              <component :is="_vNodeDictTag('BUG_LEVEL', item.bugLevel)" />
              <component :is="_vNodeDictTag('BUG_ENV', item.bugEnv)" />
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
