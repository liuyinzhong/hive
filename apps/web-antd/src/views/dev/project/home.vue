<script lang="ts" setup>
import addFormModal from './add-modal.vue';
import { EllipsisText } from '@vben/common-ui';
import { AnalysisChartCard, useVbenModal } from '@vben/common-ui';

import { getProjectsList } from '#/api/dev/project';
import { onMounted, reactive, ref } from 'vue';
import type { SystemProjectApi } from '#/api/dev/project';

const [AddProjectModal, AddProjectModalApi] = useVbenModal({
  title: '新增项目',
  connectedComponent: addFormModal,
});

const items = ref<SystemProjectApi.SystemProject[]>([]);

onMounted(async () => {
  const res = await getProjectsList();
  items.value = res || [];
  if (items.value.length > 0) {
    activeProjectId.value = items.value[0]?.projectId || '';
  }
});

let activeProjectId = ref<any>('');

const setActiveProjectId = (id: string) => {
  activeProjectId.value = id;
};
</script>

<template>
  <div class="p-5">
    <div class="mt-5 flex flex-col lg:flex-row">
      <div class="mr-4 w-full lg:w-3/5">
        <div></div>

        <a-card>
          <template #title>
            <div class="flex items-center justify-between">
              <span class="ml-2 text-lg font-medium">项目</span>
              <a-button type="primary" @click="AddProjectModalApi.open()">
                创建项目
              </a-button>
            </div>
          </template>

          <a-card-grid v-for="item in items" :key="item.projectId">
            <div
              class="cursor-pointer"
              @click="setActiveProjectId(item.projectId)"
            >
              <div class="flex items-center">
                <a-avatar
                  :size="45"
                  :src="item.projectLogo"
                  style="min-width: 45px"
                >
                </a-avatar>
                <span class="ml-4 text-lg font-medium">
                  {{ item.projectTitle }}
                </span>
              </div>
              <div class="mt-4">
                <EllipsisText :max-width="500" :line="2" tooltipWhenEllipsis>
                  {{ item.description }}
                </EllipsisText>
              </div>
              <div class="flex justify-between">
                <span>
                  <a-badge
                    v-if="item.projectId === activeProjectId"
                    status="processing"
                  />
                </span>
                <span>{{ item.createTime }}</span>
              </div>
            </div>
          </a-card-grid>
        </a-card>
      </div>
      <div class="w-full lg:w-2/5">
        <AnalysisChartCard class="mt-5" title="数据"> </AnalysisChartCard>
      </div>
    </div>
    <AddProjectModal />
  </div>
</template>
