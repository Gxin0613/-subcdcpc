<template>
  <div style="background-color: transparent; height: 100%">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        <FlowError :doc="errorObj.tips" :isShowCloseBtn="false" />
      </div>
      <div v-else class="toolbar-style">
        <!-- 表单风格切换 -->
        <Select v-model:value="frmStyle" style="width: 85px" @change="(activeNo, _) => shiftMode(activeNo as string,1)">
          <SelectOptGroup v-for="group in dataStyle" :key="group.No">
            <template #label>
              <div class="select-group-label">{{ group.Name }}</div>
            </template>
            <SelectOption v-for="subPages in group.children" :key="group.No + '_' + subPages.No" :value="subPages.No">
              {{ subPages.Name }}
            </SelectOption>
          </SelectOptGroup>
        </Select>
        <!--表单显示模式-->
        <Select
          v-if="WebUser.No === 'admin' && !!props.frmID"
          v-model:value="frmShowType"
          style="width: 98px; margin-left: 5px"
          @change="(frmShowType, _) => shiftMode(frmShowType, 0)"
        >
          <SelectOption v-for="item in FrmShowTypes" :key="item.value" :value="item.value">
            {{ item.label }}
          </SelectOption>
        </Select>
        <Tag v-if="isHaveWorkCheck" style="margin-left: 5px; padding: 5px; background: #fff" @click="ChangePostion()">
          <i :class="WebUser.FWCPostion === 'right' ? 'icon-lock' : 'icon-lock-open'" style="font-size: 13px">
            {{ WebUser.FWCPostion === 'right' ? '取消' : '设置' }}
          </i>
        </Tag>
      </div>
    </Spin>
  </div>
</template>
<script setup lang="ts">
  import { onMounted, onUnmounted, reactive, ref } from 'vue';
  import { Spin, Select, SelectOptGroup, SelectOption, Tag } from 'ant-design-vue';
  import FlowError from '/@/WF/FlowError.vue';
  import { GPE_MyFrmStyle } from '/@/WF/Comm/Setting/GPE_MyFrmStyle';
  import { useDataConvert } from '/@/hooks/ens/useDataConvert';
  import { MySetting } from '/@/WF/Comm/Setting/MySetting';
  import Event from '/@/utils/Events';
  import WebUser from '/@/bp/web/WebUser';
  import { MapData } from '../Admin/FrmLogic/MapData';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();
  const props = defineProps({
    frmID: {
      type: String,
      default: '',
    },
  });
  //获取传的参数
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  //表单显示模式
  const FrmShowTypes = [
    { label: '平铺', value: 0 },
    { label: 'Tab模式', value: 1 },
    { label: '从表合并', value: 2 },
    { label: '左右', value: 3 },
  ];
  const frmShowType = ref(0);
  //表格风格类型
  const dataStyle: any = ref([]);
  let frmStyle = ref('默认');
  const mapData = new MapData(props.frmID);
  const InitPage = async () => {
    try {
      //表单模式
      if (!!props.frmID) {
        await mapData.Retrieve();
        frmShowType.value = mapData.FrmShowType;
        await mapData.Update();
      }
      //表单风格切换
      const myFrmStyle = new GPE_MyFrmStyle();
      await myFrmStyle.Init();
      const convert = useDataConvert();
      dataStyle.value = convert(myFrmStyle.Groups, myFrmStyle.SubPages, 'GroupNo');
      console.log(dataStyle.value, '表单风格');
      //表单风格回显
      const mySetting = new MySetting(WebUser.No);
      await mySetting.RetrieveFromDBSources();
      dataStyle.value.forEach((no: any) => {
        no.children.filter((frmName) => {
          if (mySetting.FrmStyle == frmName.No) {
            frmStyle.value = frmName.No;
          }
        });
      });
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  const shiftMode = async (val: any, type: number) => {
    if (type === 0) {
      if (!!props.frmID) {
        frmShowType.value = val;
        if (!mapData.No) {
          mapData.No = props.frmID;
          await mapData.Retrieve();
        }
        mapData.FrmShowType = val;
        await mapData.Update();
        Event.emit('InitFrm', '页面刷新');
        return;
      }
      return;
    }
    const mySetting = new MySetting(WebUser.No);
    await mySetting.RetrieveFromDBSources();
    mySetting.FrmStyle = val;
    await mySetting.Update();
    Event.emit('InitFrm', '页面刷新');
  };

  const ChangePostion = async () => {
    const mySetting = new MySetting(WebUser.No);
    await mySetting.RetrieveFromDBSources();
    WebUser.FWCPostion === 'right' ? (WebUser.setFWCPostion = 'bottom') : (WebUser.setFWCPostion = 'right');
    mySetting.SetPara('FWCPostion', WebUser.FWCPostion);
    await mySetting.Update();
    Event.emit('InitFrm', '页面刷新');
  };
  const isHaveWorkCheck = ref(false);
  onMounted(async () => {
    Event.on('WorkCheckSta', async () => {
      isHaveWorkCheck.value = true;
    });
  });
  onUnmounted(() => {
    Event.off('WorkCheckSta');
  });
  InitPage();
</script>
<style scoped lang="less">
  .toolbar-style {
    height: 100%;
    display: flex;
    justify-content: flex-end;
    background-color: transparent;
  }
</style>
