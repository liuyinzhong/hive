<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { getDictList } from '#/dicts';

defineOptions({
  name: 'FormModelDemo',
});

const [Drawer] = useVbenDrawer();

const items: any = ref(getDictList('STORY_STATUS'));
</script>
<template>
  <Drawer title="组件抽离示例" class="w-[600px]">
    <a-steps direction="vertical" :current="1">
      <a-step
        v-for="(item, index) in items"
        :key="index"
        :title="item.label"
        :sub-title="item.value"
        :description="item.label"
      />
    </a-steps>
  </Drawer>
</template>
