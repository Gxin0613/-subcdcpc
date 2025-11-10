import { PageBaseTreeEns } from '/@/bp/UIEntity/PageBaseTreeEns';
import { FrmAdms } from '../TSClass/Admin/FrmAdm';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import WebUser from '/@/bp/web/WebUser';
import { message } from 'ant-design-vue';
import { GloComm } from '../Comm/GloComm';
import { SFDBSrc, SFDBSrcs } from './FrmLogic/SFDBSrc/SFDBSrc';
import { SFTableNoNames } from './FrmLogic/SFTable/SFTableNoName';
import { SFTable, SFTables } from './FrmLogic/SFTable/SFTable';
import { SFSearch, SFSearchs } from './FrmLogic/SFSearch/SFSearch';
import { SysEnumMains } from './FrmLogic/SysEnum/SysEnumMain';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import { SysEnumMainInt } from './FrmLogic/SysEnum/SysEnumMainInt';
import { SFProc, SFProcs } from './FrmLogic/SFProc/SFProc';
import { useUserStore } from '/@/store/modules/user';
/**
 * 表单类别-表单
 */
export class TreeEns_DBSrc extends PageBaseTreeEns {
  constructor() {
    super('TreeEns_DBSrc');
    this.PageTitle = '数据源';
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
    const ens = new SFDBSrcs();
    await ens.RetrieveAll(); // No,Name,ParentNo
    this.EnableContextMenu = false; // 去掉右键菜单

    //分组数据.
    // const ens2 = new SFDBSrcs();
    // await ens2.RetrieveAll(); // No,Name,ParentNo
    const subSFList: SFDBSrc[] = [];
    for (const sf of ens) {
      sf.SetValByKey('ParentNo', '0');
      sf.SetValByKey('Icon', 'icon-disc');

      if (sf.DBSrcType == 'WebApi') sf.SetValByKey('Icon', 'icon-cloud-upload');
      if (sf.No == 'local') sf.SetValByKey('Icon', 'icon-settings');

      // 字典
      const subDictSF = new SFDBSrc();
      subDictSF.No = `${sf.No},SFTable`;
      subDictSF.Name = '字典';
      subDictSF.SetValByKey('ParentNo', sf.No);
      subDictSF.SetValByKey('Icon', 'icon-list');

      // 查询
      const subSearchSF = new SFDBSrc();
      subSearchSF.No = `${sf.No},Search`;
      subSearchSF.Name = '查询';
      subSearchSF.SetValByKey('ParentNo', sf.No);
      subSearchSF.SetValByKey('Icon', 'icon-layers');

      // 过程
      const subProgressSF = new SFDBSrc();
      subProgressSF.No = `${sf.No},Proc`;
      subProgressSF.Name = '过程';
      subProgressSF.SetValByKey('ParentNo', sf.No);
      subProgressSF.SetValByKey('Icon', 'icon-options');

      if (sf.No == 'local') {
        // 过程
        const enums = new SFDBSrc();
        enums.No = `${sf.No},Enums`;
        enums.Name = '枚举';
        enums.SetValByKey('ParentNo', sf.No);
        enums.SetValByKey('Icon', 'icon-menu');
        subSFList.push(subDictSF, subSearchSF, subProgressSF, enums);
      } else subSFList.push(subDictSF, subSearchSF, subProgressSF);
    }
    ens.push(...subSFList);
    this.RootNo = '0';
    console.log({ ens });
    this.TreeEns = ens;
    // 定义列，这些列用于显示.
    this.Columns = [
      { id: 'No', name: '编号', width: 300 },
      { id: 'Name', name: '名称', width: 300 },
      { id: 'CodeStruct', name: '结构', width: 100 },
      { id: 'DBSrcType', name: '模式', Width: 100 },
      { id: 'Note', name: '备注', width: 300 },
    ];
    // this.BtnsOfToolbar = '目录维护,分组模式,查询模式'; //超链接时间
    // this.BtnsOfToolbar = '查询模式';
    // this.BtnsOfTableTop = '目录属性,新建表单,导入表单,批量删除';
    this.BtnsOfTableTop = '新建,数据源属性,新建数据源,帮助';
    this.BtnsOfItemOptions = '编辑,删除,'; //行操作的按钮.
    this.IsEnMove = true; //实体是否可以移动？
    this.DtlEns = new SFTableNoNames();
  }

