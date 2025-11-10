<template>
  <div :class="emptyBtnCls">
    <ThemeWrapper>
      <Spin :spinning="loading" style="background-color: white">
        <div v-if="errorObj.hasError" class="ant-tag-red">
          {{ errorObj.tips }}
        </div>

        <div v-else class="content" :style="contentBgStyle">
          <div v-if="isShowMsg === false" class="content-wrapper">
            <div v-if="!noSaveButton" class="tool-bar">
              <div v-if="entityRef?.HisUAC?.IsUpdate" class="btn-type" style="flex: 1">
                <Button
                  type="primary"
                  class="btn_style btnPosition"
                  :disabled="!uacRef.IsUpdate"
                  style="background-color: #2970ff; margin-right: 12px; color: #fff; border-radius: 5px"
                  @click="enOnlySave(true)"
                  >{{ '保存' }}</Button
                >
              </div>
              <div v-if="entityRef?.HisUAC?.IsDelete" class="btn-type" style="flex: 1">
                <Button
                  type="primary"
                  class="btn_style btnPosition"
                  :disabled="!uacRef.IsUpdate"
                  style="background-color: #2970ff; margin-right: 12px; color: #fff; border-radius: 5px"
                  @click="enOnlyDelete"
                  >{{ '删除' }}</Button
                >
              </div>

              <div v-if="funcList.length > 0 && uacRef.IsUpdate" class="btn-type" style="flex: 1">
                <FuncToolbar v-if="funcList.length == 1" :list="funcList" margin="right" :send-disabled="sendDisabled" />
                <Button
                  type="primary"
                  class="btn_style btnPosition"
                  :disabled="!uacRef.IsUpdate"
                  style="background-color: #2970ff; margin-right: 12px; color: #fff; border-radius: 5px"
                  @click="funcToolbarVisible = true"
                  v-else-if="funcList.length > 1 && uacRef.IsUpdate"
                >
                  更多
                </Button>
              </div>
            </div>
            <Tabs :tab-bar-style="tabBarStyle" style="padding: 10px" shrink>
              <!--包含分组的情况-->
              <Tab v-for="tabItem in tabs" :key="tabItem.key" :name="tabItem.key" :title="tabItem.key">
                <EnFields
                  v-if="mapAttrs.length > 0 && !loading"
                  :ref="(el: any) => setTabRefMap(el, tab.key)"
                  :row-data="row"
                  :map-attrs="searchFields(tabItem.key)"
                  :pk="entityRef?.PK"
                  :pk-val="entityRef?.PKVal"
                  :saved-state="saved"
                />
              </Tab>
            </Tabs>
            <EnFields
              v-if="tabs.length === 0 && mapAttrs.length > 0 && !loading"
              ref="basicField"
              :row-data="row"
              :map-attrs="searchFields(mapAttrs[0].Key)"
              :pk="entityRef?.PK"
              :pk-val="entityRef?.PKVal"
              :saved-state="saved"
            />
            <template v-if="entityRef?._enMap.HisBPEntityAthType != 0">
              <Divider orientation="left">{{ '附件上传' }}</Divider>
              <Dragger
                v-model:fileList="mapUploadFileList"
                name="file"
                :before-upload="() => false"
                @remove="removeEntityFile"
                :multiple="entityRef?._enMap.HisBPEntityAthType === 2"
                :max-count="entityRef?._enMap.HisBPEntityAthType === 2 ? 100 : 1"
              >
                <p class="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p class="ant-upload-text">{{ '点击上传' }}</p>
              </Dragger>
            </template>
            <!-- <DtlSearch v-for="ds in dtlSearchList" :key="ds.ClassMethod" :title="(ds.Title as string)" :params="getParams(ds.ClassMethod as string)" /> -->
          </div>

          <Popup v-else v-model:show="isShowMsg" position="right" :style="{ width: '100%', height: '100%', backgroundColor: '#fafafd' }">
            <NavBar :title="entityRef?.NodeName" :fixed="true" left-arrow @click-left="onClickLeftUpdate" />
            <div
              style="
                box-shadow: rgba(204, 204, 204, 0.34) 0px 0px 4px 2px;
                margin-top: 46px;
                padding: 15px;
                background-color: #fafafd;
                height: calc(var(--viewport-height) - 50px);
                display: flex;
                flex-direction: column;
                align-items: center;
              "
            >
              <img :src="SendComplete" alt="" style="width: 50vw" />
              <p v-for="(item, index) in msg" :key="index" v-html="item"></p>
              <div style="text-align: right; display: flex; flex-direction: column">
                <Button v-if="isHaveUnSend" type="primary" @click="UnSend" style="margin-bottom: 15px; background: #fff; color: #000; border-color: #eeeeee; width: calc(70vw)">
                  <i class="icon-action-undo"></i>{{ '撤销本次发送' }}</Button
                >
                <Button type="primary" @click="handleCancel" style="background: #2279d6; border-color: #2279d6; width: calc(70vw)"
                  ><i class="icon-close" style="vertical-align: -1px"></i>{{ '关闭' }}</Button
                >
              </div>
            </div>
          </Popup>
        </div>
        <Popup v-model:show="funcToolbarVisible" position="bottom" :style="{ height: `${funcList.length * 50 + 160}px` }" round>
          <div class="func-toolbar">
            <div class="van-h5">{{ '实体功能' }}</div>
            <FuncToolbar v-if="funcList.length > 0" :list="funcList" margin="right" :send-disabled="sendDisabled" />
          </div>
        </Popup>
      </Spin>
    </ThemeWrapper>
  </div>
