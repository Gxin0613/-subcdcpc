<template>
  <BaseComponent ref="baseComponent" :close-modal-func="refreshEntity">
    <Spin :spinning="loading" tip="Loading...">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content" @keydown.stop>
        <div style="border-top-left-radius: 8px; border-top-right-radius: 8px">
          <div class="form-main">
            <div class="header">
              <div class="title">
                <i :class="gpeObject?.Icon"></i>
                <span style="margin-right: 12px">{{ activeModeObject?.Name || '无标题' }}</span>
                <!-- <Tag style="color: white; background-color: var(--system-bg-color)">{{ gpeObject?.PageTitle }}</Tag> -->
              </div>

              <div class="select-mode">
                <FuncToolbar v-if="funcList.length > 0" :list="funcList" />
                <Button style="margin-left: 12px; background-color: #1296db; color: white" @click="saveSetting">
                  <template #icon> <SaveOutlined /> </template>{{ '保存' }}</Button
                >
                <Popover v-model:open="changeModeVisible" placement="bottomRight" trigger="click">
                  <template #content>
                    <ListLayout :list="modeList" :active-key="activeMode + ''" @select-mode="(id) => shiftMode(id)" />
                  </template>
                  <div style="cursor: pointer; border-radius: 6px; margin-left: 12px; background-color: var(--system-bg-color); color: white; padding: 6px 18px">{{
                    '切换规则'
                  }}</div>
                  <!-- <div style="cursor: pointer; border-radius: 6px; background-color: var(--system-bg-color); color: white; padding: 6px 18px">{{'保存'}}</div> -->
                </Popover>
              </div>
            </div>
            <div class="form-content">
              <div class="custom" v-if="activeModeObject?.HisPageModelEdit === PageModelEdit.SelfComponent">
                <component
                  v-if="activeModeObject && activeModeObject.Component"
                  ref="SelfComponent"
                  :is="getComponent(activeModeObject.Component)"
                  :params="activeModeObject.ComponentParams"
                />
                <!-- <ShowHelp @change-show-help="changeShowHelp" :isGPEShowHelp="isGPEShowHelp" style="margin-top: 10px" /> -->
              </div>
              <div class="custom" v-else-if="activeModeObject?.HisPageModelEdit === PageModelEdit.SingleTBPara">
                <div>
                  <Input type="text" :placeholder="activeModeObject.Tag1" v-model:value="inputValues.SingleTBPara" />
                </div>
              </div>
              <div class="custom" v-else-if="activeModeObject?.HisPageModelEdit === PageModelEdit.SingleTB">
                <div style="padding: 12px 18px">
                  <Input
                    v-if="activeModeObject.Tag2 == DataType.AppString"
                    style="width: 100%"
                    type="text"
                    :placeholder="activeModeObject.Tag1"
                    v-model:value="inputValues.SingleTB"
                  />

                  <InputNumber
                    v-else-if="[DataType.AppInt, DataType.AppFloat, DataType.AppFloat].includes(activeModeObject.Tag2)"
                    :placeholder="activeModeObject.Tag1"
                    :precision="activeModeObject.Tag2 == DataType.AppInt ? 0 : 2"
                    v-model:value="inputValues.SingleTB"
                    style="width: 100%"
                  />
                  <Switch v-else-if="activeModeObject.Tag2 == DataType.AppBoolean" :checked="inputValues.SingleTB" @change="(val) => (inputValues.SingleTB = val)" />
                  <DatePicker
                    v-else-if="[DataType.AppDateTime, DataType.AppDate].includes(activeModeObject.Tag2)"
                    :placeholder="activeModeObject.Tag1"
                    :format="activeModeObject.Tag3"
                    v-model:value="inputValues.SingleTB"
                    style="width: 100%"
                  />
                  <span v-else>{{ '仅支持文本，数字，日期' }}</span>
                </div>
              </div>
              <div class="custom" v-else-if="activeModeObject?.HisPageModelEdit === PageModelEdit.TextBox2">
                <div>
                  <h4 style="margin: 0 0 12px 8px">{{ activeModeObject.Tag1 }}</h4>
                  <Input type="text" :placeholder="activeModeObject.Tag1" v-model:value="inputValues.SingleTB" />
                  <h4 style="margin: 12px 0 12px 8px">{{ activeModeObject.Tag3 }}</h4>
                  <Input type="text" :placeholder="activeModeObject.Tag3" v-model:value="inputValues.ExtTB1" />
                </div>
              </div>
              <div class="custom" v-else-if="activeModeObject?.HisPageModelEdit === PageModelEdit.SingleCheckbox">
                <div>
                  <Checkbox v-model:checked="inputValues.SingleCheckbox">{{ activeModeObject.Tag1 }}</Checkbox>
                </div>
              </div>
              <div class="custom" v-else-if="activeModeObject?.HisPageModelEdit === PageModelEdit.SingleTBSQL">
                <Textarea type="text" :placeholder="activeModeObject.Tag1" v-model:value="inputValues.SingleTBSQL" />
              </div>

              <div class="custom" v-else-if="activeModeObject?.HisPageModelEdit === PageModelEdit.SingleRichTxt">
                <div>
                  <Textarea type="text" :placeholder="activeModeObject.Tag1" v-model:value="inputValues.SingleRichHtml" />
                </div>
              </div>

              <div class="custom" v-else-if="activeModeObject?.HisPageModelEdit === PageModelEdit.DBSrcSQL">
                <div style="padding: 12px 18px">
                  <Row type="flex" :gutter="[12, 12]">
                    <Col :span="4"> 数据源: </Col>
                    <Col :span="20">
                      <Select v-model:value="inputValues.DBSrcSQL" style="width: 100%">
                        <SelectOption v-for="option in currentDDLDBSrcOptions" :key="option.value" :value="option.value">{{ option.label }}</SelectOption>
                      </Select>
                    </Col>
                    <Col :span="4">SQL语句: </Col>
                    <Col :span="20">
                      <Textarea type="text" :rows="4" :placeholder="activeModeObject.Tag1" v-model:value="inputValues.SingleTextArea" />
                    </Col>
                  </Row>
                </div>
              </div>
              <div class="custom" v-else-if="activeModeObject?.HisPageModelEdit === PageModelEdit.DBSrcWebApiGet">
                <div style="padding: 12px 18px">
                  <Row type="flex" :gutter="[12, 12]">
                    <Col :span="4"> WebApi数据源: </Col>
                    <Col :span="20">
                      <Select v-model:value="inputValues.DBSrcGetWebApi" style="width: 100%">
                        <SelectOption v-for="option in currentDDLDBSrcWepApiOptions" :key="option.value" :value="option.value">{{ option.label }}</SelectOption>
                      </Select>
                    </Col>
                    <Col :span="4"> Url: </Col>
                    <Col :span="20">
                      <Input type="text" :placeholder="activeModeObject.Tag1" v-model:value="inputValues.SingleTB" />
                    </Col>
                  </Row>
                </div>
              </div>
              <div class="custom" v-else-if="activeModeObject?.HisPageModelEdit === PageModelEdit.DBSrcWebApiPost">
                <div style="padding: 12px 18px">
                  <Row type="flex" :gutter="[12, 12]">
                    <Col :span="4"> WebApi数据源: </Col>
                    <Col :span="20">
                      <Select v-model:value="inputValues.DBSrcPostWebApi" style="width: 100%">
                        <SelectOption v-for="option in currentDDLDBSrcWepApiOptions" :key="option.value" :value="option.value">{{ option.label }}</SelectOption>
                      </Select>
                    </Col>
                    <Col :span="4"> Url: </Col>
                    <Col :span="20">
                      <Input type="text" :placeholder="activeModeObject.Tag1" v-model:value="inputValues.SingleTB" />
                    </Col>
                    <Col :span="4"> Header: </Col>
                    <Col :span="20">
                      <Textarea type="text" :rows="4" :placeholder="activeModeObject.Tag3" v-model:value="inputValues.WebApiHeader" />
                    </Col>
                    <Col :span="4"> Body: </Col>
                    <Col :span="20">
                      <Textarea type="text" :rows="4" :placeholder="activeModeObject.Tag4" v-model:value="inputValues.WebApiBody" />
                    </Col>
                  </Row>
                </div>
              </div>
              <div class="custom" v-else-if="activeModeObject?.HisPageModelEdit === PageModelEdit.SingleTextArea">
                <div>
                  <Textarea type="text" :placeholder="activeModeObject.Tag1" v-model:value="inputValues.SingleTextArea" />
                </div>
              </div>
              <div class="custom" v-else-if="activeModeObject?.HisPageModelEdit === PageModelEdit.Entity">
                <GPE_Entity ref="entityEl" :active-object="activeModeObject" :no-save-button="true" :params="gpeParams" />
              </div>
              <div class="custom" v-else-if="activeModeObject?.HisPageModelEdit === PageModelEdit.SingleDDLEntities">
                <div>
                  <Select v-model:value="inputValues.SingleDDLEntities" style="width: 100%">
                    <SelectOption v-for="option in currentDDLEntitiesOptions" :key="option.value" :value="option.value">{{ option.label }}</SelectOption>
                  </Select>
                </div>
              </div>
              <div class="custom" v-else-if="activeModeObject?.HisPageModelEdit === PageModelEdit.SingleDDLSQL">
                <Select v-model:value="inputValues.SingleDDLSQL">
                  <SelectOption v-for="option in currentDDLSQLOptions" :key="option.value" :value="option.value">{{ option.label }}</SelectOption>
                </Select>
              </div>
              <div class="custom" v-else-if="activeModeObject?.HisPageModelEdit === PageModelEdit.SingleDDLEnum">
                <Select v-model:value="inputValues.SingleDDLEnum">
                  <SelectOption v-for="option in currentDDLEnumsOptions" :key="option.value" :value="option.value">{{ option.label }}</SelectOption>
                </Select>
              </div>
              <div class="custom" v-else-if="activeModeObject?.HisPageModelEdit === PageModelEdit.SingleEnumRadioButton">
                <div style="padding: 12px 18px">
                  <p style="font-size: 14px; margin-bottom: 28px; color: var(--system-bg-color)"> {{ activeModeObject.Tag2 }}</p>
                  <div
                    class="radio-item"
                    v-for="item in currentDDLEnumsOptions"
                    :key="item.value"
                    :class="item.value == inputValues.SingleEnumRadioButton ? 'radio-item-select' : 'radio-item-un-select'"
                    @click="inputValues.SingleEnumRadioButton = item.value"
                  >
                    <div class="title"> {{ item.label }} </div>
                    <div v-if="item?.desc" class="desc">{{ item?.desc }}</div>
                    <FlagFilled v-if="item.value == inputValues.SingleEnumRadioButton" class="tag" />
                  </div>
                </div>
              </div>
              <!--列表选择-->
              <div class="custom" v-else-if="activeModeObject?.HisPageModelEdit === PageModelEdit.SelectItemsByList && gpeRowData">
                <PopList ref="list" :list-sql="activeModeObject.Tag1" :is-multi-select="activeModeObject.IsMultiSelect" :selected-items="gpeRowData[activeModeObject.Tag0]" />
              </div>
              <!--分组列表选择-->
              <div class="custom" v-else-if="activeModeObject?.HisPageModelEdit === PageModelEdit.SelectItemsByGroupList && gpeRowData">
                <PopGroupList
                  ref="groupList"
                  :list-sql="activeModeObject.Tag2"
                  :group-list-sql="activeModeObject.Tag1"
                  :is-multi-select="activeModeObject.IsMultiSelect"
                  :selected-items="gpeRowData[activeModeObject.Tag0]"
                />
              </div>
              <!--树选择-->
              <div class="custom" v-else-if="activeModeObject?.HisPageModelEdit === PageModelEdit.SelectItemsByTree && gpeRowData">
                <PopTree
                  ref="tree"
                  :tree-sql="activeModeObject.Tag5"
                  :parent-no="activeModeObject.Tag1"
                  :is-multi-select="activeModeObject.IsMultiSelect"
                  :selected-tree-node="gpeRowData[activeModeObject.Tag0]"
                  :is-lazily="activeModeObject.IsLazily"
                />
              </div>
              <!--联动树选择-->
              <div class="custom" v-else-if="activeModeObject?.HisPageModelEdit === PageModelEdit.SelectItemsByTreeEns && gpeRowData">
                <PopTreeEns
                  ref="treeEns"
                  :list-sql="activeModeObject.Tag2"
                  :tree-sql="activeModeObject.Tag5"
                  :parent-no="activeModeObject.Tag1"
                  :is-multi-select="activeModeObject.IsMultiSelect"
                  :selected-items="gpeRowData[activeModeObject.Tag0]"
                  :is-lazily="activeModeObject.IsLazily"
                />
              </div>
            </div>
          </div>

          <div class="gpe-footer" v-if="!gloHideHelpDoc">
            <ShowHelp @change-show-help="changeShowHelp" :isGPEShowHelp="isGPEShowHelp" />
          </div>
        </div>
        <Transition v-if="!gloHideHelpDoc" name="slide-fade">
          <div v-if="isGPEShowHelp" class="inner-help-docs">
            <!-- <div class="help-card-title">{{'帮助文档'}}</div> -->
            <v-md-preview v-if="helpDocs" :text="appTitleHelper(helpDocs)" preview-class="vuepress-markdown-body" height="400px" />
          </div>
        </Transition>
      </div>
    </Spin>
  </BaseComponent>
