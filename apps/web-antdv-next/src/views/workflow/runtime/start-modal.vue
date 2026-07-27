<script lang="ts" setup>
import type { WorkflowDefinitionApi } from '#/api/workflow';

import { computed, nextTick, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Button, Empty, message, Spin, Tag } from 'antdv-next';

import {
  getAllWorkflowDefinitionsApi,
  startWorkflowInstanceApi,
} from '#/api/workflow';
import { useVbenForm } from '#/adapter/form';
import { $t } from '#/locales';
import {
  FORM_SCHEMA_WRAPPER_CLASS,
  loadVbenFormSchema,
} from '#/utils/form-schema';

import { getWorkflowCategoryText } from '../definition/category';

interface StartableDefinition {
  definition: WorkflowDefinitionApi.WorkflowDefinition;
}

const emit = defineEmits<{ success: [] }>();

const definitions = ref<WorkflowDefinitionApi.WorkflowDefinition[]>([]);
const loading = ref(false);
const selectedDefinitionId = ref<string>();

const [ApplicationForm, applicationFormApi] = useVbenForm({
  schema: [],
  showDefaultActions: false,
  wrapperClass: FORM_SCHEMA_WRAPPER_CLASS,
});

const startableDefinitions = computed<StartableDefinition[]>(() =>
  definitions.value
    .filter((definition) => definition.definitionId && definition.formSchemaId)
    .map((definition) => ({ definition })),
);

const selectedDefinition = computed(() =>
  startableDefinitions.value.find(
    (item) => item.definition.definitionId === selectedDefinitionId.value,
  ),
);

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const selected = selectedDefinition.value;
    if (!selected?.definition.definitionId) {
      message.warning($t('flow.form.runtime.selectApplication'));
      return;
    }
    const { valid } = await applicationFormApi.validate();
    if (!valid) return;
    const variables = await applicationFormApi.getValues();
    modalApi.lock();
    try {
      await startWorkflowInstanceApi({
        definitionId: selected.definition.definitionId,
        variables,
      });
      message.success($t('flow.runtime.instance.startSuccess'));
      modalApi.close();
      emit('success');
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(open) {
    if (!open) return;
    selectedDefinitionId.value = undefined;
    applicationFormApi.setState({ schema: [] });
    await loadDefinitions();
  },
  title: $t('flow.form.runtime.startApplication'),
});

/** 加载所有已发布且绑定有效表单的申请类型。 */
async function loadDefinitions() {
  loading.value = true;
  try {
    definitions.value = await getAllWorkflowDefinitionsApi({ status: '1' });
  } finally {
    loading.value = false;
  }
}

/** 选择申请类型并加载其绑定的 Vben 表单 Schema。 */
async function selectDefinition(item: StartableDefinition) {
  const formSchemaId = item.definition.formSchemaId;
  if (!formSchemaId) return;
  loading.value = true;
  selectedDefinitionId.value = item.definition.definitionId;
  await nextTick();
  try {
    const loaded = await loadVbenFormSchema(formSchemaId);
    applicationFormApi.setState({
      schema: loaded.schema,
      wrapperClass: loaded.wrapperClass,
    });
    await nextTick();
    await applicationFormApi.reset();
  } catch {
    selectedDefinitionId.value = undefined;
    message.error($t('flow.runtime.message.loadFailed'));
  } finally {
    loading.value = false;
  }
}

/** 返回申请类型选择页并清空尚未提交的数据。 */
function backToApplications() {
  selectedDefinitionId.value = undefined;
  applicationFormApi.setState({ schema: [] });
}
</script>

<template>
  <Modal class="w-[780px]">
    <Spin :spinning="loading">
      <div v-if="!selectedDefinition" class="application-catalog">
        <div class="catalog-heading">
          {{ $t('flow.form.runtime.chooseApplication') }}
        </div>
        <Empty
          v-if="startableDefinitions.length === 0"
          :description="$t('flow.form.runtime.noApplications')"
        />
        <div v-else class="application-grid">
          <button
            v-for="item in startableDefinitions"
            :key="item.definition.definitionId"
            class="application-item"
            type="button"
            @click="selectDefinition(item)"
          >
            <span class="application-icon">
              <IconifyIcon class="size-5" icon="lucide:file-pen-line" />
            </span>
            <span class="application-content">
              <strong>{{ item.definition.definitionName }}</strong>
              <span>{{
                item.definition.remark ||
                $t('flow.form.runtime.fillApplication')
              }}</span>
            </span>
            <Tag v-if="item.definition.category">
              {{ getWorkflowCategoryText(item.definition.category) }}
            </Tag>
            <IconifyIcon class="size-4" icon="lucide:chevron-right" />
          </button>
        </div>
      </div>

      <div v-else class="application-form">
        <div class="form-heading">
          <Button type="text" @click="backToApplications">
            <IconifyIcon class="size-4" icon="lucide:arrow-left" />
            {{ $t('flow.form.runtime.changeApplication') }}
          </Button>
          <div>
            <strong>{{ selectedDefinition.definition.definitionName }}</strong>
            <span>{{ selectedDefinition.definition.remark }}</span>
          </div>
        </div>
        <ApplicationForm />
      </div>
    </Spin>
  </Modal>
</template>

<style scoped>
.application-catalog,
.application-form {
  min-height: 360px;
}

.catalog-heading {
  margin-bottom: 14px;
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.application-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.application-item {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto 16px;
  gap: 10px;
  align-items: center;
  min-width: 0;
  min-height: 88px;
  padding: 14px;
  color: hsl(var(--foreground));
  text-align: left;
  cursor: pointer;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 7px;
}

.application-item:hover {
  background: hsl(var(--primary) / 4%);
  border-color: hsl(var(--primary));
}

.application-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 10%);
  border-radius: 6px;
}

.application-content,
.form-heading > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.application-content strong,
.application-content span,
.form-heading strong,
.form-heading span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.application-content span,
.form-heading span {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.form-heading {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding-bottom: 14px;
  margin-bottom: 18px;
  border-bottom: 1px solid hsl(var(--border));
}

.form-heading strong {
  font-size: 15px;
  color: hsl(var(--foreground));
}

@media (max-width: 640px) {
  .application-grid {
    grid-template-columns: 1fr;
  }
}
</style>
