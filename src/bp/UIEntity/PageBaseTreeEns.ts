import { message } from 'ant-design-vue';
import { GPNReturnObj, GPNReturnType } from './PageBaseGroupNew';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { getRequestParams } from '/@/utils/request/decode';
import { DataType } from '/@/bp/en/DataType';
import { FieldType } from '/@/bp/en/EnumLab';
import { TreeOption } from 'naive-ui';
import { RowData } from 'naive-ui/es/data-table/src/interface';
import { Entities } from '../en/Entities';
import { useI18n } from '/@/hooks/web/useI18n';
import { getAppEnvConfig } from '/@/utils/env';
const { VITE_GLOB_SX_TITLE } = getAppEnvConfig();
const { t } = useI18n();
// TreeEns 实体基类.
export abstract class PageBaseTreeEns {
  /**
   * 获得外部的参数
   * @param key 参数key
   * @returns
   */
  public RequestVal(key: string) {
    return getRequestParams(key) || this.ComponentParams[key];
  }

  public SetParams(params: Recordable) {
    this.ComponentParams = params;
  }

  public ComponentParams: Recordable = {};

  public ListMode: 'Default' | 'Search' | 'GL' = 'Default'; // 右侧列表展示模式.
  public GLEnName = ''; // 当右侧为GL时必须配置, 对应GL必须处理controlKey及controlVal来实现被左侧树控制
  //定义树节点icon.
  public NodeIconOpen: string | null = '/cion'; //打开的时候icon.
  public NodeIconClose: string | null = '/cion'; //关闭的时候icon.
  public IsLazy = false;
  public TreeEns?: EntitiesNoName; //页面的分组.
  public DtlEns?: EntitiesNoName; //实体类.
  public DtlEnsGroupBy = ''; //实体类分组字段,为二局开发,能够实现按照岗位分组.
  public PageTitle: string | null = '分组实体'; //页面标题.
  public ClassID?: string; //实体类ID比如: TreeEn_XXXX.
  public RootNo: string | null | undefined = '0'; //树的根目录.
  public TableTreeRootNo: string | null | undefined = ''; //表格树的根目录.
  public RefKey: string | null = 'FK_Dept'; //关联的主键.
  public BtnsOfToolbar: string | null = ''; //工具栏按钮:关闭,角色维护,部门维护
  // 选择一行记录的时候，显示的按钮.
  public BtnsOfTableTop: string | null = '批量删除';
  //行右侧的按钮,多个按钮使用逗号分开.
  public BtnsOfItemOptions: string | null = '编辑,删除';
  //空白的时候的欢迎页.
  public Welcome: string | null = `欢迎使用${VITE_GLOB_SX_TITLE}BPM.`;
  //显示的列.
  public Columns: Array<Record<string, any>> = [];
  // 在外部定义 goto方法
  // public IsShowAddClick:boolean|null=true; //是否显示增加icon图标.
  // public IsShowEditGroupIcon:boolean|null=true; //是否显示修改类型图标?
  // public IsGroupMove:boolean|null=false; //分组是否可以移动?
  public IsEnMove: boolean | null = false; //实体是否可以移动?
  public IsTreeEnMove: boolean | null = false; //实体是否可以移动?
  public IsPartTimeJob: boolean | null = false; //实体是否加载兼职部门。

  public EnableContextMenu: boolean | null = true; //是否启用树结构右键菜单
  /**
   * @param clsId 类名
   */
  protected constructor(clsId: string) {
    // if (clsId) this.classID = clsId
    this.ClassID = clsId;
  }

  public async CreateDtlExt(_row: Recordable): Promise<string> {
    return '';
  }

