<template>
  <BaseComponent ref="baseComp" class="dtl-search">
    <div ref="dtlSearchRef" class="dtl-search-wrapper">
      <div style="padding: 6px; border-radius: 2px; background-color: var(--component-background-color); height: calc(100vh - 80px)">
        <div v-if="!gloReadonly" class="dtl-header">
          <div class="search-container">
            <Input v-model:value="searchKey" :placeholder="'请输入关键字'" @change="Search" allow-clear class="search-input">
              <template #prefix>
                <SearchOutlined class="search-icon" />
              </template>
            </Input>
          </div>
          <div style="display: flex; justify-content: flex-start; align-items: center">
            <Button v-for="btn in enActions" style="margin-right: 12px" :key="btn.label" type="primary" :class="btn_style(btn.label)" @click="execEnActions(btn)">{{
              btn.label
            }}</Button>
            <Button style="margin-left: 12px" type="primary" v-for="btn in getTopButtons()" :key="btn.label" @click="btn.onClick" :ghost="btn.ghost" :class="btn_style(btn.label!)"
              >{{ btn.label }}
            </Button>
          </div>
        </div>
        <Table v-if="loadingEnd" :columns="Columns" :data-source="tableData" bordered size="small" :pagination="false" :scroll="{ y: 'calc(100vh - 160px)' }">
          <template #bodyCell="{ column, record }">
            <div class="td-cell" :class="{ 'valid-err': isValidFailed(column.attr, record) }">
              <template v-if="column.key === Sort1">
                {{ record[column.key] }}
              </template>
              <template v-else-if="column.key === Sort2">
                <span v-if="sort2IsMerge === false">{{ record[column.key] }}</span>
                <div v-else style="width: 100%; text-align: left; padding-left: 3px"><span v-html="record[column.key]"></span></div>
              </template>
              <!--富文本-->
              <template v-else-if="isRichText(column.attr)">
                <span>{{ 'Table中富文本不可编辑' }}</span>
                <!-- <Tinymce :value="row[attr.Key]" @change="(content) => (row[attr.Key] = content)" :style="mergeAttrStyle(attr)" :showImageUpload="false" :height="600" /> -->
              </template>
              <!--boolean值-->
              <template v-else-if="isBoolean(column.attr)">
                <AntSwitch v-model:checked="record[column.attr.Key]" :disabled="mixedReadonly(column.attr, record)" :style="mergeAttrStyle(column.attr)">
                  <template #checkedChildren><check-outlined /></template>
                  <template #unCheckedChildren><close-outlined /></template>
                </AntSwitch>
              </template>
              <!--日期类型-->
              <template v-else-if="isDate(column.attr)">
                <DatePicker
                  style="width: 100%"
                  v-model:value="record[column.attr.Key]"
                  :style="mergeAttrStyle(column.attr)"
                  :picker="column.attr.DateConfig!.type"
                  :format="column.attr.DateConfig!.format"
                  :value-format="column.attr.DateConfig!.format"
                  :disabled-date="(current) => core.getDisabledDateCore(record, column.attr.Key)?.(current)"
                  :disabled="mixedReadonly(column.attr, record)"
                  @change="inputBlur(record, column.attr.Key)"
                />
              </template>
              <!--日期时间类型-->
              <template v-else-if="isDateTime(column.attr)">
                <TimePicker
                  v-if="column.attr.DateTimeConfig!.type === 'time' "
                  style="width: 100%"
                  v-model:value="record[column.attr.Key]"
                  :style="mergeAttrStyle(column.attr)"
                  :show-time="column.attr.DateTimeConfig!.showTime"
                  :format="column.attr.DateTimeConfig!.format"
                  :value-format="column.attr.DateTimeConfig!.format"
                  :disabled="mixedReadonly(column.attr, record)"
                  @change="inputBlur(record, column.attr.Key)"
                />
                <DatePicker
                  v-else
                  style="width: 100%"
                  v-model:value="record[column.attr.Key]"
                  :style="mergeAttrStyle(column.attr)"
                  :show-time="column.attr.DateTimeConfig!.showTime"
                  :format="column.attr.DateTimeConfig!.format"
                  :value-format="column.attr.DateTimeConfig!.format"
                  :disabled="mixedReadonly(column.attr, record)"
                  @change="inputBlur(record, column.attr.Key)"
                />
              </template>
              <!-- 金额类型 -->
              <template v-else-if="isMoney(column.attr)">
                <InputNumber
                  v-model:value="record[column.attr.Key]"
                  :style="mergeAttrStyle(column.attr)"
                  :disabled="mixedReadonly(column.attr, record)"
                  style="width: 100%; text-align: right"
                  :precision="column.attr.Precision"
                  @blur="inputBlur(record, column.attr.Key)"
                />
              </template>
              <template v-else-if="isInt(column.attr)">
                <InputNumber
                  v-model:value="record[column.attr.Key]"
                  :style="mergeAttrStyle(column.attr)"
                  :disabled="mixedReadonly(column.attr, record)"
                  style="text-align: right"
                  @blur="inputBlur(record, column.attr.Key)"
                />
              </template>
              <!--浮点类型-->
              <template v-else-if="isFloat(column.attr)">
                <InputNumber
                  v-model:value="record[column.attr.Key]"
                  :style="mergeAttrStyle(column.attr)"
                  :disabled="mixedReadonly(column.attr, record)"
                  style="text-align: right"
                  :precision="column.attr.Precision"
                  @blur="inputBlur(record, column.attr.Key)"
                />
              </template>
              <!-- DDL -->
              <template v-else-if="isDDL(column.attr)">
                <DDLSelect
                  v-if="core.isDDLSelect(column.attr.Key)"
                  v-model="record[column.attr.Key]"
                  v-model:name-value="record[column.attr.Key + 'T']"
                  :en-class-id="column.attr.BindEntityID"
                  :ref-key="column.attr.UIRefKeyValue || 'No'"
                  :ref-text="column.attr.UIRefKeyText || 'Name'"
                  @change="inputBlur(record, column.attr.Key)"
                  :map-exts="evtProps.mapExts.filter((ext) => ext.AttrOfOper == column.attr.Key)"
                  :disabled="mixedReadonly(column.attr, record)"
                />
                <TreeSelect
                  v-else
                  v-model:value="record[column.attr.Key]"
                  :tree-data="column.ddl"
                  :style="{ width: '100%', ...mergeAttrStyle(column.attr) }"
                  :disabled="mixedReadonly(column.attr, record)"
                  @change="updateDDLText(record, column.attr, column.ddl, $event)"
                  allow-clear
                  tree-node-filter-prop="label"
                  :dropdownStyle="ddlStyle"
                  show-search
                />
              </template>
              <!--文本域-->
              <template v-else-if="isTextArea(column.attr)">
                <Textarea
                  v-model:value="record[column.attr.Key]"
                  :style="mergeAttrStyle(column.attr)"
                  style="width: 100%; padding-bottom: 24px"
                  :disabled="!!mixedReadonly(column.attr, record)"
                  :rows="4"
                  show-count
                  :maxlength="column.attr.MaxLength"
                  @blur="inputBlur(record, column.attr.Key)"
                />
              </template>
              <!--文本框整行-->
              <template v-else-if="isTextBox(column.attr)">
                <div v-if="column.attr.Key.toLowerCase() === 'icon'" class="icon-wrapper">
                  <div class="icon">
                    <i :class="record[column.attr.Key]"></i>
                  </div>
                  <Button @click="openIconPicker(record)" type="default" style="border-radius: 0">
                    <SearchOutlined />
                  </Button>
                </div>
                <div v-else-if="column.attr.Key.toLowerCase().includes('color')" class="icon-cell">
                  <NColorPicker v-model:value="record[column.attr.Key]" show-alpha />
                </div>
                <AutoComplete
                  v-else-if="core.isRemoteSearch(column.attr.Key)"
                  v-model:value="record[column.attr.Key]"
                  :options="remoteSearchOptions"
                  :disabled="!!mixedReadonly(column.attr, record)"
                  :style="{ width: column.attr.UIWidth + 'px', ...core.mixedStyles(column.attr.Key) }"
                  @blur="() => (remoteSearchOptions = [])"
                  @select="(val, option) => core.handleRemoteSelectCore(record, val, option, column.attr.Key)"
                  @search="(kw: string) => core.handleRemoteSearch(column.attr.Key, kw)"
                />
                <Input
                  v-else
                  v-model:value="record[column.attr.Key]"
                  :style="{ ...mergeAttrStyle(column.attr), textAlign: 'left' }"
                  :disabled="!!mixedReadonly(column.attr, record)"
                  @change="inputBlur(record, column.attr.Key)"
                  @keyup="keyup(column.attr.MyDataType, record, column.attr)"
                />
              </template>
              <!--pop弹出框-->
              <template v-else-if="isPopTextArea(column.attr)">
                <div class="pop-selector-wrapper">
                  <InputGroup compact :disabled="true" :style="mergeAttrStyle(column.attr)">
                    <Input style="display: none" v-model:value="record[column.attr.Key]" @blur="inputBlur(record, column.attr.Key)" />
                    <div class="pop-display-area" :id="'div_' + column.attr.Key" :class="{ readonly: mixedReadonly(column.attr, record) }">
                      <div class="tags-container">
                        <template v-if="!record[column.attr.Key + 'T']">
                          <Tag v-if="record[column.attr.Key]" class="dtl-batch-tag">{{ record[column.attr.Key] }}</Tag>
                        </template>
                        <template v-else>
                          <Tag
                            v-for="(ele, p_idx) in getTagByKey(record[column.attr.Key + 'T'])"
                            :key="ele"
                            :closable="!mixedReadonly(column.attr, record)"
                            @close="removeTag(column.attr, ele, p_idx, record)"
                            class="dtl-batch-tag"
                          >
                            {{ getTagByKey(record[column.attr.Key + 'T'])[p_idx] }}
                          </Tag>
                        </template>
                      </div>
                      <Button @click="PopModalShow(column.attr, record)" :disabled="mixedReadonly(column.attr, record)" class="pop-trigger-btn">
                        <SettingOutlined />
                      </Button>
                    </div>
                  </InputGroup>
                </div>
              </template>
              <!--枚举单选按钮-->
              <template v-else-if="isRadioButton(column.attr)">
                <RadioGroup
                  v-model:value="record[column.attr.Key]"
                  @change="updateDDLText(record, column.attr, column.ddl, $event)"
                  :style="mergeAttrStyle(column.attr)"
                  :disabled="mixedReadonly(column.attr, record)"
                  style="display: flex; flex-direction: row"
                >
                  <Radio v-for="option in column.ddl" :key="option.value" :value="option.value"> {{ option.label }}</Radio>
                </RadioGroup>
              </template>
              <!--单附件-->
              <template v-else-if="isSingleAth(column.attr)">
                <div class="ant-upload-wrapper">
                  <Button @click="openFieldAth(column.attr, record[entity!.PK], column.attr.UIIsReadonly || props.readonly)"> <UploadOutlined />{{ '上传 / 查看' }}</Button>
                </div>
              </template>
              <span v-else>{{ '未知组件' }}</span>
            </div>
          </template>
        </Table>
      </div>
      <div v-if="disabled" class="dtl-search-mask">
        <Alert :message="'提示'" :description="'此从表需要与主表id关联, 请先保存主表'" type="info">
          <template #action>
            <Space direction="vertical">
              <Button size="small" type="primary" @click="$emit('save-main-table')">{{ '保存并使用' }}</Button>
            </Space>
          </template>
        </Alert>
      </div>
      <Modal v-model:open="iconPickerVisible" :title="'选择图标'" :bodyStyle="bodyStyle" :footer="null">
        <IconPicker @pick-icon="updateIcon" />
      </Modal>
      <Modal
        v-model:open="popModal.visible"
        :title="popModal.title"
        :body-style="({
        padding: '12px',
      } as any)"
        :width="popModal.width"
        :style="popModal.height"
        @ok="PopModalOK"
      >
        <template #footer>
          <div class="pop-footer">
            <div class="select-count" v-if="popModal.enableSelect">已选：{{ popSelectInfo.count }}个</div>
            <div class="button-group">
              <Button key="back" @click="handleCancel">{{ '取消' }}</Button>
              <Button key="submit" type="primary" class="btnStyle" @click="PopModalOK">{{ '确定' }}</Button>
            </div>
          </div>
        </template>
        <Pop
          v-if="popModal.visible === true"
          :popHeight="popModal.height"
          :selectVal="selectedRow[popModal.keyOfEn]"
          :selectNameVal="selectedRow[popModal.keyOfEn + 'T']"
          :mapExt="(popModal.mapExt as EnMapExt)"
          :rowData="selectedRow"
          :key="componentKey"
          :entity-ref="entity"
          ref="refPop"
        />
      </Modal>
      <drawer v-model:open="rightDrawer.visible" width="70%" :title="rightDrawer.title" @close="editClosed(true)" :body-style="bodyStyle">
        <component
          v-if="rightDrawer.visible"
          :is="rightDrawer.component"
          :params="rightDrawer.params"
          :EnName="rightDrawer.params?.EnName"
          :PKVal="rightDrawer.params?.PKVal"
          @close-self="editClosed(true)"
        />
      </drawer>
    </div>
  </BaseComponent>