</template>

<script lang="ts" setup>
  import { Tabs, Tab, Popup, NavBar } from 'vant';
  import { Button, message, Spin, UploadFile, Upload, Divider } from 'ant-design-vue';
  import { InboxOutlined } from '@ant-design/icons-vue';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { nextTick, onMounted, reactive, ref, computed, shallowRef, toRaw, unref, PropType } from 'vue';
  import { Entity } from '/@/bp/en/Entity';
  import { Attr } from '/@/bp/en/Map/Attr';
  import { FieldType, UIContralType } from '/@/bp/en/EnumLab';
  import { useTypeConvert } from '/@/hooks/ens/useDataConvert';
  import { cloneDeep, debounce } from 'lodash-es';
  import EnFields from '/@/CCMobile/components/Comm/EnFields.vue';
  import { useDDLDataLoader } from '/@/hooks/ens/useDDLDataLoader';
  import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
  import { UAC } from '/@/bp/en/Map/UAC';
  import { splitAtString } from '/@/bp/tools/ParamUtils';
  import { useFileUpload } from '/@/hooks/ens/useFileUpload';
  import { getAppEnvConfig } from '/@/utils/env';
  import { useMultipleTabStore } from '/@/store/modules/multipleTab';
  import { useRouter } from 'vue-router';
  import ThemeWrapper from '/@/WF/Comm/ThemeWrapper.vue';
  import { EnCfg } from '/@/bp/sys/EnCfg';
  import type { FuncButton } from '/@/WF/Comm/Methods';
  import FuncToolbar from '/@/WF/Comm/UIEntity/FuncToolbar.vue';
  import SendComplete from '/@/assets/images/fasongwancheng.png';
  import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import tab from '/@/assets/images/tab.png';
  import { DataType } from '/@/bp/en/DataType';
  import { getAllRequestParams } from '/@/utils/request/decode';
  import { userMyFlowSelfLoader } from '/@/DataUser/OverrideFiles/WF_MyFlow';
  import { WaiGuaFlow } from '/@/WF/CCForm/WaiGuaFlow';
  import { ClassFactoryOfWaiGuaEntity } from '/@/WF/Comm/UIEntity/ClassFactoryOfWaiGuaEntity';
  import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';

  interface EnOnlyTabs {
    key: string;
    name: string;
    tips: string;
  }

  const Dragger = Upload.Dragger;
  const loading = ref(false);
  const tabs = ref<Array<EnOnlyTabs>>([]);
  const mapAttrs = ref<Array<Attr>>([]);
  const row = ref<Record<string, any>>();
  const entityRef = ref<Entity>();
  const enCfgRef = ref<EnCfg>();
  const saved = ref(false);

  //显示信息
  const isShowMsg = ref(false);
  const isHaveUnSend = ref(false);
  const msg = ref<string[]>([]);
  const isOnlyClose = ref(false);
  const uacRef = ref(new UAC());
  //执行方法显示
  // 返回
  const onClickLeftUpdate = () => {
    history.back();
  };
  // 外部传过来的属性
  const props = defineProps({
    params: {
      type: Object,
      default: () => {},
    },
    // eslint-disable-next-line vue/prop-name-casing
    EnName: {
      type: String,
      default: '',
    },
    // eslint-disable-next-line vue/prop-name-casing
    PKVal: {
      type: [String, Number],
      default: '',
    },
    entityRef: {
      type: Object as PropType<Nullable<Entity>>,
      default: () => null,
    },
    enCfgRef: {
      type: Object as PropType<Nullable<EnCfg>>,
      default: () => null,
    },
    noSaveButton: {
      type: Boolean,
      default: false,
    },
    mainData: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
    WGFlow: {
      type: Object as PropType<WaiGuaFlow>,
      default: null,
    },
  });

  const emit = defineEmits(['trigger-close', 'RefreshSystem', 'handleCancel', 'UnSend', 'update-pk', 'handle-gpn-callback']);
  const EnName = props.EnName || props.params?.EnName || '';
  const { afterSend } = userMyFlowSelfLoader(props.params);
  const PKVal = props.PKVal || props.params?.PKVal || props.params?.SortNo || '';
  const getParams = (rawString: string) => {
    return getAllRequestParams(rawString + '&PKVal=' + PKVal);
  };
  const { booleanToNumber, numberToBoolean } = useTypeConvert();
  const basicField = shallowRef<InstanceType<typeof EnFields>>();
  const tabRefMap: Map<string, InstanceType<typeof EnFields>> = new Map();
  const router = useRouter();
  const setTabRefMap = (el: Nullable<InstanceType<typeof EnFields>>, key: string) => {
    if (el) {
      tabRefMap.set(key, el);
    }
  };

  const groupRefMap: Map<string, InstanceType<typeof EnFields>> = new Map();

  const enOnlyDelete = async () => {
    if (!window.confirm('确定要删除吗？')) {
      return;
    }
    await entityRef.value?.Delete();
    const tabRef = useMultipleTabStore();
    const currentTab = tabRef.getTabList.find((item) => item.fullPath === router.currentRoute.value.fullPath);
    if (currentTab) {
      tabRef.closeTab(currentTab, router);
    }
  };

  // const _enOnlyInsert = async () => {
  //   await entityRef.value?.Init();
  // };

  /**
   * 这里处理的是Map对象的里面的附件，不是字段的。
   */
  const cleanFileRow = async (entity: Entity) => {
    try {
      loading.value = true;
      entity.SetValByKey('MyFileName', '');
      entity.SetValByKey('MyFilePath', '');
      entity.SetValByKey('MyFileExt', '');
      entity.SetValByKey('MyFileSize', '');
      entity.SetValByKey('WebPath', '');
      await entity.Update();
      row.value = numberToBoolean(mapAttrs.value as any, Object.fromEntries(entity.Row));
    } catch (e: any) {
      message.error(e.toString());
    } finally {
      loading.value = false;
    }
  };
  const { mapUploadFileList, handleRemove, uploadAttrBindFile, deleteEntityMapFile, uploadEntityMapFile } = useFileUpload();
  const removeEntityFile = async (file: UploadFile) => {
    handleRemove(file);
    const entity = unref(entityRef);
    if (!entity) {
      return;
    }
    await deleteEntityMapFile(EnName, entity.PKVal);
    await cleanFileRow(entity);
  };
  // 附件 end
  // 获取表单数据
  const getFileList = async () => {
    await nextTick();
    const fileList: Array<UploadFile> = [];
    // 如果存在分组
    if (tabs.value.length > 0) {
      // 如果是展示为tab模式，这个时候应该只会渲染出一个组件
      if (groupBarShowMode.value === 'tab') {
        Array.from(tabRefMap.values())
          .filter((item) => !!item)
          .forEach((fieldGroup) => {
            const innerFileList = fieldGroup.FileList as unknown as UploadFile[];
            fileList.push(...innerFileList);
          });
      } else if (groupBarShowMode.value === 'group-bar') {
        Array.from(groupRefMap.values())
          .filter((item) => !!item)
          .forEach((fieldGroup) => {
            const innerFileList = fieldGroup.FileList as unknown as UploadFile[];
            fileList.push(...innerFileList);
          });
      }
    } else {
      const innerFileList = (basicField.value?.FileList || []) as unknown as UploadFile[];
      fileList.push(...innerFileList);
    }
    return fileList;
  };

  const enOnlySave = async (isDo) => {
    try {
      await nextTick();
      loading.value = true;
      // const rowData = tabs.value.length === 0 && mapAttrs.value.length > 0 ? basicField.value?.rowData : groupField.value?.rowData;
      // const fileList = tabs.value.length === 0 && mapAttrs.value.length > 0 ? basicField.value?.FileList : groupField.value?.FileList;
      const rowData = unref(row);
      const fileList = await getFileList();

      if (!rowData) {
        message.error('row 数据为空');
        return;
      }
      const resultRow = booleanToNumber(mapAttrs.value as any, rowData);
      if (!entityRef.value) {
        message.error('没有找到Entity,请检查');
        loading.value = false;
        return;
      }
      const keys = Object.keys(resultRow);
      for (const key of keys) {
        entityRef.value.SetValByKey(key, resultRow[key]);
      }
      const isExistPKVal = !!entityRef.value.PKVal ? await entityRef.value?.IsExits() : false;
      // 转换
      if (isExistPKVal == false) {
        await entityRef.value?.Insert();
        console.log('插入成功', unref(entityRef));
        emit('update-pk', entityRef.value?.PKVal);
        if (isDo) message.success('插入成功');
      } else {
        const data = await entityRef.value?.Update();
        if (isDo && data != -1) message.success('更新成功');
      }
      //存在附件上传附件信息
      const newAttrs = mapAttrs.value.filter((mapAttr) => mapAttr.UIContralType === UIContralType.AthShow && mapAttr.UIIsReadonly == false);
      if (newAttrs.length > 0) {
        if (fileList.length > 0) {
          const { PK, classID, PKVal } = entityRef.value;
          //存在附件执行上传
          await uploadAttrBindFile(EnName, PK, classID, PKVal, fileList, newAttrs[0]);
        }
      }
      // 如果map存在附件信息
      // 暂时只处理了单个附件
      const mapFileList = unref(mapUploadFileList);
      if (entityRef.value._enMap.HisBPEntityAthType > 0 && mapFileList.length > 0) {
        const { PKVal } = entityRef.value;
        const fileObj = mapFileList[0].originFileObj;
        if (!!fileObj) {
          await uploadEntityMapFile(EnName, PKVal, fileObj);
          loading.value = true;
          await entityRef.value.RetrieveFromDBSources();
          await entityRef.value.Update();
          setTimeout(() => {
            loading.value = false;
          }, 20);
        }
      }
      // await entityRef.value?.Retrieve();
      // 过滤
      row.value = numberToBoolean(mapAttrs.value as any, Object.fromEntries(entityRef.value.Row));
      saved.value = true;
      emit('trigger-close');
      if (isDo) {
        loading.value = false;
        setTimeout(() => {
          emit('RefreshSystem');
        }, 2000);
      }
    } catch (e: any) {
      console.error(e);
      message.error(e.toString());
      throw new Error(e.toString());
    } finally {
      loading.value = false;
    }
  };
  /**
   * 单附件上传
   * @param pkval
   * @param fileList
   * @param attr
   */

  // const enOnlySetting = () => {
  //   message.info('暂未实现');
  // };
  // 获取选项
  const getSelectOption = async (attr: Attr) => {
    const { getDDLData } = useDDLDataLoader(toRaw(entityRef?.value) as Entity);
    try {
      return await getDDLData(attr);
    } catch (e) {
      message.error(`解析选项失败: ${e}`);
      console.trace(e);
      return [];
    }
  };
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });

  // 查找字段区间
  function searchFields(groupName: string): any[] {
    if (!groupName) return mapAttrs.value.filter((attr) => !!attr.UIVisible);
    return mapAttrs.value.filter((attr) => attr.UIVisible && attr.GroupName === groupName);
  }

  type GroupModel = 'tab' | 'group-bar';
  type LoopAttr = Attr & {
    ddl: any[];
    mapExt: any[];
  };
  const groupBarShowMode = ref<GroupModel>('tab');
  const funcList = ref<FuncButton[]>([]); // 工具栏方法列表
  const funcToolbarVisible = ref(false);
  const msgType = ref<string>('');
  const isTask = ref<boolean>(false);
  const rms = ref<Array<RefMethod>>([]);
  // const btnLoading = ref<boolean>(false);
  const dtlSearchList = ref<RefMethod[]>([]);
  const sendDisabled = ref<boolean>(false);
  const entityWG = ref<Nullable<WaiGuaBaseEntity>>(null);
  const InitPage = async () => {
    try {
      loading.value = true;
      if (!EnName) {
        errorObj.hasError = true;
        errorObj.tips = '缺少参数 [ enName ]';
        return;
      }
      const enName = EnName as string;
      entityWG.value = await ClassFactoryOfWaiGuaEntity.GetEn(('WGEntity_' + enName.substring(enName.lastIndexOf('.') + 1)) as string);
      if (entityWG.value != null) entityWG.value.params = props.params;
      if (props.entityRef instanceof Entity && props.entityRef.PKVal.toString() === props.PKVal.toString()) {
        entityRef.value = props.entityRef;
        rms.value = entityRef.value._enMap.rms;
        uacRef.value = entityRef.value?.HisUAC;
        console.log(`相同实体 [${EnName}] - [PK: ${props.PKVal}] 已复用`);
      } else {
        const entity = await ClassFactory.GetEn(EnName as string);
        await entity.Init();
        rms.value = entity._enMap.rms;
        const uac = entity.HisUAC;
        if (!uac.IsView) {
          errorObj.hasError = true;
          errorObj.tips = '非法用户';
          return;
        }
        if (!PKVal && !uac.IsInsert) {
          errorObj.hasError = true;
          errorObj.tips = '您对[' + entity.classID + ']没有新增权限.';
          return;
        }
        if (PKVal) {
          entity.setPKVal(PKVal);
          await entity.RetrieveFromDBSources();
        } else {
          const params = props.params || {};
          const args = cloneDeep(params);
          delete args.EnName;
          // const ret: string[] = [];
          const keys = Object.keys(args);
          if (keys.length > 0) {
            keys.forEach((key) => {
              // ret.push(key, args[key] as string);
              if (args[key] && !entity.GetValByKey(key)) entity.SetValByKey(key, args[key]);
            });
          }
          // await entity.Retrieve();
        }
        entityRef.value = entity;
        // 处理工具栏方法列表
        const refMethods = entity._enMap.rms.filter((rm) => {
          return [RefMethodType.FuncToolbar, RefMethodType.RightFrameOpen].includes(rm.RefMethodType) && !!rm.ClassMethod;
        });
        if (entityWG.value != null) {
          const btns = entityWG.value?.EntityToolbarBtns;
          if (!!btns) {
            btns.split(',').forEach((item) => {
              const refMethod: RefMethod = new RefMethod();
              refMethod.Title = item;
              refMethod.ClassMethod = item;
              refMethod.Tag = 'WaiGua';
              refMethods.push(refMethod);
            });
          }
        }
        funcList.value = refMethods.map((func) => {
          return {
            id: func.ClassMethod as string,
            name: func.Title || '',
            onclick: debounce(async () => {
              const classMethod = (func.ClassMethod as string) || '';
              try {
                console.log('sendDisabled.value', sendDisabled.value);
                await enOnlySave(false);
                if (entityWG.value != null && func.Tag === 'WaiGua') {
                  //执行自定义的方法
                  await entityWG.value?.BtnClick('EntityToolbar', func.Title as string, '', unref(row) || {});
                  return;
                }
                const myentity = unref(entityRef)!;
                const method = myentity[func.ClassMethod as string].bind(myentity);
                const res = await method();
                if (typeof res === 'object') {
                  let result = res.data;
                  if (['SendFlow', 'ShiftFlow', 'HuiQian_Send', 'DoHungup', 'SendCC'].includes(classMethod)) {
                    if (
                      res.ReturnType === GPNReturnType.DoNothing &&
                      (classMethod === 'ShiftFlow' || classMethod === 'SendFlow' || classMethod === 'DoHungup' || classMethod === 'SendCC')
                    ) {
                      isOnlyClose.value = true;
                    } else if (res.ReturnType === GPNReturnType.Message && (classMethod === 'ShiftFlow' || classMethod === 'DoHungup')) {
                      message.warn(result);
                      if (classMethod === 'ShiftFlow') {
                        if (props.WGFlow != null) await new WaiGuaFlow(props.WGFlow).ShiftAfter();
                      }
                      isOnlyClose.value = true;
                    } else {
                      if (classMethod === 'SendFlow') {
                        //选择接收人弹窗，设置发送后禁用按钮操作
                        sendDisabled.value = true;
                        if (props.WGFlow != null) await new WaiGuaFlow(props.WGFlow).SendSuccess();
                        await afterSend(props.mainData, '', props.params.FK_Flow, props.params.FK_Node, props.params.WorkID);
                      }
                      isShowMsg.value = true;
                      //发送、移交成功后关闭弹窗的关闭按钮
                      const eles = document.getElementsByClassName('ant-modal-close-x') as unknown as NodeListOf<HTMLElement>;
                      if (eles && eles.length > 0) eles[0].style.display = 'none';
                      if (result.includes('@IsCanUnSend=1') == true) {
                        isHaveUnSend.value = true;
                        //移除该操作
                        // const str = result.split('撤销本次发送');
                        //result = str[0].substring(0, str[0].lastIndexOf('@')) + str[1].substring(str[1].indexOf('@'));
                        result = result.replace('@IsCanUnSend=1', '');
                      }
                      if (result.includes('@IsCanTask=1') == true) {
                        isTask.value = true;
                        //移除该操作
                        //const str = result.split('指定特定的处理人处理');
                        //result = str[0].substring(0, str[0].lastIndexOf('@')) + str[1].substring(str[1].indexOf('@'));
                        result = result.replace('@IsCanTask=1', '');
                      }
                      msgType.value = 'msg';
                      msg.value = splitAtString(result);
                      //发送后返回消息，添加标签、字体样式
                      msg.value.forEach((item, idx, arr) => {
                        arr[idx] = `<span style="font-size:17px">${item}</span>`;
                      });
                      console.log('msg.value', msg.value);
                      if (['SendFlow', 'ShiftFlow', 'DoHungup'].includes(classMethod)) isOnlyClose.value = false;
                      if (['HuiQian_Send', 'SendCC'].includes(classMethod)) isOnlyClose.value = true;
                    }
                  } else {
                    emit('handle-gpn-callback', res);
                  }
                }
              } catch (e: any) {
                if (classMethod === 'SendFlow') {
                  if (props.WGFlow != null) await new WaiGuaFlow(props.WGFlow).SendError();
                }
                message.error(e.toString());
              }
            }, 500),
          };
        });
        uacRef.value = uac;
        console.log(uac);
      }

      if (props.enCfgRef instanceof EnCfg) {
        enCfgRef.value = props.enCfgRef;
      } else {
        const config = new EnCfg(EnName);
        await config.Init();
        // config.setPKVal(innerPKVal)
        if (!(await config.RetrieveFromDBSources())) {
          await config.Insert();
        }
        enCfgRef.value = config;
      }
      const entity = unref(entityRef)!;
      const attrs = entity._enMap.attrs as unknown as LoopAttr[];
      const enMapexts = entity._enMap.enMapExts;
      console.log({ entity });
      // 判断优先级，EnCfg > enMap
      const getDisplayMode = () => {
        if (!enCfgRef.value?.FieldGroupDisplayMode) {
          return entity._enMap.GroupBarShowModel === 0 ? 'tab' : 'group-bar';
        }
        return parseInt(enCfgRef.value?.FieldGroupDisplayMode) === 1 ? 'tab' : 'group-bar';
      };
      groupBarShowMode.value = getDisplayMode();
      // 从字段中过滤出分组
      tabs.value = Array.from(new Set(attrs.filter((attr) => !!attr.GroupName).map((attr) => attr.GroupName))).map((groupName: string) => {
        return {
          key: groupName,
          name: groupName,
          tips: '',
        };
      });
      for (const attr of attrs) {
        // 处理下拉框
        if (attr.UIContralType === UIContralType.DDL || attr.UIContralType === UIContralType.RadioBtn) {
          attr.ddl = await getSelectOption(attr);
          const oldData = entity.Row.get(attr.Key);
          if (oldData || oldData === 0) {
            entity.Row.set(attr.Key, oldData);
          }
        }
        //判断是否有扩展属性
        if (enMapexts.length == 0) continue;
        const arr = enMapexts.filter((item) => item.AttrOfOper === attr.Key);
        attr['mapExt'] = arr;
        //是否是pop弹窗
        if (
          attr.MyDataType === DataType.AppString &&
          attr.MyFieldType === FieldType.Normal &&
          attr.UIContralType === UIContralType.TB &&
          attr['mapExt'] &&
          attr['mapExt'].length > 0
        ) {
          if (!!entity.Row.GetValByKey(attr.Key) && !!entity.Row.GetValByKey(attr.Key + 'T') && entity.Row.GetValByKey(attr.Key) != '"null"') {
            let val = (entity.Row.GetValByKey(attr.Key + 'T') || '').toString();
            val = val.startsWith(',') ? val.substring(1) : val;
            entity.Row.SetValByKey(attr.Key + 'T', val);
          }
        }
      }
      mapAttrs.value = attrs;
      dtlSearchList.value = entity._enMap.rms.filter((rm) => rm.RefMethodType === RefMethodType.Dtl);
      // 过滤
      row.value = numberToBoolean(mapAttrs.value as any, Object.fromEntries(entity.Row));
      console.log(unref(row));
      // rms.value = rms.value.filter((rm) => rm.RefMethodType === RefMethodType.FuncToolbar);
      // 暂时只处理单附件回显
      if (entity._enMap.HisBPEntityAthType > 0) {
        if (row.value['WebPath']) {
          const { VITE_GLOB_API_URL } = getAppEnvConfig();
          mapUploadFileList.value = [{ uid: Math.random() + '', name: row.value['MyFileName'], url: VITE_GLOB_API_URL + row.value['WebPath'] }];
        }
      }
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const tabBarStyle = computed(() => {
    const emptyBtn = props.noSaveButton && funcList.value.length === 0;
    return {
      display: emptyBtn ? 'none' : 'flex',
      '--nav-scroll-visible': tabs.value.length === 1 ? 'hidden' : 'visible',
    };
  });
  const emptyBtnCls = computed(() => {
    const isEmptyBtnList = props.noSaveButton && funcList.value.length === 0;
    return {
      'p-4': !isEmptyBtnList,
    };
  });
  const contentBgStyle = computed(() => {
    return { backgroundColor: groupBarShowMode.value === 'tab' ? 'white' : 'transparent', paddingBottom: '40px' };
  });
  const handleCancel = () => {
    emit('handleCancel', isOnlyClose.value);
  };
  const UnSend = () => {
    emit('UnSend');
  };
  onMounted(async () => {
    await InitPage();
  });
  defineExpose({ enOnlySave });
</script>
<style lang="less" scoped>
  .p-4 {
    padding: 0;
  }

  .right-btns {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 12px;
  }

  .content {
    background-color: white;
    // padding: 1rem 1rem 2rem;
    margin-top: 0;
    min-height: 46px;

    .btn_style {
      height: 30px;
      border-radius: 5px;
    }

    .btnPosition {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    :deep(.ant-tabs-top-content) {
      margin-top: 12px;
    }

    :deep(.ant-tabs-nav-scroll) {
      min-height: 46px;
    }

    :deep(.ant-tabs-nav-wrap) {
      visibility: var(--nav-scroll-visible);
    }

    :deep(.ant-tabs-tab) {
      margin-right: 0;
    }
  }

  .van-tabbar-item {
    // font-size: inherit;
    flex: none !important;
  }

  :deep(.van-tabbar-item__text) {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .setBottombtn {
    width: 50%;
    padding: 0;
    margin: 0;
    height: 100%;
    border-radius: 0;
    background-color: #fff;
    color: #000;
    border: none;
  }

  .label {
    min-height: 32px;
    line-height: 32px;
  }

  .ant-tabs-tab-active .ant-tabs-tab {
    margin-right: 4px;
  }

  .tool-bar {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100vw;
    z-index: 999;
    width: 100vw;
    height: 60px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .van-tabbar-item--active {
    // background-color: #4356ff;
    color: #fff;
    height: 100%;
  }

  .ath-field {
    margin-top: 20px;
  }

  .content-wrapper {
    height: calc(var(--viewport-height) - 100px);
    overflow-y: auto;
  }

  .van-nav-bar--fixed {
    background-color: #4356ff;
    color: #fff;
    z-index: 99;
  }

  .func-toolbar {
    width: 100vw;
    box-sizing: border-box;
    padding: 10px 16px;
  }

  .van-h5 {
    position: relative;
    padding: 15px 24px;
    margin-bottom: 0;
    color: #000;
    font-size: 15px;
    font-weight: 700;
  }

  .van-h5::before {
    content: '';
    position: absolute;
    top: 30%;
    left: 0px;
    width: 5px;
    height: 18px;
    border-radius: 10px;
    background-color: #4356ff;
  }
</style>
