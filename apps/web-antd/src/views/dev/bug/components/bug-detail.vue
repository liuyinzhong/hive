<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  getBugDetail,
  getChangeList,
  type DevBugApi,
  type DevChangeApi,
} from '#/api/dev';
import { getLocalDictText } from '#/dicts';
import { message } from 'ant-design-vue';
import { useTabs } from '@vben/hooks';
import {
  VbenButton,
  VbenButtonGroup,
  useVbenModal,
  confirm,
} from '@vben/common-ui';

import AiEditor from '#/components/aieditor/index.vue';
import BaseInfo from './base-info.vue';
import nextModal from '#/views/dev/bug/next-modal.vue';
import addFormModal from '#/views/dev/bug/add-modal.vue';

const { closeCurrentTab } = useTabs();

// 跳转路由
const router = useRouter();

/**
 * 缺陷详情组件
 * @property {number} bugNum - 缺陷编号
 */
const props = defineProps({
  bugNum: {
    required: true,
  },
  showBtn: {
    type: Boolean,
    required: true,
  },
});

// 组件挂载时加载详情
onMounted(() => {
  loadBugDetail();
});

// 监听 bugNum 变化，重新加载详情
watch(
  () => props.bugNum,
  () => {
    loadBugDetail();
  },
);

/**
 * 缺陷详情数据
 */
const detail = ref<DevBugApi.DevBugFace>({});
const loading = ref(false);

const activeKey = ref('基本信息');

/**
 * 加载缺陷详情
 */
const loadBugDetail = () => {
  if (!props.bugNum) {
    message.error('缺陷编号不能为空');
    return;
  }

  loading.value = true;
  getBugDetail(Number(props.bugNum))
    .then((res: DevBugApi.DevBugFace) => {
      if (!res) {
        router.push({ name: 'FallbackNotFound' });
        return;
      }
      detail.value = res;

      loadChangeLogList(detail.value.bugId as string);
    })
    .finally(() => {
      loading.value = false;
    });
};

//#region 按钮点击事件
const onBtnClick = (btnType: string) => {
  switch (btnType) {
    case '流转按钮':
      NextModalApi.setData(detail.value).open();
      break;
    case '编辑按钮':
      AddFormModalApi.setData(detail.value).open();
      break;
    case '删除按钮':
      confirm({
        title: '删除确认',
        content: '删除该任务吗?',
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
  title: '添加任务',
  connectedComponent: addFormModal,
  destroyOnClose: true,
});

const [NextModal, NextModalApi] = useVbenModal({
  title: '流转任务',
  connectedComponent: nextModal,
  destroyOnClose: true,
});
//#endregion

//#region 变更记录
const changeLogList = ref<DevChangeApi.DevChangeFace[]>([]);
const loadChangeLogList = (taskId: string) => {
  if (!taskId) {
    return;
  }

  getChangeList({
    fkId: taskId,
    fkType: 20,
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
        <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="16" :xxl="16">
          <a-typography-paragraph>
            <a-typography-title :level="4">
              <blockquote>
                {{ detail.bugTitle }}
              </blockquote>
            </a-typography-title>
          </a-typography-paragraph>

          <!-- 富文本内容 -->
          <div v-html="detail.bugRichText" style="min-height: 300px"></div>
          <div v-html="detail.bugRichText" style="min-height: 300px"></div>
          <div v-html="detail.bugRichText" style="min-height: 300px"></div>
        </a-col>
        <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="8" :xxl="8">
          <a-tabs v-model:activeKey="activeKey">
            <a-tab-pane key="基本信息" tab="基本信息">
              <BaseInfo :bugInfo="detail" />
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
                <div>
                  {{ item.createDate }}
                  <span style="margin-right: 8px">{{ item.creatorName }}</span>
                  <a-tag>
                    {{ getLocalDictText('CHANGE_BEHAVIOR', item.changeType) }}
                    {{ getLocalDictText('CHANGE_TYPE', item.fkType) }}
                  </a-tag>
                </div>

                <div v-html="item.changeRichText"></div>
              </a-timeline-item>
            </a-timeline>
          </div>
          <br />
        </a-col>
      </a-row>
    </div>

    <a-affix :offset-bottom="30" v-if="showBtn">
      <div class="text-center">
        <VbenButtonGroup border size="large">
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

    <AddFormModal />
    <NextModal />
  </div>
</template>
