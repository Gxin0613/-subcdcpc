import { message } from 'ant-design-vue';
import { MapAttr } from '../../MapAttrs/MapAttr';
import { MapExt, MapExts } from '../../MapExt';
import { SysEnums } from '../../SysEnum/SysEnum';
import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloWF } from '../../../GloWF';

export class GPN_RBNewAttr extends PageBaseGroupNew {
  constructor() {
    super('GPN_RBNewAttr');
    this.ForEntityClassID = 'TS.MapExt.RBAttr';
    this.PageTitle = '新增影响的元素';
  }
  public async Init() {
    //增加子页面.
    this.AddGroup('A', '影响的字段');

    const mapAttr = new MapAttr();
    mapAttr.setPKVal(this.RefPKVal);
    await mapAttr.Retrieve();
    const frmID = mapAttr.FK_MapData;

    //this.AddBlank('RegularExpressionLab', '绑定正则表达式库', this.RegularExpressionLab);
    //const group = `SELECT OID AS No,Lab as Name FROM Sys_GroupField WHERE (CtrlType='' OR CtrlType IS NULL) AND FrmID='${frmID}' ORDER BY Idx`;
    // const list = `SELECT KeyOfEn AS No, Name, GroupID as GroupNo FROM Sys_MapAttr
    //  WHERE FK_MapData='${frmID}' AND UIVisible=1
    //   ORDER BY Idx`;
    // //按角色计算.
    // const srcOfGroup = 'SELECT No,Name FROM Port_StationType';
    // const srcOfGroupEns = 'SELECT No,Name,FK_StationType as GroupNo FROM Port_Station ';
    this.SelectItemsByGroupList('Attr', '选择影响的字段', '', true, GloWF.SQLOfRBNewGroup(frmID), GloWF.SQLOfFrmSummaryFields(frmID));
    //this.SelectItemsByList('Attr', '选择影响的字段', this.DescAttrs, false, list);
    //const dtlSQL = `SELECT No,Name FROM Sys_MapDtl WHERE FK_MapData='${frmID}'`;
    this.SelectItemsByList('Dtl', '影响的从表', this.DescDtl, true, GloWF.SQLOfDtls(frmID));
    //const athSQL = `SELECT NoOfObj AS No,Name FROM Sys_Frmattachment WHERE FK_MapData='${frmID}'`;
    this.SelectItemsByList('Ath', '影响的附件', this.DescAth, true, GloWF.SQLOfFullAth(frmID));
  }

  public async GenerSorts(): Promise<any[]> {
    return null;
    // return Promise.resolve([
    //   {
    //     No: 'blur',
    //     Name: 'blur失去焦点',
    //   },
    //   {
    //     No: 'change',
    //     Name: 'change内容变化',
    //   },
    // ]);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    const refPKVal = this.RequestVal('RefPKVal');
    //获得 mapAttr.
    const mapAttr = new MapAttr(refPKVal);
    await mapAttr.Retrieve();

    //查询枚举值.
    const sysEnums = new SysEnums();
    await sysEnums.Retrieve('EnumKey', mapAttr.UIBindKey);

    const mapExts = new MapExts();
    await mapExts.Retrieve('RefPKVal', refPKVal, 'ExtType', pageNo);

    //选择的元素.
    const strs = tb1.split(',');
    const names = tb2.split(',');
    console.log(strs);

    for (let idx2 = 0; idx2 < sysEnums.length; idx2++) {
      const sysEnum = sysEnums[idx2];

      //循环选择的值string.
      for (let index = 0; index < strs.length; index++) {
        const attrKey = strs[index];
        const mapExt = new MapExt();
        mapExt.MyPK = attrKey + '_RBAction_' + sysEnum.IntKey;
        mapExt.setPKVal(attrKey + '_RBAction_' + sysEnum.IntKey);
        const isHave = mapExts.filter((item) => item.AttrOfOper === attrKey).length > 0 ? true : false;
        if (isHave == true) continue;
        mapExt.FK_MapData = mapAttr.FK_MapData;
        mapExt.ExtModel = 'RBAction';
        mapExt.ExtType = pageNo; //Attr
        mapExt.RefPKVal = refPKVal;
        mapExt.AttrOfOper = attrKey; //字段。
        mapExt.Tag = names[index]; //字段名
        mapExt.Tag1 = sysEnum.IntKey; //枚举值
        mapExt.Tag2 = sysEnum.Lab; //枚举值名
        mapExt.Tag3 = '0'; // 存储状态.
        await mapExt.Insert();
      }
    }
    message.info('设置成功,请关闭或者设置其他元素,进行编辑.');
    return;
    //alert('没有判断的pageNo=' + pageNo);
  }

  public readonly DescAttrs = `
  #### 帮助
  - 什么是正则表达式，请baidu，这个名词。
  - 系统已经帮您准备一个常用正则表达式.
  - 请选择正确的事件，然后根据事件选择表达式.
  - 比如: 校验文本框是否是电话号码，应该在失去焦点，而不能在双击事件.
  #### 图例
  - 电话号码校验
  
`;
  public readonly DescDtl = `
  #### 帮助
  - 自定义正则表达式, 请在文本框输入正则表达式，然后执行创建。
  - 请正确的选择事件然.
`;

  public readonly DescAth = `
  #### 帮助
  - 自定义函数，就是在服务器上创建一个js文件，写入一个函数.
`;
}
