import { ListModel, PageBasePanelGroup } from '/@/bp/UIEntity/PageBasePanelGroup';
import { DataType } from '/@/bp/en/DataType';
import { Module, Modules } from './Module';
import { Menu, MenuAttr, Menus } from '../GPM/CCMenu/Menu';
import DBAccess from '/@/utils/gener/DBAccess';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { message } from 'ant-design-vue';
import BSEntity from '/@/utils/gener/BSEntity';
import { GloComm } from '/@/WF/Comm/GloComm';
import { getAppEnvConfig } from '/@/utils/env';
import { useUserStore } from '/@/store/modules/user';
import { useI18n } from '/@/hooks/web/useI18n';
import { getAllRequestParams } from '/@/utils/request/decode';
import { GetPara } from '/@/utils/gener/StringUtils';

const { t } = useI18n();

// const MenuTypeMap = new Map([
//   ['RptBlue', '蓝色大屏'],
//   ['RptWhite', '白色大屏'],
// ]);

// @ts-ignore
export class PG_Module2Menu extends PageBasePanelGroup {
  constructor() {
    super('PG_Module2Menu');
    this.PageTitle = '模块/菜单';
    this.HisListModel = ListModel.Table; //表格模式.
  }

  public async Init() {
    this.BtnsTop = '新建模块';
    this.BtnsEnGroup = '新建模块' + ',' + '新建菜单' + ',' + '权限';
    this.BtnsEnDtl = '菜单权限' + ',' + '菜单迁移应用';

    const groups = new Modules(); // 分组数据.
    await groups.Retrieve('SystemNo', this.PKVal, 'Idx');
    this.GroupsEns = groups;

    const dtls = new Menus(); //明细数据.
    await dtls.Retrieve('SystemNo', this.PKVal, 'Idx');
    this.DtlEns = dtls; //明细数据.
    this.RefKey = MenuAttr.ModuleNo; //关联的字段. 两个数据源关联的键值.
    if (this.HisListModel === ListModel.Table) {
      //定义列,这些列用于显示 必须要有No,Name列. GroupAttr=true表示:要显示分组的字段.
      this.Columns = [
        { Key: MenuAttr.No, Name: '编号', IsShow: false, DataType: 1, isEdit: false, GroupAttr: false },
        { Key: MenuAttr.Icon, Name: 'Icon', IsShow: false, DataType: 1, isEdit: false, width: 100, GroupAttr: false },
        { Key: MenuAttr.Name, Name: '模块/菜单', IsShow: true, DataType: 1, isEdit: false, width: 300, GroupAttr: false },
        {
          Key: MenuAttr.MenuModel,
          Name: '类型',
          IsShow: true,
          DataType: 1,
          isEdit: false,
          width: 200,
          GroupAttr: false,
          RefFunc: 'MenuModelFunc',
        },
        { Key: MenuAttr.Mark, Name: '标记', IsShow: false, DataType: 1, isEdit: false, width: 100, GroupAttr: false },
        { Key: MenuAttr.Docs, Name: '内容', IsShow: true, DataType: 1, isEdit: false, width: 300, GroupAttr: false, RefFunc: 'DocsFunc' },
        { Key: MenuAttr.IsEnable, Name: '启用?', IsShow: true, DataType: DataType.AppBoolean, isEdit: true, width: 100, GroupAttr: true },
      ];
    }

    //处理数据格式.
    for (let index = 0; index < this.DtlEns.length; index++) {
      let menu = this.DtlEns[index];
      menu = this.MenuModelFunc(menu);
    }

    //移动特征.
    this.IsGroupMove = true; //分组是否可以移动？
    this.IsEnMove = true; //实体是否可以移动？

    //  this.IsShowAddClick = false; //显示新建按钮.
    //  this.IsShowEditGroupIcon = true; //显示分组实体按钮.
  }

  get SystemNo() {
    return this.PKVal;
    //return 'AppFlow';
  }
  // //字段数据格式化
  // public FieldBindFunction(key: string, record: Record<string, any>) {
  //   if (key === MenuAttr.MenuModel) return this.MenuModelFunc(record);
  //   if (key === MenuAttr.Docs) return this.DocsFunc(record);
  // }
  //内容显示
  public DocsFunc(record) {
    if (record.Mark === 'Calendar') return '<Tag><Btton type="link">打开</Btton>';
    if (record.MenuModel === '' || record.MenuModel === 'SelfUrl') return '<Tag><Button type="link" >打开</Button>';
    return record.Mark;
  }

