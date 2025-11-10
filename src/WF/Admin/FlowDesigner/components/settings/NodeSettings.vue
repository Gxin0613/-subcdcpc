<template>
  <n-form label-placement="left" label-width="120" label-align="left" class="node-quick-editor">
    <n-form-item v-for="attr in mapAttrs" :key="attr.Field" :label="attr.Desc" :show-feedback="false">
      <div v-if="attr.Field === 'Icon'" class="icon-select">
        <i v-if="nodeEntity.Icon !== '0'" class="input-prefix-icon" :class="nodeEntity.Icon"></i>
        <span class="un-select" v-else>未选择...</span>
        <n-button secondary @click="pickerVisible = true">{{ '选择图标' }}</n-button>
      </div>
      <n-input
        v-else-if="isTextBox(attr)"
        v-model:value="nodeRows[attr.Field]"
        :theme-overrides="InputTheme"
        :disabled="isReadOnly(attr)"
        @change="updateNodeEntity(attr.Field, $event, false)"
        :placeholder="'请输入' + attr.Desc"
      />
      <n-input-number
        v-else-if="isNumber(attr)"
        v-model:value="nodeRows[attr.Field]"
        :theme-overrides="InputTheme"
        :disabled="isReadOnly(attr)"
        @update-value="updateNodeEntity(attr.Field, $event, false)"
        :placeholder="'请输入' + attr.Desc"
      />
      <n-select
        v-else-if="isDDL(attr)"
        :options="ddlOptions[attr.Field]"
        v-model:value="nodeRows[attr.Field]"
        :disabled="isReadOnly(attr)"
        :theme-overrides="SelectTheme"
        @update-value="updateNodeEntity(attr.Field, $event, false)"
      />
      <n-switch
        v-else-if="isBoolean(attr)"
        :checked-value="1"
        v-model:value="nodeEntity[attr.Field]"
        :disabled="isReadOnly(attr)"
        @update-value="updateNodeEntity(attr.Field, $event, false)"
      />
      <n-date-picker
        v-else-if="isDate(attr)"
        type="date"
        v-model:value="nodeRows[attr.Field]"
        :disabled="isReadOnly(attr)"
        @update-value="updateNodeEntity(attr.Field, $event, false)"
      />
      <n-date-picker
        v-else-if="isDateTime(attr)"
        type="datetime"
        v-model:value="nodeRows[attr.Field]"
        :disabled="isReadOnly(attr)"
        @update-value="updateNodeEntity(attr.Field, $event, false)"
      />

      <div v-else>{{ '【未判断的类型】' }}</div>
    </n-form-item>

    <!--    <n-form-item :label="'节点ID'" :show-feedback="false">-->
    <!--      <n-input v-model:value="nodeEntity.NodeID" :theme-overrides="InputTheme" :disabled="true" />-->
    <!--    </n-form-item>-->
    <!--    <n-form-item :label="'节点名称'" :show-feedback="false">-->
    <!--      <n-input v-model:value="nodeEntity.Name" :theme-overrides="InputTheme" maxlength="40" @update-value="updateNodeEntity('Name', $event, false)" />-->
    <!--    </n-form-item>-->
    <!--    <n-form-item :label="'退回规则'" :show-feedback="false">-->
    <!--      <n-select v-model:value="nodeEntity.ReturnRole" :options="returnRuleOptions" @update-value="updateNodeEntity('ReturnRole', $event, false)" />-->
    <!--    </n-form-item>-->
    <!--    <n-form-item :label="'节点类型'" :show-feedback="false">-->
    <!--      <n-select v-model:value="nodeEntity.RunModel" :options="nodeTypeOptions" @update-value="updateNodeEntity('RunModel', $event, false)" />-->
    <!--    </n-form-item>-->
    <!--    <n-form-item :label="'审核组件'" :show-feedback="false">-->
    <!--      <n-select v-model:value="nodeEntity.FWCSta" :options="stateOptions" @update-value="updateNodeEntity('FWCSta', $event, false)" />-->
    <!--    </n-form-item>-->
    <!--    <n-form-item :label="'父子流程组件'" :show-feedback="false">-->
    <!--      <n-select v-model:value="nodeEntity.RunModel" :options="stateOptions" @update-value="updateNodeEntity('RunModel', $event, false)" />-->
    <!--    </n-form-item>-->

    <n-divider />
    <h1 class="other-setting">{{ '其他属性' }}</h1>
    <n-form-item v-for="ql in quickLinks" :key="ql.value" label="" :show-feedback="false">
      <span class="quick-link" @click="openLink(ql)"><i :class="ql.Icon"></i> &nbsp;{{ ql.name }}</span>
    </n-form-item>
    <n-modal v-model:show="pickerVisible" to="body" preset="card" :title="'图标切换'" :style="bodyStyle">
      <icon-picker @pick-icon="updateIcon" />
    </n-modal>
  </n-form>
</template>

