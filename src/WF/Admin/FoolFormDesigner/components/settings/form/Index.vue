<template>
  <n-form label-placement="left" label-width="120" label-align="left">
    <n-form-item :label="'表单编号'" :show-feedback="false">
      <n-input v-model:value="formConfig.originData.No" :disabled="true" />
    </n-form-item>
    <n-form-item :label="'表单名称'" :show-feedback="false">
      <n-input v-model:value="formConfig.originData.Name" maxlength="40" @update-value="updateConfigToDatabase('Name', $event, false)" />
    </n-form-item>
    <n-form-item :label="'数据源'" :show-feedback="false">
      <n-select v-model:value="formConfig.originData.DBSrc" maxlength="40" size="medium" :options="options" @update-value="updateConfigToDatabase('DBSrc', $event, false)" />
    </n-form-item>
    <n-form-item :label="'存储表'" :show-feedback="false">
      <n-input v-model:value="formConfig.originData.PTable" @update-value="updateConfigToDatabase('PTable', $event, false)" />
    </n-form-item>
    <n-form-item :label="'表单图标'" :show-feedback="false">
      <div class="icon-select">
        <i v-if="formConfig.originData.Icon !== '0'" class="input-prefix-icon" :class="formConfig.originData.Icon"></i>
        <span class="un-selected" v-else>未选择...</span>
        <n-button secondary @click="pickerVisible = true">{{ '选择图标' }}</n-button>
      </div>
    </n-form-item>
    <n-form-item :label="'表单列数'" :show-feedback="false">
      <n-radio-group v-model:value="formConfig.cols" @update:value="updateConfigToDatabase('TableCol', $event, false)" size="small" :theme-overrides="RadioGroupTheme">
        <n-radio-button :value="4">{{ '4列' }}</n-radio-button>
        <n-radio-button :value="6">{{ '6列' }}</n-radio-button>
      </n-radio-group>
    </n-form-item>
    <n-form-item :label="'标签位置'" :show-feedback="false">
      <n-radio-group v-model:value="formConfig.labelPosition" size="small" :theme-overrides="RadioGroupTheme" @update:value="updateConfigToDatabase('LabelPosition', $event, true)">
        <n-radio-button value="left">{{ '左边' }}</n-radio-button>
        <n-radio-button value="top">{{ '顶部' }}</n-radio-button>
      </n-radio-group>
    </n-form-item>
    <n-form-item :label="'显示隐藏字段'" :show-feedback="false">
      <n-radio-group
        v-model:value="formConfig.showHiddenField"
        @update:value="updateConfigToDatabase('showHiddenField', $event, true)"
        size="small"
        :theme-overrides="RadioGroupTheme"
      >
        <n-radio-button value="1">{{ '开启' }}</n-radio-button>
        <n-radio-button value="0">{{ '关闭' }}</n-radio-button>
      </n-radio-group>
    </n-form-item>
    <n-form-item :label="'自动ID'" :show-feedback="false">
      <n-radio-group
        v-model:value="formConfig.autoGenerateId"
        @update:value="updateConfigToDatabase('autoGenerateId', $event, true)"
        size="small"
        :theme-overrides="RadioGroupTheme"
      >
        <n-radio-button value="1">{{ '开启' }}</n-radio-button>
        <n-radio-button value="0">{{ '关闭' }}</n-radio-button>
      </n-radio-group>
    </n-form-item>
    <n-form-item :label="'标签对齐'" :show-feedback="false">
      <n-radio-group v-model:value="formConfig.labelAlign" size="small" :theme-overrides="RadioGroupTheme" @update:value="updateConfigToDatabase('LabelAlign', $event, true)">
        <n-radio-button value="left">{{ '靠左' }}</n-radio-button>
        <n-radio-button value="right">{{ '靠右' }}</n-radio-button>
      </n-radio-group>
    </n-form-item>

    <n-form-item :label="'表单宽度'" :show-feedback="false">
      <n-input-number v-model:value="formConfig.designerWidth" :step="10" @update:value="updateConfigToDatabase('FrmW', $event, false)" />
      <span>（px）</span>
    </n-form-item>
    <n-form-item :label="'自适应宽度'" :show-feedback="false">
      <n-radio-group v-model:value="formConfig.autoFitWidth" @update:value="updateConfigToDatabase('autoFitWidth', $event, true)" size="small" :theme-overrides="RadioGroupTheme">
        <n-radio-button value="1">{{ '开启' }}</n-radio-button>
        <n-radio-button value="0">{{ '关闭' }}</n-radio-button>
      </n-radio-group>
    </n-form-item>
  </n-form>
  <n-modal v-model:show="pickerVisible" to="body" preset="card" :title="'图标切换'" :style="bodyStyle">
    <icon-picker @pick-icon="updateIcon" />
  </n-modal>
