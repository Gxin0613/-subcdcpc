<template>
  <BaseComponent ref="baseComp" :close-drawer-func="reloadData">
    <ThemeWrapper>
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content" @keydown.stop>
        <div class="step-form-card">
          <div class="form-main">
            <div class="content-area">
              <div class="form-title">
                <Steps :current="current" :items="items" />
              </div>
              <div class="custom">
                <div class="input-box" v-if="current == 0">
                  <div class="gpn-input-item">
                    <div class="label"> <span style="color: red"> * </span>{{ '名称' }}</div>
                    <Input type="text" v-model:value="tbValue.name" @change="generatePinyin($event, tbValue)" />
                  </div>
                  <div class="gpn-input-item">
                    <div class="label"> <span style="color: red"> * </span>{{ '编号' }}</div>
                    <Input type="text" v-model:value="tbValue.no" />
                  </div>
                  <div class="gpn-input-item" v-if="currentParams?.PageNo == 'SelectedEnum'">
                    <div class="label"> <span style="color: red"> * </span>{{ '配置项,格式1:男,女,童 格式2:@0=男@1=女@3=童' }}</div>
                    <Input type="text" :disabled="isReadonly" v-model:value="tbValue.pTable" />
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px">
                    <Button v-if="current < steps.length - 1 && currentParams?.PageNo == 'SelectedEnum'" style="margin-right: 15px" @click="reloadData">{{
                      '请选择已有的枚举项'
                    }}</Button>
                    <Button v-if="!!tbValue.name && current < steps.length - 1 && currentParams?.PageNo == 'SelectedDict'" style="margin-right: 15px" @click="reloadData">{{
                      '请选择已有的外键项'
                    }}</Button>
                    <div class="select-val-cont" v-if="!!SelectValCont">{{ '已选中：' + SelectValCont }}</div>
                    <RadioGroup v-model:value="pinyinMode" @change="changePinyin($event, tbValue)" name="radioGroup">
                      <Radio :value="'simple'">{{ '简拼' }}</Radio>
                      <Radio :value="'full'">{{ '全拼' }}</Radio>
                    </RadioGroup>
                  </div>
                </div>
                <div class="enum-cont" v-if="current == 0">
                  <Row :gutter="[16, 16]">
                    <Col class="gutter-row" :span="6" v-for="item in searchData" :key="item.No" :data-win-id="item.No">
                      <div class="gutter-box" @click="selectOne(item)">{{ item.Name }}</div>
                    </Col>
                  </Row>
                </div>
                <div class="" v-else-if="current == 1">
                  <Result status="success" :title="'创建成功'" />
                </div>
              </div>
              <div class="form-footer">
                <ShowHelp @change-show-help="changeShowHelp" :isGPNShowHelp="isEnumShowHelp" />
                <div>
                  <Button v-if="currentParams?.PageNo == 'SelectedEnum'" danger style="margin-right: 15px" @click="enumLib">枚举维护</Button>
                  <Button v-if="currentParams?.PageNo == 'SelectedDict'" danger style="margin-right: 15px" @click="createDict">{{ '新建字典' }}</Button>

                  <Button v-if="current == steps.length - 1" type="primary" @click="completed">{{ '完成' }}</Button>
                  <Button v-if="current < steps.length - 1" type="primary" @click="next">{{ '下一步' }}</Button>
                </div>
              </div>
            </div>
            <Transition name="slide-fade">
              <div v-if="isEnumShowHelp" class="inner-help-docs">
                <template v-if="currentParams?.PageNo == 'SelectedEnum'">
                  <v-md-preview :text="appTitleHelper(selectedEnum)" preview-class="vuepress-markdown-body" height="400px" />
                </template>
                <template v-else-if="currentParams?.PageNo == 'SelectedDict'">
                  <v-md-preview :text="appTitleHelper(selectedDict)" preview-class="vuepress-markdown-body" height="400px" />
                </template>
                <div v-else style="padding: 20px; text-align: center; color: #999">{{ '当前步骤无帮助文档。' }}</div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </ThemeWrapper>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { Button, Input, message, Steps, RadioGroup, Radio, Row, Col, Result } from 'ant-design-vue';
  import { reactive, ref, PropType, toRaw, computed, shallowRef, watch } from 'vue';
  import ThemeWrapper from '/@/WF/Comm/ThemeWrapper.vue';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { usePinYinGenerator } from '/@/components/BaseCreateForm/src/useIDGenerator';
  import ShowHelp from '/@/WF/Comm/UIEntity/ShowHelp.vue';
  import { appTitleHelper } from '/@/utils/helper/appTitleHelper';
  import { GloWF } from '/@/WF/Admin/GloWF';
  import { GetParamsUrl } from '/@/utils/gener/StringUtils';
  import { useDBSourceLoader } from '/@/hooks/ens/useDBSourceLoader';
  import { SysEnumMain } from './SysEnumMain';
  import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
  import WebUser from '/@/bp/web/WebUser';
  import { splitAtString } from '/@/bp/tools/ParamUtils';
  import { MapAttr } from '../MapAttrs/MapAttr';
  import { UIContralType } from '/@/bp/en/EnumLab';
  import { SFTable, SFTables } from '../SFTable/SFTable';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { GloComm } from '/@/WF/Comm/GloComm';
  import { isConvertibleToNumber } from '/@/utils/stringUtils';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  interface Item {
    No: string;
    Name: string;
  }
  const props = defineProps({
    params: {
      type: Object as PropType<Recordable>,
      default: () => ({}),
    },
    closePage: {
      type: Function,
      default: null,
    },
  });
  const errorObj = reactive({ tips: '', hasError: false });

  const baseComp = shallowRef<InstanceType<typeof BaseComponent>>();

  //sql查询数据源
  const dataOptions = ref<Item[]>([]);

  //剥离响应式代理
  const currentParams = toRaw(props.params);

  //枚举类型
  const enumType = ref<number | undefined>(0);

  //数据处理
  const { getDBSource } = useDBSourceLoader();

  //只读处理  枚举选中
  const isReadonly = ref<boolean | undefined>(false);

  const createDict = () => {
    const gpnObj = new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, GloComm.UrlGPN('GPN_Local', '', '&PageNo=SFTable&RefPKVal=local&From=FrmD'));
    baseComp.value?.handleGPNCallback(gpnObj);
  };

  const enumLib = () => {
    // const url = '/@/WF/Comm/Search.vue?EnName=TS.FrmUI.SysEnumMain';
    // return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    // const userNo = WebUser.CCBPMRunModel === 2 ? WebUser.OrgNo + '_' + WebUser.No : WebUser.No;
    const gpnObj = new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, GloComm.UrlSearch('TS.FrmUI.SysEnumMain'));
    baseComp.value?.handleGPNCallback(gpnObj);
    // const enumUrl = '/@/WF/Comm/En.vue?EnName=TS.FrmUI.Setting&PKVal=' + userNo;
    // asyncComp.comp = markRaw(loadComponent(enumUrl));
    // asyncComp.params = getComponentParamsByUrl(enumUrl);
    // asyncComp.title = '枚举库维护';
    // asyncComp.visible = true;
  };
  const current = ref<number>(0);
  //下一步
  const next = async () => {
    switch (current.value) {
      case 0:
        if (currentParams?.PageNo == 'SelectedEnum') {
          if (selectCheck.value) {
            if (!tbValue.name || !tbValue.no) {
              message.info('请填写编号、名称信息');
              return;
            }
          } else {
            if (!tbValue.name || !tbValue.no || !tbValue.pTable) {
              message.info('请填写编号、名称、配置项信息');
              return;
            }
          }
        } else {
          // if (!tbValue.name || !tbValue.no) {
          //   message.info('请选择下方字典表.');
          //   return;
          // } else if (!selectCheck.value) {
          //   message.info('外键需要选择下方字典表');
          //   return;
          // }
        }
        const isPass = await saveEnum();
        if (isPass == false) return;
        current.value++;
        return;
    }
  };
  /**
   * 产生新外键
   */
  const changeNewFK = (frmID, no) => {
    try {
      // return;
      const handler = new HttpHandler('BP.CCFast.Handler_CCFast');
      handler.AddPara('MarkID', 'Main');
      handler.AddPara('DBModel', 'SFTable');
      handler.AddPara('Doc', 'SELECT No,Name FROM Port_Dept WHERE No=~@WebUser.DeptNo~');
      handler.AddPara('DoWay', 'SelfSQL');
      handler.AddPara('DBSrc', 'local');
      handler.AddPara('ObjModel', 'Frm');
      // handler.AddPara('PKVal', 'frmID_Tel'); //@llj, 这里需要表单字段的 MyPK.  Sys_MapAttr.MyPK
      handler.AddPara('PKVal', frmID + '_' + no); //@llj, 这里需要表单字段的 MyPK.  Sys_MapAttr.MyPK
      handler.DoMethodReturnString('GenerDBSrc_InitData');
    } catch (e: any) {
      message.error(e.toString());
      console.trace(e);
    }
  };

  /**
   * SearchEnum  枚举
   * 保存
   */
  const saveEnum = async () => {
    try {
      //第一步
      const frmID = currentParams?.FrmID;
      const groupID = currentParams?.GroupField;
      const ctrlType = currentParams.CtrlType; //控件类型，是下拉，或者单选.
      const enumName = tbValue.name; //输入框1
      const enumKey = tbValue.no; //输入框2

      if (currentParams?.PageNo == 'SelectedEnum') {
        let cfgVal = tbValue.pTable.trim(); //输入框3
        let enumMain = new SysEnumMain();
        if (!!selectCheck.value) {
          enumMain = new SysEnumMain(tb1Value.no);
          await enumMain.Retrieve();
          enumType.value = enumMain.EnumType;
        } else {
          //检查枚举值是否存在?
          if (WebUser.CCBPMRunModel == CCBPMRunModel.Single) enumMain.No = enumKey;
          else enumMain.No = WebUser.OrgNo + '_' + enumKey;
          enumMain.EnumKey = enumKey;
          if ((await enumMain.IsExits()) === true) {
            message.warning('枚举值已经存在' + enumKey);
            return false;
          }
          enumMain.Name = enumName;
          enumMain.OrgNo = WebUser.OrgNo;
          //替换非法变量.
          cfgVal = cfgVal.replaceAll('，', ',');
          cfgVal = cfgVal.replaceAll('＠', '@');
          cfgVal = cfgVal.replaceAll('＝', '=');
          //新建int枚举值. 要支持两种格式.标准格式: @0=团员@1=党员@2=群众,  一般格式:团员,党员,群众
          if (!cfgVal.includes(',') && !cfgVal.includes('@')) {
            return '多个枚举值使用 "," 或 "@" 符号分开.';
          }
          // 要先生成20个选项
          for (let index = 0; index < 20; index++) {
            enumMain.SetValByKey('Idx' + index, index);
          }
          // 普通格式
          if (cfgVal.indexOf('@') == -1) {
            // 转换格式
            const strs = cfgVal.split(',');
            strs.forEach((str, idx) => {
              enumMain.SetValByKey('Idx' + idx, idx);
              enumMain.SetValByKey('Val' + idx, str);
            });
            enumType.value = 0;
          } else {
            const enumTypeList: any = [];
            const list = splitAtString(cfgVal);
            let enumTypeK = 0;
            list.forEach((item, idx) => {
              const [key, val] = item.split('=');
              if (isConvertibleToNumber(key) == false) enumTypeK = 1;
              enumMain.SetValByKey('Idx' + idx, key);
              enumMain.SetValByKey('Val' + idx, val);
              enumTypeList.push(isIntType(key));
            });
            enumType.value = enumTypeK; //checkArr(enumTypeList);
          }
          if (enumType.value == undefined) {
            message.info('配置项填写有问题，请修改完重新提交');
            return false;
          }
          enumMain.EnumType = enumType.value || 0;
          enumMain.CfgVal = cfgVal;
          enumMain.SetPara('EnName', enumType.value === 0 ? 'TS.FrmUI.SysEnumMainInt' : 'TS.FrmUI.SysEnumMainString');
          try {
            await enumMain.Insert();
          } catch {
            await enumMain.Insert();
          }
          const i: any = await enumMain.SaveDtls(); //更新到 Sys_Enums 里面去。
          if (i <= 0) return;
        }
        // 第二步
        debugger;
        const fieldName = enumName; //输入框1
        const fieldNo = enumKey; //输入框2
        const keyOfEn = fieldNo; // window.prompt('请输入存储的字段名:', tb1);
        if (!keyOfEn) return;
        if (enumMain.EnumKey === '') enumMain.EnumKey = fieldNo;
        const mapAttr = new MapAttr();
        mapAttr.MyPK = frmID + '_' + fieldNo;
        if (await mapAttr.IsExits()) {
          message.info('字段在表单已经存在' + fieldNo);
          return;
        }
        mapAttr.Name = fieldName;
        mapAttr.KeyOfEn = fieldNo;
        mapAttr.FK_MapData = frmID;
        mapAttr.UIVisible = 1;
        mapAttr.UIIsEnable = 1;
        mapAttr.GroupID = groupID;
        mapAttr.DefVal = enumType.value == 0 ? 0 : '';
        mapAttr.LGType = 1; //枚举类型.
        mapAttr.MyDataType = ctrlType === '2' ? 1 : enumMain.EnumType === 0 ? 2 : 1; //int 类型.
        mapAttr.SetPara('RBShowModel', 3);
        mapAttr.UIContralType = parseInt(ctrlType) || UIContralType.DDL; //修改类型.
        mapAttr.UIBindKey = enumMain.EnumKey;
        await mapAttr.Insert();
      } else if (currentParams?.PageNo == 'SelectedDict') {
        const keyOfEn = enumKey; // window.prompt('请输入存储的字段名:', tb1);
        if (!keyOfEn) return;
        if (tb1Value.no === 'Blank') await SFTables.Init_Blank(); //预制数据.
        const sfTable = new SFTable();
        try {
          sfTable.No = tb1Value.no;
          // 实例化它.
          await sfTable.Retrieve();
        } catch {
          // sfTable.Name = enumName;
          // sfTable.No = enumKey;
          // sfTable.FK_SFDBSrc = 'local';
          // sfTable.DBSrcType = 'SysDict';
          // sfTable.DBType = 0;
          // sfTable.FK_Val = sfTable.No;
          // sfTable.CodeStruct = 0; //字典结构类型.0=编号名称，1=树结构.
          // if (sfTable.CodeStruct == 0) sfTable.SetPara('EnName', 'TS.FrmUI.SFTableNoName');
          // await sfTable.Insert();

          const mapAttr = new MapAttr();
          mapAttr.MyPK = frmID + '_' + enumKey;
          if ((await mapAttr.IsExits()) == true) {
            message.error('字段在表单已经存在' + enumKey);
            return false;
          }
          //名称.
          mapAttr.Name = enumName;
          mapAttr.KeyOfEn = enumKey;
          mapAttr.FK_MapData = frmID;
          mapAttr.UIVisible = 1;
          mapAttr.UIIsEnable = 1;
          mapAttr.GroupID = groupID;
          mapAttr.LGType = 0; //普通类型.
          mapAttr.MyDataType = 1; //String类型.
          mapAttr.UIContralType = UIContralType.DDL; //下拉框.
          mapAttr.UIBindKey = 'CommGenerDBSrc'; //绑定的值.
          await mapAttr.Insert();
          //插入影子字段.
          mapAttr.UIVisible = 0;
          mapAttr.MyPK = frmID + '_' + enumKey + 'T';
          mapAttr.KeyOfEn = enumKey + 'T';
          mapAttr.Name = mapAttr.Name + 'T';
          mapAttr.UIContralType = UIContralType.TB;
          await mapAttr.Insert();

          changeNewFK(currentParams?.FrmID, tb1Value.no);
          return;
        }
        const mapAttr = new MapAttr();
        mapAttr.MyPK = frmID + '_' + enumKey;
        if ((await mapAttr.IsExits()) == true) {
          message.error('字段在表单已经存在' + enumKey);
          return false;
        }
        //名称.
        if (!enumName) mapAttr.Name = sfTable.Name;
        else mapAttr.Name = enumName;
        mapAttr.KeyOfEn = enumKey;
        mapAttr.FK_MapData = frmID;
        mapAttr.UIVisible = 1;
        mapAttr.UIIsEnable = 1;
        mapAttr.GroupID = groupID;
        mapAttr.LGType = 0; //普通类型.
        mapAttr.MyDataType = 1; //String类型.
        mapAttr.UIContralType = UIContralType.DDL; //下拉框.
        mapAttr.UIBindKey = sfTable.No; //绑定的值.
        mapAttr.SetPara('SrcType', sfTable.DBSrcType);
        await mapAttr.Insert();
        // const mypk = mapAttr.MyPK;
        //插入影子字段.
        mapAttr.UIVisible = 0;
        mapAttr.MyPK = frmID + '_' + enumKey + 'T';
        mapAttr.KeyOfEn = enumKey + 'T';
        mapAttr.Name = mapAttr.Name + 'T';
        mapAttr.UIContralType = UIContralType.TB;
        await mapAttr.Insert();
      }
    } catch (e: any) {
      message.error(e.toString());
      console.trace(e);
    }
  };

  /**
   * 校验枚举key类型
   * @param str
   */
  const isIntType = (str) => {
    if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(str)) {
      return 0;
    } else {
      return 1;
    }
  };

  /**
   * 校验枚举key
   * @param arr
   */

  function checkArr(arr: any) {
    // 检查数组是否为空
    if (!arr || arr.length === 0) {
      return undefined;
    }
    // 检查数组中是否全为0
    const allZero = arr.every((item) => item === 0);
    if (allZero) {
      return 0;
    }
    // 检查数组中是否全为1
    const allOne = arr.every((item) => item === 1);
    if (allOne) {
      return 1;
    }
    // 既有0又有1的情况
    return undefined;
  }

  //重置
  const reloadData = () => {
    tbValue.no = '';
    tbValue.name = '';
    tbValue.pTable = '';
    tb1Value.no = '';
    tb1Value.name = '';
    SelectValCont.value = '';
    InitPage();
  };

  //完成
  const completed = async () => {
    if (typeof props.closePage === 'function') await props.closePage();
  };

  //步骤处理
  const steps = [
    {
      title: '第一步',
      content: 'First-content',
    },
    {
      title: '完成',
      content: 'Last-content',
    },
  ];
  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  //帮助展开关闭处理
  const isEnumShowHelp = ref(true);
  const changeShowHelp = (EnumHelp: boolean) => {
    isEnumShowHelp.value = EnumHelp;
  };

  //拼音生成
  const tbValue = reactive({ prefix: '', name: '', no: '', pTable: '' });
  const { pinyinMode, generatePinyin, changePinyin } = usePinYinGenerator();
  //选中使用
  const tb1Value = reactive({ prefix: '', name: '', no: '', pTable: '' });
  //end

  //模糊查询
  const searchData = computed(() => {
    return dataOptions.value.filter((item) => item.Name.includes(tbValue.name));
  });
  watch(
    () => tbValue,
    (newVal) => {
      debugger;
      if (newVal.name === '') {
        SelectValCont.value = '';
      } else {
        tb1Value.name = newVal?.name;
        tb1Value.no = newVal?.no;
      }
    },
    {
      deep: true, // 深度监听对象内部属性的变化
    },
  );
  // 是否选中
  const selectCheck = ref(false);

  //选中值显示
  const SelectValCont = ref('');
  //选中
  const selectOne = (val) => {
    tbValue.name = val?.Name;
    let no: string = val?.No || '';

    no = no.startsWith(WebUser.OrgNo + '_') ? no.replace(WebUser.OrgNo + '_', '') : no;
    tbValue.no = no;

    tb1Value.name = val?.Name;
    tb1Value.no = val?.No;

    SelectValCont.value = val?.Name;
    selectCheck.value = true;
    isReadonly.value = true;
  };

  //初始化
  const InitPage = async () => {
    try {
      isReadonly.value = false;
      //枚举sql
      let sql = GloWF.SQLEnumMain;
      if (currentParams?.PageNo == 'SelectedEnum') {
        const paras = '@' + GetParamsUrl(currentParams).replaceAll('&', '@').replaceAll('.', '[。]');
        const listSql = sql + paras;
        dataOptions.value = await getDBSource(listSql, 'local');
      } else if (currentParams?.PageNo == 'SelectedDict') {
        sql = GloWF.SQLSFTable;
        const paras = '@' + GetParamsUrl(currentParams).replaceAll('&', '@').replaceAll('.', '[。]');
        const listSql = sql + paras;

        dataOptions.value = await getDBSource(listSql, 'local');
        if (dataOptions.value.filter((item) => item.No === 'Blank').length == 0) dataOptions.value = [{ No: 'Blank', Name: '空白(系统内置)' }, ...dataOptions.value];
      }
    } catch (e: any) {
      message.error(e.toString());
    }
  };
  InitPage();
  //右侧帮助
  const selectedEnum = `
  #### 帮助
  - int类型
 - 填写格式1: 团员,党员,群众
  - 系统解析为: 0是团员， 1是党员，2是群众.
  - 填写格式2: @0=团员@1=党员@2=群众
  - 系统解析为: 0是团员， 1是党员，2是群众，这样就可以自己定义枚举值.
 - string类型
  - 填写格式2: @ty=团员@dy=党员@qz=群众
  - 系统解析为: ty是团员， dy是党员，qz是群众.
  #### 数据存储
  - int类型的枚举值是常用的数据类型，ccfrom是格式化的存储到数据表里.
  - 创建一个int类型或者string类型的字段，用于存储枚举的数据.
    `;
  const selectedDict = `
  #### 帮助
  - 请选择一个外键字典表，如果没有请在数据源创建一个字典表.
  - 创建外键字段,必须选定外键的字典表.
  - 列出来的都是无参数的字典.

  #### 关于外键字典表
  - 具有编码，名称数据我们称为字典表，比如：片区、省份、税种、税目、部门.
  - 创建外键字典表必须依托一个数据源.
  - 从其他系统获得的数据, 
  - 外键字典表可以链接到

  #### 两种格式数据格式
  - 编号名称格式: 比如片区、省份.
  - 树结构模式: 比如部门、产品目录树.

  `;
