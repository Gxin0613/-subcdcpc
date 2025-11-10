import { PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
import { message } from 'ant-design-vue';
import WebUser from '/@/bp/web/WebUser';

export class GL_HuiQian extends PageBaseGenerList {
  override LinkFieldClick(_object: Record<string, any>) {}
  constructor() {
    super('GL_HuiQian');
    this.PageTitle = '会签';
  }
  //重写的构造方法.
  async Init() {
    this.Icon = '';
    this.BtnOfToolbar = '';
    this.PageSize = 300; // 分页的页面行数, 0不分页.
    this.BtnOfToolbar = '增加人员';
    this.GroupFields = 'DeptName';
    // 定义列，这些列用于显示. IsRead,PRI是特殊字段.
    this.Columns = [
      { Key: 'Idx', Name: '#', IsShow: false, DataType: 1 },
      { Key: 'FK_Emp', Name: '人员', IsShow: true, DataType: 1 },
      { Key: 'EmpName', Name: '名称', IsShow: true, DataType: 1 },
      { Key: 'DeptName', Name: '部门', IsShow: true, DataType: 1 },
      { Key: 'State', Name: '状态', IsShow: true, DataType: 1 },
      { Key: 'Note', Name: '意见', IsShow: true, DataType: 1 },
      { Key: 'RDT', Name: '日期', IsShow: true, DataType: 1 },
      { Key: 'Btns', Name: 'Btns', IsShow: false, IsShowMobile: false },
    ];
    //获得数据源.
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddPara('WorkID', this.RequestVal('WorkID'));
      const data: any = await handler.DoMethodReturnJson('HuiQian_Init');
      this.Data = data.WF_GenerWorkList;
      this.Data.forEach((item) => {
        item.DeptName = item.FK_DeptT;
        if (item.IsPass === 100) item.State = '主持人/已阅';
        if (item.IsPass === 1001) item.State = '主持人/已审核';
        //当前是组长模式处理，并且是主持人
        if (item.IsPass == 90) item.State = '主持人/未审批';

        //当前自己
        if (item.IsPass == 99) item.State = '主持人(自己)/未审批';
        if (item.IsPass == 9901) item.State = '主持人(自己)/已审核';
        if (item.IsPass == 0) {
          if (item.FK_Emp == WebUser.No) item.State = '主持人/已阅';
          else {
            if (item.IsRead == 0) item.State = '未阅';
            if (item.IsRead == 1) item.State = '已阅';
            item.Btns = '移除,催办';
          }
        }
        if (item.IsPass == 1) {
          if (item.FK_Emp == WebUser.No) item.State = '主持人/已审核';
          else {
            item.State = '已审核';
            item.Btns = '移除';
          }
        }
      });
      console.log('data', this.Data);
    } catch (e) {
      message.error(e as string);
    }
  }

  async BtnClick(btnName: string, _object: Record<string, any>) {
    if (btnName == '增加人员') {
      const workID = this.RequestVal('WorkID');
      const huiQianType = this.RequestVal('HuiQianType');
      const nodeID = this.RequestVal('NodeID');
      const url = GloComm.UrlGPN('GPN_SelectEmps', '', '&WorkID=' + workID + '&HuiQianType=' + huiQianType + '&NodeID=' + nodeID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
    }
    if (btnName == '移除') {
      try {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
        handler.AddPara('WorkID', _object.WorkID);
        handler.AddPara('FK_Emp', _object.FK_Emp);
        await handler.DoMethodReturnString('HuiQian_Delete');
        return new GPNReturnObj(GPNReturnType.Reload);
      } catch (e) {
        message.error(e as string);
      }
    }
    if (btnName == '催办') {
      const val = prompt('请输入催办信息', '该工作因为xxx原因，需要您优先处理.');
      if (val != null && val != '') {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
        handler.AddPara('WorkID', _object.WorkID);
        handler.AddPara('FK_Emp', _object.FK_Emp);
        handler.AddPara('Msg', val);
        const data = await handler.DoMethodReturnString('HuiQian_Press');
        if (typeof data == 'string' && data.includes('err@')) {
          message.error(data.replace('err@', ''));
          return;
        }
        message.success(data);
      }
    }
    return;
  }
}
