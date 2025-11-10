<template>
  <ThemeWrapper style="padding: 0px 16px 16px 16px">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content" :style="contentBgStyle">
        <div v-if="isShowMsg" style="box-shadow: 0px 0px 4px 2px #cccccc57; padding: 15px; margin: 10px; background-color: #fff">
          <SendMsg :params="params" :sendFlow="sendFlow" :mainData="mainData" :WGFlow="WGFlow" @handleCancel="handleCancel" @UnSend="UnSend" />
        </div>
        <div v-else>
          <Tabs
            v-if="groupBarShowMode === 'tab'"
            :style="{
              backgroundColor: '#fff',
              padding: groupBarShowMode === 'tab' ? '10px 16px' : '',
            }"
            :tab-bar-style="tabBarStyle"
            type="card"
            class="sticky-tabs"
          >
            <template #rightExtra>
              <FuncToolbar
                v-if="funcList.length > 0"
                :list="funcList"
                margin="left"
                :isDelayedSend="isDelayedSend"
                :row="row"
                :delay-send-time="delaySendTime"
                :params="props.params"
                @handle-cancel="handleCancel"
              />
              <template v-if="uacRef.IsUpdate">
                <Button v-if="!noSaveButton" class="btn_style btn_save" style="margin-left: 6px; color: #fff" type="primary" :disabled="!uacRef.IsUpdate" @click="enOnlySave(true)">
                  <template #icon> <save-outlined /> </template>{{ '保存' }}</Button
                >
              </template>
              <template v-if="uacRef?.IsDelete">
                <Button danger style="margin-left: 6px" class="btn_style" v-if="uacRef?.IsDelete && !noSaveButton" @click="enOnlyDelete">
                  <template #icon> <close-circle-outlined /> </template>{{ '删除' }}</Button
                >
              </template>
              <Button v-if="enableEnSetting" class="btn_style" @click="enOnlySetting" style="margin-left: 6px">
                <template #icon> <setting-outlined /> </template>{{ '设置' }}</Button
              >
              <Button style="margin-left: 6px" class="btn_style" shape="round" type="primary" @click="switchGroupDisplayMode('group-bar')"><i class="icon-layers"></i></Button>
            </template>
            <!--包含分组的情况-->
            <TabPane
              v-for="tab in tabs"
              :key="tab.key"
              :tab="tab.name"
              :style="{
                paddingTop: tab.type == 'component' ? '30px' : '',
              }"
            >
              <DelaySend v-if="props.isDelayedSend" :delay-send-time="delaySendTime" @update-time="updateDelayTime" />
              <component
                v-if="tab.type == 'component'"
                :is="useCachedComponentLoader(tab.compSrc!)"
                :main-table-info="{
                  row,
                  classId: EnName,
                }"
                :ref="(el: any) => setTabCompMap(el, tab.key)"
                :params="getAllRequestParams(tab.compSrc!)"
                :disabled="!entityRef?.PKVal"
                :readonly="!uacRef.IsUpdate"
                :dtl-key="tab.key"
                @save-main-table="saveAndRefresh"
              />
              <EnFields
                v-if="tab.type == 'group' && searchFields(tab.key).length > 0 && !loading"
                :ref="(el: any) => setTabRefMap(el, tab.key)"
                :row-data="row"
                :map-attrs="searchFields(tab.key)"
                :all-map-attrs="mapAttrs"
                :pk="entityRef?.PK"
                :map-exts="entityRef?._enMap?.enMapExts"
                :pk-val="entityRef?.PKVal"
                :athPKVal="athRefPKVal"
                :validator="getFormRule(entityRef!, entityWG!)"
                :entity-ref="entityRef"
                :aths="aths"
                :entity-wg="entityWG"
                :saved-state="saved"
                :is-readonly="!uacRef.IsUpdate"
                @open-field-ath="openFieldAth"
              />
            </TabPane>
          </Tabs>
          <template v-if="groupBarShowMode === 'group-bar'">
            <div class="form-main">
              <div class="tool-bar sticky-toolbar" v-if="!noSaveButton">
                <FuncToolbar
                  v-if="funcList.length > 0"
                  :list="funcList"
                  :delay-send-time="delaySendTime"
                  :isDelayedSend="isDelayedSend"
                  :row="row"
                  :params="props.params"
                  @handle-cancel="handleCancel"
                  margin="left"
                />
                <template v-if="uacRef.IsUpdate">
                  <Button class="btn_style btn_save" style="margin-left: 12px; color: #fff" :disabled="!uacRef.IsUpdate" type="primary" @click="enOnlySave(true)">
                    <template #icon> <save-outlined /> </template>{{ '保存' }}</Button
                  >
                </template>
                <template v-if="uacRef?.IsDelete">
                  <Button danger style="margin-left: 12px" class="btn_style" v-if="uacRef?.IsDelete && !noSaveButton" @click="enOnlyDelete">
                    <template #icon> <close-circle-outlined /> </template>{{ '删除' }}</Button
                  >
                </template>
                <Button v-if="enableEnSetting" class="btn_style" @click="enOnlySetting" style="margin-left: 12px">
                  <template #icon> <setting-outlined /> </template>{{ '设置' }}</Button
                >
                <Button style="margin-left: 12px" shape="round" type="primary" class="btn_style" @click="switchGroupDisplayMode('tab')"><i class="icon-folder-alt"></i></Button>
              </div>
              <GroupWrapper v-for="tab in tabs" :key="tab.key" :title="getCompTitle(tabs, tab)" :content-style="tab.type == 'component' ? { padding: 0 } : {}">
                <DelaySend v-if="props.isDelayedSend" :delay-send-time="delaySendTime" @update-time="updateDelayTime" />
                <component
                  v-if="tab.type == 'component'"
                  :ref="(el: any) => setGroupCompMap(el, tab.key)"
                  :is="useCachedComponentLoader(tab.compSrc!)"
                  :params="{
                    ...getAllRequestParams(tab.compSrc!),
                    title: tab.name,
                  }"
                  :height="tab.height"
                  :disabled="!entityRef?.PKVal"
                  :readonly="!uacRef.IsUpdate"
                  @save-main-table="saveAndRefresh"
                  :dtl-key="tab.key"
                  :main-table-info="{
                    row,
                    classId: EnName,
                  }"
                />
                <EnFields
                  v-if="tab.type == 'group' && searchFields(tab.key).length > 0 && !loading"
                  :ref="(el: any) => setGroupRefMap(el, tab.key)"
                  :row-data="row"
                  :map-attrs="searchFields(tab.key)"
                  :all-map-attrs="mapAttrs"
                  :pk="entityRef?.PK"
                  :map-exts="entityRef?._enMap?.enMapExts"
                  :pk-val="entityRef?.PKVal"
                  :athPKVal="athRefPKVal"
                  :validator="getFormRule(entityRef!, entityWG!)"
                  :aths="aths"
                  :entity-wg="entityWG"
                  :saved-state="saved"
                  :en-name="EnName"
                  :entity-ref="entityRef"
                  :is-readonly="!uacRef.IsUpdate"
                  @open-field-ath="openFieldAth"
                />
              </GroupWrapper>
            </div>
          </template>
          <EnFields
            v-if="tabs.length === 0 && mapAttrs.length > 0 && !loading"
            ref="basicField"
            :row-data="row"
            :map-attrs="searchFields(mapAttrs[0].Key)"
            :all-map-attrs="mapAttrs"
            :pk="entityRef?.PK"
            :pk-val="entityRef?.PKVal"
            :athPKVal="athRefPKVal"
            :validator="getFormRule(entityRef!, entityWG!)"
            :aths="aths"
            :saved-state="saved"
            :en-name="EnName"
            :entity-ref="entityRef"
            :entity-wg="entityWG"
            :is-readonly="!uacRef.IsUpdate"
            @open-field-ath="openFieldAth"
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
              <p class="ant-upload-text">{{ '点击或拖动到此处上传' }}</p>
            </Dragger>
          </template>
          <EnSubTable v-if="PKVal" :subTables="(subTables as any)" :entityName="entityRef?.classID" :innerPKVal="PKVal" />
        </div>
      </div>
    </Spin>
  </ThemeWrapper>
