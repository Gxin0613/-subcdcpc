import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';
import { GloWF } from '/@/WF/Admin/GloWF';

// 成员
export class Member extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.Demo.Member');
    if (!!pkval) this.setPKVal(pkval);
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Demo_Member', '成员');
    map.AddMyPK();
    map.AddTBString('StudentNo', null, '学生编号', false, false, 0, 200, 10);
    map.AddTBString('XM', null, '姓名', true, false, 0, 100, 50);
    map.AddTBString('CW', null, '称谓', true, false, 0, 150, 60);

    map.AddTBString('TBBanJi', null, '输入班级', true, false, 0, 200, 100);
    map.AddTBString('TBBZR', null, '班主任名称', true, false, 0, 200, 50);
    map.AddTBString('TBTel', null, '班主任电话', true, false, 0, 200, 50);
    map.enMapExts.SetTextBoxFull('TBBanJi', 'DemoStudent_Student_BanJiFind');
    //数据填充. 返回一行多列, 必须有@Key关键字.
    const exp = 'DemoStudent_Student_FullTBBanJi';
    map.enMapExts.SetAutoFillCtrls('TBBanJi', exp);

    map.AddTBString('PopBanJi', null, '选择班级', true, false, 0, 100, 80);
    map.AddTBString('PopBZR', null, '班主任名称', true, false, 0, 100, 50);
    map.AddTBString('PopTel', null, '班主任电话', true, false, 0, 100, 50);

    map.AddAthSingle('Profile', '证明材料', true, false, '*.*');
    map.AddAthMulti('FamilyProfile', '家庭成员信息', true, false, '*.*');

    //选择班级.
    map.AddTBString('PopBanJi', null, '表格弹窗(选班级)', true, false, 0, 200, 200);
    map.SetPopTable('PopBanJi', 'DemoStudent_Student_BanJiList', false, '800px', '500px', '选择班级', 'icon-people', '1', '电话,班主任');

    //选择班级.
    map.enMapExts.SetAutoFillCtrls('PopBanJi', 'DemoStudent_Student_PopBanJiFull'); //填充.

    map.AddTBString('Dept', null, '部门', true, false, 0, 200, 150);
    map.SetPopTree('Dept', GloWF.srcDeptLazily, '0', true, '600px', '800px', '选择部门', 'icon-people', false, true);
    map.AddRadioBtn('XB', 0, '性别', true, true, 'XB', '@0=女@1=男@2=未知', '单选按钮', false);
    map.AddDDLSysEnum('ZZMM', 0, '政治面貌', true, true, 'ZZMM', '@0=少先队员@1=团员@2=党员@3=无党派人士@4=群众@5=WEIZHI');
    map.AddTBString('Linker', null, '联系方式', true, false, 0, 100, 100);
    map.AddTBString('BeiZhu', null, '备注', true, false, 0, 60, 100);

    map.AddMapLoader(() => {
      const atrs = map.attrs;
      //主键存在代表编辑操作//不存在代表新增操作
      if (!!this.MyPK) {
        atrs.forEach((en) => {
          //字段名字设置为只读模式不能编辑
          if (en.Key == 'XM') {
            en.UIIsReadonly = true;
          }
        });
      }
    });

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
  override async beforeUpdateInsertAction(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

/**
 * 成员s
 */
export class Members extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new Member();
  }
  constructor() {
    super();
  }
}
