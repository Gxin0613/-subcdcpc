<template>
  <div>
    <Card ref="tableCardWrapper" class="card-of-table">
      <Table :columns="columns" :dataSource="tableData" bordered size="small" :scroll="{ x: 1000 }" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'Oper' && !!record['KeyOfEn']">
            <Button type="link" @click="AppFieldData(record['KeyOfEn'])"><RedoOutlined />{{ '应用' }}</Button>
          </template>
        </template>
      </Table>
    </Card>
  </div>
</template>

<script lang="ts" setup>
  import { ref, h, shallowRef, onMounted, onUnmounted } from 'vue';
  import { Table, Button, message, Card } from 'ant-design-vue';
  import { RedoOutlined } from '@ant-design/icons-vue';
  import BSEntities from '/@/utils/gener/BSEntities';
  import { MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
  import BSEntity from '/@/utils/gener/BSEntity';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { debounce } from 'lodash';

  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });
  const tableCardWrapper = shallowRef<InstanceType<typeof Card>>();
  const dynamicHeight = ref(500);
  //字段列集合
  const columns = ref<Record<string, any>[]>([]);
  //数据集合
  const tableData = ref<Record<string, string>[]>([]);

  /**
   * 初始化数据
   * @constructor
   */
  const InitPage = async () => {
    delete props.params['workID'];
    tableData.value = [];
    columns.value = [];
    //查询出来版本.
    const vers = new BSEntities('BP.Sys.EnVers');
    await vers.Retrieve('FrmID', props.params.FrmID, 'EnPKValue', props.params.WorkID, 'EnVer');

    //所有的快照数据.
    const verDtls = new BSEntities('BP.Sys.EnVerDtls');
    await verDtls.Retrieve('FrmID', props.params.FrmID, 'EnPKValue', props.params.WorkID);

    //所有的字段.
    const mapAttrs = new MapAttrs();
    await mapAttrs.Retrieve('FK_MapData', props.params.FrmID);

    //当前版本的数据
    const frmEn = new BSEntity(props.params.FrmID, props.params.WorkID);
    await frmEn.Init();
    //初始化列column
    InitColumn(vers);
    //初始化数据
    InitData(vers, verDtls, mapAttrs, frmEn);
  };
  //初始化列集合
  const InitColumn = (vers) => {
    columns.value.push({
      title: '#',
      dataIndex: 'Idx',
      key: 'Idx',
      width: 50,
      customRender: ({ index }) => {
        return index + 1;
      },
    });
    columns.value.push({
      title: '字段',
      dataIndex: 'KeyOfEn',
      key: 'KeyOfEn',
      width: 100,
    });
    columns.value.push({
      title: '名称',
      dataIndex: 'Name',
      key: 'Name',
      width: 150,
    });
    //版本
    //<div>日期:{ver['RDT']}</div><div>拍照人编号:{ver['RecNo']</div><div>拍照人名称:{ver.RecName}</div><div>备注:{ver.MyNote}</div><div>删除快照</div><div>还原到此位置</div>
    vers.data.forEach((ver) => {
      columns.value.push({
        title: '#' + ver.EnVer,
        dataIndex: ver.EnVer,
        key: ver.EnVer,
        width: 240,
        customRender: ({ text, record }: Recordable) => {
          if (record['KeyOfEn'] === '') {
            const ver = JSON.parse(text);
            return h('div', {}, [
              h('div', {
                innerHTML: '#' + ver['EnVer'],
              }),
              h('div', {
                innerHTML: '日期:' + ver['RDT'],
              }),
              h('div', {
                innerHTML: '拍照人编号:' + ver['RecNo'],
              }),
              h('div', {
                innerHTML: '拍照人名称:' + ver['RecName'],
              }),
              h('div', {
                innerHTML: '备注:' + ver['MyNote'],
              }),

              h('button', { class: 'my-button', onClick: () => Delete(ver['MyPK']) }, '删除快照'),
              h('button', { class: 'my-button', onClick: () => Reback(ver['MyPK']) }, '还原到此位置'),
            ]);
          }
          return text;
        },
      });
    });
    //当前数据
    columns.value.push({
      title: '当前数据',
      dataIndex: 'CurVal',
      key: 'CurVal',
      width: 200,
      customRender: ({ text, record }: Recordable) => {
        if (record['KeyOfEn'] === '') {
          return h('button', { class: 'my-button', onClick: NewVer }, '创建快照数据');
        }
        return text;
      },
    });
    /* //变化
    columns.value.push({
      title: '变化',
      dataIndex: 'IsChange',
      key: 'IsChange',
      width: 50,
    });*/

    //操作
    columns.value.push({
      title: '操作',
      dataIndex: 'Oper',
      key: 'Oper',
      width: 100,
    });
  };
  const InitData = (vers, verDtls, mapAttrs, frmEn) => {
    const sysFiels = ',AtPara,OID,WorkID,WFState,BillNo,Title,RDT,CDT,OrgNo,Starter,StarterName,BillState,FK_Dept,';
    mapAttrs
      .filter((mapAttr) => sysFiels.includes(',' + mapAttr.KeyOfEn + ',') == false && mapAttr.UIContralType < 4 && mapAttr.UIVisible === 1)
      .forEach((mapAttr) => {
        const rowData: Record<string, string> = {};
        rowData['KeyOfEn'] = mapAttr.KeyOfEn;
        rowData['Name'] = mapAttr.Name;
        vers.data.forEach((ver) => {
          const dtl = verDtls.data.filter((verDtl) => verDtl.RefPK == ver.MyPK && verDtl.AttrKey == mapAttr.KeyOfEn);
          if (dtl.length === 0) rowData[ver.EnVer] = '无数据';
          else rowData[ver.EnVer] = dtl[0].MyVal;
        });
        if (!frmEn[mapAttr.KeyOfEn + 'T'] && !frmEn[mapAttr.KeyOfEn + 'Text']) rowData['CurVal'] = '[' + frmEn[mapAttr.KeyOfEn] + ']';
        else rowData['CurVal'] = '[' + frmEn[mapAttr.KeyOfEn] + '][' + (frmEn[mapAttr.KeyOfEn + 'T'] || frmEn[mapAttr.KeyOfEn + 'Text'] || frmEn[mapAttr.KeyOfEn]) + ']';
        tableData.value.push(rowData);
      });
    const rowData: Record<string, string> = {};
    rowData['KeyOfEn'] = '';
    rowData['Name'] = '';
    vers.data.forEach((ver) => {
      rowData[ver.EnVer] = JSON.stringify(ver);
    });
    rowData['CurVal'] = '';
    tableData.value.push(rowData);
  };
  const AppFieldData = async (keyOfEn) => {
    const val = window.prompt('请输入要复原的版本号: (请输入数字,1,2,3)', '1');
    if (val == undefined || val == null) return;

    //设置为主版本.
    try {
      const handler = new HttpHandler('BP.CCBill.WF_CCBill_OptComponents');
      handler.AddJson(props.params);
      handler.AddPara('KeyOfEn', keyOfEn);
      handler.AddPara('VerNum', val);
      const data = await handler.DoMethodReturnString('DataVer_AppFieldData');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data);
        return;
      }
      InitPage();
    } catch (e) {
      message.error(e as string);
    }
  };
  //删除快照
  const Delete = async (mypk) => {
    if (window.confirm('系统将要删除备份的快照数据，您确定要删除吗？') == false) return;
    const en = new BSEntity('BP.Sys.EnVer', mypk);
    await en.Delete(); //已经在删除的逻辑里写了删除dtl数据。
    InitPage();
  };
  //还原到此位置.
  const Reback = (mypk) => {
    if (window.confirm('确定要还原到当前的快照吗？现有的数据将会被覆盖，请慎重执行。') == false) return;
    try {
      const handler = new HttpHandler('BP.CCBill.WF_CCBill_OptComponents');
      handler.AddJson(props.params);
      handler.AddPara('MyPK', mypk);
      const data = handler.DoMethodReturnString('DataVer_Reback');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data);
        return;
      }
      InitPage();
    } catch (e) {
      message.error(e as string);
    }
  };

  //创建版本
  const NewVer = async () => {
    let val = window.prompt('备注*', '');
    if (val == null || val == undefined) return;
    if (val == '') val = '无';
    try {
      const handler = new HttpHandler('BP.CCBill.WF_CCBill_OptComponents');
      handler.AddJson(props.params);
      handler.AddPara('MyNote', val);
      const data = await handler.DoMethodReturnString('DataVer_NewVer');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data);
        return;
      }
      InitPage();
    } catch (e) {
      message.error(e as string);
    }
  };
  InitPage();
</script>

<style lang="less" scoped>
  .log {
    padding: 0px 10px 20px 30px;

    span {
      display: inline-block;
      margin-right: 15px;
    }

    .recName {
      display: inline-block;
      width: 40px;
      height: 40px;
      border-radius: 20px;
      background-color: #1890ff;
      color: #fff;
      line-height: 40px;
      text-align: center;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 4px;
      background-color: #67c23a;
    }
  }
</style>