</template>

<script lang="ts" setup>
  import { Button, Divider, message, Spin, TabPane, Tabs, Upload, UploadFile } from 'ant-design-vue';
  import { CloseCircleOutlined, InboxOutlined, SaveOutlined, SettingOutlined } from '@ant-design/icons-vue';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { computed, getCurrentInstance, inject, nextTick, onMounted, PropType, reactive, ref, shallowRef, toRaw, unref } from 'vue';
  import { Entity } from '/@/bp/en/Entity';
  import { Attr } from '/@/bp/en/Map/Attr';
  import { FieldType, UIContralType } from '/@/bp/en/EnumLab';
  import { useTypeConvert } from '/@/hooks/ens/useDataConvert';
  import { cloneDeep } from 'lodash-es';
  import EnFields from '/@/WF/Comm/subComponents/EnFields.vue';
  import DelaySend from '/@/WF/Comm/subComponents/DelaySend.vue';
  import { useDDLDataLoader } from '/@/hooks/ens/useDDLDataLoader';
  import GroupWrapper from '/@/WF/Comm/subComponents/GroupWrapper.vue';
  import { RefMethod, RefMethodType, SubTableInfo } from '/@/bp/en/Map/RefMethod';
  import { Row } from '/@/bp/en/Map/Row';
  import { UAC } from '/@/bp/en/Map/UAC';
  import { useFileUpload } from '/@/hooks/ens/useFileUpload';
  import { getAppEnvConfig } from '/@/utils/env';
  import { useMultipleTabStore } from '/@/store/modules/multipleTab';
  import { useRouter } from 'vue-router';
  import ThemeWrapper from './ThemeWrapper.vue';
  import { EnCfg } from '/@/bp/sys/EnCfg';
  import type { FuncButton } from './Methods';
  import FuncToolbar from './UIEntity/FuncToolbar.vue';
  import { DataType } from '/@/bp/en/DataType';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import EnSubTable from './subComponents/EnSubTable.vue';
  import BaseComponent from './BaseComponent.vue';
  import { useEntityValidator } from '../../hooks/ens/useEntityValidator';
  import useCachedComponentLoader from '/@/hooks/ens/useCachedComponentLoader';
  import dayjs from 'dayjs';
  import { FrmAttachmentDBs } from '/@/WF/Admin/FrmLogic/FrmAttachment/FrmAttachmentDB';
  import { getAllRequestParams } from '/@/utils/request/decode';
  import { WaiGuaFlow } from '/@/WF/CCForm/WaiGuaFlow';
  import { WaiGuaBaseEntity } from '../../bp/UIEntity/WaiGuaBaseEntity';
  import { ClassFactoryOfWaiGuaEntity } from '/@/WF/Comm/UIEntity/ClassFactoryOfWaiGuaEntity';
  import { FrmAttachment } from '../Admin/FrmLogic/FrmAttachment/FrmAttachment';
  import SendMsg from '/@/WF/WorkOpt/SendMsg.vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { GloComm } from './GloComm';
  import WebUser from '/@/bp/web/WebUser';
  import { getFormRule } from './Util/entityUtils';
  import { AtPara } from '/@/bp/da/AtPara';

  const Dragger = Upload.Dragger;
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
    isDelayedSend: {
      type: Boolean,
      default: false,
    },
    subTables: {
      type: Object as PropType<Array<SubTableInfo>>,
    },
    baseComp: {
      type: Object as PropType<InstanceType<typeof BaseComponent>>,
    },
    mainData: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
    // eslint-disable-next-line vue/prop-name-casing
    WGFlow: {
      type: Object as PropType<WaiGuaFlow>,
      default: null,
    },
  });
  interface EnOnlyTabs {
    key: string;
    name: string;
    type: 'group' | 'component';
    compSrc: string | null;
    height: number;
  }
  //延期发送
  interface TimeValue {
    days: number;
    hours: number;
    mins: number;
  }
  const delaySendTime = reactive<TimeValue>({
    days: 0,
    hours: 0,
    mins: 0,
  });

  const updateDelayTime = (key, val) => {
    delaySendTime[key] = val;
  };

  const loading = ref(false);
  const tabs = ref<Array<EnOnlyTabs>>([]);
  const mapAttrs = ref<Array<Attr>>([]);
  const row = ref<Record<string, any>>();
  const entityRef = ref<Entity>();
  const enCfgRef = ref<EnCfg>();
  const saved = ref(false);
  //显示信息
  const isShowMsg = ref(false);
  const isOnlyClose = ref(false);
  const uacRef = ref(new UAC());
  const athRefPKVal = ref();
  const aths = ref<any[]>([]);
  //执行方法显示
  const emit = defineEmits(['handle-gpn-callback', 'handleCancel', 'UnSend', 'update-pk']);
  const EnName = props.EnName || props.params?.EnName || '';
  const PKVal = props.PKVal || props.params?.PKVal || props.params?.SortNo || '';
  const { booleanToNumber, numberToBoolean } = useTypeConvert();
  const basicField = shallowRef<InstanceType<typeof EnFields>>();
  const router = useRouter();

  const tabRefMap: Map<string, InstanceType<typeof EnFields>> = new Map();
  const setTabRefMap = (el: Nullable<InstanceType<typeof EnFields>>, key: string) => {
    if (el) {
      tabRefMap.set(key, el);
    }
  };
  const groupRefMap: Map<string, InstanceType<typeof EnFields>> = new Map();
  const setGroupRefMap = (el: Nullable<InstanceType<typeof EnFields>>, key: string) => {
    if (el) {
      groupRefMap.set(key, el);
    }
  };

  const tabCompMap: Map<string, any> = new Map();
  const setTabCompMap = (el: any, key: string) => {
    if (!el) return;
    tabCompMap.set(key, el);
  };

  const groupCompMap: Map<string, any> = new Map();
  const setGroupCompMap = (el: any, key: string) => {
    if (!el) return;
    groupCompMap.set(key, el);
  };

  const getCompTitle = (tabs, tab) => {
    if (tab.hideTitle) {
      return undefined;
    }
    return tabs.length > 1 ? tab.name : undefined;
  };

  const instance = getCurrentInstance();
  // 定义一个函数来获取顶级组件
  const getRootComponent = (instance: any): any => {
    let currentInstance = instance;
    while (currentInstance?.parent) {
      currentInstance = currentInstance.parent;
      const _name = currentInstance.type.__name;
      if (!!_name && (_name === 'GroupPageNew' || _name === 'DtlSearch' || _name === 'DtlBatch')) {
        return currentInstance;
      }
    }
    return null;
  };
  const enOnlyDelete = async () => {
    if (!window.confirm('确定要删除吗？')) {
      return;
    }
    await entityRef.value?.Delete();
    const tabRef = useMultipleTabStore();
    const currentTab = tabRef.getTabList.find((item) => item.fullPath === router.currentRoute.value.fullPath);
    if (currentTab) {
      tabRef.closeTab(currentTab, router);
      return;
    }
    const rootComponet = getRootComponent(instance);
    if (rootComponet != null) {
      if (rootComponet.type.__name === 'DtlSearch') await (rootComponet.exposed as any).editClosed(true);
      if (rootComponet.type.__name === 'GroupPageNew') (rootComponet.exposed as any).resetCallback();
    }
  };

  const enableEnSetting = computed(() => WebUser.IsAdmin && EnName != 'TS.User.EnOnlyCfg' && EnName != 'TS.WorkOpt.Send');
  // 这里处理的是Map对象的里面的附件，不是字段的。
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
  const { mapUploadFileList, handleRemove, deleteEntityMapFile, uploadEntityMapFile } = useFileUpload();
  const removeEntityFile = async (file: UploadFile) => {
    handleRemove(file);
    const entity = unref(entityRef);
    if (!entity) {
      return;
    }
    await deleteEntityMapFile(EnName, entity.PKVal + '');
    await cleanFileRow(entity as Entity);
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
            const innerFileList = fieldGroup.FileList;
            fileList.push(...innerFileList);
          });
      } else if (groupBarShowMode.value === 'group-bar') {
        Array.from(groupRefMap.values())
          .filter((item) => !!item)
          .forEach((fieldGroup) => {
            const innerFileList = fieldGroup.FileList;
            fileList.push(...innerFileList);
          });
      }
    } else {
      const innerFileList = basicField.value?.FileList || [];
      fileList.push(...innerFileList);
    }
    return fileList;
  };
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });

  const saveAndRefresh = async () => {
    await enOnlySave(true);
    tabs.value = [];
    await nextTick();
    await initAttrs(entityRef.value!);
  };
  const enOnlySave = async (reload) => {
    try {
      await nextTick();
      // 保存从表，显示EnOnly的时候
      let subTables: Recordable[] = [];
      if (groupBarShowMode.value === 'tab') {
        subTables = Array.from(tabCompMap.values()).filter((item) => !!item);
      } else if (groupBarShowMode.value === 'group-bar') {
        subTables = Array.from(groupCompMap.values()).filter((item) => !!item);
      }
      for (const subTable of subTables) {
        if (typeof subTable?.Save === 'function') {
          try {
            await subTable?.Save?.();
          } catch (e: any) {
            message.error('从表保存失败');
            return;
          }
        }
      }

      loading.value = true;
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

      const errs: string[] = [];
      let _en_fields_list: Array<InstanceType<typeof EnFields>> = [];
      if (groupBarShowMode.value === 'tab') {
        _en_fields_list = Array.from(tabRefMap.values()).filter((item) => !!item);
      } else if (groupBarShowMode.value === 'group-bar') {
        _en_fields_list = Array.from(groupRefMap.values()).filter((item) => !!item);
      }
      for (const _en_field of _en_fields_list) {
        const err = await _en_field?.validateForm();
        if (err) {
          errs.push(err);
        }
      }
      if (errs.length > 0) {
        message.info('您存在未填写或填写不正确的必填数据，请按照正确的格式进行填写.');
        return;
      }
      // 验证字符串是否过长
      const errorFields: string[] = [];
      const ruleKeys = Object.keys(formRules.value);
      const attrs = entityRef.value._enMap.attrs;
      for (const rKey of ruleKeys) {
        const rule = formRules.value[rKey][0];
        if (typeof resultRow[rKey] === 'string' && resultRow[rKey].length > rule.max) {
          const title = attrs.find((at) => at.Key === rKey)?.Desc;
          if (title) errorFields.push(title);
        }
      }
      if (errorFields.length > 0) {
        message.error(`字段 [${errorFields.join(',')}] 长度过长，请检查。`);
        return;
      }

      const rowKeys = Object.keys(resultRow);
      for (const key of rowKeys) {
        entityRef.value.Row.set(key, resultRow[key]);
      }
      const isExistPKVal = !!entityRef.value.PKVal ? await entityRef.value?.IsExits() : false;
      // 转换
      // entityoid实体插入数据去掉不等于0的判断
      if (isExistPKVal == false) {
        entityRef.value.FrmID = props.params.RefPKVal || entityRef.value.FrmID;
        entityRef.value.TempFilePath = fileList[0]?.name;
        const success = await entityRef.value?.Insert();
        if (!success) {
          message.error('保存失败');
          return;
        }
        emit('update-pk', entityRef.value?.PKVal);
      } else {
        await entityRef.value?.Update();
        if (reload) emit('update-pk', entityRef.value?.PKVal);
      }
      //存在附件上传附件信息
      const newAttrs = mapAttrs.value.filter((mapAttr) => mapAttr.UIContralType === UIContralType.AthShow && mapAttr.UIIsReadonly == false);
      if (newAttrs.length > 0) {
        //修改附件的存储的refPKVal
        if (athRefPKVal.value != entityRef.value?.PKVal) {
          const dbs = new FrmAttachmentDBs();
          await dbs.Retrieve('RefPKVal', athRefPKVal.value);
          for (const db of dbs) {
            db.RefPKVal = entityRef.value?.PKVal;
            await db.Update();
          }
        }
      }
      // 如果map存在附件信息
      // 暂时只处理了单个附件
      const mapFileList = unref(mapUploadFileList);
      if (entityRef.value._enMap.HisBPEntityAthType > 0 && mapFileList.length > 0) {
        const { PKVal } = entityRef.value;
        const fileObj = mapFileList[0].originFileObj;
        if (!!fileObj) {
          await uploadEntityMapFile(EnName, PKVal + '', fileObj);
          loading.value = true;
          await entityRef.value.RetrieveFromDBSources();
          await entityRef.value.Update();
          setTimeout(() => {
            loading.value = false;
          }, 20);
        }
      }
      // 过滤
      row.value = numberToBoolean(mapAttrs.value as any, Object.fromEntries(entityRef.value.Row));
      saved.value = true;
    } catch (e: any) {
      console.trace(e);
      message.error(e.toString());
      throw new Error(e.toString());
    } finally {
      loading.value = false;
    }
  };
  const handleGPNCallback = inject('handleGPNCallback') as Function;
  // 单附件上传
  const enOnlySetting = () => {
    const urlEnCfg = GloComm.UrlEn('TS.User.EnOnlyCfg', EnName);
    if (typeof handleGPNCallback === 'function') handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByModal, urlEnCfg));
  };
  // 获取选项
  const getSelectOption = async (attr: Attr, row: Row) => {
    const { getDDLData } = useDDLDataLoader(toRaw(entityRef?.value) as Entity);
    try {
      return await getDDLData(attr, row);
    } catch (e) {
      message.error(`解析选项失败: ${attr.Key}${attr.Desc}获取下拉选项失败`);
      console.trace(e);
      return [];
    }
  };
  // 查找字段区间
  function searchFields(groupName: string): any[] {
    if (!groupName) return mapAttrs.value.filter((attr) => !!attr.UIVisible);

    const attrs = mapAttrs.value.filter((attr) => attr.UIkeyRef != null && attr.IsBoolean);
    let modifiedAttrs = new Set();
    let attrObj;
    for (const attr of attrs) {
      // 设置了联动
      const keyRefs = (attr?.UIkeyRef || '')
        .split?.(',')
        .map((key) => key.trim())
        .filter((key) => key.length > 0);
      const btnValue = entityRef?.value?.[attr.Key];
      const attrsMap = new Map(mapAttrs.value.map((a) => [a.Key, a]));
      for (const key of keyRefs) {
        attrObj = attrsMap.get(key);
        if (attrObj) {
          attrObj.UIVisible = Boolean(btnValue);
          modifiedAttrs.add(attrObj);
        }
      }
    }
    const mergedAttrsMap = new Map();
    [...modifiedAttrs].forEach((attr: any) => {
      mergedAttrsMap.set(attr?.Key, attr);
    });
    return mapAttrs.value.filter((attr) => (attr.UIVisible || mergedAttrsMap?.has(attr.Key)) && attr.GroupName === groupName);
  }
  type GroupModel = 'tab' | 'group-bar';
  type LoopAttr = Attr & {
    ddl: any[];
    mapExt: any[];
  };
  const groupBarShowMode = ref<GroupModel>('tab');
  const funcList = ref<FuncButton[]>([]); // 工具栏方法列表
  const switchGroupDisplayMode = async (gType: GroupModel) => {
    if (groupBarShowMode.value === gType) return;
    loading.value = true;
    try {
      enCfgRef.value?.SetValByKey('FieldGroupDisplayMode', gType === 'group-bar' ? 1 : 0);
      await enCfgRef.value?.Update();
      groupBarShowMode.value = gType;
    } catch (e: any) {
      message.error(e.toString());
    } finally {
      setTimeout(() => {
        loading.value = false;
      }, 200);
    }
  };
  const entityWG = ref<WaiGuaBaseEntity>();
  const sendFlow = reactive({
    methodName: '',
    res: {},
  });
  // 初始化工具栏按钮
  const initToolbar = (entity: Entity) => {
    // 处理工具栏方法列表
    const refMethods = entity._enMap.rms.filter((rm) => {
      return rm.RefMethodType === RefMethodType.FuncToolbar && !!rm.ClassMethod;
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
        onclick: async () => {
          const classMethod = (func.ClassMethod as string) || '';
          try {
            await enOnlySave(false);
            const myentity = unref(entityRef)!;
            if (classMethod === 'ShiftFlow') {
              if (props.WGFlow != null && (await new WaiGuaFlow(props.WGFlow).ShiftBefore()) == false) return;
            }
            if (entityWG.value != null && func.Tag === 'WaiGua') {
              //执行自定义的方法
              const result = await entityWG.value?.BtnClick('EntityToolbar', func.Title as string, '', unref(row));
              if (!!result && result?.hasOwnProperty?.('ReturnType')) {
                emit('handle-gpn-callback', result);
              }
              return;
            }

            const method = myentity[func.ClassMethod as string].bind(myentity);
            const res = await method();
            if (typeof res === 'object') {
              if (['SendFlow', 'ShiftFlow', 'HuiQian_Send', 'DoHungup', 'SendCC'].includes(classMethod) && res.ReturnType != GPNReturnType.DoNothing) {
                sendFlow.methodName = classMethod;
                sendFlow.res = res;
                isShowMsg.value = true;
                // if (props.WGFlow != null && classMethod === 'SendFlow') {
                //   await new WaiGuaFlow(props.WGFlow).SendSuccess();
                // }
              } else {
                emit('handle-gpn-callback', res);
              }
            } else message.info(res);
          } catch (e: any) {
            if (classMethod === 'SendFlow') {
              if (props.WGFlow != null) await new WaiGuaFlow(props.WGFlow).SendError();
            }
            message.error(e.toString());
          }
        },
      };
    });
  };
  // 初始化字段
  const formRules: Recordable = ref({});
  const { createFormRules } = useEntityValidator();
  const loadEntityAths = async () => {
    const hasAth = mapAttrs.value.some((attr) => attr.UIContralType === UIContralType.AthShow);
    if (!hasAth) return;
    const dbs = new FrmAttachmentDBs();
    await dbs.Retrieve('RefPKVal', athRefPKVal.value);
    aths.value = dbs;
  };

  const initAttrs = async (entity: Entity) => {
    let attrs = entity._enMap.attrs as unknown as LoopAttr[];
    let groups = entity._enMap.attrs.groups;
    const systemClsNameSpace = ['TS.WF', 'TS.Sys', 'TS.CCBill', 'TS.User', 'TS.Port', 'TS.CCFast', 'TS.GPM'];
    if (systemClsNameSpace.some((cls) => EnName.startsWith(cls)) && WebUser.IsAdmin) {
      if (enCfgRef.value?.MHideAttrModel == '1') {
        const hideAttrs = ',' + enCfgRef.value.MHideAttrs + ',';
        attrs = attrs.filter((attr) => hideAttrs.includes(',' + attr.Key + ',') == false);
      }
    } else {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
      handler.AddPara('EnName', props.EnName);
      const data = await handler.DoMethodReturnString('Entity_DBRoleAttrs');
      if (!!data) {
        attrs = attrs.filter((attr) => data.includes(',' + attr.Key + ',') || data.includes(',' + attr.Key.substring(0, attr.Key.length - 1) + ','));
      }
    }
    groups = entity._enMap.attrs.groups.filter((group) => group.type == 'component' || attrs.find((attr) => attr.GroupName === group.key));
    //根据字段权限处理显示的字段
    const enMapexts = entity._enMap.enMapExts;
    // 从字段中过滤出分组
    tabs.value = groups.map((t) => {
      const tInfo = {
        ...t,
      };
      if (t.type === 'component') {
        tInfo.compSrc = t.compSrc + '&PKVal=' + entity.PKVal;
      }
      return tInfo;
    });
    for (const attr of attrs) {
      // 处理下拉框
      if (attr.UIContralType === UIContralType.DDL || attr.UIContralType === UIContralType.RadioBtn || attr.UIContralType === UIContralType.CheckBok) {
        const hasExtOption = enMapexts.find((ext) => ext.ExtType === 'DDLSelect' && ext.AttrOfOper == attr.Key);
        if (!hasExtOption) {
          attr.ddl = await getSelectOption(attr, entity.Row);
        }
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
          attr['Tag'] = val.split(',');
        } else {
          attr['Tag'] = [];
        }
      }
    }
    mapAttrs.value = attrs;
    // 过滤
    row.value = numberToBoolean(mapAttrs.value as any, Object.fromEntries(entity.Row));
    // 判断当前字段是不是为空
    const isEmptyField = (row: any, rowKey: string) => {
      return row.value.hasOwnProperty(rowKey) && typeof row.value[rowKey] != 'boolean' && !row.value[rowKey] && row.value[rowKey] !== 0;
    };
    // 赋默认值
    for (const attr of mapAttrs.value) {
      const rowKey = attr.Key;
      if (isEmptyField(row, rowKey)) {
        row.value[rowKey] = attr._defaultVal;
      }
    }
    // 暂时只处理单附件回显
    if (entity._enMap.HisBPEntityAthType > 0) {
      if (row.value['WebPath']) {
        const { VITE_GLOB_API_URL } = getAppEnvConfig();
        mapUploadFileList.value = [{ uid: Math.random() + '', name: row.value['MyFileName'], url: VITE_GLOB_API_URL + row.value['WebPath'] }];
      }
    }
    formRules.value = createFormRules(mapAttrs.value as any);
    await loadEntityAths();
  };
  // 打开字段附件
  const openFieldAth = async (attr, pkval: string, readonly: boolean) => {
    // 当主实体尚未保存时，使用临时 athRefPKVal 作为 RefPKVal 打开附件弹窗
    // 后续在保存主实体时，会在 enOnlySave 中将以临时 RefPKVal 保存的附件记录
    // 统一迁移到真正的实体主键（见 FrmAttachmentDBs 的更新逻辑）
    const athTablePK = EnName + '_' + attr.Key;
    const ath = new FrmAttachment(athTablePK);
    const hasRecord = await ath.IsExits();
    if (hasRecord) {
      await ath.Retrieve();
    }
    ath.Name = attr.Desc;
    ath.FK_MapData = EnName;
    ath.NoOfObj = attr.Key;
    const atPara = new AtPara(attr.UIBindKey);
    if (atPara.GetValStrByKey('AthType') === 'AthSingle') ath.TopNumOfUpload = 1;
    ath.IsUpload = !attr.UIIsReadonly; // 是否可以上传
    const saveType = atPara.GetValStrByKey('SaveTo');
    if (saveType) ath.AthSaveWay = saveType;
    const initialFileMaxSize = atPara.GetValIntByKey('initFileMaxSize') || 10 * 1024;
    if (!hasRecord || ath.FileMaxSize < initialFileMaxSize) {
      ath.FileMaxSize = initialFileMaxSize; // 默认10M
    }
    await ath.Save();
    emit(
      'handle-gpn-callback',
      new GPNReturnObj(
        GPNReturnType.OpenCompByModal,
        {
          compUrl: '/src/WF/CCForm/Ath.vue?',
          params: {
            FrmID: EnName,
            FK_FrmAttachment: athTablePK,
            PKVal: pkval,
            IsReadonly: !!readonly ? 1 : 0,
          },
          closeFunc: loadEntityAths,
        },
        '表格附件：' + ath.Name,
      ),
    );
  };
  // end
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
      athRefPKVal.value = !PKVal ? dayjs().format('YYYYMMDDHHmmss') : PKVal;
      // athRefPKVal.value = dayjs().format('YYYYMMDDHHmmss');
      if (props.entityRef instanceof Entity && props.entityRef.PKVal?.toString() === props.PKVal?.toString()) {
        entityRef.value = props.entityRef;
      } else {
        const entity = await ClassFactory.GetEn(EnName as string);
        await entity.Init();
        if (!!PKVal) entity.setPKVal(PKVal);
        const uac = await entity.GenerUAC();
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
        }
        const params = props.params || {};
        const args = cloneDeep(params);
        delete args.EnName;
        // const ret: string[] = [];
        const keys = Object.keys(args);
        if (keys.length > 0) {
          keys.forEach((key) => {
            if (args[key] && !entity.GetValByKey(key)) entity.SetValByKey(key, args[key]);
          });
        }
        // 处理loaders
        const loaders = entity._enMap.loaders;
        if (loaders.length > 0) {
          const functions = loaders.map((loader: Function) => loader.bind(entity)());
          await Promise.all(functions);
        }
        entityRef.value = entity;
        entityRef.value.SetPageParam(params);
        // entityWG.value = entity.GetRefExt();
        // if (!PKVal) await entity.Insert();
      }
      uacRef.value = await entityRef.value.GenerUAC();

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
      // 显示模式
      const getDisplayMode = () => {
        if (!enCfgRef.value?.FieldGroupDisplayMode) {
          return entity._enMap.GroupBarShowModel === 0 ? 'tab' : 'group-bar';
        }
        return parseInt(enCfgRef.value?.FieldGroupDisplayMode) === 0 ? 'tab' : 'group-bar';
      };
      groupBarShowMode.value = getDisplayMode();
      // 处理工具栏方法列表
      initToolbar(entityRef.value);
      // 处理工具栏方法列表 end
      await initAttrs(entityRef.value);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.error(e);
    } finally {
      loading.value = false;
    }
  };
  const tabBarStyle = computed(() => {
    const emptyBtn = props.noSaveButton && funcList.value.length === 0 && tabs.value.length === 1;
    return {
      display: emptyBtn ? 'none' : 'flex',
      '--nav-scroll-visible': tabs.value.length === 1 ? 'hidden' : 'visible',
    };
  });
  const contentBgStyle = computed(() => {
    return { backgroundColor: 'transparent' };
  });
  //Modal关闭
  const handleCancel = () => {
    emit('handleCancel', isOnlyClose.value);
    //抽屉关闭
    const elDrawer = document.getElementsByClassName('ant-drawer-close') as unknown as NodeListOf<HTMLElement>;
    if (elDrawer && elDrawer.length > 0) {
      elDrawer[1].click();
    }
  };
  //撤销发送
  const UnSend = () => {
    emit('UnSend');
  };
  onMounted(async () => {
    await InitPage();
  });
  defineExpose({ enOnlySave });
