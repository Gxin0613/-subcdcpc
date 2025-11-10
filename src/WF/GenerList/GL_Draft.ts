import { GenerListPageShowModel, PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { router } from '/@/router';
import { IsMobile } from '/@/utils/gener/StringUtils';
import { isComPage } from '/@/utils/gl';
export class GL_Draft extends PageBaseGenerList {
  constructor() {
    super('GL_Draft');
    this.PageTitle = '草稿';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段.
    this.DTFieldOfLabel = '保存日期'; //日期字段名.
    this.LinkField = 'Title';
    this.Icon = '';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    this.HisGLShowModel = GenerListPageShowModel.Table;
    this.GroupFields = 'FlowName';
    this.GroupFieldDefault = 'FlowName';

    // 定义列，这些列用于显示.
    this.Columns = [
      { Key: 'WorkID', Name: '工作ID', IsShow: false, IsShowMobile: false },
      { Key: 'Title', Name: '标题', IsShow: true },
      { Key: 'RDT', Name: '编写时间', IsShow: true },
      { Key: 'FlowName', Name: '流程', IsShow: true },
    ];
    let flowNo = this.RequestVal('FlowNo'); //流程编号参数.
    if (!flowNo) flowNo = this.RequestVal('PKVal');

    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF');
    handler.AddUrlData();
    handler.AddPara('FlowNo', flowNo);
    this.Data = await handler.DoMethodReturnJson('Draft_Init');
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    let url = '/#/WF/MyFlow?WorkID=' + object.WorkID;
    const keys = Object.keys(object);
    for (const key of keys) {
      if (key === 'WorkID') continue;
      url += `&${key}=${object[key]}`;
    }
    const PathHash = location.hash;
    let urlPath: any = '';
    if (IsMobile()) {
      const mobileUrl = url.replace('/#/WF/', '/CCMobile/');
      try {
        router.push(mobileUrl);
      } catch (e: any) {
        location.hash = '#' + mobileUrl;
      }
      return;
    }
    if (PathHash.includes('/WF/Port')) {
      urlPath = isComPage(url);
      url = urlPath + '&win=true';
      // 新标签页打开;
      window.open(url);
      return;
    }
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
  }

  BtnClick(btnName: string, object: Record<string, any>) {
    if (btnName === object.WorkID) throw new Error('Method not implemented.');
  }
}
