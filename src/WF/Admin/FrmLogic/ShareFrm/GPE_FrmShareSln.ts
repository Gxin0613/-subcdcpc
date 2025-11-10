import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { MapFrmFool } from '../MapData/MapFrmFool';
import { GloWF } from '../../GloWF';
import { FrmOrg, FrmOrgs } from './FrmOrg';

export class GPE_FrmShareSln extends PageBaseGroupEdit {
  constructor() {
    super('GPE_FrmShareSln');
    this.PageTitle = '表单共享方案';
  }

  Init() {
    this.entity = new MapFrmFool(); //对应的类.
    this.KeyOfEn = 'ShareSln'; //要编辑的字段.

    //增加子页面.
    this.AddGroup('A', '表单共享方案'); //增加分组.
    this.Blank('0', '不共享', this.Desc0);
    this.Blank('1', '共享给所有组织', this.Desc1);
    // this.SingleTB('2', '共享给指定的组织', 'Orgs', '请输入组织编号', '多个组织用逗号分开');

    this.SelectItemsByList('2', '共享给指定的组织', this.Desc2, true, GloWF.srcOrgs, 'Orgs', 'OrgsT');
    //this.AddEntity('2', '共享给指定的组织', new SelfFormEn(), this.SDKForm);
  }
  public async AfterSave(_pageID: string, _pageVal: any) {
    //表单ID
    const frmID: any = this.params.FrmID;

    if (_pageID == '2') {
      let orgs: string = this.entity?.Orgs;
      if (orgs === '' || orgs == null) {
        const en = new MapFrmFool(frmID);
        await en.Retrieve();
        orgs = en.OrgNos;
      }

      const strs = orgs.split(',');

      for (let index = 0; index < strs.length; index++) {
        // 插入到关系表.
        const frmOrg = new FrmOrg();
        frmOrg.FrmID = frmID;
        frmOrg.OrgNo = strs[index];
        frmOrg.MyPK = frmOrg.OrgNo + '_' + frmOrg.FrmID;
        await frmOrg.Delete();
        await frmOrg.Insert();
      }

      return;
    } else {
      //清除关系表.
      const ens = new FrmOrgs();
      ens.Delete('FrmID', frmID);

      return;
    }
  }
  public BtnClick(_pageID: string, _pageVal: any, _btnName: string) {
    // if (_pageID == '2') {
    //   const url = GloComm.UrlEn('TS.AttrNode.Sln5', this.PKVal);
    //   // alert(url);
    //   return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url, '设置');
    // }
    // throw new Error('方法暂未实现');
  }

  public readonly Desc0 = `
  #### 说明
   - 不共享
  `;

  public readonly Desc1 = `
  #### 帮助
   - 所有的组织都可以使用.
  `;

  //引用指定节点的表单.
  public readonly Desc2 = `
  #### 帮助
   - 支持编写js,Html模式，使用富文本编辑器开发.
  #### 样式
  ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/kaifaze.png "屏幕截图.png")
  `;
}
