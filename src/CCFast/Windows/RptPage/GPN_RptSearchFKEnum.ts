import { RptSearchFKEnum } from './RptSearchFKEnum';
import { MapAttr } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
import { SysEnumMain } from '/@/WF/Admin/FrmLogic/SysEnum/SysEnumMain';
import { GloWF } from '/@/WF/Admin/GloWF';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
export class GPN_RptSearchFKEnum extends PageBaseGroupNew {
  constructor() {
    super('GPN_RptSearchFKEnum');
    this.ForEntityClassID = 'TS.RptPage.RptSearchFKEnum';
    this.PageTitle = '新建查询条件';
  }

  public Init() {
    this.AddGroup('A', '新建查询条件'); //增加分组.
    this.SelectItemsByGroupList('1','选择外键枚举字段', this.Docs2,true,GloWF.SQLEnumSFTableGroup,GloWF.SQLEnumMainAndSFTable)
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    const frmID = this.RequestVal('RefPKVal');
    if(!!tb1){
      const nos = tb1.split(',');
      const names = tb2.split(',');
      let index = 0;
      for(const no of nos){
        if(!!no){
          const en = new RptSearchFKEnum();
          en.FrmID = frmID;
          en.KeyOfEn = no;
          en.Name = names[index];
          en.UIBindKey = no;
          //判断类型
          const enumMain = new SysEnumMain();
          enumMain.No = no;
          if(await enumMain.IsExits())
            en.IsEnum = 1;
          else
            en.IsEnum = 0;
          en.MyPK = en.FrmID + '_' + en.KeyOfEn;

          if ((await en.IsExits()) == true) {
            alert('该查询条件已经存在.');
          } else {
            await en.Insert();
          }
        }
        index++;
      }
    
    }
    //转入到url.
    //const url = '/@/WF/Comm/En.vue?EnName=TS.RptPage.RptSearchFKEnum&PKVal=' + en.MyPK;
    return new GPNReturnObj(GPNReturnType.CloseAndReload);
  }
  // 按表单字段计算
  public readonly Docs2 = `
  #### 帮助
  - 按照外键或枚举字段做为查询条件，一个表单里有枚举或者外键字段(能放入到下拉框的字段) 都可以作为查询条件.
  - 比如:按性别、政治面貌、班级来查询.
  - 在上面选择您要查询的字段，点击确定按钮. 每次只能创建一个，如果需要创建多个.
  #### 实现级联查询
  - 请编辑属性: 参考如何设置级联查询.
  #### 实现对查询范围进行控制.
  - 请编辑属性: 参考如何设置查询范围的权限控制.

  #### 配置图
  ![输入图片说明](./resource/CCBill/SearchCond/SearchFKEnumSetting.png "屏幕截图.png")  
  #### 效果图
  - 按照配置的字段显示的查询条件.
  ![输入图片说明](./resource/CCBill/SearchCond/SearchFKEnum.png "屏幕截图.png")  

`;
}
