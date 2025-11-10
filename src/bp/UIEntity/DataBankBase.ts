import HttpHandler from '/@/utils/gener/HttpHandler';
import { message } from 'ant-design-vue';

/** 持有方式 */
export enum KeepModel {
  //不持有.
  None,
  //永久持有.
  Forever,
  //按人员编号持有.
  ByEmpNo,
  // 按部门编号.
  ByDeptNo,
  // 按照组织编号.
  ByOrgNo,
}

/**
 * 数据盒子
 */
export class DataBox {
  constructor() {}
  public No = '';
  public Name = '';
  public Exp = '';
  public DBType = ''; //类型SFTable,Search,Proc,
  public KeepModel = KeepModel.None; //持有方式 0=不持有,1=永久持有,2=按人员编号持有,3=按组织编号持有,4=按部门编号持有.
  public obj = null; //返回的对象.
}

/**
 * 数据银行
 */
export class DataBankBase {
  public ClassID: string; //实体名称
  public DBNo: string; //数据源编号
  public DBName: string; //名称.
  public IsTesting = false; //是否测试状态..

  public DataBoxs: Array<DataBox> = [];
  // 静态注册表：存储子类名称与对应的构造函数
  static subclasses: Map<string, typeof DataBankBase> = new Map();
  constructor(enName: string, dbNo: string, dbName: string) {
    this.ClassID = enName; //实体名称.
    this.DBNo = dbNo;
    this.DBName = dbName;
  }
  static register(name: string, subclass: typeof DataBankBase) {
    if (this.subclasses.has(name) == false) {
      this.subclasses.set(name, subclass);
    }
  }

  //初始化数据.
  public Init() {}

  /**
   * 增加一个
   * @param no 标记
   * @param name 名称
   * @param exp 表达式,一般是sql语句.
   */
  public AddSFTable(no: string, name: string, exp: string) {
    const sqlBox = new DataBox();
    sqlBox.No = no;
    sqlBox.Name = name;
    sqlBox.DBType = 'SFTable';
    sqlBox.Exp = exp;
    this.DataBoxs.push(sqlBox); //增加到里面.
  }
  /**
   * 单个记录-查询.
   * @param no 编号
   * @param name 名称
   * @param exp 表达式
   */
  public AddSearch(no: string, name: string, exp: string) {
    const sqlBox = new DataBox();
    sqlBox.No = no;
    sqlBox.Name = name;
    sqlBox.DBType = 'Search';
    sqlBox.Exp = exp;
    this.DataBoxs.push(sqlBox); //增加到里面.
  }

  public AddProc(no: string, name: string, exp: string) {
    const sqlBox = new DataBox();
    sqlBox.No = no;
    sqlBox.Name = name;
    sqlBox.DBType = 'Proc';
    sqlBox.Exp = exp;
    this.DataBoxs.push(sqlBox); //增加到里面.
  }

  public Exp(expNo: string, paras = '') {
    const box = this.GetBox(expNo);
    if (box == null) {
      message.error('编号错误:' + expNo);
      return '';
    }
    return 'DBSrc.' + this.DBNo + '.' + box.DBType + '.' + this.ClassID + '_' + expNo + '.' + paras;
  }
  /**
   * 字典表达式
   * @param sfTableNo 编号
   * @param paras 参数
   * @returns string的标记.
   */
  public ExpSFTable(sfTableNo: string, paras = '') {
    return 'DBSrc.' + this.DBNo + '.SFTable.' + this.ClassID + '_' + sfTableNo + '.' + paras;
  }

  /**
   * 查询表达式
   * @param searchNo 查询编号
   * @param paras 参数
   * @returns string的标记
   */
  public ExpSearch(searchNo: string, paras = '') {
    return 'DBSrc.' + this.DBNo + '.Search.' + this.ClassID + '_' + searchNo + '.' + paras;
  }
  /**
   * 过程表达式
   * @param procNo 过程编号
   * @param paras 参数
   * @returns string的标记.
   */
  public ExpProc(procNo: string, paras = '') {
    return 'DBSrc.' + this.DBNo + '.Proc.' + this.ClassID + '_' + procNo + '.' + paras;
  }

  //把数据压入到后台.
  public async PushDataBoxsToBackground() {
    const handler = new HttpHandler('BP.CCFast.HttpHandlerDataBank');
    handler.AddPara('ClassID', this.ClassID);
    handler.AddPara('DBNo', this.DBNo);
    handler.AddPara('DBName', this.DBName);
    handler.AddPara('DataBoxs', encodeURIComponent(JSON.stringify(this.DataBoxs)));
    return await handler.DoMethodReturnJson('DataBank_Push');
  }

  /**
   * 生成String.
   * @param boxNo 盒子编号: boxNo
   * @param paras 参数: @Key1=Val1@Key2=Val2
   * @returns string
   */
  public async GenerString(boxNo: string, paras = ''): Promise<string> {
    const dataBox = this.GetBox(boxNo);
    const markID = 'DBSrc.' + this.DBNo + '.' + dataBox.DBType + '.' + this.ClassID + '_' + boxNo + '.' + paras;
    // @ts-ignore
    return await DataBankBase.GenerStringByMarkID(markID);
  }
  public GetBox(boxNo: string) {
    return this.DataBoxs.filter((dataBox) => dataBox.No === boxNo)[0];
  }

  public static async GenerStringByMarkID(mark: string) {
    const handler = new HttpHandler('BP.CCFast.HttpHandlerDataBank');
    handler.AddPara('Mark', mark);

    try {
      return await handler.DoMethodReturnString('GenerString');
    } catch (e) {
      const strs = mark.split('.');
      let clsID = strs[3];
      clsID = clsID.substring(0, clsID.lastIndexOf('_'));
      const subClass = DataBankBase.subclasses.get(clsID);
      if (subClass != null) {
        const instance = new subClass(clsID, strs[1], '');
        await instance.Init();
        await instance.PushDataBoxsToBackground();
        return await handler.DoMethodReturnString('GenerString');
      }
    }
  }
}
