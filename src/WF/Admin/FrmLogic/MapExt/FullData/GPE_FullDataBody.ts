import { message } from 'ant-design-vue';
import { MapExt, MapExtAttr } from '../../MapExt';
import { SFSearch } from '../../SFSearch/SFSearch';
import { FullBodySFTable } from './FullBodySFTable';
import { FullBodySelf } from './FullBodySelf';
import { GloComm } from '/@/WF/Comm/GloComm';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GPE_FullDataBody extends PageBaseGroupEdit {
  constructor() {
    super('GPE_FullDataBody');
    this.PageTitle = '填充主表';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.Tag5; //要编辑的字段

    this.Btns = [
      {
        pageNo: 'SFTable',
        list: ['字段对应', '查询维护'],
      },
    ];
    //增加子页面.
    this.AddGroup('A', '填充主表'); //增加分组.
    this.Blank('None', '不填充', this.Desc0);
    this.AddEntity('Self', '自定义设置', new FullBodySelf(), this.Desc1);
    this.AddEntity('SFTable', '绑定查询', new FullBodySFTable(), this.Desc1);
  }
  public async BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (btnName === '设置参数' || btnName == '字段对应') {
      await this.entity?.Retrieve();
      const sfKey = this.entity?.Tag6;
      if (!sfKey) {
        message.error('当前字段不存在，请先保存再执行关联');
        return;
      }
      const search = new SFSearch(sfKey);
      await search.Retrieve(); //查询数据.
      const slnPK = this.entity?.MyPK;
      //增加或者修改方案.
      await search.AddSln(slnPK, this.entity?.FK_MapData);
      const url = GloComm.UrlDtlBatch('TS.FrmUI.SFColumnSln', '&RefPKVal=' + slnPK + '&FrmID=' + this.entity?.FK_MapData);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }

    if (btnName === '查询属性' || btnName === '查询维护') {
      const search = new SFSearch(this.entity?.Tag6);
      await search.Retrieve(); //查询数据.
      const url = GloComm.UrlEn('TS.FrmUI.SFSearch', this.entity?.Tag6);
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

  public readonly Desc2 = ` 
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
