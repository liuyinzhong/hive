<script lang="ts" setup>
import { ref } from 'vue';
import { type DevBugApi } from '#/api/dev';
import { useVbenDrawer } from '@vben/common-ui';
import BugDetail from './components/bug-detail.vue';
defineOptions({
  name: 'BugDetailDrawer',
});

const [Drawer, DrawerApi] = useVbenDrawer({
  cancelText: '关闭',
  confirmText: '新窗口',
  onOpenChange: (open: boolean) => {
    if (open) {
      bugInfo.value = DrawerApi.getData();
    }
  },
  onConfirm: () => {
    window.open(`/dev/bug/detail/${bugInfo.value.bugNum}`);
  },
});

const bugInfo = ref<DevBugApi.DevBugFace>({});
</script>
<template>
  <Drawer title="缺陷详情" class="w-[45%]">
    <BugDetail :bugNum="bugInfo.bugNum" :showBtn="false" />
  </Drawer>
</template>
