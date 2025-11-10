<template>
  <div class="p-5" :class="frmConfigs.frmStyleContent.frmContent" :style="getStyle">
    <!--表格模式展示-->
    <div  :class="fwcRight?'split-layout':''">
      <div :class="FWCGroupFiled==null || fwcRight==false?'':'left-pane'" style="background-color: white;">
       <!--表格模式展示-->
       <div v-for="gf in frmConfigs.gfs" :key="gf.OID">
          <div v-if="gf.ShowType != 2 && gf.CtrlType != 'Dtl' && gf.CtrlType != 'FWC' && !!gf.Lab" class="GroupBar GroupTitle" :class="frmConfigs.frmStyleContent.GroupTitle">
            <span style="width: 100%">
              <span v-if="gf.CtrlType === 'FWC'" style="width: 100%; display: flex; justify-content: space-between">
                {{ gf['Name' + sysLang] || gf.Lab }}
                <div>
                  <i class="icon-film" @click="frmConfigs.changeTrack"></i>
                  <i class="icon-notebook" @click="frmConfigs.changeNormal" style="margin: 0 10px"></i>
                  <i class="icon-compass" @click="frmConfigs.changeTimeTrack"></i>
                </div>
              </span>
              <template v-else>
                <template v-if="!(gf.CtrlType === 'Dir')">
                  <i :class="gf.IsZDPC == 1 ? 'glyphicon glyphicon-plus' : 'glyphicon glyphicon-minus'" @click="frmConfigs.isZDPC(gf.OID)"></i>
                </template>
                {{ gf['Name' + sysLang] || gf.Lab }}
              </template>
            </span>
          </div>
          <MapAttrForm
            v-if="gf.CtrlType === null || gf.CtrlType === ''"
            :map-attrs="GetMapAttrsByGroupIDExt(gf.OID)"
            :frmData="frmConfigs.frmData"
            :mainData="frmConfigs.mainData"
            :checkField="frmConfigs.checkField"
            :fwcVer="frmConfigs.fwcVer"
            :params="props.params"
            ref="basicData"
            :is-readonly="props.fieldIsReadonly || props.isReadonly"
            :is-page-readonly="props.isReadonly"
            :tableCol="frmConfigs.tableCol"
            :labPostion="frmConfigs.labPostion"
            :labAlign="frmConfigs.labAlign"
            :class="frmConfigs.frmStyleContent.frmstyle"
            :style="gf.IsZDPC == 1 ? groupBarCurStyle : ''"
            :WGFrm="WGFrm"
            :key="componetKeys.attrKey"
            :is-reload="componetKeys.attrKey === componetKeys.oldAttrKey"
          />
          <Ath
            v-if="gf.CtrlType === 'Ath' && gf.ShowType != 2"
            :ath-info="gf.ath"
            :params="props.params"
            :PKValue="props.params.WorkID || props.params.RefPKVal"
            :is-readonly="props.fieldIsReadonly || props.isReadonly"
            :style="gf.IsZDPC == 1 ? groupBarCurStyle : ''"
            :key="componetKeys.athKey"
            :ref="'ath' + gf?.ath?.MyPK"
          />
          <SubFlow v-if="gf.CtrlType === 'SubFlow'" ref="subFlow" :params="props.params" :nodeInfo="frmConfigs.nodeInfo" :is-readonly="props.isReadonly" />
        </div>
        <Tabs :style="{ backgroundColor: '#fff',padding: ''}":tab-bar-style="tabBarStyle">
          <!--包含分组的情况-->
          <TabPane v-for="gf in frmConfigs.dtlGroup" :key="gf.OID" :tab="gf['Name' + sysLang] || gf.Lab">
           <DtlComponent
              v-if="gf.CtrlType === 'Dtl' && gf.ShowType != 2 "
              :gf="gf"
              :frmConfigs="frmConfigs"
              :isShowGF="false"
              :dtl-info="gf.dtl"
              :params="props.params"
              :main-data="frmConfigs.mainData"
              :main-mapExts="GetDtlMapExt(gf.dtl?.No)"
              :is-readonly="props.fieldIsReadonly || props.isReadonly"
              @update-prop-data="frmConfigs.handleUpdate"
              :key="componetKeys.dtlKey[gf.dtl?.No || '']"
              :ref="'dtl' + gf?.dtl?.No"
            />
          </TabPane>
        </Tabs>
        <template v-if="!!FWCGroupFiled && fwcRight == false">
          <div class="GroupBar GroupTitle" :class="frmConfigs.frmStyleContent.GroupTitle">
            <span style="width: 100%">
              <span style="width: 100%; display: flex; justify-content: space-between">
                {{ FWCGroupFiled.Lab }}
                <div>
                  <i class="icon-film" @click="frmConfigs.changeTrack"></i>
                  <i class="icon-notebook" @click="frmConfigs.changeNormal" style="margin: 0 10px"></i>
                  <i class="icon-compass" @click="frmConfigs.changeTimeTrack"></i>
                </div>
              </span>
            </span>
          </div>
          <WorkCheck
            v-if="frmConfigs.examineMode != '' && fwcRight===false"
            ref="workCheckRef"
            :params="props.params"
            :nodeInfo="frmConfigs.nodeInfo"
            :is-readonly="props.isReadonly"
            :class="frmConfigs.frmStyleContent.frmstyle"
            :examineMode="frmConfigs.examineMode"
            :style="FWCGroupFiled.IsZDPC == 1 ? groupBarCurStyle : ''"
          />
        </template>
      </div>
      <div v-if="!!FWCGroupFiled && fwcRight"  class="right-pane" style="background-color: white;">
        <div  class="GroupBar GroupTitle" :class="frmConfigs.frmStyleContent.GroupTitle">
          <span style="width: 100%; display: flex; justify-content: space-between">
            <span>
              {{ FWCGroupFiled['Name' + sysLang] || FWCGroupFiled.Lab }}
            </span>
            <div>
              <i class="icon-film" @click="frmConfigs.changeTrack"></i>
              <i class="icon-notebook" @click="frmConfigs.changeNormal" style="margin: 0 10px"></i>
              <i class="icon-compass" @click="frmConfigs.changeTimeTrack"></i>
            </div>
          </span>
        </div>
        <WorkCheck
          v-if="frmConfigs.examineMode != ''"
          ref="workCheckRef"
          :params="props.params"
          :nodeInfo="frmConfigs.nodeInfo"
          :is-readonly="props.isReadonly"
          :class="frmConfigs.frmStyleContent.frmstyle"
          :examineMode="frmConfigs.examineMode"
        />
      </div>
    </div>
    
  </div>