  public override async GetDtls(nodeID: string) {
    const dbsrcNo = nodeID.substring(0, nodeID.indexOf(','));
    if (nodeID.includes('SFTable')) {
      this.BtnsOfTableTop = '新建字典,数据源属性,新建数据源';
      const ens = new SFTables();
      if (WebUser.CCBPMRunModel != CCBPMRunModel.Single && WebUser.No != 'admin') await ens.Retrieve('FK_SFDBSrc', dbsrcNo, 'OrgNo', WebUser.OrgNo);
      else await ens.Retrieve('FK_SFDBSrc', dbsrcNo);

      ens.forEach((en) => {
        if (en.CodeStruct == 0) en.CodeStruct = '编号名称';
        if (en.CodeStruct == 1) en.CodeStruct = '树结构';
        if (en.DBSrcType == 'SQL') en.DBSrcType = 'SQL视图';
        if (en.DBSrcType == 'SysDict') en.DBSrcType = '系统字典';
      });

      this.Columns = [
        { id: 'No', name: '编号', width: 150 },
        { id: 'Name', name: '名称', width: 150 },
        { id: 'CodeStruct', name: '结构', width: 100 },
        { id: 'DBSrcType', name: '类型', width: 100 },
        { id: 'IsPara', name: '参数', width: 90 },
        { id: 'SelectStatement', name: 'Exp', width: 600 },
        //  { id: 'SelectStatement', name: '表达式', Width: 400 },
      ];
      this.DtlEns = ens;
      return ens;
    }

    if (nodeID.includes('Proc')) {
      const ens = new SFProcs();
      if (WebUser.CCBPMRunModel != CCBPMRunModel.Single && WebUser.No != 'admin') await ens.Retrieve('FK_SFDBSrc', dbsrcNo, 'OrgNo', WebUser.OrgNo);
      await ens.Retrieve('FK_SFDBSrc', dbsrcNo);
      //定义列,这些列用于显示.
      this.Columns = [
        { id: 'No', name: '编号', width: 200 },
        { id: 'Name', name: '名称', width: 200 },
        { id: 'IsPara', name: '参数', width: 90 },
        { id: 'SelectStatement', name: 'Exp', width: 500 },
      ];
      this.DtlEns = ens;
      return ens;
    }

    if (nodeID.includes('Search')) {
      const ens = new SFSearchs();
      if (WebUser.CCBPMRunModel != CCBPMRunModel.Single && WebUser.No != 'admin') await ens.Retrieve('FK_SFDBSrc', dbsrcNo, 'OrgNo', WebUser.OrgNo);
      await ens.Retrieve('FK_SFDBSrc', dbsrcNo);

      ens.forEach((en) => {
        if (en.ResultNum == 0) en.ResultNum = '多行(集合)';
        if (en.ResultNum == 1) en.ResultNum = '单行(实体)';
        // if (en.DBSrcType == 'SQL') en.DBSrcType = 'SQL视图';
        // if (en.DBSrcType == 'SysDict') en.DBSrcType = '系统字典';
      });

      this.Columns = [
        { id: 'No', name: '编号', width: 100 },
        { id: 'Name', name: '名称', width: 150 },
        { id: 'ResultNum', name: '结构', width: 150 },
        { id: 'IsPara', name: '参数', width: 90 },
        { id: 'SelectStatement', name: 'Exp', width: 500 },
        { id: 'Remark', name: '备注', width: 150 },
      ];
      this.DtlEns = ens;
      return ens;
    }

    if (nodeID.includes('Enum')) {
      const ens = new SysEnumMains();
      await ens.RetrieveAll();

      //如何改变列名，让其显示出来？
      for (let index = 0; index < ens.length; index++) {
        const en = ens[index];
        if (en.EnumType == 0) en.EnumType = 'Int类型';
        if (en.EnumType == 1) en.EnumType = 'String类型';
      }
      // 定义列，这些列用于显示.
      this.Columns = [
        { id: 'No', name: '编号', width: 200 },
        { id: 'Name', name: '名称', width: 260 },
        { id: 'EnumType', name: '类型', width: 150 },
        { id: 'CfgVal', name: '内容', width: 400 },
      ];
      this.DtlEns = ens;
      return ens;
    }

    const frms = new FrmAdms();
    await frms.Retrieve('FK_FormTree', nodeID, 'Idx');
    this.DtlEns = frms;
    return frms;
  }
  public async BtnClick(btnLab: string, treeNodeID: string, itemIDs: string) {
    if (btnLab === '帮助') return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, 'https://docs.qq.com/doc/DRG52QmlyeG1kSUJE');