</script>
<style scoped lang="less">
  .content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: white;
    overflow: hidden;

    .step-form-card {
      display: flex;
      justify-content: flex-start;
      background-color: #f2f5f7;
      height: 100%;
      border-radius: 0 0 8px 8px;
      overflow: hidden;

      :deep(.ant-result-icon > span) {
        color: var(--system-bg-color);
      }

      .form-main {
        flex: 1;
        display: flex;
        justify-content: flex-start;
        background-color: #e3e3e3;
        overflow: hidden;

        .content-area {
          background-color: white;
          flex-grow: 1;
          flex-shrink: 1;
          min-width: 480px;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          padding: 0;
          border-right: 1px solid #e6e9ed;

          .form-title {
            padding: 12px 24px;
            border-bottom: 1px solid #e6e9ed;
            background-color: #f8f9fa;
            font-size: 16px;
            font-weight: 500;
            color: #606060;
            margin: 0;
            flex-shrink: 0;
          }
          .custom {
            width: 100%;
            padding: 20px 24px;
            flex-grow: 1;
            overflow-y: auto;
            box-sizing: border-box;

            .ant-input-group-wrapper {
              margin-top: 6px;
              margin-bottom: 6px;
            }
            :deep(.ant-input-group-addon) {
              min-width: 80px;
              text-align: left;
            }
          }
          .form-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 24px;
            border-top: 1px solid #e6e9ed;
            background-color: #f8f9fa;
            flex-shrink: 0;

            :deep(.ant-btn) {
              border-radius: 4px;
            }
            .btn-default {
              margin-right: 8px;
            }
            .btn-active {
              background-color: var(--system-bg-color);
              color: white;
              border-color: var(--system-bg-color);
            }
            & > div:last-child {
              display: flex;
              align-items: center;
            }
          }
        }

        .inner-help-docs {
          background-color: white;
          flex-basis: 400px;
          flex-shrink: 0;
          max-width: 45%;
          overflow-y: auto;
          padding: 20px;
          box-sizing: border-box;

          :deep(.vuepress-markdown-body) {
            font-size: 13px;
            line-height: 1.6;
          }
        }
      }
    }
  }
  .input-box {
    background-color: #f2f5f7;
    padding: 24px;
  }
  .enum-cont {
    margin-top: 10px;
    height: 225px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .sql-cont {
    margin-top: 10px;
    height: 225px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .gutter-box {
    padding: 5px 0;
    border: 1px solid #d9d9d9;
    text-align: center;
    cursor: pointer;
    &:hover {
      background-color: #c1c1c1;
      color: #f2f5f7;
    }
  }
  .select-val-cont {
    color: #999;
    border: 1px solid #999;
    padding: 5px;
    border-radius: 5px;
  }

  @media (max-width: 900px) {
    .content .step-form-card .form-main {
      flex-direction: column;
    }
    .content .step-form-card .form-main .content-area {
      min-width: 100%;
      margin-right: 0;
      border-right: none;
      border-bottom: 1px solid #e6e9ed;
      max-height: 60vh;
      flex-basis: auto;
      flex-shrink: 1;
      padding: 0;
    }
    .content .step-form-card .form-main .content-area .form-title {
      padding: 12px 16px;
    }
    .content .step-form-card .form-main .content-area .custom {
      padding: 16px;
    }
    .content .step-form-card .form-main .content-area .form-footer {
      padding: 12px 16px;
    }

    .content .step-form-card .form-main .inner-help-docs {
      flex-basis: auto;
      max-width: 100%;
      max-height: 35vh;
      flex-shrink: 1;
      padding: 16px;
    }
  }

  @media (max-width: 576px) {
    .gpn-input-item {
      flex-direction: column;
      align-items: stretch;
      margin-bottom: 12px;
    }
    .gpn-input-item .label {
      width: 100%;
      text-align: left;
      margin-right: 0;
      margin-bottom: 4px;
      padding: 0;
      line-height: 1.5;
      padding-top: 0;
    }
    .header {
      flex-direction: column;
      align-items: stretch;
    }
    .header .title {
      width: 100%;
      margin-bottom: 8px;
      text-align: left;
    }
    .select-src {
      flex-direction: column;
      align-items: stretch;
    }
    .select-src .title {
      width: 100%;
      margin-bottom: 8px;
      text-align: left;
    }
  }
</style>
