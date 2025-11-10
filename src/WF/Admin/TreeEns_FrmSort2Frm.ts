import { PageBaseTreeEns } from '/@/bp/UIEntity/PageBaseTreeEns';
import { FrmSorts } from '../TSClass/Admin/FrmSort';
import { MapData, MapDataAttr } from './FrmLogic/MapData';
import { FrmAdms } from '../TSClass/Admin/FrmAdm';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import WebUser from '/@/bp/web/WebUser';
import { message } from 'ant-design-vue';
import GloFrm from './FrmLogic/GloFrm';
import { GloComm } from '../Comm/GloComm';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import { useUserStore } from '/@/store/modules/user';
import { isComPage } from '/@/utils/gl';
/**
 * 表单类别-表单
 */
export class TreeEns_FrmSort2Frm extends PageBaseTreeEns {
  constructor() {
    super('TreeEns_FrmSort2Frm');
    this.PageTitle = '表单模板库';
  }
  //重写的构造方法.
  override async Init() {
    if (WebUser.IsAdmin == false) {
      message.error('err@您好:' + WebUser.Name + ',非管理员用户不能查看.');
      //没有权限自动退出登录
      const userStore = useUserStore();
      userStore.logout(true);
      return;
    }

    //分组数据.
    const trees = new FrmSorts();
    await trees.RetrieveAll(); // No,Name,ParentNo
    this.TreeEns = trees; //左侧的树数据.
    if (WebUser.CCBPMRunModel == CCBPMRunModel.Single) {
      if (WebUser.No === 'admin') {
        this.RootNo = '0';
      } else if (WebUser.IsAdmin) {
        this.RootNo = WebUser.RootNo;
      }
    } else this.RootNo = WebUser.OrgNo; //定义树的根目录.

    // 定义列，这些列用于显示.
    this.Columns = [
      { id: 'No', name: '编号' },
      { id: 'Name', name: '名称', Width: 300 },
      { id: 'Icon', name: 'Icon', Width: 50, IsShow: false },
      { id: 'FrmTypeText', name: '表单类型' },
      { id: 'EntityTypeText', name: '应用模式' },
      { id: 'PTable', name: '存储表' },
    ];
    // 关联的字段
    this.RefKey = MapDataAttr.FK_FormTree; //关联的字段.
    // this.BtnsOfToolbar = '目录维护,分组模式,查询模式'; //超链接时间
    // this.BtnsOfToolbar = '查询模式';
    // this.BtnsOfTableTop = '目录属性,新建表单,导入表单,批量删除';
    this.BtnsOfTableTop = '新建表单,导入,目录属性,帮助,';
    this.BtnsOfItemOptions = '表单属性,删除,运行,'; //行操作的按钮.
    this.IsEnMove = true; //实体是否可以移动？
    this.DtlEns = new FrmAdms();
  }

  public override async GetDtls(nodeID: string) {
    const frms = new FrmAdms();
    await frms.Retrieve('FK_FormTree', nodeID, 'Idx');
    return frms;
  }
  public async BtnClick(btnLab: string, treeNodeID: string, itemIDs: string, _selectTreeOrg, _record: Nullable<RowData> = null) {
    if (btnLab === '查询模式') {
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, GloComm.UrlSearch('TS.WF.Admin.FrmAdm', ''));
    }

    if (btnLab === '帮助') {
      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, 'https://docs.qq.com/doc/DRE5VUFBnTWdrUUdO');
    }

    if (btnLab === '目录维护') {
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, GloComm.UrlTree('TS.WF.Admin.FrmSort', ''));
    }

    if (btnLab === '删除' || btnLab === '批量删除') {
      return this.Items_Delete(itemIDs);
    }

    if (btnLab === '编辑' || btnLab === '双击行') {
      // NodeFormType.RefNodeFrm
      await GloFrm.CheckForm(itemIDs);

      //判断表单类型.
      const md = new MapData(itemIDs);
      md.No = itemIDs;
      await md.RetrieveFromDBSources();
      const url = md.UrlDesigner(); //获得设计器的url.
      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, isComPage(url));
    }

    if (btnLab === '新建表单' || btnLab === '表单' || btnLab == '新建项目') {
      const url = GloComm.UrlGPN('GPN_NewFrm', treeNodeID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url, btnLab);
    }
    //@liyongchao
    if (btnLab === '导入表单' || btnLab == '导入') {
      const url = GloComm.UrlGPN('GPN_ImpFrm', treeNodeID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }

    if (btnLab === '目录属性') {
      // const url = '/@/WF/Comm/En.vue?EnName=TS.WF.Admin.FrmSort&PKVal=' + treeNodeID;
      const url = GloComm.UrlEnOnly('TS.WF.Admin.FrmSort', treeNodeID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }

    if (btnLab === '表单属性') {
      const enType = _record.EntityType;
      let enName = '';
      switch (enType) {
        case 1:
          enName = 'TS.CCBill.FrmBill';
          break;
        case 5:
          enName = 'TS.CCBill.FrmEntityNoName';
          break;
        default:
          enName = 'TS.Frm.MapFrmFool';
          break;
      }
      const url = GloComm.UrlEn(enName, itemIDs);
      if (enName != '') {
        return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url + '&FrmID=' + itemIDs);
      }
      return new GPNReturnObj(GPNReturnType.Message, '未知实体类型：' + enType);
    }
    if (btnLab === '运行') {
      let url = '';
      if (_record?.EntityType == 5) url = `/src/CCFast/CCBill/SearchEntityNoName.vue?FrmID=${itemIDs}`;
      if (_record?.EntityType == 1) url = `/src/CCFast/CCBill/SearchBill.vue?FrmID=${itemIDs}`;
      if (_record?.EntityType == 2) url = `/src/CCFast/CCBill/SearchDict.vue?FrmID=${itemIDs}`;
      // const url = GloComm.UrlEn('TS.WF.Admin.FrmSort', treeNodeID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    }
    if (btnLab === '单据' || btnLab === '实体单据') {
      const userNo = WebUser.No;
      const url = GloComm.UrlEn('TS.CCBill.BillSetting', userNo as string);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    }

    if (btnLab === '实体') {
      const url = GloComm.UrlGenerList('GL_DictStart');
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    }

    alert('没有判断的类型:' + btnLab);
    return false;
  }
}
