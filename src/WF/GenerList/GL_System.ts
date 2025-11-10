import { message } from 'ant-design-vue';
import { GenerListPageShowModel, PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import { GloComm } from '../Comm/GloComm';
import { AtPara } from '/@/bp/da/AtPara';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import WebUser from '/@/bp/web/WebUser';
import { MySystems } from '/@/CCFast/GPM/MySystem';
import { APP_MENU_CACHE_KEY } from '/@/enums/cacheEnum';
import { setAuthCache } from '/@/utils/auth';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();
export class GL_System extends PageBaseGenerList {
  constructor() {
    super('GL_System');
    this.PageTitle = '低代码';
  }
  //重写的构造方法.
  async Init() {
    this.LinkField = 'Name';
    this.Icon = '';
    this.BtnOfToolbar = '新建应用' + ',' + '应用排序' + ',' + '刷新菜单显示';
    this.HisGLShowModel = GenerListPageShowModel.BigIcon;

    //定义列,这些列用于显示.IsRead,PRI是特殊字段.
    this.Columns = [
      { Key: 'No', Name: '编号', IsShow: false, DataType: 2 },
      { Key: 'Name', Name: '名称', IsShow: true, DataType: 1, width: 350 },
      { Key: 'Icon', Name: '图标', IsShow: false, DataType: 1, width: 350 },
    ];

    const ens = new MySystems();
    if (WebUser.CCBPMRunModel != CCBPMRunModel.Single) {
      await ens.Retrieve('OrgNo', WebUser.OrgNo, 'Idx');
    } else if (WebUser.No == 'admin') {
      await ens.RetrieveAll('Idx');
    } else if (WebUser.RootNo) {
      await ens.RetrieveLikeKey(WebUser.RootNo, 'FK_Stations');
    } else {
      message.error('err@您好:' + WebUser.Name + ',非管理员用户不能查看.');
      return;
    }
    ens.forEach((en) => {
      if (en.No !== '001' && en.Name !== '业务流程') this.Data.push(Object.fromEntries(en.Row));
    });

    console.log('this.Data', this.Data);
    const getSystemNo = localStorage.getItem('AppNo');
    if (!!getSystemNo) {
      const hasMatchingAppNo = this.Data.some((da) => da.AppNo === getSystemNo);
      console.log('hasMatchingAppNo', hasMatchingAppNo);
      // 根据检查结果来过滤数组
      if (hasMatchingAppNo) {
        // 如果存在匹配的 AppNo，则过滤数组只保留匹配项
        this.Data = this.Data.filter((da) => da.AppNo === getSystemNo);
      } else {
        this.Data = this.Data.filter((da) => da.SystemType !== 3);
      }
    } else {
      this.Data = this.Data.filter((da) => da.SystemType !== 3);
    }

    // 进入低代码页面清理缓存
    setAuthCache(APP_MENU_CACHE_KEY, []);
  }

  //打开页面
  LinkFieldClick(object: Record<string, any>) {
    const atPara = new AtPara(object.AtPara);
    const enName = atPara.GetValStrByKey('EnName') || 'TS.GPM.MySystem';
    const url = `/src/WF/Comm/En.vue?EnName=${enName}&PKVal=${object.No}`;
    /*const keys = Object.keys(object);
    for (const key of keys) {
      if (key === 'No') continue;
      url += `&${key}=${object[key]}`;
    }*/
    return new GPNReturnObj(GPNReturnType.OpenUrlByTab, url, object.Name);
  }
  override async BtnClick(btnName: string, record: Record<string, any>) {
    if (btnName === '排序' || btnName === '应用排序') {
      const url = GloComm.UrlDtlSearch('', 'TS.GPM.MySystem', '', '', '', '', 'Name,Icon', true, '');
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }

    if (btnName === '新建应用') {
      // WF/Comm/GroupPageNew?EnName=GPN_NewFlow
      // GotoUrl 文件地址  例如打开GPN /@/WF/Comm/UIEntity/GroupPageNew.vue?xxx=xxx
      // OpenUrlByNewWindow 路由地址 例如打开GPN /#/WF/Comm/GroupPageNew?xxx=xxx  这里看路由文件的配置
      const url = GloComm.UrlGPN('GPN_System');
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }
    if (btnName === '刷新菜单显示') {
      const url = GloComm.UrlGenerList('GL_Gitee');
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }
    // alert('没有判断的BtnName=' + btnName + record);
    return;
  }
}
