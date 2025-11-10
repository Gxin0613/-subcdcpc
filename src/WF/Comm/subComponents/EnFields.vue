<template>
  <div style="margin-top: 20px" class="en-fields">
    <div class="grid-container">
      <div
        v-for="attr in mapAttrs.filter((attr) => !isHidden(attr))"
        :style="({
          display: 'grid',
          'grid-column': attr.UIIsLine || isTextArea(attr) ? 'span 2' : '',
          'grid-template-columns': getTC(attr),
        } as StyleValue)"
        class="field-item"
        :key="attr.Key"
      >
        <!--富文本-->
        <template v-if="isRichText(attr)">
          <div style="margin-bottom: 12px; font-weight: bold">
            <FieldTitle :required="isRequired(attr, validator)" :row-data="row" :field-title="attr.Desc" :field-link="getTitleLink(attr.Key)" />
          </div>
          <Tinymce :value="row[attr.Key]" @change="(content) => (row[attr.Key] = content)" :style="mergeAttrStyle(attr)" :showImageUpload="false" :height="600" />
          <Helper v-if="attr.HelperUrl" :help-docs="attr.HelperUrl" />
        </template>
        <!--boolean值-->
        <template v-else-if="isBoolean(attr)">
          <div class="switch-col">
            <AntSwitch v-model:checked="row[attr.Key]" @change="handleBooleanEvent(row, attr)" :disabled="mixedReadonly(attr)" :style="mergeAttrStyle(attr)">
              <template #checkedChildren><check-outlined /></template>
              <template #unCheckedChildren><close-outlined /></template>
            </AntSwitch>
            <span style="margin-left: 12px">
              <FieldTitle :required="isRequired(attr, validator)" :row-data="row" :field-title="attr.Desc" :field-link="getTitleLink(attr.Key)" />
            </span>
            <Helper v-if="attr.HelperUrl" :help-docs="attr.HelperUrl" />
          </div>
        </template>
        <!--日期类型-->
        <template v-else-if="isDate(attr)">
          <div :class="labelClass">
            <FieldTitle :required="isRequired(attr, validator)" :row-data="row" :field-title="attr.Desc" :field-link="getTitleLink(attr.Key)" />
            <Helper v-if="attr.HelperUrl" :help-docs="attr.HelperUrl" />
          </div>
          <DatePicker
            style="width: 100%"
            v-model:value="row[attr.Key]"
            :style="mergeAttrStyle(attr)"
            :picker="attr.DateConfig!.type"
            :format="attr.DateConfig!.format"
            :value-format="attr.DateConfig!.format"
            :disabled-date="(current) => !!getDisabledDate(attr.Key)?.(current)"
            :disabled="mixedReadonly(attr)"
            @change="onContentChange(attr)"
          />
        </template>
        <!--日期时间类型-->
        <template v-else-if="isDateTime(attr)">
          <div :class="labelClass">
            <FieldTitle :required="isRequired(attr, validator)" :row-data="row" :field-title="attr.Desc" :field-link="getTitleLink(attr.Key)" />
            <Helper v-if="attr.HelperUrl" :help-docs="attr.HelperUrl" />
          </div>
          <TimePicker
            v-if="attr.DateTimeConfig!.type === 'time' "
            style="width: 100%"
            v-model:value="row[attr.Key]"
            :style="mergeAttrStyle(attr)"
            :show-time="attr.DateTimeConfig!.showTime"
            :format="attr.DateTimeConfig!.format"
            :value-format="attr.DateTimeConfig!.format"
            :disabled="mixedReadonly(attr)"
            @change="onContentChange(attr)"
          />
          <DatePicker
            v-else
            style="width: 100%"
            v-model:value="row[attr.Key]"
            :style="mergeAttrStyle(attr)"
            :show-time="attr.DateTimeConfig!.showTime"
            :format="attr.DateTimeConfig!.format"
            :value-format="attr.DateTimeConfig!.format"
            :disabled="mixedReadonly(attr)"
            @change="onContentChange(attr)"
          />
        </template>
        <!-- 金额类型 -->
        <template v-else-if="isMoney(attr)">
          <div :class="labelClass">
            <FieldTitle :required="isRequired(attr, validator)" :row-data="row" :field-title="attr.Desc" :field-link="getTitleLink(attr.Key)" />
            <Helper v-if="attr.HelperUrl" :help-docs="attr.HelperUrl" />
          </div>
          <InputNumber
            v-model:value="row[attr.Key]"
            :style="mergeAttrStyle(attr)"
            :disabled="mixedReadonly(attr)"
            style="width: 100%; text-align: right"
            :precision="attr.Precision"
            @change="onContentChange(attr)"
          />
        </template>
        <template v-else-if="isInt(attr)">
          <div :class="labelClass">
            <FieldTitle :required="isRequired(attr, validator)" :row-data="row" :field-title="attr.Desc" :field-link="getTitleLink(attr.Key)" />
            <Helper v-if="attr.HelperUrl" :help-docs="attr.HelperUrl" />
          </div>
          <InputNumber v-model:value="row[attr.Key]" :style="mergeAttrStyle(attr)" :disabled="mixedReadonly(attr)" style="text-align: right" @change="onContentChange(attr)" />
        </template>
        <!--浮点类型-->
        <template v-else-if="isFloat(attr)">
          <div :class="labelClass">
            <FieldTitle :required="isRequired(attr, validator)" :row-data="row" :field-title="attr.Desc" :field-link="getTitleLink(attr.Key)" />
            <Helper v-if="attr.HelperUrl" :help-docs="attr.HelperUrl" />
          </div>
          <InputNumber
            v-model:value="row[attr.Key]"
            :style="mergeAttrStyle(attr)"
            :disabled="mixedReadonly(attr)"
            style="text-align: right"
            :precision="attr.Precision"
            @change="onContentChange(attr)"
          />
        </template>
        <!-- DDL -->
        <template v-else-if="isDDL(attr)">
          <div :class="labelClass">
            <FieldTitle :required="isRequired(attr, validator)" :row-data="row" :field-title="attr.Desc" :field-link="getTitleLink(attr.Key)" />
            <Helper v-if="attr.HelperUrl" :help-docs="attr.HelperUrl" />
          </div>
          <DDLSelect
            v-if="isDDLSelect(attr.Key)"
            v-model="row[attr.Key]"
            v-model:name-value="row[attr.Key + 'T']"
            :en-class-id="attr.BindEntityID"
            :ref-key="attr.UIRefKeyValue || 'No'"
            :ref-text="attr.UIRefKeyText || 'Name'"
            :map-exts="props.mapExts.filter((ext) => ext.AttrOfOper == attr.Key)"
            :disabled="mixedReadonly(attr)"
          />
          <TreeSelect
            v-else
            v-model:value="row[attr.Key]"
            :tree-data="attr.ddl"
            :style="{ width: attr.UIWidth + 'px', ...mergeAttrStyle(attr) }"
            :disabled="mixedReadonly(attr)"
            @change="updateDDLText(attr, $event)"
            allow-clear
            tree-node-filter-prop="label"
            :dropdownStyle="ddlStyle"
            show-search
          />
        </template>
        <!--文本域-->
        <template v-else-if="isTextArea(attr)">
          <div :class="labelClass">
            <FieldTitle :required="isRequired(attr, validator)" :row-data="row" :field-title="attr.Desc" :field-link="getTitleLink(attr.Key)" />
            <Helper v-if="attr.HelperUrl" :help-docs="attr.HelperUrl" />
          </div>
          <Textarea
            v-model:value="row[attr.Key]"
            :style="mergeAttrStyle(attr)"
            style="width: 100%; padding-bottom: 24px"
            :disabled="!!mixedReadonly(attr)"
            :rows="4"
            show-count
            :maxlength="attr.MaxLength"
            @change="onContentChange(attr)"
          />
        </template>
        <!--文本框整行-->
        <template v-else-if="isTextBox(attr)">
          <div :class="labelClass">
            <FieldTitle :required="isRequired(attr, validator)" :row-data="row" :field-title="attr.Desc" :field-link="getTitleLink(attr.Key)" />
            <Helper v-if="attr.HelperUrl" :help-docs="attr.HelperUrl" />
          </div>

          <div v-if="attr.Key.toLowerCase() === 'icon'" class="icon-wrapper">
            <div class="icon">
              <i :class="row[attr.Key]"></i>
            </div>
            <Input :style="mergeAttrStyle(attr)" class="icon-cont" v-model:value="row[attr.Key]" :disabled="!!mixedReadonly(attr)" />
            <Button @click="openIconPicker(attr.Key)" type="primary">
              <template #icon>
                <SearchOutlined />
              </template>
              选择图标
            </Button>
          </div>
          <AutoComplete
            v-else-if="isRemoteSearch(attr.Key)"
            v-model:value="row[attr.Key]"
            :options="remoteSearchOptions"
            :disabled="!!mixedReadonly(attr)"
            :style="{ width: attr.UIWidth + 'px', ...mixedStyles(attr.Key) }"
            @change="() => (remoteSearchOptions = [])"
            @select="(val, option) => handleRemoteSelect(val, option, attr.Key)"
            @search="(kw: string) => handleRemoteSearch(attr.Key, kw)"
          />
          <!-- 日历组件的标签颜色 -->
          <div v-else-if="attr.Key.toLowerCase() === 'labcolor'" class="icon-cell">
            <NColorPicker v-model:value="row[attr.Key]" show-alpha />
          </div>
          <Input v-else v-model:value="row[attr.Key]" :style="mergeAttrStyle(attr)" :disabled="!!mixedReadonly(attr)" @change="onContentChange(attr)" />
        </template>
        <!--pop弹出框-->
        <template v-else-if="isPopTextArea(attr)">
          <div :class="labelClass">
            <FieldTitle :required="isRequired(attr, validator)" :row-data="row" :field-title="attr.Desc" :field-link="getTitleLink(attr.Key)" />
            <Helper v-if="attr.HelperUrl" :help-docs="attr.HelperUrl" />
          </div>
          <InputGroup compact :disabled="true" :style="mergeAttrStyle(attr)">
            <Input style="display: none" v-model:value="row[attr.Key]" @change="onContentChange(attr)" />
            <div
              class="pop_intput_div"
              :id="'div_' + attr.Key"
              :style="{
                backgroundColor: mixedReadonly(attr) ? '#f2f5f7' : 'white',
              }"
              style="padding-left: 5px"
            >
              <template v-if="!row[attr.Key + 'T']">
                <Tag v-if="row[attr.Key]">{{ row[attr.Key] }}</Tag>
              </template>
              <template v-else>
                <Tag v-for="(ele, p_idx) in getTagByKey(row[attr.Key + 'T'])" :key="ele" :closable="!mixedReadonly(attr)" @close="removeTag(attr, p_idx, mapAttrs)">
                  {{ getTagByKey(row[attr.Key + 'T'])[p_idx] }}
                </Tag>
              </template>
            </div>
            <Button v-if="mixedReadonly(attr)" type="dashed" disabled>
              <SettingOutlined />
            </Button>
            <Button v-else @click="PopModalShow(attr)" style="height: 100%; position: absolute">
              <SettingOutlined />
            </Button>
          </InputGroup>
        </template>
        <!--枚举单选按钮-->
        <template v-else-if="isRadioButton(attr)">
          <div :class="labelClass">
            <FieldTitle :required="isRequired(attr, validator)" :row-data="row" :field-title="attr.Desc" :field-link="getTitleLink(attr.Key)" />
            <Helper v-if="attr.HelperUrl" :help-docs="attr.HelperUrl" />
          </div>
          <RadioGroup
            v-model:value="row[attr.Key]"
            @change="updateDDLText(attr, $event)"
            :style="mergeAttrStyle(attr)"
            :disabled="mixedReadonly(attr)"
            style="display: flex; flex-direction: row"
          >
            <Radio v-for="option in attr.ddl" :key="option.value" :value="option.value"> {{ option.label }}</Radio>
          </RadioGroup>
        </template>

        <!-- 复选框 -->
        <template v-else-if="isCheckbox(attr)">
          <div :class="labelClass">
            <FieldTitle :required="isRequired(attr, validator)" :row-data="row" :field-title="attr.Desc" :field-link="getTitleLink(attr.Key)" />
            <Helper v-if="attr.HelperUrl" :help-docs="attr.HelperUrl" />
          </div>
          <div :style="mergeAttrStyle(attr)" style="padding: 8px; border-radius: 4px; background: #fff; min-height: 32px">
            <Checkbox
              v-for="option in attr.ddl"
              :key="option.value"
              :value="option.value"
              :checked="row[attr.Key] ? row[attr.Key].split(',').includes(option.value.toString()) : false"
              :disabled="mixedReadonly(attr)"
              @change="
                (e) => {
                  const values = row[attr.Key] ? row[attr.Key].split(',') : [];
                  if (e.target.checked) {
                    values.push(option.value.toString());
                  } else {
                    const index = values.indexOf(option.value.toString());
                    if (index > -1) {
                      values.splice(index, 1);
                    }
                  }
                  row[attr.Key] = values.join(',');
                  row[attr.Key + 'T'] = attr.ddl
                    .filter((ddl) => values.includes(ddl.value.toString()))
                    .map((ddl) => ddl.label)
                    .join(',');
                  handleFieldChangeListeners(attr.Key);
                  onContentChange(attr);
                }
              "
              style="margin-right: 8px"
            >
              {{ option.label }}
            </Checkbox>
          </div>
        </template>
        <!-- Link -->
        <template v-else-if="isLink(attr)">
          <div :class="labelClass">
            <FieldTitle :required="isRequired(attr, validator)" :icon="attr.UITag || ''" :row-data="row" :field-title="attr.Desc" :field-link="getTitleLink(attr.Key)" />
            <Helper v-if="attr.HelperUrl" :help-docs="attr.HelperUrl" />
          </div>
        </template>
        <!--单附件-->
        <template v-else-if="isSingleAth(attr)">
          <div :class="labelClass">
            <FieldTitle :required="isRequired(attr, validator)" :row-data="row" :field-title="attr.Desc" :field-link="getTitleLink(attr.Key)" />
            <Helper v-if="attr.HelperUrl" :help-docs="attr.HelperUrl" />
          </div>
          <div class="ant-upload-wrapper">
            <Button @click="emit('open-field-ath', attr, athPKVal, mixedReadonly(attr))">
              <upload-outlined />
              上传 / 查看
            </Button>
            <div v-if="getFieldAthList(attr.Key).length == 1" class="ant-upload-list">
              <div class="ant-upload-list-item" style="display: inline-block">
                <span class="ant-upload-list-item-name">{{ getFieldAthList(attr.Key)[0].FileName }}</span>
              </div>
            </div>
            <template v-else-if="getFieldAthList(attr.Key).length > 1">
              <div class="ant-upload-list"> 共( {{ getFieldAthList(attr.Key).length }} )个文件 </div>
            </template>
          </div>
        </template>

        <template v-if="attr.validateErr">
          <div class="holder"></div>
          <div style="padding-left: 6px; color: #ff5555">{{ attr.validateErr }}</div>
        </template>
      </div>
    </div>

    <Modal v-model:open="iconPickerVisible" title="选择图标" :bodyStyle="bodyStyle" :footer="null">
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
            <div v-if="popModal.mapExt?.Tag6 !== '0' && popModal.mapExt?.Tag5 != '0' && popModal.modalType === 'PopTree'" class="up_level">
              <Button type="primary" class="btnStyle" style="margin: 5px" @click="UpperLevel">上一级</Button>
            </div>
            <Button key="back" @click="handleCancel">取消</Button>
            <Button key="submit" type="primary" class="btnStyle" @click="PopModalOK">确定</Button>
          </div>
        </div>
      </template>
      <Pop
        v-if="popModal.visible === true"
        :popHeight="popModal.height"
        :selectVal="row[popModal.keyOfEn]"
        :selectNameVal="row[popModal.keyOfEn + 'T']"
        :mapExt="(popModal.mapExt as EnMapExt)"
        :rowData="row"
        :key="componetKey"
        :entity-ref="entityRef"
        ref="refPop"
      />
    </Modal>
  </div>
