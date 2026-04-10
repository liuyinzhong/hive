<script lang="ts" setup>
import type { DevStoryApi } from '#/api/dev';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import AiEditor from '#/components/AiEditor/index.vue';
import CopyButton from '#/components/CopyButton/index.vue';
import UserAvatar from '#/components/UserAvatar/index.vue';

import StoryDetail from './components/story-detail.vue';

defineOptions({
  name: 'StoryTrackDrawer',
});

/**
 * 抽屉实例
 */
const [Drawer, DrawerApi] = useVbenDrawer({
  showCancelButton: false,
  showConfirmButton: false,
  onOpenChange: (open: boolean) => {
    if (open) {
      storyInfo.value = DrawerApi.getData();
    }
  },
});

/**
 * 当前打开的需求信息
 */
const storyInfo = ref<DevStoryApi.DevStoryFace>({});

const storyLink = computed(
  () => location.origin + `/dev/story/detail/${storyInfo.value.storyNum}`,
);

const newTab = () => {
  window.open(storyLink.value);
};

const changeRichTextRef = ref<any>();
const submit = () => {
  DrawerApi.lock();
  setTimeout(() => {
    const params = {
      businessId: storyInfo.value.storyId,
      businessType: 0,
      changeBehavior: 20,
      changeRichText: changeRichTextRef.value?.aiEditor()?.getHtml() || '',
    };
    console.log(params);
    DrawerApi.unlock();
    DrawerApi.close();
  }, 1000);
};
</script>
<template>
  <Drawer title="需求详情" class="w-[45%]">
    <template #extra>
      <a-space size="small">
        <CopyButton :text="storyLink" type="dashed" />
        <a-button @click="newTab" type="dashed">
          <a-flex align="center" :gap="5">
            <span class="icon-[lucide--app-window] size-4"></span>
            <span>新窗口</span>
          </a-flex>
        </a-button>
      </a-space>
    </template>
    <StoryDetail :story-num="storyInfo.storyNum" :show-btn="false" />
    <template #prepend-footer>
      <div class="w-full">
        <a-flex align="start" :gap="5" class="w-full mb-2">
          <UserAvatar />
          <AiEditor
            width="100%"
            height="100%"
            :show-toolbar="false"
            ref="changeRichTextRef"
          />
        </a-flex>
        <div class="w-full flex justify-end">
          <a-button type="primary" @click="submit">提交</a-button>
        </div>
      </div>
    </template>
  </Drawer>
</template>
