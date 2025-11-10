import { MapAttr } from '../../MapAttrs/MapAttr';
import { BindFunction } from './BindFunction';
import { RegularExpressionFactory } from './RegularExpressionFactory';
import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GPN_BindFunction extends PageBaseGroupNew {
  constructor() {
    super('GPN_BindFunction');
    this.ForEntityClassID = 'TS.MapExt.BindFunction';
    this.PageTitle = '新建绑定正则/函数';
  }
  public Init() {
    //增加子页面.
    this.AddGroup('A', '绑定正则');
    //this.AddBlank('RegularExpressionLab', '绑定正则表达式库', this.RegularExpressionLab);
    this.SelectItemsByGroupList('RegularExpressionLab', '绑定正则表达式库', '', false, this.Group(), this.List());
    this.TextBox2_NameNo('RegularExpressionSelf', '自定义正则表达式', this.RegularExpressionSelf, '', '正则表达式', '提示信息', '');

    // this.AddGroup('B', '绑定函数');
    // this.TextBox2_NameNo('SelfFunc', '绑定自定义函数', this.SelfFunc, '', '函数名', '备注', '');
    // this.TextSQL('JSBody', '执行函数体', this.JSBody, '输入JS脚本', '', '请参考下面的帮助文档.');

    // this.AddBlank('SelfFunc', '绑定自定义函数', this.SelfFunc);
    // this.AddBlank('JSBody', '绑定函数体', this.JSBody);
  }

  public List() {
    return JSON.stringify(RegularExpressionFactory.getLabs());
  }
  public Group() {
    return JSON.stringify([
      {
        No: 'onblur,onchange',
        Name: 'onblur失去焦点,与onchange内容变化',
      },
      {
        No: 'onblur',
        Name: 'onblur失去焦点',
      },
      {
        No: 'onchange',
        Name: 'onchange内容变化',
      },
      {
        No: 'onclick',
        Name: 'onclick点击',
      },
      {
        No: 'ondblclick',
        Name: 'ondblclick双击',
      },
      {
        No: 'onkeypress',
        Name: 'onkeypress当键盘按键被按下并释放一个键时发生',
      },
      {
        No: 'onkeyup',
        Name: 'onkeyup释放键盘按键',
      },
    ]);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([
      {
        No: 'blur',
        Name: 'blur失去焦点',
      },
      {
        No: 'change',
        Name: 'change内容变化',
      },
    ]);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    const refPKVal = this.RequestVal('RefPKVal');
    const eventID = sortNo; //'onblur';
    //. 这里没有正确的返回，lab 名称。返回的是 {}
    const eventName = await this.GetSortName(sortNo); //'失去焦点';

    //获得mapAttr.
    const mapAttr = new MapAttr(refPKVal);
    await mapAttr.Retrieve();

    const en = new BindFunction();
    en.ExtModel = 'BindFunction';
    en.Tag = eventID; //事件标记. 比如:onkeypress
    en.Tag1 = eventName; //事件名称,比如:键盘按下事件.
    en.FK_MapData = mapAttr.FK_MapData;
    en.AttrOfOper = mapAttr.KeyOfEn;
    en.RefPKVal = refPKVal;
    en.Tag6 = this.GetPageName(pageNo);

    let enName = 'TS.MapExt.BindFunction';
    //从正则表达库中获取的.
    if (pageNo === 'RegularExpressionLab') {
      en.ExtType = 'RegularExpression'; //正则表达式.
      //根据ID，获得正则内容.
      const lab = RegularExpressionFactory.GetEn(tb1);
      // en.Tag3 = lab.Name; //事件名称.
      en.Doc = lab.Exp; //事件表达式.
      en.Tag2 = lab.Message; //事件错误提示消息.
      enName = 'TS.MapExt.RegularExpression';
    }

    //自己输入的正则表达式.
    if (pageNo === 'RegularExpressionSelf') {
      en.ExtType = 'RegularExpression'; //正则表达式.
      en.Doc = tb2; //事件内容.
      en.Tag2 = tb1; //提示信息.
      enName = 'TS.MapExt.RegularExpression';
    }

    //自己输入的正则表达式.
    if (pageNo === 'JSBody') {
      en.ExtType = 'JSBody'; //正则表达式.
      en.Doc = tb1; //事件内容.
      //  en.Tag2 = tb1; //提示信息.
      enName = 'TS.MapExt.JSBody';
    }

    //自己输入的正则表达式.
    if (pageNo === 'SelfFunc') {
      en.ExtType = 'SelfFunc'; //正则表达式.
      en.Doc = tb2; //事件内容.
      //  en.Tag2 = tb1; //提示信息.
      enName = 'TS.MapExt.SelfFunc';
    }

    en.SetPara('EnName', enName);
    await en.Insert();
    let url = '';
    url = '/@/WF/Comm/En.vue?EnName=' + enName + '&PKVal=' + en.MyPK;
    return 'url@' + url;
  }
  public readonly RegularExpressionLab = `
  #### 帮助
  - 什么是正则表达式，请baidu，这个名词。
  - 系统已经帮您准备一个常用正则表达式.
  - 请选择正确的事件，然后根据事件选择表达式.
  - 比如: 校验文本框是否是电话号码，应该在失去焦点，而不能在双击事件.
  #### 图例
  - 电话号码校验
  - 
`;
  public readonly RegularExpressionSelf = `
  #### 帮助
  - 自定义正则表达式, 请在文本框输入正则表达式，然后执行创建。
  - 请正确的选择事件然.
`;

  public readonly SelfFunc = `
  #### 帮助
  - 自定义函数，就是在服务器上创建一个js文件，写入一个函数.
  -  
`;

  public readonly JSBody = `
#### 帮助
-  输入函数的脚本.
-  系统就会执行这些脚本，在您指定的事件里.
`;
}
