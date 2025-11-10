import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { DataType } from '/@/bp/en/DataType';
import { getGiteeCode, getAccess_token, checkGiteeStarred } from '/@/utils/giteeStar';
import { getCookie } from '/@/utils/storage';

export class GL_Gitee extends PageBaseGenerList {
  constructor() {
    super('GL_Gitee');
    this.PageTitle = '请支持我们Star';
  }
  //重写的构造方法.
  async Init() {
    this.LinkField = 'Url';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    this.BtnOfToolbar = '点star后重新检测';

    //定义列.
    this.Columns = [
      { Key: 'No', Name: '编号', IsShow: true, DataType: DataType.AppString },
      { Key: 'MC', Name: '名称', IsShow: true, DataType: 1, width: 100 },
      { Key: 'Url', Name: 'GiteeAddr', IsShow: true, DataType: 1, width: 100 },
    ];

    let toStar = [];
    const access_token = getCookie('gitee_access_token');
    if (access_token != '') {
      toStar = await checkGiteeStarred(access_token);
    } else {
      const gcode = await getGiteeCode();
      if (gcode != null) {
        const access_token = await getAccess_token(gcode);
        toStar = await checkGiteeStarred(access_token);
      }
    }
    if (toStar.length == 0) {
      window.location.reload();
    }

    this.Data = toStar;
  }

  //打开页面.
  async LinkFieldClick(record: Record<string, any>) {
    //页面跳转到测试容器
    const url = record.Url;
    return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
  }

  /**
   * 按钮操作，包含工具栏、行操作 ，
   * @param btnName 按钮名称
   * @param object 行数据
   * @param params 组件参数
   * @param callback 回调函数
   * @constructor
   */
  async BtnClick(btnName: string, record: Record<string, any>) {
    if (btnName === '点star后重新检测') {
      return new GPNReturnObj(GPNReturnType.Reload);
    }
    console.log(record);
    return;
  }
}
