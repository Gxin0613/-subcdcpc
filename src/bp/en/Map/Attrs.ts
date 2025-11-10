import { FieldType } from '/@/bp/en/EnumLab';
import { DataType } from '/@/bp/en/DataType';
import { UIContralType } from '/@/bp/en/EnumLab';
import { Attr } from './Attr';

/// 属性集合
export class Attrs extends Array<Attr> {
  public currGroupName = '基本信息';

  public groups: Array<{
    key: string;
    name: string;
    type: 'group' | 'component';
    compSrc: string | null;
    height: number;
    hideTitle?: boolean;
  }> = [];
  /**
   * 增加string类型的字段.
   * @param key 字段
   * @param defaultVal 默认值
   * @param desc 描述
   * @param uiVisable 是否可见？
   * @param isReadonly 是否只读？
   * @param minLength 最小长度
   * @param maxLength  最大长度
   * @param tbWith  宽度？
   * @param isUILine 是否整行显示？
   * @param helpUrl 帮助url.
   */
  public AddTBString(
    key: string,
    defaultVal: string | null,
    desc: string,
    uiVisable: boolean,
    isReadonly: boolean,
    minLength: number,
    maxLength?: number,
    tbWith?: number,
    isUILine?: boolean,
    helpUrl?: string | null,
  ) {
    const attr = new Attr();
    attr.Key = key;
    attr.HelperUrl = helpUrl || null;
    attr.Field = key;
    attr.DefaultVal = defaultVal;
    attr.MyDataType = DataType.AppString;
    attr.Desc = desc || key;
    attr.UIVisible = uiVisable || false;
    attr.UIWidth = tbWith || 0;
    attr.UIIsReadonly = isReadonly || false;
    attr.MaxLength = maxLength || 50;
    attr.MinLength = minLength || 0;
    attr.MyFieldType = FieldType.Normal;
    attr.UIIsLine = isUILine || false;
    attr.GroupName = this.currGroupName;

    this.push(attr);
  }

  /// <summary>
  /// 增加一个普通的类型。如果不传入 _Field 则设置为和key一致
  /// </summary>
  /// <param name="key">键</param>
  /// <param name="defaultVal">默认值</param>
  /// <param name="desc">描述</param>
  /// <param name="uiVisable">是不是可见</param>
  /// <param name="isReadonly">是不是只读</param>
  public AddTBInt(key: string, defaultVal?: number, desc?: string, uiVisable?: boolean, isReadonly?: boolean) {
    const attr = new Attr();
    attr.Key = key;
    attr.Field = key;
    attr.DefaultVal = defaultVal;
    attr.MyDataType = DataType.AppInt;
    attr.MyFieldType = FieldType.Normal;
    attr.Desc = desc || '';
    attr.UIVisible = uiVisable || false;
    attr.UIIsReadonly = isReadonly || false;
    attr.GroupName = this.currGroupName;

    this.push(attr);
  }

  public AddBoolean(key: string, defaultVal: boolean, desc: string) {
    const attr = new Attr();
    attr.Key = key;
    attr.Field = key;
    if (defaultVal) attr.DefaultVal = 1;
    else attr.DefaultVal = 0;
    attr.MyDataType = DataType.AppBoolean;
    attr.Desc = desc;
    attr.UIContralType = UIContralType.CheckBok;
    attr.UIIsReadonly = true;
    attr.UIVisible = true;
    attr.GroupName = this.currGroupName;
    this.push(attr);
  }

  public AddTBFloat(key: string, defaultVal?: number, desc?: string, uiVisable?: boolean, isReadonly?: boolean) {
    const attr = new Attr();
    attr.Key = key;
    attr.Field = key;
    attr.DefaultVal = defaultVal;
    attr.MyDataType = DataType.AppFloat;
    attr.Desc = desc || '';
    attr.UIVisible = uiVisable || false;
    attr.UIIsReadonly = isReadonly || false;
    attr.GroupName = this.currGroupName;

    this.push(attr);
  }