  //初始化数据.
  public async Init(rootNo = '0') {
    this.RootNo = rootNo;
  }
  public GoToPage(url: string) {
    let actualUrl = url.replace(/.vue/g, '');
    if (actualUrl.startsWith('/@/')) {
      window.location.replace(actualUrl);
      return;
    }
    if (actualUrl.startsWith('/WF/')) {
      actualUrl = '/#' + url;
      window.location.replace(actualUrl);
      return;
    }
    throw new Error('非法url');
  }
  /**
   * 移动后的事件
   * @param itemIDs  比如: 007,002,094
   */
  public async ItemMoveDtl(itemIDs: string) {
    const dtlEn = this.DtlEns?.GetNewEntity;
    if (!dtlEn) return;
    // if (dtlEn == null || 1 == 1) {
    //   return;
    // }
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    // const pTable = 'Port_Emp';
    const pTable = dtlEn._enMap.PhysicsTable; //获得表.
    // const pk = 'No'; //  this.DtlEns?.GetNewEntity.PK;
    const pk = dtlEn.PK;
    handler.AddPara('PTable', pTable);
    handler.AddPara('PK', pk);
    handler.AddPara('PKs', itemIDs);
    await handler.DoMethodReturnString('TreeEns_UpdateDtlIdx');
  }
  //删除节点.
  public async Node_Delete(nodeID: string, TreeNode: TreeOption) {
    try {
      if (this.TreeEns == null) return;
      if (TreeNode.ParentNo == '0') {
        //判断当前是否只存在一个根节点
        if (this.TreeEns.filter((item) => item.ParentNo == '0').length == 1) return new GPNReturnObj(GPNReturnType.Error, t('treeens.tip.nodel5'));
      }
      const nd = this.TreeEns?.GetNewEntity;
      const nodeDataList = await this.GetDataByTreeNodeID(nodeID);
      if (this.RequestVal('EnName') === 'TreeEns_DBSrc') {
        if (nodeID.includes(',Dict') || nodeID.includes(',Search') || nodeID.includes(',Proc')) {
          if (Array.isArray(nodeDataList) && nodeDataList.length > 0) {
            return new GPNReturnObj(GPNReturnType.Error, t('treeens.tip.nodel1'));
          }
          if (!!TreeNode?.children && TreeNode?.children.length > 0) {
            return new GPNReturnObj(GPNReturnType.Error, t('treeens.tip.nodel2'));
          }
          return new GPNReturnObj(GPNReturnType.Message, t('treeens.tip.nodel3'));
        }
        //需要判断子节点下是否有子数据
        if (!!TreeNode?.children && TreeNode?.children.length > 0) {
          for (const item of TreeNode?.children) {
            const data = await this.GetDataByTreeNodeID(item.key as string);
            if (Array.isArray(data) && data.length > 0) {
              return new GPNReturnObj(GPNReturnType.Error, t('treeens.tip.nodel4'));
            }
          }
        }
        nd.setPKVal(nodeID);
        await nd.Retrieve();
        await nd?.Delete();
        return new GPNReturnObj(GPNReturnType.Message, t('treeens.tip.deleetettip'));
      }

      if (Array.isArray(nodeDataList) && nodeDataList.length > 0) {
        return new GPNReturnObj(GPNReturnType.Error, t('treeens.tip.nodel1'));
      }
      if (!!TreeNode?.children && TreeNode?.children.length > 0) {
        return new GPNReturnObj(GPNReturnType.Error, t('treeens.tip.nodel2'));
      }

      nd.setPKVal(nodeID);
      await nd.Retrieve();
      await nd?.Delete();
      return new GPNReturnObj(GPNReturnType.Message, t('treeens.tip.deleetettip'));
    } catch (e) {
      alert(e);
      return;
    }
  }
  //编辑节点,打开页面.
  public async Node_Edit(nodeID: string) {
    if (this.TreeEns == null) return;
    const ndClassName = this.TreeEns?.GetNewEntity.classID;
    const url = `/@/WF/Comm/En.vue?EnName=${ndClassName}&PKVal=${nodeID}`;
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
  }

  //编辑节点,打开页面.
  public Dtl_New(nodeID: string) {
    if (this.DtlEns == null) return;
    const ndClassName = this.DtlEns?.GetNewEntity.classID;
    const url = `/@/WF/Comm/En.vue?EnName=${ndClassName}&${this.RefKey}=${nodeID}`;
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
  }
  //删除子表数据.
  public async Items_Delete(selectedRowIDs = '', _treeNodeID = '') {
    if (!selectedRowIDs) {
      message.warning(t('treeens.tip.noselecttip'));
      return new GPNReturnObj(GPNReturnType.DoNothing); //要刷新.
    }
    if (!window.confirm('您确定要删除[' + selectedRowIDs + ']吗？')) return new GPNReturnObj(GPNReturnType.DoNothing, null);

    const en = this.DtlEns?.GetNewEntity;
    if (!en) {
      return new GPNReturnObj(GPNReturnType.Message, '没有获得到EN' + this.DtlEns);
    }

    //执行删除.
    const ids = selectedRowIDs.split(',');
    for (const id of ids) {
      en?.setPKVal(id);
      try {
        await en.RetrieveFromDBSources();
        await en.Delete();
        // deleteIDs += id + ',';
        message.info('成功删除' + id);
      } catch (e) {
        message.error('删除失败:' + e);
      }
    }
    //移除选择的数据, TreeEns调用删除方法后，需要动态的移除被删除的item.
    // this.RemoveDtlItems(selectedRowIDs);  没有实现移除item.
    // deleteIDs = 'RemoveDtlItems:' + deleteIDs;
    return new GPNReturnObj(GPNReturnType.Update, null); //要刷新.
  }
  public async Item_Edit(rowID: string) {
    if (this.TreeEns == null) return;
    const ndClassName = this.DtlEns?.GetNewEntity.classID;
    const url = `/@/WF/Comm/En.vue?EnName=${ndClassName}&PKVal=${rowID}`;
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
  }

