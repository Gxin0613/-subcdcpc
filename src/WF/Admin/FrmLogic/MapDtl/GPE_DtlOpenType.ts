import { GloWF } from '../../GloWF';
import { MapDtl } from '../MapDtl';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_DtlOpenType extends PageBaseGroupEdit {
  constructor() {
    super('GPE_DtlOpenType');
    this.PageTitle = '数据开放规则';
  }
  Init() {
    this.entity = new MapDtl(); //对应的类.
    this.KeyOfEn = 'DtlOpenType'; //要修改的字段.

    //增加子页面.
    this.AddGroup('A', '数据开放规则'); //增加分组.
    this.Blank('0', '操作员可以查看自己的数据', this.Desc0);
    // this.SingleTB('1', '按照WorkID-计算. ','DtlOpenField', '请输入' this.Desc1);
    this.Blank('1', '按照WorkID-计算', this.Desc1);
    this.Blank('2', '按照：FID-干流程ID 计算.', this.Desc2);
    this.Blank('3', 'PWorkID-父流程', this.Desc3);
    //const sql = `SELECT KeyOfEn AS No,Name From Sys_MapAttr WHERE FK_MapData='${this.RefPKVal}' `;
    this.SelectItemsByList('4', 'WorkID+指定人员账号字段.', this.Desc4, false, GloWF.SQLOfDtlOpenPara(this.RefPKVal), 'DtlOpenPara');
     this.SelectItemsByList('7', 'FID+指定人员账号字段.', this.Desc4, false, GloWF.SQLOfDtlOpenPara(this.RefPKVal), 'DtlOpenPara');
    //const sql1 = `SELECT KeyOfEn AS No,Name From Sys_MapAttr WHERE FK_MapData='${this.RefPKVal}' `;
    this.SelectItemsByList('5', '按照WorkID-计算并指定查询的字段', this.Desc5, true, GloWF.SQLOfDtlOpenPara(this.RefPKVal), 'DtlOpenPara');
    this.Blank('6', 'PFID-父流程的干流程(子线程发起的子流程)', this.Desc6);
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }
    // throw new Error('Method not implemented.');
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) {
      //const idx = 1;
    }
  }

  public readonly Desc0 = `
  #### Help
- 只能查看自己的数据。
  `;
  public readonly Desc1 = `
  #### Help
-   场景1: 在线性流程节点中， 第1个节点的数据，能被其他节点所能看到，但是要保障存储表表名一致。
  `;

  public readonly Desc2 = `
   #### 帮助
- 场景：在同一个流程中，子线程节点可以看到分流节点的数据.  比如：分流节点有一个从表，
     子线程要看到分流节点的从表数据， 如果子线程需要新增数据，新增的数据也会汇总到干流程上去.
   `;

  public readonly Desc3 = `
  #### 帮助
- 场景1：子流程的发起是从非子线程(干流程节点)上发起的，子流程需要看到父流程的从表数据，比如：父流程上干流程节点有一个从表，子流程需要看到， 就配置这种模式.
- 场景2：子流程的发起是从子线程上发起的，子流程看到的，父流程的子线程上填写的数据。
      `;
  public readonly Desc4 = `
  #### 帮助
  - 场景1：对于工单类的流程，一批任务分配给不同的人员，下一个节点每个维修人员都只能看到自己的任务数据。DtlOpenPara 是从表的字段。
  `;
  public readonly Desc5 = `
  #### Help
  - 查询格式  @DtlOpenField = @WorkID.
  -   @DtlOpenField 默认为 RefPK , 通常情况下  RefPK=@WorkID.
  - 场景1：在父子流程中，父流程如果是分合流，子线程上启动的子流程填写的从表， 父流程的干流程节点需要看到子流程的从表数据。 就需要配置 @PFID = @WorkID.  既: 要查询的字段设置为PFID.  在从表里，需要手工的增加PFID的隐藏字段，请参考实例流程。 079，080
     `;
  public readonly Desc6 = `
  #### 帮助
- 场景1：子线程上发起的子流程上，需要查看父流程的干流程的数据，就配置这种模式.
   `;
}
