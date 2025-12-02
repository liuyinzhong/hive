<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { getDictList, getDictText } from '#/dicts';

defineOptions({
  name: 'BugTrackDrawer',
});

// 注册插件（关键步骤）
dayjs.extend(relativeTime);

const [Drawer] = useVbenDrawer();

const items = ref([
  {
    changeId: '0',
    changeRichText: '2',
    operatorId: '',
    operatorName: '张三',
    operationTime: '2025-05-26 14:22:31',
    fkId: '',
    fkType: 'story',
    behaviorType: '2',
    extendJson: '',
  },
  {
    changeId: '0',
    changeRichText: '',
    operatorId: '',
    operatorName: '张三',
    operationTime: '2025-05-26 14:22:31',
    fkId: '',
    fkType: 'story',
    behaviorType: '0',
    extendJson: '',
  },
  {
    changeId: '0',
    changeRichText: '<img src="https://picsum.photos/30/30" alt="">',
    operatorId: '',
    operatorName: '张三',
    operationTime: '2025-05-26 14:22:31',
    fkId: '',
    fkType: 'story',
    behaviorType: '1',
    extendJson: '',
  },
]);

const dictList = getDictList('BUG_STATUS');

// 预览状态管理
const previewVisible = ref(false);
const previewImageUrl = ref('');
// 点击事件处理：精准判断是否点击 img 标签
const handleRichTextClick = (e: any) => {
  // 核心：通过 tagName 判断目标元素是否为 IMG（tagName 是大写的）
  const target = e.target;
  if (target.tagName !== 'IMG' || !target.src || target.src === 'about:blank') {
    return;
  }
  const imgSrc = target.src;
  // 打开大图预览
  previewImageUrl.value = imgSrc;
  previewVisible.value = true;
};

// 关闭预览
const handlePreviewClose = (visible: any) => {
  previewVisible.value = visible;
};
</script>
<template>
  <Drawer title="缺陷轨迹" class="w-[600px]">
    <!-- 隐藏的 a-image 用于大图预览 -->
    <a-image
      :preview="{
        visible: previewVisible,
        onVisibleChange: handlePreviewClose,
      }"
      :src="previewImageUrl"
      style="display: none"
    />

    <a-space :size="20">
      <template v-for="item in dictList" :key="item.value">
        <a-tag>{{ item.label }}({{ 22 }})</a-tag>
      </template>
    </a-space>
    <br />
    <br />
    <br />
    <a-timeline>
      <a-timeline-item
        v-for="item in items"
        :key="item.changeId"
        :time="item.operationTime"
      >
        <p>{{ item.operationTime }}</p>
        <span>{{ item.operatorName }}</span>
        <span>{{ getDictText('BEHAVIOR_TYPE', item.behaviorType) }}</span>
        <span>{{ getDictText('CHANGE_TYPE', item.fkType) }}</span>
        <div @click="handleRichTextClick" v-html="item.changeRichText"></div>
      </a-timeline-item>
    </a-timeline>
  </Drawer>
</template>