  //创建同级.
  public async Node_CreateSameLevelNode(nodeID: string, TreeNode: TreeOption) {
    try {
      if (this.TreeEns == null) return;
      if (TreeNode.ParentNo == '0' && TreeNode.No == '100') {
        return message.info(t('treeens.tip.createsameleveltip1'));
      }
      const name = window.prompt(t('treeens.tip.createsameleveltip'), '');
      if (!name) return;
      const nd = this.TreeEns?.GetNewEntity;
      nd.setPKVal(nodeID);
      nd.No = nodeID;
      await nd.Retrieve();
      nd.No = '';
      nd.Name = name;
      nd.Idx = nd.Idx + 1;
      await nd.Insert();
      return new GPNReturnObj(GPNReturnType.DoNothing, nd);
    } catch (e: any) {
      return new GPNReturnObj(GPNReturnType.Message, e.toString());
    }
  }
  //创建级子级.
  public async Node_CreateChildNode(nodeID: string) {
    try {
      if (this.TreeEns == null) return;
      const name = window.prompt(t('treeens.tip.createchildtip'), '');
      if (!name) return;
      const nd = this.TreeEns?.GetNewEntity;
      nd.setPKVal(nodeID);
      await nd.Retrieve();
      nd.No = ''; // DBAccess.GenerGUID();
      nd.Name = name;
      nd.ParentNo = nodeID;
      nd.Idx = nd.Idx + 1;
      await nd.Insert();
      return new GPNReturnObj(GPNReturnType.DoNothing, nd);
    } catch (e) {
      alert(e);
      return;
    }
  }
  //修改名称.
  public async Node_ChangeNodeName(nodeID: string, Name: string) {
    try {
      if (this.TreeEns == null) return;
      const name = window.prompt(t('treeens.tip.createchildtip'), Name);
      if (!name) return;
      const nd = this.TreeEns?.GetNewEntity;
      nd.setPKVal(nodeID);
      await nd.Retrieve();
      nd.Name = name;
      await nd.Update();
      return new GPNReturnObj(GPNReturnType.DoNothing, nd);
    } catch (e) {
      alert(e);
      return;
    }
  }

  /**
   * 执行移动.
   * @param nodeIDs 移动后的IDs 格式:  011,302,003,006
   * @param parentNo 父节点的ID, 比如: 009
   * @returns 移动结果,或者异常.
   */
  public async ItemMoveTree(nodeIDs: string, parentNo: string) {
    const nodeEn = this.TreeEns?.GetNewEntity;
    if (!nodeEn) {
      return new GPNReturnObj(GPNReturnType.Message, '没有找到节点');
    }
    const myNodeIDs = nodeIDs.split(',');
    for (let index = 0; index < myNodeIDs.length; index++) {
      const nodeID = myNodeIDs[index];
      nodeEn?.setPKVal(nodeID);
      await nodeEn?.RetrieveFromDBSources();
      nodeEn.ParentNo = parentNo;
      nodeEn.Idx = index;
      await nodeEn?.Update();
    }
    return new GPNReturnObj(GPNReturnType.Message, '移动成功');
  }

