import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { aoaToSheetXlsx } from '/@/components/Excel';
import { message } from 'ant-design-vue';
import { GloWF } from '/@/WF/Admin/GloWF';
import { FrmDict } from '/@/CCFast/CCBill/FrmDict';
import { MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';

export class GPN_BillExportExcel extends PageBaseGroupNew {
  constructor() {
    super('GPN_BillExportExcel'); //实体的类名，以GPE_开头.
    this.PageTitle = '导出'; //实体名称.
  }
  public async Init() {
    //增加子页面分组.
    this.AddGroup('A', '导出');
    this.AddBlank('1', '全部导出', '');
    const sqlGroup = GloWF.sqlGroupField(this.params.FrmID);
    const sqlFields = GloWF.sqlFields(this.params.FrmID);
    this.SelectItemsByGroupList('2', '指定列导出', '', true, sqlGroup, sqlFields);
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
    const frmID = this.params.FrmID;
    const frmDict = new FrmDict();
    frmDict.setPKVal(frmID);
    await frmDict.Retrieve();
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('FrmID', frmID);
    if (pageID == '1') {
      const res = await handler.DoMethodReturnJson('Search_MapAttr');
      const header = res.Attrs.map((attr) => attr.Name);
      const impData = await handler.DoMethodReturnJson<Recordable>('Search_ExpExt');
      const data = impData.map((item) => {
        return res.Attrs.map((attr) => {
          return item[attr.KeyOfEn + 'Text'] || item[attr.KeyOfEn + 'T'] || item[attr.KeyOfEn];
        });
      });
      aoaToSheetXlsx({ data, header, filename: frmDict.Name + '.xlsx' });
      return;
    }
    if (pageID == '2') {
      if (!_tb1) {
        message.error('请选择需要导出的字段列');
        return;
      }
      const mapAttrs = new MapAttrs();
      await mapAttrs.Retrieve('FK_MapData', frmID);
      const selectNos = _tb1 + ',';
      const curMapAttrs = mapAttrs.filter((mapAttr) => selectNos.includes(mapAttr.KeyOfEn + ','));
      const header = curMapAttrs.map((attr) => attr.Name);
      const impData = await handler.DoMethodReturnJson<Recordable>('Search_ExpExt');
      const data = impData.map((item) => {
        return curMapAttrs.map((attr) => {
          return item[attr.KeyOfEn + 'Text'] || item[attr.KeyOfEn + 'T'] || item[attr.KeyOfEn];
        });
      });
      aoaToSheetXlsx({ data, header, filename: frmDict.Name + '.xlsx' });
      return;
    }
  }

  public readonly Desc0 = `  
#### 帮助  
  

`;
}
