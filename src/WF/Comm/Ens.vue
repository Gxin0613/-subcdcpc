<template>
  <BaseComponent ref="baseComp" :closeDrawerFunc="editClosed" :close-modal-func="editClosed">
    <div ref="dtlBatchRef" class="ens-wrapper">
      <!-- 表格头部工具栏 -->
      <div class="table-toolbar">
        <!-- <div class="toolbar-left">
          <h3 class="table-title">
            <i :class="props.params.Icon"></i>
            {{ props.params.title }}编辑
          </h3>
        </div> -->
        <div class="toolbar-search">
          <Input v-model:value="searchKey" :placeholder="'关键字...'" @change="Search" allow-clear style="width: 130px">
            <template #prefix>
              <SearchOutlined />
            </template>
          </Input>
        </div>
        <div class="toolbar-right">
          <Button v-for="btn in actionBtnsRef" :ghost="btn.ghost" :disabled="gloReadonly" :key="btn.label" @click="btn.onClick" :class="['ens-btn', btn_style(btn.label)]">
            <i :class="getBtnIcon(btn.label)"></i>
            {{ btn.label }}
          </Button>
          <Button v-for="btn in enArrMethods" ghost :key="btn.label" :disabled="gloReadonly" class="ens-btn ext-btn" @click="execEnArrMethods(btn)">
            <i class="icon-extension"></i>
            {{ btn.label }}
          </Button>
          <Button v-for="btn in extMethods" ghost :key="btn.label" :disabled="isExtMethodReadonly(btn)" class="ens-btn ext-btn" @click="execExtMethods(btn)">
            <i class="icon-gear"></i>
            {{ btn.label }}
          </Button>
        </div>
      </div>

      <!-- 主表格容器 -->
      <div class="table-container">
        <BasicTable v-if="tableConfig" class="ens-table" @register="tableConfig" :scroll="{ y: props.height }">
          <template #headerCell="{ column }">
            <div v-if="column.key == '_sys_move'" class="drag-header">
              <i class="icon-shuffle"></i>
            </div>
          </template>

          <template #sys_move>
            <div class="drag-handle">
              <DragOutlined class="drag-icon" />
            </div>
          </template>

          <!-- 各种字段类型的模板 -->
          <template v-for="attr in tableColumns" :key="attr.Key" #[attr.Key]="{ record: row }">
            <div class="cell-wrapper" :class="{ 'cell-error': isValidFailed(attr, row) }">
              <!-- 富文本 -->
              <template v-if="isRichText(attr)">
                <div class="rich-text-placeholder">
                  <i class="icon-rich-text"></i>
                  <span>富文本不可编辑</span>
                </div>
              </template>

              <!-- 开关 -->
              <template v-else-if="isBoolean(attr)">
                <div class="switch-wrapper">
                  <AntSwitch v-model:checked="row[attr.Key]" :disabled="mixedReadonly(attr, row)" :style="mergeAttrStyle(attr)" class="ens-switch">
                    <template #checkedChildren><check-outlined /></template>
                    <template #unCheckedChildren><close-outlined /></template>
                  </AntSwitch>
                </div>
              </template>

              <!-- 日期选择器 -->
              <template v-else-if="isDate(attr)">
                <DatePicker
                  v-model:value="row[attr.Key]"
                  :style="mergeAttrStyle(attr)"
                  :picker="attr.DateConfig!.type"
                  :format="attr.DateConfig!.format"
                  :value-format="attr.DateConfig!.format"
                  :disabled-date="(current) => core.getDisabledDateCore(row, attr.Key)?.(current)"
                  :disabled="mixedReadonly(attr, row)"
                  @change="inputBlur(row, attr.Key)"
                  class="ens-date-picker"
                />
              </template>

              <!-- 日期时间选择器 -->
              <template v-else-if="isDateTime(attr)">
                <TimePicker
                  v-if="attr.DateTimeConfig!.type === 'time'"
                  v-model:value="row[attr.Key]"
                  :style="mergeAttrStyle(attr)"
                  :show-time="attr.DateTimeConfig!.showTime"
                  :format="attr.DateTimeConfig!.format"
                  :value-format="attr.DateTimeConfig!.format"
                  :disabled="mixedReadonly(attr, row)"
                  @change="inputBlur(row, attr.Key)"
                  class="ens-time-picker"
                />
                <DatePicker
                  v-else
                  v-model:value="row[attr.Key]"
                  :style="mergeAttrStyle(attr)"
                  :show-time="attr.DateTimeConfig!.showTime"
                  :format="attr.DateTimeConfig!.format"
                  :value-format="attr.DateTimeConfig!.format"
                  :disabled="mixedReadonly(attr, row)"
                  @change="inputBlur(row, attr.Key)"
                  class="ens-datetime-picker"
                />
              </template>

              <!-- 金额输入 -->
              <template v-else-if="isMoney(attr)">
                <div class="money-input-wrapper">
                  <span class="currency-symbol">¥</span>
                  <InputNumber
                    v-model:value="row[attr.Key]"
                    :style="mergeAttrStyle(attr)"
                    :disabled="mixedReadonly(attr, row)"
                    :precision="attr.Precision"
                    @blur="inputBlur(row, attr.Key)"
                    class="ens-money-input"
                  />
                </div>
              </template>

              <!-- 整数输入 -->
              <template v-else-if="isInt(attr)">
                <InputNumber
                  v-model:value="row[attr.Key]"
                  :style="mergeAttrStyle(attr)"
                  :disabled="mixedReadonly(attr, row)"
                  @blur="inputBlur(row, attr.Key)"
                  class="ens-number-input"
                />
              </template>

              <!-- 浮点数输入 -->
              <template v-else-if="isFloat(attr)">
                <InputNumber
                  v-model:value="row[attr.Key]"
                  :style="mergeAttrStyle(attr)"
                  :disabled="mixedReadonly(attr, row)"
                  :precision="attr.Precision"
                  @blur="inputBlur(row, attr.Key)"
                  class="ens-number-input"
                />
              </template>

              <!-- 下拉选择 -->
              <template v-else-if="isDDL(attr)">
                <DDLSelect
                  v-if="core.isDDLSelect(attr.Key)"
                  v-model="row[attr.Key]"
                  v-model:name-value="row[attr.Key + 'T']"
                  :en-class-id="attr.BindEntityID"
                  :ref-key="attr.UIRefKeyValue || 'No'"
                  :ref-text="attr.UIRefKeyText || 'Name'"
                  @change="inputBlur(row, attr.Key)"
                  :map-exts="evtProps.mapExts.filter((ext) => ext.AttrOfOper == attr.Key)"
                  :disabled="mixedReadonly(attr, row)"
                />
                <TreeSelect
                  v-else
                  v-model:value="row[attr.Key]"
                  :tree-data="attr.ddl"
                  :style="{ width: '100%', ...mergeAttrStyle(attr) }"
                  :disabled="mixedReadonly(attr, row)"
                  @change="updateDDLText(row, attr, $event)"
                  allow-clear
                  tree-node-filter-prop="label"
                  :dropdownStyle="ddlStyle"
                  show-search
                  class="ens-select"
                  :tree-line="{ showLeafIcon: false }"
                />
              </template>

              <!-- 文本域 -->
              <template v-else-if="isTextArea(attr)">
                <Textarea
                  v-model:value="row[attr.Key]"
                  :style="mergeAttrStyle(attr)"
                  :disabled="!!mixedReadonly(attr, row)"
                  :rows="4"
                  show-count
                  :maxlength="attr.MaxLength"
                  @blur="inputBlur(row, attr.Key)"
                  class="ens-textarea"
                />
              </template>

              <!-- 文本输入框 -->
              <template v-else-if="isTextBox(attr)">
                <!-- 图标选择器 -->
                <div v-if="attr.Key.toLowerCase() === 'icon'" class="icon-input-wrapper">
                  <div class="icon-preview">
                    <i :class="row[attr.Key] || 'icon-placeholder'"></i>
                  </div>
                  <Button @click="openIconPicker(row)" class="icon-picker-btn">
                    <SearchOutlined />
                  </Button>
                </div>

                <!-- 颜色选择器 -->
                <div v-else-if="attr.Key.toLowerCase().includes('color')" class="color-picker-wrapper">
                  <NColorPicker v-model:value="row[attr.Key]" show-alpha class="ens-color-picker" />
                </div>

                <!-- 自动完成输入框 -->
                <AutoComplete
                  v-else-if="core.isRemoteSearch(attr.Key)"
                  v-model:value="row[attr.Key]"
                  :options="remoteSearchOptions"
                  :disabled="!!mixedReadonly(attr, row)"
                  :style="{ width: attr.UIWidth + 'px', ...core.mixedStyles(attr.Key) }"
                  @blur="() => (remoteSearchOptions = [])"
                  @select="(val, option) => core.handleRemoteSelectCore(row, val, option, attr.Key)"
                  @search="(kw: string) => core.handleRemoteSearch(attr.Key, kw)"
                  class="ens-autocomplete"
                />

                <!-- 普通文本输入 -->
                <Input
                  v-else
                  v-model:value="row[attr.Key]"
                  :style="{ ...mergeAttrStyle(attr), textAlign: 'left' }"
                  :disabled="!!mixedReadonly(attr, row)"
                  @change="inputBlur(row, attr.Key)"
                  @keyup="keyup(attr.MyDataType, row, attr)"
                  class="ens-input"
                />
              </template>

              <!-- 弹出框选择 -->
              <template v-else-if="isPopTextArea(attr)">
                <div class="pop-selector-wrapper">
                  <InputGroup compact :disabled="true" :style="mergeAttrStyle(attr)">
                    <Input style="display: none" v-model:value="row[attr.Key]" @blur="inputBlur(row, attr.Key)" />
                    <div class="pop-display-area" :id="'div_' + attr.Key" :class="{ readonly: mixedReadonly(attr, row) }">
                      <div class="tags-container">
                        <template v-if="!row[attr.Key + 'T']">
                          <Tag v-if="row[attr.Key]" class="ens-tag">{{ row[attr.Key] }}</Tag>
                        </template>
                        <template v-else>
                          <Tag
                            v-for="(ele, p_idx) in getTagByKey(row[attr.Key + 'T'])"
                            :key="ele"
                            :closable="!mixedReadonly(attr, row)"
                            @close="removeTag(attr, ele, p_idx, row)"
                            class="ens-tag"
                          >
                            {{ getTagByKey(row[attr.Key + 'T'])[p_idx] }}
                          </Tag>
                        </template>
                      </div>
                      <Button @click="PopModalShow(attr, row)" :disabled="mixedReadonly(attr, row)" class="pop-trigger-btn">
                        <SettingOutlined />
                      </Button>
                    </div>
                  </InputGroup>
                </div>
              </template>

              <!-- 单选按钮组 -->
              <template v-else-if="isRadioButton(attr)">
                <RadioGroup
                  v-model:value="row[attr.Key]"
                  @change="updateDDLText(row, attr, $event)"
                  :style="mergeAttrStyle(attr)"
                  :disabled="mixedReadonly(attr, row)"
                  class="ens-radio-group"
                >
                  <Radio v-for="option in attr.ddl" :key="option.value" :value="option.value" class="ens-radio">
                    {{ option.label }}
                  </Radio>
                </RadioGroup>
              </template>

              <!-- 附件上传 -->
              <template v-else-if="isSingleAth(attr)">
                <div class="upload-wrapper">
                  <Button @click="openFieldAth(attr, row[entity!.PK], attr.UIIsReadonly || props.readonly)" class="ens-upload-btn">
                    <UploadOutlined />
                    上传/查看
                  </Button>
                </div>
              </template>

              <div v-else class="unknown-component">
                <i class="icon-question"></i>
                <span>未知组件</span>
              </div>
            </div>
          </template>

          <template #summary v-if="hasSummaryColumns">
            <TableSummary fixed>
              <TableSummaryRow class="summary-row">
                <TableSummaryCell :index="0" class="summary-label">合计</TableSummaryCell>
                <TableSummaryCell v-for="(col, index) in tableColumns" :key="col.key" :index="index + 1" class="summary-cell">
                  {{ col.summary }}
                </TableSummaryCell>
              </TableSummaryRow>
            </TableSummary>
          </template>
        </BasicTable>
      </div>

      <!-- 禁用状态遮罩 -->
      <div v-if="disabled" class="disabled-overlay">
        <Alert message="提示" description="此从表需要与主表id关联, 请先保存主表" type="info" class="disabled-alert">
          <template #action>
            <Space direction="vertical">
              <Button size="small" type="primary" @click="$emit('save-main-table')" class="ens-btn"> 保存并使用 </Button>
            </Space>
          </template>
        </Alert>
      </div>
    </div>

    <!-- 各种弹窗保持不变 -->
    <Modal v-model:open="iconPickerVisible" title="选择图标" :bodyStyle="bodyStyle" :footer="null">
      <IconPicker @pick-icon="updateIcon" />
    </Modal>

    <Modal v-model:open="popModal.visible" :title="popModal.title" :body-style="({ padding: '12px' } as any)" :width="popModal.width" :style="popModal.height" @ok="PopModalOK">
      <template #footer>
        <div class="modal-footer">
          <div class="select-info" v-if="popModal.enableSelect">
            已选：<span class="count">{{ popSelectInfo.count }}</span
            >个
          </div>
          <div class="button-group">
            <Button key="back" @click="popModalCancel" class="ens-btn secondary">取消</Button>
            <Button key="submit" type="primary" class="ens-btn primary" @click="PopModalOK">确定</Button>
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

    <drawer v-model:open="rightDrawer.visible" width="70%" :title="rightDrawer.title" @close="editClosed(true)" :body-style="bodyStyle" class="ens-drawer">
      <component
        v-if="rightDrawer.visible"
        :is="rightDrawer.component"
        :params="rightDrawer.params"
        :EnName="rightDrawer.params?.EnName"
        :PKVal="rightDrawer.params?.PKVal"
        @close-self="editClosed(true)"
      />
    </drawer>
  </BaseComponent>