</template>
<script lang="ts" setup>
  import { computed, nextTick, onMounted, reactive, ref, shallowRef, toRaw } from 'vue';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import {
    Alert,
    Space,
    Button,
    message,
    Table,
    Input,
    InputNumber,
    TimePicker,
    Tag,
    AutoComplete,
    DatePicker,
    Radio,
    TreeSelect,
    InputGroup,
    RadioGroup,
    Textarea,
    Drawer,
    Modal,
    Switch as AntSwitch,
  } from 'ant-design-vue';
  import { WF_Comm_Dtl } from '/@/DataUser/OverrideFiles/WF_Comm_Dtl';
  import { ActionItem } from '/@/components/Table';
  import { debounce } from 'lodash-es';
  import { Entity } from '/@/bp/en/Entity';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import type { Component } from 'vue';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { WaiGuaBaseEntity } from '../../../bp/UIEntity/WaiGuaBaseEntity';
  import { ClassFactoryOfWaiGuaEntity } from '../UIEntity/ClassFactoryOfWaiGuaEntity';
  import { UserRegedit } from '/@/bp/sys/UserRegedit';
  import webUser from '/@/bp/web/WebUser';
  import { useDtlQueryCondition } from '/@/hooks/ens/useDtlQueryCondition';
  import { Attrs } from '/@/bp/en/Map/Attrs';
  import useFieldType from '/@/hooks/ens/useFieldType';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { CheckOutlined, CloseOutlined, SearchOutlined, SettingOutlined, UploadOutlined } from '@ant-design/icons-vue';
  import { NColorPicker } from 'naive-ui';
  import { useForm } from 'ant-design-vue/es/form';
  import useMapExtHandler from '/@/hooks/ens/useMapExtHandler';
  import { Attr } from '/@/bp/en/Map/Attr';
  import { FrmAttachment } from '/@/WF/Admin/FrmLogic/FrmAttachment/FrmAttachment';
  import { getAtStrValByKey } from '/@/utils/stringUtils';
  import { FieldType, UIContralType } from '/@/bp/en/EnumLab';
  import { useDDLDataLoader } from '/@/hooks/ens/useDDLDataLoader';
  import { EnMapExt, EnMapExts } from '/@/bp/en/Map/EnMapExt';
  import IconPicker from '/@form/components/icon-picker/IconPicker.vue';
  import Pop from '/@/WF/Comm/subComponents/Pop.vue';
  import DDLSelect from '/@/WF/Comm/subComponents/DDLSelect.vue';

  const btn_style = computed(() => {
    return (btn: string) => {
      if (btn.includes('新增') || btn.includes('新建')) {
        return 'btn_style btn_add';
      } else if (btn.includes('保存')) {
        return 'btn_style btn_save';
      } else if (btn.includes('删除')) {
        return 'btn_style btn_del';
      } else {
        return 'btn_style';
      }
    };
  });

  const baseComp = shallowRef<InstanceType<typeof BaseComponent>>();

  const Columns: any = ref([]);
  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
    mainTableInfo: {
      type: Object,
      default: () => {
        return {
          row: {},
          classId: '',
        };
      },
    },
    height: {
      type: Number,
      default: window.innerHeight * 0.75,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  });

  interface DDL {
    label: string;
    value: string | number;
  }
  interface CustomAttr extends Attr {
    Tag: string[];
    ddl: DDL[];
    validateErr: string;
    errStyle: any;
  }
  //搜索
  const ddlStyle = ref({ overflow: 'auto' });
  const searchKey = ref('');
  // styles
  const bodyStyle = computed(() => {
    return {
      '--padding': '0px 12px !important',
      'border-top': '1px solid #EAEDF6',
    };
  });

  // 实现弹窗选择回显
  const popSelectInfo = reactive({
    count: 0,
    updateCount: (val) => {
      popSelectInfo.count = val;
    },
  });
  const updateIcon = (icon: string) => {
    if (selectedRow.value) {
      selectedRow.value['Icon'] = icon;
    } else {
      message.error('图标未能选中');
    }
    iconPickerVisible.value = false;
    selectedRow.value = undefined;
  };
  /**
   * 处理字段函数
   * @param attr
   */
  const validFailMap = ref(new Map());
  const isValidFailed = (attr, row) => {
    if (!attr) return;
    const uniKey = row[entityPK.value] + '_' + attr.key;
    return validFailMap.value.has(uniKey);
  };
  const { EnName, PKVal, RefPKVal, RefPK, ButsTableTop, Sort1, Sort2, Sort12RefKey } = toRaw(props.params);
  const remoteSearchOptions = ref([]);
  const emptyRow = ref({});
  const evtProps = { mapExts: new EnMapExts(), mapAttrs: [] };
  const { core } = useMapExtHandler(emptyRow, remoteSearchOptions, evtProps);
  const { isFloat, isInt, isDateTime, isDate, isDDL, isBoolean, isMoney, isTextBox, isTextArea, isPopTextArea, isRadioButton, isSingleAth, isRichText } = useFieldType();
  const mergeAttrStyle = (attr: CustomAttr) => {
    const errStyle = attr.errStyle || {};
    return {
      ...core.mixedStyles(attr.Key),
      ...errStyle,
    };
  };
  const mixedReadonly = (attr: CustomAttr, row: Recordable) => {
    if (gloReadonly.value) return true;
    if (core.isControlFieldReadonlyCore(row, attr.Key)) return true;
    if (isDate(attr) || isDateTime(attr)) return core.isDateReadonlyCore(row, attr.Key);
    return attr.UIIsReadonly;
  };

  // DtlBatch中暂时只执行简单校验
  const inputBlur = async (row: Recordable, key = '') => {
    try {
      if (!!key) {
        core.handleFieldChangeListenersCore(row, key, tableData.value || []);
      }
      for (const [k, _v] of validFailMap.value) {
        if (k.startsWith(row[entityPK.value] + '_')) {
          validFailMap.value.delete(k);
        }
      }
      const validator = entity!._enMap._validator;
      const validatorKeys = Object.keys(validator);
      if (validatorKeys.length == 0) return;
      // 增强验证器，为每个 validator 注入行数据
      const enhancedValidator = Object.keys(validator).reduce((acc, key) => {
        acc[key] = validator[key].map((rule) => {
          if (rule.validator) {
            return {
              ...rule,
              validator: (ruleObj, value, callback) => {
                // 将行数据作为第四个参数传递
                return rule.validator.call(row, ruleObj, value, callback, row);
              },
            };
          }
          return rule;
        });
        return acc;
      }, {});
      const validatorRef = shallowRef(enhancedValidator);
      const { validate } = useForm(row, validatorRef);
      await validate();
    } catch (errors) {
      for (const err of errors.errorFields) {
        const key = row[entityPK.value] + '_' + err.name;
        validFailMap.value.set(key, err.errors);
      }
    }
  };

  const updateDDLText = (record: Recordable, attr: Attr, ddl: DDL[], event: any) => {
    const ddlItem = ddl.find((ddlItem: DDL) => ddlItem.value === event);
    if (ddlItem) {
      record[attr.Key + 'T'] = ddlItem.label;
      core.handleDropdownEventsCore(record, attr.Key);
      core.handleAutoFillEventsCore(record, attr.Key, event);
      core.handleFieldChangeListenersCore(record, attr.Key);
    }
    // inputBlur(record, attr.Key);
  };
  const selectedRow = ref();
  const iconPickerVisible = ref(false);
  const openIconPicker = (row: Recordable) => {
    selectedRow.value = row;
    iconPickerVisible.value = true;
  };

  const keyup = (type, record, col) => {
    if (type == 2 || type == 3 || type == 8) {
      if (isNaN(record[col])) {
        record[col] = 0;
      }
    }
  };
  const getTagByKey = (val: string) => {
    return val.split(',').filter((item) => item !== '');
  };

  const removeTag = (attr, ele, idx, row) => {
    // const val = selectedRow.value[attr.Key];
    // const valT = selectedRow.value[attr.Key + 'T'];
    // if (!!val && !!valT) {
    //   const arrVal: [] = val.split(',');
    //   arrVal.splice(idx, 1);
    //   selectedRow.value[attr.Key] = arrVal.join(',');
    //   const arrValT: [] = valT.split(',');
    //   arrValT.splice(idx, 1);
    //   selectedRow.value[attr.Key + 'T'] = arrValT.join(',');
    //   Columns.value.forEach((item) => {
    //     if (item.Key == attr.Key) item.Tag = arrVal;
    //   });
    // }
    const val = row[attr.Key];
    const valT = row[attr.Key + 'T'];
    if (!!val && !!valT) {
      const arrVal: [] = val.split(',');
      arrVal.splice(idx, 1);
      row[attr.Key] = arrVal.join(',');
      const arrValT: [] = valT.split(',');
      arrValT.splice(idx, 1);
      row[attr.Key + 'T'] = arrValT.join(',');
    }
  };

  //弹窗显示
  const popModal = reactive({
    visible: false,
    title: '',
    modalType: '',
    keyOfEn: '',
    width: 800,
    height: {},
    mapExt: new EnMapExt(),
    enableSelect: false,
  });
  const componentKey = ref(0);
  const PopModalShow = (attr, row) => {
    selectedRow.value = row;
    popModal.visible = true;
    popModal.title = attr.mapExt[0].AtPara?.GetValStrByKey('Label') || '请选择' + attr.Name;
    popModal.enableSelect = attr.mapExt[0].AtPara?.GetValStrByKey('IsMultipleChoice') == '1';
    popModal.keyOfEn = attr.Key;
    popModal.width = attr.mapExt[0].W || attr.mapExt[0].width || window.innerWidth * 0.8;
    popModal.width = popModal.width > window.innerWidth * 0.8 ? window.innerWidth * 0.8 : popModal.width;
    popModal.height = {
      height: attr.mapExt[0].H || window.innerHeight * 0.8 + 'px',
    };
    popModal.mapExt = attr.mapExt[0];
    popModal.modalType = attr.mapExt[0].ExtType;
    componentKey.value++;
  };
  const refPop = shallowRef<InstanceType<typeof Pop>>();
  const PopModalOK = () => {
    const checkedInfo = refPop.value!.handlerPopOK();
    if (checkedInfo[0].length === 0) {
      selectedRow.value[popModal.keyOfEn] = '';
      selectedRow.value[popModal.keyOfEn + 'T'] = '';
    } else {
      selectedRow.value[popModal.keyOfEn] = checkedInfo?.[0].join(',');
      selectedRow.value[popModal.keyOfEn + 'T'] = checkedInfo?.[1].join(',');
    }
    Columns.value.forEach((item) => {
      if (item.Key == popModal.keyOfEn) item['Tag'] = !selectedRow.value[popModal.keyOfEn] ? [] : selectedRow.value[popModal.keyOfEn].split(',');
    });
    popModal.visible = false;
    core.handleAutoFillEventsCore(selectedRow.value, popModal.keyOfEn, checkedInfo?.[0]?.[0]);
  };
  const editClosed = async (reload = true) => {
    rightDrawer.visible = false;
    if (!reload) return;
    await nextTick();
    //await reload_func?.();
  };
  //取消按钮
  const handleCancel = () => {
    popModal.visible = false;
  };

  // 打开字段附件
  const openFieldAth = async (attr, pkval: string, readonly: boolean) => {
    await batchSave();
    //const pkVal = entityObj.value?.PKVal;
    const athTablePK = EnName + '_' + attr.Key;
    const ath = new FrmAttachment(athTablePK);
    if (await ath.IsExits()) {
      await ath.Retrieve();
    }
    ath.Name = attr.Desc;
    ath.FK_MapData = EnName;
    ath.NoOfObj = attr.Key;
    if (attr.UIBindKey!.toString().includes('AthType=AthSingle')) ath.TopNumOfUpload = 1;
    if (attr.UIIsReadonly) ath.IsUpload = false;
    const saveType = getAtStrValByKey(attr.UIBindKey!, 'SaveTo');
    if (saveType) ath.AthSaveWay = saveType;
    await ath.Save();
    baseComp.value?.handleGPNCallback(
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
          // closeFunc: loadEntityAths,
        },
        '表格附件：' + ath.Name,
      ),
    );
  };

  const dtlSearchRef = shallowRef<HTMLElement>();

  // }
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const HisUAC: any = ref({});
  const selectedIds = ref<any>([]);
  const currentId = ref('');
  interface DrawerParams {
    visible: boolean;
    component: Component;
    title: string;
    params: Recordable;
  }
  const rightDrawer = reactive<DrawerParams>({
    visible: false,
    component: {},
    title: '',
    params: {},
  });
  let entity: Nullable<Entity> = null;

  const enActions = ref<Array<{ label: string; onClick: Function }>>([]);
  const execEnActions = async (btn) => {
    const res = await btn.onClick(PKVal, selectedIds.value.join(','), {
      ...props.params,
      RefPKVal: props.params.PKVal,
    });
    if (res instanceof GPNReturnObj) {
      baseComp.value?.handleGPNCallback(res);
    }
  };

  const entityWG = ref<Nullable<WaiGuaBaseEntity>>();

  const ur = reactive(new UserRegedit());
  const urMyPK = webUser.No + '_' + EnName + '_SearchAttrs';
  const { getQueryArgs } = useDtlQueryCondition();

  const checkUserRegedit = async () => {
    ur.setPKVal(urMyPK);
    if ((await ur.RetrieveFromDBSources()) === 0) await ur.Insert();
    ur.Vals = '';
    const queryArgs = getQueryArgs(props.params, {}, entity!);
    for (let i = 0; i < queryArgs.length; i += 2) {
      if (queryArgs[i] == 'Sort1' || queryArgs[i] == 'Sort2' || queryArgs[i] == 'Sort3' || queryArgs[i] == 'Sort12RefKey') continue;
      ur.Vals += `@${queryArgs[i]}=${queryArgs[i + 1]}`;
    }
    const { enable, key } = entity!.LogicDelConfig;
    if (enable) {
      ur.Vals += `@${key}=0`;
    }
    await ur.Update();
  };
  const tableData = ref<any[]>([]);
  const Sort1Options = ref<any[]>([]);
  const Sort2Options = ref<any[]>([]);
  let attrs: Attrs;
  const isEdit = ref(false);
  const entityPK = ref('');
  const sort2IsMerge = ref(props.params.Sort2IsMerge == 1 ? true : false); // 小类是否合并
  const isReloadSort = ref(props.params.IsReloadSort == 1 ? true : false); //是否重新加载大小类
  const isOrderBySort1 = ref(props.params.IsOrderBySort1 == 1 ? true : false); // 是否按照大类排序

  // end
  const InitPage = async () => {
    try {
      if (!EnName) {
        errorObj.hasError = true;
        errorObj.tips = '缺少参数 [ EnName ]';
        return;
      }
      entityWG.value = await ClassFactoryOfWaiGuaEntity.GetEn(('WGEntity_' + EnName.substring(EnName.lastIndexOf('.') + 1)) as string);
      const ens = await ClassFactory.GetEns(EnName);
      await ens.Init();
      entity = ens.GetNewEntity;
      if (!entity) {
        message.error('获取实体失败');
        return;
      }
      entity.SetPageParam({
        ...props.mainTableInfo,
        ...props.params,
      });
      const _enMap = entity.EnMap;
      evtProps.mapExts = _enMap.enMapExts;
      core.loadMapExts(_enMap.enMapExts || []);
      entityPK.value = entity.PK;
      //处理查询条件.

      enActions.value = ens.enActions;
      attrs = _enMap.attrs;

      HisUAC.value = await entity.GenerUAC();
      if (HisUAC.value.IsInsert || HisUAC.value.IsUpdate) {
        isEdit.value = true;
      }
      currentId.value = entity._enMap.PKs as string;
      Columns.value = [];
      const sort1Attr = attrs.GetAttrByKey(Sort1);
      if (sort1Attr == null) {
        message.error('获取实体第一维字段失败');
        return;
      }
      const sort2Attr = attrs.GetAttrByKey(Sort2);
      if (sort2Attr == null) {
        message.error('获取实体第二维字段失败');
        return;
      }
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
      handler.AddPara('EnName', EnName);
      handler.AddPara('Sort1', Sort1);
      handler.AddPara('Sort2', Sort2);
      handler.AddPara('Sort12RefKey', Sort12RefKey);
      const result = await handler.DoMethodReturnString('Dtl2DFixRow_Init');
      const { getDDLData } = useDDLDataLoader(entity);
      //获取一维的数据
      Sort1Options.value = result['Sort1'];
      //获取二维的数据
      Sort2Options.value = result['Sort2'];
      //增加两列Sort1,Sort2
      Columns.value.push({
        key: Sort1,
        title: sort2IsMerge.value ? sort1Attr.Desc : '',
        dataIndex: Sort1,
        edit: false,
        width: Math.max(sort1Attr.UIWidth, 150),
        align: 'center',
        customCell: (record) => ({ rowSpan: sort2IsMerge.value ? 1 : record.rowSpan, colSpan: record.colSpan || 1 }),
      });
      Columns.value.push({
        key: Sort2,
        title: sort2IsMerge.value ? sort2Attr.Desc : '',
        dataIndex: Sort2,
        edit: false,
        width: Math.max(sort2Attr.UIWidth, 150),
        algin: 'center',
        customCell: (record) => ({ colSpan: !!record.colSpan ? 0 : 1 }),
      });
      //获取列表数
      const curAttrs = attrs.filter((attr) => attr.UIVisible === true && attr.Key != Sort1 && attr.Key != Sort2);
      //根据字段权限处理显示的字段
      const enMapexts = entity?._enMap.enMapExts || [];
      for (const attr of curAttrs) {
        //判断是否有扩展属性
        if (enMapexts.length > 0) {
          const arr = enMapexts.filter((item) => item.AttrOfOper === attr.Key);
          attr['mapExt'] = arr;
        }
        const colum = {
          key: attr.Key,
          title: attr.Desc,
          dataIndex: attr.Key,
          edit: attr.UIIsReadonly ? false : true,
          width: Math.max(attr.UIWidth, 150),
          attr: attr,
        };
        // 处理不同类型的列
        if (needsDDLData(attr)) {
          await processDDLColumn(colum, attr, getDDLData);
        }
        Columns.value.push(colum);
      }
    } catch (e) {
      message.error(e);
    } finally {
    }
  };
  /**
   * 检查是否需要加载下拉列表数据
   */
  const needsDDLData = (attr) => {
    return (attr.UIContralType == UIContralType.DDL && attr.MyFieldType === FieldType.Normal) || attr.MyFieldType === FieldType.Enum || attr.MyFieldType === FieldType.FK;
  };
  /**
   * 处理需要下拉列表的列
   */
  const processDDLColumn = async (column, attr, getDDLData) => {
    if (attr.UIContralType == UIContralType.DDL && attr.MyFieldType === FieldType.Normal && attr.UIIsReadonly) {
      // 处理只读DDL列
      const newAttr = entity?._enMap.attrs.find((oldAttr) => oldAttr.Key === attr.Key + 'T');
      if (newAttr) {
        column.key = newAttr.Key;
        column.dataIndex = newAttr.Key;
        column.params = newAttr;
        column.slots = { customRender: newAttr.Key };
      }
    } else {
      // 加载下拉列表数据
      //column.ddl = await getDDLData(attr, props.params);
      // 处理只读DDL列
      const hasExtOption = evtProps.mapExts.find((ext) => ext.ExtType === 'DDLSelect' && ext.AttrOfOper == attr.Key);
      if (!hasExtOption) {
        column.ddl = await getDDLData(attr, props.params);
      }
    }
  };
  const getTopButtons = () => {
    const arr = ButsTableTop || [];
    const actions: Array<ActionItem> = [];
    if (HisUAC.value.IsUpdate || HisUAC.value.IsInsert) {
      actions.push({
        label: '保存',
        ghost: true,
        onClick: async () => {
          await batchSave();
        },
      });
    }
    if (arr.length !== 0) {
      arr?.split(',').forEach((btnName) => {
        actions.push({
          label: btnName,
          onClick: async () => {
            const res = await WF_Comm_Dtl.TableTopBtnClick(btnName, EnName, RefPKVal, selectedIds.value.join(), props.params);
            if (res instanceof GPNReturnObj) {
              baseComp.value?.handleGPNCallback(res);
            }
          },
        });
      });
    }
    return actions;
  };

  const batchSave = async () => {
    try {
      const ens = await ClassFactory.GetEns(EnName);
      const { RefPK, PKVal } = props.params;
      const updateQueue: Promise<string | number | boolean>[] = [];
      tableData.value.forEach((dataItem) => {
        const en = ens.GetNewEntity;
        en.SetValByKey(RefPK, PKVal);
        en.SetValByKey(Sort1, dataItem[Sort1 + 'Key']);
        en.SetValByKey(Sort1 + 'T', dataItem[Sort1]);
        en.SetValByKey(Sort2, dataItem[Sort2 + 'Key']);
        en.SetValByKey(Sort2 + 'T', dataItem[Sort2]);
        attrs
          ?.filter((attr) => attr.Key != Sort1 && attr.Key != Sort2 && attr.Key != Sort1 + 'T' && attr.Key != Sort2 + 'T')
          .map((attr) => {
            en.SetValByKey(attr.Key, dataItem[attr.Key]);
          });
        const val = dataItem[entityPK.value];
        if (!!val) {
          en.setPKVal(val);
          updateQueue.push(en.Update());
        } else updateQueue.push(en.Insert());
      });
      await Promise.all(updateQueue);
      message.info('保存成功');
      await SearchAndDealData();
    } catch (e) {
      console.trace(e);
      message.error(e.toString());
    }
  };
  const sortedTargetArray = (targetArray) => {
    const sortMap = new Map<string, string>();
    Sort1Options.value.forEach((item) => {
      sortMap.set(item.No, item.No);
    });

    // 排序目标数组
    return [...targetArray].sort((a, b) => {
      const weightA: string = sortMap.get(a[Sort1]) || '';
      const weightB: string = sortMap.get(b[Sort1]) || '';
      return weightA.localeCompare(weightB); // 升序（降序改为weightB - weightA）
    });
  };
  const loadingEnd = ref(false);
  const SearchAndDealData = async () => {
    loadingEnd.value = false;
    //查询集合
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
    handler.AddPara('EnsName', EnName);
    handler.AddPara('PageIdx', 0);
    handler.AddPara('PageSize', 9999);
    const data = await handler.DoMethodReturnJson<Recordable>('Search_SearchIt');
    await ur.Retrieve();
    tableData.value = [];
    let result = data.DT || [];
    if (isOrderBySort1.value) {
      result = sortedTargetArray(result);
    }
    if (isReloadSort.value == false && result.length != 0) {
      result.forEach((dataItem) => {
        const item = {};
        item[Sort1] = dataItem[Sort1 + 'T'];
        item[Sort1 + 'Key'] = dataItem[Sort1];
        item[Sort2] = dataItem[Sort2 + 'T'].replace(/,/g, '<br/>');
        item[Sort2 + 'Key'] = dataItem[Sort2];
        item[entityPK.value] = dataItem[entityPK.value];
        item[RefPK] = props.params.PKVal;
        attrs
          ?.filter((attr) => attr.UIVisible === true && attr.Key != Sort1 && attr.Key != Sort2 && attr.Key != RefPK)
          .map((attr) => {
            if (dataItem == null) {
              item[attr.Key] = attr.IsNum ? 0 : '';
            } else {
              if (attr.IsNum) item[attr.Key] = dataItem[attr.Key] || 0;
              else {
                item[attr.Key] = dataItem[attr.Key] || '';
                item[attr.Key + 'T'] = dataItem[attr.Key + 'T'] || '';
              }
            }
          });
        tableData.value.push(item);
      });
      loadingEnd.value = true;
      return;
    }

    Sort1Options.value.forEach((sort1Item) => {
      const curSort2Options = Sort2Options.value.filter((item) => item[Sort12RefKey] === sort1Item.No);
      if (sort2IsMerge.value == false) {
        if (curSort2Options.length == 0) {
          const item = {};
          item['colSpan'] = 2;
          item[Sort1] = sort1Item.Name;
          item[Sort1 + 'Key'] = sort1Item.No;
          item[Sort2] = '';
          item[Sort2 + 'Key'] = '';
          const itemData = GetData(result, sort1Item.No, '');
          if (itemData == null) item[entityPK.value] = '';
          else item[entityPK.value] = itemData[entityPK.value];
          item[RefPK] = props.params.PKVal;
          attrs
            ?.filter((attr) => attr.UIVisible === true && attr.Key != Sort1 && attr.Key != Sort2 && attr.Key != RefPK)
            .map((attr) => {
              if (itemData == null) {
                item[attr.Key] = attr.IsNum ? 0 : '';
              } else {
                if (attr.IsNum) item[attr.Key] = itemData[attr.Key] || 0;
                else {
                  item[attr.Key] = itemData[attr.Key] || '';
                  item[attr.Key + 'T'] = itemData[attr.Key + 'T'] || '';
                }
              }
            });
          tableData.value.push(item);
        } else {
          curSort2Options.forEach((sort2Item, index) => {
            const item = {};
            item[Sort1] = sort1Item.Name;
            item[Sort1 + 'Key'] = sort1Item.No;
            item[Sort2] = sort2Item.Name;
            item[Sort2 + 'Key'] = sort2Item.No;
            const itemData = GetData(result, sort1Item.No, sort2Item.No);
            if (itemData == null) item[entityPK.value] = '';
            else item[entityPK.value] = itemData[entityPK.value];
            item[RefPK] = props.params.PKVal;
            attrs
              ?.filter((attr) => attr.UIVisible === true && attr.Key != Sort1 && attr.Key != Sort2 && attr.Key != RefPK)
              .map((attr) => {
                if (itemData == null) {
                  item[attr.Key] = attr.IsNum ? 0 : '';
                } else {
                  if (attr.IsNum) item[attr.Key] = itemData[attr.Key] || 0;
                  else {
                    item[attr.Key] = itemData[attr.Key] || '';
                    item[attr.Key + 'T'] = itemData[attr.Key + 'T'] || '';
                  }
                }
              });

            if (index == 0) item['rowSpan'] = curSort2Options.length;
            else item['rowSpan'] = 0;
            tableData.value.push(item);
          });
        }
      } else {
        const item = {};
        item[Sort1] = sort1Item.Name;
        item[Sort1 + 'Key'] = sort1Item.No;
        const sort2Names: string[] = [];
        const sort2Nos: string[] = [];
        curSort2Options.forEach((sort2Item) => {
          sort2Nos.push(sort2Item.No);
          sort2Names.push(sort2Item.Name);
        });
        item[Sort2] = sort2Names.join('<br/>');
        item[Sort2 + 'Key'] = sort2Nos.join(',');
        const itemData = result.find((item) => item[Sort1] == sort1Item.No);
        if (itemData == null) item[entityPK.value] = '';
        else item[entityPK.value] = itemData[entityPK.value];
        item[RefPK] = props.params.PKVal;
        attrs
          ?.filter((attr) => attr.UIVisible === true && attr.Key != Sort1 && attr.Key != Sort2 && attr.Key != RefPK)
          .map((attr) => {
            if (itemData == null) {
              item[attr.Key] = attr.IsNum ? 0 : '';
            } else {
              if (attr.IsNum) item[attr.Key] = itemData[attr.Key] || 0;
              else {
                item[attr.Key] = itemData[attr.Key] || '';
                item[attr.Key + 'T'] = itemData[attr.Key + 'T'] || '';
              }
            }
          });
        tableData.value.push(item);
      }
    });
    loadingEnd.value = true;
  };
  const GetData = (tableData, sort1Val, sort2Val) => {
    const result = tableData.find((item) => item[Sort1] == sort1Val && item[Sort2] == sort2Val);
    if (result == null) return null;
    return result;
  };
  //搜索
  const Search = debounce(async () => {
    ur.SearchKey = searchKey.value;
    await ur.Update();
    await SearchAndDealData();
  }, 300);
  onMounted(async () => {
    await InitPage();
    await checkUserRegedit();
    await SearchAndDealData();
    searchKey.value = ur.SearchKey;
  });
  const gloReadonly = computed(() => {
    return props.readonly || [1, '1', true].includes(props.params?.readonly);
  });
  defineEmits(['save-main-table']);
