<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { getStoryDetail, type SystemStoryApi } from '#/api/dev/story';
import { message } from 'ant-design-vue';

/**
 * 需求详情组件
 * @property {number} storyNum - 需求编号
 */
const props = defineProps({
  storyNum: {
    type: [Number],
    required: true,
  },
});

// 组件挂载时加载详情
onMounted(() => {
  loadStoryDetail();
});

// 监听 storyNum 变化，重新加载详情
watch(
  () => props.storyNum,
  () => {
    loadStoryDetail();
  },
);

/**
 * 需求详情数据
 */
const detail = ref<SystemStoryApi.SystemStory>({
  storyId: '',
  pid: '',
  storyTitle: undefined,
});
const loading = ref(false);

const activeKey = ref('基本信息');

/**
 * 加载需求详情
 */
const loadStoryDetail = () => {
  if (!props.storyNum) {
    message.error('需求编号不能为空');
    return;
  }

  loading.value = true;
  getStoryDetail(props.storyNum)
    .then((res: SystemStoryApi.SystemStory) => {
      if (!res) {
        message.error('获取需求详情失败');
        return;
      }
      detail.value = res;
    })
    .finally(() => {
      loading.value = false;
    });
};
</script>
<template>
  <Page autoContentHeight>
    <div>
      <a-spin v-if="loading" />
      <div v-else>
        <a-row>
          <a-col :span="18">
            <a-typography-paragraph>
              <a-typography-title :level="4">
                <blockquote>
                  #{{ detail.storyNum }} {{ detail.storyTitle }}
                </blockquote>
              </a-typography-title>
            </a-typography-paragraph>
            <div v-html="detail.storyRichText"></div>
          </a-col>
          <a-col :span="6">
            <a-card :bodyStyle="{ padding: '10px' }">
              <a-tabs v-model:activeKey="activeKey">
                <a-tab-pane key="基本信息" tab="基本信息">
                  Content of Tab Pane 1
                </a-tab-pane>
                <a-tab-pane key="关联任务" tab="关联任务">
                  Content of Tab Pane 3
                </a-tab-pane>
                <a-tab-pane key="关联缺陷" tab="关联缺陷">
                  Content of Tab Pane 4
                </a-tab-pane>
              </a-tabs>
            </a-card>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">
            <a-avatar src="https://picsum.photos/100/100"> </a-avatar>
          </a-col>
        </a-row>

        <!-- <ai-editor v-model="detail.storyRichHtml" v-model:text="detail.storyRichText" /> -->
      </div>
    </div>
  </Page>
</template>
