import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import WebUser from '/@/bp/web/WebUser';
import { Modal } from 'ant-design-vue';
import { h } from 'vue';
export class GL_DBGenerList extends PageBaseGenerList {
  override OnTextBlur(_object: Record<string, any>) {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('GL_DBGenerList');
    this.PageTitle = '不分页视图';
  }
  //重写的构造方法.
  async Init() {
    try {
      //表单ID
      const frmID = this.RequestVal('FrmID');
      const handler = new HttpHandler('BP.CCBill.WF_CCBill');
      handler.AddPara('FrmID', frmID);
      const data = await handler.DoMethodReturnString('DBGenerList_Init');
      const info = data['Info'][0];
      this.PageTitle = info['PageTitle'] || '不分页视图';
      //时间查询字段及标签
      this.DTFieldOfSearch = info['DTField'];
      this.DTFieldOfLabel = info['DTFieldT'];
      //超链接字段
      this.LinkField = '';
      //分组字段
      this.GroupFields = info['GroupField']; //分组字段.
      this.GroupFieldDefault = info['GroupDefault']; //默认分组字段.
      //标签字段
      this.LabFields = info['LabField'];
      this.Icon = '';
      this.PageSize = 0;
      //显示
      this.HisGLShowModel = GenerListPageShowModel.Table;
      this.Columns = data['Attrs'];
      //设置数据源.
      this.Data = data['Data'];
    } catch (e) {
      Modal.error({
        title: () => h('span', '错误'),
        content: () => h('span', e as string),
      });
    }
    if (WebUser.No === 'admin') this.BtnOfToolbar = '设计'; //工具栏按钮.
  }

  //打开页面.
  LinkFieldClick(_object: Record<string, any>) {}

  //按钮事件.
  async BtnClick(btnName: string, _object: Record<string, any>) {
    if (btnName === '设计') {
      const frmID = this.RequestVal('FrmID');
      const url = GloComm.UrlEn('TS.CCBill.GLDBView', '&No=' + frmID + '&PKVal=' + frmID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url, '不分页视图');
    }
  }
}
