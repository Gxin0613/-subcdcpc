import { MapExt, MapExtAttr } from '/@/WF/Admin/FrmLogic/MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { GPEAutoFullDLL } from './GPEAutoFullDLL';
import { SFTable } from '../../SFTable/SFTable';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GPEAutoFullDDLSFTable } from './GPEAutoFullDDLSFTable';

export class GPE_AutoFullDLL extends PageBaseGroupEdit {
  constructor() {
    super('GPE_AutoFullDLL');
    this.PageTitle = '设置显示过滤(废)';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //要编辑的字段.

    this.Btns = [{ pageNo: '2', list: ['字典维护'] }];

    //给他初始化数据.
    await this.entity.InitDataForMapAttr('AutoFullDLL', this.GetRequestVal('PKVal'));

    //增加子页面.
    this.AddGroup('A', '设置显示过滤'); //增加分组.
    this.Blank('0', '不启用', this.Desc0);
    this.AddEntity('1', '自定义设置', new GPEAutoFullDLL(), this.Desc1);
    this.AddEntity('2', '绑定字典表', new GPEAutoFullDDLSFTable(), this.Desc2);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public async BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (btnName == '字典属性') {
      const dictNo = this.entity?.Doc;
      if (!dictNo) {
        alert('请选择绑定的字典，然后执行保存按钮.');
        return;
      }
      const dict = new SFTable(dictNo);
      await dict.Retrieve();
      const enName = dict.GetParaString('EnName', '');
      const url = GloComm.UrlEn(enName, dict.No);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }

    if (btnName == '字典维护') {
      const url = GloComm.UrlSearch('TS.FrmUI.SFTable');
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }

    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly Desc1 = `
  #### 帮助
  - 该SQL必须返回No,Name 两个列。
  - 支持ccbpm表达式。
  - SELECT No,Name FROM Port_Emp WHERE FK_Dept='@WebUser.DeptNo'
  #### 应用场景
   - 选择一个会议主持人，从本部门中选择。
  #### 配置图
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/AutoFullDLL/Img/AutoFullDLLSetting.png "屏幕截图.png")
  #### 效果图
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/AutoFullDLL/Img/AutoFullDLL.png "屏幕截图.png")
  `;
  public readonly Desc0 = `
  #### 帮助
   - 不启用，不启用过滤功能。
   - 启用过滤功能，应用SQL语句等，得到系统返回值。对数据进行过滤处理。
   - 比如，选取主讲人，选取班主任。
   - 加载的时候填充的数据.
  
  #### 效果图
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/AutoFullDLL/Img/AutoFullDLL.png "屏幕截图.png") 
  
  `;
  public readonly Desc2 = `
  #### 帮助
   - 绑定字典表的显示过滤.
   - 您可以维护字典表.
  
  `;
}
