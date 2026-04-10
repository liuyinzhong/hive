<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useTabs } from '@vben/hooks';

import { Card } from 'ant-design-vue';

import StoryDetail from './components/story-detail.vue';

defineOptions({
  name: 'StoryDetail',
});

const route = useRoute();

const { setTabTitle } = useTabs();

const storyNum: any = computed(() => {
  return route.params?.storyNum ?? '-1';
});
setTabTitle(`需求详情 #${storyNum.value}`);
</script>
<template>
  <Page auto-content-height>
    <Card>
      <StoryDetail :story-num="storyNum" :show-btn="true" />
    </Card>
  </Page>
</template>
