import { createVNode, h, markRaw, reactive } from 'vue';
import type { ShallowRef, UnwrapNestedRefs } from 'vue';
import { TableConfig, ToolbarButtonDef, ToolbarProps } from '/@/components/SearchComponent/src/types';
import BaseComponentVue from '/@/WF/Comm/BaseComponent.vue';
import MyDict from '../MyDict.vue';
import { useRoute } from 'vue-router';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { Divider, Dropdown, Menu, MenuItem, Modal, Popconfirm, message } from 'ant-design-vue';
import { DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import WebUser from '/@/bp/web/WebUser';
import { UserRegedit } from '/@/bp/sys/UserRegedit';
import useFieldType from '/@/hooks/ens/useFieldType';
import { NEllipsis } from 'naive-ui/es/ellipsis';
import { NIcon } from 'naive-ui/es/icon';
import { DataTableColumn } from 'naive-ui/es/data-table';
import { IosLink } from '@vicons/ionicons4';
import { aoaToSheetXlsx } from '/@/components/Excel';
import { Method, MethodAttr, Methods } from '../Method/Method';
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
import { FrmDict } from '../FrmDict';
import { FrmBillAttr } from '../FrmBill';
import type { Ref } from 'vue';
import SubTableContainer from '../Components/ChildTable/SubTableContainer.vue';
import { RowData } from 'naive-ui/es/data-table/src/interface';
import { NTag } from 'naive-ui';
import { Collection } from '../Collection/Collection';
import RefMethodFuncVue from '/@/WF/Comm/RefMethodFunc.vue';
import { useMethodExecutor } from './useMethodExecutor';
import BSEntities from '/@/utils/gener/BSEntities';
// import MyFlowGener from '/@/WF/MyFlowGener.vue';
import { DBRole } from '/@/CCFast/CCBill/DBRole/DBRole';
import { DealExp } from '/@/utils/gener/StringUtils';
import { decodeResponseParams } from '/@/utils/request/decode';
import { FieldType } from '/@/bp/en/EnumLab';
import { userCCBillSelfLoader } from '/@/DataUser/OverrideFiles/CCBill_MyDict';
import { SearchBillExt } from '/@/DataUser/OverrideFiles/SearchBillExt';
import { getConfigColor } from '/@/utils/color';
import { FieldNumColors } from '/@/WF/Admin/FrmLogic/MapExt/FieldNumColor/FieldNumColor';
import { WaiGuaBaseEntity } from '../../../bp/UIEntity/WaiGuaBaseEntity';
import { getAppEnvConfig } from '/@/utils/env';
import { FrmAttr } from '/@/WF/TSClass/Admin/FrmAdm';
import type { ButtonType, ButtonShape } from 'ant-design-vue/lib/button';
type ModalArgs = {
  visible: boolean;
  params: Recordable;
  athInfo: Recordable;
};

export function useSearchDict(
  className: string,
  props: Recordable,
  queryMethod: string,
  baseComp: ShallowRef<InstanceType<typeof BaseComponentVue>>,
  drawer: Recordable | null = null,
  displayMode: Ref<string>,
  modalInfo: UnwrapNestedRefs<ModalArgs>,
  searchType: string,
  entityWG: Ref<WaiGuaBaseEntity | null>,
) {
  const route = useRoute();
  const getParams = (name: string) => props.params[name] || route.query[name];
  const userRegedit = reactive<UserRegedit>(new UserRegedit());
  const PKVal = WebUser.No + getParams('FrmID') + '_SearchAttrs';

  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const basePath = VITE_GLOB_API_URL;

  enum MethodModel {
    Search = 'Search',
    New = 'New',
    Analy = 'Analy',
    RPT = 'RPT',
    Delete = 'Delete',
    ExpExcel = 'ExpExcel',
    ImpExcel = 'ImpExcel',
    Func = 'Func',
    FlowNewEntity = 'FlowNewEntity',
    FlowEntityBatchStart = 'FlowEntityBatchStart',
    SingleDictGenerWorkFlows = 'SingleDictGenerWorkFlows',
    Link = 'Link',
    LinkCollection = 'LinkCollection',
  }
  const toolbarProps = reactive<ToolbarProps>({
    buttonList: [],
    keywordList: [],
    selectList: [],
  });

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
      userRegedit.OrderBy = sorter.columnKey;
      userRegedit.OrderWay = sorter.order === 'descend' ? 'DESC' : 'ASC';
      query();
    },
    onRowClick: (row: Recordable) => {
      delete props.params['title'];
      if (searchType != 'DBList')
        baseComp.value?.openDrawer({
          title: row.Title,
          width: '90%',
          component: markRaw(MyDictFrameWork),
          params: Object.assign({ RefPK: 'OID', WorkID: row.OID, FrmID: route.query.FrmID, IsReadonly: row.BillState === 100 ? 1 : 0 }, props.params),
          showFooter: false,
        });
    },
    ready: false,
  });

  const { beforeDelete } = userCCBillSelfLoader(props.params);

  let handlerInst: Nullable<HttpHandler> = null;
  const FrmID = getParams('FrmID');
  const mapData = new MapData(FrmID);

  const confirmDelete = async () => {
    try {
      await deleteSelectItemsMethodData();
      const handler = getHandler();
      handler.AddPara('FrmID', getParams('FrmID'));
      handler.AddPara('WorkIDs', tableConfigs.checkedItems.join(','));
      const msg = await handler.DoMethodReturnString('MyDict_Deletes');
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

  const handleBtnClick = async (type: string, buttonId = '', btnName = '操作') => {
    if (type === MethodModel.Search) {
      tableConfigs.page = 1;
      await query();
      return;
    }
    if (type === MethodModel.Analy) {
      return;
    }
    if (type === MethodModel.RPT) {
      return;
    }
    if (type === MethodModel.New) {
      const handler = getHandler();
      const data = await handler.DoMethodReturnString('MyDict_CreateBlankDictID');
      baseComp.value?.openDrawer({
        title: '新增',
        width: '90%',
        component: markRaw(MyDict),
        params: Object.assign({ WorkID: data, FrmID: route.query.FrmID }, props.params),
        showFooter: true,
      });
      return;
    }
    if (type === MethodModel.Delete) {
      deleteSelectItems();
      return;
    }
    if (type === MethodModel.ExpExcel) {
      const header = mapAttrs.map((attr) => attr.Name);
      console.log({ header });
      // 如何从前端获取Attrs？
      await updateUserRegedit();
      const handler = getHandler();
      const impData = await handler.DoMethodReturnJson<Recordable>('Search_ExpExt');
      const data = impData.map((item) => {
        return mapAttrs.map((attr) => {
          return item[attr.KeyOfEn + 'Text'] || item[attr.KeyOfEn + 'T'] || item[attr.KeyOfEn];
        });
      });
      aoaToSheetXlsx({ data, header, filename: mapData.Name + '.xlsx' });
      return;
    }
    if (type === MethodModel.ImpExcel) {
      if (!!drawer) drawer.visible = true;
      // message.warn('开发中');
      return;
    }
    if (type === MethodModel.Func) {
      if (tableConfigs.checkedItems.length === 0) {
        message.info('请选择数据');
        return;
      }
      const collection = new Collection(buttonId);
      await collection.RetrieveFromDBSources();

      const methodID = collection.MethodID;

      const attrs = new MapAttrs();
      await attrs.Retrieve('FK_MapData', methodID, 'Idx');

      const attrRowList = attrs.map((attr) => Object.fromEntries(attr.Row));

      attrRowList.forEach((item) => {
        item.MyDataType = parseInt(item.MyDataType);
        item.MyFieldType = FieldType.Normal;
      });
      const methodEntity = new Method(methodID);
      await methodEntity.Retrieve();
      const { execMethod } = useMethodExecutor();
      // 有参
      if (attrs.length > 0) {
        baseComp.value?.openDrawer({
          title: btnName,
          width: '900px',
          component: markRaw(RefMethodFuncVue),
          bindAttrs: {
            title: btnName,
            attrs: attrRowList,
            entityRef: methodEntity,
            methodName: methodEntity.No,
            onExec: (no: string, row: Recordable) => {
              for (const item of tableConfigs.checkedItems) {
                execMethod(no, row, getParams('FrmID'), item, '0');
              }
              if (entityWG.value != null) {
                entityWG.value?.BtnClick('SearchToolbar', btnName, tableConfigs.checkedItems.join(','), null);
              }
            },
          },
          showFooter: true,
        });
        // 无参
      } else {
        Modal.confirm({
          content: '确定要执行该方法吗？',
          icon: createVNode(ExclamationCircleOutlined),
          okText: '确定',
          async onOk() {
            for (const item of tableConfigs.checkedItems) {
              execMethod(methodEntity.No, {}, getParams('FrmID'), item, '0');
            }
            if (entityWG.value != null) {
              entityWG.value?.BtnClick('SearchToolbar', btnName, tableConfigs.checkedItems.join(','), null);
            }
            await query();
            return;
          },
          cancelText: '取消',
          onCancel() {
            Modal.destroyAll();
          },
        });
      }
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

        baseComp.value?.openIframe({
          title: collection.Name,
          src: '/#/WF/MyFlowGener?FK_Flow=' + data.FlowNo + '&FrmID=' + data.FrmID + '&WorkID=' + workID + '&FK_Node=' + (parseInt(data.FlowNo) + '01'),
        });
      } catch (e) {
        message.error(e as string);
      }

      return;
    }
    if (type === MethodModel.Link) {
      const collection = new Collection(buttonId);
      await collection.RetrieveFromDBSources();
      let src = collection.Tag1 || '';
      if (!src) {
        message.error('没有设置超链接的路径');
        return;
      }
      src = DealExp(src, route.query);
      src = DealExp(src, props.params);
      baseComp.value?.openIframe({
        title: collection.Name,
        src: src,
      });
      return;
    }
    //批量发起流程
    if (type === MethodModel.FlowEntityBatchStart) {
      const collection = new Collection(buttonId);
      await collection.RetrieveFromDBSources();
      const flowNo = collection.Tag1 || '';
      if (!flowNo) {
        message.error('批量发起的流程编号为空，请联系管理员');
        return;
      }
      if (tableConfigs.checkedItems.length === 0) {
        message.info('请选择要操作的行');
        return;
      }
      try {
        const handler = new HttpHandler('BP.CCBill.WF_CCBill');
        handler.AddPara('FK_Flow', flowNo);
        handler.AddPara('FromFrmID', collection.FrmID);
        handler.AddPara('MethodNo', buttonId);
        handler.AddPara('WorkIDs', tableConfigs.checkedItems.join(','));
        const data = await handler.DoMethodReturnString('MyDict_DoFlowBatchBaseData_StartFlow');
        const result = decodeResponseParams(data);
        baseComp.value?.openIframe({
          title: collection.Name,
          src: '/#/WF/MyFlowGener?FK_Flow=' + result['FK_Flow'] + '&WorkID=' + result['WorkID'],
        });
      } catch (e) {
        message.error(e as string);
      }
      return;
    }
    if (type === MethodModel.LinkCollection) {
      const collection = new Collection(buttonId);
      await collection.RetrieveFromDBSources();
      let src = collection.Tag1 || '';
      if (!src) {
        message.error('没有设置超链接的路径');
        return;
      }
      src = src.indexOf('?') == -1 ? src + '?1=1' : src;
      src += '&FrmID=' + collection.FrmID + '&&UserNo=@WebUser.No';

      if (src.indexOf('@FastreportHost') >= 0) {
        const appHandler = new HttpHandler('BP.KeLun.AppHandler');
        let FastreportHost = await appHandler.DoMethodReturnString('GetFastReaportHostUrl');
        FastreportHost = 'https://localhost:44343/Home';
        src = src.replace('@FastreportHost', FastreportHost);
      }
      src = DealExp(src, route.query);
      src = DealExp(src, props.params);
      baseComp.value?.openIframe({
        title: collection.Name,
        src: src,
      });
      return;
    }

    message.error('该方法类型未被定义：' + type);
  };
  const getHandler = () => {
    if (handlerInst) {
      return handlerInst;
    }
    const handler = new HttpHandler(className);
    handler.AddPara('FrmID', getParams('FrmID'));
    handlerInst = handler;
    return handler;
  };
  const InitToolbar = async () => {
    const handler = getHandler();
    // const collections = new Collections();
    // await collections.Retrieve('FrmID', getParams('FrmID'), 'Idx');
    const toolbarInfo = await handler.DoMethodReturnJson<Recordable>('Search_ToolBar');
    const btnList = toolbarInfo.Frm_Collection || [];
    await mapData.Retrieve();
    // 按钮，只保留查询
    toolbarProps.buttonList = [
      {
        key: 'query-btn',
        name: '查询',
        type: 'primary',
        shape: 'default',
        isDanger: false,
        isGhost: true,
        style: {
          marginRight: '12px',
        },
        onClick: () => {
          displayMode.value = 'table';
          handleBtnClick(MethodModel.Search);
        },
      },
      ...btnList
        .filter((btn) => btn.Name != '查询')
        .map((btn) => {
          return {
            key: btn.No,
            name: btn.Name,
            type: 'primary' as ButtonType,
            shape: 'default' as ButtonShape,
            isDanger: btn.MethodModel.toLowerCase() === 'delete',
            isGhost: true,
            isZD: btn.IsZD,
            style: {
              marginRight: '12px',
            },
            onClick: () => {
              handleBtnClick(btn.MethodModel, btn.No, btn.Name);
            },
          };
        }),
    ];
    const isSearchKey = mapData.GetParaString(FrmAttr.IsSearchKey);
    if (isSearchKey == '') {
      mapData.SetPara(FrmAttr.IsSearchKey, '1');
      await mapData.Update();
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
      const stringSearchKeys = mapData.GetValStringByKey('StringSearchKeys') || '';
      if (!!stringSearchKeys) {
        const stringSearchKeysT = mapData.GetValStringByKey('StringSearchKeysT') || '';
        const keys = stringSearchKeys.split(',');
        const keyNames = stringSearchKeysT.split(',');
        toolbarProps.keywordList = [];
        keys.forEach((item, idx) => {
          if (!!item) {
            toolbarProps.keywordList.push({
              label: keyNames[idx],
              key: item,
              value: userRegedit.GetParaString(item) || '',
              placeholder: '请输入' + keyNames[idx],
            });
          }
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
    const dtSearchWay = mapData.GetParaInt(FrmAttr.DTSearchWay) || 0;
    //按照指定字段查询
    const dtSearchKey = mapData.GetParaString(FrmAttr.DTSearchKey) || '';

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
        toolbarProps.selectList.push({
          display: 'select',
          options: [{ label: '全部' + en.Name, value: '' }, ...sysEnums.map((en) => ({ label: en.Lab, value: en.StrKey || en.IntKey, color: en.ValColor }))],
          isMultiSelect: en.IsMultiSelect == 1,
          label: '',
          key: en.KeyOfEn,
          value: en.IsMultiSelect == 0 ? '' : [],
        });
      } else if (en.IsEnum == 0 && en.UIBindKey == '') {
        toolbarProps.selectList.push({
          display: 'select',
          options: [
            { label: '', value: '' },
            { label: '是', value: '1' },
            { label: '否', value: '0' },
          ],
          isMultiSelect: en.IsMultiSelect == 1,
          label: '',
          key: en.KeyOfEn,
          value: en.IsMultiSelect == 0 ? '' : [],
        });
      } else {
        const sfTable = new BSEntity('BP.Sys.SFTable', en.UIBindKey);
        await sfTable.Retrieve();
        const ens = await sfTable.DoMethodReturnString('GenerDataOfJson');
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
  const { isBoolean, isTextArea, isDDL, isEnumSingle, isEnumCheckbox, isNumType, isPopText } = useFieldType();
  let mapAttrs: Recordable[] = [];
  const handleTimestamp = (ts: number | undefined | null) => {
    if (ts) {
      return dayjs(ts).locale('zh-cn').format('YYYY-MM-DD');
    }
    return '';
  };
  const loadAth = async (athKey: string, ref_oid: number) => {
    modalInfo.athInfo = {
      FK_MapData: props.frmId,
      MyPK: athKey,
    };
    modalInfo.params = {
      RefOID: ref_oid,
      FrmID: props.frmId,
      RefPKVal: props.workId,
      EnsName: props.dtlId,
      WorkID: props.workId,
    };
    modalInfo.visible = true;
  };
  const GetSelfByKey = (frmID, attr, formatFunc, row) => {
    if (formatFunc.includes(attr.KeyOfEn)) return SearchBillExt.ForamtFunc(frmID, attr.KeyOfEn, row) || row[attr.KeyOfEn];
    return row[attr.KeyOfEn + 'T'] || row[attr.KeyOfEn + 'Text'] || row[attr.KeyOfEn];
  };

  const frmDict = new FrmDict(props.params.FrmID);
  let athList: Recordable[] = [];
  const InitMapAttrs = async () => {
    const handler = getHandler();
    const res = await handler.DoMethodReturnJson('Search_MapAttr');
    const attrs = res.Attrs;
    mapAttrs = res.Attrs;
    const Enum = res.Sys_Enum;
    // const frmDict = new FrmDict(props.params.FrmID);
    await frmDict.Retrieve();
    const showModel = frmDict.ShowColModel;
    let showCols = frmDict.ShowCols || '';
    if (showCols === 'null') showCols = '';
    let actualAttrs = attrs;
    if (showModel == 1) {
      const cols = ['BillNo', 'Title'].concat(showCols.split(','));
      actualAttrs = attrs.filter((attr) => cols.includes(attr.KeyOfEn));
    }
    const formatFunc = (frmDict.ForamtFunc || '').split(',');

    const noIndex = actualAttrs.findIndex((attr) => attr.KeyOfEn == 'BillNo');
    if (noIndex !== -1 && noIndex !== 0) {
      const billAttr = actualAttrs.find((attr) => attr.KeyOfEn == 'BillNo');
      actualAttrs.splice(noIndex, 1);
      actualAttrs.splice(0, 0, billAttr);
    }
    const nameIndex = actualAttrs.findIndex((attr) => attr.KeyOfEn == 'Title');
    if (nameIndex !== -1 && nameIndex !== 1) {
      const nameAttr = actualAttrs.find((attr) => attr.KeyOfEn == 'Title');
      actualAttrs.splice(nameIndex, 1);
      actualAttrs.splice(1, 0, nameAttr);
    }

    // handle enum keys
    const enumAttrKeys = actualAttrs.filter((attr) => {
      return isEnumSingle(attr) || isEnumCheckbox(attr);
    });

    const colorConfigList = new FieldNumColors();
    await colorConfigList.Retrieve('FK_MapData', props.params.FrmID);

    // get enum config
    for (const attr of enumAttrKeys) {
      const uiBindKey = attr.UIBindKey;
      if (typeof uiBindKey == 'string' && uiBindKey.trim() !== '') {
        const enums = new SysEnums();
        await enums.Retrieve('EnumKey', uiBindKey);
        attr.enumConfig = enums;
      }
    }
    const colorSet = frmDict.ColorSet || '';
    const colorMap = getFieldColor(colorSet);
    // get form ath list
    // const athList = new FrmAttachments();
    // await athList.Retrieve('FK_MapData', FrmID);
    const athListEns = new BSEntities('BP.Sys.FrmAttachments');
    await athListEns.Retrieve('FK_MapData', FrmID);
    athList = athListEns.getData();

    tableConfigs.columns = [
      {
        type: 'selection',
        className: !!frmDict.RowColorSet ? 'class-name' : '',
        // fixed: 'left',
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
            const isReadonly = row.EntityState === 3 ? 1 : 0;
            return h(MyDictFrameWork, { params: Object.assign({ No: row.OID, RefNo: row.OID, FrmID: FrmID, IsReadonly: isReadonly }, props.params) });
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

    //判断表格内容:换行<->不换行
    const TableStyle = frmDict.TableStyle === 1 ? { tooltip: true } : false;
    // 过滤出自定义列
    const customColRenders = !!entityWG ? entityWG.value?.CustomColumnsRender || [] : [];
    const customColKeys = customColRenders.map((item) => item.key);

    tableConfigs.columns = tableConfigs.columns.concat(
      actualAttrs.map((attr) => {
        if (customColKeys.includes(attr.KeyOfEn)) {
          return customColRenders.find((item) => item.key === attr.KeyOfEn);
        }
        const cellData: DataTableColumn = {
          key: attr.KeyOfEn,
          title: attr.Name,
          width: attr.Width,
          align: 'left',
          className: !!frmDict.RowColorSet ? 'class-name' : '',
          ellipsis: TableStyle,
        };
        const keyOfcolor = colorMap.get(attr.KeyOfEn);
        if (isBoolean(attr)) {
          cellData.render = (row: Recordable) => {
            const color = getRowKeyColor(keyOfcolor, row, attr.KeyOfEn) || '';
            if (!!color) return h(NEllipsis, { style: { backgroundColor: color } }, { default: () => (row[attr.KeyOfEn] == 1 ? '是' : '否') });
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
            const color = getRowKeyColor(keyOfcolor, row, attr.KeyOfEn) || '';
            if (!!color) return h('div', { style: { width: '100%', backgroundColor: color } }, { default: () => val });
            return h(NEllipsis, { style: { maxWidth: attr.Width + 'px' } }, { default: () => val });
          };
          return cellData;
        }
        if (isEnumSingle(attr)) {
          cellData.render = (row: Recordable) => {
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
              { style: styleConfig, color: { color: colorVal, textColor: getTextColor(colorVal) } },
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
        // 如果是下拉框
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
        //如果是Pop弹窗
        if (isPopText(attr)) {
          cellData.render = (row: Recordable) => {
            let val = GetSelfByKey(frmDict.No, attr, formatFunc, row);
            if (val != null && val.toString().startsWith('Text@')) val = val.replace('Text@', '');
            if (val != null && val.toString().startsWith('Href@')) {
              val = val.replace('Href@', '');
              return h('a', { href: val, target: '_blank' }, row[attr.KeyOfEn]);
            }
            const color = getRowKeyColor(keyOfcolor, row, attr.KeyOfEn) || '';
            if (!!color) return h('div', { style: { width: '100%', backgroundColor: color } }, { default: () => val });
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
                'span',
                {
                  textAlign: 'right',
                  style,
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
                    textAlign: 'right',
                  },
                },
                {
                  default: () => row[attr.KeyOfEn],
                },
              );
            }
          };
          return cellData;
        }
        if (attr.KeyOfEn.toLowerCase() === 'title') {
          cellData.render = (row: Recordable) => {
            return h(
              'div',
              {
                style: { display: 'flex', alignItems: 'center' },
                onClick: () => {
                  tableConfigs?.onRowClick?.(row);
                },
              },
              [
                h(NIcon, { size: '16', color: 'var(--system-hover-bg-color)', style: { marginRight: '8px' } }, { default: () => h(IosLink) }),
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
        if (attr.KeyOfEn.toLowerCase() === 'billstate') {
          cellData.render = (row: Recordable) => {
            const key = attr.KeyOfEn;
            const rowMap = new Map([
              [1, '草稿'],
              [2, '编辑'],
              [3, '完成'],
              [4, '审核中'],
              [100, '归档'],
            ]);
            return h('div', {}, rowMap.get(row[key]) || '未知状态');
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
        if (attr.UIContralType == 6) {
          cellData.render = (row: Recordable) => {
            const color = getRowKeyColor(keyOfcolor, row, attr.KeyOfEn) || '';
            return h(
              'div',
              {
                style: { color: '#459dff', cursor: 'pointer', backgroundColor: color },
                onClick: () => {
                  const ath = athList.find((ath) => ath.NoOfObj === attr.KeyOfEn);
                  if (!ath) {
                    message.error('未找到附件信息');
                    return;
                  }
                  loadAth(ath.MyPK, row.OID);
                },
              },
              '查看',
            );
          };
          return cellData;
        }
        if (attr.UIContralType == 12) {
          cellData.render = (row: Recordable) => {
            const imgAthUrl = basePath + row[attr.KeyOfEn] + '?t=' + Math.random();
            return h('img', {
              style: { width: '35px' },
              src: imgAthUrl,
            });
          };
          return cellData;
        }
        cellData.render = (row: Recordable) => {
          const color = getRowKeyColor(keyOfcolor, row, attr.KeyOfEn) || '';
          if (!!color) return h(NEllipsis, { style: { backgroundColor: color } }, { default: () => row[attr.KeyOfEn] });
          return h(NEllipsis, {}, { default: () => row[attr.KeyOfEn] });
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
          const idx = tableConfigs.columns.findIndex((item) => item.key === titleConfig.children[0]);
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
          const idx = tableConfigs.columns.findIndex((item) => item.key === titleConfig.children[0]);
          tableConfigs.columns = tableConfigs.columns.filter((col) => !titleConfig.children.map((item) => item).includes(col.key));
          tableConfigs.columns.splice(idx, 0, multiTitle);
        }
      }
    }
    // 扩展的虚拟列 wanglu
    const virtualColumns = !!entityWG.value ? entityWG.value?.CustomColumnsRender || [] : [];
    if (virtualColumns.length != 0) {
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
    }

    const methods = new Methods();
    await methods.Retrieve(MethodAttr.FrmID, props.params.SystemNo);
    if (methods.length > 0)
      tableConfigs.columns.push({
        key: 'operation',
        title: '操作',
        width: 100,
        align: 'center',
        className: !!frmDict.RowColorSet ? 'class-name' : '',
        render: (row) => createOper(methods, row),
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

  const createOper = (method, record) => {
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
                    if (entityWG.value != null) {
                      entityWG.value?.BtnClick('SearchOpt', item.Name, '', record);
                    }
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
    } else if (toolbarProps.buttonList.find((btn) => btn.name == '删除')) {
      return h(
        Popconfirm,
        {
          title: `确定要删除记录 [${record.BillNo}] 吗`,
          onConfirm: async () => {
            //添加删除前事件
            tableConfigs.checkedItems = [record.OID];
            const valid = await beforeDelete(record, getParams('FrmID'), getParams('WorkID'));
            if (!valid) {
              return;
            }
            await confirmDelete();
          },
          okButtonProps: {
            danger: true,
          },
        },
        // { default: () => h(Tag, { color: '#ff5555' }, { default: () => '删除' }) },
        {
          default: () =>
            h('i', {
              style: {
                color: 'red',
              },
              class: 'icon-close',
            }),
        },
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
    } else {
      tableConfigs.itemCount = userRegedit.GetParaInt('RecCount');
      console.log({ userRegedit });
      tableConfigs.pageCount = Math.ceil(tableConfigs.itemCount / tableConfigs.pageSize);
    }
  };
  let selectedTreeKey = '';
  let selectedTreeVal = '';
  const updateTreeKey = (key: string, val: string) => {
    selectedTreeKey = key;
    selectedTreeVal = val;
    query();
  };
  const updateUserRegedit = async () => {
    const isSearchKey = mapData.GetParaInt(FrmAttr.IsSearchKey);
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
              //mapData.SetPara('DTSearchKey', '');
              //mapData.SetPara('DTSearchWay', DTSearchWay.None);
              userRegedit.DTFrom = '';
              userRegedit.DTTo = '';
            } else {
              userRegedit.DTFrom = dateFrom;
              userRegedit.DTTo = dateTo;
              //mapData.SetPara('DTSearchKey', condition.value);
              //mapData.SetPara('DTSearchWay', DTSearchWay.ByDate);
            }
            await mapData.Update();
            userRegedit.FK_MapData = FrmID;
            userRegedit.DTSearchKey = condition.value;
            userRegedit.SetPara('DTSearchWay', DTSearchWay.ByDate);
          }
          continue;
        }
        if (!!condition.value || condition.value === 0) queryArgs += `@${condition.key}=${condition.value}`;
      }
    }

    // 添加隐藏查询条件

    // 添加选中的树作为查询条件
    if (selectedTreeKey && selectedTreeVal) {
      queryArgs += `@${selectedTreeKey}=${selectedTreeVal}`;
    }
    userRegedit.Vals = queryArgs;
    //userRegedit.OrderBy = frmDict[FrmBillAttr.SortColumns];
    //userRegedit.OrderWay = frmDict[FrmBillAttr.SortBy];
    // userRegedit.RecCount = '';
    // userRegedit.SetPara('RecCount', '');
    await userRegedit.Update();
    await userRegedit.RetrieveFromDBSources();
    tableConfigs.itemCount = userRegedit.GetParaInt('RecCount');
    console.log({ userRegedit });
    tableConfigs.pageCount = Math.ceil(tableConfigs.itemCount / tableConfigs.pageSize);
  };
  const query = async () => {
    await updateUserRegedit();
    const handler = getHandler();
    handler.AddPara('PageIdx', tableConfigs.page);
    handler.AddPara('PageSize', tableConfigs.pageSize);
    const data = await handler.DoMethodReturnJson(queryMethod);
    //表不存在
    if (data == undefined) {
      const en = new DBRole('xxx');
      await en.RetrieveFromDBSources();
    }
    const { DT = [] } = data;
    tableConfigs.dataSource = DT;
    await InitUserRegedit();
    tableConfigs.ready = true;
  };
  return {
    getParams,
    query,
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
