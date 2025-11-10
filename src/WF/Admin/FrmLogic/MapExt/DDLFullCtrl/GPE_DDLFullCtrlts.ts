import { MapExt, MapExtAttr } from '../../MapExt';
import { GloComm } from '/@/WF/Comm/GloComm';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GPE_DDLFullCtrlts extends PageBaseGroupEdit {
  constructor() {
    super('GPE_DDLFullCtrlts');
    this.PageTitle = '下拉框填充';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //要编辑的字段.
    // this.Btns = '设置参数@2';
    this.Btns = [{ pageNo: '1', list: ['填充'] }];

    //给他初始化数据.
    this.entity = await this.entity.InitDataForMapAttr('DDLFullCtrl', this.GetRequestVal('PKVal'));

    //增加子页面.
    this.AddGroup('A', '下拉框填充'); //增加分组.
    this.Blank('0', '不填充', this.Desc0);
    this.Blank('1', '启用填充', this.Desc0);

    // this.AddEntity('1', '自定义设置', new GPEDDLFullCtrl(), this.Desc1);
    // this.AddEntity('2', '绑定查询', new GPEDDLFullCtrlBySFSearch(), this.Desc2);
    // this.Btns = '落值填充';
  }
  public async BtnClick(pageID: string, pageVal: any, btnName: string) {
    console.log({ btnName });

    if (btnName === '落值填充' || btnName === '填充') {
      const url = GloComm.UrlEn('TS.MapExt.FullData', this.entity?.MyPK);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) {
      //const idx = 1;
    }
  }

  public readonly Desc0 = ` 
  #### 帮助
  - 不填充：对控件没有填充要求。
  - 启用填充控件: 当选项发生变化后，同表单的其它控件的数据需要变化，我们把这样的行为称为其他控件填充。
  - 比如：下拉框的人员变化后，其它的字段就跟着变化。
  - 如下图，当人员选择变化时，Email自动变化。
  #### 效果图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/DDLFullCtrl/Img/DDLFullCtrl.png "屏幕截图.png") 
   `;
  public readonly Desc1 = ` 
  #### 帮助
  - 定义: 当选项发生变化后，同表单的其它控件的数据需要变化，我们把这样的行为称为其他控件填充。
  - 应用场景
  - 在做一个选择操作员的时候，需要把操作员的电话，邮件填充到主表其他字段里面，需要把操作员的角色显示到下拉框里面。
  - 人员是一个下拉框，人员变动的时候，其他的控件也在跟着变动。
  - 填写数据源。
  #### 配置图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/DDLFullCtrl/Img/DDLFullCtrlSetting.png "屏幕截图.png") 
  #### 运行图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/DDLFullCtrl/Img/DDLFullCtrl.png "屏幕截图.png") 
  设置下拉框在值变化后，填充其他控件与从表 `;
}
