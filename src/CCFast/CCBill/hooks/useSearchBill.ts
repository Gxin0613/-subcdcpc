import { createVNode, h, markRaw, reactive, ref } from 'vue';
import type { Ref, ShallowRef, UnwrapNestedRefs, VNode, VNodeArrayChildren } from 'vue';
import { TableConfig, ToolbarButtonDef, ToolbarProps } from '/@/components/SearchComponent/src/types';
import BaseComponentVue from '/@/WF/Comm/BaseComponent.vue';
import MyBill from '../MyBill.vue';
import { useRoute } from 'vue-router';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { Divider, Dropdown, Menu, MenuItem, Modal, Popconfirm, message, Tag, Button as AntButton, Tooltip } from 'ant-design-vue';
import { DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import WebUser from '/@/bp/web/WebUser';
import { UserRegedit } from '/@/bp/sys/UserRegedit';
import useFieldType from '/@/hooks/ens/useFieldType';
import { NEllipsis } from 'naive-ui/es/ellipsis';
import { DataTableColumn } from 'naive-ui/es/data-table';
import SubTableContainer from '../Components/ChildTable/SubTableContainer.vue';
import { RowData } from 'naive-ui/es/data-table/src/interface';
import { NTag } from 'naive-ui';
import { MethodAttr, Methods } from '../Method/Method';
import MyDictFrameWork from '../MyDictFrameWork.vue';
import { FrmBBS } from '/@/WF/Comm/Components/FrmBBS';
import { FrmBBSs } from '../Components/FrmBBS/FrmBBS';
import { SearchFKEnums } from '../Admin/SearchCond/SearchFKEnum';
import BSEntity from '/@/utils/gener/BSEntity';
import { SysEnums } from '/@/WF/Admin/FrmLogic/SysEnum/SysEnum';
import { DTSearchWay } from '/@/bp/en/Map/SearchNormal';
import { MapData } from '/@/WF/Admin/FrmLogic/MapData';
import dayjs from 'dayjs';
import { MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
import { FrmBill } from '../FrmBill';
import { GloComm } from '/@/WF/Comm/GloComm';
import { windowOpen } from '/@/utils/windowOpen';
import { SearchBillExt } from '/@/DataUser/OverrideFiles/SearchBillExt';
import GroupPageNew from '/@/WF/Comm/UIEntity/GroupPageNew.vue';
import { FieldNumColors } from '/@/WF/Admin/FrmLogic/MapExt/FieldNumColor/FieldNumColor';
import { getConfigColor } from '/@/utils/color';
import { FrmAttr } from '/@/WF/TSClass/Admin/FrmAdm';
import { WaiGuaBaseEntity } from '../../../bp/UIEntity/WaiGuaBaseEntity';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { Collection } from '/@/CCFast/CCBill/Collection/Collection';
import { getAppEnvConfig } from '/@/utils/env';
import { GloWF } from '/@/WF/Admin/GloWF';
import { DealExp } from '/@/utils/gener/StringUtils';
import { CCBPMRunModel, SystemConfig } from '/@/bp/difference/SystemConfig';
type ModalArgs = {
  visible: boolean;
  params: Recordable;
  athInfo: Recordable;
};

export function useSearchBill(
  className: string,
  props: Recordable,
  queryMethod: string,
  baseComp: ShallowRef<InstanceType<typeof BaseComponentVue>>,
  drawer: Recordable | null = null,
  displayMode: Ref<string>,
  modalInfo: UnwrapNestedRefs<ModalArgs>,
  entityWG: Ref<WaiGuaBaseEntity | null>,
) {
  const route = useRoute();
  const getParams = (name: string) => props.params[name] || route.query[name];
  const userRegedit = reactive<UserRegedit>(new UserRegedit());
  const PKVal = WebUser.No + getParams('FrmID') + '_SearchAttrs';

  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const basePath = VITE_GLOB_API_URL;
  const TITLE_WIDTH = 320;
  let activeSortColumn = '';
  let sortOrder = '';
  enum MethodModel {
    Search = 'Search',
    New = 'New',
    Delete = 'Delete',
    ExpExcel = 'ExpExcel',
    ImpExcel = 'ImpExcel',
    Submit = 'Submit',
    Analy = 'Analy',
    VstoDownload = 'VstoDownload',
    NewExcelFrm = 'NewExcelFrm',
    NewWordFrm = 'NewWordFrm',
    FlowNewEntity = 'FlowNewEntity',
    WaiGua = 'WaiGua',
  }
  const toolbarProps = reactive<ToolbarProps>({
    dateList: [],
    selectList: [],
    buttonList: [],
    keywordList: [],
  });

  let handlerInst: Nullable<HttpHandler> = null;
  const FrmID = getParams('FrmID');
  const frmBill = new FrmBill(FrmID);

  const tableConfigs = reactive<TableConfig>({
    columns: [],
    dataSource: [],
    checkedItems: [],
    onUpdateCheckedItems: (items: any[]) => {
      tableConfigs.checkedItems = items;
    },
    primaryKey: 'OID',
    page: 1,
    pageCount: 1,
    pageSize: 10,
    onPageNumberChange: (pageNum: number) => {
      tableConfigs.page = pageNum;
      query();
    },
    onPageSizeChange: (pageSize: number) => {
      tableConfigs.pageSize = pageSize;
      query();
    },
    onhandleUpdateSorter: (sorter) => {
      tableConfigs.page = 1;
      if (activeSortColumn === '' || activeSortColumn != sorter.columnKey) {
        activeSortColumn = sorter.columnKey;
        sortOrder = sorter.order;
      } else {
        if (activeSortColumn === sorter.columnKey) {
          sortOrder = sortOrder == 'descend' ? 'ascend' : 'descend';
          sorter.order = sortOrder;
        }
      }
      tableConfigs.columns.forEach((column) => {
        if (column.key === sorter.columnKey) {
          column.sortOrder = sorter.order;
        } else {
          column.sortOrder = false;
        }
      });
      userRegedit.OrderBy = sorter.columnKey;
      userRegedit.OrderWay = sorter.order === 'descend' ? 'DESC' : 'ASC';

      query();
    },
    onRowClick: (row: Recordable) => {
      /*const frmType = mapData.GetValByKey('FrmType');
      if (frmType == 6) {
        const url = GloWF.openVSTO('MyBillExcel', getParams('FrmID'), row['OID']);
        window.location.href = url;
        return;
      }
      if (frmType == 61) {
        const url = GloWF.openVSTO('MyBillWord', getParams('FrmID'), row['OID']);
        window.location.href = url;
        return;
      }*/
      delete props.params['title'];
      /*let paras =  Object.assign({ RefPK: 'OID', WorkID: row.OID, FrmID: route.query.FrmID, IsReadonly: row.BillState === 100 ? 1 : 0 }, props.params);
      paras = Object.entries(paras)
        .map(([key, value]) => `${key}=${value}`)
        .join("&");
      baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByTab,'/src/CCFast/CCBill/MyDictFrameWork.vue?1=1&'+paras,row.Title))
*/
      baseComp.value?.openDrawer({
        title: row.Title,
        width: '70%',
        component: markRaw(MyDictFrameWork),
        params: Object.assign({ RefPK: 'OID', WorkID: row.OID, FrmID: route.query.FrmID, IsReadonly: row.BillState === 100 ? 1 : 0, BillState: row.BillState }, props.params),
        showFooter: false,
      });
      // baseComp.value.handleGPNCallback(new GPNReturnObj({}))
    },
    ready: false,
  });

  const confirmDelete = async () => {
    try {
      //检查审核中或者归档的不能删除
      const items = ',' + tableConfigs.checkedItems.join(',') + ',';
      let msg = '';
      for (const item of tableConfigs.dataSource) {
        if (items.includes(',' + item.OID + ',') && (item.BillState == 3 || item.BillState == 100 || item.BillState == 200))
          msg += item.BillNo + '当前是' + (item.BillState === 3 ? '审核' : '归档') + '状态，不能删除  ';
      }
      if (!!msg) {
        message.warn(msg);
        return;
      }
      await deleteSelectItemsMethodData();
      const handler = getHandler();
      handler.AddPara('FrmID', getParams('FrmID'));
      handler.AddPara('WorkIDs', tableConfigs.checkedItems.join(','));
      msg = await handler.DoMethodReturnString('MyBill_Deletes'); //执行删除单据
      message.info(msg);
      tableConfigs.checkedItems = [];
      await query();
    } catch (e: any) {
      message.error(e.toString());
    }
  };
  const deleteSelectItems = () => {
    if (tableConfigs.checkedItems.length === 0) {
      message.info('请选择要删除的数据');
      return;
    }
    Modal.confirm({
      content: '确定要删除所选数据吗？',
      icon: createVNode(ExclamationCircleOutlined),
      okText: '确定',
      onOk() {
        confirmDelete();
      },
      cancelText: '取消',
      onCancel() {
        Modal.destroyAll();
      },
    });
  };

  const deleteSelectItemsMethodData = async () => {
    const methods = new Methods();
    await methods.Retrieve(MethodAttr.FrmID, props.params.SystemNo);
    methods.forEach((method: MethodAttr) => {
      if (method[MethodAttr.MethodModel] == 'FrmBBS') {
        tableConfigs.checkedItems.forEach(async (item) => {
          const frmBBSs = new FrmBBSs();
          await frmBBSs.Delete('WorkID', item, 'FrmID', getParams('FrmID'));
        });
      }
    });
  };

  const handleBtnClick = async (type: MethodModel, _btnName: string, buttonId = '') => {
    if (type === MethodModel.Search) {
      tableConfigs.page = 1;
      await query();
      return;
    }
    if (type === MethodModel.New) {
      const frmBill = new FrmBill();
      frmBill.No = FrmID;
      await frmBill.RetrieveFromDBSources();
      // const drawerWidth = (parseInt(frmBill.PopWidth) || 1000) + 'px';
      //多个流程.
      if (frmBill.BillCheckModel == 'ByFlowNo' && frmBill.BillCheckTag.toString().includes(',')) {
        baseComp.value?.openDrawer({
          title: '新建',
          width: '90%',
          fullScreen: true,
          component: markRaw(GroupPageNew),
          params: Object.assign({ EnName: 'GPN_BillCheckSelectedOneFlowStart', FrmID: FrmID }, props.params),
          showFooter: true,
        });
        return;
      }

      //单个流程.
      if (frmBill.BillCheckModel == 'ByFlowNo' && frmBill.BillCheckTag.toString().includes(',') == false) {
        const handler = getHandler();
        handler.AddPara('FlowNo', frmBill.BillCheckTag);
        const data = await handler.DoMethodReturnString('MyBill_CreateBlankBillID');
        //格式为:  1001@003  , workid@flowNo.
        const strs = data.split('@');
        const flowNo = strs[1];
        const workID = strs[0];
        const url = GloComm.UrlMyFlow(flowNo, '&WorkID=' + workID + '&FrmID=' + FrmID);
        windowOpen(url);
        return;
      }

      const handler = getHandler();
      const data = await handler.DoMethodReturnString('MyBill_CreateBlankBillID');
      console.log({ data });
      /*let paras = Object.assign({ WorkID: data, FrmID: route.query.FrmID }, props.params);
      paras='&'+Object.entries(paras)
        .map(([key, value]) => `${key}=${value}`)
        .join("&");
      baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByTab,'/src/CCFast/CCBill/MyBill.vue?1=1'+paras,'新增'))*/
      delete props.params['RDT'];
      baseComp.value?.openDrawer({
        title: '新增',
        width: '70%', //drawerWidth,
        component: markRaw(MyBill),
        params: Object.assign({ WorkID: data, FrmID: route.query.FrmID }, props.params, { isFixedbar: true }),
        showFooter: true,
      });
      return;
    }

    // 新建vsto/excel表单
    if (type == MethodModel.NewExcelFrm) {
      const handler = getHandler();
      const data = await handler.DoMethodReturnString('MyBill_CreateBlankBillID');
      const url = GloWF.openVSTO('MyBillExcel', getParams('FrmID'), data);
      window.location.href = url;
      return;
    }

    // 新建vsto/word表单
    if (type == MethodModel.NewWordFrm) {
      const handler = getHandler();
      const data = await handler.DoMethodReturnString('MyBill_CreateBlankBillID');
      const url = GloWF.openVSTO('MyBillWord', getParams('FrmID'), data);
      window.location.href = url;
      return;
    }

    // 下载vsto工具
    if (type == MethodModel.VstoDownload) {
      window.open('https://docs.qq.com/doc/DRFNGZGJwYVZsaE1T');
      return;
    }
    // 如果是提交
    // if (type === MethodModel.Submit) {
    //   const handler = getHandler();
    //   const data = await handler.DoMethodReturnString('MyBill_Submit');
    //   message.info(data);
    //   baseComp.value?.openDrawer({
    //     title: '新增',
    //     width: '900px',
    //     component: markRaw(MyBill),
    //     params: Object.assign({ WorkID: data, FrmID: route.query.FrmID }, props.params),
    //     showFooter: true,
    //   });
    //   return;
    // }
    if (type === MethodModel.Delete) {
      deleteSelectItems();
      return;
    }
    if (type === MethodModel.ExpExcel) {
      // 如何从前端获取Attrs？
      await updateUserRegedit();
      const myurl = GloComm.UrlGPN('GPN_BillExportExcel', '', '&FrmID=' + frmBill.No);
      return baseComp.value?.openModalByUrl('数据导出', myurl);
      // const header = mapAttrs.map((attr) => attr.Name);
      // const handler = getHandler();
      // const impData = await handler.DoMethodReturnJson<Recordable>('Search_ExpExt');
      // const data = impData.map((item) => {
      //   return mapAttrs.map((attr) => {
      //     return item[attr.KeyOfEn];
      //   });
      // });
      // aoaToSheetXlsx({ data, header, filename: mapData.Name + '.xlsx' });
      // return;
    }
    if (type === MethodModel.ImpExcel) {
      if (!!drawer) drawer.visible = true;
      // message.warn('开发中');
      return;
    }
    if (type === MethodModel.FlowNewEntity) {
      try {
        const collection = new Collection(buttonId);
        await collection.RetrieveFromDBSources();
        const menu = new BSEntity('BP.CCBill.Template.MethodFlowNewEntity');
        menu.setPK(buttonId);
        await menu.Retrieve();
        const data = menu.getData();
        const workID = await menu.DoMethodReturnString('CreateWorkID');
        baseComp.value?.openDrawerByUrl(
          collection.Name,
          '/src/WF/MyFlowGener.vue?FK_Flow=' + data.FlowNo + '&FrmID=' + data.FrmID + '&WorkID=' + workID + '&FK_Node=' + (parseInt(data.FlowNo) + '01'),
          '70%',
        );
      } catch (e) {
        message.error(e as string);
      }

      return;
    }
    if (['FlowBaseData', 'FlowEtc', 'FlowHostBill', 'FlowSingleCopyData'].includes(type)) {
      if (tableConfigs.checkedItems.length === 0) {
        message.info('请选择需要发起流程的数据的数据');
        return;
      }
      if (tableConfigs.checkedItems.length > 1) {
        message.info('请选择一条需要发起流程的数据的数据');
        return;
      }
      const frmID = getParams('FrmID');
      const handler = new HttpHandler('BP.CCBill.WF_CCBill');
      handler.AddPara('WorkID', tableConfigs.checkedItems[0]);
      handler.AddPara('RefNo', tableConfigs.checkedItems[0]); //有可能是实体编号.
      handler.AddPara('FrmID', frmID);
      handler.AddPara('MethodNo', buttonId); //方法ID.
      let data = (await handler.DoMethodReturnString('MyDict_DoFlowEtc_StartFlow')) as string;
      if (data.includes('err@') == true) {
        message.error(data);
        return;
      }
      data = '/#/WF' + data;
      data = data.replace('../', '/');
      data = data.replace('.htm', '');
      baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, data));
      return;
    }
    if (entityWG.value != null && type === 'WaiGua') {
      const result = await entityWG.value?.BtnClick('SearchToolbar', _btnName, tableConfigs.checkedItems.join(','), null);
      if (!!result && result?.hasOwnProperty?.('ReturnType')) {
        baseComp.value?.handleGPNCallback(result, _btnName);
      }
      return;
    }
    message.error('该方法类型未被定义');
  };
  const getHandler = () => {
    if (handlerInst) {
      return handlerInst;
    }
    const handler = new HttpHandler(className);
    handler.AddPara('PFrmID', getParams('PFrmID'));
    handler.AddPara('PWorkID', getParams('PWorkID'));
    handlerInst = handler;
    return handler;
  };
  const InitToolbar = async () => {
    const handler = getHandler();
    handler.AddPara('FrmID', getParams('FrmID'));
    const toolbarInfo = await handler.DoMethodReturnJson<Recordable>('Search_ToolBar');
    const btnList = toolbarInfo.Frm_Collection || [];
    const methods = toolbarInfo.Frm_Method || [];
    if (entityWG.value != null) {
      const btns = entityWG.value?.SearchToolbarBtns;
      if (!!btns) {
        btns.split(',').forEach((item) => {
          btnList.push({
            No: item,
            Name: item,
            MethodModel: 'WaiGua',
            IsZD: 0,
          });
        });
      }
    }
    await frmBill.Retrieve();

    const vstoButtons: ToolbarButtonDef[] = [];
    const frmType = frmBill.GetValByKey('FrmType');
    if (frmType == 6 || frmType == 61) {
      if (frmType == 6) {
        vstoButtons.push({
          key: 'new-excel-btn',
          name: '新建Excel表单',
          type: 'primary',
          shape: 'default',
          MethodModel: '',
          isDanger: false,
          isGhost: true,
          style: {
            marginRight: '12px',
          },
          onClick: () => {
            displayMode.value = 'table';
            handleBtnClick(MethodModel.NewExcelFrm, '新建Excel表单');
          },
        });
      }
      if (frmType == 61) {
        vstoButtons.push({
          key: 'new-word-btn',
          name: '新建Word表单',
          type: 'primary',
          shape: 'default',
          MethodModel: '',
          isDanger: false,
          isGhost: true,
          style: {
            marginRight: '12px',
          },
          onClick: () => {
            displayMode.value = 'table';
            handleBtnClick(MethodModel.NewWordFrm, '新建Word表单');
          },
        });
      }
      vstoButtons.push({
        key: 'vsto-download',
        name: 'vsto工具下载',
        type: 'primary',
        shape: 'default',
        MethodModel: '',
        isDanger: false,
        isGhost: true,
        style: {
          marginRight: '12px',
        },
        onClick: () => {
          displayMode.value = 'table';
          handleBtnClick(MethodModel.VstoDownload, 'vsto工具下载');
        },
      });
    }
    // 按钮，只保留查询
    toolbarProps.buttonList = [
      ...vstoButtons,
      {
        key: 'query-btn',
        name: '查询',
        type: 'primary',
        shape: 'default',
        MethodModel: '',
        isDanger: false,
        isGhost: true,
        style: {
          marginRight: '12px',
        },
        onClick: () => {
          displayMode.value = 'table';
          handleBtnClick(MethodModel.Search, '查询');
        },
      },
      {
        key: 'analy-btn',
        name: '分析',
        type: 'primary',
        shape: 'default',
        MethodModel: '',
        isDanger: false,
        isGhost: true,
        style: {
          marginRight: '12px',
        },
        onClick: () => {
          displayMode.value = 'group';
          handleBtnClick(MethodModel.Analy, '分析');
        },
      },
      ...btnList
        .filter((btn) => btn.Name != '查询' && btn.Name != '分析')
        .map((btn) => {
          return {
            key: btn.No,
            name: btn.Name,
            type: 'primary',
            shape: 'default',
            MethodModel: btn.MethodModel,
            isDanger: btn.MethodModel.toLowerCase() === 'delete',
            isGhost: true,
            isZD: btn.IsZD,
            style: {
              marginRight: '12px',
            },
            onClick: () => {
              handleBtnClick(btn.MethodModel, btn.Name, btn.No);
            },
          };
        }),
      ...methods.map((btn) => {
        return {
          key: btn.No,
          name: btn.Name,
          type: 'primary',
          shape: 'default',
          MethodModel: btn.MethodModel,
          isDanger: false,
          isGhost: true,
          style: {
            marginRight: '12px',
          },
          onClick: () => {
            handleBtnClick(btn.MethodModel, btn.Name, btn.No);
          },
        };
      }),
    ];
    const isSearchKey = frmBill.GetParaString(FrmAttr.IsSearchKey);
    if (isSearchKey == '') {
      frmBill.SetPara(FrmAttr.IsSearchKey, '0');
      await frmBill.Update();
    }
    if (isSearchKey == '1') {
      toolbarProps.keywordList = [
        {
          label: '关键字',
          key: 'SearchKey',
          value: userRegedit.SearchKey || '',
          placeholder: '请输入关键字',
        },
      ];
    }
    if (isSearchKey == '2') {
      const stringSearchKeys = frmBill.GetValStringByKey('StringSearchKeys') || '';
      if (!!stringSearchKeys) {
        const stringSearchKeysT = frmBill.GetValStringByKey('StringSearchKeysT') || '';
        const keys = stringSearchKeys.split(',');
        const keyNames = stringSearchKeysT.split(',');
        toolbarProps.keywordList = [];
        keys.forEach((item, idx) => {
          toolbarProps.keywordList.push({
            label: keyNames[idx],
            key: item,
            value: userRegedit.GetParaString(item) || '',
            placeholder: '请输入' + keyNames[idx],
          });
        });
      }
    }

    toolbarProps.dateList = [
      {
        label: '日期范围',
        key: 'RDT',
        type: 'daterange',
        value: null,
        strValue: '',
        startPlaceholder: '从',
        endPlaceholder: '到',
        onChange: () => void 0,
      },
    ];
    const dtSearchWay = frmBill.GetParaInt(FrmAttr.DTSearchWay) || 0;
    //按照指定字段查询
    const dtSearchKey = frmBill.GetParaString(FrmAttr.DTSearchKey) || '';

    const searchDateFrom = userRegedit.DTFrom || '';
    const searchDateTo = userRegedit.DTTo || '';
    let dateVal: any = undefined;
    if (searchDateFrom && searchDateTo) {
      dateVal = [dayjs(searchDateFrom, 'YYYY-MM-DD'), dayjs(searchDateTo, 'YYYY-MM-DD')];
    }
    const dateAttrs = new MapAttrs();
    await dateAttrs.Retrieve('FK_MapData', getParams('FrmID'), 'MyDataType');
    const targetDateAttrs = dateAttrs.filter((attr) => {
      if (dtSearchWay === 1) return attr.MyDataType == 7 || attr.MyDataType == 6;
      if (dtSearchWay === 2 && !!dtSearchKey) {
        return (attr.MyDataType == 7 || attr.MyDataType == 6) && dtSearchKey.split(',').includes(attr.KeyOfEn);
      }
    });
    if ((dtSearchWay === 1 || dtSearchWay === 2) && targetDateAttrs.length > 0)
      toolbarProps.selectList = [
        {
          display: 'select',
          options: targetDateAttrs.map((attr) => ({ label: attr.Name, value: attr.KeyOfEn })),
          isMultiSelect: false,
          label: '日期字段',
          value: 'RDT',
          key: 'date-query-key',
        },
      ];
    const enums = new SearchFKEnums();
    await enums.Retrieve('FrmID', getParams('FrmID'));

    for (const en of enums) {
      if (en.IsEnum == 1) {
        const sysEnums = new SysEnums();
        await sysEnums.Retrieve('EnumKey', en.UIBindKey);
        console.log({ sysEnums });
        toolbarProps.selectList.push({
          display: 'select',
          options: [{ label: '' + en.Name, value: '' }, ...sysEnums.map((en) => ({ label: en.Lab, value: en.StrKey || en.IntKey }))],
          isMultiSelect: en.IsMultiSelect == 1,
          label: '',
          key: en.KeyOfEn,
          value: en.IsMultiSelect == 0 ? '' : [],
        });
      } else if (en.IsEnum == 0 && en.UIBindKey == '') {
        toolbarProps.selectList.push({
          display: 'select',
          options: [
            { label: '' + en.Name, value: '' },
            { label: '是', value: '1' },
            { label: '否', value: '0' },
          ],
          isMultiSelect: en.IsMultiSelect == 1,
          label: '',
          key: en.KeyOfEn,
          value: en.IsMultiSelect == 0 ? '' : [],
        });
      } else {
        const sfTable = new BSEntity('BP.Sys.SFTable', en.KeyOfEn);
        await sfTable.Retrieve();
        const ens = await sfTable.DoMethodReturnString('GenerDataOfJson');
        console.log({ ens });
        toolbarProps.selectList.push({
          display: 'select',
          options: [{ label: '' + en.Name, value: '' }, ...ens.map((en) => ({ label: en.Name, value: en.No }))],
          isMultiSelect: en.IsMultiSelect == 1,
          label: '',
          key: en.KeyOfEn,
          value: en.IsMultiSelect == 0 ? '' : [],
        });
      }
    }
  };
  const { isBoolean, isInt, isTextArea, isDDL, isEnumSingle, isEnumCheckbox, isNumType, isPopText, isHandWriting, isLink } = useFieldType();
  // let mapAttrs: Recordable[] = [];
  const handleTimestamp = (ts: number | undefined | null) => {
    if (ts) {
      return dayjs(ts).locale('zh-cn').format('YYYY-MM-DD');
    }
    return '';
  };
  const imgPreview = (url) => {
    modalInfo.params = {
      Type: 'ImgPreview',
      ImgUrl: url,
      width: '600px',
    };
    modalInfo.visible = true;
  };
  const GetSelfByKey = (frmID, attr, formatFunc, row) => {
    if (formatFunc.includes(attr.KeyOfEn)) return SearchBillExt.ForamtFunc(frmID, attr.KeyOfEn, row) || row[attr.KeyOfEn];
    return row[attr.KeyOfEn + 'T'] || row[attr.KeyOfEn + 'Text'] || row[attr.KeyOfEn];
  };
  const prefix = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
  const sysLang = WebUser.SysLang || 'CH';
  const InitMapAttrs = async () => {
    const handler = getHandler();
    const res = await handler.DoMethodReturnJson('Search_MapAttr');
    const attrs = res.Attrs;
    // mapAttrs = res.Attrs;
    const mapExts = res.Sys_MapExt || [];
    const Enum = res.Sys_Enum;
    const frmDict = new FrmBill(props.params.FrmID);
    await frmDict.Retrieve();
    const showModel = frmDict.ShowColModel;
    const showCols = frmDict.ShowCols;
    const sortFields = frmDict.GetParaString('SortFields') || '';
    const formatFunc = (frmDict.ForamtFunc || '').split(',');
    let actualAttrs = attrs;
    if (showModel == 1) {
      const visibleColSet = new Set<string>(['BillNo', 'Title', ...showCols.split(',')]);
      actualAttrs = attrs.filter((attr) => visibleColSet.has(attr.KeyOfEn));
    }
    const noIndex = actualAttrs.findIndex((attr) => attr.KeyOfEn == 'BillNo');
    if (noIndex >= 0 && noIndex !== 0) {
      const billAttr = actualAttrs.find((attr) => attr.KeyOfEn == 'BillNo');
      actualAttrs.splice(noIndex, 1);
      actualAttrs.splice(0, 0, billAttr);
    }
    const nameIndex = actualAttrs.findIndex((attr) => attr.KeyOfEn == 'Title');
    if (nameIndex >= 0 && nameIndex !== 1) {
      const nameAttr = actualAttrs.find((attr) => attr.KeyOfEn == 'Title');
      actualAttrs.splice(nameIndex, 1);
      actualAttrs.splice(1, 0, nameAttr);
    }

    // handle enum keys
    const enumAttrKeys = actualAttrs.filter((attr) => {
      return isEnumSingle(attr) || isEnumCheckbox(attr) || isDDL(attr);
    });

    // get enum config
    for (const attr of enumAttrKeys) {
      const uiBindKey = attr.UIBindKey;
      if (typeof uiBindKey == 'string' && uiBindKey.trim() !== '') {
        const enums = Enum.filter((en) => en.EnumKey == uiBindKey);
        const enumConfigs = enumMainList.value.filter((en) => en.EnumKey == uiBindKey);
        if (enumConfigs.length == 0) {
          attr.enumConfig = enums;
          continue;
        }
        if (SystemConfig.CCBPMRunModel == CCBPMRunModel.GroupInc) {
          const mains = enumConfigs.filter((enumMain) => enumMain.OrgNo == WebUser.OrgNo || parseInt(enumMain.IsShare) === 1);
          if (mains.length > 0) attr.enableEnumColor = mains[0].EnableColor == 1;
        } else {
          attr.enableEnumColor = enumConfigs[0].EnableColor == 1;
        }
        attr.enumConfig = enums;
      }
    }

    const colorSet = frmBill.ColorSet || '';
    const colorMap = getFieldColor(colorSet);

    const colorConfigList = new FieldNumColors();
    await colorConfigList.Retrieve('FK_MapData', props.params.FrmID);

    //let isHaveBillState = false;
    // tableConfigs.columns =
    //判断表格内容:换行<->不换行
    const TableStyle = parseInt(frmDict.TableStyle) === 1 ? { tooltip: true } : false;
    tableConfigs.columns = [
      {
        type: 'selection',
        fixed: 'left',
        width: 30,
      },
    ];
    const showNumIndex = frmDict.ShowNumIndex;
    if (showNumIndex == 1) {
      tableConfigs.columns.push({
        title: '#',
        key: 'index',
        width: 60,
        align: 'center',
        render: (row: Recordable, index: number) => {
          return index + 1 + (tableConfigs.page - 1) * tableConfigs.pageSize;
        },
      });
    }
    // render subtable if config is true
    if (frmDict.ListDtlShowWay >= 1) {
      if (frmDict.ListDtlShowWay == 1 || frmDict.ListDtlShowWay == 2) {
        tableConfigs.columns.push({
          type: 'expand',
          expandable: () => true,
          renderExpand: (rowData: RowData) => {
            return h(SubTableContainer, { frmId: FrmID, workId: rowData.OID, displayMode: frmDict.ListDtlShowWay, mainData: rowData });
          },
        });
      } else if (frmDict.ListDtlShowWay == 3) {
        tableConfigs.columns.push({
          type: 'expand',
          expandable: () => true,
          renderExpand: (row: RowData) => {
            return h(MyDictFrameWork, {
              params: Object.assign({ RefPK: 'OID', WorkID: row.OID, FrmID: route.query.FrmID, IsReadonly: row.BillState === 100 ? 1 : 0, BillState: row.BillState }, props.params),
            });
          },
        });
      } else if (frmDict.ListDtlShowWay == 4) {
        tableConfigs.columns.push({
          type: 'expand',
          expandable: () => true,
          renderExpand: (row: RowData) => {
            return h(SubTableContainer, { frmId: FrmID, workId: row.OID, displayMode: frmDict.ListDtlShowWay, mainData: row });
          },
        });
      }
    }
    // 过滤出自定义列
    const customColRenders = entityWG.value?.CustomColumnsRender || [];
    const customColKeys = customColRenders.map((item) => item.key);
    tableConfigs.columns = tableConfigs.columns.concat(
      actualAttrs.map((attr) => {
        if (customColKeys.includes(attr.KeyOfEn)) {
          return customColRenders.find((item) => item.key === attr.KeyOfEn);
        }
        //if (attr.KeyOfEn === 'BillState') isHaveBillState = true;
        // attr.UIHeight = attr.TextModel === 3 ? 50 : 23;
        // attr.MyFieldType = 0;
        const cellData: DataTableColumn = {
          key: attr.KeyOfEn,
          title: attr['Name' + sysLang] || attr.Name,
          width: attr.KeyOfEn == 'BillNo' ? parseInt(attr.Width) + 60 : attr.Width,
          align: 'left',
          ellipsis: TableStyle, //显示省略
          sorter: (sortFields + ',').includes(attr.KeyOfEn + ','),
        };
        const keyOfcolor = colorMap.get(attr.KeyOfEn);
        if (isInt(attr)) {
          if (attr.IsFieldPopShowDtl != 0) {
            cellData.render = (row: Recordable) => {
              return h(
                'div',
                {
                  style: { display: 'flex', alignItems: 'center' },
                  onClick: () => {
                    //内置generlist
                    if (attr.IsFieldPopShowDtl === 1) {
                      const url = `/src/WF/views/GenerList.vue?EnName=GL_FieldPopShowDtl&FrmID=${getParams('FrmID')}&PKVal=${row.OID}&AttrKey=${attr.KeyOfEn}`;
                      if (!attr.Tag1Width) {
                        attr.Tag1Width = '1000px';
                      }
                      if (!attr.Tag2Height) {
                        attr.Tag2Height = '700px';
                      }
                      baseComp.value?.openModalByUrl('', url, null, attr.Tag1Width + 'px', attr.Tag2Height + 'px');
                    }
                    if (attr.IsFieldPopShowDtl === 2) {
                      const url = `/src/WF/views/GenerList.vue?EnName=${attr.FieldPopShowDtlDoc}&FrmID=${getParams('FrmID')}&PKVal=${row.OID}&AttrKey=${attr.KeyOfEn}`;
                      baseComp.value?.openModalByUrl('', url);
                    }
                    if (attr.IsFieldPopShowDtl === 3) {
                      const url = `${attr.FieldPopShowDtlDoc}`;
                      // baseComp.value?.openModalByUrl('', url);
                      baseComp.value?.openIframe({
                        width: '70%',
                        height: '600px',
                        openType: 0,
                        src: url,
                      });
                      // baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenIframeByModal, url));
                    }
                  },
                },
                [
                  h(
                    'a',
                    {
                      style: {
                        color: 'var(--system-hover-bg-color)',
                      },
                    },
                    row[attr.KeyOfEn],
                  ),
                ],
              );
            };
            return cellData;
          }
        }
        if (isBoolean(attr)) {
          cellData.render = (row: Recordable) => {
            return h(NEllipsis, {}, { default: () => (row[attr.KeyOfEn] == 1 ? '是' : '否') });
          };
          return cellData;
        }
        if (isTextArea(attr)) {
          cellData.render = (row: Recordable) => {
            let val = GetSelfByKey(frmDict.No, attr, formatFunc, row);
            if (val.toString().startsWith('Text@')) val = val.replace('Text@', '');
            if (val.toString().startsWith('Href@')) {
              val = val.replace('Href@', '');
              return h('a', { href: val, target: '_blank' }, row[attr.KeyOfEn]);
            }
            return h(NEllipsis, { style: { maxWidth: attr.Width + 'px' } }, { default: () => val });
          };
          return cellData;
        }
        if (isHandWriting(attr)) {
          cellData.render = (row: Recordable) => {
            let val = row[attr.KeyOfEn];
            if (!!val) {
              val = prefix + val.substring(val.indexOf('/DataUser'));
              return h('img', { src: val, width: '100%', height: attr.UIHeight + 'px' });
            }
            return '';
          };
          return cellData;
        }
        if (isLink(attr)) {
          cellData.render = (row: Recordable) => {
            let val = attr.Tag2;
            if (!!val) {
              val = DealExp(val, row, false, true);
              return h('a', { href: val, target: '_blank' }, attr.Name);
            }
            return '';
          };
          return cellData;
        }

        if (isEnumSingle(attr)) {
          cellData.render = (row: Recordable) => {
            if (!attr.enableEnumColor)
              return h(
                'span',
                {},
                {
                  default: () => {
                    const rowVal = row[attr.KeyOfEn] === -1 ? '无' : row[`${attr.KeyOfEn}Text`] || row[`${attr.KeyOfEn}T`] || row[attr.KeyOfEn];
                    const enumVal = attr.enumConfig.find((item) => item.StrKey == rowVal || item.IntKey == rowVal)?.Lab;
                    return enumVal || rowVal;
                  },
                },
              );
            const colorVal = attr?.enumConfig?.find((item) => item.IntKey == row[attr.KeyOfEn])?.ValColor || '#000';
            const styleConfig = {
              maxWidth: attr.Width + 'px',
              // color,
            };
            const getTextColor = (c: string) => {
              const lc = c.toLowerCase();
              const lightBg = ['white', '#fff', '#ffffff', 'yellow'];
              if (lightBg.includes(lc)) {
                return 'black';
              }
              return 'white';
            };
            return h(
              NTag,
              { style: styleConfig, color: { color: colorVal, textColor: getTextColor(colorVal) }, size: 'small' },
              {
                default: () => {
                  const rowVal = row[`${attr.KeyOfEn}Text`] || row[`${attr.KeyOfEn}T`] || row[attr.KeyOfEn];
                  const enumVal = attr.enumConfig.find((item) => item.StrKey == rowVal || item.IntKey == rowVal)?.Lab;
                  return enumVal || rowVal;
                },
              },
            );
          };
          return cellData;
        }
        if (isEnumCheckbox(attr)) {
          cellData.render = (row: Recordable) => {
            const valueArr = Enum.filter((item) => item.EnumKey == attr.KeyOfEn && row[attr.KeyOfEn].includes(item.IntKey));
            const value: string[] = [];
            valueArr.forEach((i: any) => {
              value.push(i.Lab);
            });
            const color = getRowKeyColor(keyOfcolor, row, attr.KeyOfEn) || '';
            return h(NEllipsis, { style: { maxWidth: attr.Width + 'px', backgroundColor: color } }, { default: () => value.join(',') });
          };
          return cellData;
        }
        if (isDDL(attr)) {
          cellData.render = (row: Recordable) => {
            const color = getRowKeyColor(keyOfcolor, row, attr.KeyOfEn) || '';
            return h(
              NTag,
              {
                style: {
                  maxWidth: attr.Width + 'px',
                  minHeight: '28px',
                  height: 'auto',
                  whiteSpace: 'normal',
                  backgroundColor: color,
                },
              },
              {
                default: () => row[`${attr.KeyOfEn}Text`] || row[`${attr.KeyOfEn}T`] || row[`${attr.KeyOfEn}`],
              },
            );
          };
          return cellData;
        }
        if (attr.KeyOfEn.toLowerCase() === 'title') {
          cellData.width = TITLE_WIDTH;
          cellData.align = 'left';
          cellData.render = (row: Recordable) => {
            const rowMap = new Map([
              [-1, { text: '作废', color: 'red' }],
              [1, { text: '草稿', color: 'blue' }],
              [2, { text: '编辑', color: 'yellow' }],
              [3, { text: '审核', color: 'orange' }],
              [4, { text: '退回', color: 'red' }],
              [7, { text: '作废', color: 'red' }], //作废后填报人员可以编辑
              [100, { text: '归档', color: 'green' }],
              [200, { text: '完成', color: 'green' }],
            ]);
            const stateInfo = rowMap.get(row['BillState']);
            let priColor = '#ffde72';
            const atPara = row['AtPara'] || '';
            if (atPara.includes('PRI=0')) priColor = '#80a22e';
            if (atPara.includes('PRI=1')) priColor = '#ffde72';
            if (atPara.includes('PRI=2')) priColor = '#db382e';
            return h(
              NEllipsis,
              {
                style: {
                  minWidth: TITLE_WIDTH - 20 + 'px',
                },
              },
              {
                default: () => {
                  return h(
                    'div',
                    {
                      style: { display: 'flex', alignItems: 'center' },
                      onClick: () => {
                        tableConfigs?.onRowClick?.(row);
                      },
                    },
                    [
                      h(Tag, { color: stateInfo?.color || '#333', style: { marginRight: '0.5em' } }, () => {
                        if (row['BillState'] === 100) return stateInfo?.text[1] || '未知状态';
                        else return stateInfo?.text[0] || '未知状态';
                      }),
                      h('i', {
                        style: {
                          marginRight: '12px',
                          fontSize: '18px',
                          color: priColor,
                        },
                        class: 'glyphicon glyphicon-bookmark',
                      }),
                      h(
                        'a',
                        {
                          style: {
                            color: 'var(--system-hover-bg-color)',
                          },
                        },
                        row[attr.KeyOfEn],
                      ),
                    ],
                  );
                },
              },
            );
          };
          return cellData;
        }
        if (attr.KeyOfEn.toLowerCase() === 'billno') {
          cellData.render = (row: Recordable) => {
            const key = attr.KeyOfEn;
            const rowMap = new Map([
              [-1, { text: '作废', color: 'red' }],
              [1, { text: '草稿', color: 'blue' }],
              [2, { text: '编辑', color: 'yellow' }],
              [3, { text: '审核', color: 'orange' }],
              [4, { text: '退回', color: 'red' }],
              [7, { text: '作废', color: 'red' }], //作废后填报人员可以编辑
              [100, { text: '归档', color: 'green' }],
              [200, { text: '完成', color: 'green' }],
            ]);
            const stateInfo = rowMap.get(row['BillState']);

            return h(
              NEllipsis,
              {
                style: {
                  minWidth: attr.Width + 'px',
                },
              },
              {
                default: () => {
                  return [
                    // h(Tag, { color: stateInfo?.color || '#333', style: { padding: '0px 2px' } }, () => {
                    //   if (row['BillState'] === 100) return stateInfo?.text[1] || '未知状态';
                    //   else return stateInfo?.text[0] || '未知状态';
                    // }),
                    h('span', row[key]),
                  ];
                },
              },
            );
          };
          return cellData;
        }
        //如果是Pop弹窗
        if (isPopText(attr)) {
          cellData.render = (row: Recordable) => {
            let val = GetSelfByKey(frmDict.No, attr, formatFunc, row) || '';
            if (val.toString().startsWith('Text@')) val = val.replace('Text@', '');
            if (val.toString().startsWith('Href@')) {
              val = val.replace('Href@', '');
              return h('a', { href: val, target: '_blank' }, row[attr.KeyOfEn]);
            }
            //是否使用了保密格式
            const exts = mapExts.filter((mapExt) => mapExt.AttrOfOper === attr.KeyOfEn);
            let doWay = '';
            if (exts.length > 0) doWay = exts[0]['DoWay'] || '';
            if (doWay === 'IDCard') val = val.substring(0, 3) + '***********' + val.substring(val.length - 2, val.length);
            if (doWay === 'Tel') val = val.substring(0, 3) + '******' + val.substring(val.length - 3, val.length);
            if (doWay === 'Bank') val = val.substring(0, 4) + '************' + val.substring(val.length - 4, val.length);
            return h(
              'span',
              {
                style: {
                  MinWidth: attr.Width + 'px',
                  display: 'inline-block',
                },
              },
              { default: () => val },
            );
          };
          return cellData;
        }
        if (isNumType(attr)) {
          attr.Key = attr.KeyOfEn;
          cellData.render = (row: Recordable) => {
            const style = getConfigColor(row, attr, colorConfigList);
            if (style) {
              return h(
                'div',
                {
                  style: {
                    textAlign: 'left',
                    ...style,
                  },
                },
                {
                  default: () => row[attr.KeyOfEn],
                },
              );
            } else {
              return h(
                'div',
                {
                  style: {
                    textAlign: 'left',
                  },
                },
                { default: () => row[attr.KeyOfEn] },
              );
            }
          };
          return cellData;
        }

        if (attr.KeyOfEn.toLowerCase() === 'entitystate') {
          cellData.render = (row: Recordable) => {
            const key = attr.KeyOfEn;
            const rowMap = new Map([
              [1, '状态1'],
              [2, '状态2'],
              [3, '状态3'],
              [4, '状态4'],
            ]);
            return h('div', {}, rowMap.get(row[key]) || '未知状态');
          };
          return cellData;
        }
        if (attr.UIContralType == 12) {
          cellData.render = (row: Recordable) => {
            const imgAthUrl = !!row[attr.KeyOfEn] ? basePath + row[attr.KeyOfEn] + '?t=' + Math.random() : basePath + '/DataUser/UserIcon/Default.png';
            return h('img', {
              style: { width: '35px' },
              src: imgAthUrl,
              onClick: () => {
                imgPreview(imgAthUrl);
              },
            });
          };
          return cellData;
        }
        // cellData.render = (row: Recordable) => {
        //   return row[`${attr.KeyOfEn}Text`] || row[`${attr.KeyOfEn}T`] || row[`${attr.KeyOfEn}`];
        // };
        cellData.render = (row: Recordable) => {
          const color = getRowKeyColor(keyOfcolor, row, attr.KeyOfEn) || '';
          if (!!color) return h(NEllipsis, { style: { backgroundColor: color } }, { default: () => row[attr.KeyOfEn] });
          return h(NEllipsis, {}, { default: () => row[attr.KeyOfEn + 'Text'] || row[attr.KeyOfEn + 'T'] || row[attr.KeyOfEn] });
        };
        return cellData;
      }),
    ) as any;
    // 过滤一级表头
    const lv1Titles = frmDict.GetParaString('MultiTitle');
    if (typeof lv1Titles === 'string' && lv1Titles.includes(',')) {
      const lv1 = lv1Titles
        .split(';')
        .filter((item) => !!item)
        .map((item) => {
          const tInfo = item.split(',').filter((item) => !!item); // 过滤空
          return {
            title: tInfo[0],
            children: tInfo.slice(1),
          };
        });
      if (Array.isArray(lv1) && lv1.length > 0) {
        for (const titleConfig of lv1) {
          const multiTitle = {
            key: titleConfig.title,
            title: titleConfig.title,
            align: 'center',
            children: tableConfigs.columns.filter((col) => titleConfig.children.map((item) => item).includes(col.key)),
          };
          const idx = tableConfigs.columns.findIndex((item) => titleConfig.children.includes(item.key));
          tableConfigs.columns = tableConfigs.columns.filter((col) => !titleConfig.children.map((item) => item).includes(col.key));
          tableConfigs.columns.splice(idx, 0, multiTitle);
        }
      }
    }

    // 二级表头
    const lv2Titles = frmDict.GetParaString('MultiTitle1');
    if (typeof lv2Titles === 'string' && lv2Titles.includes(',')) {
      const lv2 = lv2Titles
        .split(';')
        .filter((item) => !!item)
        .map((item) => {
          const tInfo = item.split(',').filter((item) => !!item); // 过滤空
          return {
            title: tInfo[0],
            children: tInfo.slice(1),
          };
        });
      if (Array.isArray(lv2) && lv2.length > 0) {
        for (const titleConfig of lv2) {
          const multiTitle = {
            key: titleConfig.title,
            title: titleConfig.title,
            align: 'center',
            children: tableConfigs.columns.filter((col) => titleConfig.children.map((item) => item).includes(col.key)),
          };
          const idx = tableConfigs.columns.findIndex((item) => titleConfig.children.includes(item.key));
          tableConfigs.columns = tableConfigs.columns.filter((col) => !titleConfig.children.map((item) => item).includes(col.key));
          tableConfigs.columns.splice(idx, 0, multiTitle);
        }
      }
    }
    /*if (isHaveBillState == false) {
      tableConfigs.columns.push({
        key: 'BillState',
        title: '状态',
        width: 100,
        align: 'center',
        render: (row: Recordable) => {
          const rowMap = new Map([
            [1, { text: '草稿', color: 'blue' }],
            [2, { text: '编辑', color: 'yellow' }],
            [3, { text: '审核', color: 'orange' }],
            [4, { text: '退回', color: 'red' }],
            [100, { text: '归档', color: 'green' }],
            [200, { text: '完成', color: 'green' }],
          ]);
          const stateInfo = rowMap.get(row['BillState']);
          return h(Tag, { color: stateInfo?.color || '#333' }, () => stateInfo?.text || '未知状态');
        },
      });
    }*/
    // 扩展的虚拟列 wanglu
    const virtualColumns = entityWG.value?.CustomColumnsRender || [];
    // 添加虚拟列
    for (const vc of virtualColumns) {
      if (vc.afterColumn) {
        // @ts-ignore
        const index = tableConfigs.columns.findIndex((col) => col.key === vc.afterColumn);
        if (index !== -1) {
          tableConfigs.columns.splice(index + 1, 0, vc);
        }
      } else {
        if (tableConfigs.columns.find((col) => col.key === vc.key)) continue;
        tableConfigs.columns.push(vc);
      }
    }
    const methods = new Methods();
    await methods.Retrieve(MethodAttr.FrmID, frmDict.No);
    let entitybtns: string[] = [];
    if (entityWG.value != null) {
      const btns = entityWG.value?.SearchOptBtns;
      if (!!btns) {
        entitybtns = btns.split(',');
      }
    }
    const isHaveDelete = toolbarProps.buttonList.find((btn) => btn.name == '删除');
    const isHaveTrack = frmBill.BillCheckModel == 'ByFlowNo';
    tableConfigs.columns.push({
      key: 'operation',
      title: '操作',
      width: 100,
      align: 'center',
      render: (row) => createOper(methods, row, entitybtns, isHaveDelete, isHaveTrack, frmBill),
    });
  };

  const getFieldColor = (colorSet) => {
    const colorMap = new Map();
    const colorSets = colorSet.split('@');
    for (const item of colorSets) {
      if (!item) continue;
      const fieldColor: any[] = [];
      const strs = item.split(':');
      if (strs.length == 0 || strs.length == 1) continue;
      const ss = strs[1].split(';');
      for (let k = 0; k < ss.length; k++) {
        if (ss[k] == '') continue;
        const ts = ss[k].split(',');
        if (ts.length < 3) break;
        fieldColor.push({
          From: ts[0].replace('From=', ''),
          To: ts[1].replace('To=', ''),
          Color: ts[2].replace('Color=', ''),
        });
      }
      colorMap.set(strs[0], fieldColor);
    }
    return colorMap;
  };

  const getRowKeyColor = (keyOfColor, rowData, keyOfEn) => {
    if (!keyOfColor || keyOfColor.length == 0) return '';
    const reg = /^[0-9]+.?[0-9]*/;
    for (const item of keyOfColor) {
      if (item.Color.indexOf('_') == 0) item.Color = rowData[item.Color.substring(1)];
      if (item.From == 0 && item.To == 0) {
        return item.Color;
      }
      const valText = rowData[keyOfEn];
      if (reg.test(item.From) == false && reg.test(item.To) == false && (item.From == valText || item.To == valText)) return item.Color;
      if (reg.test(item.From) == true && reg.test(item.To) == true && parseInt(item.From) <= valText && parseInt(item.To) >= valText) return item.Color;
    }

    return '';
  };
  const createOper = (method, record, entitybtns, isHaveDelete, isHaveTrack, frmBill) => {
    const methodArr: any[] = [];
    method.forEach((item) => {
      if (item.IsList === 1) {
        if (methodArr.length > 0) {
          methodArr.push(h(Divider, { style: { margin: '5px 0px' } }));
        }
        if (item.MethodModel === 'FrmBBS') {
          methodArr.push(
            h(
              MenuItem,
              { style: { 'text-align': 'center', color: 'var(--system-hover-bg-color)' } },
              h(
                'a',
                {
                  onClick: () => {
                    baseComp.value?.openDrawer({
                      title: item.Name,
                      width: '900px',
                      component: markRaw(FrmBBS),
                      params: Object.assign({ workID: record.OID.toString() }, props.params),
                      showFooter: true,
                    });
                  },
                },
                { default: () => item.Name },
              ),
            ),
          );
        } else {
          methodArr.push(
            h(
              MenuItem,
              { style: { 'text-align': 'center', color: 'var(--system-hover-bg-color)' } },
              h(
                'a',
                {
                  ['onclick']: () => {
                    message.warning('待实现！');
                  },
                },
                { default: () => item.Name },
              ),
            ),
          );
        }
      }
    });
    if (methodArr.length > 0) {
      return h(
        Dropdown,
        { placement: 'bottom' },
        {
          default: () => h('a', { style: { color: 'var(--system-hover-bg-color)' } }, ['实体方法', h(DownOutlined)]),
          overlay: () => h(Menu, {}, methodArr),
        },
      );
    } else {
      type RawChildren = string | number | boolean | VNode | VNodeArrayChildren | (() => any);
      const children: RawChildren = [];
      if (isHaveDelete) {
        children.push(
          h(
            Popconfirm,
            {
              title: `确定要删除记录 [${record.BillNo}] 吗`,
              onConfirm: async () => {
                tableConfigs.checkedItems = [record.OID];
                await confirmDelete();
              },
              okButtonProps: {
                danger: true,
              },
            },
            {
              default: () =>
                h('i', {
                  style: {
                    color: 'red',
                  },
                  class: 'icon-close',
                }),
            },
          ),
        );
      }
      if (entitybtns.length > 0) {
        entitybtns.forEach((item) => {
          children.push(
            h(
              AntButton,
              {
                type: 'primary',
                size: 'small',
                round: true,
                onClick: async () => {
                  //执行自定义的方法
                  const result = await entityWG.value?.BtnClick('SearchOpt', item, '', record);
                  if (!!result && result?.hasOwnProperty?.('ReturnType')) {
                    baseComp.value?.handleGPNCallback(result, item);
                  }
                },
              } as any,
              () => item as string,
            ) as any,
          );
        });
      }
      if (isHaveTrack) {
        children.push(
          h(
            AntButton,
            {
              type: 'primary',
              size: 'small',
              round: true,
              onClick: async () => {
                const myurl = '/src/WF/WorkOpt/OneWork.vue?WorkID=' + record.OID + '&FK_Node=' + record.FlowEndNode + '&FK_Flow=' + frmBill.BillCheckTag;
                baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, myurl), '轨迹');
              },
            } as any,
            () => '轨迹',
          ) as any,
        );
      }

      return h(
        'div',
        {
          style: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
          },
        },
        children,
      );
    }
  };

  const createUserRegedit = async () => {
    userRegedit.MyPK = PKVal;
    userRegedit.SearchKey = '';
    userRegedit.AtPara = '';
    userRegedit.DTFrom = '';
    userRegedit.DTTo = '';
    userRegedit.FK_Emp = WebUser.No;
    userRegedit.CfgKey = 'SearchAttrs';
    userRegedit.Vals = '';
    userRegedit.FK_MapData = '';
    userRegedit.OrderBy = '';
    userRegedit.OrderWay = '';
    await userRegedit.Insert();
  };
  const InitUserRegedit = async () => {
    userRegedit.setPKVal(PKVal);
    const code = await userRegedit.RetrieveFromDBSources();
    if (code == 0) {
      await createUserRegedit();
    }
    tableConfigs.itemCount = userRegedit.GetParaInt('RecCount');
    tableConfigs.pageCount = Math.ceil(tableConfigs.itemCount / tableConfigs.pageSize);
  };
  let selectedTreeKey = '';
  let selectedTreeVal = '';
  const updateTreeKey = (key: string, val: string) => {
    selectedTreeKey = key;
    selectedTreeVal = val;
    query();
  };
  const updateUserRegedit = async () => {
    const isSearchKey = frmBill.GetParaInt(FrmAttr.IsSearchKey);
    if (isSearchKey === 1) userRegedit.SearchKey = toolbarProps.keywordList?.[0]?.value || '';
    if (isSearchKey === 2) {
      userRegedit.SearchKey = '';
      if (Array.isArray(toolbarProps.keywordList)) {
        toolbarProps.keywordList.forEach((item) => {
          userRegedit.SetPara(item.key, item.value);
        });
      }
    }
    let queryArgs = '';

    // 处理查询条件
    if (Array.isArray(toolbarProps.selectList)) {
      for (const condition of toolbarProps.selectList) {
        if (condition.key === 'date-query-key') {
          if (condition.value !== '') {
            const dateFrom = handleTimestamp(toolbarProps.dateList?.[0]?.value?.[0]);
            const dateTo = handleTimestamp(toolbarProps.dateList?.[0]?.value?.[1]);

            if (!dateFrom || !dateTo) {
              // mapData.value.SetPara('DTSearchKey', '');
              //mapData.value.SetPara('DTSearchWay', DTSearchWay.None);
              userRegedit.DTFrom = '';
              userRegedit.DTTo = '';
            } else {
              userRegedit.DTFrom = dateFrom;
              userRegedit.DTTo = dateTo;
              //mapData.value.SetPara('DTSearchKey', condition.value);
              //mapData.value.SetPara('DTSearchWay', DTSearchWay.ByDate);
            }
            //await mapData.value.Update();
            userRegedit.FK_MapData = FrmID;
            userRegedit.DTSearchKey = condition.value;
            userRegedit.SetPara('DTSearchWay', DTSearchWay.ByDate);
          }
          continue;
        }
        queryArgs += `@${condition.key}=${condition.value}`;
      }
    }
    // 添加隐藏查询条件
    const validVal = (val: any) => {
      return val != null && val != undefined && val !== '';
    };
    // 添加选中的树作为查询条件
    if (selectedTreeKey && validVal(selectedTreeVal)) {
      queryArgs += `@${selectedTreeKey}=${selectedTreeVal}`;
    }
    userRegedit.Vals = queryArgs;
    console.log(userRegedit);
    await userRegedit.Update();
    await userRegedit.RetrieveFromDBSources();
    tableConfigs.itemCount = userRegedit.GetParaInt('RecCount');
    tableConfigs.pageCount = Math.ceil(tableConfigs.itemCount / tableConfigs.pageSize);
  };

  const handlePageInfo = () => {
    tableConfigs.itemCount = userRegedit.GetParaInt('RecCount');
    tableConfigs.pageCount = Math.ceil(tableConfigs.itemCount / tableConfigs.pageSize);
  };
  const dateAttrsRef = ref<Recordable[]>([]);
  const attrsRef = ref<any[]>([]);
  const showColsRef = ref<any>([]);
  const enumList = ref<Recordable[]>([]);
  const enumMainList = ref<Recordable[]>([]);
  const mapExtList = ref<Recordable[]>([]);
  const toolbar = ref<{ Frm_Collection?: Recordable[] }>({});
  const dataSource = ref([]);
  const frmMethodsRef = ref<Recordable[]>([]);
  const athList = ref<Recordable[]>([]);
  const initDynamicEntity = async () => {
    const handler = getHandler();
    handler.AddPara('PageIdx', tableConfigs.page);
    handler.AddPara('PageSize', tableConfigs.pageSize);
    handler.AddJson(props.params);
    const res = await handler.DoMethodReturnJson('InitDynamicEntity');
    console.log('InitDynamicEntity', res);
    attrsRef.value = res.Attrs || [];
    // 给UserRegedit赋值
    userRegedit.Row.LoadObject(res.UserRegedit || {});
    // 给FrmDict赋值
    //mapData.value.Row.LoadObject(res.MapData);
    enumList.value = res.Sys_Enum || [];
    enumMainList.value = res.Sys_EnumMain || [];
    mapExtList.value = res.Sys_MapExt || [];
    frmMethodsRef.value = res.Frm_Method || [];
    toolbar.value = res.Toolbar || {};
    dataSource.value = res.DT || [];
    athList.value = res.AthList || [];
    tableConfigs.dataSource = dataSource.value;
    dateAttrsRef.value = res.DateAttrs || [];
    showColsRef.value = res.ShowCols || [];
    handlePageInfo();
    tableConfigs.ready = true;
  };

  const query = async () => {
    await updateUserRegedit();
    const handler = getHandler();
    handler.AddPara('PageIdx', tableConfigs.page);
    handler.AddPara('PageSize', tableConfigs.pageSize);
    handler.AddJson(props.params);
    const data = await handler.DoMethodReturnJson(queryMethod);
    const { DT = [] } = data;
    tableConfigs.dataSource = DT;
    tableConfigs.ready = true;
    await InitUserRegedit();
  };

  return {
    initDynamicEntity,
    getParams,
    query,
    frmBill,
    updateUserRegedit,
    InitUserRegedit,
    createUserRegedit,
    InitMapAttrs,
    InitToolbar,
    getHandler,
    handleBtnClick,
    deleteSelectItems,
    updateTreeKey,
    toolbarProps,
    tableConfigs,
  };
}
