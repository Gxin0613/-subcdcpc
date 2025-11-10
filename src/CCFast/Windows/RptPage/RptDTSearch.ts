import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
/// 报表页面
export class RptDTSearch extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.CCFast.Windows.RptDTSearch');
    if (!!pkVal) {
      this.No = pkVal;
    }
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('GPM_RptPage', '日期/关键字查询');

    // #region 基本信息.
    map.AddTBStringPK('No', null, '编号', true, true, 1, 40, 200);
    map.AddTBString('Name', null, '报表名称', true, false, 0, 300, 20, true);
    const help = `
      ### 帮助说明
      #### 内置查询条件（日期类型）
      - **单个参数**：
        - 单个年度、单个年月、单个日期  
        - 参数名：\`RQ\`

      - **多个参数（范围查询）**：
        - 年度从到、年月从到、日期从到  
        - 参数名：\`RQFrom\`（起始）、\`RQTo\`（结束）

      ### 应用表达式示例
      - \`RQ\`、\`RQFrom\`、\`RQTo\` 为系统参数，可在表达式中直接使用（类似 \`@WebUser.No\` 等全局变量）。

      1. **单个参数示例**  
        \`\`\`sql
        SELECT e.No, e.Name AS 人员名称, COUNT( o.WorkID ) AS 数量 FROM wf_generworkerlist o JOIN port_emp e ON o.fk_emp = e.No  WHERE o.RDT >= '@RQ' GROUP BY e.No ORDER BY e.No
        \`\`\`
        - 替换规则：  
          单个年度 → \`@RQ\` >= 2025  
          单个年月 → \`@RQ\` >= 2025-08  
          单个日期 → \`@RQ\` >= 2025-08-01

      2. **范围参数示例**  
        
        \`\`\`sql
        SELECT e.No, e.Name AS 人员名称, COUNT( o.WorkID ) AS 数量 FROM wf_generworkerlist o JOIN port_emp e ON o.fk_emp = e.No  WHERE o.RDT >= '@RQFrom' AND o.RDT <= '@RQTo' GROUP BY e.No ORDER BY e.No
        \`\`\`
        - 替换规则：  
          年度从到 → \`@RQFrom\`=2021，\`@RQTo\`=2026  
          年月从到 → \`@RQFrom\`=2021-01，\`@RQTo\`=2026-09  
          日期从到 → \`@RQFrom\`=2021-01-01，\`@RQTo\`=2026-09-09
    `;

    map.AddTBString('DTLab', null, '查询标签', true, false, 0, 100, 20);
    map.AddDDLStringEnum('Search', 'None', '日期查询条件', '@None=不显示@ND=单个年度@NY=单个年月@RQ=单个日期@NDFromTo=年度从到@NYFromTo=年月从到@RQFromTo=日期从到', true);
    map.SetHelperAlert('Search', help);
    map.AddDDLStringEnum('KeySearch', 'None', '关键字查询条件', '@None=不显示@Like=关键字查询@KeyWords=指定字段查询', true);
    map.AddTBString('KeyWords',null,'指定文本字段查询',true,false,30,200,30,true,'@ZiDuan1=字段1@ZiDuan2=字段2');
    this._enMap = map;
    return this._enMap;
  }

  override async beforeInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
  protected override beforeUpdateInsertAction(): Promise<boolean> {
    if (this.DTLab == '' || this.DTLab == null) {
      if (this.Search == 'None') this.DTLab = '';
      if (this.Search == 'NY') this.DTLab = '按年月查询';
      if (this.Search == 'ND') this.DTLab = '按年度查询';
      if (this.Search == 'RQ') this.DTLab = '按日期查询';
      if (this.Search == 'NDFromTo') this.DTLab = '按年度查询';
      if (this.Search == 'NYFromTo') this.DTLab = '按年月查询';
      if (this.Search == 'RQFromTo') this.DTLab = '按日期查询';
    }

    return Promise.resolve(true);
  }
}
