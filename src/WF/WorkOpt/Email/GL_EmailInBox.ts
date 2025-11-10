import { SMSs } from './SMS';
import { GloComm } from '/@/WF/Comm/GloComm';
import { PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import WebUser from '/@/bp/web/WebUser';
import BSEntity from '/@/utils/gener/BSEntity';

export class GL_EmailInBox extends PageBaseGenerList {
  constructor() {
    super('GL_EmailInBox');
    this.PageTitle = '收件箱';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段，为空就不需要日期段查询.
    this.DTFieldOfLabel = '发件日期'; //日期字段名.
    this.LinkField = 'EmailTitle';
    this.GroupFields = 'Sender'; //分组字段.
    this.GroupFieldDefault = 'Sender'; //分组字段.
    this.BtnOfToolbar = '刷新';
    this.Icon = '';
    this.PageSize = 0; // 分页的页面行数, 0不分页.

    // 定义列，这些列用于显示. IsRead,PRI是特殊字段.
    this.Columns = [
      { Key: 'MyPK', Name: 'MyPK', IsShow: false, DataType: 1, width: 100 },
      { Key: 'Sender', Name: '发件人', IsShow: true, DataType: 1, width: 100 },
      { Key: 'EmailTitle', Name: '标题', IsShow: true, DataType: 1, width: 100 },
      { Key: 'RDT', Name: '发件日期', IsShow: true, DataType: 7, width: 144 },
      { Key: 'IsRead', Name: '是否读取?', IsShow: true, DataType: 1, width: 100 },
    ];

    const ens = new SMSs();
    await ens.Retrieve('SendTo', WebUser.No);

    //处理数据,增加标签.
    ens.forEach((en) => {
      if (en.IsRead == 0) {
        en.IsRead = '@未读=red';
        en.Title = '<b>' + en.Title + '</b>';
      } else {
        en.IsRead = '@已读=blue';
      }
      en.BirthDT = this.FirendlyDT(en.RDT);
    });

    this.Data = ens;
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    const url = GloComm.UrlEn('TS.Port.SMS', object.MyPK);
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    //    throw new Error("Method not implemented.");
  }

  async BtnClick(btnName: string, object: Record<string, any>) {
    if (btnName == '刷新') {
      const emp = new BSEntity('BP.WF.Port.WFEmp', WebUser.No);
      await emp.Retrieve();
      const data = await emp.DoMethodReturnJSON('Email_Inbox');
      alert(data);
    }
  }
}
