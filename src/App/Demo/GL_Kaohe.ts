import { PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import { Students } from './Student';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GL_Kaohe extends PageBaseGenerList {
  override OnTextBlur(_object: Record<string, any>) {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('GL_Kaohe');
    this.PageTitle = '考核';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段，为空就不需要日期段查询.
    this.DTFieldOfLabel = '出生日期'; //日期字段名.
    this.LinkField = 'Name';
    this.GroupFields = ''; //分组字段.
    this.GroupFieldDefault = ''; //分组字段.
    this.Icon = '';
    this.BtnOfToolbar = '新建,批处理';
    this.PageSize = 15; // 分页的页面行数, 0不分页.
    this.LabFields = 'XBT'; //标签字段.
    this.ProgressFields = 'JinDu'; //进度字段.

    // 定义列，这些列用于显示. IsRead,PRI是特殊字段.
    this.Columns = [
      { Key: 'No', Name: '编号', IsShow: true, DataType: 1, width: 100 },
      { Key: 'Name', Name: '名称', IsShow: true, DataType: 1, width: 100 },
      { Key: 'Age', Name: '年龄', IsShow: true, DataType: 2, width: 50 },
      { Key: 'XBT', Name: '性别', IsShow: true, IsShowMobile: false, DataType: 2 },
      { Key: 'JinDu', Name: '进度', IsShow: true, DataType: 2 },
      { Key: 'BanJiNoText', Name: '班级', IsShow: true, DataType: 1 },
      { Key: 'BirthDT', Name: '出生日期', IsShow: true, DataType: 7, width: 144 },
      { Key: 'RDT', Name: '创建日期', IsShow: true, DataType: 7, width: 144 },
    ];

    //获得数据源.
    const ens = new Students();
    await ens.RetrieveAll();
    // if (xb == null || xb == undefined) await ens.RetrieveAll();
    // else await ens.Retrieve('XB', xb);

    //处理数据,增加标签.
    ens.forEach((en) => {
      if (en.XB == 0) en.XBT = '@女=red';
      else en.XBT = '@男=blue';
      en.JinDu = en.Age / 10; //进度设置为0-1小数.
      en.BirthDT = this.FirendlyDT(en.BirthDT);
    });

    this.Data = ens;
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

  BtnClick(btnName: string, object: Record<string, any>) {
    if (btnName == '批处理') {
      // const url = '/src/WF/Batch.vue?xx' + object.WorkID;
      // window.location.href = url;
      alert('未实现');
      return;
    }
    if (btnName == '新建') {
      const url = GloComm.UrlGPN('GPN_Student', '');
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }

    alert('没有解析:' + btnName);
  }
}