</template>
<script lang="ts" setup>
  import { Attr } from '/@/bp/en/Map/Attr';
  import { reactive, PropType, ref, shallowRef, toRefs, provide, computed, StyleValue, onMounted, onUnmounted } from 'vue';
  import { NColorPicker } from 'naive-ui';
  import Helper from './helper.vue';
  import {
    TreeSelect,
    Switch as AntSwitch,
    Modal,
    InputGroup,
    Input,
    Textarea,
    Button,
    DatePicker,
    RadioGroup,
    Radio,
    InputNumber,
    message,
    Tag,
    UploadFile,
    AutoComplete,
    TimePicker,
    Checkbox,
  } from 'ant-design-vue';
  import { SearchOutlined, CheckOutlined, CloseOutlined, SettingOutlined, UploadOutlined, getTwoToneColor } from '@ant-design/icons-vue';
  import useFieldType from '/@/hooks/ens/useFieldType';
  import IconPicker from '/@form/components/icon-picker/IconPicker.vue';
  import Pop from '/@/WF/Comm/subComponents/Pop.vue';
  import FieldTitle from './FieldTitle.vue';
  import { useFieldStatus } from '/@/hooks/ens/useFieldStatus';
  import { Tinymce } from '/@/components/Tinymce';
  import { EnMapExt } from '/@/bp/en/Map/EnMapExt';
  import useMapExtHandler from '/@/hooks/ens/useMapExtHandler';
  import { useForm } from 'ant-design-vue/es/form';
  import Events from '/@/utils/Events';
  import { Entity } from '/@/bp/en/Entity';
  import { cloneDeep } from 'lodash';
  import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
  import { ExtendedRules } from '/@/bp/en/Map/AttrRule';
  import DDLSelect from './DDLSelect.vue';
  interface DDL {
    label: string;
    value: string | number;
  }
  type CustomAttr = Attr & {
    Tag: string[];
    ddl: DDL[];
    validateErr: string;
    errStyle: any;
  };

  const props = defineProps({
    mapAttrs: {
      type: Object as PropType<CustomAttr[]>,
      default: () => {
        return [];
      },
    },
    allMapAttrs: {
      type: Object,
      default: () => {
        return [];
      },
    },
    pk: {
      type: String,
      default: '',
    },
    pkVal: {
      type: [String, Number],
      default: '',
    },
    athPKVal: {
      type: [String, Number],
      default: '',
    },
    savedState: {
      type: Boolean,
      default: false,
    },
    rowData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    mapExts: {
      type: Array<EnMapExt>,
      default: () => {
        return [];
      },
    },
    isReadonly: {
      type: Boolean,
      default: false,
    },
    validator: {
      type: Object as PropType<ExtendedRules>,
      default: () => {
        return undefined;
      },
    },
    aths: {
      type: Array<any>,
      default: () => {
        return [];
      },
    },
    enName: {
      type: String,
      default: '',
    },
    entityRef: {
      type: Object as PropType<Nullable<Entity>>,
      default: () => null,
    },
    entityWg: {
      type: Object as PropType<WaiGuaBaseEntity>,
      default: () => null,
    },
  });

  const getTC = (attr: any) => {
    let tc = 'minmax(120px,1fr) 2fr';
    if (isLink(attr)) return tc;
    if (attr.UIIsLine || isTextArea(attr)) {
      tc = 'minmax(120px,1fr) 5fr';
    }
    return tc;
  };

  const getMapAttrs = ref(props.mapAttrs);
  const originAttrs = cloneDeep(props.mapAttrs);

  const getFieldAthList = (attrKey: string) => {
    return props.aths.filter((ath) => ath.NoOfObj == attrKey);
  };

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
  provide('updateCount', popSelectInfo.updateCount);
  // end
  const row = ref(props.rowData);
  const componetKey = ref(0);

  const labelClass = ref(['label']);
  if (import.meta.env.VITE_ENTITY_LABEL_ALIGN == 'right') {
    labelClass.value.push('label-right');
  }

  const selectedKey = ref('');
  const iconPickerVisible = ref(false);
  const openIconPicker = (attrKey: string) => {
    selectedKey.value = attrKey;
    iconPickerVisible.value = true;
  };

  const ddlStyle = ref({ overflow: 'auto' });
  const updateIcon = (icon: string) => {
    if (selectedKey.value) {
      row.value[selectedKey.value] = icon;
    } else {
      message.error('图标未能选中，字段[' + selectedKey.value + '] 不存在');
    }
    iconPickerVisible.value = false;
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
  const getTagByKey = (val: string) => {
    return val.split(',').filter((item) => item !== '');
  };
  let _temp_attr = null;
  const PopModalShow = (attr) => {
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
    componetKey.value++;
    _temp_attr = attr;
  };
  const refPop = shallowRef<InstanceType<typeof Pop>>();
  const PopModalOK = async () => {
    const checkedInfo = (await refPop.value!.handlerPopOK()) as [string[], string[]];
    if (checkedInfo[0].length === 0) {
      row.value[popModal.keyOfEn] = '';
      row.value[popModal.keyOfEn + 'T'] = '';
    } else {
      row.value[popModal.keyOfEn] = checkedInfo?.[0].join(',');
      row.value[popModal.keyOfEn + 'T'] = checkedInfo?.[1].join(',');
    }
    props.mapAttrs.forEach((item) => {
      if (item.Key == popModal.keyOfEn) item['Tag'] = !row.value[popModal.keyOfEn] ? [] : row.value[popModal.keyOfEn].split(',');
    });
    popModal.visible = false;
    await handleAutoFillEvents(popModal.keyOfEn, checkedInfo?.[0]?.[0]);
    await onContentChange(_temp_attr);
    await validateForm();
    _temp_attr = null;
  };
  const removeTag = (attribute: CustomAttr, removeIndex: number, mapAttrs: CustomAttr[]): boolean => {
    const value = row.value[attribute.Key];
    const valueT = row.value[attribute.Key + 'T'];
    if (!value || !valueT) return false;

    const values = value.split(',');
    const valuesT = valueT.split(',');

    if (removeIndex < 0 || removeIndex >= values.length) return false;

    values.splice(removeIndex, 1);
    valuesT.splice(removeIndex, 1);

    row.value[attribute.Key] = values.join(',');
    row.value[attribute.Key + 'T'] = valuesT.join(',');
    handleFieldChangeListeners(attribute.Key);
    // 更新映射属性
    const mapAttr = mapAttrs.find((item) => item.Key === attribute.Key);
    if (mapAttr) mapAttr.Tag = values;

    return true;
  };
  /**
   * 处理字段函数
   * @param attr
   */
  const onContentChange = async (attr) => {
    try {
      await validate(attr.Key);
      attr.validateErr = '';
      attr.errStyle = {};
    } catch (errors) {
      attr.validateErr = errors.errorFields?.[0]?.errors?.[0] || '验证失败';
      attr.errStyle = {
        color: '#ff5555',
        border: '1px solid #ff5555',
      };
    }
    handleFieldCalcEvents(attr.Key); // 自动计算
    handleFieldChangeListeners(attr.Key); // 字段变化
    handleVisibleControlEvents(attr.Key); // 显示隐藏
    // let result;
    // if (props.entityWg != null) {
    //   props.entityWg.SetFrmBodyJson(row.value);
    //   result = await props.entityWg.FrmBodyTextBoxBlur(attr.Key, row.value[attr.Key]);
    // } //执行自定义的方法
    // // else result = await FrmBodyItemChange.FrmBodyItemChange(props.enName, props.pkVal, attr.Key, row.value[attr.Key], row.value);
    // if (!!result && typeof result === 'object') {
    //   const keys = Object.keys(result);
    //   for (const key of keys) {
    //     row.value[key] = result[key];
    //   }
    // }
  };

  //取消按钮
  const handleCancel = () => {
    popModal.visible = false;
  };
  const { pk, pkVal, savedState } = toRefs(props);
  const UpperLevel = async () => {
    if (popModal.mapExt?.Tag6 != '0') {
      message.info('已到第一级机构');
      return;
    }
  };
  const updateDDLText = (attr: CustomAttr, event: any) => {
    const ddlItem = attr.ddl.find((ddlItem: DDL) => ddlItem.value === event);
    if (ddlItem) {
      row.value[attr.Key + 'T'] = ddlItem.label;
      handleDropdownEvents(attr.Key);
      handleAutoFillEvents(attr.Key, event);
    }
    onContentChange(attr);
  };

  const emit = defineEmits(['open-field-ath', 'update-entity-ext-info']);

  // 文件列表
  const fileList = ref<UploadFile[]>([]);

  // const openCCFromAthTable = inject('openCCFromAthTable') as Function;
  // const openAth = async (attr, readonly: boolean) => {
  //   await openCCFromAthTable(attr, props.athPKVal, readonly);
  // };
  const remoteSearchOptions = ref([]);
  const mergeAttrStyle = (attr: CustomAttr) => {
    const errStyle = attr.errStyle || {};
    return {
      ...mixedStyles(attr.Key),
      ...errStyle,
    };
  };

  const {
    isDDLSelect,
    isRemoteSearch,
    isControlFieldReadonly,
    getDisabledDate,
    isDateReadonly,
    handleDropdownEvents,
    handleFieldCalcEvents,
    handleFieldChangeListeners,
    handleRemoteSelect,
    handleRemoteSearch,
    handleAutoFillEvents,
    mixedStyles,
    getTitleLink,
    handleVisibleControlEvents,
    initializeAllEvents,
  } = useMapExtHandler(row, remoteSearchOptions, {
    mapAttrs: props.allMapAttrs,
    mapExts: props.mapExts,
  });

  const { isFloat, isInt, isDateTime, isDate, isDDL, isBoolean, isMoney, isTextBox, isTextArea, isPopTextArea, isLink, isCheckbox, isRadioButton, isSingleAth, isRichText } =
    useFieldType();
  const { isReadOnly, isHidden } = useFieldStatus(pk.value, pkVal.value as string, savedState.value);
  // 新增控制字段状态
  const mixedReadonly = (attr: CustomAttr) => {
    if (isControlFieldReadonly(attr.Key)) return true;
    if (isDate(attr) || isDateTime(attr)) return props.isReadonly || isReadOnly(attr) || isDateReadonly(attr.Key);
    return props.isReadonly || isReadOnly(attr);
  };
  const isRequired = (attr, validator) => {
    if (!validator) return false;
    const rules = validator[attr.Key];
    if (!Array.isArray(rules)) return false;
    return !!rules.find((r) => !!r.required || typeof r.validator === 'function');
  };
  const enhancedValidator = Object.keys(props.validator || {}).reduce((acc, key) => {
    acc[key] = props.validator![key].map((rule) => {
      if (rule.validator) {
        return {
          ...rule,
          validator: (ruleObj, value, callback) => {
            // 将行数据作为第四个参数传递
            return rule.validator!.call(row, ruleObj, value, callback, row);
          },
        };
      }
      return rule;
    });
    return acc;
  }, {});
  const validatorRef = shallowRef(enhancedValidator);
  const { validate } = useForm(row, validatorRef);
  const validateForm = async () => {
    let errors = null;
    try {
      await validate();
      props.mapAttrs.forEach((attr) => {
        attr.validateErr = '';
        attr.errStyle = {};
      });
    } catch (_errors) {
      errors = _errors;
      const errorFields = _errors.errorFields;
      for (const field of errorFields) {
        const attr = props.mapAttrs.find((attr) => attr.Key == field.name);
        if (attr) {
          attr.validateErr = field.errors?.[0] || '验证失败';
          attr.errStyle = {
            color: '#ff5555',
            border: '1px solid #ff5555',
          };
        }
      }
    }
    return errors;
  };
  const handleBooleanEvent = async (row, attr) => {
    //UIkeyRef 是否存在联动字段
    if (attr.UIkeyRef) {
      getMapAttrs.value = originAttrs;
      const keyRefs = attr.UIkeyRef.split(',')
        .map((key) => key.trim())
        .filter((key) => key.length > 0);
      const attrsMap = new Map(getMapAttrs.value.map((a) => [a.Key, a]));
      for (const key of keyRefs) {
        const attrObj = attrsMap.get(key);
        if (attrObj) {
          attrObj.UIVisible = Boolean(row[attr.Key]);
        }
      }
    }
    onContentChange(attr.Key); // 字段变化
  };
  onMounted(async () => {
    Events.on('update-en-row', (option) => {
      const { key, val } = option;
      if (props.mapAttrs.find((a) => a.Key == key)) {
        row.value[key] = val;
        onContentChange(props.mapAttrs.find((a) => a.Key == key)); // 字段变化
      }
    });
    initializeAllEvents(); // 检查所有字段显示隐藏配置
  });
  onUnmounted(() => {
    Events.off('update-en-row');
  });
  defineExpose({ rowData: row, FileList: fileList, validateForm });
</script>

<style lang="less" scoped>
  .en-fields {
    .grid-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 10px;

      .field-item {
        align-items: start;

        // :nth-child(2) {
        //   overflow-wrap: break-word;
        //   // line-height: 32px;
        //   // align-self: self-end;
        // }
        :deep(.ant-input-group) {
          overflow: hidden;
        }
        .label {
          // height: 32px;
          line-height: 32px;
        }

        // :nth-child(2) {
        //   align-self: self-end;
        // }
      }
    }
    .switch-col {
      grid-column: span 3;
      display: flex;
      align-items: center;
      height: 32px;
      line-height: 32px;
    }
    :deep(.ant-form-item-explain-error) {
      text-align: right;
    }
    :deep(.ant-input) {
      &:hover {
        border-color: var(--system-bg-color);
      }
      &:focus {
        border-color: var(--system-bg-color);
        box-shadow: unset;
      }
    }
    .ant-input[disabled] {
      background: #fbfbfb;
    }
    :deep(.ant-form-item) {
      margin-bottom: 0;
    }

    :deep(.ant-select) {
      width: 100% !important;
    }

    :deep(.ant-input-number) {
      width: 100%;
      text-align: right;

      :deep(input) {
        text-align: right;
      }
    }
  }

  .label {
    height: 100%;
    box-sizing: border-box;
    width: 100%;
    padding-right: 12px;
    text-align: left;
    :nth-child(1) {
      margin-left: 3px;
    }
  }

  .label-right {
    text-align: right;
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 100%;

    .icon {
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #d9d9d9;
    }
    .icon-cont {
      width: 150px;
    }
  }
  :deep(.ant-input-number-input) {
    text-align: right;
  }
  .up_level {
    float: left;
  }
  .pop_intput_div {
    line-height: 32px;
    min-height: 32px;
    /*height: auto;*/
    width: calc(100% - 46px);
    border: 1px solid #ccc;
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
  }
  .btnStyle {
    background-color: var(--system-bg-color);
    border-color: var(--system-bg-color);
  }
  .btnStyle:hover {
    background-color: var(--system-hover-bg-color);
    border-color: var(--system-hover-bg-color);
  }
  .btnStyle:active {
    background-color: var(--system-active-bg-color);
    border-color: var(--system-active-bg-color);
  }
  :deep(.ant-modal .ant-modal-header) {
    border-top: 1px solid #df0b0b;
  }
  :deep(.ant-input-number-handler-wrap) {
    display: none;
  }
  .pop-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    .select-count {
      width: 80px;
    }
    .button-group {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: flex-end;
      padding: 12px;
    }
  }
</style>