  public AddTBDecimal(key: string, defaultVal: number, desc: string, uiVisable: boolean, isReadonly: boolean) {
    const attr = new Attr();
    attr.Key = key;
    attr.Field = key;
    attr.DefaultVal = defaultVal;
    attr.MyDataType = DataType.AppDouble;
    attr.Desc = desc || '';
    attr.UIVisible = uiVisable || false;
    attr.UIIsReadonly = isReadonly || false;
    attr.GroupName = this.currGroupName;
    this.push(attr);
  }

  /**
   * 增加日期类型的控健
   * @param key  字段
   * @param defaultVal 默认值 @RDT 是当前日期
   * @param desc 中文名称
   * @param uiVisable 是否可见
   * @param isReadonly 是否只读
   */
  public AddTBDateTime(key: string, defaultVal?: string, desc?: string, uiVisable?: boolean, isReadonly?: boolean) {
    const attr = new Attr();
    attr.Key = key;
    attr.Field = key;
    attr.DefaultVal = defaultVal;
    attr.MyDataType = DataType.AppDateTime;
    attr.Desc = desc || '';
    attr.UIVisible = uiVisable || false;
    attr.UIIsReadonly = isReadonly || false;
    attr.MaxLength = 30;
    attr.MinLength = 0;
    attr.UIWidth = 100;
    attr.GroupName = this.currGroupName;
    this.push(attr);
  }

  //图片上传.
  public AddTBImageUpload(key: string, defaultVal?: string, desc?: string, uiVisable?: boolean, isReadonly?: boolean) {
    const attr = new Attr();
    attr.Key = key;
    attr.Field = key;
    attr.DefaultVal = defaultVal || '';
    attr.MyDataType = DataType.AppImageUpload;
    attr.Desc = desc || '';
    attr.UIVisible = uiVisable || false;
    attr.UIIsReadonly = isReadonly || false;
    attr.MaxLength = 30;
    attr.MinLength = 0;
    attr.UIWidth = 100;
    attr.GroupName = this.currGroupName;
    this.push(attr);
  }
  //图片上传.
  public AddMakeImage(key: string, defaultVal?: string, desc?: string, uiVisable?: boolean, isReadonly?: boolean) {
    const attr = new Attr();
    attr.Key = key;
    attr.Field = key;
    attr.DefaultVal = defaultVal || '';
    attr.MyDataType = DataType.AppMakeImage;
    attr.Desc = desc || '';
    attr.UIVisible = uiVisable || false;
    attr.UIIsReadonly = isReadonly || false;
    attr.MaxLength = 30;
    attr.MinLength = 0;
    attr.UIWidth = 100;
    attr.GroupName = this.currGroupName;
    this.push(attr);
  }

  /**
   * 自定义枚举类型
   * @param key
   * @param field
   * @param defaultVal
   * @param desc
   * @param isUIVisable
   * @param isUIEnable
   * @param sysEnumKey
   * @param cfgVal
   */
  public AddDDLSysEnum(key: string, defaultVal?: number, desc?: string, isUIVisable?: boolean, isUIEnable?: boolean, sysEnumKey?: string, cfgVal?: string) {
    const attr = new Attr();
    attr.Key = key;
    attr.Field = key;
    attr.DefaultVal = defaultVal;
    attr.MyDataType = DataType.AppInt;
    attr.MyFieldType = FieldType.Enum;
    attr.Desc = desc || '';
    attr.UIContralType = UIContralType.DDL;
    attr.UIBindKey = sysEnumKey || null;
    attr.UITag = cfgVal || null;
    attr.UIVisible = !!isUIVisable;
    attr.UIIsReadonly = !isUIEnable;
    attr.GroupName = this.currGroupName;
    this.push(attr);
  }

  public AddDDLSQL(key: string, defaultVal?: any, desc?: string, isUIVisable?: boolean, isUIEnable?: boolean, sql?: string) {
    const attr = new Attr();
    attr.Key = key;
    attr.Field = key;
    attr.DefaultVal = defaultVal;
    attr.MyDataType = DataType.AppString;
    attr.MyFieldType = FieldType.Normal;
    attr.Desc = desc || '';
    attr.UIContralType = UIContralType.DDL;
    attr.UIBindKey = sql || null;
    attr.UITag = sql || null;
    attr.UIVisible = isUIVisable || false;
    attr.UIIsReadonly = isUIEnable || false;
    attr.GroupName = this.currGroupName;
    this.push(attr);
  }

