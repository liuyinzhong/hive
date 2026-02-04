<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { getStoryDetail, type DevStoryApi } from '#/api/dev/story';
import { message } from 'ant-design-vue';
import AiEditor from '#/components/aieditor/index.vue';
import BaseInfo from './base-info.vue';
/**
 * 需求详情组件
 * @property {number} storyNum - 需求编号
 */
const props = defineProps({
  storyNum: {
    type: [Number, String],
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
const detail = ref<DevStoryApi.DevStoryFace>({});
const loading = ref(false);

const activeKey = ref('基本信息');

/* 评论接口请求参数 */
const params = ref<DevStoryApi.DevStoryFace>({
  storyNum: props.storyNum,
});

/**
 * 加载需求详情
 */
const loadStoryDetail = () => {
  if (!props.storyNum) {
    message.error('需求编号不能为空');
    return;
  }

  loading.value = true;
  getStoryDetail(Number(props.storyNum))
    .then((res: DevStoryApi.DevStoryFace) => {
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
                  <BaseInfo :storyInfo="detail" />
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
            <AiEditor
              v-model="params.storyRichText"
              width="100%"
              height="300px"
            />
            <a-button type="primary" block>提交</a-button>
          </a-col>
        </a-row>
      </div>
    </div>
  </Page>
</template>
