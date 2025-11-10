import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import BSEntity from '/@/utils/gener/BSEntity';

// 节点属性
export class ARBindWebApi extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.WF.ARBindWebApi');
    if (!!pkval) this.setPKVal(pkval);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Part', '绑定WebApi');
    map.AddGroupAttr('基本设置');
    map.AddMyPK();
    map.AddTBString('FlowNo', null, 'FlowNo', false, false, 0, 800, 100, false);
    map.AddTBInt('NodeID', 0, 'NodeID', false, false);

    map.AddTBString('Tag0', null, 'Url', true, false, 0, 800, 100, true, this.Help);
    map.AddDDLStringEnum('Tag1', 'Get', '请求模式', '@Get=Get模式@POST=Post模式', true, '');
    map.AddTBStringDoc('Tag9', null, '备注', true, false, true, this.Help);

    map.AddGroupAttr('POST设置');
    map.AddDDLStringEnum('Tag2', '0', '参数模式', '@0=自定义模式@1=全量模式', true, this.HelpParaModel);
    map.AddTBStringDoc('Tag3', null, '自定义数据内容', true, false, true, this.Help);
    map.AddDDLStringEnum('Tag4', '0', '数据格式', '@0=From格式@1=JSON格式', true, this.HelpParaModel);

    // map.AddGroupAttr('返回值格式');
    // map.AddTBString('Tag3', null, 'JSON节点', true, false, 0, 800, 100, true, this.helpJsonNode);
    // map.AddTBString('Tag3', null, '人员编号列', true, false, 0, 800, 100, true, this.HelpNoName);
    // map.AddTBString('Tag3', null, '人员名称列', true, false, 0, 800, 100, true, this.HelpNoName);

    // const rmB1 = new RefMethod();
    // rmB1.Title = '执行测试';
    // rmB1.RefMethodType = RefMethodType.Func;
    // rmB1.HisMap.AddTBString('P', null, '输入参数', true, false, 0, 2000, 300, true, '@Tel=xxx@SPJE=xx');
    // rmB1.Warning = '您确定要执行吗?';
    // rmB1.ClassMethod = 'DoTest';
    // map.AddRefMethod(rmB1);

    const rm = new RefMethod();
    rm.Title = '执行测试';
    rm.RefMethodType = RefMethodType.Func;
    rm.HisMap.AddTBString('P', null, '输入参数', true, false, 0, 2000, 300, true, '格式@BU=1001@PDT=1002');
    rm.Warning = '您确定要执行吗？';
    rm.ClassMethod = 'DoTest';
    map.AddRefMethod(rm);

    this._enMap = map;
    return this._enMap;
  }
  public async DoTest(p: string) {
    const en = new BSEntity('BP.WF.Template.Part', this.MyPK);
    await en.Init();
    await en.Retrieve();
    const data = await en.DoMethodReturnString('DoTestARWebApi', p);
    return 'tabOpen@接受人:' + data;
  }

  public Help = `
  ####  帮助
  - 请输入完整的url 比如: http:/ccbpm.cn:9090/xxx.do?xx=xx&WorkID=@WorkID&Token=@WwebUser.Token
  - 内部参数格式: @WebUser.* 是当前登录人员的信息.
  - 表单参数: @+字段名, 比如审批金额: @SPJE   
  - 流程参数： @WorkID , @NodeID  两个固定的参数.
  ####  对于post模式.
  - 请参考 post填写帮助.
  ####  返回值格式.
  - 必须返回: zhangsan,lisi,wangwu 这样的格式.
  `;

  public HelpParaModel = `
  #### 自定义模式
  - 在【自定义数据内容】输入json字符串，字符串内可以使用@+字段名.
  - 比如：
  {
    QingJiaTianShu:@QingJiaTianShu
    WorkID:@WorkID
    NodeID:@FK_Node
    User:@WebUser.No
  }
  - 参数里包括三类:
  - 1. 内置参数@WebUser.* ,   解释: 当前登录人员的信息, @WebUer.No,  @WebUer.Nme,  @WebUer.FK_Dept,  @WebUer.DeptName,  @WebUer.OrgNo
  - 2. 表单参数:@表单字段     解释: 表单的英文字段名.
  - 3. 流程参数:@WorkID   @NodeID    解释:当前的工作ID，节点ID.
  #### 全量模式
  - 把表单字段, 作为一个大的json传入接口里面去.
  - 接口开发者，获得表单数据进行有效的利用，生成下一步工作人员，返回过来。
  `;

  public helpJsonNode = `
  #### 帮助
  - 返回的JSON从那个节点下开始获取数据，如果没有节点就不需要设置.
  #### 比如1：返回数据
   {
        "contents": [
          {
             "UserNo": "string",
             "UserName": "string",
          },
          {
              "UserNo": "string",
               "UserName": "string",
          }
        ]
   }

   - 这个模式需要配置节点ID: contents
   #### 比如2：返回数据
    [
          {
             "UserNo": "string",
             "UserName": "string",
          },
          {
              "UserNo": "string",
               "UserName": "string",
          }
        ]

   - 该模式不需要配置.
  `;
}
