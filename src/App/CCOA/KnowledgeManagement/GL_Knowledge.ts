import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { Knowledge, Knowledges } from './Knowledge';
import { GloComm } from '/@/WF/Comm/GloComm';
export class GL_Knowledge extends PageBaseGenerList {
  constructor() {
    super('GL_Knowledge');
    this.PageTitle = '知识库';
  }
  //重写的构造方法.
  async Init() {
    this.LinkField = 'Name';
    this.Icon = '';
    this.BtnOfToolbar = '新建';
    this.HisGLShowModel = GenerListPageShowModel.BigIcon;
    this.Columns = [
      { Key: 'No', Name: '编号', IsShow: false, DataType: 2 },
      { Key: 'Name', Name: '名称', IsShow: true, DataType: 1, width: 350 },
      { Key: 'Icon', Name: '图标', IsShow: false, DataType: 1, width: 350 },
    ];

    const ens = new Knowledges();
    await ens.RetrieveAll();
    this.Data = ens;
  }

  //打开页面
  LinkFieldClick(object: Record<string, any>) {
    const no = object.No;
    const url = GloComm.UrlTreeEns('TreeEns_KMTree2KMDtl', '&KnowledgeNo=' + no + '&KnowledgeName=' + object.Name);
    return new GPNReturnObj(GPNReturnType.OpenUrlByTab, url);
  }
  override async BtnClick(btnName: string, _record: Record<string, any>) {
    // if (btnName === '排序' || btnName === t('lowcode.button.systemordering')) {
    //   const url = GloComm.UrlDtlSearch('', 'TS.GPM.MySystem', '', '', '', '', 'Name,Icon', true, '');
    //   return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    // }

    if (btnName === '新建') {
      const val = window.prompt('请输入名称:', '驰骋BPM低代码操作手册');
      if (val == null || val == undefined) return;
      const en = new Knowledge();
      en.Name = val;
      en.Title = val;
      en.Icon = 'icon-drop';
      await en.Insert();
      // WF/Comm/GroupPageNew?EnName=GPN_NewFlow
      // GotoUrl 文件地址  例如打开GPN /@/WF/Comm/UIEntity/GroupPageNew.vue?xxx=xxx
      // OpenUrlByNewWindow 路由地址 例如打开GPN /#/WF/Comm/GroupPageNew?xxx=xxx  这里看路由文件的配置
      const url = GloComm.UrlEn('TS.CCOA.KnowledgeManagement.Knowledge', '');
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }
    // if (btnName === '刷新菜单显示') {
    //   const url = GloComm.UrlGenerList('GL_Gitee');
    //   return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    // }
    // alert('没有判断的BtnName=' + btnName + record);
    return;
  }
}
