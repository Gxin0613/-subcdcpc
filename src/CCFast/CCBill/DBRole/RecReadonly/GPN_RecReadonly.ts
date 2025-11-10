import { RecReadonly } from './RecReadonly';
import { RecReadonlyFieldString } from './RecReadonlyFieldString';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { MapAttr } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
import { GloWF } from '/@/WF/Admin/GloWF';
import { GloComm } from '/@/WF/Comm/GloComm';

export class GPN_RecReadonly extends PageBaseGroupNew {
  constructor() {
    super('GPN_RecReadonly');
    this.ForEntityClassID = 'TS.CCBill.RecReadonly';
    this.PageTitle = '单记录只读规则';
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }
  public async Init() {
    this.AddGroup('A', '单记录只读规则'); //增加分组.
    // this.AddBlank('None', '不控制(默认)', this.None);
    // this.AddBlank('BySQL', '按照SQL计算', this.None);
    this.TextSQL('BySQL', '按照SQL计算', this.None, '请输入查询SQL语句', '', '请阅读帮助,注意格式.');

    //按照字段计算.
    const sql = GloWF.SQLOfGpnRecReadonly(this.RefPKVal); //`SELECT MyPK as No, Name FROM Sys_MapAttr WHERE FK_MapData='${this.RefPKVal}'  AND KeyOfEn NOT IN ('OID','FID','AtPara') `;
    this.SelectItemsByList('ByField', '选择字段', this.HelpUn, false, sql);

    //this.AddBlank('ByField', '按照字段值计算', this.None);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    const frmID = this.RequestVal('RefPKVal');
    //执行创建.
    const en = new RecReadonly();
    en.MyPK = frmID + '_' + pageNo + '_RecReadonly';
    if ((await en.RetrieveFromDBSources()) == 1) {
      alert('该选项已经存在,请点击修改.');
      return;
    }
    en.FrmID = frmID;
    en.MarkID = pageNo;
    en.DBRole = 'RecReadonly'; //设置标记.
    en.MarkName = this.GetPageName(pageNo);
    en.Docs = '无';

    //设置编辑模式.
    let enName = 'TS.CCBill.RecReadonly';
    if (pageNo == 'BySQL') enName = 'TS.CCBill.RecReadonlySQL';
    if (pageNo == 'ByField') enName = 'TS.CCBill.RecReadonlyField';
    en.SetPara('EnName', enName);
    await en.Insert();

    if (pageNo === 'BySQL') {
      en.Doc = tb1;
      await en.Update();
      const url = GloComm.UrlEn(enName, en.MyPK);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //按照表单的字段值计算.
    if (pageNo === 'ByField') {
      const myen = new RecReadonlyFieldString();
      myen.MyPK = en.MyPK;
      await myen.RetrieveFromDBSources();

      const mapAttr = new MapAttr(tb1);
      mapAttr.MyPK = tb1;
      await mapAttr.Retrieve();

      //根据不同的字段类型,让其使用不同的类进行编辑.
      let enName = 'TS.CCBill.RecReadonlyFieldString';
      if (mapAttr.LGType === 1) {
        enName = 'TS.CCBill.RecReadonlyFieldEnum';
        myen.UIBindKey = mapAttr.UIBindKey; //设置枚举或者外键key.
      }
      if (mapAttr.LGType >= 2) enName = 'TS.CCBill.RecReadonlyFieldString';
      if (mapAttr.LGType === 0) {
        if (mapAttr.IsNum) enName = 'TS.CCBill.RecReadonlyFieldNum';
      }

      myen.AttrID = tb1; //字段  ND1Rpt_QJLX
      myen.AttrKey = mapAttr.KeyOfEn; //字段 QJLX
      myen.AttrName = tb2; //字段名称. 请假类型.

      myen.OperatorMark = '='; //操作符.
      myen.OperatorT = '等于'; //操作符.

      myen.OperatorValue = '0'; //操作值.
      myen.OperatorValueT = '未设置'; //操作值.

      myen.Idx = 100;
      myen.SetPara('EnName', enName); //编辑类.
      await myen.Update();

      const url = GloComm.UrlEn(enName, en.MyPK); // '/@/WF/Comm/En.vue?EnName=' + enName + '&PKVal=' + en.MyPK;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    alert('没有判断的PageID:' + pageNo);

    return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlEn(enName, en.MyPK));
  }
  public readonly None = `
  #### 帮助
  - 控制的内容为,如何让表单只读.
  #### 控制解析规则.
  1. 按照SQL计算: 设置的SQL返回值执行后大于 0 成立, 否则不成立.
  1. 按照字段值: 设置的字段值，否则不成立.
`;
}
