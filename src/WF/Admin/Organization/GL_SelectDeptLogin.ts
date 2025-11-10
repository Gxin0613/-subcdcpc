// import { WebConfig } from '/@/DataUser/WebConfig';
import { message } from 'ant-design-vue';
import HttpHandler from '../FoolFormDesigner/dto/HttpHandler';
import { PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { CCBPMRunModel, SystemConfig } from '/@/bp/difference/SystemConfig';
import WebUser from '/@/bp/web/WebUser';
import DBAccess from '/@/utils/gener/DBAccess';
export class GL_SelectDeptLogin extends PageBaseGenerList {
  constructor() {
    super('GL_SelectDeptLogin');
    this.PageTitle = '切换组织';
  }
  //重写的构造方法.
  async Init() {
    this.LinkField = 'Name';
    this.Icon = '';
    this.BtnOfToolbar = '';
    this.PageSize = 15; // 分页的页面行数, 0不分页.

    if (CCBPMRunModel.Single == SystemConfig.CCBPMRunModel) {
      this.Columns = [
        { Key: 'No', Name: '部门编号', IsShow: true, DataType: 2 },
        { Key: 'Name', Name: '部门名称', IsShow: true, DataType: 1, width: 350 },
        { Key: 'Note', Name: '备注', IsShow: true, DataType: 1, width: 150 },
      ];
    } else {
      this.Columns = [
        { Key: 'No', Name: '部门编号', IsShow: true, DataType: 1, width: 200 },
        { Key: 'Name', Name: '部门名称', IsShow: true, DataType: 1, width: 350 },
        { Key: 'OrgNo', Name: '组织编号', IsShow: false, DataType: 1, width: 350 },
        { Key: 'OrgName', Name: '组织名称', IsShow: true, DataType: 1, width: 350 },
        { Key: 'Note', Name: '备注', IsShow: true, DataType: 1, width: 150 },
      ];

      this.GroupFields = 'OrgName';
    }

    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
    const data: any = await handler.DoMethodReturnJson('My_Depts');

    this.Data = data;
    console.log('data', this.Data);
  }

  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {
    if (object.No == WebUser.DeptNo) {
      message.info('当前部门已是' + WebUser.DeptName + '请重新选择.');
      return;
    }
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
    handler.AddPara('RefNo', object.No);
    const data: string = await handler.DoMethodReturnJson('Change_Dept');
    message.success(data);
    //清理流程发起字段值
    const sql = `UPDATE WF_Emp SET StartFlows='' WHERE No='${WebUser.No}'`;
    await DBAccess.RunUrlReturnString(sql);
    //刷新页面
    setTimeout(() => {
      location.reload();
    }, 1000);
  }

  BtnClick(btnName: string, object: Record<string, any>) {
    if (btnName == '批处理') {
      // const url = '/src/WF/Batch.vue?xx' + object.WorkID;
      // window.location.href = url;
      return;
    }
    return;
    // throw new Error('Method not implemented.');
  }
}
