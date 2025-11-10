<template>
  <n-form label-placement="left" label-width="120" label-align="left">
    <n-form-item :label="'流程编号'" :show-feedback="false">
      <n-input v-model:value="flowAttrs.No" :theme-overrides="InputTheme" :disabled="true" />
    </n-form-item>
    <n-form-item :label="'流程名称'" :show-feedback="false">
      <n-input
        v-model:value="flowAttrs.Name"
        :theme-overrides="InputTheme"
        :placeholder="'请输入流程名称'"
        maxlength="40"
        @update-value="updateFlowEntity('Name', $event, false)"
      />
    </n-form-item>
    <n-form-item :label="'业务表'" :show-feedback="false">
      <n-input v-model:value="flowAttrs.PTable" :theme-overrides="InputTheme" :placeholder="'请输入业务表'" @update-value="updateFlowEntity('PTable', $event, false)" />
    </n-form-item>
    <n-form-item :label="'Event Entity'" :show-feedback="false">
      <n-input
        v-model:value="flowAttrs.FlowEventEntity"
        :theme-overrides="InputTheme"
        :placeholder="'请输入事件实体'"
        @update-value="updateFlowEntity('FlowEventEntity', $event, false)"
      />
    </n-form-item>
    <n-form-item :label="'标题生成规则'" :show-feedback="false">
      <n-input v-model:value="flowAttrs.TitleRole" :theme-overrides="InputTheme" :placeholder="'请输入标题生成规则'" @update-value="updateFlowEntity('TitleRole', $event, false)" />
    </n-form-item>
    <n-form-item :label="'单据编号格式'" :show-feedback="false">
      <n-input
        v-model:value="flowAttrs.BillNoFormat"
        :theme-overrides="InputTheme"
        :placeholder="'请输入单据编号格式'"
        @update-value="updateFlowEntity('BillNoFormat', $event, false)"
      />
    </n-form-item>
    <n-form-item :label="'允许独立启动?'" :show-feedback="false">
      <n-switch size="small" :theme-overrides="SwitchTheme" v-model:value="flowAttrs.IsCanStart" @update-value="updateFlowEntity('IsCanStart', $event, false)" />
    </n-form-item>
    <n-form-item :label="'草稿规则'" :show-feedback="false">
      <n-select v-model:value="flowAttrs.Draft" :theme-overrides="SelectTheme" :options="draftRuleOptions" @update-value="updateFlowEntity('Draft', $event, false)" />
    </n-form-item>
    <!--    <n-form-item :label="'连接线风格'" :show-feedback="false">-->
    <!--      <n-select v-model:value="atParaAttrs.LineRole" :theme-overrides="SelectTheme" :options="lineStyles" @update-value="updateFlowEntity('LineRole', $event, true)" />-->
    <!--    </n-form-item>-->
    <n-form-item :label="'流程图标'" :show-feedback="false">
      <div class="icon-select">
        <i v-if="flowAttrs.Icon !== '0'" class="input-prefix-icon" :class="flowAttrs.Icon"></i>
        <span class="un-selected" v-else>未选择...</span>
        <n-button secondary @click="pickerVisible = true">{{ '选择图标' }}</n-button>
      </div>
    </n-form-item>

    <n-divider />
    <h1 class="other-setting">{{ '其他属性' }}</h1>
    <n-form-item v-for="ql in quickLinks" :key="ql.value" label="" :show-feedback="false">
      <span class="quick-link" @click="openLink(ql.value, ql.name)"><i :class="ql.icon"></i>&nbsp;{{ ql.name }}</span>
    </n-form-item>
    <n-modal v-model:show="pickerVisible" to="body" preset="card" :title="'图标切换'" :style="bodyStyle">
      <icon-picker @pick-icon="updateIcon" />
    </n-modal>
  </n-form>
</template>

