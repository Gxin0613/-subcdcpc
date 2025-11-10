import { PageBasePanelGroup } from '/@/bp/UIEntity/PageBasePanelGroup';
import { Depts } from '/@/bp/port/Dept';
import { Emps } from '/@/bp/port/Emp';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';

export class PG_Dept2Emp extends PageBasePanelGroup {
  BtnClick(btnName?: string | undefined) {
    if (btnName == '切换树结构') return 'jump@/WF/Comm/TreeEns.vue?EnName=TreeEns_Dept2Emp';

    if (btnName == '切换查询模式') return 'jump@/WF/Comm/Search.vue?EnName=TS.Port.Emp';

    alert('Method not implemented.' + btnName);
  }
  constructor() {
    super('PG_Dept2Emp');
    this.PageTitle = '组织结构';
    //调用方法 /WF/Comm/PanelGroup.vue?EnName=FrmSort2Frm
  }

  public async Init() {
    //分组数据.
    const groups = new Depts();
    await groups.RetrieveAll();
    // groups.filter((group) => group.ParentNo != 0);
    this.GroupsEns = groups.filter((group) => group.ParentNo !== '0') as EntitiesNoName;

    //明细数据.
    const dtls = new Emps();
    await dtls.RetrieveAll();
    this.DtlEns = dtls; //明细数据.

    this.RefKey = 'FK_Dept'; //关联的字段.
    this.PageTitle = '组织结构';
    this.IsShowAddClick = true; //显示新建按钮.
    this.IsShowEditGroupIcon = true; //显示分组实体按钮.
    this.IsGroupMove = true; //分组是否可以移动？
    this.IsEnMove = true; //实体是否可以移动？
    this.BtnsTop = '切换树结构,切换查询模式';

    // this.BtnsTop = "切换树结构,切换查询模式,新建流程,目录维护";
  }

  //获得明细表数据的方法.
  async GenerDtlData(groupNo: any) {
    //明细数据.
    const dtls = new Emps();
    await dtls.Init();
    await dtls.Retrieve('FK_Dept', groupNo, 'Idx');
    this.DtlEns = dtls; //明细数据.

    // throw new Error("Method not implemented.");
  }

  //设计表单.
  public IconClick(groupNo?: string | undefined, enNo?: string | undefined) {
    // todo 打开人员.
    return 'open@/WF/Comm/En.vue?EnName=TS.Port.Emp&PKVal=' + groupNo + '&FK_Frm=' + enNo;
    //  window.open(url);
  }

  // 新建表单.
  public AddClick(groupNo?: string | undefined) {
    // todo: 打开新窗口，不要布局
    //调用组件.
    return 'open@/WF/Comm/UIEntity/GroupPageNew.vue?EnName=NewFrm&SortNo=' + groupNo;
  }
}
