<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useTabs } from '@vben/hooks';

import { Card } from 'ant-design-vue';

import BugDetail from './components/bug-detail.vue';

defineOptions({
  name: 'BugDetail',
});

const route = useRoute();

const { setTabTitle } = useTabs();

const bugNum: any = computed(() => {
  return route.params?.bugNum ?? '-1';
});
setTabTitle(`缺陷详情 #${bugNum.value}`);
</script>
<template>
  <Page auto-content-height>
    <Card>
      <BugDetail :bug-num="bugNum" :show-btn="true" />
    </Card>
  </Page>
</template>
