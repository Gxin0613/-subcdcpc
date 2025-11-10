<template>
  <Card style="border-radius: 12px">
    <div class="header">
      <div class="title">{{ title }}</div>
    </div>
    <Divider />
    <div class="p-4">
      <MapAttrForm
        v-if="ready === true"
        :map-attrs="renderAttrs"
        :frmData="frmData"
        :mainData="inputValues"
        :params="props.params"
        ref="basicData"
        :is-readonly="false"
        :tableCol="4"
        labPostion="left"
        labAlign="left"
      />
      <div class="footer">
        <Button type="primary" @click="beforeExecMethod">{{ entityRef?.BtnDoneText || '执行' }}</Button>
      </div>
    </div>
    <!--    模态弹窗-->
    <Modal v-model:open="confirmModal.visible" :title="confirmModal.title" @ok="execMethod" @cancel="resetModal1" centered>
      <div class="p-4" v-html="confirmModal.content"> </div>
    </Modal>
  </Card>
</template>

<script lang="ts" setup>
  import { Modal, Divider, Card, message, Button } from 'ant-design-vue';
  import { ref, PropType, reactive, provide, shallowRef } from 'vue';
  import { DataType } from '/@/bp/en/DataType';
  import { Attr } from '/@/bp/en/Map/Attr';
  import { useTreeConvert } from '/@/hooks/ens/useDataConvert';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import MapAttrForm from '/@/WF/CCForm/MapAttrForm.vue';
  import { FieldTypeS, UIContralType } from '/@/bp/en/EnumLab';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import { GetMapExtsGroup, MapAttrExt, userConvertData } from '/@/WF/CCForm/FrmEnd';
  import { mapExtParse } from '/@/WF/CCForm/MapExt';
  import { AtPara } from '/@/bp/da/AtPara';

  type DropdownItem = {
    value: string | number;
    label: string;
  };
  type MergedAttr = Attr & {
    ddl: DropdownItem[];
    Name?: string;
    Desc?: string;
  };
  const props = defineProps({
    title: {
      type: String,
      default: '',
    },
    attrs: {
      type: Object as PropType<Array<MergedAttr>>,
      default: () => {
        return [];
      },
    },
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
    row: {
      type: Object,
      default: () => {
        return {};
      },
    },
    entityRef: {
      type: Object,
      default: () => ({}),
    },
  });

  // 模态框属性,一般都是执行方法前的提示
  const confirmModal = reactive({
    visible: false,
    content: '',
    title: '',
    confirmMethod: '',
  });
  const resetModal1 = () => {
    confirmModal.confirmMethod = '';
    confirmModal.visible = false;
    confirmModal.content = '';
    confirmModal.title = '';
  };
  const beforeExecMethod = async () => {
    const execTips = props.entityRef.WarningMsg;
    if (!execTips) {
      await execMethod();
      return;
    }
    confirmModal.visible = true;
    confirmModal.content = execTips;
    confirmModal.title = '提示';
  };

  const inputValues = ref<Recordable>({});
  const renderAttrs = ref<Array<Recordable>>([]);
  const ready = ref(false);
  const frmData = ref();
  const { GetDataTableOfTBChoice } = mapExtParse();
  /**
   * 获取方法的MapAttrs,MapExts,ddl等相关的数据
   * @constructor
   */
  async function InitComponent() {
    try {
      const handler = new HttpHandler('BP.CCBill.WF_CCBill');
      handler.AddPara('MethodNo', props.params.MethodNo);
      const data = await handler.DoMethodReturnString('MyDict_MethodFunc_Init');
      frmData.value = data;
      renderAttrs.value = frmData.value.Sys_MapAttr;
      const mapExts = GetMapExtsGroup(frmData.value.Sys_MapExt);
      inputValues.value = frmData.value['MainTable'][0] || {};
      //处理字段的下拉框
      for (const mapAttr of renderAttrs.value) {
        if (!!props.row[mapAttr.KeyOfEn]) {
          inputValues.value[mapAttr.KeyOfEn] = props.row[mapAttr.KeyOfEn];
          continue;
        }
        mapAttr['type'] = 'input';
        mapAttr['rules'] = [];
        //mapExt的集合
        mapAttr.mapExts = mapExts[mapAttr.MyPK] || [];
        if ((mapAttr.LGType === FieldTypeS.Normal && mapAttr.UIContralType === UIContralType.DDL) || mapAttr.LGType === FieldTypeS.FK || mapAttr.LGType === FieldTypeS.Enum) {
          mapAttr['ddl'] = GetDDLOption(mapAttr as any) || [];
          mapAttr['mode'] = '';
          mapAttr['ShowType'] = mapAttr['ddl'].length != 0 && mapAttr['ddl'][0].hasOwnProperty('ParentNo') ? 'Tree' : '';
        }
        //图片 例如肖像
        if (mapAttr.UIContralType === UIContralType.FrmImg) inputValues.value[mapAttr.KeyOfEn] = await GetImgPath(mapAttr);
        //日期、日期时间类型
        if (mapAttr.MyDataType === DataType.AppDate || mapAttr.MyDataType === DataType.AppDateTime) {
          mapAttr.format = GetDateTimeOption(mapAttr as any);
          if (mapAttr.UIIsInput) mapAttr['rules'] = [{ required: true, message: mapAttr.Name + '值不能为空', type: 'string' }];
          //数值类型
        } else if (mapAttr.MyDataType === DataType.AppFloat || mapAttr.MyDataType === DataType.AppDouble || mapAttr.MyDataType === DataType.AppMoney) {
          mapAttr['bit'] = mapAttr.DefVal == '' ? 2 : mapAttr.DefVal.includes('.') == false ? 2 : mapAttr.DefVal.substring(mapAttr.DefVal.indexOf('.') + 1).length;
          if (mapAttr.UIIsInput) mapAttr['rules'] = [{ required: true, message: mapAttr.Name + '值不能为空' }];
          //其他字段的必填
        } else {
          if (mapAttr.UIIsInput) mapAttr['rules'] = [{ required: true, message: mapAttr.Name + '值不能为空' }];
        }

        //含有正则表达式
        mapAttr.mapExts
          .filter((mapExt) => mapExt.ExtModel === 'BindFunction' && mapExt.ExtType === 'RegularExpression')
          .forEach((mapExt) => {
            mapAttr['rules'].push({
              pattern: new RegExp(/^[0-9]*$/, 'g'),
              message: mapExt.Tag2,
              trigger: mapExt.Tag,
            });
          });
        //是否可以清空填写
        mapAttr.clearable = parseInt(GetPara(mapAttr.AtPara, 'clearable') || '0') == 0 ? false : true;
        //后置说明
        mapAttr.suffix = GetPara(mapAttr.AtPara, 'suffix') || '';

        if (mapAttr.mapExts.length > 0) {
          //判断是不是存在小范围单选，小范围多选
          let data = mapAttr.mapExts.filter((item) => item.ExtModel === 'MultipleChoiceSmall' || item.ExtModel === 'SingleChoiceSmall');
          if (data.length > 0) {
            mapAttr['ddl'] = (await GetDataTableOfTBChoice(data[0], 0)) || [];
            mapAttr['type'] = 'select';
            mapAttr['mode'] = '';
            if (data[0].ExtModel === 'MultipleChoiceSmall' || data[0].ExtModel === 'MultipleChoiceSearch') {
              mapAttr['mode'] = 'multiple';
              inputValues.value[mapAttr.KeyOfEn] = !inputValues.value[mapAttr.KeyOfEn] ? [] : inputValues.value[mapAttr.KeyOfEn].split(',');
            }
          }
        }
        //mapAttr['eleDBs'] = eles.filter((ele) => ele.EleID === mapAttr.KeyOfEn);
        //if (mapAttr['eleDBs'].length > 0) mainData.value[mapAttr.KeyOfEn] = mapAttr['eleDBs'].map((ele) => ele.Tag1).join(',');
      }
      renderAttrs.value = renderAttrs.value.filter((mapAttr) => mapAttr.UIVisible != 0);
      //判断是否启用了联动其他控件的功能
      const cmapExts = frmData.value.Sys_MapExt.filter((mapExt) => mapExt.ExtModel === 'RBAction' && mapExt?.DoWay === '1');
      cmapExts.forEach((mapExt) => {
        SetEnable(mapExt.FK_MapData, mapExt.AttrOfOper, inputValues.value[mapExt.AttrOfOper], true);
      });
      ready.value = true;
    } catch (e) {
      message.error(e as string);
      return;
    }
  }
  /**
   * 联动其他控件
   */
  const LinkAttrs = {};
  //清空联动
  const CleanAll = (frmID, keyOfEn) => {
    if (LinkAttrs[keyOfEn] == undefined || LinkAttrs[keyOfEn].length == 0) return;
    if (LinkAttrs[keyOfEn].length > 0) {
      const ClearSet = LinkAttrs[keyOfEn][0];
      for (let key in ClearSet) {
        const arr = ClearSet[key];
        for (let i = 0; i < renderAttrs.value.length; i++) {
          if (renderAttrs.value[i].MyPK === frmID + '_' + key) {
            renderAttrs.value[i].UIIsEnable = arr[0];
            renderAttrs.value[i].UIVisible = arr[1];
            renderAttrs.value[i].UIIsInput = arr[2];
            if (arr[2] == 0) {
              //判断之前rules
              const rules = renderAttrs.value[i]['rules'];
              if (!!rules && rules.length != 0) {
                //判断rules是否包含必填项
                const result = rules.findIndex((rule) => typeof rule.required === 'boolean');
                if (result.length != -1) renderAttrs.value[i]['rules'].splice(result, 1);
              }
            }
            renderAttrs.value[key] = arr[3];
            break;
          }
        }
      }
    }
  };
  //设置联动
  const SetEnable = async (frmID, keyOfEn, val, isFirstLoad = false) => {
    //判断是否启用了
    const frmRBs = frmData.value.Sys_FrmRB;
    const frmRB = frmRBs.filter((frmRB) => frmRB.MyPK === frmID + '_' + keyOfEn + '_' + val);
    if (frmRB.length == 0) return;

    //隐藏，显示的设置
    const cfgs = frmRB[0].FieldsCfg;
    //设置字段默认值
    const setVal = frmRB[0].SetVal;
    const cfgPara = new AtPara(cfgs);
    const NDMapAttrs = {};
    let isSet = false;
    cfgPara.HisHT.forEach((value, key) => {
      const val = parseInt(value); //cfgPara.GetValIntByKey(key);
      if (Array.isArray(NDMapAttrs[key]) == false) NDMapAttrs[key] = [];
      if (val != 0) {
        for (let i = 0; i < renderAttrs.value.length; i++) {
          if (renderAttrs.value[i].MyPK === frmID + '_' + key) {
            NDMapAttrs[key].push(renderAttrs.value[i].UIIsEnable);
            NDMapAttrs[key].push(renderAttrs.value[i].UIVisible);
            NDMapAttrs[key].push(renderAttrs.value[i].UIIsInput);
            NDMapAttrs[key].push(inputValues.value[key]);
            if (val === 1) {
              //设置为可编辑
              renderAttrs.value[i].UIIsEnable = 1;
            }
            if (val === 2) {
              //设置为可编辑且必填
              renderAttrs.value[i].UIIsEnable = 1;
              renderAttrs.value[i].UIIsInput = 1;
              const rules = renderAttrs.value[i]['rules'];
              if (!rules || rules.length == 0) renderAttrs.value[i]['rules'] = [{ required: true, message: renderAttrs.value[i].Name + '值不能为空' }];
              else {
                //判断rules是否包含必填项
                const result = rules.filter((rule) => typeof rule.required === 'boolean');
                if (result.length == 0) renderAttrs.value[i]['rules'].push({ required: true, message: renderAttrs.value[i].Name + '值不能为空' });
              }
            }
            if (val === 3) {
              //设置为可见
              renderAttrs.value[i].UIIsEnable = 0;
            }
            if (val === 4) {
              //设置为不可见
              renderAttrs.value[i].UIVisible = 0;
            }
            isSet = true;
            break;
          }
        }
      }
    });

    const valPara = new AtPara(setVal);
    valPara.HisHT.forEach((_, key) => {
      if (Array.isArray(NDMapAttrs[key]) == false) {
        NDMapAttrs[key] = [];
        const mapAttr = renderAttrs.value.filter((mapAttr) => mapAttr.MyPK === frmID + '_' + keyOfEn)[0];
        NDMapAttrs[key].push(mapAttr.UIIsEnable);
        NDMapAttrs[key].push(mapAttr.UIVisible);
        NDMapAttrs[key].push(mapAttr.UIIsInput);
        NDMapAttrs[key].push(inputValues.value[key]);
      }
      inputValues.value[key] = valPara.HisHT.get(key);
      isSet = true;
    });
    LinkAttrs[keyOfEn] = [];
    if (isSet) LinkAttrs[keyOfEn].push(NDMapAttrs);
  };

  provide('CleanAll', CleanAll);
  provide('SetEnable', SetEnable);
  /**
   * 获取枚举、外键、外部数据源的选择集合
   * @param mapAttr
   * @constructor
   */
  const GetDDLOption = (mapAttr: MapAttrExt) => {
    let uiBindKey = mapAttr.UIBindKey || '';
    if (uiBindKey == '')
      return [
        {
          value: inputValues.value[mapAttr.KeyOfEn],
          label: '绑定的外键枚举值丢失',
        },
      ];
    const options: any[] = [];
    let data = frmData.value[mapAttr.KeyOfEn];
    if (data == undefined) data = frmData.value[mapAttr.UIBindKey];
    //枚举字段
    if (data == undefined && mapAttr.LGType === FieldTypeS.Enum) {
      const myEnums = frmData.value.Sys_Enum.filter((sysEnum) => sysEnum.EnumKey == uiBindKey);
      if (mapAttr.UIContralType == UIContralType.DDL) {
        options.push({
          value: mapAttr.MyDataType === DataType.AppString ? '-1' : -1,
          label: '-无-',
        });
      }
      myEnums.forEach((item) => {
        options.push({
          value: item.StrKey || item.IntKey,
          label: item.Lab,
        });
      });
      return options;
    }
    //只读的状态时
    if (data == undefined && mapAttr.UIIsEnable == 0) {
      let valText = inputValues.value[mapAttr.KeyOfEn + 'Text'] || '';
      if (valText == '') valText = inputValues.value[mapAttr.KeyOfEn + 'T'] || '';
      return [
        {
          value: inputValues.value[mapAttr.KeyOfEn],
          label: valText,
        },
      ];
    }
    if (data == undefined)
      return [
        {
          value: '',
          label: '请选择',
        },
      ];
    if (data.length != 0 && data[0].hasOwnProperty('ParentNo') == true) {
      //转成树形结构
      const { listToTree } = useTreeConvert();
      const treeData = listToTree('0', data) || [];
      return treeData;
    } else {
      if (mapAttr.UIIsInput === 0)
        options.push({
          value: '',
          label: '-无-',
        });
      data.forEach((item) => {
        options.push({
          value: item.No,
          label: item.Name,
        });
      });
    }
    return options;
  };
  /**
   * 时间类型格式
   * @param mapAttr
   * @constructor
   */
  const GetDateTimeOption = (mapAttr: MapAttrExt) => {
    switch (parseInt(mapAttr.IsSupperText)) {
      case 0:
        return 'YYYY-MM-DD';
      case 1:
        return 'YYYY-MM-DD HH:mm';
      case 2:
        return 'YYYY-MM-DD HH:mm:ss';
      case 3:
        return 'YYYY-MM';
      case 4:
        return 'HH:mm';
      case 5:
        return 'HH:mm:ss';
      case 6:
        return 'MM-DD';
      case 7:
        return 'YYYY';
      case 8:
        return 'MM';
      default:
        return 'YYYY-MM-DD';
    }
  };
  // 执行保存方法，依靠父组件执行
  const emit = defineEmits(['close']);
  const basicData = shallowRef<InstanceType<typeof MapAttrForm>>();
  const { ConvertDataToDB } = userConvertData();
  const execMethod = async () => {
    let rowData: any = {};
    if (basicData.value != undefined) {
      if (Array.isArray(basicData.value)) rowData = basicData.value[0].mainData;
      else rowData = basicData.value.mainData;
    }
    const resultData = await ConvertDataToDB(rowData, renderAttrs.value as any);
    await execMethodFuc(props.params.MethodNo, resultData);
    emit('close');
  };
  const execMethodFuc = async (No: string, row: Recordable) => {
    try {
      const handler = new HttpHandler('BP.CCBill.WF_CCBill');
      handler.AddPara('PKVal', No);
      handler.AddPara('FrmID', props.params?.FrmID);
      handler.AddPara('WorkID', props.params?.OID);
      const keys = Object.keys(row);
      for (const key of keys) {
        handler.AddPara(key, row[key]);
      }
      const data = await handler.DoMethodReturnString('DoMethodPara_ExeSQL_V3');
      message.success(data);
    } catch (e: any) {
      message.error(e);
    }
  };
  InitComponent();
</script>

<style lang="less" scoped>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 16px;
      font-weight: bold;
    }
  }

  .divider {
    width: 100%;
    height: 2px;
    background-color: #f2f5f7;
  }
  .label {
    height: 32px;
    line-height: 32px;
  }

  .footer {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 40px;
  }

  .change-avatar {
    img {
      display: block;
      margin-bottom: 15px;
      border-radius: 50%;
    }
  }
</style>
