import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { SysEvents } from '/@/WF/Admin/FrmLogic/MapData/FrmEvent/SysEvent';
import { Conds } from '/@/WF/Admin/Cond2020/Cond';

export class GL_SFProc extends PageBaseGenerList {
  constructor() {
    super('GL_SFProc');
    this.PageTitle = '引用过程';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = ''; // 按照日期范围查询的字段.
    this.DTFieldOfLabel = ''; //日期字段名.
    this.PageTitle = '';
    this.BtnOfToolbar = '';
    this.GroupFields = '';
    this.GroupFieldDefault = '';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    this.Icon = '';
    this.ShowIdx = false; //是否显示序号列?

    this.HisGLShowModel = GenerListPageShowModel.Table; //表格展示.

    // 定义列，这些列用于显示.
    this.Columns = [
      { Key: 'title', Name: '引用类型', IsShow: true, IsShowMobile: false },
      { Key: 'note', Name: '说明', IsShow: true, width: 350 },
    ];
    const procNo = this.RequestVal('SFProcNo');
    //获得数据源.
    const frmEvents = new SysEvents();
    await frmEvents.Retrieve('DoDoc', procNo);
    const conds = new Conds();
    await conds.Retrieve('OperatorValue', procNo);
    if (frmEvents.length == 0 && conds.length == 0) {
      this.Data = [];
      return;
    }
    frmEvents.forEach((item) => {
      const eventSource = item.EventSource;
      let name = '';
      if (eventSource === 0) name = '表单事件';
      if (eventSource === 1) name = '节点事件';
      if (eventSource === 2) name = '流程事件';
      this.Data.push({
        title: name,
        note: name.replace('事件', '') + '[' + item.RefPKVal + ']引用了该过程',
      });
    });
    conds.forEach((item) => {
      this.Data.push({
        title: '方向条件',
        note: '节点[' + item.FK_Node + ']到节点[' + item.ToNodeID + ']引用了该过程',
      });
    });
  }

  async LinkFieldClick(_object: Record<string, any>) {
    return null;
  }

  //按钮事件.
  BtnClick(_btnName: string, _object: Record<string, any>, _ids: string) {
    return null;
  }
}