</template>
<script lang="ts" setup>
  import { Button, Checkbox, Input, InputNumber, message, Popover, Switch, DatePicker, Select, SelectOption, Spin, Textarea, Row, Col } from 'ant-design-vue';
  import { SaveOutlined, FlagFilled } from '@ant-design/icons-vue';
  import type { Component } from 'vue';
  import { markRaw, nextTick, reactive, ref, shallowRef, toRaw, unref } from 'vue';
  import { ClassFactoryOfGroupPageBaseEdit } from './ClassFactoryOfGroupPageEdit';
  import { useDataConvert } from '/@/hooks/ens/useDataConvert';
  import { Page } from '/@/bp/UIEntity/Page';
  import { PageModelEdit } from '/@/bp/UIEntity/EnumLab';
  import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
  import GPE_Entity from '/@/WF/Comm/UIEntity/GPE_Entity.vue';
  import DBAccess from '/@/utils/gener/DBAccess';
  import { SysEnums } from '/@/WF/Admin/FrmLogic/SysEnum/SysEnum';
  import { Entities } from '/@/bp/en/Entities';
  import PopTreeEns from '../subComponents/PopTreeEns.vue';
  import PopTree from '../subComponents/PopTree.vue';
  import PopList from '../subComponents/PopList.vue';
  import PopGroupList from '../subComponents/PopGroupList.vue';
  import { GloWF } from '../../Admin/GloWF';
  import { splitAtString } from '/@/bp/tools/ParamUtils';
  import type { FuncButton } from '../Methods';
  import FuncToolbar from './FuncToolbar.vue';
  import BaseComponent from '../BaseComponent.vue';
  import { GPNReturnObj } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { useRoute } from 'vue-router';
  import ShowHelp from '/@/WF/Comm/UIEntity/ShowHelp.vue';
  import { cloneDeep } from 'lodash';
  import { BaseSelectListData } from '/@/components/BaseCreateForm';
  import ListLayout from '/@/components/BaseCreateForm/src/ListLayout.vue';
  import { appTitleHelper } from '/@/utils/helper/appTitleHelper';
  import { DataType } from '/@/bp/en/DataType';
  import { getAppEnvConfig } from '/@/utils/env';
  import { SFDBSrcs } from '../../Admin/FrmLogic/SFDBSrc/SFDBSrc';
  import { replaceSpecialQuotes, restoreSpecialQuotes } from '/@/utils/stringUtils';
  // 基础组件
  const baseComponent = shallowRef<InstanceType<typeof BaseComponent>>();
  const loading = ref(false);
  // 外部传过来的属性
  const props = defineProps({
    // eslint-disable-next-line vue/prop-name-casing
    EnName: {
      type: String,
      default: '',
    },
    // eslint-disable-next-line vue/prop-name-casing
    PKVal: {
      type: String,
      default: '',
    },
    suffix: {
      type: String,
      default: '',
    },
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  console.log(props.PKVal);
  const gpeObject = ref<PageBaseGroupEdit>();

  const gpeRowData = ref<Record<string, any>>();

  const changeModeVisible = ref(false);
  const modeList = ref<BaseSelectListData[]>();
  // const filterByKeyword = (input: string, option: any) => {
  //   return option.label.includes(input.toLowerCase());
  // };
  // 选中的模式和组件
  const activeMode = ref<Array<string | number>>(['']);
  const activeModeObject = shallowRef<Page>();
  const SelfComponent = shallowRef();
  const EnName = props.EnName || props.params.EnName || '';
  const PKVal = (props.PKVal || props.params.PKVal || '') + props.suffix;
  console.log(PKVal);
  // 子组件refs
  const treeEns = shallowRef<InstanceType<typeof PopTreeEns>>();
  const tree = shallowRef<InstanceType<typeof PopTree>>();
  const list = shallowRef<InstanceType<typeof PopList>>();
  const groupList = shallowRef<InstanceType<typeof PopGroupList>>();
  // refs end

  const getComponent = (comp: Component) => {
    return markRaw(comp);
  };

  type RadioKey = string | number;
  // 输入框的值
  const inputValues = reactive<{
    [key: string]: any;
    SingleEnumRadioButton: RadioKey;
    SingleDDLEnum: RadioKey;
    SingleDDLEntities: RadioKey;
    SingleCheckbox: boolean;
  }>({
    SingleTBValue: '',
    // 单个文本框.
    SingleTB: '',
    // 扩展文本框1
    ExtTB1: '',
    // 单个文本框，数据存入参数字段.
    SingleTBPara: '',
    // 单个大块文本.
    SingleTextArea: '',
    // 富文本.
    SingleRichHtml: '',
    // SQL文本.
    SingleTBSQL: '',
    // 实体编辑器.
    Entity: '',
    // 单独枚举
    SingleEnumRadioButton: '',
    // 枚举下拉
    SingleDDLEnum: '',
    // Entities下拉框
    SingleDDLEntities: '',
    // SQL下拉框选中值
    SingleDDLSQL: '',
    // 复选框
    SingleCheckbox: false,
    //sql数据源
    DBSrcSQL: 'local',
    //webapi数据源
    DBSrcGetWebApi: '',
    DBSrcPostWebApi: '',
    WebApiHeader: '',
    WebApiBody: '',
  });

  interface SelectOptions {
    label: string;
    value: string | number;
    desc?: string;
  }

  const currentDDLEnumsOptions = ref<SelectOptions[]>([]);
  const currentDDLSQLOptions = ref<SelectOptions[]>([]);
  const currentDDLEntitiesOptions = ref<SelectOptions[]>([]);
  const currentDDLDBSrcOptions = ref<SelectOptions[]>([]);

  const currentDDLDBSrcWepApiOptions = ref<SelectOptions[]>([]);

  const entityEl = shallowRef<HTMLElement | null>(null);
  // 帮助文档
  const helpDocs = ref('');

  const funcList = ref<FuncButton[]>([]);
  const getToolButtons = () => {
    const gpe = unref(gpeObject);
    if (!gpe) {
      funcList.value = [];
      return;
    }
    // 如果不是数组，则认为配置错误
    if (!Array.isArray(gpe.Btns)) {
      funcList.value = [];
      return;
    }
    let btnListItem = gpe.Btns.find((item) => item.pageNo === activeModeObject.value?.No);
    if (!btnListItem) gpe.Btns.find((item) => item.pageNo === '');
    if (!btnListItem) {
      funcList.value = [];
      return;
    }
    funcList.value = btnListItem.list.map((btn) => {
      return {
        id: btn,
        name: btn,
        onclick: async () => {
          try {
            const pageId = activeModeObject.value?.No || '';
            const pageName = activeModeObject.value?.Name || '';
            const res = await gpe.BtnClick(pageId, pageName, btn);
            if (res instanceof GPNReturnObj) {
              baseComponent.value?.handleGPNCallback(res);
            } else if (typeof res === 'string' && res.length > 0) {
              message.info(res);
            }
          } catch (e: any) {
            message.error(e.toString());
          }
        },
      };
    });
  };
  const refreshEntity = async () => {
    if (activeModeObject.value?.HisPageModelEdit == PageModelEdit.Entity) {
      // notification.warning({ message: '由于二级页面已经修改了实体，将刷新当前实体数据' });
      await shiftMode(activeModeObject.value.No);
    }
  };
  // todo 需要完善
  const shiftMode = async (activeNo: string) => {
    try {
      // loading.value = true;
      changeModeVisible.value = false;
      activeMode.value = [activeNo + ''];
      const page = gpeObject.value?.SubPages.find((dtl) => dtl.No === activeNo);
      if (!page) return false;
      activeModeObject.value = undefined;
      await nextTick();
      const pageEntity = page?.HisEntity;
      if (pageEntity) {
        pageEntity.setPKVal(PKVal);
        await pageEntity.Init();
        // const rows = await pageEntity.RetrieveFromDBSources();
        await pageEntity.RetrieveFromDBSources();
        //if (rows === 0) pageEntity.Insert();
        inputValues[PageModelEdit[page.HisPageModelEdit || '']] = pageEntity.Row.get(page.Tag0);
        // console.log(inputValues[PageModelEdit[page.HisPageModelEdit || '']]);
      }

      const gpeEntity = gpeObject.value?.entity;
      if (gpeEntity) {
        for (let i = 0; i <= 6; i++) {
          const key = 'Tag' + i;
          if (typeof page[key] === 'string' && page[key]?.toLowerCase()?.trim().startsWith('select')) {
            page[key] = GloWF.DealExp(page[key], gpeEntity);
          }
          if (
            typeof page[key] === 'string' &&
            (page[key]?.startsWith('DBSrc.') ||
              page[key].startsWith('Port_') == true ||
              page[key].startsWith('Flow_') == true ||
              page[key].startsWith('Frm_') == true ||
              page[key].startsWith('DBSrc_') == true ||
              page[key].startsWith('DemoStudent_') == true ||
              page[key].startsWith('App_') == true ||
              page[key].startsWith('Ens://') == true ||
              page[key].startsWith('En://') == true)
          ) {
            if (page[key]?.startsWith('DBSrc.') == false || page[key].endsWith('.') == true) {
              //增加参数
              let paras = '';
              const row = Object.fromEntries(gpeEntity.Row);
              const keys = Object.keys(row);
              for (const key of keys) {
                let val = gpeEntity[key];
                val = val.toString().replaceAll('.', '[。]');
                paras += '@' + key + '=' + val;
              }
              page[key] = page[key] + paras;
            } else {
              //替换参数
              page[key] = GloWF.DealExp(page[key], gpeEntity);
            }
          }
        }
      }
      if (page.HisPageModelEdit === PageModelEdit.Blank) {
        isGPEShowHelp.value = true;
      }
      if (page.HisPageModelEdit === PageModelEdit.Entity) {
        // @ts-ignore
        entityEl.value?.openDrawer(page);
      }

      if (page.HisPageModelEdit === PageModelEdit.SingleTBPara) {
        if (!gpeObject.value?.entity?.GetParaString(page.Tag0)) {
          message.error(gpeObject.value?.PageTitle + ' [' + gpeObject.value?.entity?.classID + ']- AtPara - 没有[' + page.Tag0 + ']字段');
        }
        const val = gpeObject.value?.entity?.GetParaString(page.Tag0);
        inputValues.SingleTBPara = val ?? '';
      }

      // 缺少字段检测
      if (page.Tag0 && !gpeObject.value?.entity?.Row.has(page.Tag0)) {
        message.error(
          gpeObject.value?.PageTitle + '[' + gpeObject.value?.classID + ']的实体[' + gpeObject.value?.entity?.classID + ']' + ' - Row中 -  缺少[' + page.Tag0 + ']字段',
        );
      }
      if (page.HisPageModelEdit === PageModelEdit.SingleTB) {
        // inputValues.SingleTB = page.Tag0;
        inputValues.SingleTB = gpeObject.value?.entity?.Row.get(page.Tag0);
      }

      if (page.HisPageModelEdit === PageModelEdit.TextBox2) {
        inputValues.SingleTB = gpeObject.value?.entity?.Row.get(page.Tag0);
        inputValues.ExtTB1 = gpeObject.value?.entity?.Row.get(page.Tag2);
      }

      if (page.HisPageModelEdit === PageModelEdit.SingleCheckbox) {
        // inputValues.SingleTB = page.Tag0;
        inputValues.SingleCheckbox = !!gpeObject.value?.entity?.Row.get(page.Tag0);
      }

      if (page.HisPageModelEdit === PageModelEdit.SingleTBSQL) {
        // inputValues.SingleTB = page.Tag0;
        const restoreSqlArea = restoreSpecialQuotes(gpeObject.value?.entity?.Row.get(page.Tag0));
        inputValues.SingleTBSQL = restoreSqlArea;
      }
      if (page.HisPageModelEdit === PageModelEdit.SingleTextArea) {
        inputValues.SingleTextArea = gpeObject.value?.entity?.Row.get(page.Tag0);
      }

      if (page.HisPageModelEdit === PageModelEdit.SingleDDLSQL) {
        // 执行
        currentDDLSQLOptions.value = (await DBAccess.RunSQLReturnTable(page.Tag1)).map((item) => {
          return {
            label: item.Name,
            value: item.No + '',
          };
        });
        inputValues.SingleDDLSQL = gpeObject.value?.entity?.Row.get(page.Tag0) + '';
        // 如果没有数据，默认选中第一个
        if (currentDDLSQLOptions.value.length > 0 && !inputValues.SingleDDLSQL) {
          inputValues.SingleDDLSQL = currentDDLSQLOptions.value[0].value as string;
        }
      }

      if (page.HisPageModelEdit === PageModelEdit.DBSrcSQL) {
        const dbSrc = new SFDBSrcs();
        await dbSrc.RetrieveAll();
        const dbSrcSQL = [
          'local',
          'MSSQL',
          'Oracle',
          'DM',
          'MySQL',
          'Informix',
          'PostgreSQL',
          'KingBaseR3',
          'KingBaseR6',
          'UX',
          'HGDB',
          'GBASE8CByOracle',
          'GBASE8CByMySQL',
          'GBASE8A',
          'WebServices',
        ];

        if (page.HisPageModelEdit === PageModelEdit.DBSrcSQL) {
          //数据筛选
          currentDDLDBSrcOptions.value = dbSrc
            .slice(0, dbSrc.length)
            .filter((db) => dbSrcSQL.includes(db.DBSrcType))
            .map((item) => {
              return {
                label: item.Name,
                value: item.No,
              };
            });

          //数组中是否存在,不存在默认取第一个
          currentDDLDBSrcOptions.value.forEach((item) => {
            if (item.value === gpeObject.value?.entity?.Row.get(page.Tag0)) {
              inputValues.DBSrcSQL = gpeObject.value?.entity?.Row.get(page.Tag0) + '';
            }
          });
          // 如果没有数据，默认选中第一个
          if (currentDDLDBSrcOptions.value.length > 0 && !inputValues.DBSrcSQL) {
            inputValues.DBSrcSQL = currentDDLDBSrcOptions.value[0].value as string;
          }
          const restoreSqlTextArea = restoreSpecialQuotes(gpeObject.value?.entity?.Row.get(page.Tag1) + '');
          inputValues.SingleTextArea = restoreSqlTextArea;
        }
      }
      if (page.HisPageModelEdit === PageModelEdit.DBSrcWebApiGet || page.HisPageModelEdit === PageModelEdit.DBSrcWebApiPost) {
        const dbSrc = new SFDBSrcs();
        await dbSrc.RetrieveAll();
        const dbSrcWebApi = ['WebApi'];
        //数据筛选
        currentDDLDBSrcWepApiOptions.value = dbSrc
          .slice(0, dbSrc.length)
          .filter((db) => dbSrcWebApi.includes(db.DBSrcType))
          .map((item) => {
            return {
              label: item.Name,
              value: item.No,
            };
          });
        if (page.HisPageModelEdit === PageModelEdit.DBSrcWebApiGet) {
          //数组中是否存在,不存在默认取第一个
          currentDDLDBSrcWepApiOptions.value.forEach((item) => {
            if (item.value === gpeObject.value?.entity?.Row.get(page.Tag1)) {
              inputValues.DBSrcGetWebApi = gpeObject.value?.entity?.Row.get(page.Tag1) + '';
            }
          });
          // 如果没有数据，默认选中第一个
          if (currentDDLDBSrcWepApiOptions.value.length > 0 && !inputValues.DBSrcGetWebApi) {
            inputValues.DBSrcGetWebApi = currentDDLDBSrcWepApiOptions.value[0].value as string;
          }
          inputValues.SingleTB = gpeObject.value?.entity?.Row.get(page.Tag0) + '';
        }
        if (page.HisPageModelEdit === PageModelEdit.DBSrcWebApiPost) {
          //数组中是否存在,不存在默认取第一个
          currentDDLDBSrcWepApiOptions.value.forEach((item) => {
            if (item.value === gpeObject.value?.entity?.Row.get(page.Tag1)) {
              inputValues.DBSrcPostWebApi = gpeObject.value?.entity?.Row.get(page.Tag1) + '';
            }
          });
          // 如果没有数据，默认选中第一个
          if (currentDDLDBSrcWepApiOptions.value.length > 0 && !inputValues.DBSrcPostWebApi) {
            inputValues.DBSrcPostWebApi = currentDDLDBSrcWepApiOptions.value[0].value as string;
          }
          inputValues.SingleTB = gpeObject.value?.entity?.Row.get(page.Tag0) + '';

          const restoreHeaderTextArea = restoreSpecialQuotes(gpeObject.value?.entity?.Row.get(page.Tag3));
          const restoreBodyTextArea = restoreSpecialQuotes(gpeObject.value?.entity?.Row.get(page.Tag4));
          inputValues.WebApiHeader = restoreHeaderTextArea;
          inputValues.WebApiBody = restoreBodyTextArea;
        }
      }

      if (page.HisPageModelEdit === PageModelEdit.SingleDDLEnum || page.HisPageModelEdit === PageModelEdit.SingleEnumRadioButton) {
        // 执行
        const defaultCfg = page.Tag1;
        if (typeof defaultCfg === 'string' && defaultCfg.startsWith('@')) {
          inputValues.SingleDDLEnum = gpeObject.value?.entity?.Row.get(page.Tag0) + '';
          const defaultSelect = gpeObject.value?.entity?.Row.get(page.Tag0) + '';
          inputValues.SingleEnumRadioButton = defaultSelect || '0';
          const keys = splitAtString(defaultCfg) || [];
          currentDDLEnumsOptions.value = keys.map((kv: string) => {
            const [key, val] = kv.split('=');
            const cfg = val.split(';');
            if (cfg.length > 1) {
              return {
                value: '' + key,
                label: cfg[0],
                desc: cfg[1],
              };
            }
            return {
              value: '' + key,
              label: val,
            };
          });
          console.log(currentDDLEnumsOptions.value);
        } else {
          inputValues.SingleDDLEnum = gpeObject.value?.entity?.Row.get(page.Tag0);
          inputValues.SingleEnumRadioButton = gpeObject.value?.entity?.Row.get(page.Tag0);
          console.log(inputValues.SingleEnumRadioButton);
          const enumKey = page.Tag1;
          const sysEnums = new SysEnums();
          await sysEnums.Retrieve('EnumKey', enumKey, 'IntKey');
          currentDDLEnumsOptions.value = sysEnums.map((dtl) => ({
            value: dtl.IntKey,
            label: dtl.Lab,
          }));
        }
      }

      if (page.HisPageModelEdit === PageModelEdit.SingleDDLEntities) {
        // 执行
        inputValues.SingleDDLEntities = gpeObject.value?.entity?.Row.get(page.Tag0);
        const entities = page.Tag1;
        if (!(entities instanceof Entities)) {
          message.error('实体下拉框类型中，page->Tag1必须是Entities子类');
          return;
        }
        await entities.Init();
        await entities.RetrieveAll();
        currentDDLEntitiesOptions.value = entities.map((en) => {
          return {
            value: en.No,
            label: en.Name,
          };
        });
      }
      await nextTick();
      activeModeObject.value = toRaw(page);
      helpDocs.value = page.HelpDocs!;
      if (props.EnName === 'GPE_FullDataBody' && page.No != 'None') {
        //如果是填充主表
        const frmID = page?.HisEntity?.FK_MapData;
        const data = (await DBAccess.RunSQLReturnTable(GloWF.sqlFields(frmID))) || [];
        let str = `  #### 表单字段
`;
        data.forEach((item, index) => {
          str += ' - ' + (item.NO || item.No || item.no) + ' ' + (item.NAME || item.Name || item.name) + '\t';
          if ((index + 1) % 3 == 0) str += '\n';
        });
        str += '\n';
        helpDocs.value = str + page.HelpDocs!;
      }
      getToolButtons();
    } catch (e: any) {
      message.error(e.toString());
      console.error(e);
    } finally {
      // loading.value = false;
    }
  };

  //帮助
  const { VITE_GLOB_HIDE_HELP_DOCS } = getAppEnvConfig();
  const gloHideHelpDoc = ref(VITE_GLOB_HIDE_HELP_DOCS);
  const isGPEShowHelp = ref(false);
  const changeShowHelp = (GPEHelp) => (isGPEShowHelp.value = GPEHelp);
  // 保存设置
  const saveSetting = async () => {
    try {
      loading.value = true;
      const currentMode = activeModeObject.value?.HisPageModelEdit;
      if (!currentMode && currentMode !== 0) {
        message.error('没有选中的Page');
        return;
      }
      const entity = gpeObject.value?.entity;
      if (!entity) {
        message.error('无法获取 [ HisEntity ] , 请检查');
        return;
      }
      if (entity.PKVal === '') {
        entity.SetValByKey(entity.PK, PKVal);
      }
      await entity?.Init();
      const i = await entity?.RetrieveFromDBSources();
      if (i === 0) await entity?.Insert();
      const enKey = gpeObject.value?.KeyOfEn;
      if (enKey) {
        const val = activeModeObject.value?.No;
        entity.SetValByKey(enKey, val); //设置枚举值.
      }
      // 参数里面取值
      if (currentMode === PageModelEdit.Blank || currentMode === PageModelEdit.Entity) {
        await entity.Update();
        if (currentMode === PageModelEdit.Entity) await entityEl.value?.['Save']?.();
        gpeObject.value?.AfterSave(activeModeObject.value?.No || '', activeModeObject.value?.Name);
        message.success('操作成功');
        if (i === 0) await InitPage();
        return;
      }

      // 自定义组件, 需要调用组件内的方法实现
      if (currentMode === PageModelEdit.SelfComponent) {
        await nextTick();
        let saveCallback = '';
        if (SelfComponent.value?.Save) {
          saveCallback = await SelfComponent.value.Save();
        }
        if (saveCallback !== 'skipUpdate') {
          await entity.Update();
        }
        gpeObject.value?.AfterSave(activeModeObject.value?.No || '', activeModeObject.value?.Name);
        message.success('操作成功');
        return;
      }
      let singleValue = inputValues[PageModelEdit[currentMode]] || '';
      if (currentMode === PageModelEdit.SingleCheckbox) {
        singleValue = singleValue ? 1 : 0;
      }
      if (!singleValue && singleValue != 0) {
        message.error('singleValue - 参数不能为空.');
        return;
      }
      // para参数
      if (currentMode === PageModelEdit.SingleTBPara) {
        const singleValue = inputValues[PageModelEdit[currentMode]] || '';
        if (!singleValue) {
          message.error('参数不能为空.');
          return;
        }
        entity.SetPara(activeModeObject.value?.Tag0, encodeURIComponent(singleValue));
      } else if (
        [PageModelEdit.SelectItemsByTree, PageModelEdit.SelectItemsByList, PageModelEdit.SelectItemsByTreeEns, PageModelEdit.SelectItemsByGroupList].includes(currentMode)
      ) {
        await nextTick();
        let checkedList, checkedNames;
        if (currentMode === PageModelEdit.SelectItemsByTreeEns) {
          checkedList = treeEns.value?.checkedList;
          checkedNames = treeEns.value?.checkedNames;
        }
        if (currentMode === PageModelEdit.SelectItemsByTree) {
          checkedList = tree.value?.checkedList;
          checkedNames = tree.value?.checkedNames;
        }
        if (currentMode === PageModelEdit.SelectItemsByList) {
          checkedList = list.value?.checkedList;
          checkedNames = list.value?.checkedNames;
        }
        if (currentMode === PageModelEdit.SelectItemsByGroupList) {
          checkedList = groupList.value?.checkedList;
          checkedNames = groupList.value?.checkedNames;
        }
        if (!Array.isArray(checkedList) || !Array.isArray(checkedNames)) {
          checkedList = [];
          checkedNames = [];
        }
        entity.SetValByKey(activeModeObject.value?.Tag0, checkedList.join(','));
        if (activeModeObject.value?.Tag6) {
          // entity.SetPara(activeModeObject.value?.Tag6, checkedNames.join(','));
          entity.SetValByKey(activeModeObject.value?.Tag6, checkedNames.join(','));
        }
      } else if (currentMode === PageModelEdit.TextBox2) {
        entity.SetValByKey(activeModeObject.value?.Tag0, inputValues.SingleTB);
        entity.SetValByKey(activeModeObject.value?.Tag2, inputValues.ExtTB1);
      } else if (currentMode === PageModelEdit.SingleTBSQL) {
        const replaceSqlTextArea = replaceSpecialQuotes(inputValues.SingleTBSQL);
        entity.SetValByKey(activeModeObject.value?.Tag0, replaceSqlTextArea);
      } else if (currentMode === PageModelEdit.DBSrcSQL) {
        const replaceSqlTextArea = replaceSpecialQuotes(inputValues.SingleTextArea);
        entity.SetValByKey(activeModeObject.value?.Tag0, inputValues.DBSrcSQL);
        entity.SetValByKey(activeModeObject.value?.Tag1, replaceSqlTextArea);
      } else if (currentMode === PageModelEdit.DBSrcWebApiGet) {
        entity.SetValByKey(activeModeObject.value?.Tag0, inputValues.SingleTB);
        entity.SetValByKey(activeModeObject.value?.Tag1, inputValues.DBSrcGetWebApi);
        entity.SetValByKey(activeModeObject.value?.Tag2, 'Get');
      } else if (currentMode === PageModelEdit.DBSrcWebApiPost) {
        entity.SetValByKey(activeModeObject.value?.Tag0, inputValues.SingleTB);
        entity.SetValByKey(activeModeObject.value?.Tag1, inputValues.DBSrcPostWebApi);
        entity.SetValByKey(activeModeObject.value?.Tag2, 'Post');
        const replaceHeaderTextArea = replaceSpecialQuotes(inputValues.WebApiHeader);
        const replaceBodyTextArea = replaceSpecialQuotes(inputValues.WebApiBody);
        entity.SetValByKey(activeModeObject.value?.Tag3, replaceHeaderTextArea);
        entity.SetValByKey(activeModeObject.value?.Tag4, replaceBodyTextArea);
      } else {
        entity.SetValByKey(activeModeObject.value?.Tag0, singleValue);
      }

      await entity.Update();
      gpeObject.value?.AfterSave(activeModeObject.value?.No || '', activeModeObject.value?.Name);
      message.success('操作成功');
    } catch (e: any) {
      console.trace(e);
      message.error(e.toString());
    } finally {
      loading.value = false;
    }
  };

  /**
   * 取值优先级 props > query
   * @constructor
   */
  const gpeParams = ref({});
  const route = useRoute();
  async function InitPage() {
    try {
      loading.value = true;
      if (!EnName || !PKVal) {
        errorObj.hasError = true;
        errorObj.tips = '缺少必要参数PKVal=[' + PKVal + '] - EnName[' + EnName + ']';
        return;
      }
      // 初始化gpe
      const gpe = await ClassFactoryOfGroupPageBaseEdit.GetEn(EnName as string);
      const gpeProps = toRaw(props);

      const gpe_params = cloneDeep(route.query) as Recordable;

      delete gpe_params['classID'];
      delete gpe_params['EnName'];
      delete gpe_params['FrmID'];
      delete gpe_params['FK_MapData'];
      delete gpe_params['_row'];
      delete gpe_params['_tmpEnMap'];

      console.log({ gpe_params });

      const prop_keys = Object.keys(gpeProps);
      for (const key of prop_keys.filter((key) => key != 'params')) {
        if (!!gpeProps[key] || gpeProps[key] === 0) {
          gpe_params[key] = gpeProps[key];
        }
      }

      const param_keys = Object.keys(gpeProps.params);
      for (const key of param_keys) {
        if (!!gpeProps.params[key] || gpeProps.params[key] === 0) {
          gpe_params[key] = gpeProps.params[key];
        }
      }
      gpe_params['RefPKVal'] = gpe_params.PKVal;
      gpe.setParams(gpe_params);
      gpeParams.value = gpe_params;

      if (gpe?.Init) await gpe.Init();
      // gpe 部分初始化完成

      const entity = gpe.entity;
      if (!entity) {
        message.error('实体[' + gpe.classID + '] 缺少实体 Entity');
        return;
      }
      gpe_params['PKVal'] = entity.PKVal;
      if (!entity.PKVal) {
        entity?.setPKVal(PKVal);
      }
      await entity?.Init();
      await entity?.RetrieveFromDBSources();
      //if (i == 0) await entity?.DirectInsert();

      gpeObject.value = gpe;
      const { Groups, SubPages } = gpe;
      const convert = useDataConvert();
      modeList.value = convert(Groups, SubPages, 'GroupNo') as unknown as BaseSelectListData[];
      if (SubPages.length > 0) {
        const Row = gpe.entity?.Row;
        if (!Row?.has(gpe.KeyOfEn)) {
          gpe.entity?.Init();
          message.error('实体[' + gpe.entity?.classID + '] Row 缺少字段 ' + gpe.KeyOfEn);
          return;
        }
        const storedKey = gpe.entity?.Row.get(gpe.KeyOfEn) + ''; //'0' => 0
        let activeNo = '';
        if (typeof storedKey === 'string' && storedKey.trim() !== '') activeNo = storedKey;
        else activeNo = SubPages[0].No;
        // const activeNo = parseInt(storedKey) === 0 ? SubPages[0].No : storedKey + '';
        gpeRowData.value = Object.fromEntries(Row);
        await shiftMode(activeNo);
      }
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.error('GPE-InitPage-Error:' + e);
    } finally {
      loading.value = false;
    }
  }
  InitPage();
</script>

<style scoped lang="less">
  .slide-fade-enter-active {
    transition: all 0.2s ease;
  }

  .slide-fade-leave-active {
    transition: all 0.2s ease;
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateY(-30px);
    opacity: 0;
  }
  .content {
    padding: 16px 24px;
    .form-main {
      background-color: white;
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        // background-color: #dadada;
        background-color: #f2f2f2;
        border: 1px solid #e6e9ed;

        .title {
          font-size: 14px;
          padding: 12px;
          font-weight: 600;
          color: var(--system-bg-color);

          i {
            margin-right: 6px;
          }
        }

        .select-mode {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
        }
      }
      .form-content {
        :deep(.theme-wrapper) {
          padding: 0 !important;
        }
      }
    }

    .flex-between {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .gpe-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: white;
      padding: 12px;
      :deep(.ant-btn) {
        border-radius: 0;
        background-color: white;
        color: #333;
        border-color: #d9d9d9;
        border-radius: 0;
      }
      :deep(.ant-btn + .ant-btn) {
        margin-left: 12px;
      }
    }

    .select-group-label {
      color: #1890ff;
      border-bottom: 1px solid #1890ff;
      font-size: 14px;
      padding-bottom: 12px;
      font-weight: 600;
    }
    .radio-item {
      border-radius: 12px;
      padding: 6px 12px;
      cursor: pointer;
      position: relative;

      .tag {
        position: absolute;
        right: 18px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 18px;
        padding: 2px 6px;
        border-radius: 6px;
      }
      .title {
        font-size: 14px;
        margin-bottom: 6px;
        font-weight: bold;
      }
      .desc {
        font-size: 12px;
        color: #666;
      }
    }
    .radio-item + .radio-item {
      margin-top: 12px;
    }

    .radio-item-un-select {
      border: 2px solid #d1d5dc;
    }

    .radio-item-select {
      border: 2px solid var(--system-bg-color);
      color: var(--system-bg-color);
    }

    .inner-help-docs {
      width: 100%;
      background-color: white;
      margin-top: 12px;
      border-radius: 10px;
      .help-card-title {
        padding: 12px 16px;
        border: 1px solid #e6e9ed;
        // background-color: var(--system-bg-color);
        background-color: #f2f2f2;
        font-size: 14px;
        font-weight: 600;
        color: #606060;
        margin: 0;
        margin-bottom: 24px;
      }
    }
  }
</style>
