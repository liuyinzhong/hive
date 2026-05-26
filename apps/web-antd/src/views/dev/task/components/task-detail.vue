<script lang="ts" setup>
import type { DevTaskApi } from '#/api/dev';

import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import {
  confirm,
  prompt,
  useVbenModal,
  VbenButton,
  VbenButtonGroup,
} from '@vben/common-ui';
import { useTabs, useRefresh } from '@vben/hooks';
import { VbenTiptap } from '@vben/plugins/tiptap';

import { message } from 'ant-design-vue';

import { getTaskDetailApi, addChangeApi } from '#/api/dev';
import ChangeLog from '#/views/dev/story/components/change-log.vue';
import addFormModal from '#/views/dev/task/add-modal.vue';
import nextModal from '#/views/dev/task/next-modal.vue';

import BaseInfo from './base-info.vue';

/**
 * 任务详情组件
 * @property {number} taskNum - 任务编号
 */
const props = defineProps({
  taskNum: {
    type: [Number],
    required: true,
  },
  showBtn: {
    type: Boolean,
    required: true,
  },
});

const { closeCurrentTab } = useTabs();
const { refresh } = useRefresh();
// 跳转路由
const router = useRouter();

// 组件挂载时加载详情
onMounted(() => {
  loadTaskDetail();
});

// 监听 taskNum 变化，重新加载详情
watch(
  () => props.taskNum,
  () => {
    loadTaskDetail();
  },
);

/**
 * 任务详情数据
 */
const detail = ref<DevTaskApi.DevTaskFace>({});
const loading = ref(false);

const activeKey = ref('变更日志');

/**
 * 加载任务详情
 */
const loadTaskDetail = () => {
  if (!props.taskNum) {
    message.error('任务编号不能为空');
    return;
  }

  loading.value = true;
  getTaskDetailApi(Number(props.taskNum))
    .then((res: DevTaskApi.DevTaskFace) => {
      if (!res) {
        router.push({ name: 'FallbackNotFound' });
        return;
      }
      detail.value = res;
    })
    .finally(() => {
      loading.value = false;
    });
};

// #region 按钮点击事件
const onBtnClick = (btnType: string) => {
  switch (btnType) {
    case '流转按钮': {
      NextModalApi.setData(detail.value).open();
      break;
    }
    case '添加评论': {
      prompt({
        component: VbenTiptap,
        content: '',
        title: '添加评论',
        modelPropName: 'modelValue',
        componentProps: {
          placeholder: '请输入内容',
        },
      }).then((val) => {
        const _params = {
          businessId: detail.value.taskId,
          businessType: '10',
          changeBehavior: '30',
          changeRichText: val,
        };
        addChangeApi(_params).then(() => {
          refresh();
        });
      });
      break;
    }
    case '编辑按钮': {
      AddFormModalApi.setData(detail.value).open();
      break;
    }
    default: {
      message.error('未知操作');
      break;
    }
  }
};
// #endregion

// #region 弹窗引用
const [AddFormModal, AddFormModalApi] = useVbenModal({
  title: '添加任务',
  connectedComponent: addFormModal,
  destroyOnClose: true,
});

const [NextModal, NextModalApi] = useVbenModal({
  title: '流转任务',
  connectedComponent: nextModal,
  destroyOnClose: true,
});
// #endregion

// 暴露方法
defineExpose({
  loadTaskDetail,
});
</script>
<template>
  <div v-spinning="loading">
    <div>
      <a-row>
        <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="16" :xxl="16">
          <a-typography-paragraph>
            <a-typography-title :level="4">
              <blockquote>
                {{ detail.taskTitle }}
              </blockquote>
            </a-typography-title>
          </a-typography-paragraph>

          <!-- 富文本内容 -->
          <div v-html="detail.taskRichText" style="min-height: 300px"></div>
        </a-col>
        <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="8" :xxl="8">
          <a-tabs v-model:active-key="activeKey">
            <a-tab-pane key="变更日志" tab="变更日志">
              <ChangeLog :business-id="detail.taskId ?? ''" />
            </a-tab-pane>
            <a-tab-pane key="基本信息" tab="基本信息">
              <BaseInfo :task-info="detail" />
            </a-tab-pane>
          </a-tabs>
        </a-col>
      </a-row>
    </div>

    <a-affix :offset-bottom="30" v-if="showBtn">
      <div class="text-center">
        <VbenButtonGroup border size="large">
          <VbenButton @click="onBtnClick('添加评论')" class="cursor-pointer">
            <span class="icon-[lucide--message-circle-plus]"></span>
          </VbenButton>
          <VbenButton
            @click="onBtnClick('流转按钮')"
            class="cursor-pointer"
            :disabled="detail.taskStatus === '99'"
          >
            <span class="icon-[lucide--redo-dot]"></span>
          </VbenButton>
          <VbenButton
            @click="onBtnClick('编辑按钮')"
            class="cursor-pointer"
            :disabled="detail.taskStatus === '99'"
          >
            <span class="icon-[lucide--pencil-line]"></span>
          </VbenButton>
        </VbenButtonGroup>
      </div>
    </a-affix>

    <AddFormModal />
    <NextModal />
  </div>
</template>
