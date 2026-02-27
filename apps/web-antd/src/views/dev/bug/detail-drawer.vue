<script lang="ts" setup>
import { ref, computed } from 'vue';
import { type DevBugApi } from '#/api/dev';
import { useVbenDrawer } from '@vben/common-ui';
import BugDetail from './components/bug-detail.vue';
import CopyButton from '#/components/CopyButton/index.vue';
defineOptions({
  name: 'BugDetailDrawer',
});

const [Drawer, DrawerApi] = useVbenDrawer({
  confirmText: '新窗口',
  onOpenChange: (open: boolean) => {
    if (open) {
      bugInfo.value = DrawerApi.getData();
    }
  },
  onConfirm: () => {
    window.open(bugLink.value);
  },
});

const bugInfo = ref<DevBugApi.DevBugFace>({});

const bugLink = computed(
  () => location.origin + `/dev/bug/detail/${bugInfo.value.bugNum}`,
);
</script>
<template>
  <Drawer title="缺陷详情" class="w-[45%]">
    <BugDetail :bugNum="bugInfo.bugNum" :showBtn="false" />
    <template #prepend-footer>
      <CopyButton :text="bugLink" type="dashed" />
    </template>
  </Drawer>
</template>