<script lang="ts" setup>
  import { NForm, NFormItem, NInput, NButton, NSelect, NModal, NDivider, NSwitch } from 'naive-ui';
  // 更新变化到数据库
  import { computed, inject, reactive, ref } from 'vue';
  // load theme
  import { SelectMixedOption } from 'naive-ui/es/select/src/interface';
  import IconPicker from '/@form/components/icon-picker/IconPicker.vue';
  import { flowEntityKeys } from '/@/WF/Admin/FlowDesigner/utils/keys';
  import { ProvideFlowInfo } from '/@/WF/Admin/FlowDesigner/FlowAttr';
  import Events from '/@/utils/Events';
  import { useRoute } from 'vue-router';
  // load theme
  import SwitchTheme from '/@flow/theme/SwitchTheme';
  import InputTheme from '/@flow/theme/InputTheme';
  import SelectTheme from '/@flow/theme/SelectTheme';
  import { useTypeConvert } from '/@/hooks/ens/useDataConvert';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const route = useRoute();
  const { flowEntity, updateFlowEntity } = inject(flowEntityKeys) as ProvideFlowInfo;
  const atParaAttrs = ref<Record<string, any>>({
    LineRole: '0',
  });
  const { numberToBoolean } = useTypeConvert();
  const flowAttrs = ref({});
  flowEntity.value.Init().then(async () => {
    await flowEntity.value.Retrieve();
    const attrs = flowEntity.value._enMap.attrs;
    const flowRow = Object.fromEntries(flowEntity.value.Row);
    for (const attr of attrs) {
      if (attr.IsDDL) {
        flowRow[attr.Key] += '';
      }
    }
    flowAttrs.value = numberToBoolean(attrs, flowRow);
  });

  const bodyStyle = computed(() => {
    return {
      width: '800px',
      height: '600px',
    };
  });

  // @zhoupeng 补充一下GPE实体
  const quickLinks = [
    { name: '发起规则', value: 'GPE_AutoStart', icon: 'icon-paper-plane' },
    // { name: '流程事件', value: 'Action' },
    // { name: '版本管理', value: 'Ver' },
    { name: '业务数据同步规则', value: 'GPE_SyncRole', icon: 'icon-cloud-download' },
    { name: '完整设置', value: 'En', icon: 'icon-settings' },
  ];

  const lineStyles: SelectMixedOption[] = reactive([
    { label: '默认风格', value: '0' },
    { label: '贝塞尔曲线', value: '1' },
  ]);

  const draftRuleOptions: SelectMixedOption[] = reactive([
    { value: '0', label: '无(不设草稿)' },
    { value: '1', label: '保存到待办' },
    { value: '2', label: '保存到草稿箱' },
  ]);

  const openLink = (entityName: string, title: string) => {
    let url = '';
    const flowNo = route.query.FlowNo as string;

    //自动发起.
    if (entityName == 'GPE_AutoStart' || entityName == 'GPE_SyncRole') {
      Events.emit('openDrawer', {
        title,
        type: 'GPE',
        url,
        EnName: entityName,
        PKVal: flowNo,
      });
      return;
      // url=`/src/WF/Comm/GroupPage.vue?EnName=GPE_AutoStart&PKVal=${flowNo}`;
    }

    if (entityName == 'En') {
      // 这里是不是 TS.WF.Template.FlowExt
      // url = `/#/WF/Designer/En?EnName=TS.WF.Template.FlowExt&PKVal=${flowNo}`;
      Events.emit('openDrawer', {
        title,
        EnName: 'TS.WF.Template.FlowExt',
        PKVal: flowNo,
        type: 'entity',
        // url,
      });
      return;
    }
  };

  const pickerVisible = ref(false);
  const updateIcon = (item: string) => {
    flowAttrs.value['Icon'] = item;
    updateFlowEntity('Icon', item, false);
    pickerVisible.value = false;
  };
</script>

<style lang="less" scoped>
  .icon-select {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #eeeeee;
    padding-left: 12px;
    font-size: 14px;

    .un-selected {
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
