import { getRequestParams } from '/@/utils/request/decode';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';

export class FuncTypeModel {
  //仅仅输出html
  // v-html // xss
  // iframe :src = 'base64 text/html'
  // cross origin
  // public static readonly Html = 'Html';
  // public static readonly MarkDown = 'MarkDown';
  // // 执行一个功能.
  // public static readonly Func = 'Func';
  // public static readonly FuncParas = 'FuncParas';
  // public static readonly ChartLine = 'ChartLine';
  // public static readonly ChartPara = 'ChartPara';
}

export abstract class PageBaseFunc {
  /**
   * 获得外部的参数
   * @param key 参数key
   * @returns
   */
  public RequestVal(key: string) {
    return getRequestParams(key);
  }

  public PageTitle: string | null = '功能页面'; //页面标题.
  public TypeModel: string | null = 'Html'; //页面模式.

  public BtnsTop: string | null = '关闭'; //显示右上角的按钮,多个有逗号分开.

  // public GroupsEnsParentNo?: '0'; //分组.
  public DtlEns?: EntitiesNoName; //页面的分组.

  public ClassID?: string; //实体类ID.
  public RefKey: string | null = ''; //关联的主键.

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

  public go(url: string) {
    return url;
  }

  //初始化数据.
  abstract Init();

  // //获得从表数据
  // abstract GenerDtlData(groupNo);

  // /** 实体点击事件 */
  // abstract IconClick(grouNo?: string, enNo?: string);

  // /** 实体增加事件. */
  // abstract AddClick(grouNo?: string);

  /** 按钮事件. */
  abstract BtnClick(btnName?: string);
}
