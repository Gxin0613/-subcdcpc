<template>
  <div style="background-color: white; padding: 5px 10px">
    <Spin :spinning="loading">
      <!-- 弃用----start -->
      <div v-if="props.params.enable != false" class="block">
        <Row>
          <Col :span="22">
            <div id="RB_IsEnableJS" style="display: flex; flex-direction: row; align-items: center">
              <div class="title">
                <span>{{ '是否启用' }}</span>
                <Tooltip>
                  <template #title>{{'禁用当前的配置就不生效'}}</template>
                  <ExclamationCircleOutlined class="alert" />
                </Tooltip>
              </div>
              <RadioGroup id="RB_IsEnableJS" v-model:value="RB_IsEnableJS">
                <Radio value="1">{{'启用'}}</Radio>
                <Radio value="0">{{'禁用'}}</Radio>
              </RadioGroup>
            </div>
          </Col>
          <Col :span="2" style="justify-content: flex-end; display: flex">
            <Button @click="Save" id="Save" type="primary">{{'保存'}}</Button>
          </Col>
        </Row>
      </div>
      <!-- 弃用----end -->
      <div style="margin-top: 20px; margin-bottom: 20px">
        <!-- style="display: flex; flex-direction: row; align-items: center" -->
        <div>
          <div class="title">{{'列表值'}}</div>
          <div id="listValues">
            <RadioGroup id="listValues" :value="listValues" @change="(v) => changeListValues(v)" :title="'列表值'" class="listStyle">
              <Radio v-for="item in initData.Sys_FrmRB" :key="item.MyPK" :value="item.IntKey.toString()">{{ item.Lab }}</Radio>
            </RadioGroup>
          </div>
        </div>
      </div>
      <Tabs v-model:activeKey="activeTab">
        <TabPane key="1" :tab="'属性值'" />
        <TabPane key="2" :tab="'从表'" />
        <TabPane key="3" :tab="'附件'" />
<!--        <TabPane key="4" :tab="'高级设置'" />-->
      </Tabs>
      <div class="block" v-if="Array.isArray(dataSource) && dataSource.length > 0 && activeTab == '1'">
        <div class="title line">
          <span>联动其他的控件使其属性该表(可见，只读)</span>
          <Tooltip>
            <template #title>注意:被联动的控件在经典表单模式下要占三行</template>
            <ExclamationCircleOutlined class="alert" />
          </Tooltip>
        </div>
        <BasicTable @register="registerTableData">
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'name'">
              <Tooltip :title="text">
              {{ text }}
              </Tooltip>
            </template>
            <template v-if="column.dataIndex === 'FieldsCfg'">
              <RadioGroup v-model:value="record.FieldsCfg">
                <Radio value="0">{{'不设置'}}</Radio>
                <Radio value="1">{{'可用'}}</Radio>
                <Radio value="2">{{'可用且必填'}}</Radio>
                <Radio value="3">{{'可见'}}</Radio>
                <Radio value="5">{{'可见且必填'}}</Radio>
                <Radio value="4">{{'不可见'}}</Radio>
              </RadioGroup>
            </template>
            <template v-else-if="column.dataIndex === 'SetVal'">
              <template v-if="record.type == 'Select'">
                <Select class="select" :options="record.Enum" v-model:value="record.SetVal" />
              </template>
              <template v-else-if="record.type == 'SelectMultiple'">
                <Select class="select" :options="record.Enum" v-model:value="record.SetVal" mode="multiple" />
              </template>
              <template v-else-if="record.type == 'dateTime'">
                <DatePicker class="select" show-time v-model:value="record.SetVal" valueFormat="YYYY-MM-DD HH:mm:ss" format="YYYY-MM-DD HH:mm:ss" :placeholder="'请选择日期时间'" />
              </template>
              <template v-else-if="record.type == 'Date'">
                <DatePicker class="select" v-model:value="record.SetVal" valueFormat="YYYY-MM-DD" format="YYYY-MM-DD" :placeholder="'请选择日期'" />
              </template>
              <template v-else>
                <Input v-model:value="record.SetVal" />
              </template>
            </template>
          </template>
        </BasicTable>
      </div>
      <div class="block" v-if="Array.isArray(mapDtlDataSource) && mapDtlDataSource.length > 0 && activeTab == '2'">
        <div class="title line">
          <span>联动从表控件使其属性该表(可见)</span>
        </div>
        <BasicTable @register="registerTableMapDtl">
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'FieldsCfg'">
              <RadioGroup v-model:value="record.FieldsCfg">
                <Radio value="0">{{'不设置'}}</Radio>
