import { PageBasePanelGroup } from '/@/bp/UIEntity/PageBasePanelGroup';
import { windowOpen } from '/@/utils/windowOpen';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { FrmSorts } from '../TSClass/Admin/FrmSort';
import { FrmAdms } from '../TSClass/Admin/FrmAdm';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

export class PG_FrmSort2Frm extends PageBasePanelGroup {
  GenerDtlData(groupNo: any) {
    if (groupNo) return null;
    return null;
  }

  constructor() {
    super('PG_FrmSort2Frm');
    this.PageTitle = '表单';
  }

  public async Init() {
    //分组数据.
    const groups = new FrmSorts();
    await groups.RetrieveAll();
    this.GroupsEns = groups.filter((group) => group.ParentNo !== '0') as EntitiesNoName;
    //分组数据.

    //明细数据.
    const dtls = new FrmAdms();
    await dtls.RetrieveAll();
    this.DtlEns = dtls; //明细数据.

    this.RefKey = 'FK_FormTree'; //关联的字段.
    this.PageTitle = '表单模板';
    this.IsShowAddClick = false; //显示新建按钮.
    this.IsShowEditGroupIcon = true; //显示分组实体按钮.
    this.IsGroupMove = true; //分组是否可以移动？
    this.IsEnMove = true; //实体是否可以移动？
    this.BtnsTop = '新建表单,目录维护,切换树结构,切换查询模式,枚举库,字典库';
  }

  //设计表单.
  public IconClick(groupNo?: string | undefined, enNo?: string | undefined) {
    // alert(groupNo);
    // todo 表单设计器暂未加入
    const url = '/#/WF/Designer/Form?groupNo=' + groupNo + '&FrmID=' + enNo;
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    // windowOpen(url, this.PageTitle as string);
  }

  // 新建表单.
  public AddClick(groupNo?: string | undefined) {
    // todo: 打开新窗口，不要布局
    //调用组件.
    const url = '/@/WF/Comm/GroupPageNew?EnName=NewFrm&SortNo=' + groupNo;
    windowOpen(url, this.PageTitle as string);
  }

  // 如果通过路由打开页面 /#/WF/xxxx   表示你想跳转到系统下面的某个路由  /router/modules/对应模块.ts (comm.ts)
  // 如果你要加载组件 /src/WF/xxx.vue
  // 定义按钮的返回链接 url@/#/WF/xxxx
  public BtnClick(btnName?: string) {
    // 当前页面跳转
    if (btnName == '新建表单' || btnName == '新建项目') {
      const url = '/@/WF/Comm/GroupPageNew?EnName=GPN_NewFrm';
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    if (btnName == '切换树结构') {
      return 'url@/WF/Comm/TreeEns?EnName=TreeEns_FrmSort2Frm';
    }

    if (btnName === '切换查询模式') {
      return 'url@/WF/Comm/Search?EnName=TS.WF.Admin.FrmAdms';
    }
    ///侧滑打开.
    if (btnName === '目录维护') {
      return 'open@/src/WF/Comm/Ens.vue?EnName=TS.WF.Admin.FrmSort';
    }
    ///侧滑打开.
    if (btnName === '字典库') {
      return 'open@/src/WF/Comm/Dtl/DtlSearch.vue?EnName=TS.FrmUI.SFTable';
    }
    ///侧滑打开.
    if (btnName === '枚举库') {
      return 'open@/src/WF/Comm/Dtl/DtlSearch.vue?EnName=TS.FrmUI.SFTable';
    }

    alert(' 没有判断的按钮名称: ' + btnName);

    // if (btnName === '新建表单') return 'url@/WF/Comm//UIEntity/GroupPageNew?EnName=GPN_NewFrm';

    console.log(btnName);
  }
}
