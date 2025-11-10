import { message } from 'ant-design-vue';
import { GenerListEn } from './GenerListEn';
import { GLEnOpenModel, GLEnOpenShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
export class GL_GLEn extends PageBaseGenerList {
  constructor() {
    super('GL_GLEn');
    this.PageTitle = 'GLEn列表';
  }
  //重写的构造方法.
  async Init() {
    const enID = this.RequestVal('EnID');
    const en = new GenerListEn(enID);
    en.No = enID;
    await en.RetrieveFromDBSources();
    console.log('en', en, this);

    // 使用正则表达式匹配所有'@key=value'格式的片段
    const matches = en.ColName.match(/@([^=]+)=([^@]+)/g);
    if (!matches) return { keys: [], values: [] };
    // 提取键和值并分别存储在两个数组中
    const keys: any = [];
    const values: any = [];
    matches.forEach((match) => {
      // 去除'@'和'='，并将结果分割为键和值
      const [, key, value] = match.match(/@([^=]+)=([^@]+)/);
      keys.push(key);
      values.push(value);
    });

    this.DTFieldOfSearch = en.DTField; // 'RDT'; // 按照日期范围查询的字段，为空就不需要日期段查询.
    this.DTFieldOfLabel = values[keys.indexOf(en.DTField)]; // '发起日期'; //日期字段名.
    this.LinkField = en.TitleField; // 'Title';
    this.GroupFields = en.GroupField; // 'NodeName,FlowName,StarterName'; //分组字段.
    this.GroupFieldDefault = en.DefaultGroupField; // 'FlowName'; //分组字段.
    this.SearchDictOpenType = en.SearchDictOpenType;
    this.RowOpenModel = en.RowOpenModel;
    this.Icon = '';
    this.BtnOfToolbar = '';
    this.PageSize = 15; // 分页的页面行数, 0不分页.
    this.UrlExt = en.UrlExt;

    //设置列
    for (let i = 0; i < keys.length; i++) {
      this.Columns.push({
        Key: keys[i],
        Name: values[i],
        IsShow: keys[i] == 'No' ? false : true,
        IsShowMobile: keys[i] == 'No' ? false : true,
        DataType: 2,
      });
    }

    try {
      //获得数据源.
      const handler = new HttpHandler('BP.CCBill.CCBill_Plus');
      handler.AddPara('RefNo', enID);
      handler.AddPara('DBSrc', en.DBSrc);
      const data: any = await handler.DoMethodReturnJson('GenerListEn_Init');
      this.Data = data;
      console.log('data', this.Data);
    } catch (e: any) {
      message.error('获取列失败，请检查配置');
      this.Columns = [];
    }
  }

  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {
    let url = '';
    const openMode = this.SearchDictOpenType;
    if (openMode == GLEnOpenShowModel.MyDictFrameWork) {
      url = '/#/CCFast/CCBill/MyDictFrameWork?';
    }
    if (openMode == GLEnOpenShowModel.MyDict) {
      url = '/#/CCFast/CCBill/MyDict?';
    }
    if (openMode == GLEnOpenShowModel.En) {
      url = `/#/WF/Comm/EnPage?PKVal=${object.No}&`;
    }
    if (openMode == GLEnOpenShowModel.MyView) {
      url = '/#/WF/MyView?';
    }
    if (openMode == GLEnOpenShowModel.MyCC) {
      url = '/#/WF/MyCC?';
    }
    //自定义
    if (openMode == GLEnOpenShowModel.URL) {
      if (this.UrlExt.startsWith(`http://`) || this.UrlExt.startsWith('https://')) {
        url = this.UrlExt + '?';
      }
      url = this.UrlExt.replace('@No', object.No.toString()) + '&';
    }
    //url拼接
    url += 'WorkID=' + object.WorkID;
    const keys = Object.keys(object);
    for (const key of keys) {
      if (key === 'WorkID') continue;
      url += `&${key}=${object[key]}`;
    }
    if (url.startsWith(`http://`) || url.startsWith('https://')) {
      window.open(url);
    }
    if (this.RowOpenModel == GLEnOpenModel.NewWindow) return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    if (this.RowOpenModel == GLEnOpenModel.CurrentWindow) return new GPNReturnObj(GPNReturnType.Replace, url);
    if (this.RowOpenModel == GLEnOpenModel.OldModalWindow) return new GPNReturnObj(GPNReturnType.OpenIframeByModal, url);
    if (this.RowOpenModel == GLEnOpenModel.NewModalWindow) return new GPNReturnObj(GPNReturnType.OpenIframeByModal, url);
  }

  BtnClick(btnName: string, object: Record<string, any>) {}
}