  //类型转换
  public MenuModelFunc(record) {
    if (record.MenuModel == 'SingleDictGenerWorkFlows') return '单实体流程列表';
    if (record.MenuModel == 'AskFrm') {
      const askFrmApp = GetPara(record.AtPara, 'EnName').replace('TS.CCBill.', '');
      if (askFrmApp === 'AskBill') {
        record.Docs = [
          {
            title: '设计表单',
            onClick: () => {
              const url = `/#/WF/Designer/Form?FrmID=${record.FrmID}`;
              return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
            },
          },
        ];
      }
      if (askFrmApp === 'AskFlow') {
        record.Docs = [
          {
            title: '设计流程',
            onClick: () => {
              const url = GloComm.UrlFlowD(record.FlowNo || record.FrmID);
              return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
            },
          },
        ];
      }
    }
    if (record.MenuModel == 'RefFlow') {
      record.Docs = [
        {
          title: '运行',
          onClick: () => {
            const url = `/src/WF/Rpt/SearchFlow.vue?FlowNo=${record.FlowNo}`; //@wanglu 这里怎么打开流程?
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
          },
        },
        {
          title: '设计流程',
          onClick: () => {
            // const url = `/#/WF/Designer/EditFlow?FlowNo=${record.FlowNo}`;
            const url = GloComm.UrlFlowD(record.FlowNo);

            return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
          },
        },
      ];
    }

    if (record.MenuModel == 'FlowNewEntity') {
      record.Docs = [
        {
          title: '设计流程',
          onClick: () => {
            //   const url = `/#/WF/Designer/EditFlow?FlowNo=${record.FlowNo}`;
            const url = GloComm.UrlFlowD(record.FlowNo);

            return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
          },
        },
      ];
    }
    if (record.MenuModel == 'FlowBaseData') return '基础资料修改类';
    if (record.MenuModel == 'FlowEtc') return '实体其他业务类';
    if (record.MenuModel === 'FlowBaseData') {
      if (record.Mark === 'Start') return '发起流程';
      if (record.Mark === 'Todolist') return '流程:待办';
      if (record.Mark === 'Runing') return '流程:未完成的';
      if (record.Mark === 'Search') return '实体资料变更';
      if (record.Mark === 'FlowGroup') return '流程:分析';
      return '流程';
    }

    //数据源
    if (record.MenuModel === 'DBList') {
      record.Docs = [
        {
          title: '运行',
          onClick: () => {
            console.log(record);
            const url = `/src/CCFast/CCBill/SearchDBList.vue?FrmID=${record.FrmID}&PKVal=${record.PKVal}&SystemNo=${record.SystemNo}`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
          },
        },
        {
          title: '数据源',
          onClick: () => {
            const formID = record.FrmID as string;
            const url = GloComm.UrlEn('TS.CCBill.DBList', formID);
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url + '&FrmID=' + formID, '数据源');
          },
        },
        {
          title: '单记录',
          onClick: () => {
            // const url = `/#/WF/Designer/Form?FrmID=${record.FrmID}`;
            const url = '/src/WF/Comm/PanelGroup.vue?EnName=PG_Group2Method&RefPKVal=No&PKVal=' + record.FrmID + '&RefMainEnName=TS.CCBill.FrmDict';
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
          },
        },
        {
          title: '设置',
          onClick: async () => {
            const formID = record.FrmID as string;
            const url = GloComm.UrlEn('TS.CCBill.FrmDict', formID);
            const md = new BSEntity('BP.Sys.MapData');
            md.No = formID;
            md.setPK(formID);
            await md.DoMethodReturnString('ClearCache');
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url + '&FrmID=' + formID, '实体设计');
          },
        },
      ];
    }

    if (record.MenuModel === 'RptWhite') {
      //大屏
      record.Docs = [
        {
          title: '打开',
          onClick: () => {
            const url = `/src/CCFast/Views/RptWhiteMain.vue?PageID=${record.No}`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
          },
        },
        {
          title: '设计白色大屏',
          onClick: () => {
            const url = `/src/CCFast/Views/RptWhiteEdit.vue?PageID=${record.No}&Edit=1`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
          },
        },
      ];
    }
    if (record.MenuModel === 'FixedUrl' && record.UrlPath.includes('/Tabs/')) {
      record.Docs = [
        {
          title: 'Tabs - 标签页组件',
        },
      ];
    }
    if (record.MenuModel === 'FixedUrl' && record.UrlPath.includes('Comm/Search.vue')) {
      record.Docs = [
        {
          title: 'Search - 查询组件',
          onClick: () => {
            const { EnName = '' } = getAllRequestParams(record.UrlExt);
            if (!EnName) {
              message.warn('您需要为菜单设置打开的类名');
              return;
            }
            const url = `/src/WF/Comm/Search.vue?EnName=${EnName}`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
          },
        },
      ];
    }

    if (record.MenuModel === 'FixedUrl' && record.UrlPath.includes('Comm/Group.vue')) {
      record.Docs = [
        {
          title: 'Group - 分组组件',
          onClick: () => {
            const { EnName = '' } = getAllRequestParams(record.UrlExt);
            if (!EnName) {
              message.warn('您需要为菜单设置打开的类名');
              return;
            }
            const url = `/src/WF/Comm/Group.vue?EnName=${EnName}`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
          },
        },
      ];
    }
    if (record.MenuModel === 'FixedUrl' && record.UrlPath.includes('Comm/SearchRpt.vue')) {
      record.Docs = [
        {
          title: 'SearchRpt - 报表组件',
          onClick: () => {
            const { EnName = '' } = getAllRequestParams(record.UrlExt);
            if (!EnName) {
              message.warn('您需要为菜单设置打开的类名');
              return;
            }
            const url = `/src/WF/Comm/SearchRpt.vue?EnName=${EnName}`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
          },
        },
      ];
    }
    if (!!record.UrlPath && record.UrlPath.includes('Comm/Ens.vue')) {
      record.Docs = [
        {
          title: 'Ens - 批量编辑组件',
        },
      ];
    }

    //字典表.
    if (record.MenuModel === 'DictTable') {
      record.Docs = [
        {
          title: '编辑数据',
          onClick: () => {
            const url = `/src/CCFast/Views/SFTableEditData.vue?FK_SFTable=${record.UrlExt}&QueryType=Dict`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
          },
        },
      ];
    }

    if (record.MenuModel === 'DictTableTree') {
      record.Docs = [
        {
          title: '编辑数据',
          onClick: () => {
            const url = `/src/CCFast/Views/SFTableEditTree.vue?FK_SFTable=${record.UrlExt}&QueryType=Dict`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
          },
        },
      ];
    }
    //不分页视图
    if (record.MenuModel === 'GLDBView' || record.MenuModel === 'TreeEnsDBView' || record.MenuModel === 'SearchBillView') {
      record.Docs = [
        {
          title: '运行',
          onClick: () => {
            console.log(record);
            let url = `/src/WF/views/GenerList.vue?FrmID=${record.FrmID}&EnName=GL_DBGenerList`;
            if (record.MenuModel === 'TreeEnsDBView') url = `/src/CCFast/DBView/TreeEnsDBView.vue?FrmID=${record.FrmID}`;
            if (record.MenuModel === 'SearchBillView') url = `/src/CCFast/CCBill/SearchDBList.vue?FrmID=${record.FrmID}&PKVal=${record.PKVal}&SystemNo=${record.SystemNo}`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
          },
        },
        {
          title: '设计',
          onClick: () => {
            const frmID = record.FrmID;
            const enName = 'TS.CCBill.GLDBView';
            const url = GloComm.UrlEn(enName, '&No=' + frmID + '&PKVal=' + frmID);
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url, record.Name);
          },
        },
      ];
    }
    //视图.
    if (record.MenuModel === 'View' || record.MenuModel === 'FrmEntityDtlView' || record.MenuModel === 'FrmBillDtlView' || record.MenuModel === 'FlowDtlView') {
      record.Docs = [
        {
          title: '运行',
          onClick: () => {
            console.log(record);
            const url = `/src/CCFast/CCBill/SearchDBList.vue?FrmID=${record.FrmID}&PKVal=${record.PKVal}&SystemNo=${record.SystemNo}`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
          },
        },
        {
          title: '主页',
          onClick: async () => {
            const frmID = record.FrmID as string;
            const url = GloComm.UrlEn('TS.CCBill.DictSettingOne', frmID);
            const md = new BSEntity('BP.Sys.MapData');
            md.No = frmID;
            md.setPK(frmID);
            await md.DoMethodReturnString('ClearCache');
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url + '&FrmID=' + frmID, '运行主页');
          },
        },
        {
          title: '设置',
          onClick: async () => {
            const formID = record.FrmID as string;
            const url = GloComm.UrlEn('TS.CCBill.FrmDict', formID);
            const md = new BSEntity('BP.Sys.MapData');
            md.No = formID;
            md.setPK(formID);
            await md.DoMethodReturnString('ClearCache');
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url + '&FrmID=' + formID, '实体设计');
          },
        },
        {
          title: '数据源',
          onClick: async () => {
            const frmID = record.FrmID as string;

            let enName = 'TS.CCBill.SearchBillView';
            if (record.MenuModel === 'FrmEntityDtlView' || record.MenuModel === 'FrmBillDtlView') enName = 'TS.CCBill.FrmDtlView';
            if (record.MenuModel === 'FlowDtlView') enName = 'TS.CCBill.FlowDtlView';
            const url = GloComm.UrlEn(enName, frmID);
            const md = new BSEntity('BP.Sys.MapData');
            md.No = frmID;
            md.setPK(frmID);
            await md.DoMethodReturnString('ClearCache');
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url + '&FrmID=' + frmID, '数据源');
          },
        },
      ];
    }

    //实体处理.
    if (record.MenuModel === 'EntityNoName') {
      record.Docs = [
        {
          title: '运行',
          onClick: () => {
            console.log(record);
            const url = `/src/CCFast/CCBill/SearchEntityNoName.vue?FrmID=${record.FrmID}&SystemNo=${record.SystemNo}`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
          },
        },
        {
          title: '设计表单',
          onClick: () => {
            const url = `/#/WF/Designer/Form?FrmID=${record.FrmID}`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
          },
        },
        // {
        //   title: '查询条件',
        //   onClick: () => {
        //     const formID = record.FrmID as string;
        //     const url = GloComm.UrlEn('TS.CCBill.FrmEntityNoName', formID);
        //     return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url + '&FrmID=' + formID, '查询条件设计');
        //   },
        // },
        // {
        //   title: '单记录',
        //   onClick: () => {
        //     // const url = `/#/WF/Designer/Form?FrmID=${record.FrmID}`;
        //     const url = '/src/WF/Comm/PanelGroup.vue?EnName=PG_Group2Method&RefPKVal=No&PKVal=' + record.FrmID + '&RefMainEnName=TS.CCBill.FrmEntityNoName';
        //     return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
        //   },
        // },
        {
          title: '实体设计',
          onClick: async () => {
            const formID = record.FrmID as string;
            const url = GloComm.UrlEn('TS.CCBill.FrmEntityNoName', formID);
            const md = new BSEntity('BP.Sys.MapData');
            md.No = formID;
            md.setPK(formID);
            await md.DoMethodReturnString('ClearCache');
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url + '&FrmID=' + formID, '实体设计');
            // console.log({ record });
            // const ap = new AtPara(record.AtPara);
            // const url2 = `/@/WF/Comm/En.vue?EnName=${ap.GetValStrByKey('EnName')}&PKVal=${ap.GetValStrByKey('EnPKVal')}`;
            // console.log({ url2 });
            // //GloSYS.
            // return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url2);
          },
        },
        // {
        //   title: '列表功能',
        //   onClick: () => {
        //     const ap = new AtPara(record.AtPara);
        //     const url = '/@/WF/Comm/UIEntity/GroupPageNew.vue?EnName=GPN_Collection&RefPKVal=' + ap.GetValStrByKey('EnPKVal');
        //     return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
        //   },
        // },
        // {
        //   title: '记录功能',
        //   onClick: () => {
        //     const ap = new AtPara(record.AtPara);
        //     // PG_Module2Menu const url = '/@/WF/Comm/UIEntity/GroupPageNew.vue?EnName=GPN_Method&RefPKVal=' + ap.GetValStrByKey('EnPKVal');
        //     const url = '/@/WF/Comm/UIEntity/GroupPageNew.vue?EnName=PG_Module2Menu&RefPKVal=' + ap.GetValStrByKey('EnPKVal');

        //     return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
        //   },
        // },
      ];
    }

    //实体处理.
    if (record.MenuModel === 'Dict') {
      record.Docs = [
        {
          title: '运行',
          onClick: () => {
            console.log(record);
            const url = `/src/CCFast/CCBill/SearchDict.vue?FrmID=${record.FrmID}&PKVal=${record.PKVal}&SystemNo=${record.SystemNo}`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
          },
        },
        {
          title: '设计表单',
          onClick: () => {
            const url = `/#/WF/Designer/Form?FrmID=${record.FrmID}`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
          },
        },
        {
          title: '查询条件',
          onClick: () => {
            const formID = record.FrmID as string;
            const url = GloComm.UrlEn('TS.CCBill.FrmDict', formID);
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url + '&FrmID=' + formID, '查询条件设计');
          },
        },
        {
          title: '单记录',
          onClick: () => {
            const url = '/src/WF/Comm/PanelGroup.vue?EnName=PG_Group2Method&RefPKVal=No&PKVal=' + record.FrmID + '&RefMainEnName=TS.CCBill.FrmDict';
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
          },
        },
        {
          title: '设置',
          onClick: async () => {
            const formID = record.FrmID as string;
            const url = GloComm.UrlEn('TS.CCBill.FrmDict', formID);
            const md = new BSEntity('BP.Sys.MapData');
            md.No = formID;
            md.setPK(formID);
            await md.DoMethodReturnString('ClearCache');
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url + '&FrmID=' + formID, '实体设计');
          },
        },
      ];
    }

    //实体处理.
    if (record.MenuModel === 'Bill') {
      record.Docs = [
        {
          title: '运行',
          onClick: () => {
            console.log(record);
            const url = `/src/CCFast/CCBill/SearchBill.vue?FrmID=${record.FrmID}&PKVal=${record.PKVal}&SystemNo=${record.SystemNo}`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
          },
        },
        {
          title: '设计表单',
          onClick: () => {
            const url = `/#/WF/Designer/Form?FrmID=${record.FrmID}`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
          },
        },
        // {
        //   title: '查询条件',
        //   onClick: () => {
        //     const formID = record.FrmID as string;
        //     const url = GloComm.UrlEn('TS.CCBill.FrmBill', formID);
        //     return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url + '&FrmID=' + formID, '查询条件设计');
        //   },
        // },
        // {
        //   title: '单记录',
        //   onClick: () => {
        //     const url = '/src/WF/Comm/PanelGroup.vue?EnName=PG_Group2Method&RefPKVal=No&PKVal=' + record.FrmID + '&RefMainEnName=TS.CCBill.FrmDict';
        //     return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
        //   },
        // },
        {
          title: '单据设计',
          onClick: async () => {
            const formID = record.FrmID as string;
            const url = GloComm.UrlEn('TS.CCBill.FrmBill', formID);
            const md = new BSEntity('BP.Sys.MapData');
            md.No = formID;
            md.setPK(formID);
            await md.DoMethodReturnString('ClearCache');
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url + '&FrmID=' + formID, '实体设计');
          },
        },
      ];
    }

    //记事本.
    if (record.MenuModel === 'Notepad') {
      record.Docs = [
        {
          title: '打开',
          onClick: () => {
            const url = `/@/CCOA/Notepad/Notepad.vue?FrmID=${record.UrlExt}`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
          },
        },
      ];
    }

    //工作日志
    if (record.MenuModel === 'WorkRec') {
      record.Docs = [
        {
          title: '打开',
          onClick: () => {
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, record.UrlExt);
          },
        },
      ];
    }

    //信息发布.
    if (record.MenuModel === 'Info') {
      record.Docs = [
        {
          title: '打开',
          onClick: () => {
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, record.UrlExt);
          },
        },
      ];
    }
    // 知识库.
    // if (record.MenuModel === 'KnowledgeManagement') {
    //   record.Docs = [
    //     {
    //       title: '打开',
    //       onClick: () => {
    //         // "D:\DevCode\CCFlowVue3\src\CCOA\KnowledgeManagement\Default.vue"
    //         const url = GloComm.UrlGenerList('GL_Knowledge'); // `/#/CCOA/KnowledgeManagement/Default.vue?FrmID=${record.No}`;
    //         return new GPNReturnObj(GPNReturnType.OpenIframeByDrawer75, url);
    //       },
    //     },
    //   ];
    // }
    //知识库.
    if (record.MenuModel === 'KnowledgeManagement') {
      record.Docs = [
        {
          title: '打开',
          onClick: () => {
            const url = `/@/CCOA/KnowledgeManagement/Default.vue?PageID=${record.FrmID}`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
          },
        },
      ];
    }

    //3维报表.
    if (record.MenuModel === 'Rpt3D') {
      record.Docs = [
        {
          title: '打开',
          onClick: () => {
            const url = `/@/CCFast/CCBill/Components/Rpt3D/Default.vue?RptNo=${record.No}`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
          },
        },
        {
          title: '设置',
          onClick: () => {
            const url = `/@/WF/Comm/En.vue?EnName=TS.CCFast.Rpt3D&PKVal=${record.No}`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
          },
        },
      ];
    }

    //RptBlue. 蓝色大屏
    if (record.MenuModel === 'RptBlue') {
      record.Docs = [
        {
          title: '打开',
          onClick: () => {
            let { VITE_GLOB_GOVIEW_URL } = getAppEnvConfig();
            if (!VITE_GLOB_GOVIEW_URL.endsWith('/')) {
              VITE_GLOB_GOVIEW_URL = VITE_GLOB_GOVIEW_URL + '/';
            }
            // const userStore = useUserStore();
            const url = `${VITE_GLOB_GOVIEW_URL}#/chart/preview/${record.Tag1}`;
            window.open(url, '_blank');
          },
        },
        {
          title: '设计蓝色大屏',
          onClick: () => {
            let { VITE_GLOB_GOVIEW_URL } = getAppEnvConfig();
            if (!VITE_GLOB_GOVIEW_URL.endsWith('/')) {
              VITE_GLOB_GOVIEW_URL = VITE_GLOB_GOVIEW_URL + '/';
            }
            const userStore = useUserStore();
            const token = userStore.getToken;
            const url = `${VITE_GLOB_GOVIEW_URL}${record.path}?token=${token}`;
            window.open(url, '_blank');
          },
        },
        {
          title: '设置',
          onClick: () => {
            const url = `/@/WF/Comm/En.vue?EnName=TS.CCFast.RptBlue&PKVal=${record.No}`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
          },
        },
      ];
    }
    //RptBlue.
    if (record.MenuModel === 'Task') {
      record.Docs = [
        {
          title: '打开',
          onClick: () => {
            const url = `/src/CCFast/Views/Task.vue?ModuleNo=${record.ModuleNo}`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
          },
        },
      ];
    }

    // if (record.MenuModel === 'SelfUrl') return '自定义菜单';
    // if (record.MenuModel === 'DictTable') return '字典表';
    // if (record.MenuModel === 'Func') return '独立功能';
    // if (record.MenuModel === 'Windows') return '统计分析';
    // if (record.MenuModel === 'StandAloneFlow') return '独立流程';
    // if (record.MenuModel === 'Bill') return '单据';
    // if (record.MenuModel === 'Tabs') return '标签容器';
    // if (record.MenuModel === '') return '自定义菜单';
    return record;
  }

  //点击焦点字段时.
  public async IconClick(_groupNo?: string | undefined, enNo?: string | undefined) {
    //const en = new Menu(enNo);
    //await en.Retrieve();
    //权限列表.
    // const url = `/src/WF/Comm/En.vue?EnName={$en.EnName}&RefPK=CtrlPKVal&ButsTableTop=&ButsItem=&ShowAttrs=&IsMove=1&RefPKVal=${enNo}`;
    //const url = `/src/WF/Comm/En.vue?EnName=${en.EnName}&PKVal=${en.EnPKVal}`;

    // const enName = this.DtlEns?.GetNewEntity.classID;
    // const url = `/@/WF/Comm/En.vue?EnName=${enName}&PKVal=${enNo}`;
    // return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    return this.OpenDtl(enNo);
  }

  // 如果通过路由打开页面 /#/WF/xxxx   表示你想跳转到系统下面的某个路由  /router/modules/对应模块.ts (comm.ts)
  // 如果你要加载组件 /src/WF/xxx.vue
  // 定义按钮的返回链接 url@/#/WF/xxxx
  public async BtnClick(btnName?: string, selectGroupNo?: string, selectNo?: string) {
    try {
      /************************ 工具栏按钮... */
      //系统属性.
      if (btnName === '模块属性') {
        const url = `/@/WF/Comm/En.vue?EnName=TS.CCFast.GPM.Module&PKVal=${selectGroupNo}&OrderBy=Idx`;
        return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
      }

      // 当前页面跳转
      if (btnName == '新建菜单') {
        const url = `/@/WF/Comm/UIEntity/GroupPageNew.vue?EnName=GPN_Menu&SortNo=${selectGroupNo || ''}&SystemNo=${this.SystemNo}&RefPKVal=${this.SystemNo}`;
        return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
      }

      /************************ 模块按钮... */
      if (btnName === '权限') {
        const url = `/@/WF/Comm/Dtl/DtlSearch.vue?EnName=TS.GPM.PCenter&CtrlObj=Module&RefPK=CtrlPKVal&ButsTableTop=&ButsItem=&ShowAttrs=&IsMove=1&PKVal=${selectGroupNo}`;
        return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
      }

      if (btnName === '菜单权限') {
        const url = `/@/WF/Comm/Dtl/DtlSearch.vue?EnName=TS.GPM.PCenter&CtrlObj=Menu&RefPK=CtrlPKVal&ButsTableTop=&ButsItem=&ShowAttrs=&IsMove=1&PKVal=${selectNo}`;
        return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
      }
      if (btnName === '菜单迁移应用') {
        const url = GloComm.UrlGPN('GPN_MenuToSystem','','&PKVal='+selectNo);
        return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
      }

      if (btnName === '删除菜单') {
        const en = new Menu();
        en.No = selectNo;
        await en.RetrieveFromDBSources();
        await en.Delete();
        this.RemoveDtlItem(selectGroupNo || '', selectNo || ''); //移除当前行.
        return new GPNReturnObj(GPNReturnType.CloseAndReload, '删除成功');
      }

      if (btnName === '菜单属性') {
        const enName = this.DtlEns?.GetNewEntity.classID;
        const url = `/@/WF/Comm/En.vue?EnName=${enName}&PKVal=${selectNo}`;
        return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
      }
      if (btnName === '菜单迁移系统') {
        const url = GloComm.UrlGPN('GPN_MenuToSystem', '', '&PKVal=' + selectNo);
        return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
      }
      if (btnName === '删除模块') {
        const en = new Module(selectGroupNo);
        en.No = selectGroupNo;
        await en.Delete();
        return new GPNReturnObj(GPNReturnType.CloseAndReload, '删除成功');
      }

      ///侧滑打开.
      if (btnName === '模块维护') {
        const url = '/@/WF/Comm/Ens.vue?EnName=TS.GPM.Module&SystemNo=' + this.SystemNo;
        return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
      }

      if (btnName === '新建模块') {
        const val = window.prompt('请输入模块名称', '');
        if (!val) return new GPNReturnObj(GPNReturnType.DoNothing);
        const en = new Module();
        en.Name = val;
        en.No = DBAccess.GenerGUID();
        if (typeof selectGroupNo === 'string' && selectGroupNo.length > 0) en.ParentNo = selectGroupNo;
        en.SystemNo = this.SystemNo;
        en.Icon = 'icon-folder';
        await en.Insert();
        return new GPNReturnObj(GPNReturnType.CloseAndReload, '创建成功');
      }
      return new GPNReturnObj(GPNReturnType.Error, '没有判断的BtnID:' + btnName);
    } catch (e) {
      return new GPNReturnObj(GPNReturnType.Error, e.toString());
    }
  }
}
