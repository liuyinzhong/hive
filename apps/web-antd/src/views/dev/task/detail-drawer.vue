<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

defineOptions({
  name: 'StoryTrackDrawer',
});

const [Drawer, DrawerApi] = useVbenDrawer();
</script>
<template>
  <Drawer title="任务详情" class="w-[600px]"> 详情抽屉 </Drawer>
</template>