</template>
<script lang="ts" setup>
  import { Tabs, TabPane } from 'ant-design-vue';
  import Ath from '/@/WF/CCForm/Ath.vue';
  import DtlComponent from '/@/WF/CCForm/FrmFool/DtlComponent.vue';
  import MapAttrForm from '/@/WF/CCForm/MapAttrForm.vue';
  import WorkCheck from '/@/WF/WorkOpt/WorkCheck.vue';
  import SubFlow from '/@/WF/WorkOpt/SubFlow.vue';
  import { FrmConfig } from '/@/WF/CCForm/FrmFool/frm';
  import WebUser from '/@/bp/web/WebUser';
  import { computed, getCurrentInstance, ref, shallowRef} from 'vue';
  import { WaiGuaBaseFrm } from '/@/bp/UIEntity/WaiGuaBaseFrm';
  import { useFrmFoolMethod } from '/@/WF/CCForm/FrmEnd';

  // 父组件传过来的属性
  const props = defineProps({
    frmConfigs: {
      //表单属性集合
     type: Object as PropType<FrmConfig>,
      default: () => {},
    },
    isSetHeight: {
      type: Boolean,
      default: true,
    },
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
    componetKeys:{
      type: Object,
      default: () => {},
    },
    autoLayout: {
      type: Boolean,
      default: false,
    },
    fieldIsReadonly: {
      type: Boolean,
      default: false,
    },
    isReadonly: {
      type: Boolean,
      default: false,
    },
    WGFrm: {
      type: Object as PropType<WaiGuaBaseFrm>,
      default: null,
    },
  });
  const sysLang = WebUser.SysLang || 'CH'; //语言
  const fwcRight = ref(WebUser.FWCPostion==='right');
  const FWCGroupFiled = props.frmConfigs.gfs.find(gf=>gf.CtrlType==='FWC') || null;
  const tabBarStyle = computed(() => {
  const emptyBtn = props.frmConfigs.dtlGroup.length === 1;
  return {
    display: emptyBtn ? 'none' : 'flex',
    '--nav-scroll-visible': props.frmConfigs.dtlGroup.length === 1 ? 'hidden' : 'visible',
    //backgroundColor: '#fff',
  };
  });
  const {GetMapAttrsByGroupIDExt, GetDtlMapExt,getStyle,groupBarCurStyle} = useFrmFoolMethod(props.frmConfigs,props.autoLayout,props.isSetHeight,fwcRight.value,FWCGroupFiled);
  const basicData = shallowRef<InstanceType<typeof MapAttrForm>>(); //加载主表信息
  const workCheckRef = shallowRef<InstanceType<typeof WorkCheck>>(); //审核组件信息

  /**
   * 表单必填、正则表达式校验
   */
  const FrmFoolValidate= ()=>{
    let attrFormList:any =  basicData.value;
    let rowData:any={};
    if (Array.isArray(basicData.value)) rowData = basicData.value[0].mainData;
      else rowData = basicData.value?.mainData;
    return[attrFormList,rowData];
  }
  /**
   * 保存从表
   * @param isOnlySave 
   */
  const instance = getCurrentInstance();
  const SaveAllDtl=async (isOnlySave)=>{
    for (const dtl of props.frmConfigs.dtls){
      let refDtl = instance?.refs['dtl' + dtl.No] as InstanceType<typeof DtlComponent>;
        if (!!refDtl && Array.isArray(refDtl)) refDtl = refDtl[0];
        if (!!refDtl) {
          let data = await refDtl?.SaveAll?.(isOnlySave);
          if(data == false)
            return false;
        }
    }
    return true;
  }
  /**
   * 保存附件
   * @param isOnlySave 
   */
  const SaveAllAth=(isOnlySave)=>{
    if(isOnlySave) return true;
    for (const ath of props.frmConfigs.aths){
      let refAth = instance?.refs['ath' + ath.MyPK] as InstanceType<typeof Ath>;
      if (!!refAth && Array.isArray(refAth)) refAth = refAth[0];
      if (!!refAth) {
        const data = refAth?.CheckAth?.(props.frmConfigs.athInputUpload.includes(ath.MyPK + ','));
        if(data == false)
          return false;
      }
    }
    return true;
  }
  /**
   * 保存审核组件
   * @param isOnlySave 
   */
  const SaveWorkCheck=async (isOnlySave)=>{
    //保存审核组件
    let result =false;
    if (props.frmConfigs.isHaveEditWorkCheck == true) {
      if (props.frmConfigs.isHaveSignCheck == true) {
        if (basicData.value != undefined) {
          if (Array.isArray(basicData.value)) result = await basicData.value[0].WorkCheckSave(isOnlySave);
          else result = await basicData.value?.WorkCheckSave(isOnlySave) || true;
        }
      } else {
        if (Array.isArray(workCheckRef.value)) result = await workCheckRef.value[0].WorkCheckSave(isOnlySave);
        else result = await workCheckRef.value?.WorkCheckSave(isOnlySave) || true;
      }
      return result;
    }
    return true;
  }
 defineExpose({ FrmFoolValidate,SaveAllDtl,SaveAllAth,SaveWorkCheck });
</script>

<style lang="less" scoped>

  :deep(.ant-card-body) {
    padding: 6px 24px;
  }
  
</style>
