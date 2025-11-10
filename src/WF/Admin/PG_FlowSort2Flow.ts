import { PageBasePanelGroup } from '/@/bp/UIEntity/PageBasePanelGroup';
import { FlowAttr } from '/@/WF/TSClass/Flow';
import { windowOpen } from '/@/utils/windowOpen';
import { router } from '/@/router';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { FlowAdms } from '../TSClass/Admin/FlowAdm';
import { FlowSorts } from '../TSClass/Admin/FlowSort';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

export class PG_FlowSort2Flow extends PageBasePanelGroup {
  constructor() {
    super('PG_FlowSort2Flow');
    this.PageTitle = '流程';
    //调用方法 /WF/Comm/PanelGroup.vue?EnName=FlowSort2Flow
    this.BtnsTop = '新建流程,树结构,查询模式,目录维护';
  }

  public async Init() {
    //分组数据.
    const groups = new FlowSorts();
    await groups.RetrieveAll();
    this.GroupsEns = groups.filter((group) => group.ParentNo !== '0') as EntitiesNoName;

    //明细数据.
    const dtls = new FlowAdms();
    await dtls.Init();
    await dtls.RetrieveAll();
    this.DtlEns = dtls; //明细数据.

    this.RefKey = FlowAttr.FK_FlowSort; //关联的字段.
    this.PageTitle = '流程模板';

    this.IsShowAddClick = false; //显示新建按钮.
    this.IsShowEditGroupIcon = true; //显示分组实体按钮.

    this.IsGroupMove = true; //分组是否可以移动？
    this.IsEnMove = true; //实体是否可以移动？
  }

  //获得明细表数据的方法.
  async GenerDtlData(groupNo: any) {
    //明细数据.
    const dtls = new FlowAdms();
    await dtls.Init();
    await dtls.Retrieve('FK_FlowSort', groupNo, 'Idx');
    this.DtlEns = dtls; //明细数据.
    // throw new Error("Method not implemented.");
  }

  //当图标点击的时候，进入流程设计器.
  public IconClick(_groupNo?: string | undefined, enNo?: string | undefined) {
    // const url = '/#/WF/Comm/GroupNew?EnName=GPN_NewFlow&SortNo=' + groupNo;
    // window.location.href = url;
    // todo 表单设计器暂未加入

    //const url = "/#/WF/Admin/FlowDesigner/NewFlow?EnName=NewFlow&SortNo=" + groupNo + "&FK_Flow=" + enNo;
    const { href } = router.resolve({
      name: 'EditFlow',
      query: {
        FlowNo: enNo,
        FK_Flow: enNo,
        EnName: 'NewFlow',
      },
    });
    windowOpen(href, this.PageTitle as string);
    return;
  }

  // 新增流程.
  public AddClick(groupNo?: string | undefined) {
    // const url = "/#/WF/Designer/?EnName=NewFlow&SortNo=" + groupNo;
    const url = location.pathname + '#/WF/Comm/GroupPageNew?EnName=GPN_NewFlow&SortNo=' + groupNo;
    window.location.href = url;
    // return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }

  //自定义按钮点击事件.
  public BtnClick(btnName?: string | undefined) {
    if (btnName == '新建流程' || btnName == '新建') {
      const url = '/@/WF/Comm/GroupPageNew?EnName=GPN_NewFlow';
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    if (btnName == '切换树结构' || btnName == '树结构') {
      const url = '/@/WF/Comm/TreeEns?EnName=TreeEns_FlowSort2Flow';
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    if (btnName === '切换查询模式' || btnName == '查询模式') {
      const url = '/@/WF/Comm/Search.vue?EnName=TS.WF.Admin.FlowAdms';
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    if (btnName === '目录维护') {
      return 'url@/WF/Comm/Ens?EnName=TS.WF.Admin.FlowSort';
    }

    alert(' 没有判断的按钮名称: ' + btnName);
  }
}
