<script lang="ts" setup>
import { computed } from 'vue';
import { useTabs } from '@vben/hooks';
import { Page } from '@vben/common-ui';
import { useRoute } from 'vue-router';
import BugDetail from './components/bug-detail.vue';
import { Card } from 'ant-design-vue';

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
  <Page autoContentHeight>
    <Card>
      <BugDetail :bugNum="bugNum" :showBtn="true" />
    </Card>
  </Page>
</template>