<script lang="ts" setup>
  import { NForm, NFormItem, NInput, NButton, NInputNumber, NSelect, NSwitch, NDatePicker, NModal, NDivider } from 'naive-ui';
  // 更新变化到数据库
  import { computed, inject, reactive, Ref, ref, toRaw, unref } from 'vue';
  // load theme
  // import { SelectMixedOption } from 'naive-ui/es/select/src/interface';
  import IconPicker from '/@form/components/icon-picker/IconPicker.vue';
  import { nodeEntityKeys, selectedNodeKey } from '/@/WF/Admin/FlowDesigner/utils/keys';
  import { ProvideNodeInfo } from '/@/WF/Admin/FlowDesigner/FlowAttr';
  import Events from '/@/utils/Events';
  import { useRoute } from 'vue-router';
  // load theme
  import InputTheme from '/@flow/theme/InputTheme';
  import SelectTheme from '/@flow/theme/SelectTheme';
  import { Attr } from '/@/bp/en/Map/Attr';
  import useFieldType from '/@/hooks/ens/useFieldType';
  import { useDDLDataLoader } from '/@/hooks/ens/useDDLDataLoader';
  import { NodeType } from '../../config/typeDef';

  const { nodeEntity, updateNodeEntity } = inject(nodeEntityKeys) as ProvideNodeInfo;
  const { getDDLData } = useDDLDataLoader(toRaw(nodeEntity.value));
  const route = useRoute();
  // node实体字段
  const mapAttrs = ref<Attr[]>([]);
  const filterMapAttrs = () => {
    const attrs = nodeEntity.value._enMap.attrs.filter((attr) => !!attr.UIVisible);
    if (nodeEntity.value.NodeType === NodeType.Route || nodeEntity.value.NodeType === NodeType.CC) {
      mapAttrs.value = attrs.filter((attr) => attr.Key === 'Name');
      return;
    }
    mapAttrs.value = attrs;
  };
  filterMapAttrs();

  // 提供给对象时直接生成符合条件的数据
  const nodeRows = reactive(Object.fromEntries(nodeEntity.value.Row));
  const ddlOptions: Ref<Record<string, any>> = ref({});
  mapAttrs.value.forEach(async (attr: Attr) => {
    ddlOptions.value[attr.Field] = await getDDLData(attr);
    // if (attr.IsDDL) {
    //   nodeRows[attr.Key] += '';
    // }
  });
  // 当前行是否只读
  const isReadOnly = (attr: Attr) => attr.UIIsReadonly || (attr.Key === nodeEntity.value.PK && !!nodeEntity.value.PKVal);
  const { isNumber, isDateTime, isDate, isDDL, isBoolean, isTextBox } = useFieldType();

  const selectNodeId = inject(selectedNodeKey) as Ref<string>;

  const bodyStyle = computed(() => {
    return {
      width: '800px',
      height: '600px',
    };
  });

  // const stateOptions: SelectMixedOption[] = [
  //   { value: 0, label: '禁用' },
  //   { value: 1, label: '启用' },
  //   { value: 2, label: '只读' },
  // ];

  // const nodeTypeOptions: SelectMixedOption[] = [
  //   { value: 0, label: '普通' },
  //   { value: 1, label: '合流' },
  //   { value: 2, label: '分流' },
  //   { value: 3, label: '分合流' },
  //   { value: 4, label: '子线程' },
  // ];

  // const returnRuleOptions: SelectMixedOption[] = [
  //   { value: 0, label: '不能退回' },
  //   { value: 1, label: '只能退回上一个节点' },
  //   { value: 2, label: '可以退回以前任意节点' },
  //   { value: 3, label: '可退回指定节点' },
  //   { value: 4, label: '由流程设计的退回路线决定' },
  // ];

  interface LinkInfo {
    name: string;
    value: string;
    clsName: string;
    type: string;
    Icon: string;
  }

  const quickLinks = ref<LinkInfo[]>([]);
  if (nodeEntity.value.NodeType === NodeType.Normal) {
    quickLinks.value = [
      {
        name: '接收人规则',
        value: 'AccepterRole',
        clsName: 'GPE_AccepterRole',
        type: 'GPE',
        Icon: 'icon-user-following',
      },
      {
        name: '多人处理规则',
        value: 'GPE_TodolistModel',
        clsName: 'GPE_TodolistModel',
        type: 'GPE',
        Icon: 'icon-people',
      },
      { name: '表单方案', value: 'FrmSln', clsName: 'GPE_FrmSln', type: 'GPE', Icon: 'icon-heart' },
      // { name: '设计表单', value: 'FrmDesign', clsName: '', type: 'iframe', Icon: 'icon-notebook' },
      { name: '方向条件', value: 'DirCondition', clsName: 'TS.WF.NodeDir', type: 'entity', Icon: 'icon-share' },
      {
        name: '高级设置',
        value: 'En',
        clsName: 'TS.WF.Template.NodeExt',
        type: 'entity',
        Icon: 'icon-settings',
      },
    ];
  } else if (nodeEntity.value.NodeType === NodeType.Route) {
    quickLinks.value = [{ name: '方向条件', value: 'DirCondition', clsName: 'TS.WF.NodeDir', type: 'entity', Icon: 'icon-share' }];
  } else {
    quickLinks.value = [];
  }

  const openLink = (linkInfo: LinkInfo) => {
    const { name, clsName, type } = linkInfo;
    const pk = route.query.FlowNo as string;
    const params = {
      EnName: clsName,
      FlowNo: pk,
      PKVal: unref(selectNodeId),
      NodeID: unref(selectNodeId),
      title: name,
      type,
      expand: false,
      basicInfoVisible: true,
    };
    Events.emit('openDrawer', params);
  };

  const pickerVisible = ref(false);
  const updateIcon = (item: string) => {
    updateNodeEntity('Icon', item);
    pickerVisible.value = false;
  };
</script>

<style lang="less" scoped>
  .node-quick-editor {
    :deep(.n-form-item-label) {
    }
  }
  .icon-select {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #eeeeee;
    padding-left: 12px;
    font-size: 14px;
    .un-select {
      color: #999999;
    }
  }

  .other-setting {
    font-size: 16px;
    font-weight: 600;
    color: #666666;
    margin-bottom: 20px;
  }

  .quick-link {
    margin-left: 12px;
    color: #1890ff;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
</style>
