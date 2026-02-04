<script lang="ts" setup>
import { computed } from 'vue';
import { useTabs } from '@vben/hooks';
import { Page } from '@vben/common-ui';
import { useRoute } from 'vue-router';
import StoryDetail from './components/story-detail.vue';

defineOptions({
  name: 'StoryDetail',
});

const route = useRoute();

const { setTabTitle } = useTabs();

const storyNum: any = computed(() => {
  return route.params?.storyNum ?? '-1';
});
setTabTitle(`#${storyNum.value}需求详情`);
</script>
<template>
  <Page autoContentHeight>
    <div class="h-full w-full bg-white p-1">
      <StoryDetail :storyNum="storyNum" />
    </div>
  </Page>
</template>