</template>

<script lang="ts" setup>
  import { NForm, NFormItem, NRadioGroup, NRadioButton, NInputNumber, NInput, NSelect, NButton, NModal, useMessage } from 'naive-ui';

  // 更新变化到数据库
  import { debounce } from 'lodash-es';
  import { computed, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import Entity from '/@form/dto/Entity';
  import { useDesignerStore } from '/@/store/modules/form';
  // load theme
  import { RadioGroupTheme } from '/@form/theme/index';
  import Events from '/@/utils/Events';
  import IconPicker from '/@form/components/icon-picker/IconPicker.vue';
  import { GloWF } from '/@/WF/Admin/GloWF';
  import DBAccess from '/@/utils/gener/DBAccess';

  const message = useMessage();
  const designerStore = useDesignerStore();
  const formConfig = computed(() => designerStore.globalFormConfig);
  const route = useRoute();
  const dbFormConfig = new Entity('BP.Sys.MapData', route?.query?.FrmID?.toString());
  const options = ref<Record<string, string>[]>([]);
  // 同步设置数据到前端
  const syncSetting = () => {
    designerStore.globalFormConfig.cols = dbFormConfig.getVal('TableCol') == 0 ? 4 : 6;
    designerStore.globalFormConfig.designerWidth = dbFormConfig.getVal('FrmW');
    designerStore.globalFormConfig.name = dbFormConfig.getVal('Name');
    designerStore.globalFormConfig.labelPosition = dbFormConfig.getPara('LabelPosition') || 'left';
    designerStore.globalFormConfig.autoGenerateId = dbFormConfig.getPara('autoGenerateId') || '0';
    designerStore.globalFormConfig.showHiddenField = dbFormConfig.getPara('showHiddenField') || '0';
    designerStore.globalFormConfig.labelAlign = dbFormConfig.getPara('LabelAlign') || 'left';
    designerStore.globalFormConfig.autoFitWidth = dbFormConfig.getPara('autoFitWidth') || '1';
    designerStore.globalFormConfig.DBSrc = dbFormConfig.getVal('DBSrc') || 'local';
    designerStore.globalFormConfig.originData = dbFormConfig.getData();

    document.title = designerStore.globalFormConfig.name;
  };

  const checkWidth = (val: number | null) => {
    if (val && val < 800) {
      message.warning('为了您的体验，建议不要设置800px以下宽度');
    }
  };

  const updateConfigToDatabase = debounce(function (key: string, val: any, isExtraPara: boolean) {
    if (isExtraPara) {
      dbFormConfig.setPara(key, val);
    } else {
      if (key === 'TableCol') {
        val = val === 4 ? 0 : 1;
      }
      if (key === 'FrmW') {
        checkWidth(val);
      }
      dbFormConfig.setVal(key, val);
    }
    dbFormConfig.Update();
    syncSetting();
  }, 500);

  const getSetting = async () => {
    //获取到数据源
    const data = await DBAccess.RunSQLReturnTable(GloWF.srcDBSrc);
    if (Array.isArray(data) && data.length > 0) {
      options.value = data.map((item) => {
        return {
          value: item.No || item.NO || item.no,
          label: item.Name || item.NAME || item.name,
          text: item.Name || item.NAME || item.name,
        };
      });
    } else {
      options.value = [];
    }
    // 保证先初始化
    await dbFormConfig.RetrieveFromDBSources();
    // 同步设置到前端
    syncSetting();
  };

  const bodyStyle = computed(() => {
    return {
      width: '800px',
      height: '600px',
    };
  });

  const pickerVisible = ref(false);
  const updateIcon = (item: string) => {
    formConfig.value.originData.Icon = item;
    updateConfigToDatabase('Icon', item, false);
    pickerVisible.value = false;
  };

  onMounted(async () => {
    await getSetting();
    Events.on('updateFormConfig', async () => {
      await getSetting();
    });
  });
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
</style>