</script>
<style lang="less" scoped>
  .vben-basic-table-form-container {
    overflow: hidden;
    box-sizing: border-box;
  }

  .vben-basic-table-action.center {
    justify-content: right;
  }

  .dtl-search {
    :deep(.vben-basic-table-form-container .ant-form) {
      margin-bottom: 6px;
      padding: 6px 10px 0;
    }

    :deep(.ant-btn-dangerous) {
      color: #ff6666;
      background-color: #ff6666;
      border-color: #ff6666;
    }
    :deep(.ant-btn-background-ghost + .ant-btn-primary:focus) {
      color: #1677ff !important;
    }
  }

  .dtl-search-wrapper {
    position: relative;

    .dtl-search-mask {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.08);
      z-index: 999;
      backdrop-filter: blur(1px);
    }

    .td-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 0;
    }
  }

  .search-container {
    margin-right: 15px;
  }

  //搜索图标动画
  :deep(.ant-input-prefix) {
    margin-left: -5px;
    margin-right: 5px;
  }

  .search-input {
    width: 180px;
    overflow: hidden;
    transition: width 0.3s;
  }

  .dtl-header {
    display: flex;
    justify-content: flex-start;
    //height: 100%;
    margin-bottom: 5px;
    flex: 1;

    .title {
      display: flex;
      align-items: center;
      justify-content: center;

      span {
        margin-right: 6px;
        font-size: 14px;
      }
    }
  }

  .btn_style {
    height: 30px;
    border-radius: 5px;
  }

  .btn_add {
    background-color: #f6ffed !important;
    color: #52c41a !important;
    border: 1px solid #b7eb8f !important;
  }

  .btn_save {
    background-color: #e6f7ff !important;
    color: #1890ff !important;
    border: 1px solid #91d5ff !important;
  }

  .btn_del {
    background-color: #fff2f0 !important;
    border: 1px solid #ffadd2 !important;
    color: #ff6666 !important;
  }
  .pop-selector-wrapper {
    width: 100%;

    .pop-display-area {
      display: flex;
      align-items: center;
      min-height: 36px;
      padding: 0 8px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: white;
      transition: all 0.2s ease;

      &:hover:not(.readonly) {
        border-color: #9ca3af;
      }

      &.readonly {
        background: #f9fafb;
        cursor: not-allowed;
      }

      .tags-container {
        flex: 1;
        display: flex;
        overflow: hidden;
        gap: 4px;
        min-height: 24px;
        align-items: center;
      }

      .pop-trigger-btn {
        border: none;
        background: transparent;
        color: #6b7280;
        padding: 4px 8px;
        height: auto;
        min-height: auto;

        &:hover:not(:disabled) {
          color: #3b82f6;
          background: #f3f4f6;
        }

        &:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
      }
    }
  }

  .dtl-batch-tag {
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
    color: #1e40af;
    border: 1px solid #bfdbfe;
    border-radius: 4px;
    font-size: 12px;
    padding: 2px 8px;

    :deep(.ant-tag-close-icon) {
      color: #6b7280;
      margin-left: 4px;

      &:hover {
        color: #ef4444;
      }
    }
  }
</style>
