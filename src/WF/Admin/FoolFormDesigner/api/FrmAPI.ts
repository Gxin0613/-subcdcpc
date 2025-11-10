import HttpHandler from '/@/utils/gener/HttpHandler';
import { DataType } from '/@/bp/en/DataType';

export class FrmAPI {
  //字段名类型字典
  public static FieldNameKeys() {
    const xiaoJieJies: { name: string; DataType: number }[] = [
      //金额.
      { name: '费', DataType: DataType.AppMoney },
      { name: '金额', DataType: DataType.AppMoney },
      { name: '额', DataType: DataType.AppMoney },
      //日期时间.
      { name: '日期', DataType: DataType.AppDate },
      { name: '时间', DataType: DataType.AppDateTime },
      // 量.
      { name: '长', DataType: DataType.AppFloat },
      { name: '宽', DataType: DataType.AppFloat },
      { name: '高', DataType: DataType.AppFloat },
      { name: '公斤', DataType: DataType.AppFloat },
      { name: '率', DataType: DataType.AppFloat },

      //量词.
      { name: '个', DataType: DataType.AppInt },
      { name: '台', DataType: DataType.AppInt },
      { name: '张', DataType: DataType.AppInt },
      // boolen类型.
      { name: '重', DataType: DataType.AppFloat },
      { name: '否', DataType: DataType.AppBoolean },
    ];
    return xiaoJieJies;
  }
}

//后缀实体集合
export function fieldEndLabs() {
  const endLabs: { unitEndLabName: string; regName: any; icon: string; tip: string }[] = [
    { unitEndLabName: 'KG', regName: /体重|重量|重/g, icon: '', tip: '' },
    { unitEndLabName: 'CM', regName: /身高|身长|尺寸|长|宽|高/g, icon: '', tip: '' },
    {
      unitEndLabName: '公里',
      regName: /距离|里程|路程/g,
      icon: '',
      tip: '请输入公里数',
    },
    {
      unitEndLabName: '周岁',
      regName: /龄|年纪/g,
      icon: '',
      tip: '请输入年龄',
    },
    { unitEndLabName: '码', regName: /速度|布长|鞋码/g, icon: '', tip: '' },
    { unitEndLabName: 'ML', regName: /容积/g, icon: '', tip: '' },
    { unitEndLabName: '%', regName: /率/g, icon: '', tip: '' },
    { unitEndLabName: '', regName: /备注/g, icon: 'icon-book-open', tip: '' },
    { unitEndLabName: '', regName: /邮件|email|电子邮件/g, icon: 'icon-envelope', tip: '' },
    { unitEndLabName: '', regName: /电话|手机|联系方式/g, icon: 'icon-envelope', tip: '' },
    { unitEndLabName: '', regName: /网站|域名|链接|主页|博客/g, icon: 'icon-link', tip: 'http://ccflow.org' },
  ];

  return endLabs;
}

export async function GenerMyDataType(str: string) {
  const httphandler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
  await httphandler.AddPara('name', str);
  const data = await httphandler.DoMethodReturnString('FrmAPI_GenerMyDataType');
  if (!DataType.IsNullOrEmpty(data) && data.length > 0) {
    return data[0].dataType;
  } else {
    return -1;
  }
}
