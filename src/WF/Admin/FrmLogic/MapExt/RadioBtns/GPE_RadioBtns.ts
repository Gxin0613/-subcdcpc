import { MapExt, MapExtAttr, MapExts } from '/@/WF/Admin/FrmLogic/MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { MapAttr, MapAttrs } from '../../MapAttrs/MapAttr';
import useComponentLoader from '/@/hooks/ens/useComponentLoader';

export class GPE_RadioBtns extends PageBaseGroupEdit {
  constructor() {
    super('GPE_RadioBtns');
    this.PageTitle = '选项联动控件';
  }
  async Init() {
    const { loadComponent } = useComponentLoader();
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //要编辑的字段.

    //初始化一笔数据.
    await this.entity.InitDataForMapAttr('RBAction', this.GetRequestVal('PKVal'));

    //增加子页面.
    this.AddGroup('A', '选项联动控件'); //增加分组.
    this.Blank('0', '不启用', this.Desc0);
    this.SelfComponent(
      '1',
      '启用设置',
      loadComponent('/@/WF/Admin/FrmLogic/Views/RadioBtns.vue'),
      {
        EnClassID: this.EnClassID,
        PKVal: this.PKVal,
        enable: false, //不显示最上边的启用按钮
      },
      this.helpDocs,
    );

    // this.SelfComponent('1', '启动设置', null);
    // this.AddEntity('1', '启用设置', new GPERadioBtns(), this.Desc1);
  }
  public async BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == '0') return;
    if (pageVal == '0') return;
    if (btnName == '0') return;

    //查询到attr
    const mapAttr = new MapAttr(this.PKVal);
    await mapAttr.Retrieve();

    //查询表单下所有的字段.
    const attrs = new MapAttrs();
    attrs.Retrieve('FK_MapData', mapAttr.FK_MapData);

    //查询已经配置的的字段.
    const mapExts = new MapExts();
    mapExts.Retrieve(MapExtAttr.FK_MapData, mapAttr.FK_MapData, MapExtAttr.ExtModel, 'RBAction', MapExtAttr.ExtType, 'RBActionAttr');

    //查询出来枚举值.
    //SysEnums ses=new
  }

  public async AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) {
      //const idx = 1;
    }
  }

  public readonly Desc0 = `
  #### 帮助
   - 不启用：不对其它控件进行控制。
   - 选项联动控件，就是选择一个Item,对其他控件实现隐藏，显示，设置特定的值的功能。
   - 比如: 请假表单的请假类型，选择病假，让其上传病例，填写所在医院，请事假就不需要显示附件上传与所在医院控件。
  #### 选择病假-效果图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/RadioBtns/Img/RadioBtns.png "屏幕截图.png") 
  #### 选择事假-效果图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/RadioBtns/Img/RadioBtns1.png "屏幕截图.png") 
  `;
  public readonly Desc1 = `

  #### 帮助
  - 就是选择一个Item,对其他控件实现隐藏，显示，设置特定的值的功能。
  - 点击设置进入详细设置.
  - 配置图例1
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/RadioBtns/Img/RadioBtnsSetting.png "屏幕截图.png") 
  - 配置图例2
   ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/RadioBtns/Img/RadioBtnsSetting1.png "屏幕截图.png") 
  - 运行图例
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/RadioBtns/Img/RadioBtns.png "屏幕截图.png") 
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/RadioBtns/Img/RadioBtns1.png "屏幕截图.png") 

  `;
  public readonly helpDocs = ``;
}
