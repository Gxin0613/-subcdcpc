import { createVNode, h, reactive } from 'vue';
import type { Ref, UnwrapNestedRefs } from 'vue';
import { TableConfig, ToolbarProps } from '/@/components/SearchComponent/src/types';
import { useRoute, useRouter } from 'vue-router';
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
import { FrmBBSs } from '/@/CCFast/CCBill/Components/FrmBBS/FrmBBS';
import { SearchFKEnums } from '/@/CCFast/CCBill/Admin/SearchCond/SearchFKEnum';
import BSEntity from '/@/utils/gener/BSEntity';
import { SysEnums } from '/@/WF/Admin/FrmLogic/SysEnum/SysEnum';
import { DTSearchWay } from '/@/bp/en/Map/SearchNormal';
import { MapData } from '/@/WF/Admin/FrmLogic/MapData';
import dayjs from 'dayjs';
import { MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
import { FrmDict } from '/@/CCFast/CCBill/FrmDict';
import { FrmBill, FrmBillAttr } from '/@/CCFast/CCBill/FrmBill';
import SubTableContainer from '/@/CCFast/CCBill/Components/ChildTable/SubTableContainer.vue';
import { RowData } from 'naive-ui/es/data-table/src/interface';
import { NTag } from 'naive-ui';
import { Collection } from '/@/CCFast/CCBill/Collection/Collection';
import { useMethodExecutor } from './useMethodExecutor';
import BSEntities from '/@/utils/gener/BSEntities';
import { DBRole } from '/@/CCFast/CCBill/DBRole/DBRole';
import { DealExp } from '/@/utils/gener/StringUtils';
import { decodeResponseParams } from '/@/utils/request/decode';
import { WaiGuaBaseEntity } from '../../../bp/UIEntity/WaiGuaBaseEntity';
type ModalArgs = {
  visible: boolean;
  params: Recordable;
  athInfo: Recordable;
};

export function useSearchDict(
  className: string,
  props: Recordable,
  queryMethod: string,
  popup: Recordable | null = null,
  displayMode: Ref<string>,
  modalInfo: UnwrapNestedRefs<ModalArgs>,
  loading: Ref<boolean>,
  error: Ref<boolean>,
  finished: Ref<boolean>,
  entityWG: Ref<WaiGuaBaseEntity | null>,
) {
  const route = useRoute();
  const router = useRouter();
  const getParams = (name: string) => props.params[name] || route.query[name];
  const userRegedit = reactive<UserRegedit>(new UserRegedit());
  const PKVal = WebUser.No + getParams('FrmID') + '_SearchAttrs';
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
    Link = 'Link',
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
    pageSize: 20,
    onPageNumberChange: (pageNum: number) => {
      tableConfigs.page = pageNum;
      query();
    },
    onPageSizeChange: (pageSize: number) => {
      tableConfigs.pageSize = pageSize;
      query();
    },
    onRowClick: (row: Recordable) => {
      delete props.params['title'];
      router.push({
        path: '/CCFastMobile/SearchRoute',
        name: 'SearchRoute',
        query: {
          title: row.Title,
          component: 'MyDictFrameWork',
          WorkID: row.OID,
          FrmID: route.query.FrmID,
          IsReadonly: row.BillState === 100 ? 1 : 0,
          ...props.params,
        },
      });
    },
    ready: false,
  });

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
      // re-render
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
      const frmBill = new FrmBill();
      frmBill.No = FrmID;
      await frmBill.RetrieveFromDBSources();
      if (frmBill.BillCheckModel == 'ByFlowNo' && frmBill.BillCheckTag.toString().includes(',') == false) {
        const handler = getHandler();
        handler.AddPara('FlowNo', frmBill.BillCheckTag);
        const data = await handler.DoMethodReturnString('MyBill_CreateBlankBillID');
        //格式为:  1001@003  , workid@flowNo.
        const strs = data.split('@');
        const flowNo = strs[1];
        const workID = strs[0];
        router.push({
          path: '/CCFastMobile/SearchRoute',
          query: {
            title: '新增',
            component: 'MyBill',
            WorkID: workID,
            Flow: flowNo,
            FrmID: route.query.FrmID,
            IsShowBar: 1,
            ...props.params,
          },
        });
        return;
      }
      const handler = getHandler();
      const data = await handler.DoMethodReturnString('MyBill_CreateBlankBillID');
      router.push({
        path: '/CCFastMobile/SearchRoute',
        query: {
          title: '新增',
          component: 'MyBill',
          WorkID: data,
          FrmID: route.query.FrmID,
          IsShowBar: 1,
          ...props.params,
        },
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
          return item[attr.KeyOfEn];
        });
      });
      aoaToSheetXlsx({ data, header, filename: mapData.Name + '.xlsx' });
      return;
    }
    if (type === MethodModel.ImpExcel) {
      if (!!popup) popup.visible = true;
      // message.warn('开发中');
      return;
    }
    if (type === MethodModel.Func) {
      const collection = new Collection(buttonId);
      await collection.RetrieveFromDBSources();

      const methodID = collection.MethodID;

      const attrs = new MapAttrs();
      await attrs.Retrieve('FK_MapData', methodID, 'Idx');
      const methodEntity = new Method(methodID);
      await methodEntity.Retrieve();

      const { execMethod } = useMethodExecutor();
      // 有参
      if (attrs.length > 0) {
        /*router.push({
          path: 'SearchRoute',
          name: 'SearchRoute',
          query: {
            title: btnName,
            component: 'RefMethodFuncVue',
            FrmID: route.query.FrmID,
            ...props.params,
          },
        });*/
        /* baseComp.value?.openDrawer({
          title: btnName,
          width: '900px',
          component: markRaw(RefMethodFuncVue),
          bindAttrs: {
            title: btnName,
            attrs,
            entityRef: methodEntity,
            methodName: methodEntity.No,
            onExec: (no: string, row: Recordable) => {
              for (const item of tableConfigs.checkedItems) {
                execMethod(no, row, getParams('FrmID'), item, '0');
              }
            },
          },
          showFooter: true,
        });*/
        // 无参
      } else {
        for (const item of tableConfigs.checkedItems) {
          execMethod(methodEntity.No, {}, getParams('FrmID'), item, '0');
        }
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

        router.push({
          path: '/CCFastMobile/SearchRoute',
          name: 'SearchRoute',
          query: {
            title: collection.Name,
            component: 'MyFlowGener',
            WorkID: workID,
            FrmID: data.FrmID,
            FK_Flow: data.FlowNo,
            FK_Node: parseInt(data.FlowNo) + '01',
          },
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
      router.push({
        path: '/CCFastMobile/SearchRoute',
        name: 'SearchRoute',
        query: {
          title: collection.Name,
          src: src,
        },
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
        router.push({
          path: '/CCFastMobile/SearchRoute',
          name: 'SearchRoute',
          query: {
            title: collection.Name,
            component: 'MyFlowGener',
            WorkID: result['WorkID'],
            FK_Flow: result['FK_Flow'],
          },
        });
      } catch (e) {
        message.error(e as string);
      }
      return;
    }
    if (entityWG.value != null && type === 'WaiGua') {
      entityWG.value?.BtnClick('SearchToolbar', btnName, tableConfigs.checkedItems.join(','), null);
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
    if (entityWG.value != null) {
      const btns = entityWG.value?.SearchToolbarBtns;
      if (!!btns) {
        btns.split(',').forEach((item) => {
          btnList.push({
            No: item,
            Name: item,
            MethodModel: 'WaiGua',
          });
        });
      }
    }
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
          handleBtnClick(MethodModel.Search, '查询');
        },
      },
      ...btnList
        .filter((btn) => btn.Name != '查询' && btn.Name != '分析' && btn.Name != '设置')
        .map((btn) => {
          return {
            key: btn.No,
            name: btn.Name,
            type: 'primary',
            shape: 'default',
            isDanger: btn.MethodModel.toLowerCase() === 'delete',
            isGhost: true,
            style: {
              marginRight: '12px',
            },
            onClick: () => {
              handleBtnClick(btn.MethodModel, btn.No, btn.Name);
            },
          };
        }),
    ];
    toolbarProps.keywordList = [
      {
        label: '关键字',
        key: 'SearchKey',
        value: userRegedit.SearchKey || '',
        placeholder: '请输入关键字',
      },
    ];

    toolbarProps.dateList = [
      {
        label: '日期范围',
        key: 'RDT',
        type: 'daterange',
        value: undefined,
        strValue: '',
        startPlaceholder: '从',
        endPlaceholder: '到',
        onChange: () => void 0,
      },
    ];

    const dtSearchWay = mapData?.value?.GetParaInt('DTSearchWay') || 0;
    //按照指定字段查询
    const dtSearchKey = mapData?.value?.GetParaString('DTSearchKey') || '';

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
        await sysEnums.Retrieve('EnumKey', en.KeyOfEn);
        toolbarProps.selectList.push({
          display: 'select',
          pickerVisible: false,
          valStr: '',
          options: [{ label: '' + en.Name, value: '', text: '' + en.Name }, ...sysEnums.map((en) => ({ label: en.Lab, text: en.Lab, value: en.StrKey || en.IntKey }))],
          isMultiSelect: en.IsMultiSelect == 1,
          label: en.Name,
          key: en.KeyOfEn,
          value: en.IsMultiSelect == 0 ? '' : [],
        });
      } else {
        const sfTable = new BSEntity('BP.Sys.SFTable', en.KeyOfEn);
        await sfTable.Retrieve();
        const ens = await sfTable.DoMethodReturnString('GenerDataOfJson');
        toolbarProps.selectList.push({
          pickerVisible: false,
          valStr: '',
          display: 'select',
          options: [{ label: '' + en.Name, value: '', text: '' + en.Name }, ...ens.map((en) => ({ label: en.Name, text: en.Name, value: en.No }))],
          isMultiSelect: en.IsMultiSelect == 1,
          label: en.Name,
          key: en.KeyOfEn,
          value: en.IsMultiSelect == 0 ? '' : [],
        });
      }
    }
  };
  const { isBoolean, isTextArea, isDDL, isEnumSingle, isEnumCheckbox, isPopText } = useFieldType();
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
  const frmDict = new FrmDict(getParams('FrmID'));
  let athList: Recordable[] = [];
  const InitMapAttrs = async () => {
    const handler = getHandler();
    const res = await handler.DoMethodReturnJson('Search_MapAttr');
    const attrs = res.Attrs;
    mapAttrs = res.Attrs;
    const Enum = res.Sys_Enum;
    // const frmDict = new FrmDict(props.params.FrmID);
    await frmDict.Retrieve();
    const ShowColModel = frmDict.ShowColModel;
    const ShowCols = frmDict.ShowCols;
    // if (showMobileCols === 'null') showMobileCols = '';
    let actualAttrs = attrs;
    if (ShowColModel == 1) {
      const cols = ['BillNo', 'Title'].concat(ShowCols.split(','));
      actualAttrs = attrs.filter((attr) => cols.includes(attr.KeyOfEn));
    }

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

    // get enum config
    for (const attr of enumAttrKeys) {
      const uiBindKey = attr.UIBindKey;
      if (typeof uiBindKey == 'string' && uiBindKey.trim() !== '') {
        const enums = new SysEnums();
        await enums.Retrieve('EnumKey', uiBindKey);
        attr.enumConfig = enums;
      }
    }

    // get form ath list
    // const athList = new FrmAttachments();
    // await athList.Retrieve('FK_MapData', FrmID);
    const athListEns = new BSEntities('BP.Sys.FrmAttachments');
    await athListEns.Retrieve('FK_MapData', FrmID);
    athList = athListEns.getData();

    tableConfigs.columns = [
      {
        type: 'selection',
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
    if (frmDict.ListDtlShowWay == 1) {
      tableConfigs.columns.push({
        type: 'expand',
        expandable: () => true,
        renderExpand: (rowData: RowData) => {
          // return JSON.stringify(rowData);
          return h(SubTableContainer, { frmId: FrmID, workId: rowData.OID });
        },
      });
    }
    // add normal columns
    tableConfigs.columns = tableConfigs.columns.concat(
      actualAttrs.map((attr) => {
        //attr.UIHeight = attr.TextModel === 3 ? 50 : 23;
        //attr.MyFieldType = 0;
        const cellData: DataTableColumn = {
          key: attr.KeyOfEn,
          title: attr.Name,
          width: attr.Width,
          align: 'left',
        };
        if (isBoolean(attr)) {
          cellData.render = (row: Recordable) => {
            return h(
              NEllipsis,
              {},
              {
                default: () => (row[attr.KeyOfEn] == 1 ? '是' : '否'),
              },
            );
          };
        }
        if (isTextArea(attr)) {
          cellData.render = (row: Recordable) => {
            return h(NEllipsis, { style: { maxWidth: attr.Width + 'px' } }, { default: () => row[attr.KeyOfEn] });
          };
        }

        if (isEnumSingle(attr)) {
          cellData.render = (row: Recordable) => {
            const color = attr?.enumConfig?.find((item) => item.IntKey == row[attr.KeyOfEn])?.ValColor || '#000';
            const styleConfig = {
              maxWidth: attr.Width + 'px',
              // color,
            };
            return h(NTag, { style: styleConfig, color: { color, textColor: 'white' } }, { default: () => row[`${attr.KeyOfEn}Text`] || row[`${attr.KeyOfEn}T`] });
          };
        }
        if (isEnumCheckbox(attr)) {
          cellData.render = (row: Recordable) => {
            const valueArr = Enum.filter((item) => item.EnumKey == attr.KeyOfEn && row[attr.KeyOfEn].includes(item.IntKey));
            const value: string[] = [];
            valueArr.forEach((i: any) => {
              value.push(i.Lab);
            });
            return h(NEllipsis, { style: { maxWidth: attr.Width + 'px' } }, { default: () => value.join(',') });
          };
        }
        // 如果是下拉框
        if (isDDL(attr)) {
          cellData.render = (row: Recordable) => {
            return h(
              NTag,
              {
                style: {
                  maxWidth: attr.Width + 'px',
                  minHeight: '28px',
                  height: 'auto',
                  whiteSpace: 'normal',
                },
              },
              { default: () => row[`${attr.KeyOfEn}Text`] || row[`${attr.KeyOfEn}T`] },
            );
          };
        }
        //如果是Pop弹窗
        if (isPopText(attr)) {
          cellData.render = (row: Recordable) => {
            return h(
              'div',
              {
                style: {
                  maxWidth: attr.Width + 'px',
                },
              },
              { default: () => row[`${attr.KeyOfEn}Text`] || row[`${attr.KeyOfEn}T`] || row[`${attr.KeyOfEn}`] },
            );
          };
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
        }
        if (attr.UIContralType == 6) {
          cellData.render = (row: Recordable) => {
            return h(
              'div',
              {
                style: { color: '#459dff', cursor: 'pointer' },
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
        }
        return cellData;
      }),
    ) as any;
    const methods = new Methods();
    await methods.Retrieve(MethodAttr.FrmID, props.params.SystemNo);
    tableConfigs.columns.push({
      key: 'operation',
      title: '操作',
      width: 100,
      align: 'center',
      render: (row) => createOper(methods, row),
    });
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
                    // @ts-ignore
                    router.push({
                      path: '/CCFastMobile/SearchRoute',
                      name: 'SearchRoute',
                      query: {
                        title: item.Name,
                        component: 'FrmBBS',
                        workID: record.OID.toString(),
                        ...props.params,
                      },
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
    } else if (toolbarProps.buttonList.find((btn) => btn.name == '删除')) {
      return h(
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
    }
  };
  let selectedTreeKey = '';
  let selectedTreeVal = '';
  const updateTreeKey = (key: string, val: string) => {
    selectedTreeKey = key;
    selectedTreeVal = val;
    query();
  };
  const resetUserRegedit = async () => {
    toolbarProps.keywordList?.forEach((item) => {
      item.value = '';
    });
    toolbarProps.dateList?.forEach((item) => {
      item.value = undefined;
      item.strValue = '';
    });
    toolbarProps.selectList?.forEach((item) => {
      item.value = '';
    });
    tableConfigs.page = 1;
    userRegedit.SearchKey = '';
    userRegedit.AtPara = '';
    userRegedit.DTFrom = '';
    userRegedit.DTTo = '';
    await userRegedit.Update();
  };
  const updateUserRegedit = async () => {
    userRegedit.SearchKey = toolbarProps.keywordList.length > 0 ? toolbarProps.keywordList[0].value : '';
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
    console.log(userRegedit);
    userRegedit.OrderBy = frmDict[FrmBillAttr.SortColumns];
    userRegedit.OrderWay = frmDict[FrmBillAttr.SortBy];
    // userRegedit.RecCount = '';
    // userRegedit.SetPara('RecCount', '');
    await userRegedit.Update();
    await userRegedit.RetrieveFromDBSources();
    tableConfigs.itemCount = userRegedit.GetParaInt('RecCount');
    console.log({ userRegedit });
    tableConfigs.pageCount = Math.ceil(tableConfigs.itemCount / tableConfigs.pageSize);
  };

  const loadMore = async () => {
    try {
      loading.value = true;
      if (tableConfigs.page >= tableConfigs.pageCount) {
        loading.value = false;
        finished.value = true;
        return;
      }
      tableConfigs.page++;
      await updateUserRegedit();
      const handler = getHandler();
      handler.AddPara('PageIdx', tableConfigs.page);
      handler.AddPara('PageSize', tableConfigs.pageSize);
      const data = await handler.DoMethodReturnJson(queryMethod);
      const { DT = [] } = data;
      tableConfigs.dataSource = [...tableConfigs.dataSource, ...DT];
      tableConfigs.ready = true;
    } catch (e) {
      error.value = true;
    } finally {
      loading.value = false;
    }
  };
  const query = async () => {
    await updateUserRegedit();
    const handler = getHandler();
    handler.AddPara('PageIdx', tableConfigs.page);
    handler.AddPara('PageSize', tableConfigs.pageSize);
    handler.AddJson(props.params);
    const data = await handler.DoMethodReturnJson(queryMethod);
    //表不存在
    if (data == undefined) {
      const en = new DBRole('xxx');
      await en.RetrieveFromDBSources();
    }
    const { DT = [] } = data;
    tableConfigs.dataSource = DT;
    tableConfigs.ready = true;
    await InitUserRegedit();
  };
  return {
    resetUserRegedit,
    getParams,
    loadMore,
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
