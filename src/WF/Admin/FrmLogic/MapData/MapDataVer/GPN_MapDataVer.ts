import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import BSEntity from '/@/utils/gener/BSEntity';

export class GPN_MapDataVer extends PageBaseGroupNew {
  constructor() {
    super('GPN_MapDataVer');
    this.PageTitle = '新建表单版本';
    this.ForEntityClassID = 'TS.FrmUI.MapDataVer';
  }
  public Init() {
    this.AddGroup('A', '新建表单版本'); //增加分组.
    // this.AddBlank('0', '新建表单版本', this.Docs0);
    //  this.TextBox1_Name('0', '新建表单版本', this.Docs0, '输入备注', '', '请输入要创建版本的备注.');
    this.AddBlank('0', '新建表单版本', this.Docs0);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
    // const ens = new FrmSorts();
    // await ens.Init();
    // await ens.RetrieveAll();
    // return ens;
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    if (window.confirm('您确定要创建新版本吗？') == false) return;
    const frmID = this.RequestVal('RefPKVal');
    const en = new BSEntity('BP.Sys.MapData', frmID);
    await en.Init();
    const data = await en.DoMethodReturnString('CreateMapDataVer');
    return new GPNReturnObj(GPNReturnType.Message, data);
  }
  // 按表单字段计算
  public readonly Docs0 = `
  #### 帮助
  - 表单版本.
  - 记录表单目前的版本号。包括创建人，创新时间等信息。
  - 当表单增加了字段后，可以创建新的版本，而再运行此表单时，所运行的版本号就为新的版本号。
  - 在一个时间内只有一个运行的版本，所运行的版本不一定是最新的版本。
  
  #### 应用场景
  - 比如出库流程，当运行一段时间后，需要增加出库商品批号。当在表单中增加这个字段后，就可以在表单属性中增加一个新的版本号。
  - 那么再进行出库操作时，就运行新版本的表单。

  #### 数据结构

  - 新增数据版本后，数据信息存入到AtPara字段里.

`;
}
