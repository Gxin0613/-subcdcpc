import { createVNode, h, markRaw, reactive, ref } from 'vue';
import type { ShallowRef, UnwrapNestedRefs } from 'vue';
import { TableConfig, ToolbarProps } from '/@/components/SearchComponent/src/types';
import BaseComponentVue from '/@/WF/Comm/BaseComponent.vue';
import { useRoute } from 'vue-router';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { Divider, Dropdown, Menu, MenuItem, Modal, Popconfirm, message, Button as AntButton, Tag } from 'ant-design-vue';
import { DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import WebUser from '/@/bp/web/WebUser';
import { UserRegedit } from '/@/bp/sys/UserRegedit';
import useFieldType from '/@/hooks/ens/useFieldType';
import { NEllipsis } from 'naive-ui/es/ellipsis';
import { DataTableColumn } from 'naive-ui/es/data-table';
import { aoaToSheetXlsx } from '/@/components/Excel';
import { Method, MethodAttr } from '../Method/Method';
import { FrmBBS } from '/@/WF/Comm/Components/FrmBBS';
import { FrmBBSs } from '../Components/FrmBBS/FrmBBS';
import { SearchFKEnums } from '../Admin/SearchCond/SearchFKEnum';
import BSEntity from '/@/utils/gener/BSEntity';
import { DTSearchWay } from '/@/bp/en/Map/SearchNormal';
import { MapData } from '/@/WF/Admin/FrmLogic/MapData';
import dayjs from 'dayjs';
import { MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
import type { Ref } from 'vue';
import SubTableContainer from '../Components/ChildTable/SubTableContainer.vue';
import { RowData } from 'naive-ui/es/data-table/src/interface';
import { NTag } from 'naive-ui';
import { Collection } from '../Collection/Collection';
import RefMethodFuncVue from '/@/WF/Comm/RefMethodFunc.vue';
import { useMethodExecutor } from './useMethodExecutor';
// import MyFlowGener from '/@/WF/MyFlowGener.vue';
import { DealExp } from '/@/utils/gener/StringUtils';
import { decodeResponseParams } from '/@/utils/request/decode';
import { FieldType } from '/@/bp/en/EnumLab';
import MyEntityNoName from '../MyEntityNoName.vue';
import MyDictFrameWork from '../MyDictFrameWork.vue';
import { WaiGuaBaseEntity } from '../../../bp/UIEntity/WaiGuaBaseEntity';
import { getAppEnvConfig } from '/@/utils/env';
import { FrmAttr } from '/@/WF/TSClass/Admin/FrmAdm';
import { GloComm } from '/@/WF/Comm/GloComm';
import { CCBPMRunModel, SystemConfig } from '/@/bp/difference/SystemConfig';
import { DataType } from '/@/bp/en/DataType';
import type { ButtonType, ButtonShape } from 'ant-design-vue/lib/button';
import { GPEActiveDDLSFTables } from '/@/WF/Admin/FrmLogic/MapExt/ActiveDDL/GPEActiveDDLSFTable';
import DBAccess from '/@/utils/gener/DBAccess';
import { AtPara } from '/@/bp/da/AtPara';
import { FieldNumColors } from '/@/WF/Admin/FrmLogic/MapExt/FieldNumColor/FieldNumColor';
import { getConfigColor } from '/@/utils/color';
type ModalArgs = {
  visible: boolean;
  params: Recordable;
  athInfo: Recordable;
};

export function useSearchNoName(
  className: string,
  props: Recordable,
  queryMethod: string,
  baseComp: ShallowRef<InstanceType<typeof BaseComponentVue>>,
  drawer: Recordable | null = null,
  displayMode: Ref<string>,
  modalInfo: UnwrapNestedRefs<ModalArgs>,
  searchType: string,
  loading: Ref<boolean>,
  entityWG: Ref<WaiGuaBaseEntity | null>,
) {
  const route = useRoute();
  const getParams = (name: string) => props.params[name] || route.query[name];
  const userRegedit = reactive<UserRegedit>(new UserRegedit());
  const PKVal = WebUser.No + getParams('FrmID') + '_SearchAttrs';

  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const basePath = VITE_GLOB_API_URL;
  let activeSortColumn = '';
  let sortOrder = '';
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
    primaryKey: 'No',
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
      delete props.params['title'];
      let isReadonly = row.EntityState === 3 ? 1 : 0;
      isReadonly = searchType === 'SearchAskFrm' ? (row.RecNo != WebUser.No ? 1 : 0) : isReadonly;
      baseComp.value?.openDrawer({
        title: row.Name,
        width: '70%',
        component: markRaw(MyDictFrameWork),
        params: Object.assign({ No: row.No, RefNo: row.No, FrmID: route.query.FrmID, IsReadonly: isReadonly }, props.params),
        showFooter: false,
      });
    },
    ready: false,
  });

  let handlerInst: Nullable<HttpHandler> = null;
  const FrmID = getParams('FrmID');
  const mapData = ref(new MapData(FrmID));
  const sysLang = WebUser.SysLang;
  const confirmDelete = async () => {
    try {
      await deleteSelectItemsMethodData();
      const handler = getHandler();
      handler.AddPara('FrmID', getParams('FrmID'));
      handler.AddPara('Nos', tableConfigs.checkedItems.join(','));
      const msg = await handler.DoMethodReturnString('MyEntityNoName_Deletes');
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
    const methods = frmMethodsRef.value;
    methods.forEach((method: MethodAttr) => {
      if (method[MethodAttr.MethodModel] == 'FrmBBS') {
        tableConfigs.checkedItems.forEach(async (item) => {
          const frmBBSs = new FrmBBSs();
          await frmBBSs.Delete('WorkID', item, 'FrmID', getParams('FrmID'));
        });
      }
    });
  };

  const isCreateAction = ref(false);

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
      if (mapData.value.NoGenerModel === 1) {
        const myurl = GloComm.UrlGPN('GPN_GenerNo', '', '&FrmID=' + mapData.value.No);
        baseComp.value.openDrawerByUrl('新增', myurl, '800px', {});
        return;
      }
      const handler = getHandler();
      delete handler.params.Nos;
      const data = await handler.DoMethodReturnString('MyDict_CreateBlankDictID');
      delete props.params['RDT'];
      baseComp.value?.openDrawer({
        title: '新增',
        width: '70%',
        component: markRaw(MyEntityNoName),
        params: Object.assign({ No: data, RefNo: data, FrmID: route.query.FrmID }, props.params, { isFixedbar: true }),
        showFooter: true,
      });
      isCreateAction.value = true;
      return;
    }
    if (type === MethodModel.Delete) {
      deleteSelectItems();
      return;
    }
    if (type === MethodModel.ExpExcel) {
      const header = mapAttrs.map((attr) => attr.Name);
      // 如何从前端获取Attrs？
      await updateUserRegedit();
      const handler = getHandler();
      const impData = await handler.DoMethodReturnJson<Recordable>('Search_ExpExt');
      const data = impData.map((item) => {
        return mapAttrs.map((attr) => {
          return item[attr.KeyOfEn + 'Text'] || item[attr.KeyOfEn + 'T'] || item[attr.KeyOfEn];
        });
      });
      aoaToSheetXlsx({ data, header, filename: mapData.value.Name + '.xlsx' });
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
          src: '/#/WF/MyFlowGener?FlowNo=' + data.FlowNo + '&FrmID=' + data.FrmID + '&WorkID=' + workID + '&NodeID=' + (parseInt(data.FlowNo) + '01'),
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
      const flowNo = collection.FlowNo || collection.Tag1;
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
        handler.AddPara('FlowNo', flowNo);
        handler.AddPara('FromFrmID', collection.FrmID);
        handler.AddPara('MethodNo', buttonId);
        handler.AddPara('WorkIDs', tableConfigs.checkedItems.join(','));
        const data = await handler.DoMethodReturnString('MyDict_DoFlowBatchBaseData_StartFlow');
        const result = decodeResponseParams(data);
        baseComp.value?.openIframe({
          title: collection.Name,
          src: '/#/WF/MyFlow?FlowNo=' + flowNo + '&WorkID=' + result['WorkID'],
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
    if (entityWG.value != null && type === 'WaiGua') {
      const result = await entityWG.value?.BtnClick('SearchToolbar', btnName, tableConfigs.checkedItems.join(','), {});
      if (!!result && result?.hasOwnProperty?.('ReturnType')) {
        baseComp.value?.handleGPNCallback(result, btnName);
      }
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
    // 清空现有的下拉查询条件，避免重复添加
    toolbarProps.selectList = [];
    let btnList = toolbar.value.Frm_Collection || [];
    if (parseInt(mapData.value.EntityType) === 4) {
      btnList = btnList.filter((btn) => btn.MethodID != 'New' && btn.MethodID != 'Delete' && btn.MethodID != 'ImpExcel');
    }
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
    // await mapData.Retrieve();
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
          handleBtnClick(MethodModel.Search, 'Search', '查询');
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
    const isSearchKey = mapData.value.GetParaString(FrmAttr.IsSearchKey);
    if (isSearchKey == '') {
      mapData.value.SetPara(FrmAttr.IsSearchKey, '0');
      await mapData.value.Update();
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
      const stringSearchKeys = mapData.value.GetParaString('StringSearchKeys') || '';
      if (!!stringSearchKeys) {
        const stringSearchKeysT = mapData.value.GetParaString('StringSearchKeysT') || '';
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
    const dtSearchWay = mapData.value.GetParaInt(FrmAttr.DTSearchWay) || 0;
    //按照指定字段查询
    const dtSearchKey = mapData.value.GetParaString(FrmAttr.DTSearchKey) || '';

    const searchDateFrom = userRegedit.DTFrom || '';
    const searchDateTo = userRegedit.DTTo || '';
    let dateVal: any = undefined;
    if (searchDateFrom && searchDateTo) {
      dateVal = [dayjs(searchDateFrom, 'YYYY-MM-DD'), dayjs(searchDateTo, 'YYYY-MM-DD')];
    }
    const targetDateAttrs = dateAttrsRef.value.filter((attr) => {
      if (dtSearchWay === 1) return true;
      if (dtSearchWay === 2 && !!dtSearchKey) {
        return dtSearchKey.split(',').includes(attr.KeyOfEn);
      }
      return true;
    });
    toolbarProps.dateList = [
      {
        label: '日期范围',
        key: 'RDT',
        type: 'daterange',
        value: dateVal,
        strValue: '',
        startPlaceholder: '从',
        endPlaceholder: '到',
        onChange: () => void 0,
      },
    ];

    if (dtSearchWay == 1 || dtSearchWay == 2) {
      if (targetDateAttrs.length > 0) {
        toolbarProps.selectList.push({
          display: 'select',
          options: targetDateAttrs.map((attr) => ({ label: attr.Name, value: attr.KeyOfEn })),
          isMultiSelect: false,
          label: '日期字段',
          value: 'RDT',
          key: 'date-query-key',
        });
      }
    }

    console.log({ dtSearchWay, dtSearchKey });

    // 解析默认值的辅助函数
    const parseDefaultValue = (key: string, defVal: string, isMultiSelect: boolean) => {
      const urKey = userRegedit.GetParaString(key);
      if (urKey && urKey.trim() !== '') {
        return isMultiSelect ? urKey.split(',') : urKey;
      }

      const paraObj = new AtPara(userRegedit.Vals);
      const valKey = paraObj.GetValStrByKey(key);
      if (valKey && valKey.trim() !== '') {
        return isMultiSelect ? valKey.split(',') : valKey;
      }

      if (!defVal || defVal.trim() === '') {
        return isMultiSelect ? [] : '';
      }
      // 如果是多选，按逗号分割
      if (isMultiSelect) {
        return defVal
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item !== '');
      }

      return defVal.trim();
    };

    const enums = new SearchFKEnums();
    await enums.Retrieve('FrmID', getParams('FrmID'), 'Idx');
    const activeDDLConfig = new GPEActiveDDLSFTables();
    await activeDDLConfig.Retrieve('FrmID', getParams('FrmID'), 'ExtModel', 'ActiveDDL');
    for (const en of enums) {
      const activeDDL = activeDDLConfig.find((ddl) => ddl.AttrOfOper === en.KeyOfEn);
      const defaultValue = parseDefaultValue(en.KeyOfEn, en.DefVal || '', en.IsMultiSelect == 1);
      const readonly = en.IsReadonly == '1' || false;
      if (en.IsEnum == 1) {
        const sysEnums = enumList.value.filter((enumItem) => enumItem.EnumKey === en.UIBindKey);
        const config = {
          display: 'select',
          options: [{ label: '' + en.Name, value: '' }, ...sysEnums.map((en) => ({ label: en.Lab, value: en.StrKey || en.IntKey + '', color: en.ValColor }))],
          isMultiSelect: en.IsMultiSelect == 1,
          label: '',
          key: en.KeyOfEn,
          value: defaultValue,
          readonly,
          onChange: async (val: any) => {
            if (!activeDDL) return;
            const activeKey = activeDDL.AttrsOfActive;
            let sql = '';
            if (activeDDL.DoWay == '1') {
              sql = activeDDL.Doc;
            } else if (activeDDL.DoWay == '2') {
              sql = activeDDL.Tag1;
            } else {
              return;
            }
            // sql = activeDDL.DoWay == '1' ? activeDDL.Doc : ;
            const selectItem = toolbarProps.selectList.find((item) => item.key === activeKey);
            if (!!selectItem) {
              sql = sql.replace(/@Key/g, val);
              const resList = await DBAccess.RunSQLReturnTable(sql, activeDDL.FK_DBSrc);
              selectItem.options = [{ label: '' + selectItem.label, value: '' }, ...resList.map((item) => ({ label: item.Name, value: item.No }))];
            }
          },
        };
        toolbarProps.selectList.push(config as any);
      } else if (en.UIBindKey == '') {
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
          value: defaultValue,
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
          value: defaultValue,
          readonly,
          onChange: async (val: any) => {
            debugger;
            if (!activeDDL) return;
            const activeKey = activeDDL.AttrsOfActive;
            let sql = '';
            if (activeDDL.DoWay == '1') {
              sql = activeDDL.Doc;
            } else if (activeDDL.DoWay == '2') {
              sql = activeDDL.Tag1;
            } else {
              return;
            }
            const selectItem = toolbarProps.selectList.find((item) => item.key === activeKey);
            if (!!selectItem) {
              sql = sql.replace(/@Key/g, val);
              const resList = await DBAccess.RunSQLReturnTable(sql, activeDDL.FK_DBSrc);
              selectItem.options = [{ label: '' + selectItem.label, value: '' }, ...resList.map((item) => ({ label: item.Name, value: item.No }))];
            }
          },
        });
      }
    }
  };
  const { isBoolean, isTextArea, isDDL, isEnumSingle, isEnumCheckbox, isPopText, isNumType, isLink, isHandWriting } = useFieldType();
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
  const imgPreview = (url) => {
    modalInfo.params = {
      Type: 'ImgPreview',
      ImgUrl: url,
      width: '600px',
    };
    modalInfo.visible = true;
  };
  // const frmDict = new FrmDict(props.params.FrmID);
  // let athList: Recordable[] = [];
  const prefix = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
  const InitMapAttrs = async () => {
    // const handler = getHandler();
    // const res = await handler.DoMethodReturnJson('Search_MapAttr');
    const attrs = attrsRef.value;
    mapAttrs = attrsRef.value;
    const Enum = enumList.value as Recordable[];
    const mapExts = mapExtList.value;
    // const frmDict = new FrmDict(props.params.FrmID);
    // await frmDict.Retrieve();
    const showModel = mapData.value.ShowColModel;
    const sortFields = mapData.value.GetParaString('SortFields') || '';

    const showCols = showColsRef.value;
    let actualAttrs = attrsRef.value;
    if (showModel == 1) {
      const visibleColSet = new Set<string>(['No', 'Name', ...showCols.map((sc) => sc.AttrOfOper)]);
      actualAttrs = attrs.filter((attr) => visibleColSet.has(attr.KeyOfEn));
    }
    const noIndex = actualAttrs.findIndex((attr) => attr.KeyOfEn == 'No');
    if (noIndex !== -1 && noIndex !== 0) {
      const billAttr = actualAttrs.find((attr) => attr.KeyOfEn == 'No');
      if (billAttr) {
        actualAttrs.splice(noIndex, 1);
        actualAttrs.splice(0, 0, billAttr);
      }
    }
    const nameIndex = actualAttrs.findIndex((attr) => attr.KeyOfEn == 'Name');
    if (nameIndex !== -1 && nameIndex !== 1) {
      const nameAttr = actualAttrs.find((attr) => attr.KeyOfEn == 'Name');
      if (nameAttr) {
        actualAttrs.splice(nameIndex, 1);
        actualAttrs.splice(1, 0, nameAttr);
      }
    }
    // handle enum keys
    const enumAttrKeys = actualAttrs.filter((attr) => {
      return isEnumSingle(attr) || isEnumCheckbox(attr);
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
    const colorSet = mapData.value.ColorSet || '';
    const colorMap = getFieldColor(colorSet);

    const colorConfigList = new FieldNumColors();
    await colorConfigList.Retrieve('FK_MapData', props.params.FrmID);
    // get form ath list
    // const athList = new FrmAttachments();
    // await athList.Retrieve('FK_MapData', FrmID);
    // const athListEns = new BSEntities('BP.Sys.FrmAttachments');
    // await athListEns.Retrieve('FK_MapData', FrmID);
    // athList = athListEns.getData();

    tableConfigs.columns = [
      {
        type: 'selection',
        className: !!mapData.value.RowColorSet ? 'class-name' : '',
        // fixed: 'left',
      },
    ];
    const showNumIndex = mapData.value.ShowNumIndex;
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

    console.log(mapData.value);
    // render subtable if config is true
    if (mapData.value.ListDtlShowWay >= 1) {
      if (mapData.value.ListDtlShowWay == 1 || mapData.value.ListDtlShowWay == 2) {
        tableConfigs.columns.push({
          type: 'expand',
          // 给展开图标所在单元格一个可识别的类，便于行双击时排除
          className: 'expand-trigger-cell',
          expandable: () => true,
          renderExpand: (rowData: RowData) => {
            // return JSON.stringify(rowData);
            return h(SubTableContainer, { frmId: FrmID, workId: rowData.No, displayMode: mapData.value.ListDtlShowWay });
          },
        });
      } else if (mapData.value.ListDtlShowWay == 3) {
        tableConfigs.columns.push({
          type: 'expand',
          // 给展开图标所在单元格一个可识别的类，便于行双击时排除
          className: 'expand-trigger-cell',
          expandable: () => true,
          renderExpand: (row: RowData) => {
            let isReadonly = row.EntityState === 3 ? 1 : 0;
            isReadonly = searchType === 'SearchAskFrm' ? (row.RecNo != WebUser.No ? 1 : 0) : isReadonly;
            return h(MyDictFrameWork, { params: Object.assign({ No: row.No, RefNo: row.No, FrmID: route.query.FrmID, IsReadonly: isReadonly }, props.params) });
          },
        });
      } else if (mapData.value.ListDtlShowWay == 4) {
        tableConfigs.columns.push({
          type: 'expand',
          // 给展开图标所在单元格一个可识别的类，便于行双击时排除
          className: 'expand-trigger-cell',
          expandable: () => true,
          renderExpand: (row: RowData) => {
            return h(SubTableContainer, { frmId: FrmID, workId: row.No, displayMode: mapData.value.ListDtlShowWay, mainData: row });
          },
        });
      }
    }
    //判断表格内容:换行<->不换行
    const getOverflowMode = () => {
      if (!mapData.value.OverflowMode || mapData.value.OverflowMode == 0) {
        return { tooltip: true };
      }
      return false;
    };

    //文本溢出是否换行
    const getChangeRow = () => {
      if (!mapData.value.OverflowMode || mapData.value.OverflowMode == 0) {
        return { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
      }
      return { whiteSpace: 'normal', wordBreak: 'break-all' };
    };

    // 过滤出自定义列
    const customColRenders = entityWG.value?.CustomColumnsRender || [];
    const customColKeys = customColRenders.map((item) => item.key);
    tableConfigs.columns = tableConfigs.columns.concat(
      actualAttrs.map((attr) => {
        if (customColKeys.includes(attr.KeyOfEn)) {
          return customColRenders.find((item) => item.key === attr.KeyOfEn);
        }
        //attr.UIHeight = attr.TextModel === 3 ? 50 : 23;
        //attr.MyFieldType = 0;
        const cellData: DataTableColumn = {
          key: attr.KeyOfEn,
          title: attr['Name' + sysLang] || attr.Name,
          width: attr.Width,
          align: 'left',
          className: !!mapData.value.RowColorSet ? 'class-name' : '',
          ellipsis: getOverflowMode(),
          sorter: (sortFields + ',').includes(attr.KeyOfEn + ','),
        };
        const keyOfcolor = colorMap.get(attr.KeyOfEn);
        if (isBoolean(attr)) {
          cellData.render = (row: Recordable) => {
            const color = getRowKeyColor(keyOfcolor, row, attr.KeyOfEn) || '';
            if (!!color)
              return h(
                NEllipsis,
                { style: { backgroundColor: color } },
                {
                  default: () => (row[attr.KeyOfEn] == 1 ? '是' : '否'),
                },
              );
            return h(
              NEllipsis,
              {},
              {
                default: () => (row[attr.KeyOfEn] == 1 ? '是' : '否'),
              },
            );
          };
          return cellData;
        }

        if (isTextArea(attr)) {
          cellData.render = (row: Recordable) => {
            return h(NEllipsis, { style: { maxWidth: attr.Width + 'px' } }, { default: () => row[attr.KeyOfEn] });
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
        if (attr.KeyOfEn.toLowerCase() === 'no') {
          cellData.render = (row: Recordable) => {
            const key = attr.KeyOfEn;
            // const rowMap = new Map([
            //   [1, { text: '草稿', color: 'blue' }],
            //   [2, { text: '编辑', color: 'yellow' }],
            //   [3, { text: '归档', color: 'green' }],
            //   [4, { text: '作废', color: 'red' }],
            // ]);
            // const stateInfo = rowMap.get(row['EntityState']);
            // return h('div', [h(Tag, { color: stateInfo?.color || '#333' }, () => stateInfo?.text || '未知状态'), h('span', row[key])]);
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
                    //   return stateInfo?.text[0] || '未知状态';
                    // }),
                    h('span', row[key]),
                  ];
                },
              },
            );
          };
          return cellData;
        }
        if (attr.KeyOfEn.toLowerCase() === 'name') {
          cellData.width = Math.max(150, attr.Width);
          cellData.align = 'left';
          cellData.render = (row: Recordable) => {
            const rowMap = new Map([
              [1, { text: '草稿', color: 'blue' }],
              [2, { text: '编辑', color: 'yellow' }],
              [3, { text: '归档', color: 'green' }],
              [4, { text: '作废', color: 'red' }],
            ]);
            const stateInfo = rowMap.get(row['EntityState']);
            return h(
              NEllipsis,
              {
                style: {
                  minWidth: Math.max(150, attr.Width) - 20 + 'px',
                },
              },
              {
                default: () => {
                  return h(
                    'div',
                    {
                      style: { display: 'flex', alignItems: 'center', ...(getChangeRow() as any) },
                      onClick: () => {
                        tableConfigs?.onRowClick?.(row);
                      },
                    },
                    [
                      h(Tag, { color: stateInfo?.color || '#333' }, () => {
                        if (row['EntityState'] === 3) return stateInfo?.text[1] || '未知状态';
                        else return stateInfo?.text[0] || '未知状态';
                      }),
                      // h(NIcon, { size: '16', color: 'var(--system-hover-bg-color)', style: { marginRight: '8px' } }, { default: () => h(IosLink) }),
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
        //如果是Pop弹窗
        if (isPopText(attr)) {
          //是否使用了保密格式
          const exts = mapExts.filter((mapExt) => mapExt.AttrOfOper === attr.KeyOfEn);
          let doWay = '';
          if (exts.length > 0) doWay = exts[0]['DoWay'] || '';
          cellData.render = (row: Recordable) => {
            return h(
              'span',
              {
                style: {
                  MinWidth: attr.Width + 'px',
                  display: 'inline-block',
                },
              },
              {
                default: () => {
                  let val = row[`${attr.KeyOfEn}Text`] || row[`${attr.KeyOfEn}T`] || row[`${attr.KeyOfEn}`];
                  if (doWay === 'IDCard') val = val.substring(0, 3) + '***********' + val.substring(val.length - 2, val.length);
                  if (doWay === 'Tel') val = val.substring(0, 3) + '******' + val.substring(val.length - 3, val.length);
                  if (doWay === 'Bank') val = val.substring(0, 4) + '************' + val.substring(val.length - 4, val.length);
                  return val;
                },
              },
            );
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
                  const ath = athList.value.find((ath) => ath.NoOfObj === attr.KeyOfEn);
                  if (!ath) {
                    message.error('未找到附件信息');
                    return;
                  }
                  loadAth(ath.MyPK, row.No);
                },
              },
              '查看',
            );
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
        if (isNumType(attr)) {
          attr.Key = attr.KeyOfEn;
          cellData.render = (row: Recordable) => {
            const style = getConfigColor(row, attr, colorConfigList);
            console.log('style', style);
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
                {
                  default: () => {
                    if (attr.MyDataType == DataType.AppMoney) {
                      //金额类型补0操作
                      const value = row[`${attr.KeyOfEn}`];
                      if (attr.MyDataType !== DataType.AppMoney) {
                        return value;
                      }
                      if (value === null || value === undefined || value === '') {
                        return '';
                      }
                      const strValue = String(value);
                      const [integerPart, decimalPart = ''] = strValue.split('.');
                      if (!strValue.includes('.')) {
                        return `${integerPart}.00`;
                      }
                      if (decimalPart.length === 1) {
                        return `${integerPart}.${decimalPart}0`;
                      }
                      return strValue;
                    } else return row[`${attr.KeyOfEn}`];
                  },
                },
              );
            }
          };
          return cellData;
        }
        cellData.render = (row: Recordable) => {
          const color = getRowKeyColor(keyOfcolor, row, attr.KeyOfEn) || '';
          if (!!color) return h(NEllipsis, { style: { backgroundColor: color } }, { default: () => row[attr.KeyOfEn] });
          return h(NEllipsis, {}, { default: () => row[attr.KeyOfEn + 'Text'] || row[attr.KeyOfEn + 'T'] || row[attr.KeyOfEn] });
        };
        return cellData;
      }),
    ) as any;
    // 过滤一级表头
    const lv1Titles = mapData.value.GetParaString('MultiTitle');
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
    const lv2Titles = mapData.value.GetParaString('MultiTitle1');
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
    // 添加虚拟列
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
    const methods = frmMethodsRef.value;
    let entitybtns: string[] = [];
    if (entityWG.value != null) {
      const btns = entityWG.value?.SearchOptBtns;
      if (!!btns && typeof btns === 'string') {
        entitybtns = btns.split(',');
      }
    }
    const isHaveDelete = toolbarProps.buttonList.find((btn) => btn.name == '删除');

    tableConfigs.columns.push({
      key: 'operation',
      title: '操作',
      width: 100,
      align: 'center',
      className: !!mapData.value.RowColorSet ? 'class-name' : '',
      render: (row) => createOper(methods, row, entitybtns, isHaveDelete),
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

  const createOper = (method, record, entitybtns, isHaveDelete) => {
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
                      params: Object.assign({ workID: record.No.toString() }, props.params),
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
                  ['onclick']: async () => {
                    if (entityWG.value != null) {
                      const result = await entityWG.value?.BtnClick('SearchOpt', item.Name, '', record);
                      if (!!result && result?.hasOwnProperty?.('ReturnType')) {
                        baseComp.value?.handleGPNCallback(result, item);
                      }
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
        'span',
        {
          placement: 'bottom',
          style: {
            color: '#999',
            fontSize: '12px',
          },
        },
        '无',
        // {
        // default: () => h('a', { style: { color: 'var(--system-hover-bg-color)' } }, '开发中' /* ['开发中', h(DownOutlined)]*/),
        // overlay: () => h(Menu, {}, methodArr),
        // },
      );
    } else {
      if (isHaveDelete) {
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
          [
            h(
              Popconfirm,
              {
                title: `确定要删除记录 [${record.No}] 吗`,
                onConfirm: async () => {
                  tableConfigs.checkedItems = [record.No];
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
            ...entitybtns.map((item) => {
              return h(
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
              ) as any;
            }),
          ],
        );
        return;
      }
      if (entitybtns.length > 0)
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
          [
            ...entitybtns.map((item) => {
              return h(
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
              ) as any;
            }),
          ],
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
    try {
      await userRegedit.Insert();
    } catch (e) {}
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
  const updateUserRegedit = async () => {
    userRegedit.SearchKey = toolbarProps.keywordList?.[0]?.value || '';
    if (mapData.value.GetParaInt('IsSearchKey') == 2 && Array.isArray(toolbarProps.keywordList)) {
      userRegedit.SearchKey = '';
      for (const keywordList of toolbarProps.keywordList) {
        userRegedit.SetPara(keywordList.key, keywordList.value);
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
              userRegedit.DTFrom = '';
              userRegedit.DTTo = '';
            } else {
              userRegedit.DTFrom = dateFrom;
              userRegedit.DTTo = dateTo;
              // mapData.value.SetPara('DTSearchKey', condition.value);
              //mapData.value.SetPara('DTSearchWay', DTSearchWay.ByDate);
              userRegedit.SetPara('DTSearchWay', DTSearchWay.ByDate);
            }
            await mapData.value.Update();
            userRegedit.FK_MapData = FrmID;
            userRegedit.DTSearchWay = DTSearchWay.ByDate;
            userRegedit.DTSearchKey = condition.value;
            userRegedit.SetPara('DTSearchWay', DTSearchWay.ByDate);
          }
          continue;
        }
        if (!!condition.value || condition.value === 0) queryArgs += `@${condition.key}=${condition.value}`;
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
    //userRegedit.OrderBy = frmDict[FrmBillAttr.SortColumns];
    //userRegedit.OrderWay = frmDict[FrmBillAttr.SortBy];
    // userRegedit.RecCount = '';
    // userRegedit.SetPara('RecCount', '');
    await userRegedit.Update();
    // await userRegedit.RetrieveFromDBSources();
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
    attrsRef.value = res.Attrs || [];
    // 给UserRegedit赋值
    userRegedit.Row.LoadObject(res.UserRegedit || {});
    // 给FrmDict赋值
    mapData.value.Row.LoadObject(res.MapData);
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
    try {
      await updateUserRegedit();
      const handler = getHandler();
      handler.AddPara('PageIdx', tableConfigs.page);
      handler.AddPara('PageSize', tableConfigs.pageSize);
      handler.AddJson(props.params);
      const data = await handler.DoMethodReturnJson(queryMethod);
      //表不存在,就创建.
      // if (data == undefined) {
      //   const en = new DBRole('xxx');
      //   await en.RetrieveFromDBSources();
      // }
      const { DT = [] } = data;
      tableConfigs.dataSource = DT;
      tableConfigs.ready = true;
      await userRegedit.RetrieveFromDBSources();
      handlePageInfo();
    } catch (e: any) {
      message.error(e.toString());
    }
  };
  return {
    initDynamicEntity,
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
    isCreateAction,
    mapData,
    toolbarProps,
    tableConfigs,
  };
}
