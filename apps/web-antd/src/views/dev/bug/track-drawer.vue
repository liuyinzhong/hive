<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { getDictList } from '#/dicts';

defineOptions({
  name: 'ExtraTrackDrawer',
});

const [Drawer] = useVbenDrawer();

const items = ref([
  {
    changeType: '0',
    changeRichText: '',
    operatorId: '',
    operatorName: '张三',
    operationTime: '2025-05-26 14:22:31',
    fkType: 'story',
    fkId: '',
    extendJson: '',
  },
]);
</script>
<template>
  <Drawer title="缺陷轨迹" class="w-[600px]">
    <!-- <a-steps direction="vertical" :current="1">
      <a-step
        v-for="(item, index) in items"
        :key="index"
        :title="item.label"
        :sub-title="item.value"
        :description="item.label"
      />
    </a-steps> -->
  </Drawer>
</template>
