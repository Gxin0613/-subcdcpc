import { getRequestParams } from '/@/utils/request/decode';

//列表模式.
export enum GenerListPageShowModel {
  //表格模式(待办模式)
  Table,
  //分组模式(类似于:PanelGroup模式)
  GroupBigIcon,
  //窗口模式(发起)
  Windows,
  //Icon模式(系统列表).
  BigIcon,
  // 左树右表
  TreeTable,
  // 分组显示(发起)
  GroupIcon,
}
//帮助文档显示格式.
export enum HelpShowModel {
  //不显示
  None,
  //顶部按钮
  TopButton,
  //左侧Panel.
  LeftPanel,
}

//GLEn列表打开展示方式.
export enum GLEnOpenShowModel {
  // 无，不打开页面.
  None,
  // 实体与实体相关功能编辑器.
  MyDictFrameWork,
  // 实体编辑器.
  MyDict,
  //打开En实体页面.
  En,
  //工作查看器
  MyView,
  //抄送处理器.
  MyCC,
  //自定义URL.
  URL,
}
//GLEn列表打开方式.
export enum GLEnOpenModel {
  // 新窗口打开.
  NewWindow,
  // 在本窗口打开.
  CurrentWindow,
  //弹出窗口打开,关闭后不刷新列表.
  OldModalWindow,
  //弹出窗口打开,关闭后刷新列表'.
  NewModalWindow,
}

export abstract class PageBaseGenerList {
  /**
   * 获得外部的参数
   * @param key 参数key
   * @returns
   */
  // public RequestVal(key: string) {
  //   const val = getRequestParams(key);
  //   if (!val) return getAllRequestParams(key);
  // }
  public PageTitle: string | null = '待办'; //页面标题.
  public Icon: string | null = 'icon-file'; //标题.
  public ClassID?: string; //实体类ID.

  public DTFieldOfSearch: string | null = 'RDT'; //日期查询字段.
  public DTFieldOfLabel: string | null = '记录日期'; //日期查询字段.
  public BtnsOfRow = ''; //行操作按钮 逗号隔开
  public BtnOfToolbar = ''; //工具栏按钮.

  public LinkField = 'Title'; //链接字段,点击链接进入新窗口字段.
  public GroupFields = ''; //可以分组显示的字段.
  public GroupFieldDefault = ''; //默认的分组字段.
  public LabFields = ''; // 标签显示列
  public ProgressFields = ''; // 进度字段, 必须是 0-1的小数.
  public FKConditions: Array<{ label: string; value: string }> = []; // 外部查询条件
  public BodyWidth = '90%'; //内容显示宽度.

  //帮助按钮定义.
  public HelpDocs = ''; // 帮助文档，如果没有就不显示了.
  public HelpShowModel = HelpShowModel.None; // 帮助文档，如果没有就不显示了.

  // 显示格式: 0=表格(待办), 1=分组显示,  2= Windows模式(发起). 3=BigIcon(我的系统)
  public HisGLShowModel = GenerListPageShowModel.Table;
  public ShowIdx = false; //是否显示序号列.

  public SearchDictOpenType = GLEnOpenShowModel.MyDictFrameWork; //GLEn打开方式.默认打开MyCC
  public RowOpenModel = GLEnOpenModel.NewWindow; //GLEn打开方式
  public UrlExt = ''; //要打开的URL
  public ShowSearchKey = true; //是否显示关键字查询.

  // 参数，从外部传过来的
  public params: Record<string, any> = {};
  public setParams(params: Record<string, any>) {
    this.params = params;
  }
  //  对于实体AddRM_ 传递来的默认值.
  get RefMainEnName() {
    return this.RequestVal('EnClassID');
  }
  // 对于实体AddRM_ 传递来的默认值.
  get PKVal() {
    return this.RequestVal('PKVal');
  }
  /**
   * 获得外部的参数, 此方法为实现.
   * @param key 参数key
   * @returns
   */
  // 当前登录人的token
  public RequestVal(key: string) {
    return this.params[key] || getRequestParams(key);
  }

  private reloadFunc: Function | null = null;
  public setReloadFunc(_func: Function) {
    this.reloadFunc = _func;
  }
  public async Reload() {
    await this.Init();
    this.reloadFunc?.(this);
  }

  public PageSize = 0; // 分页的页面行数, 0不分页.
  public ShowCheckBox = false; // 是否显示checkbox.

  //返回的数据
  public Data: Array<Record<string, any>> = [];

  //显示的列.
  public Columns: Array<Record<string, any>> = [];

  /**
   * 构造方法
   * @param clsId 类的ID.
   */
  protected constructor(clsId) {
    this.ClassID = clsId;
  }

  //初始化数据.
  abstract Init();

  /** 标题点击事件 */
  abstract LinkFieldClick(object: Record<string, any>);

  abstract OnTextBlur(_object: Record<string, any>);

  /** 按钮点击事件 */
  abstract BtnClick(btnName: string, record: Record<string, any>, ids?: string);
  /**
   * 时间友好提示
   * @param adt
   * @returns
   */
  public FirendlyDT(adt: string) {
    const minute = 1000 * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const time1 = new Date().getTime(); //当前的时间戳
    const time2 = Date.parse(new Date(adt).toString()); //指定时间的时间戳
    const time = time1 - time2;

    let result = '';
    if (time < 0) {
      result = '--';
    } else if (time / month >= 1) {
      result = parseInt(time / month) + '月前';
    } else if (time / week >= 1) {
      result = parseInt(time / week) + '周前';
    } else if (time / day >= 1) {
      result = parseInt(time / day) + '天前';
    } else if (time / hour >= 1) {
      result = parseInt(time / hour) + '小时前';
    } else if (time / minute >= 1) {
      result = parseInt(time / minute) + '分钟前';
    } else {
      result = '刚刚';
    }
    return result;
  }
}
