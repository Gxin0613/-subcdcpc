import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { aoaToSheetXlsx } from '/@/components/Excel';
import { MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
import { message } from 'ant-design-vue';
import { GloWF } from '../Admin/GloWF';

export class GPN_ExportExcel extends PageBaseGroupNew {
  constructor() {
    super('GPN_ExportExcel'); //实体的类名，以GPE_开头.
    this.PageTitle = '导出'; //实体名称.
  }
  public async Init() {
    const dtlID = this.params.dtlInfo.No; //从表编号
    //增加子页面分组.
    this.AddGroup('A', '导出');
    this.AddBlank('1', '全部导出', '');
    //const sql = `SELECT KeyOfEn AS No,Name From Sys_MapAttr WHERE FK_MapData='${dtlID}' AND UIVisible=1`;
    this.SelectItemsByList('2', '指定列导出', '', true, GloWF.SQLOfIsBatchUpdateAttrs(dtlID));
  }

  //获得类别,如果返回为空，就没有类别.
  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  //重写保存方法实现业务逻辑.
  /**
   * @author
   * 存在问题，两个类方法参数个数不同，设计的有问题
   * @last-modified 22/6/28 移除了未使用的pageName , 修改为sortNo
   * @param pageID 页面ID.
   * @param _sortNo 分类编号, 可以为空.
   * @param _tb1
   * @param _tb2
   * @param _tb3
   */
  public override async Save_TextBox_X(pageID: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
    //调用导入接口
    const dtlID = this.params.dtlInfo.No; //从表ID
    //流程 WorkID  //EntityNoName  No
    const workID = this.params.query.WorkID || this.params.query.No;
    const mapAttrs = new MapAttrs();
    await mapAttrs.Retrieve('FK_MapData', dtlID, 'UIVisible', 1, 'Idx');
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    handler.AddJson(this.params.query);
    handler.AddPara('EnsName', dtlID); //从表的ID.
    handler.AddPara('WorkID', workID); //WorkID.
    handler.AddPara('PageIdx', 0);
    const result = await handler.DoMethodReturnString('Dtl_DataOfPage');
    if (pageID == '1') {
      const header = mapAttrs.map((attr) => attr.Name);
      const data = JSON.parse(JSON.stringify(result)).map((item) => {
        return mapAttrs.map((attr) => {
          return item[attr.KeyOfEn + 'Text'] || item[attr.KeyOfEn + 'T'] || item[attr.KeyOfEn];
        });
      });
      aoaToSheetXlsx({ data, header, filename: this.params.dtlInfo.Name + '.xlsx' });
      return;
    }
    if (pageID == '2') {
      if (!_tb1) {
        message.error('请选择需要导出的字段列');
        return;
      }
      const selectNos = _tb1 + ',';
      const curMapAttrs = mapAttrs.filter((mapAttr) => selectNos.includes(mapAttr.KeyOfEn + ','));
      const header = curMapAttrs.map((attr) => attr.Name);
      const data = JSON.parse(JSON.stringify(result)).map((item) => {
        return curMapAttrs.map((attr) => {
          return item[attr.KeyOfEn + 'Text'] || item[attr.KeyOfEn + 'T'] || item[attr.KeyOfEn];
        });
      });
      aoaToSheetXlsx({ data, header, filename: this.params.dtlInfo.Name + '.xlsx' });
      return;
    }
  }

  public readonly Desc0 = `  
#### 帮助  
  

`;
}
