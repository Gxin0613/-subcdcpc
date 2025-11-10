import Entity from '../../Admin/FoolFormDesigner/dto/Entity';
import { GloComm } from '/@/WF/Comm/GloComm';
import { PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
// import { WebConfig } from '/@/DataUser/WebConfig';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import WebUser from '/@/bp/web/WebUser';

export class GL_EmailOutBox extends PageBaseGenerList {
  constructor() {
    super('GL_EmailOutBox');
    this.PageTitle = '发件箱';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段，为空就不需要日期段查询.
    this.DTFieldOfLabel = '发件日期'; //日期字段名.
    this.LinkField = 'Title';
    this.GroupFields = 'Sender'; //分组字段.
    this.GroupFieldDefault = 'Sender'; //分组字段.
    this.BtnOfToolbar = '刷新';
    this.Icon = '';
    this.PageSize = 0; // 分页的页面行数, 0不分页.

    // 定义列，这些列用于显示. IsRead,PRI是特殊字段.
    this.Columns = [
      { Key: 'ID', Name: 'ID', IsShow: false, DataType: 1, width: 100 },
      { Key: 'Sender', Name: '发件人', IsShow: true, DataType: 1, width: 100 },
      { Key: 'Title', Name: '标题', IsShow: true, DataType: 1, width: 100 },
      { Key: 'RDT', Name: '发件日期', IsShow: true, DataType: 7, width: 144 },
      { Key: 'IsRead', Name: '是否读取?', IsShow: true, DataType: 1, width: 100 },
    ];

    //获得数据源.
    const emp = new Entity('BP.WF.Port.WFEmp', WebUser.No);
    await emp.Retrieve();
    const dbs = await emp.DoMethodReturnJSON('Email_Inbox');

    //处理数据,增加标签.
    dbs.forEach((en) => {
      if (en.IsRead == 0) {
        en.IsRead = '@未读=red';
        en.Title = '<b>' + en.Title + '</b>';
      } else {
        en.IsRead = '@已读=blue';
      }
      en.BirthDT = this.FirendlyDT(en.RDT);
    });

    this.Data = dbs;
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    // let url = '/#/WF/MyCC?WorkID=' + object.WorkID;
    // const keys = Object.keys(object);
    // for (const key of keys) {
    //   if (key === 'WorkID') continue;
    //   if (key === 'NodeID') continue;
    //   if (key === 'NodeIDCC') url += `&NodeID=${object[key]}`;
    //   if (key === 'FK_Flow') {
    //     url += `&FK_Flow=${object['FlowNo'] || object['FK_Flow']}`;
    //     continue;
    //   }
    //   url += `&${key}=${object[key]}`;
    // }
    // const flowOpenModel = WebConfig.FlowOpenModel || 0;
    // if (flowOpenModel === 0) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    // if (flowOpenModel === 1) return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
    // if (flowOpenModel === 2) return new GPNReturnObj(GPNReturnType.OpenUrlByTab, url);
    // if (flowOpenModel === 3) return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    const url = GloComm.UrlEn('TS.Demo.Student', object.No);
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    //    throw new Error("Method not implemented.");
  }

  async BtnClick(btnName: string, object: Record<string, any>) {
    if (btnName == '刷新') {
      const emp = new Entity('BP.WF.Port.WFEmp', WebUser.No);
      await emp.Retrieve();
      const data = await emp.DoMethodReturnJSON('Email_Inbox');
      alert(data);
    }
  }
}