  /**
   * 停留在两个node之间
   * @param itemNos 例如: 007,002,094
   * @param fromNodeNo 例如:  002
   * @param toNodeParentNo 例如:  008
   * @param isAsChild 是否作为子节点?
   * @param itemNos 节点的排序?
   * @returns 执行结果
   */
  public async ItemMoveTree_old(fromNodeNo: string, toNodeNo: string, isAsChild = false, itemNos = '') {
    const fromNode = this.TreeEns?.GetNewEntity;
    if (!fromNode) return;
    fromNode.No = fromNodeNo;
    await fromNode.Retrieve();

    //如果作为字节点.
    if (isAsChild == true) {
      fromNode.ParentNo = toNodeNo;
      await fromNode.Update();
      return;
    }

    //移动到一个节点之后.
    const toNode = this.TreeEns?.GetNewEntity;
    if (!toNode) return;
    toNode.No = toNodeNo;
    await toNode.Retrieve();

    fromNode.Idx = toNode.Idx - 1;
    fromNode.ParentNo = toNode.ParentNo; //在同一个级别下.
    await fromNode.Update();

    //  treeEn.ParentNo = toNodeParentNo;
    // await treeEn.Update();
    //获得表
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    const pTable = fromNode._enMap.PhysicsTable; // this.TreeEns?.GetNewEntity._enMap.PhysicsTable;
    const pk = fromNode.PK;
    handler.AddPara('PTable', pTable);
    handler.AddPara('PK', pk);
    handler.AddPara('PKs', itemNos);
    await handler.DoMethodReturnString('TreeEns_UpdatIdx');
    return null;
  }

  //移除Items的数据.
  public RemoveDtlItems(ids: string) {
    if (!ids) return;
    // 实现如何动态的移动行数据?
    return null;
  }
  /**
   * 按钮事件
   * @param btnLab 按钮标签
   * @param treeNodeID 选择的树节点ID
   * @param treeParentNodeID  父节点ID
   * @param itemIDs 选择的行记录IDs,多个用逗号分开，比如:001,002
   * @param treeNodeOrgNo 选择的树节点OrgNo
   */
  public abstract BtnClick(btnLab: string, treeNodeID: string, itemIDs: string, treeNodeOrgNo: Nullable<string>, record: Nullable<RowData>);
  /**
   * 获得表格显示的数据
   * @param treeNodeID 选择的树节点ID.
   * @param treeParentNode 父节点ID
   */
  public async GetDataByTreeNodeID(treeNodeID: string, treeParentNode?: string) {
    const myens = await this.GetDtls(treeNodeID);
    if (myens != null) {
      return myens;
    }
    const ens = this.DtlEns;
    if (!ens || treeParentNode) return [];
    const hasIdxAttr = ens.GetNewEntity.EnMap.attrs.find((attr) => attr.Key === 'Idx');
    if (hasIdxAttr) await ens.Retrieve(this.RefKey, treeNodeID, 'Idx');
    else await ens.Retrieve(this.RefKey, treeNodeID);
    return ens;
  }
  /**
   * 自定义查询、组装数据
   * @param _treeNodeID 部门编号
   */
  public GetDtls(_treeNodeID: string): Promise<Nullable<Recordable>> {
    return Promise.resolve(null);
  }
  /**
   * 用于懒加载Tree
   * @param nodeID 查询子节点
   * @returns 返回数据
   */
  public async GetChildren(nodeID: string) {
    //查询子节点.
    await this.TreeEns?.Retrieve('ParentNo', nodeID);
    return this.TreeEns;
  }
  /**
   * 搜索关键字,全局搜索的时候调用.
   * 搜索后：返回一个结果集合，按照结合进行展示数据.
   */
  // public abstract SearchKeyWord(keyWord: string);

  public async SearchKeyWord(keyWord: string): Promise<unknown> {
    if (!this.DtlEns) {
      return [];
    }
    await this.DtlEns.Init();
    if (keyWord.trim() === '') {
      message.warning('请输入关键字');
      return [];
      // await this.DtlEns.RetrieveAll();
      // return this.DtlEns;
    }
    const dtlEntity = this.DtlEns.GetNewEntity;
    const attrs = dtlEntity._enMap.attrs;
    const refQueryKey: string[] = attrs
      .filter(
        (attr) =>
          (attr.MyFieldType === FieldType.Normal || attr.MyFieldType === FieldType.PK) && attr.MyDataType === DataType.AppString && attr.Key !== 'OrgNo' && !attr.IsDateField,
      )
      .map((attr) => attr.Key);
    await this.DtlEns.RetrieveLikeKey(keyWord, refQueryKey.join(','));
    return this.DtlEns;
  }

  public convertToTreeData(ens: Entities, no: string, name: string, parentNo: string) {
    for (const en of ens) {
      en.Row.SetValByKey('No', en[no]);
      en.Row.SetValByKey('Name', en[name]);
      en.Row.SetValByKey('ParentNo', en[parentNo]);
    }
  }
}
