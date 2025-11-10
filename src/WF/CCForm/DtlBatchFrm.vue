<template>
  <div class="p-10" style="background-color: white; padding-top: 0">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content" style="height: 500px; overflow-y: auto; margin: 0 auto; padding: 10px 24px">
        <MapAttrForm
          v-if="isLoadAfter"
          :map-attrs="GetMapAttrs()"
          :frmData="frmData"
          :mainData="mainData"
          :params="props.params"
          ref="basicData"
          :is-readonly="false"
          :tableCol="4"
          labPostion="left"
          labAlign="left"
          :key="componentKey"
        />
      </div>
    </Spin>
  </div>
</template>
<script lang="ts" setup>
  import { message, Spin } from 'ant-design-vue';
  import { reactive, ref, shallowRef, getCurrentInstance, provide } from 'vue';
  import { FrmAttachment, MapDtl } from '/#/entity';
  import MapAttrForm from './MapAttrForm.vue';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import { FieldTypeS, UIContralType } from '/@/bp/en/EnumLab';
  import { MapAttrExt, GetMapExtsGroup, userConvertData, ddlInfo } from '/@/WF/CCForm/FrmEnd';
  import { DataType } from '/@/bp/en/DataType';
  import { mapExtParse } from '/@/WF/CCForm/MapExt';
  import { useTreeConvert } from '/@/hooks/ens/useDataConvert';
  import { AtPara } from '/@/bp/da/AtPara';
  import HttpHandler from '/@form/dto/HttpHandler';
  // 父组件传过来的属性
  const props = defineProps({
    mapDtl: {
      type: Object,
      default: () => {},
    },
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
  });

  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const loading = ref(false);
  const instance = getCurrentInstance();
  const frmData = ref();
  const mapAttrs = ref<Array<MapAttrExt>>([]); //字段集合
  const mapData = ref<MapDtl>(); //表单属性
  const mainData = ref<Record<string, any>>({}); //表单数据集合
  const isLoadAfter = ref(false);
  //获取表单的分组
  const componentKey = ref(0);
  const { GetDataTableOfTBChoice } = mapExtParse();
  //初始化页面
  const InitPage = async () => {
    try {
      loading.value = true;
      const batchUpdatAttrs = props.mapDtl.IsBatchUpdateAttrs || '';
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddPara('EnsName', props.mapDtl.No);
      const data = await handler.DoMethodReturnString('DtlFrmGener_Init');
      if (typeof data == 'string' && data.includes('err@') == true) {
        errorObj.hasError = true;
        errorObj.tips = data.replace('err@', '');
        console.log('DtlFrmGener_Init获取失败:' + data);
        return;
      }
      frmData.value = JSON.parse(JSON.stringify(data));
      mapData.value = frmData.value.Sys_MapDtl[0] as MapDtl;
      mainData.value = frmData.value.Blank[0] || {};
      mapAttrs.value = frmData.value.Sys_MapAttr;
      const aths = (frmData.value.Sys_FrmAttachment as Array<FrmAttachment>) || [];
      if (!!batchUpdatAttrs) mapAttrs.value = mapAttrs.value.filter((mapAttr) => (batchUpdatAttrs + ',').includes(mapAttr.KeyOfEn + ','));
      const mapExts = GetMapExtsGroup(frmData.value.Sys_MapExt);

      //判断是否启用了联动其他控件的功能
      const cmapExts = frmData.value.Sys_MapExt.filter((mapExt) => mapExt.ExtModel === 'RBAction' && mapExt?.DoWay === '1');
      cmapExts.forEach((mapExt) => {
        SetEnable(mapExt.FK_MapData, mapExt.AttrOfOper, mainData.value[mapExt.AttrOfOper], true);
      });
      //处理字段的下拉框
      for (const mapAttr of mapAttrs.value) {
        mapAttr['type'] = 'input';
        mapAttr['rules'] = [];
        //mapExt的集合
        mapAttr.mapExts = mapExts[mapAttr.MyPK] || [];
        if ((mapAttr.LGType === FieldTypeS.Normal && mapAttr.UIContralType === UIContralType.DDL) || mapAttr.LGType === FieldTypeS.FK || mapAttr.LGType === FieldTypeS.Enum) {
          mapAttr['ddl'] = GetDDLOption(mapAttr as any) || [];
          mapAttr['mode'] = '';
          mapAttr['ShowType'] = mapAttr['ddl'].length != 0 && mapAttr['ddl'][0].hasOwnProperty('ParentNo') ? 'Tree' : '';
        }

        //日期、日期时间类型
        if (mapAttr.MyDataType === DataType.AppDate || mapAttr.MyDataType === DataType.AppDateTime) {
          mapAttr.format = GetDateTimeOption(mapAttr as any);
          if (mapAttr.UIIsInput) mapAttr['rules'] = [{ required: true, message: mapAttr.Name + '值不能为空', type: 'string' }];
          //数值类型
        } else if (mapAttr.MyDataType === DataType.AppFloat || mapAttr.MyDataType === DataType.AppDouble || mapAttr.MyDataType === DataType.AppMoney) {
          mapAttr['bit'] = parseInt(GetPara(mapAttr.AtPara, 'NumScale') || 2);
          if (mapAttr.UIIsInput) mapAttr['rules'] = [{ required: true, message: mapAttr.Name + '值不能为空' }];
          //其他字段的必填
        } else {
          if (mapAttr.UIIsInput) mapAttr['rules'] = [{ required: true, message: mapAttr.Name + '值不能为空' }];
        }

        //字段附件，获取对应的附件信息
        if (mapAttr.UIContralType === UIContralType.AthShow) {
          const result = aths.filter((ath) => ath.MyPK === mapAttr.MyPK);
          if (result.length == 0) {
            mapAttr.ath = null;
            mainData.value[mapAttr.KeyOfEn] = '附件信息丢失,请联系管理员';
            continue;
          }
          mapAttr.ath = result[0];
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
            mapAttr['ddl'] = (await GetDataTableOfTBChoice(data[0], props.params.WorkID)) || [];
            mapAttr['type'] = 'select';
            mapAttr['mode'] = '';
            if (data[0].ExtModel === 'MultipleChoiceSmall' || data[0].ExtModel === 'MultipleChoiceSearch') {
              mapAttr['mode'] = 'multiple';
              mainData.value[mapAttr.KeyOfEn] = !mainData.value[mapAttr.KeyOfEn] ? [] : mainData.value[mapAttr.KeyOfEn].split(',');
            }
          }
        }

        mapAttr['eleDBs'] = [];
      }
      mainData.value = await ConvertDataFromDB(mainData.value, mapAttrs.value as any);
      isLoadAfter.value = true;
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  const GetMapAttrs = () => {
    return mapAttrs.value.filter((attr) => attr.UIVisible);
  };
  const { ConvertDataToDB, ConvertDataFromDB } = userConvertData();

  /**
   * 修改父组件属性的信息
   * @param mapAttr
   * @param type
   * @constructor
   */
  const ChangeParentAttr = async (keyOfEn, type, data) => {
    switch (type) {
      case 'FullData':
        for (const item in data) {
          if (mainData.value.hasOwnProperty(item)) {
            const isChangeVal = mainData.value[item] === data[item] ? false : true;
            mainData.value[item] = data[item];
            //判断当前的值是否有填充其他控件的功能
            if (isChangeVal) {
              const mapAttr = mapAttrs.value.filter((attr) => attr.KeyOfEn === item)[0];
              //调用子页面的方法
              await MapAttrLinkageTrigger(mapAttr, mainData.value[item], props.params.WorkID, null, false);
            }
          }
        }
        break;
      case 'ActiveDDL':
      case 'FullDataDDL':
        mapAttrs.value.forEach((mapAttr) => {
          if (mapAttr.KeyOfEn === keyOfEn) {
            mapAttr.ddl = data;
            if (data.length === 0) mainData.value[keyOfEn] = '';
            mapAttr['ShowType'] = data.length != 0 && data[0].hasOwnProperty('ParentNo') ? 'Tree' : '';
            //判断当前值是否在当前的下拉列表中
            if (data.filter((item) => item.value === mainData.value[keyOfEn]).length === 0) {
              mainData.value[keyOfEn] = data.length === 0 ? '' : data[0].value;
              mainData.value[keyOfEn + 'T'] = data.length === 0 ? '' : data[0].label;
              mainData.value[keyOfEn + 'Text'] = data.length === 0 ? '' : data[0].label;
            }
            //调用子页面的方法
            MapAttrLinkageTrigger(mapAttr, mainData.value[keyOfEn], props.params.WorkID, null, false);
            return;
          }
        });
        break;
      case 'FullDataDtl': //刷新从表数据
        let refDtl = instance?.refs['dtl' + keyOfEn];
        if (!!refDtl && Array.isArray(refDtl)) refDtl = refDtl[0];
        if (!!refDtl) {
          refDtl.InitPage(false);
        }
        break;
      default:
        break;
    }
  };
  provide('ChangeParentAttr', ChangeParentAttr);

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
        if (arr.length == 2) {
          continue;
        }
        for (let i = 0; i < mapAttrs.value.length; i++) {
          if (mapAttrs.value[i].MyPK === frmID + '_' + key) {
            mapAttrs.value[i].UIIsEnable = arr[0];
            mapAttrs.value[i].UIVisible = arr[1];
            mapAttrs.value[i].UIIsInput = arr[2];
            if (arr[2] == 0) {
              //判断之前rules
              const rules = mapAttrs.value[i]['rules'];
              if (!!rules && rules.length != 0) {
                //判断rules是否包含必填项
                const result = rules.findIndex((rule) => typeof rule.required === 'boolean');
                if (result.length != -1) mapAttrs.value[i]['rules'].splice(result, 1);
              }
            }
            mainData.value[key] = arr[3];
            break;
          }
        }
      }
    }
  };
  //设置联动
  const SetEnable = async (frmID, keyOfEn, val, isFirstLoad = false, _index = 0) => {
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
        for (let i = 0; i < mapAttrs.value.length; i++) {
          if (mapAttrs.value[i].MyPK === frmID + '_' + key) {
            NDMapAttrs[key].push(mapAttrs.value[i].UIIsEnable);
            NDMapAttrs[key].push(mapAttrs.value[i].UIVisible);
            NDMapAttrs[key].push(mapAttrs.value[i].UIIsInput);
            NDMapAttrs[key].push(mainData.value[key]);
            if (val === 1) {
              //设置为可编辑
              mapAttrs.value[i].UIIsEnable = 1;
            }
            if (val === 2) {
              //设置为可编辑且必填
              mapAttrs.value[i].UIIsEnable = 1;
              mapAttrs.value[i].UIIsInput = 1;
              const rules = mapAttrs.value[i]['rules'];
              if (!rules || rules.length == 0) mapAttrs.value[i]['rules'] = [{ required: true, message: mapAttrs.value[i].Name + '值不能为空' }];
              else {
                //判断rules是否包含必填项
                const result = rules.filter((rule) => typeof rule.required === 'boolean');
                if (result.length == 0) mapAttrs.value[i]['rules'].push({ required: true, message: mapAttrs.value[i].Name + '值不能为空' });
              }
            }
            if (val === 3) {
              //设置为可见
              mapAttrs.value[i].UIIsEnable = 0;
            }
            if (val === 4) {
              //设置为不可见
              mapAttrs.value[i].UIVisible = 0;
            }
            isSet = true;
            break;
          }
        }
      }
    });

    const valPara = new AtPara(setVal);
    valPara.HisHT.forEach((value, key) => {
      if (Array.isArray(NDMapAttrs[key]) == false) {
        NDMapAttrs[key] = [];
        const mapAttr = mapAttrs.value.filter((mapAttr) => mapAttr.MyPK === frmID + '_' + keyOfEn)[0];
        NDMapAttrs[key].push(mapAttr.UIIsEnable);
        NDMapAttrs[key].push(mapAttr.UIVisible);
        NDMapAttrs[key].push(mapAttr.UIIsInput);
        NDMapAttrs[key].push(mainData.value[key]);
      }
      mainData.value[key] = valPara.HisHT.get(key);
      isSet = true;
    });
    LinkAttrs[keyOfEn] = [];
    if (isSet) LinkAttrs[keyOfEn].push(NDMapAttrs);
    if (isFirstLoad == false) componentKey.value++;
  };

  provide('CleanAll', CleanAll);
  provide('SetEnable', SetEnable);
  const MapAttrLinkageTrigger = async (mapAttr, value, refPKVal, option: ddlInfo | null = null, isPageLoad = false) => {
    const { GetActionDLLData, GetFullData, GetFullDataDtl } = mapExtParse();
    //修改对应的T值
    if (option != null) mainData.value[mapAttr.KeyOfEn + 'T'] = option.label;
    //处理扩展属性
    const mapExts = mapAttr.mapExts || [];
    for (const mapExt of mapExts) {
      if (isPageLoad && mapExt.ExtModel === 'RBAction') continue;
      switch (mapExt.ExtModel) {
        case 'ActiveDDL': //级联其他控件
          const data = await GetActionDLLData(value, mapExt, 'Doc', refPKVal, mainData.value, '');
          ChangeParentAttr(mapExt.AttrsOfActive, 'ActiveDDL', data);
          break;
        case 'FullCtrl':
        case 'TBFullCtrl':
        case 'Pop':
          //不填充
          if (mapExt?.DoWay == 0) break;
          if (mapExt?.DoWay === 'None') break;

          //填充主表控件,控制字段是Tag5
          if (mapExt.Tag5 != 'None') {
            const fullData = await GetFullData(value, mapExt, props.params.WorkID, mainData.value, null);
            if (fullData == null) continue;
            ChangeParentAttr('', 'FullData', fullData);
          }
          break;
        case 'FullDataDDL':
          const result = await GetActionDLLData(value, mapExt, 'Doc', refPKVal, mainData.value, '');
          ChangeParentAttr(mapExt.Tag1, 'FullDataDDL', result);
          break;
        case 'FullDataDtl':
          const resultData = await GetFullDataDtl(value, mapExt, refPKVal, mainData.value);
          if (resultData == null) break;
          ChangeParentAttr(mapExt.Tag1, 'FullDataDtl', null);
          break;
        case 'RBAction': //联动其他控件
          if (mapExt?.DoWay == 0) break;
          if (mapExt?.DoWay === 'None') break;
          //清空之前的设置
          CleanAll(mapExt.FK_MapData, mapExt.AttrOfOper);
          //设置联动
          SetEnable(mapExt.FK_MapData, mapExt.AttrOfOper, value);
          break;
        default:
          break;
      }
    }
  };

  const basicData = shallowRef<InstanceType<typeof MapAttrForm>>();
  const VerifyFormData = async () => {
    //更改数据字段值的类型
    let rowData: any = {};
    if (basicData.value != undefined) {
      if (Array.isArray(basicData.value)) rowData = basicData.value[0].mainData;
      else rowData = basicData.value.mainData;
    }
    const resultData = await ConvertDataToDB(rowData, mapAttrs.value as any);
    let result = true;
    let msg = '';
    //校验文本字段的输入长度是否超出数据库设置的长度
    mapAttrs.value
      .filter((mapAttr) => mapAttr.MyDataType === DataType.AppString)
      .forEach((mapAttr) => {
        if (resultData[mapAttr.KeyOfEn] != null && resultData[mapAttr.KeyOfEn] != '' && resultData[mapAttr.KeyOfEn].length > mapAttr.MaxLen)
          msg +=
            '字段' +
            mapAttr.Name +
            '输入字段的长度不能超过' +
            mapAttr.MaxLen +
            `位,	
`;
      });
    if (msg != '') {
      message.error(msg);
      return null;
    }
    //校验必填,只有发送的时候校验必填
    mapAttrs.value
      .filter((mapAttr) => mapAttr.UIIsInput === 1)
      .forEach((mapAttr) => {
        if (mapAttr.LGType === FieldTypeS.Enum && resultData[mapAttr.KeyOfEn] === -1)
          msg +=
            '字段' +
            mapAttr.Name +
            `值不能为空,	
`;
        if (resultData[mapAttr.KeyOfEn] === null || resultData[mapAttr.KeyOfEn] === '')
          msg +=
            '字段' +
            mapAttr.Name +
            `值不能为空,	
`;
      });
    if (msg != '') {
      message.error(msg);
      return null;
    }
    return resultData;
  };
  defineExpose({ VerifyFormData });

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
          value: mainData.value[mapAttr.KeyOfEn],
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
          value: -1,
          label: '-无-',
        });
      }
      myEnums.forEach((item) => {
        options.push({
          value: item.IntKey,
          label: item.Lab,
        });
      });
      return options;
    }
    //只读的状态时
    if (data == undefined && mapAttr.UIIsEnable == 0) {
      let valText = mainData.value[mapAttr.KeyOfEn + 'Text'] || '';
      if (valText == '') valText = mainData.value[mapAttr.KeyOfEn + 'T'] || '';
      return [
        {
          value: mainData.value[mapAttr.KeyOfEn],
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

  InitPage();
</script>

<style lang="less" scoped>
  .form-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
    // height: 80px;
    // line-height: 80px;
    font-weight: 600;
    font-size: 14px;
    padding-right: 8px;

    img {
      width: 120px;
      height: 60px;
      object-fit: contain;
    }

    p {
      display: flex;
      align-items: center;
    }
  }
  .GroupBar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
    height: 40px;
    line-height: 80px;
    font-weight: 600;
    font-size: 14px;
    padding: 10px;
    margin-bottom: 4px;
    background-color: whitesmoke;

    img {
      width: 120px;
      height: 60px;
      object-fit: contain;
    }

    p {
      display: flex;
      align-items: center;
    }
  }
  .GroupTitle {
    margin: 10px 0;
    border-radius: 5px;
    background-color: #e3dbd7;
    // color: #598da7;
  }
</style>