    if (btnLab === '新建') {
      let srcNo = treeNodeID;
      let nodeType = '';
      if (treeNodeID.includes(',') == true) {
        srcNo = treeNodeID.substring(0, treeNodeID.indexOf(','));
        nodeType = treeNodeID.substring(treeNodeID.indexOf(',') + 1);
      }

      let gpnName = 'GPN_DBSrcSQL';
      const dbSrc = new SFDBSrc(srcNo);
      await dbSrc.RetrieveFromDBSources();

      if (dbSrc.DBSrcType == 'WebApi') gpnName = 'GPN_DBSrcWebApi';
      if (srcNo == 'local') gpnName = 'GPN_Local';
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, GloComm.UrlGPN(gpnName, '', '&PageNo=' + nodeType + '&RefPKVal=' + srcNo), '新建');
    }

    if (btnLab === '新建数据源') {
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, GloComm.UrlGPN('GPN_SFDBSrc', ''), '新建数据源');
    }
    if (btnLab === '数据源属性') {
      let srcNo = treeNodeID;
      if (treeNodeID.includes(',')) srcNo = treeNodeID.substring(0, treeNodeID.indexOf(','));

      if (srcNo == 'local') return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, GloComm.UrlEn('TS.Sys.SFDBSrcLocal', srcNo), '本机数据源属性');

      const dbsrc = new SFDBSrc(srcNo);
      await dbsrc.RetrieveFromDBSources();
      let url = dbsrc.GetParaString('EnName', '');
      if (srcNo === 'local' && url == '') url = 'TS.Sys.SFDBSrcSQL';
      if (url == '') {
        alert('系统错误:');
        return;
      }
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer50, GloComm.UrlEn(url, srcNo), '数据源:' + dbsrc.Name + ' 属性');
    }

    if (btnLab === '目录维护') {
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer30, GloComm.UrlTree('TS.WF.Admin.FrmSort', ''), '目录维护');
    }

    if (btnLab === '删除' || btnLab === '批量删除') {
      if (window.confirm('您确定要删除[' + itemIDs + ']吗?') == false) return;

      if (treeNodeID.includes('SFTable')) {
        const en = new SFTable(itemIDs);
        await en.RetrieveFromDBSources();
        await en.Delete();
        return new GPNReturnObj(GPNReturnType.Reload, '');
      }
      if (treeNodeID.includes('Search')) {
        const en = new SFSearch(itemIDs);
        await en.RetrieveFromDBSources();
        await en.Delete();
        return new GPNReturnObj(GPNReturnType.Reload, '');
      }
      if (treeNodeID.includes('Proc')) {
        const en = new SFProc(itemIDs);
        await en.RetrieveFromDBSources();
        await en.Delete();
        return new GPNReturnObj(GPNReturnType.Reload, '');
      }
      if (treeNodeID.includes('local,Enum')) {
        const en = new SysEnumMainInt(itemIDs);
        await en.RetrieveFromDBSources();
        await en.Delete();
        return new GPNReturnObj(GPNReturnType.Reload, '');
      }
    }

    if (btnLab === '编辑' || btnLab === '双击行') {
      let url = '';
      if (treeNodeID.includes('SFTable')) {
        const dict = new SFTable(itemIDs);
        await dict.RetrieveFromDBSources();
        url = dict.GetParaString('EnName', '');
        return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, GloComm.UrlEn(url, itemIDs), '编辑:' + dict.Name);
        // if (url == '' && srcNo == 'local') {
        // }
      }
      if (treeNodeID.includes('Proc')) {
        const dict = new SFProc(itemIDs);
        await dict.RetrieveFromDBSources();
        url = dict.GetParaString('EnName', '');
      }

      if (treeNodeID.includes('Search')) {
        const dict = new SFSearch(itemIDs);
        await dict.RetrieveFromDBSources();
        url = dict.GetParaString('EnName', '');
      }

      if (treeNodeID.includes('local,Enum')) {
        url = 'TS.FrmUI.SysEnumMainInt';
      }
      //全部搜索查询的结果，点击数据
      if (treeNodeID === '') {
        const dict = new SFTable(itemIDs);
        let count = await dict.RetrieveFromDBSources();
        if (count == 1) url = dict.GetParaString('EnName', '');
        else {
          const dict = new SFProc(itemIDs);
          count = await dict.RetrieveFromDBSources();
          if (count == 1) url = dict.GetParaString('EnName', '');
          else {
            const dict = new SFSearch(itemIDs);
            count = await dict.RetrieveFromDBSources();
            if (count == 1) url = dict.GetParaString('EnName', '');
            else url = 'TS.FrmUI.SysEnumMainInt';
          }
        }
      }

      if (url == '') {
        alert('数据错误,没有获取到 EnName 主键:' + itemIDs + '  节点:' + treeNodeID);
        return;
      }

      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, GloComm.UrlEn(url, itemIDs), '编辑:' + itemIDs);
    }
    alert('没有判断的类型:' + btnLab);
    return false;
  }
}
