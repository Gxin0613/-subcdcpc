import { GloWF } from '../../../GloWF';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { MapDtl } from '/@/WF/Admin/FrmLogic/MapDtl';

export class GPE_DtlSearchKey extends PageBaseGroupEdit {
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) return null;
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }
  }
  constructor() {
    super('GPE_DtlSearchKey');
    this.PageTitle = '关键字查询';
  }

  Init() {
    this.entity = new MapDtl(); //对应的类.
    this.KeyOfEn = 'IsSearchKey'; //要编辑的字段.
    this.AddGroup('A', '关键字查询');
    this.Blank('1', '关键字查询', this.Desc0);
    // const sql = `SELECT KeyOfEn as No,Name FROM Sys_MapAttr WHERE FK_MapData='${this.PKVal}' AND UIVisible=1 AND MyDataType=1 AND UIContralType=0
    //   AND KeyOfEn NoT IN (SELECT B.KeyOfEn FROM Sys_MapAttr A, Sys_MapAttr B WHERE A.FK_MapData=B.FK_MapData AND A.FK_MapData = '${this.PKVal}' AND A.KeyOfEn = CONCAT(B.KeyOfEn, 'T'))
    //   UNION SELECT A.KeyOfEn as No, B.Name AS Name FROM Sys_MapAttr A, Sys_MapAttr B WHERE A.FK_MapData=B.FK_MapData AND A.FK_MapData = '${this.PKVal}' AND A.KeyOfEn = CONCAT(B.KeyOfEn , 'T')`;
    this.SelectItemsByList('2', '特定关键字查询', this.Desc1, true, GloWF.SQLOfGpeSearchKey(this.PKVal), 'StringSearchKeys', 'StringSearchKeysT');
  }

  public readonly Desc0 = `
  #### 帮助
  - 关键字查询是接受用户输入一个关键字，在整个报表的显示列中使用like查询(外键、枚举、数值类型的除外)
  - 关键字搜索提示, 默认为:请输入关键字...
  #### 效果图
  -  ![输入图片说明](./resource/CCBill/SearchCond/SearchKey.png "屏幕截图.png")  
 `;
  public readonly Desc1 = `
  #### 帮助
  - 选择特定字段，在报表中根据 like 模糊查询
  #### 配置图
  ![输入图片说明](./resource/CCBill/SearchCond/StringSearchKeysetting.png "屏幕截图.png")  
  #### 效果图
  ![输入图片说明](./resource/CCBill/SearchCond/StringSearchKey.png "屏幕截图.png")  
  `;
}