</script>
<style lang="less" scoped>
  .right-btns {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 12px;
  }

  .content {
    background-color: white;
    padding: 0;

    .btn_style {
      height: 30px;
      border-radius: 12px;
    }

    /* 保存按钮专属样式 - 避免影响其他按钮 */
    .btn_save {
      /* 基础样式优化 */
      padding: 10px 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      /* 背景与文字 */
      color: white;
      font-weight: 500;
      font-size: 14px;
      /* 图标与文字布局 */
      display: inline-flex;
      align-items: center;
      gap: 6px; /* 图标与文字间距 */
      box-shadow: 0 2px 8px rgba(22, 119, 255, 0.2);
      transition: all 0.3s ease;
      cursor: pointer;
    }

    /* 悬停状态 */
    .btn_save:hover {
      background-color: #0f62fe;
      transform: scale(1.02);
      box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
    }

    :deep(.ant-tabs-top-content) {
      margin-top: 0;
      padding-top: 20px;
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

  .label {
    min-height: 32px;
    line-height: 32px;
  }

  .ant-tabs-tab-active .ant-tabs-tab {
    margin-right: 4px;
  }

  .form-main {
    position: relative;
    padding-top: 8px;

    .tool-bar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 8px 14px;
      background-color: white;
      margin-bottom: 8px;
    }
  }

  // 固定顶部按钮区域样式 - Tab模式
  .sticky-tabs {
    // 只对Tab导航栏应用sticky定位，而不是整个Tabs组件
    :deep(.ant-tabs-nav) {
      position: sticky !important;
      top: 0 !important;
      z-index: 1000 !important;
      background-color: #ffffff !important;
      box-shadow: none !important;
      margin-bottom: 0 !important;
      border-bottom: 1px solid #e8e8e8 !important;
      // 使用负margin突破父容器的padding限制
      margin-left: -16px !important;
      margin-right: -16px !important;
      margin-top: -10px !important;
      padding: 12px 20px 8px 20px !important;
    }

    // 确保Tab导航栏包装器也有背景色和合适的内边距
    :deep(.ant-tabs-nav-wrap) {
      background-color: #ffffff !important;
      padding: 0 !important;
    }

    // Tab标签样式优化
    :deep(.ant-tabs-tab) {
      margin-bottom: 0 !important;
      padding: 8px 16px !important;
      border-radius: 6px 6px 0 0 !important;
      margin-right: 4px !important;
      transition: all 0.2s ease !important;

      &:hover {
        background-color: rgba(24, 144, 255, 0.06) !important;
      }
    }

    // 激活状态的Tab标签
    :deep(.ant-tabs-tab-active) {
      background-color: var(--system-bg-color, #1890ff) !important;
      color: #ffffff !important;
      border-color: var(--system-bg-color, #1890ff) !important;

      .ant-tabs-tab-btn {
        color: #ffffff !important;
      }

      // 激活状态下的hover效果，保持蓝色背景但稍微调暗
      &:hover {
        background-color: var(--system-hover-bg-color, rgba(24, 144, 255, 0.9)) !important;
        color: #ffffff !important;

        .ant-tabs-tab-btn {
          color: #ffffff !important;
        }
      }
    }

    // 右侧按钮区域样式优化
    :deep(.ant-tabs-extra-content) {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;

      .btn_style {
        height: 32px !important;
        padding: 0 12px !important;
        border-radius: 6px !important;
        font-size: 14px !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
      }
    }

    // Tab内容区域间距调整，避免被固定导航栏遮挡
    :deep(.ant-tabs-content-holder) {
      padding-top: 16px !important;
      background-color: transparent !important;
    }

    // Tab内容区域的第一个元素增加间距
    :deep(.ant-tabs-content-holder .ant-tabs-tabpane) {
      padding-top: 4px !important;
    }
  }

  .sticky-toolbar {
    position: sticky !important;
    top: 0;
    z-index: 1000;
    box-shadow: none;
    border-bottom: 1px solid #e8e8e8;
    margin: -8px -14px 4px -14px;
    padding: 8px 14px;
  }

  .ath-field {
    margin-top: 20px;
  }
</style>
