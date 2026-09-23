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
import { getLocalDictText } from '#/dicts';
import {
  applyFieldPermissions,
  parseStartFieldPermissions,
  pickVariablesByPermission,
} from './field-permission';
import type { WorkflowFieldPermissions } from './field-permission';

const emit = defineEmits<{ success: [] }>();

const definitions = ref<WorkflowDefinitionApi.WorkflowDefinition[]>([]);
const loading = ref(false);
const selectedDefinitionId = ref<string>();
// 当前申请的发起节点字段权限与字段全集,提交时用于剔除隐藏字段
const startFieldPermissions = ref<WorkflowFieldPermissions>({});
const startFieldNames = ref<string[]>([]);

const [ApplicationForm, applicationFormApi] = useVbenForm({
  schema: [],
  showDefaultActions: false,
  wrapperClass: FORM_SCHEMA_WRAPPER_CLASS,
});

const startableDefinitions = computed<WorkflowDefinitionApi.WorkflowDefinition[]>(
  () =>
    definitions.value.filter(
      (definition) => definition.definitionId && definition.formSchemaId,
    ),
);

const selectedDefinition = computed(() =>
  startableDefinitions.value.find(
    (definition) => definition.definitionId === selectedDefinitionId.value,
  ),
);

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const selected = selectedDefinition.value;
    if (!selected?.definitionId) {
      message.warning($t('flow.form.runtime.selectApplication'));
      return;
    }
    const { valid } = await applicationFormApi.validate();
    if (!valid) return;
    const rawValues = await applicationFormApi.getValues();
    // 按发起节点字段权限剔除隐藏字段,避免其默认值被意外提交
    const variables = pickVariablesByPermission(
      rawValues,
      startFieldNames.value,
      startFieldPermissions.value,
      ['editable', 'readonly'],
      'editable',
    );
    modalApi.lock();
    try {
      await startWorkflowInstanceApi({
        definitionId: selected.definitionId,
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
    startFieldPermissions.value = {};
    startFieldNames.value = [];
    applicationFormApi.setState({ schema: [] });
    await loadDefinitions();
  },
  title: $t('flow.form.runtime.startApplication'),
});

/** 加载所有已发布、绑定有效表单的手动发起流程(被动触发流程由业务对象发起,不出现在申请入口)。 */
async function loadDefinitions() {
  loading.value = true;
  try {
    definitions.value = await getAllWorkflowDefinitionsApi({
      status: '1',
      startType: '0',
    });
  } finally {
    loading.value = false;
  }
}

/** 选择申请类型并按发起节点字段权限加载其绑定的 Vben 表单 Schema。 */
async function selectDefinition(definition: WorkflowDefinitionApi.WorkflowDefinition) {
  const formSchemaId = definition.formSchemaId;
  if (!formSchemaId) return;
  loading.value = true;
  selectedDefinitionId.value = definition.definitionId;
  await nextTick();
  try {
    const loaded = await loadVbenFormSchema(formSchemaId);
    // 发起节点字段权限:隐藏字段不渲染;存量流程未配置时按全部可编辑处理
    startFieldPermissions.value = parseStartFieldPermissions(
      definition.flowData,
    );
    startFieldNames.value = loaded.schema
      .map((field) => field.fieldName)
      .filter((fieldName): fieldName is string => !!fieldName);
    applicationFormApi.setState({
      schema: applyFieldPermissions(
        loaded.schema,
        startFieldPermissions.value,
        'editable',
      ),
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
  startFieldPermissions.value = {};
  startFieldNames.value = [];
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
            v-for="definition in startableDefinitions"
            :key="definition.definitionId"
            class="application-item"
            type="button"
            @click="selectDefinition(definition)"
          >
            <span class="application-icon">
              <IconifyIcon class="size-5" icon="lucide:file-pen-line" />
            </span>
            <span class="application-content">
              <strong>{{ definition.definitionName }}</strong>
              <span>
                {{
                  definition.remark ||
                  $t('flow.form.runtime.fillApplication')
                }}
              </span>
            </span>
            <Tag v-if="definition.category">
              {{
                getLocalDictText('WORKFLOW_CATEGORY', definition.category)
              }}:v{{ definition.version }}
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
            <strong>{{ selectedDefinition.definitionName }}</strong>
            <span>{{ selectedDefinition.remark }}</span>
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
