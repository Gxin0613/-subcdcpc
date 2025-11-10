import { getRequestParams } from '/@/utils/request/decode';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GPNReturnObj, GPNReturnType } from './PageBaseGroupNew';

//列表模式.
export enum ListModel {
  Table = 0,
  //icon模式.
  Icon = 1,
  //表格模式
}

export abstract class PageBasePanelGroup {
  /**
   * 获得外部的参数
   * @param key 参数key
   * @returns
   */

  public params = {};

  public setParams(val: Recordable) {
    this.params = val;
  }

  public RequestVal(key: string) {
    console.log(this.params);
    return this.params[key] || getRequestParams(key);
  }

  public PageTitle: string | null = '分组实体'; //页面标题.
  public HisListModel = ListModel.Table; // 列表模式.
  //显示的列， 对LsitMode=Icon 有效.
  public Columns: Array<Record<string, any>> = [];
  public BtnsTop: string | null = '关闭'; //显示右上角的按钮,多个有逗号分开.
  public BtnsEnGroup: string | null = ''; //分组的操作按钮: 默认:修改-删除.
  public BtnsEnDtl: string | null = ''; //一行的按钮.

  public GroupsEns?: EntitiesNoName; //页面的分组.
  // public GroupsEnsParentNo?: '0'; //分组.
  public DtlEns?: EntitiesNoName; //页面的分组.
  public ClassID?: string; //实体类ID.
  public RefKey = ''; //关联的主键.
  public IsShowAddClick: boolean | null = true; //是否显示增加icon图标.
  public IsShowEditGroupIcon: boolean | null = true; //是否显示修改类型图标?
  public IsGroupMove: boolean | null = false; //分组是否可以移动?
  public IsEnMove: boolean | null = false; //实体是否可以移动?
  /**
   * 构造方法
   * @param clsId 类的ID.
   * @param groupEns 分组实体
   * @param dtlEns 明细实体
   */
  protected constructor(clsId) {
    // if (clsId) this.classID = clsId
    this.ClassID = clsId;
  }

  //调用的主键.
  get PKVal() {
    return this.RequestVal('PKVal');
  }
  //谁调用的?
  get RefMainEnName() {
    return this.RequestVal('RefMainEnName');
  }

  //初始化数据.
  abstract Init();
  /** 实体点击Icon,Name的事件 */
  abstract IconClick(grouNo: string, enNo: string);

  /** 按钮事件, */
  abstract BtnClick(btnName: string, selectGroupNo?: string, selectItemNo?: string);

  //分组移动,所有的ID按照最后的排列组成一个字符串,比如:001,199,1003,
  public async MoveGroup(groupIDs: string) {
    const httpHandler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    httpHandler.AddPara('ClassID', this.GroupsEns?.GetNewEntity.classID);
    httpHandler.AddPara('PKs', groupIDs);
    await httpHandler.DoMethodReturnString('DtlSearch_UpdatIdx');
  }
  //实体在本分组内移动. 所有的ID按照最后的排列组成一个字符串,比如:001,199,1003,
  public async MoveDtl(dtlIDs: string) {
    const httpHandler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    httpHandler.AddPara('ClassID', this.DtlEns?.GetNewEntity.classID);
    httpHandler.AddPara('PKs', dtlIDs);
    await httpHandler.DoMethodReturnString('DtlSearch_UpdatIdx');
  }
  //实体从一个分组移动到另外一个分组.
  public async MoveDtlToGroup(dtlID: string, toGroupID: string, idx: number) {
    if (this.DtlEns == null) return;

    const entity = this.DtlEns.GetNewEntity;
    entity.setPKVal(dtlID);
    await entity.RetrieveFromDBSources();
    entity.SetValByKey(this.RefKey, toGroupID);
    entity.Idx = idx;
    await entity.Update();
  }

  public OpenDtl(no) {
    const url = '/@/WF/Comm/En.vue?EnName=' + this.DtlEns?.GetNewEntity.classID + '&PKVal=' + no;
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
  }

  //移除 Item.
  public RemoveDtlItem(groupNo: string, itemNo: string) {
    if (groupNo === itemNo) return;
  }
}