</template>
<script lang="ts" setup>
  import { computed, h, markRaw, nextTick, onMounted, provide, reactive, ref, shallowRef, toRaw } from 'vue';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { NColorPicker } from 'naive-ui';
  import {
    Alert,
    AutoComplete,
    Button,
    DatePicker,
    TimePicker,
    Drawer,
    Input,
    InputGroup,
    InputNumber,
    message,
    Modal,
    Radio,
    RadioGroup,
    Space,
    Switch as AntSwitch,
    TableSummary,
    TableSummaryCell,
    TableSummaryRow,
    Tag,
    Textarea,
    TreeSelect,
    notification,
  } from 'ant-design-vue';
  import { CheckOutlined, CloseOutlined, DragOutlined, SearchOutlined, SettingOutlined, UploadOutlined } from '@ant-design/icons-vue';
  import { Entities } from '/@/bp/en/Entities';
  import { WF_Comm_Dtl } from '/@/DataUser/OverrideFiles/WF_Comm_Dtl';
  import { BasicTable, type Props as TableConfigProps, useTable } from '/@/components/Table';
  import IconPicker from '/@form/components/icon-picker/IconPicker.vue';
  import { FieldType, UIContralType } from '/@/bp/en/EnumLab';
  import { useDDLDataLoader } from '/@/hooks/ens/useDDLDataLoader';
  import { cloneDeep, debounce } from 'lodash-es';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { EnMapExt, EnMapExts } from '/@/bp/en/Map/EnMapExt';
  import useFieldType from '/@/hooks/ens/useFieldType';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { fetchTableData, resetUserRegedit } from '/@/components/Entities/src/searchUtils';
  import webUser from '/@/bp/web/WebUser';
  import { UserRegedit } from '/@/bp/sys/UserRegedit';
  import { Entity } from '/@/bp/en/Entity';
  import { useDtlQueryCondition } from '/@/hooks/ens/useDtlQueryCondition';
  import { useTypeConvert } from '/@/hooks/ens/useDataConvert';
  import Pop from '/@/WF/Comm/subComponents/Pop.vue';
  import { getAtStrValByKey } from '/@/utils/stringUtils';
  import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
  import { useEditTableEvents } from '/@/hooks/editTable/useEditTableEvents';
  import { useEditTableSort } from '/@/hooks/editTable/useEditTableSort';
  import { FrmAttachment } from '../Admin/FrmLogic/FrmAttachment/FrmAttachment';
  import { ClassFactoryOfWaiGuaEntity } from './UIEntity/ClassFactoryOfWaiGuaEntity';
  import { ClassFactoryOfGroupPageNew } from './UIEntity/ClassFactoryOfGroupPageNew';
  import { useEditTableExt } from '/@/hooks/editTable/useEditTableExt';
  import { useRoute } from 'vue-router';
  import DDLSelect from './subComponents/DDLSelect.vue';
  const baseComp = shallowRef<InstanceType<typeof BaseComponent>>();
  const tableColumns = ref<any>([]);
  const route = useRoute();
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
    refTextName: {
      type: String,
      default: 'Name',
    },
    height: {
      type: Number,
      default: window.innerHeight * 0.72,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    dtlKey: {
      type: String,
      default: '',
    },
  });
  // eslint-disable-next-line vue/no-setup-props-destructure
  const { ShowAttrs = '', PKVal, ButsTableTop, IsSummary /*ButsItem*/ } = toRaw(props.params);
  const EnName = (props.params?.EnName ?? route.query?.EnName ?? '') as string;
  const Data = ref<any>([]);

  type DrawerType = {
    visible: boolean;
    component: any;
    title: string;
    params: Recordable;
  };
  const rightDrawer = reactive<DrawerType>({
    visible: false,
    component: {},
    title: '',
    params: {},
  });

  const searchKey = ref('');
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
        `表格附件：` + ath.Name,
      ),
    );
  };

  const editClosed = async (reload = true) => {
    rightDrawer.visible = false;
    if (!reload) return;
    await nextTick();
    await reload_func.value?.();
  };
  const HisUAC = ref<any>({});
  const checklist = ref<any>([]);
  const ens = ref<Entities>();
  const enExt = ref<WaiGuaBaseEntity>();

  const hasSummaryColumns = ref(false);

  const openIconPicker = (row: Recordable) => {
    selectedRow.value = row;
    iconPickerVisible.value = true;
  };
  const getTagByKey = (val: string) => {
    return val.split(',').filter((item) => item !== '');
  };
  const updateIcon = (icon: string) => {
    if (selectedRow.value) {
      selectedRow.value['Icon'] = icon;
    } else {
      message.error('图标未能选中');
    }
    iconPickerVisible.value = false;
    selectedRow.value = undefined;
  };
  const tableConfig = ref<Function>();

  const enArrMethods = computed(() => {
    if (!ens.value) return [];
    return ens.value.enActions;
  });
  const execEnArrMethods = async (btn) => {
    const res = await btn.onClick(PKVal, checklist.value.join(','), {
      ...props.params,
      RefPKVal: props.params.PKVal,
    });
    if (res instanceof GPNReturnObj) {
      baseComp.value?.handleGPNCallback(res);
    }
  };

  const extMethods = computed(() => {
    if (!enExt.value) return [];
    const btnNames = enExt.value.SearchToolbarBtns?.split(',') || [];
    if (btnNames.length == 0) return [];
    return btnNames.map((btn) => {
      return {
        label: btn,
        onClick: () => {
          return enExt.value?.BtnClick?.('SearchOpt', btn, checklist.value, props.params);
        },
      };
    });
  });
  const isExtMethodReadonly = (btn) => {
    if (!enExt.value?.IgnoreReadonlyBtns) return gloReadonly.value;
    const ignoreBtns = enExt.value.IgnoreReadonlyBtns.split(',');
    return !ignoreBtns.includes(btn.label) && gloReadonly.value;
  };
  const execExtMethods = async (btn) => {
    const res = await btn.onClick();
    if (res instanceof GPNReturnObj) {
      baseComp.value?.handleGPNCallback(res);
    }
  };
  //处理查询条件.
  // const route = useRoute();
  const { getQueryArgs } = useDtlQueryCondition();
  // impl control evt
  const evtProps = { mapExts: new EnMapExts(), mapAttrs: [] };
  // let instanceOfEns: Entities | null = null;

  const pagination = reactive({
    total: 0,
    current: 1,
    pageSize: 50,
    pageSizeOptions: ['10', '20', '30', '50', '150'],
  });

  const handleTableChange = async (pInfo) => {
    pagination.current = pInfo.current;
    pagination.pageSize = pInfo.pageSize;
    await batchSave();
    await reload_func.value?.();
    _clear_selected_func.value?.();
  };
  const ur = reactive(new UserRegedit());
  const urMyPK = webUser.No + '_' + EnName + '_SearchAttrs';
  const checkUserRegedit = async () => {
    ur.setPKVal(urMyPK);
    const res = await ur.RetrieveFromDBSources();
    if (res == 0) {
      await resetUserRegedit(ur, urMyPK, webUser.No, EnName);
    }
    const hasIdx = entity.value?._enMap.attrs.find((attr) => attr.Key === 'Idx');
    if (hasIdx) {
      ur.OrderBy = 'Idx';
    }
    if (!hasIdx) {
      const hasPRI = entity.value?._enMap.attrs.find((attr) => attr.Key === 'PRI');
      if (hasPRI) ur.OrderBy = 'PRI';
    }

    // 获取需要排序的列并设置默认排序
    const sortColumnsStr = (props.params['SortColumns'] || '').toString().trim();
    const sortColumnsArray = sortColumnsStr
      ? sortColumnsStr
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => !!s)
      : [];

    // 如果配置了 SortColumns，使用第一个字段作为默认排序字段
    if (sortColumnsArray.length > 0) {
      ur.OrderBy = sortColumnsArray[0];
      ur.OrderWay = 'ASC'; // 默认升序
    }

    ur.Vals = '';
    const queryArgs = getQueryArgs(props.params, {}, entity.value!);
    for (let i = 0; i < queryArgs.length; i += 2) {
      ur.Vals += `@${queryArgs[i]}=${queryArgs[i + 1]}`;
    }
    // const { RefPK, RefPKVal, PKVal } = props.params;
    // ur.Vals = `@${RefPK}=${PKVal || RefPKVal}`;
    const { enable, key } = entity.value!.LogicDelConfig;
    if (enable) {
      ur.Vals += `@${key}=0`;
    }
    await ur.Update();
  };
  // end
  const entity = ref<Entity>();
  const excessHeight = ref(30);
  const isInitSort = ref(false);

  const InitPage = async () => {
    try {
      set_loading_func.value?.(true);
      // 参数验证
      if (!EnName) {
        throw new Error('缺少参数 [ EnName ]');
      }
      // 初始化实体
      tableConfig.value = undefined;
      ens.value = await ClassFactory.GetEns(EnName);
      entity.value = ens.value.GetNewEntity;
      evtProps.mapExts = entity.value._enMap.enMapExts;
      await ens.value.Init();

      const extClassName = ('WGEntity_' + EnName.substring(EnName.lastIndexOf('.') + 1)) as string;
      let extObj = await ClassFactoryOfWaiGuaEntity.GetEn(extClassName);
      if (extObj) enExt.value = extObj;
      // 设置基础配置
      const attrs = entity.value._enMap.attrs;
      HisUAC.value = ens.value.GetNewEntity.HisUAC;
      tableColumns.value = [];
      // 构建列配置
      await buildColumns(attrs);
      // 处理数据
      processEntityData(ens.value, attrs);
      Data.value = ens.value;
      // 设置其他配置
      // evtProps.mapExts = tableColumns.value;
      hasSummaryColumns.value = IsSummary !== '0' && tableColumns.value.some((col) => isNumber(col.params) || isMoney(col.params));
      excessHeight.value = hasSummaryColumns.value ? 100 : 30;
      // 获取顶部按钮
      getTopButtons();
      core.loadMapExts(entity.value._enMap.enMapExts || []);
    } catch (error) {
      message.error(error.toString());
      console.error(error);
    } finally {
      set_loading_func.value?.(false);
    }
  };

  /**
   * 构建表格列配置
   */
  const buildColumns = async (attrs) => {
    const allowSort = props.params.IsMove == 1;
    const hasIdxOrPRI = !!attrs.find((attr) => attr.Key === 'Idx' || attr.Key === 'PRI');
    const { getDDLData } = useDDLDataLoader(entity.value!);
    const columns: Recordable[] = [];
    for (const attr of attrs) {
      // 跳过不需要显示的字段
      if (attr.MyFieldType === FieldType.RefText) continue;
      if (!shouldShowAttribute(attr)) continue;
      //根据字段权限处理显示的字段
      const enMapexts = entity.value?._enMap.enMapExts || [];
      //判断是否有扩展属性
      if (enMapexts.length > 0) {
        const arr = enMapexts.filter((item) => item.AttrOfOper === attr.Key);
        attr['mapExt'] = arr;
      }
      // 构建列配置
      const column = {
        key: attr.Key,
        title: attr.Desc,
        dataIndex: attr.Key,
        params: attr,
        slots: { customRender: attr.Key },
        width: Math.max(attr.UIWidth, 150),
        align: 'center',
        ddl: [],
        readonly: attr.UIIsReadonly,
        ...attr,
      };
      if (attr.Key.toLowerCase() === 'icon') {
        column.width = Math.max(attr.UIWidth, 160);
      }
      if (isPopTextArea(attr)) {
        column.width = Math.max(attr.UIWidth, 260);
      }

      // 处理不同类型的列
      if (needsDDLData(attr)) {
        await processDDLColumn(column, attr, getDDLData);
      }
      columns.push(column);
    }

    if (hasIdxOrPRI && allowSort) {
      tableColumns.value = [
        {
          key: '_sys_move',
          fixed: 'left',
          width: 40,
          align: 'center',
          slots: { customRender: 'sys_move' },
          params: {},
        },
        ...columns,
      ];
    } else {
      tableColumns.value = columns;
    }
    if (!hasIdxOrPRI && allowSort) {
      console.warn('当前表格配置了排序功能，但缺少Idx字段，排序将不会生效');
      return;
    }
    //
    if (hasIdxOrPRI && allowSort) {
      isInitSort.value = true;
    }
  };

  const shouldShowAttribute = (attr) => {
    if (!attr.UIVisible && (ShowAttrs === '' || ShowAttrs.indexOf(attr.Field) === -1)) {
      return false;
    }
    if (ShowAttrs !== '' && ShowAttrs.indexOf(attr.Field) < 0) {
      return false;
    }
    return true;
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
      const newAttr = entity.value?._enMap.attrs.find((oldAttr) => oldAttr.Key === attr.Key + 'T');
      if (newAttr) {
        column.key = newAttr.Key;
        column.dataIndex = newAttr.Key;
        column.params = newAttr;
        column.slots = { customRender: newAttr.Key };
      }
    } else {
      // 加载下拉列表数据
      // 处理只读DDL列
      const hasExtOption = evtProps.mapExts.find((ext) => ext.ExtType === 'DDLSelect' && ext.AttrOfOper == attr.Key);
      if (!hasExtOption) {
        column.ddl = await getDDLData(attr, props.params);
      }
    }
  };

  const keyup = (type, record, col) => {
    if (type == 2 || type == 3 || type == 8) {
      if (isNaN(record[col])) {
        record[col] = 0;
      }
    }
  };
  const handleChange = (selectedIdList) => {
    checklist.value = selectedIdList;
  };

  const actionBtnsRef = ref<Array<Recordable>>([]);
  const getTopButtons = () => {
    const arr = ButsTableTop || [];
    const actionBtns: Array<Recordable> = [];
    if (HisUAC.value.IsInsert) {
      actionBtns.push({
        label: '新增',
        onClick: async () => {
          await batchSave();
          const entity = Data.value?.GetNewEntity;
          const enGPN = await ClassFactoryOfGroupPageNew.GetEnByEntityClassID(entity?.classID || '');
          if (!enGPN) {
            await createRow();
            return;
          }
          rightDrawer.component = markRaw(
            createAsyncComponent(() => import('/@/WF/Comm/UIEntity/GroupPageNew.vue'), {
              loading: true,
            }),
          );
          const subComponentParams = cloneDeep(props.params || {});
          delete subComponentParams['EnName'];
          delete subComponentParams['PKVal'];
          rightDrawer.params = { EnName: enGPN.classID, RefPKVal: PKVal, RefDtlEnName: EnName, ...subComponentParams };
          rightDrawer.title = enGPN.PageTitle || 'GPN-Page-Insert';
          rightDrawer.visible = true;
        },
      });
    }
    if (HisUAC.value.IsUpdate) {
      actionBtns.push({
        label: '保存',
        ghost: true,
        onClick: async () => {
          await batchSave();
        },
      });
    }
    if (HisUAC.value.IsDelete) {
      const TableRowSelection = props.params.TableRowSelection;
      if (!TableRowSelection || TableRowSelection === 'checkbox' || TableRowSelection === 'radio') {
        actionBtns.push({
          label: '删除',
          ghost: true,
          onClick: () => {
            onDeletes();
          },
        });
      }
    }
    if (arr.length !== 0) {
      arr?.split(',').forEach((x) => {
        actionBtns.push({
          label: x,
          onClick: async () => {
            const res = await WF_Comm_Dtl.TableTopBtnClick.bind(x, EnName, PKVal, EnName, checklist.value.join());
            if (res instanceof GPNReturnObj) {
              baseComp.value?.handleGPNCallback(res);
            }
          },
        });
      });
    }
    actionBtnsRef.value = actionBtns;
  };

  const onDeletes = async () => {
    if (checklist.value == null || checklist.value.length == 0) {
      message.info('请选择要删除的数据');
      return;
    }

    Modal.confirm({
      title: () => '提示',
      content: () => '确定删除选择项吗？',
      async onOk() {
        try {
          const len = (get_db_source_func.value?.() || []).length;
          const queue = checklist.value.map(async (item) => {
            const enMyPK = await ClassFactory.GetEn(EnName);
            enMyPK.setPKVal(item);
            await enMyPK.RetrieveFromDBSources();
            return enMyPK.Delete();
          });
          await Promise.all(queue);
          message.success('删除成功');
          await reload_func.value?.();
          //如果当前页面的数据全部被删除，需要显示上一页数据
          if (checklist.value.length === len) {
            const curinfo = { current: pagination.current === 1 ? 1 : pagination.current - 1, pageSize: pagination.pageSize };
            set_pagination_func.value?.(curinfo);
            await handleTableChange(curinfo);
          }
        } catch (e: any) {
          message.error(e.toString());
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onCancel() {},
    });
  };

  const createRow = async () => {
    const { RefPK, PKVal } = props.params;
    const _entity = Data.value?.GetNewEntity;
    for (const col of tableColumns.value) {
      _entity[col.key] = isNumber(col.params) ? 0 : '';
    }
    _entity[RefPK] = PKVal;
    _entity['key'] = Date.now().toString();
    await _entity.Insert();
    //判断当前的页面条数，是否需要换页
    const len = (get_db_source_func.value?.() || []).length;
    if (len + 1 > pagination.pageSize) {
      const curinfo = { current: pagination.current + 1, pageSize: pagination.pageSize };
      set_pagination_func.value?.(curinfo);
      await handleTableChange(curinfo);
      return;
    }
    set_loading_func.value?.(true);
    await reload_func.value?.();
  };
  const batchSave = async () => {
    try {
      await validTable();
      const { booleanToNumber } = useTypeConvert();
      const dataSource = get_db_source_func.value?.() || [];
      if (dataSource.length === 0) {
        return;
      }
      set_loading_func.value?.(true);
      const { RefPK, PKVal } = props.params;
      const attrs = ens.value!.GetNewEntity._enMap.attrs;
      const updateQueue = dataSource.map((dataItem) => {
        const en = ens.value!.GetNewEntity;
        const rowData = booleanToNumber(attrs, dataItem);
        en.Row.LoadObject(rowData);
        en.setPKVal(dataItem[en.PK]);
        en.SetValByKey(RefPK, PKVal);
        return en.Update();
      });
      await Promise.all(updateQueue);
      set_loading_func.value?.(false);
      await reload_func.value?.();
    } catch (e: any) {
      notification.error({
        message: '保存失败',
        description: h(
          'div',
          {
            style: { whiteSpace: 'pre-line' },
          },
          e.message || e.toString(),
        ),
        placement: 'top',
      });
      throw e; // 重新抛出错误以便上层可以捕获
    } finally {
      set_loading_func.value?.(false);
    }
  };

  const reload_func = ref<Function>();
  const set_loading_func = ref<Function>();
  const get_db_source_func = ref<Function>();
  const _clear_selected_func = ref<Function>();
  const set_pagination_func = ref<Function>();
  const loadSubEditTable = async () => {
    if (props.disabled) return;
    set_loading_func.value?.(true);
    try {
      const attrs = entity.value?._enMap.attrs;
      const db_data = await fetchTableData(EnName, pagination.current, pagination.pageSize, ur);
      if (!attrs) {
        return db_data;
      }
      const { numberToBoolean } = useTypeConvert();
      const c_data: Recordable[] = [];
      for (const item of db_data.items) {
        c_data.push(numberToBoolean(attrs, item));
      }
      return {
        items: c_data,
        total: db_data.total,
      };
    } finally {
      set_loading_func.value?.(false);
      setTimeout(() => {
        validTable();
        calcTable();
      }, 100);
    }
  };
  const createTable = async () => {
    await InitPage();
    await checkUserRegedit();
    const rowSelection = props.params.TableRowSelection;
    const config: TableConfigProps = {
      title: '',
      api: loadSubEditTable,
      rowKey: entity.value?.PK,
      canResize: true,
      rowSelection: {
        type: 'checkbox',
        onChange: handleChange,
      },
      onChange: handleTableChange,
      columns: tableColumns,
      clickToRowSelect: false,
      bordered: true,
      resizeHeightOffset: excessHeight,
      pagination: {
        pageSizeOptions: ['10', '20', '30', '50', '150'],
        pageSize: 50, // 设置默认显示50条
      },
      useSearchForm: false,
      showIndexColumn: false,
      showTableSetting: false,
      formConfig: {
        labelWidth: 120,
        autoSubmitOnEnter: false,
        showResetButton: false,
        showSubmitButton: false,
        showActionButtonGroup: true,
      },
    };
    if (rowSelection == 'radio') {
      config.rowSelection = {
        type: 'radio',
        onChange: handleChange,
      };
    }
    if (rowSelection == 'none' || props.readonly) {
      config.rowSelection = undefined;
    }
    const [registerTable, { reload, setLoading, getDataSource, clearSelectedRowKeys, setPagination }] = useTable(config);
    tableConfig.value = registerTable;
    if (isInitSort.value) await initSortable();
    reload_func.value = reload;
    set_loading_func.value = setLoading;
    searchKey.value = ur.SearchKey;
    get_db_source_func.value = getDataSource;
    _clear_selected_func.value = clearSelectedRowKeys;
    set_pagination_func.value = setPagination;
  };

  const btn_style = (btn: string) => {
    let className = '';
    if (btn.includes('新增') || btn.includes('新建')) {
      className = 'btn_add ';
    }
    if (btn.includes('保存')) {
      className = 'btn_save ';
    }
    if (btn.includes('删除')) {
      className = 'btn_del ';
    }
    if (gloReadonly.value) {
      className += 'disabled';
    }
    return className;
  };

  // styles
  const bodyStyle = computed(() => {
    return {
      '--padding': '0px 12px !important',
      'border-top': '1px solid #EAEDF6',
    };
  });

  const getBtnIcon = (label: string) => {
    const iconMap = {
      新增: 'icon-plus',
      保存: 'icon-doc',
      删除: 'icon-trash',
      编辑: 'icon-edit',
      查看: 'icon-eye',
      导出: 'icon-download',
      导入: 'icon-upload',
      刷新: 'icon-refresh',
      搜索: 'icon-search',
      重置: 'icon-reset',
    };
    return iconMap[label] || 'icon-default';
  };
  //搜索
  const Search = debounce(async () => {
    ur.SearchKey = searchKey.value;
    await ur.Update();
    await reload_func.value?.();
  }, 300);
  // 实现弹窗选择回显
  const popSelectInfo = reactive({
    count: 0,
    updateCount: (val) => {
      popSelectInfo.count = val;
    },
  });
  provide('updateCount', popSelectInfo.updateCount);
  // end
  const componentKey = ref(0);
  const labelClass = ref(['label']);
  if (import.meta.env.VITE_ENTITY_LABEL_ALIGN == 'right') {
    labelClass.value.push('label-right');
  }
  const iconPickerVisible = ref(false);
  const ddlStyle = ref({ overflow: 'auto' });
  const refPop = shallowRef<InstanceType<typeof Pop>>();
  const { isFloat, isInt, isDateTime, isDate, isDDL, isNumber, isBoolean, isMoney, isTextBox, isTextArea, isPopTextArea, isRadioButton, isSingleAth, isRichText } = useFieldType();
  const {
    popModal,
    PopModalShow,
    PopModalOK,
    popModalCancel,
    mixedReadonly,
    mergeAttrStyle,
    removeTag,
    isValidFailed,
    inputBlur,
    validTable,
    calcTable,
    selectedRow,
    processEntityData,
    updateDDLText,
    remoteSearchOptions,
    core,
    gloReadonly,
  } = useEditTableExt(props, entity, tableColumns, refPop, get_db_source_func); // 扩展hook
  useEditTableEvents(props, tableColumns, reload_func); // 事件hook
  const dtlBatchRef = shallowRef<HTMLElement>();
  const { initSortable } = useEditTableSort(props, dtlBatchRef, reload_func); // 排序hook
  const editTableEvents = computed(() => entity.value?._enMap.enMapExts.find((ext) => ext.ExtType === 'EditTableEvent')?.Event);

  onMounted(async () => {
    await createTable();
    if (editTableEvents.value?.init) {
      editTableEvents.value.init(get_db_source_func.value?.() || []);
    }
  });
  defineEmits(['save-main-table']);
  defineExpose({
    Save: batchSave,
    checkedList: computed(() => {
      if (editTableEvents.value?.handleReturnKeys) {
        return editTableEvents.value.handleReturnKeys(get_db_source_func.value?.() || []);
      }
      const dataSource = get_db_source_func.value?.() || [];
      if (dataSource.length === 0) return [];
      if (popModal.mapExt?.Tag6 == 'ReturnChecked') {
        return checklist.value;
      }
      return dataSource.map((row) => row[entity.value!.PK]);
    }),
    checkedNames: computed(() => {
      if (editTableEvents.value?.handleReturnVals) {
        return editTableEvents.value.handleReturnVals(get_db_source_func.value?.() || []);
      }
      const dataSource = get_db_source_func.value?.() || [];
      if (dataSource.length === 0) return [];
      if (popModal.mapExt?.Tag6 == 'ReturnChecked') {
        return dataSource.filter((row) => checklist.value.includes(row[entity.value!.PK])).map((row) => row[props.refTextName]);
      }
      return dataSource.map((row) => row[props.refTextName]);
    }),
  });
</script>
<style lang="less" scoped>
  // 主容器样式
  .ens-wrapper {
    position: relative;
    background: #fafbfc;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    overflow: hidden;

    // 禁用遮罩
    .disabled-overlay {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(2px);
      z-index: 999;

      .disabled-alert {
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }
    }
  }

  // 表格工具栏
  .table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: linear-gradient(90deg, #f0f8ff 0%, #f5f5f5 100%);
    border: 1px solid #d6e4ff;

    .toolbar-left {
      .table-title {
        margin: 0;
        font-size: 16px;
        color: #1c4d73;
        font-weight: 500;
        text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
        display: flex;
        align-items: center;
        gap: 8px;

        i {
          font-size: 20px;
        }
      }
    }
    .toolbar-search {
      margin-left: 10px;
      margin-right: auto;
    }

    .toolbar-right {
      display: flex;
      gap: 12px;
    }
  }

  .ens-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    &:disabled {
      color: rgba(255, 255, 255, 0.4) !important;
    }

    &.btn_add {
      background: linear-gradient(135deg, #52c41a, #73d13d);
      border: none;
      color: white;

      &:hover {
        background: linear-gradient(135deg, #73d13d, #95de64);
      }
    }

    &.btn_save {
      background: linear-gradient(135deg, #1890ff, #40a9ff);
      border: none;
      color: white;

      &:hover {
        background: linear-gradient(135deg, #40a9ff, #69c0ff);
      }
    }

    &.btn_del {
      background: linear-gradient(135deg, #ff4d4f, #ff7875);
      border: none;
      color: white;

      &:hover {
        background: linear-gradient(135deg, #ff7875, #ffa39e);
      }
    }

    &.ext-btn {
      background: linear-gradient(135deg, #722ed1, #9254de);
      border: none;
      color: white;

      &:hover {
        background: linear-gradient(135deg, #9254de, #b37feb);
      }
    }

    &.secondary {
      background: #f6f8fa;
      color: #656d76;
      border: 1px solid #d1d9e0;

      &:hover {
        background: #f3f4f6;
        border-color: #b1bac4;
      }
    }

    &.primary {
      background: linear-gradient(135deg, #1890ff, #40a9ff);
      border: none;
      color: white;
    }
  }

  // 表格容器
  .table-container {
    background: white;
    border-radius: 0 0 12px 12px;
  }

  .ens-table {
    :deep(td.ant-table-cell) {
      padding: 2px 6px !important;
    }
    :deep(.ant-pagination) {
      padding-right: 12px;
    }

    :deep(.ant-table-wrapper) {
      padding: 0 0 12px 0 !important;
    }
    :deep(.ant-table) {
      border-radius: 0;
    }

    :deep(.ant-table-thead > tr > th) {
      background: linear-gradient(135deg, #f8fafc, #f1f5f9);
      border-bottom: 2px solid #e2e8f0;
      color: #475569;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 16px 12px;

      &:first-child {
        border-top-left-radius: 0;
      }

      &:last-child {
        border-top-right-radius: 0;
      }
    }

    :deep(.ant-table-tbody > tr) {
      transition: all 0.2s ease;

      &:hover {
        background: #f8fafc;
        transform: scale(1.001);
      }

      > td {
        padding: 0;
        border-bottom: 1px solid #f1f5f9;

        &:first-child {
          border-left: 3px solid transparent;
        }
      }

      &:hover > td:first-child {
        border-left-color: #3b82f6;
      }
    }
  }

  // 拖拽相关样式
  .drag-header {
    text-align: center;
    color: #94a3b8;
    font-size: 16px;
  }

  .drag-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    cursor: move;

    .drag-icon {
      color: #94a3b8;
      font-size: 16px;
      transition: color 0.2s;

      &:hover {
        color: #3b82f6;
      }
    }
  }

  // 单元格包装器
  .cell-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    padding: 0 !important;
    width: 100%;

    &.cell-error {
      background: linear-gradient(90deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
      border-left: 3px solid #ef4444;
      animation: shake 0.5s ease-in-out;
    }
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-2px);
    }
    75% {
      transform: translateX(2px);
    }
  }

  .ens-date-picker,
  .ens-datetime-picker,
  .ens-time-picker {
    :deep(.ant-input),
    :deep(.ant-picker-input > input) {
      border: none;
      background-color: unset;
    }
  }

  // 各种输入组件的现代化样式
  .ens-input,
  .ens-number-input,
  .ens-select,
  .ens-autocomplete {
    :deep(.ant-input),
    :deep(.ant-input-number-input),
    :deep(.ant-picker-input > input),
    :deep(.ant-select-selector) {
      border: 1px solid #d1d5db;
      border-radius: 6px;
      transition: all 0.2s ease;
      background: white;

      &:hover {
        border-color: #9ca3af;
      }

      &:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }
  }

  .ens-textarea {
    :deep(.ant-input) {
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 12px;
      transition: all 0.2s ease;
      resize: vertical;

      &:hover {
        border-color: #9ca3af;
      }

      &:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }
  }

  .ens-switch {
    :deep(.ant-switch) {
      background: #d1d5db;

      &.ant-switch-checked {
        background: #3b82f6;
      }
    }
  }

  // 特殊组件样式
  .switch-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .rich-text-placeholder {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6b7280;
    font-style: italic;
    padding: 12px;
    background: #f9fafb;
    border-radius: 6px;
    border: 1px dashed #d1d5db;
  }

  .money-input-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    position: relative;

    .currency-symbol {
      position: absolute;
      left: 12px;
      color: #6b7280;
      font-weight: 500;
      z-index: 1;
    }

    .ens-money-input {
      width: 100%;

      :deep(.ant-input-number-input) {
        padding-left: 28px;
      }
    }
  }

  .icon-input-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    overflow: hidden;

    .icon-preview {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 36px;
      background: #f9fafb;
      border-right: 1px solid #d1d5db;

      i {
        font-size: 16px;
        color: #374151;

        &.icon-placeholder::before {
          content: '?';
        }
      }
    }

    .icon-picker-btn {
      border: none;
      border-radius: 0;
      height: 36px;
      background: white;

      &:hover {
        background: #f3f4f6;
      }
    }
  }

  .color-picker-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    width: 100%;
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

  .ens-tag {
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

  .ens-radio-group {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;

    .ens-radio {
      :deep(.ant-radio-wrapper) {
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        transition: all 0.2s ease;

        &:hover {
          border-color: #3b82f6;
          background: #f0f9ff;
        }
      }

      :deep(.ant-radio-checked .ant-radio-wrapper) {
        border-color: #3b82f6;
        background: #eff6ff;
      }
    }
  }

  .upload-wrapper {
    width: 100%;

    .ens-upload-btn {
      width: 100%;
      border: 1px dashed #d1d5db;
      background: #fafbfc;
      color: #374151;
      border-radius: 6px;
      transition: all 0.2s ease;

      &:hover {
        border-color: #3b82f6;
        background: #f0f9ff;
        color: #3b82f6;
      }
    }
  }

  .unknown-component {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #ef4444;
    font-style: italic;
    padding: 12px;
    background: #fef2f2;
    border: 1px dashed #fca5a5;
    border-radius: 6px;

    i::before {
      content: '?';
      font-style: normal;
      font-weight: bold;
    }
  }

  // 合计行样式
  .summary-row {
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
    font-weight: 600;

    .summary-label {
      color: #475569;
      font-size: 14px;
    }

    .summary-cell {
      color: #1e293b;
      font-size: 14px;
      text-align: center;
    }
  }

  // 弹窗样式
  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;

    .select-info {
      color: #6b7280;
      font-size: 14px;
      flex: 1;
      text-align: left;

      .count {
        color: #3b82f6;
        font-weight: 600;
      }
    }
    .button-group {
      display: flex;
      gap: 12px;
      flex: 1;
      align-items: center;
      justify-content: flex-end;
    }
  }

  // 抽屉样式
  .ens-drawer {
    :deep(.ant-drawer-header) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-bottom: none;

      .ant-drawer-title {
        color: white;
        font-weight: 600;
      }

      .ant-drawer-close {
        color: white;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }

    :deep(.ant-drawer-body) {
      padding: 24px;
      background: #fafbfc;
    }
  }

  // 工具函数样式类
  .text-center {
    text-align: center;
  }
  .text-right {
    text-align: right;
  }
  .text-left {
    text-align: left;
  }

  .font-mono {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }

  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  // 动画效果
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  .fade-in-up {
    animation: fadeInUp 0.3s ease-out;
  }

  .pulse {
    animation: pulse 2s infinite;
  }
</style>