<!--                <Radio value="1">{{'可用'}}</Radio>-->
<!--                <Radio value="2">{{'可用且必填'}}</Radio>-->
                <Radio value="3">{{'可见'}}</Radio>
                <Radio value="4">{{'不可见'}}</Radio>
              </RadioGroup>
            </template>
          </template>
        </BasicTable>
      </div>
      <div class="block" v-if="Array.isArray(frmDataSource) && frmDataSource.length > 0 && activeTab == '3'">
        <div class="title line">
          <span>联动附件控件使其属性该表(可见)</span>
        </div>
        <BasicTable @register="registerTablFrm">
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'FieldsCfg'">
              <RadioGroup v-model:value="record.FieldsCfg">
                <Radio value="0">{{'不设置'}}</Radio>
<!--                <Radio value="1">{{'可用'}}</Radio>-->
                <Radio value="2">{{'可见且必填'}}</Radio>
                <Radio value="3">{{'可见'}}</Radio>
                <Radio value="4">{{'不可见'}}</Radio>
              </RadioGroup>
            </template>
          </template>
        </BasicTable>
      </div>
<!--      <div class="block" v-if="activeTab == '4'">
        <div class="title line">
          <span>{{'高级设置'}}</span>
          <Tooltip>
            <template #title>需要为每个选择项设置显示与隐藏的内容，设置js,top的提示信息.</template>
            <ExclamationCircleOutlined class="alert" />
          </Tooltip>
        </div>
        <div style="margin-left: 20px">{{'JS脚本'}}<Textarea v-model:value="Script" :rows="4" :autoSize="{ minRows: 3 }" />{{'提示信息'}}<Textarea v-model:value="Tip" :rows="4" :autoSize="{ minRows: 3 }" />
        </div>
      </div>-->
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { ref, unref } from 'vue';
  import { onMounted } from 'vue';
  import { MapAttr } from '../MapAttrs/MapAttr';
  import { Button, Radio, RadioGroup, Input, message, Select, Textarea, Tooltip, Row, Col, Spin, TabPane, Tabs, DatePicker } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import type { SelectProps } from 'ant-design-vue';
  import { reactive } from 'vue';
  import HttpHandler from '../../FoolFormDesigner/dto/HttpHandler';
  import Entities from '../../FoolFormDesigner/dto/Entities';
  import { useTable, BasicTable, BasicColumn } from '/@/components/Table';
  import BSEntity from '/@/utils/gener/BSEntity';
  import WebUser from '/@/bp/web/WebUser';
  import BSEntities from '/@/utils/gener/BSEntities';
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  //系统字段，不需要编辑
  const expStrs = 'AtPara,FID,OID,Title,MyNum,FK_NY,Emps,RDT,EDT,CDT,Rec,';
  const PageData = ref({
    FK_MapData: '',
    KeyOfEn: '',
    SelectIntKey: '',
    MyPK: '',
  }); //当前页面信息
  const RB_IsEnableJS = ref<string>(); //最上方的启用开关
  const listValues = ref<string>('-1'); //列表值的radio
  const initData = reactive({
    Sys_FrmRB: <Recordable>[],
    MapDtls: <any>[],
    FrmAttachments: <any>[],
    Sys_GroupFields: <any>[],
    Sys_MapAttr: <any>[],
    });
  const activeTab = ref<string>('1');
  const loading = ref(false);
  const Script = ref<string>(''); //脚本信息
  const Tip = ref<string>(''); //提示信息
  const dataSource = ref<Recordable[]>([]); //表单配置
  const mapDtlDataSource = ref(<any>[]); //从表配置
  const frmDataSource = ref(<any>[]); //附件配置
  const columns = ref([
    { title: '字段', dataIndex: 'name', align: 'center', width: 100 ,ellipsis: true,fixed:'left'},
    {
      title: '设置',
      dataIndex: 'FieldsCfg',
      align: 'center',
      width:450,
    },
    {
      title: '设置值',
      dataIndex: 'SetVal',
      align: 'center',
      width: 200,
    },
  ]);
  const mapDtlColumns = ref([
    { title: '字段', dataIndex: 'name', align: 'center' },
    {
      title: '设置',
      dataIndex: 'FieldsCfg',
      align: 'center',
    },
  ]);
  //更新列表值
  const changeListValues = (v) => {
    SaveCurrentConfig();
    listValues.value = v.target.value;
    BindFormCfg();
    BindMapDtl();
    BindfrmData();
    BindJSorTip();
  };
  const InitPage = async () => {
    loading.value = true;
    activeTab.value = '1';
    console.log(props.params);

    PageData.value = {
      FK_MapData: props.params.PKVal.split('_')[0],
      KeyOfEn: props.params.PKVal.split('_')[0],
      SelectIntKey: '',
      MyPK: props.params.PKVal,
    };
    if (PageData.value.SelectIntKey == '') PageData.value.SelectIntKey = '-1';

    //获取字段属性.用于判断最开始的是否开启
    const attr = new MapAttr();
    attr.MyPK = PageData.value.MyPK;
    await attr.Retrieve();
    if (attr.AtPara.indexOf('@IsEnableJS=1') >= 0) {
      RB_IsEnableJS.value = '1';
    } else {
      RB_IsEnableJS.value = '0';
    }

    //获得的数据.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner_MapExt');
    handler.AddPara('FK_MapData', attr.FK_MapData);
    handler.AddPara('KeyOfEn', attr.KeyOfEn);
    handler.AddPara('RefNo', attr.MyPK);
    const data = await handler.DoMethodReturnJson<Recordable>('RadioBtns_Init');
    //列表值
    initData.Sys_FrmRB = data.Sys_FrmRB;
    //表单控件
    initData.Sys_MapAttr = data.Sys_MapAttr;
    //从表
    initData.MapDtls = data.MapDtls;
    //附件
    initData.FrmAttachments = data.FrmAttachments;
    //分组信息
    initData.Sys_GroupFields = data.Sys_GroupFields;

    // console.log('关联属性列表', initData);
    loading.value = false;
  };
  const BindFormCfg = async () => {
    try {
    loading.value = true;
    dataSource.value = [];
    let frmRB = initData.Sys_FrmRB.filter(item=>item.IntKey.toString() ===listValues.value)[0];
    const FieldsCfgs = (frmRB?.FieldsCfg ||'').split('@'); //获取当前listValue对应的表单设置
    FieldsCfgs?.shift();
    const SetVals = (frmRB?.SetVal || '').split('@'); //获取当前listValue对应的表单设置值
    SetVals.shift();
    // initData.Sys_MapAttr.forEach(async (item: any) => {
    for (const item of initData.Sys_MapAttr) {
      //|| ((item.UIContralType > 3 && item.UIContralType != 6 ))
      if (expStrs.indexOf(item.KeyOfEn) >= 0 || item.UIVisible == 0) continue;
      //设置的值.
      if ((item.MyDataType == '2' && item.LGType == '1' && item.UIContralType == 1) || 
          (item.MyDataType == '2' && item.LGType == '1' && item.UIContralType == 3)) {
        //枚举单选和枚举下拉
        const ses = new Entities('BP.Sys.SysEnums');
        if (WebUser.CCBPMRunModel == 2)
          await ses.Retrieve('EnumKey', item.UIBindKey, 'OrgNo', WebUser.No);
        else
          await ses.Retrieve('EnumKey', item.UIBindKey);

        const selecEnum = ref(<SelectProps['options']>[]);
        ses['data'].forEach((i: any) => {
          selecEnum.value?.push({
            label: i.Lab,
            value: `${i.IntKey}`,
          });
        });
        dataSource.value.push({
          name: item.Name,
          dataIndex: item.KeyOfEn,
          FieldsCfg: FieldsCfgs.filter((i: string) => i.split('=')[0] == item.KeyOfEn)[0]?.split('=')[1] || '0',
          type: 'Select',
          SetVal: SetVals.filter((i: string) => i.split('=')[0] == item.KeyOfEn)[0]?.split('=')[1] || '',
          Enum: selecEnum,
        });
      } else if (item.MyDataType == '1' && item.LGType == '1' && item.UIContralType == 2) {
        //枚举多选
        const ses = new BSEntities('BP.Sys.SysEnums');
        if (WebUser.CCBPMRunModel == 2)
          await ses.Retrieve('EnumKey', item.UIBindKey, 'OrgNo', WebUser.No);
        else
          await ses.Retrieve('EnumKey', item.UIBindKey);
    
        await ses.Retrieve('EnumKey', item.UIBindKey);
        const selecEnum = ref(<SelectProps['options']>[]);
        ses['data'].forEach((i: any) => {
          selecEnum.value?.push({
            label: i.Lab,
            value: `${i.IntKey}`,
          });
        });
        dataSource.value.push({
          name: item.Name,
          dataIndex: item.KeyOfEn,
          FieldsCfg: FieldsCfgs.filter((i: string) => i.split('=')[0] == item.KeyOfEn)[0]?.split('=')[1] || '0',
          type: 'SelectMultiple',
          SetVal: SetVals.filter((i: string) => i.split('=')[0] == item.KeyOfEn)[0]
            ?.split('=')[1]
            .split(','),
          Enum: selecEnum,
        });
      } else if (item.LGType == '0' && item.MyDataType == '1' && item.UIContralType == 1) {
        //外键下拉
        const en = new BSEntity('BP.Sys.SFTable', item.UIBindKey);
        en.No = item.UIBindKey;
        await en.Init();
        await en.Retrieve();
        const ens = await en.DoMethodReturnJSON('GenerDataOfJson');
        const selecEnum = ref(<SelectProps['options']>[]);
        ens.forEach((i: any) => {
          selecEnum.value?.push({
            label: i.Name,
            value: `${i.No}`,
          });
        });
        dataSource.value.push({
          name: item.Name,
          dataIndex: item.KeyOfEn,
          // FieldsCfg: '0',
          FieldsCfg: FieldsCfgs.filter((i: string) => i.split('=')[0] == item.KeyOfEn)[0]?.split('=')[1] || '0',
          type: 'Select',
          SetVal: SetVals.filter((i: string) => i.split('=')[0] == item.KeyOfEn)[0]?.split('=')[1] || '',
          Enum: selecEnum,
        });
      } else if (item.MyDataType == '7') {
        dataSource.value.push({
          name: item.Name,
          dataIndex: item.KeyOfEn,
          FieldsCfg: FieldsCfgs.filter((i: string) => i.split('=')[0] == item.KeyOfEn)[0]?.split('=')[1] || '0',
          type: 'dateTime',
          SetVal: SetVals.filter((i: string) => i.split('=')[0] == item.KeyOfEn)[0]?.split('=')[1] || '',
        });
      } else if (item.MyDataType == '6') {
        dataSource.value.push({
          name: item.Name,
          dataIndex: item.KeyOfEn,
          FieldsCfg: FieldsCfgs.filter((i: string) => i.split('=')[0] == item.KeyOfEn)[0]?.split('=')[1] || '0',
          type: 'Date',
          SetVal: SetVals.filter((i: string) => i.split('=')[0] == item.KeyOfEn)[0]?.split('=')[1] || '',
        });
      } else {
        dataSource.value.push({
          name: item.Name,
          dataIndex: item.KeyOfEn,
          FieldsCfg: FieldsCfgs.filter((i: string) => i.split('=')[0] == item.KeyOfEn)[0]?.split('=')[1] || '0',
          SetVal: SetVals.filter((i: string) => i.split('=')[0] == item.KeyOfEn)[0]?.split('=')[1] || '',
        });
      }
    }
    } catch (e:any) {
      console.trace(e.toString());
      message.error(e.toString());
    } finally {
      loading.value = false;
    }
    // });
     console.log('表单数据', dataSource.value);
  };
  //绑定从表信息
  const BindMapDtl = () => {
    mapDtlDataSource.value.length = 0;
    const FieldsCfgs = (initData.Sys_FrmRB.filter(item=>item.IntKey ===listValues.value)?.[0]?.FieldsCfg || '').split('@'); //获取当前listValue对应的表单设置
    FieldsCfgs?.shift();
    initData.MapDtls.forEach((item: { Name: string; No: string }) => {
      mapDtlDataSource.value.push({
        name: item.Name,
        dataIndex: item.No,
        FieldsCfg: FieldsCfgs?.filter((i: string) => i.split('=')[0] == item.No)[0]?.split('=')[1] || '0',
      });
    });
  };
  //绑定附件控件信息
  const BindfrmData = () => {
    const FieldsCfgs = (initData.Sys_FrmRB.filter(item=>item.IntKey ===listValues.value)?.[0]?.FieldsCfg || '').split('@'); //获取当前listValue对应的表单设置
    FieldsCfgs?.shift();
    frmDataSource.value.length = 0;
    initData.FrmAttachments.forEach(item => {
      if(parseInt(item.IsVisable) !=0)
        frmDataSource.value.push({
          name: item.Name,
          dataIndex: item.MyPK,
          FieldsCfg: FieldsCfgs?.filter((i: string) => i.split('=')[0] == item.MyPK)[0]?.split('=')[1] || '0',
        });
    });
  };
  //绑定提示信息和脚本
  const BindJSorTip = () => {
    Script.value = initData.Sys_FrmRB.filter(item=>item.IntKey ===listValues.value)?.[0]?.Script;
    Tip.value = initData.Sys_FrmRB.filter(item=>item.IntKey ===listValues.value)?.[0]?.Tip;
  };
  //保存当前选项的列表值
  const SaveCurrentConfig = () => {
    let FieldsCfg = '';
    let SetVal = '';
    dataSource.value.forEach((item) => {
      if (item.FieldsCfg != '0') FieldsCfg = FieldsCfg + `@${item.dataIndex}=${item.FieldsCfg}`;
    });
    mapDtlDataSource.value.forEach((item) => {
      if (item.FieldsCfg != '0') FieldsCfg = FieldsCfg + `@${item.dataIndex}=${item.FieldsCfg}`;
    });
    frmDataSource.value.forEach((item) => {
      if (item.FieldsCfg != '0') FieldsCfg = FieldsCfg + `@${item.dataIndex}=${item.FieldsCfg}`;
    });
    dataSource.value.forEach((item) => {
      if (item.SetVal) SetVal = SetVal + `@${item.dataIndex}=${item.SetVal}`;
    });
    initData.Sys_FrmRB.forEach(item=>{
      if(item.IntKey === listValues.value){
        item.FieldsCfg = FieldsCfg;
        item.SetVal = SetVal;
        item.Script = Script.value;
        item.Tip = Tip.value;
      }
    })
    //initData.Sys_FrmRB[Number(listValues.value) + 1].FieldsCfg = FieldsCfg;
    //initData.Sys_FrmRB[Number(listValues.value) + 1].SetVal = SetVal;
    // console.log('更新列表值', Script);

    //initData.Sys_FrmRB[Number(listValues.value) + 1].Script = Script.value;
    //initData.Sys_FrmRB[Number(listValues.value) + 1].Tip = Tip.value;
  };
  //执行保存
  const Save = async () => {
    // console.log('表格里的', dataSource.value);
    try {
      SaveCurrentConfig();
      await SaveEnableJS();
      const pData = unref(PageData);
      let handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner_MapExt');
      handler.AddPara('data', JSON.stringify(initData.Sys_FrmRB));
      handler.AddPara('FK_MapData', pData.FK_MapData);
      handler.AddPara('FK_MapExt', pData.MyPK);
      handler.AddPara('KeyOfEn', pData.KeyOfEn);
      const msg = await handler.DoMethodReturnString('RadioBtns_Save');
      message.success('保存成功');
    } catch (e) {
      message.error(`保存失败，错误信息：${e}`);
      return;
    }

    return;
  };

  //设置是否启用
  const SaveEnableJS = async () => {
    const attr = new MapAttr();
    attr.MyPK = PageData.value.MyPK;
    await attr.Retrieve();
    if (attr.AtPara.indexOf('@IsEnableJS') < 0) {
      attr.AtPara = attr.AtPara + `@IsEnableJS=1`;
    } else {
      const length = attr.AtPara.length;
      const start = attr.AtPara.indexOf('@IsEnableJS');
      const old = attr.AtPara.substring(start, length);
      attr.AtPara = attr.AtPara.replace(old, `@IsEnableJS=${RB_IsEnableJS.value}`);
    }
    await attr.Update();
  };
  const [registerTableData] = useTable({
    title: '',
    rowKey: (row) => row.name,
    showIndexColumn: true,
    dataSource: dataSource,
    columns: columns.value as BasicColumn[],
    bordered: true,
    pagination: false,
    canResize: false,
    ellipsis:false,
  });

  const [registerTableMapDtl] = useTable({
    title: '',
    rowKey: (row) => row.name,
    showIndexColumn: true,
    dataSource: mapDtlDataSource,
    columns: mapDtlColumns.value as BasicColumn[],
    bordered: true,
    pagination: false,
    canResize: false,
  });
  const [registerTablFrm] = useTable({
    title: '',
    rowKey: (row) => row.name,
    showIndexColumn: true,
    dataSource: frmDataSource,
    columns: mapDtlColumns.value as BasicColumn[],
    bordered: true,
    pagination: false,
    canResize: false,
  });
  defineExpose({ Save });
  onMounted(async () => {
    await InitPage();
    BindFormCfg(); //获取表单设置
    BindJSorTip(); //脚本和提示
    BindMapDtl(); //从表
    BindfrmData(); //附件控件
  });
</script>
<style lang="less" .scoped>
  .ant-radio-group {
    flex-direction: row !important;

  }
  .select {
    width: 100% !important;
  }
  .block {
    margin-left: 5px;
    margin-top: 20px;
    margin-bottom: 20px;
    .title {
      line-height: 32px;
    }
    .line {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
  }
  .listStyle {
    // flex-direction: column !important;
    flex-direction: row !important;
    flex-wrap: wrap;
  }
</style>
<style lang="css">
  [v-cloak] {
    display: none !important;
  }
</style>
