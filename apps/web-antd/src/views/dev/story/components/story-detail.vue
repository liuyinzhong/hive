<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  getStoryDetail,
  getChangeList,
  type DevStoryApi,
  type DevChangeApi,
} from '#/api/dev';
import { getLocalDictList, getLocalDictText } from '#/dicts';
import { message } from 'ant-design-vue';
import { useTabs } from '@vben/hooks';
import {
  Page,
  VbenButton,
  VbenButtonGroup,
  VbenCheckButtonGroup,
  useVbenModal,
  alert,
  confirm,
} from '@vben/common-ui';

import AiEditor from '#/components/aieditor/index.vue';
import BaseInfo from './base-info.vue';
import addTaskModal from '#/views/dev/task/add-modal.vue';
import addBugModal from '#/views/dev/bug/add-modal.vue';
import nextModal from '#/views/dev/story/next-modal.vue';
import addFormModal from '#/views/dev/story/add-modal.vue';

const { closeCurrentTab } = useTabs();

// 跳转路由
const router = useRouter();

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
        router.push({ name: 'FallbackNotFound' });
        return;
      }
      detail.value = res;

      loadChangeLogList(detail.value.storyId as string);
    })
    .finally(() => {
      loading.value = false;
    });
};

//#region 按钮点击事件
const onBtnClick = (btnType: string) => {
  switch (btnType) {
    case '添加任务':
      AddTaskModalApi.setData({
        storyId: detail.value.storyId,
        projectId: detail.value.projectId,
        versionId: detail.value.versionId,
        moduleId: detail.value.moduleId,
        openModalSource: 'storyListAddBtn',
      }).open();
      break;
    case '添加缺陷':
      AddBugModalApi.setData({
        storyId: detail.value.storyId,
        projectId: detail.value.projectId,
        versionId: detail.value.versionId,
        moduleId: detail.value.moduleId,
        openModalSource: 'storyListAddBtn',
      }).open();
      break;
    case '流转按钮':
      NextModalApi.setData(detail.value).open();
      break;
    case '编辑按钮':
      AddFormModalApi.setData(detail.value).open();
      break;
    case '删除按钮':
      confirm({
        title: '删除确认',
        content: '删除该需求吗?',
        icon: 'error',
        beforeClose({ isConfirm }) {
          if (isConfirm) {
            // 这里可以执行一些异步操作。如果最终返回了false，将阻止关闭弹窗
            return new Promise((resolve) =>
              setTimeout(() => {
                // 模拟删除操作
                closeCurrentTab();
                resolve(true);
              }, 2000),
            );
          }
        },
      })
        .then(() => {
          message.success('删除按钮');
        })
        .catch(() => {
          message.error('取消删除');
        });
      break;
    default:
      message.error('未知操作');
      break;
  }
};
//#endregion

//#region 弹窗引用

const [AddFormModal, AddFormModalApi] = useVbenModal({
  title: '添加需求',
  connectedComponent: addFormModal,
  destroyOnClose: true,
});

const [NextModal, NextModalApi] = useVbenModal({
  title: '流转需求',
  connectedComponent: nextModal,
  destroyOnClose: true,
});

const [AddTaskModal, AddTaskModalApi] = useVbenModal({
  title: '添加任务',
  connectedComponent: addTaskModal,
  destroyOnClose: true,
});

const [AddBugModal, AddBugModalApi] = useVbenModal({
  title: '添加缺陷',
  connectedComponent: addBugModal,
  destroyOnClose: true,
});

//#endregion

//#region 变更记录
const changeLogList = ref<DevChangeApi.DevChangeFace[]>([]);

/**
 * 加载变更记录
 */
const loadChangeLogList = (storyId: string) => {
  if (!storyId) {
    return;
  }

  getChangeList({
    fkId: storyId,
    fkType: 0,
  }).then((res: DevChangeApi.DevChangeFace[]) => {
    changeLogList.value = res || [];
  });
};

//#endregion
</script>
<template>
  <div v-spinning="loading">
    <div>
      <a-row>
        <a-col :span="18">
          <a-typography-paragraph>
            <a-typography-title :level="4">
              <blockquote>
                #{{ detail.storyNum }} {{ detail.storyTitle }}
              </blockquote>
            </a-typography-title>
          </a-typography-paragraph>

          <!-- 富文本内容 -->
          <div v-html="detail.storyRichText" style="min-height: 300px"></div>
          <div v-html="detail.storyRichText" style="min-height: 300px"></div>
          <div v-html="detail.storyRichText" style="min-height: 300px"></div>
          <div v-html="detail.storyRichText" style="min-height: 300px"></div>
        </a-col>
        <a-col :span="6">
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
          <br />
          <div>
            <a-typography-paragraph>
              <a-typography-title :level="5">
                <blockquote>变更记录</blockquote>
              </a-typography-title>
            </a-typography-paragraph>
            <a-empty v-if="changeLogList.length === 0" />
            <a-timeline v-else>
              <a-timeline-item
                v-for="item in changeLogList"
                :key="item.changeId"
              >
                <p>{{ item.createDate }}</p>
                <span style="margin-right: 8px">{{ item.creatorName }}</span>
                <a-tag>
                  {{ getLocalDictText('CHANGE_BEHAVIOR', item.changeType)
                  }}{{ getLocalDictText('CHANGE_TYPE', item.fkType) }}
                </a-tag>
                <div v-html="item.changeRichText"></div>
              </a-timeline-item>
            </a-timeline>
          </div>
          <br />
        </a-col>
      </a-row>
    </div>

    <a-affix :offset-bottom="30">
      <div class="text-center">
        <VbenButtonGroup border size="large">
          <VbenButton @click="onBtnClick('添加任务')">
            <span class="icon-[lucide--badge-plus]"></span>
          </VbenButton>
          <VbenButton @click="onBtnClick('添加缺陷')">
            <span class="icon-[lucide--bug]"></span>
          </VbenButton>
          <VbenButton @click="onBtnClick('流转按钮')">
            <span class="icon-[lucide--redo-dot]"></span>
          </VbenButton>
          <VbenButton @click="onBtnClick('编辑按钮')">
            <span class="icon-[lucide--pencil-line]"></span>
          </VbenButton>
          <VbenButton @click="onBtnClick('删除按钮')">
            <span class="icon-[lucide--trash-2]"></span>
          </VbenButton>
        </VbenButtonGroup>
      </div>
    </a-affix>

    <!-- <AiEditor v-model="params.storyRichText" width="100%" height="300px" /> -->
    <AddFormModal />
    <NextModal />
    <AddTaskModal />
    <AddBugModal />
  </div>
</template>