  public Contains(key: string) {
    return this.find((item) => item.Key === key);
  }

  public GetAttrByKey(key: string) {
    return this.find((item) => item.Key === key);
  }

  public GetAttrByKeyOfEn(field: string) {
    return this.find((item) => item.Field === field);
  }

  /// <summary>
  /// 加入一个属性。
  /// </summary>
  /// <param name="attr">attr</param>
  /// <param name="isAddHisRefText">isAddHisRefText</param>
  public Add(attr: Attr, isAddHisRefText?: boolean, isAddHisRefName?: boolean) {
    if (!attr.Field) {
      return;
    }
    // 如果没有后面参数
    if (!isAddHisRefText && !isAddHisRefName) {
      isAddHisRefText = true;
      isAddHisRefName = false;
    }
    if (this.find((item) => item.Key === attr.Key)) return;
    attr.GroupName = this.currGroupName;
    const group = this.groups.find((g) => g.name == this.currGroupName);
    if (!group) {
      // console.log('add', this.currGroupName);
      this.groups.push({
        key: attr.GroupName,
        name: attr.GroupName,
        type: 'group',
        compSrc: null,
        height: 400,
      });
    }
    this.push(attr);
    if (isAddHisRefText) this.AddRefAttrText(attr);
    if (isAddHisRefName) this.AddRefAttrName(attr);
  }

  private AddRefAttrText(attr: Attr) {
    if (attr.MyFieldType == FieldType.Enum && attr.MyDataType == DataType.AppString) return;
    if (attr.MyFieldType == FieldType.FK || attr.MyFieldType == FieldType.Enum || attr.MyFieldType == FieldType.PKEnum || attr.MyFieldType == FieldType.PKFK) {
      const myattr = new Attr();
      myattr.MyFieldType = FieldType.RefText;
      myattr.MyDataType = DataType.AppString;
      myattr.UIContralType = UIContralType.TB;
      myattr.UIWidth = attr.UIWidth * 2;
      myattr.Key = attr.Key + 'Text';
      myattr.UIVisible = false;
      myattr.UIIsReadonly = true;
      myattr.UIBindKey = attr.UIBindKey;
      // myattr.UIBindKeyOfEn = attr.UIBindKeyOfEn;
      // todo 多表先不做
      //  myattr.HisFKEns = attr.HisFKEns;
      //myattr.Desc=attr.Desc+"名称";

      const desc = (myattr.Desc = '名称');
      if (desc.includes('编号')) myattr.Desc = attr?.Desc?.replace('编号', '名称') || '';
      else myattr.Desc = attr.Desc + '名称';

      if (attr.UIContralType == UIContralType.DDL) myattr.UIVisible = false;

      attr.GroupName = this.currGroupName;
      this.push(myattr);
      //this.push(myattr,true);
    }
  }

  private AddRefAttrName(attr: Attr) {
    if (attr.MyFieldType == FieldType.FK || attr.MyFieldType == FieldType.Enum || attr.MyFieldType == FieldType.PKEnum || attr.MyFieldType == FieldType.PKFK) {
      const myattr = new Attr();
      myattr.MyFieldType = FieldType.Normal;
      myattr.MyDataType = DataType.AppString;
      myattr.UIContralType = UIContralType.TB;
      myattr.UIWidth = attr.UIWidth * 2;
      myattr.Key = attr.Key + 'Name';
      myattr.Field = attr.Key + 'Name';
      myattr.MaxLength = 200;
      myattr.MinLength = 0;
      myattr.UIVisible = false;
      myattr.UIIsReadonly = true;
      myattr.Desc = myattr.Desc = 'Name';
      attr.GroupName = this.currGroupName;
      this.push(myattr);
    }
  }
}
