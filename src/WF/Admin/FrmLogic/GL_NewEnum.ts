// import { WebConfig } from '/@/DataUser/WebConfig';

import { GloComm } from '../../Comm/GloComm';
import { SysEnumMains } from './SysEnum/SysEnumMain';
import { PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GL_NewEnum extends PageBaseGenerList {
  constructor() {
    super('GL_NewEnum');
    this.PageTitle = '枚举字段';
  }
  //重写的构造方法.
  async Init() {
    this.LinkField = 'Name';
    this.GroupFields = ''; //分组字段.
    this.GroupFieldDefault = ''; //分组字段.
    this.BtnOfToolbar = '新建';
    this.PageSize = 100; // 分页的页面行数, 0不分页.

    // 定义列，这些列用于显示. IsRead,PRI是特殊字段.
    this.Columns = [
      { Key: 'No', Name: '编号', IsShow: false, DataType: 2 },
      { Key: 'Name', Name: '名称', IsShow: false, DataType: 2 },
      { Key: 'EnumKey', Name: '键值', IsShow: true, DataType: 1, width: 350 },
      { Key: 'CfgVal', Name: '配置信息', IsShow: true, DataType: 1, width: 66 },
      { Key: 'EnumType', Name: '枚举类型', IsShow: true, DataType: 1, width: 150 },
    ];

    const data = new SysEnumMains();
    await data.Init();
    await data.RetrieveAll();
    this.Data = data;
    console.log('data', this.Data);
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    let url = '/#/WF/MyCC?WorkID=' + object.WorkID;
    const keys = Object.keys(object);
    for (const key of keys) {
      if (key === 'WorkID') continue;
      if (key === 'NodeID') continue;
      if (key === 'NodeIDCC') url += `&NodeID=${object[key]}`;
      if (key === 'FK_Flow') {
        url += `&FK_Flow=${object['FlowNo'] || object['FK_Flow']}`;
        continue;
      }
      url += `&${key}=${object[key]}`;
    }
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
  }

  BtnClick(btnName: string, object: Record<string, any>) {
    if (btnName == '新建') {
      const url = GloComm.UrlGPN('GPN_Enum', '', '');
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }
    return;
  }
}
