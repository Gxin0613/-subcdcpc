import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { aoaToSheetXlsx } from '/@/components/Excel';
import { MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
import { message } from 'ant-design-vue';
import { ClassFactory } from '/@/bp/da/ClassFactory';

export class GPN_EntityExportExcel extends PageBaseGroupNew {
  constructor() {
    super('GPN_EntityExportExcel'); //实体的类名，以GPE_开头.
    this.PageTitle = '导出'; //实体名称.
  }
  public async Init() {
    //增加子页面分组.
    this.AddGroup('A', '导出');
    this.AddBlank('1', '全部导出', '');
    this.SelectItemsByList('2', '指定列导出', '', true, await this.GenerAttrs());
  }
  public async GenerAttrs() {
    const ensName = this.RequestVal('TSEnName');
    const en = await ClassFactory.GetEn(ensName);
    const attrs = en._enMap.attrs
      .filter((attr) => attr.UIVisible == true)
      .map((attr) => {
        return {
          Name: attr.Desc,
          No: attr.Key,
        };
      });
    //如何获取该实体的EnMap的 KeyOfEn, Name 两个属性生成json.返回过去.
    return JSON.stringify(attrs);
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
    const ensName = this.RequestVal('TSEnName');
    const en = await ClassFactory.GetEn(ensName);
    const RefPK = this.RequestVal('RefPK');
    const RefPKVal = this.RequestVal('RefPKVal');
    const attrs = await this.GenerAttrs();
    const mapAttrs = JSON.parse(attrs);
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
    handler.AddPara('EnsName', ensName); //从表的ID.
    handler.AddPara(RefPK, RefPKVal); //WorkID.
    const result = await handler.DoMethodReturnString('Search_Exp');
    if (pageID == '1') {
      const header = mapAttrs.map((attr) => attr.Name);
      const data = JSON.parse(JSON.stringify(result)).map((item) => {
        return mapAttrs.map((attr) => {
          return item[attr.No + 'Text'] || item[attr.No + 'T'] || item[attr.No];
        });
      });
      aoaToSheetXlsx({ data, header, filename: en._enMap.EnDesc + '.xlsx' });
      return; // new GPNReturnObj(GPNReturnType.Close);
    }
    if (pageID == '2') {
      if (!_tb1) {
        message.error('请选择需要导出的字段列');
        return; // new GPNReturnObj(GPNReturnType.Close);
      }
      const selectNos = _tb1 + ',';
      const curMapAttrs = mapAttrs.filter((mapAttr) => selectNos.includes(mapAttr.No + ','));
      const header = curMapAttrs.map((attr) => attr.Name);
      const data = JSON.parse(JSON.stringify(result)).map((item) => {
        return curMapAttrs.map((attr) => {
          return item[attr.No + 'Text'] || item[attr.No + 'T'] || item[attr.No];
        });
      });
      aoaToSheetXlsx({ data, header, filename: en._enMap.EnDesc + '.xlsx' });
      return; //new GPNReturnObj(GPNReturnType.Close);
    }
  }

  public readonly Desc0 = `  
#### 帮助  
  

`;
}
