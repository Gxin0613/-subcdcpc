import { Row } from './Map/Row';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { Entity } from './Entity';
import { createWhereArgs } from '/@/utils/gener/ParamsUtils';
import { message } from 'ant-design-vue';

type CustomEvent = {
  label: string;
  onClick: Function;
};

export abstract class Entities extends Array<Entity> {
  [x: string]: any;
  constructor() {
    super();
  }

  public OrderBy = '';

  // 集合方法
  public enActions: Array<CustomEvent> = [];
  /** 实体插入 */
  protected async setEnActions() {}

  readyState = 0;
  /**
   * 初始化函数.
   * @returns
   * @param _updateMap
   */
  public async Init(_updateMap = false) {
    const entity = this.GetNewEntity;
    if (!entity) return;
    await entity.Init();
    await this.setEnActions();
  }

  protected async BeforeSave() {
    return true;
  }

  protected async AfterSave() {
    return true;
  }
  protected async SaveToDB() {
    for (const _en of this) {
      await _en.Save();
    }
    return true;
  }
  protected async Save() {
    if (!(await this.BeforeSave())) return false;
    if (!(await this.SaveToDB())) return false;
    if (!(await this.AfterSave())) return false;
    return true;
  }

  // 获取对应的实体类型
  abstract get GetNewEntity(): Entity;
  /**
   * 只传一个orderby
   * @param args
   * @returns
   */
  public async RetrieveAllFromDBSource(orderby = '') {
    await this.Init();
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    handler.AddPara('ClassID', this.GetNewEntity.classID);
    handler.AddPara('PK', this.GetNewEntity.PK);
    handler.AddPara('OrderBy', this.OrderBy || orderby);
    // 数据
    const rows = await handler.DoMethodReturnJson<Array<Row>>('Entities_RetrieveAllFromDBSource');
    // 实体集合
    this.splice(0, this.length);
    for (const row of rows) {
      const entity = this.GetNewEntity;
      entity.Row = new Row(row);
      this.push(entity);
    }
    return this.length;
  }

  /**
   * 只传一个orderby
   * @param args
   * @returns
   */
  public async RetrieveAll(orderby = '') {
    await this.Init();
    const entity = this.GetNewEntity;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    handler.AddPara('ClassID', entity.classID);
    handler.AddPara('OrderBy', orderby);
    handler.AddPara('PK', entity.PK);
    try {
      const rows = await handler.DoMethodReturnJson<Array<Row>>('Entities_RetrieveAll');
      // json
      // 实体集合
      this.splice(0, this.length);
      for (const row of rows) {
        const entity = this.GetNewEntity;
        entity.Row = new Row(row);
        this.push(entity);
      }
      return this.length;
    } catch (e) {
      const errMsg = e as string;
      if (errMsg === 'err@没有找到 ' + entity.classID + ' 的map。') {
        await entity.Init();
        await this.RetrieveAll(orderby);
        return;
      }
      throw new Error(e);
    }
  }

  public async RetrieveByPage(page: number, pageSize: number, keyword = '', seachAttrs: string[] = [], orderBy = '') {
    await this.Init();
    const entity = this.GetNewEntity;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    handler.AddPara('ClassID', entity.classID);
    handler.AddPara('Keyword', keyword);
    handler.AddPara('SearchAttrs', seachAttrs);
    handler.AddPara('PageIndex', page);
    handler.AddPara('PageSize', pageSize);
    handler.AddPara('OrderBy', orderBy);
    handler.AddPara('PK', entity.PK);
    return await handler.DoMethodReturnJson<Recordable>('RetrieveLikeByPageWithInfo');
  }

  /**
   * 集合查询,格式1: Retrieve("FK_Dept","001"), 格式2:Retrieve("FK_Dept","001","Idx"),
   * 格式3: Retrieve("FK_Dept","001","XB",1) 格式4: Retrieve("FK_Dept","001","XB",1,"Idx")
   * @param args 查询参数
   * @returns 查询的结果.
   */
  public async Retrieve(...args: any[]) {
    await this.Init();
    const entity = this.GetNewEntity;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    const { enable, key } = entity.LogicDelConfig;
    if (enable && key) {
      args = [key, 0, ...args];
    }
    handler.AddPara('ClassID', entity.classID);
    handler.AddPara('Paras', createWhereArgs(args));
    handler.AddPara('PK', entity.PK);
    const rows = await handler.DoMethodReturnJson<Array<Row>>('Entities_Retrieve');
    // 实体集合
    this.splice(0, this.length);
    for (const row of rows) {
      const entity = this.GetNewEntity;
      entity.Row = new Row(row);
      this.push(entity);
    }
    return this.length;
  }

  public async RetrieveIn(key: string, vals: string) {
    await this.Init();
    const entity = this.GetNewEntity;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    handler.AddPara('ClassID', entity.classID);
    handler.AddPara('PK', entity.PK);
    handler.AddPara('Key', key);
    handler.AddPara('Vals', vals);
    const rows = await handler.DoMethodReturnJson<Array<Row>>('Entities_RetrieveIn');
    // 实体集合
    this.splice(0, this.length);
    for (const row of rows) {
      const entity = this.GetNewEntity;
      entity.Row = new Row(row);
      this.push(entity);
    }
    return this.length;
  }
  public async RetrieveOR(key: string, val: string, key1: string, val1: string, orderBy = '') {
    await this.Init();
    const entity = this.GetNewEntity;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    handler.AddPara('ClassID', entity.classID);
    handler.AddPara('PK', entity.PK);
    handler.AddPara('Key', key);
    handler.AddPara('Val', val);
    handler.AddPara('key1', key1);
    handler.AddPara('val1', val1);
    handler.AddPara('OrderBy', orderBy);
    const rows = await handler.DoMethodReturnJson<Array<Row>>('Entities_RetrieveOR');
    // 实体集合
    this.splice(0, this.length);
    for (const row of rows) {
      const entity = this.GetNewEntity;
      entity.Row = new Row(row);
      this.push(entity);
    }
    return this.length;
  }

  /**
   * 关键字查询
   * @param searchKey 搜索的关键字, 比如: '张'
   * @param attrsScop 搜索的字段范围,比如:Name,Tel,Email
   * @param condAttr  搜索的过滤条件,比如: FK_Dept
   * @param condVal 过滤条件值,比如:001
   * @param orderBy 排序属性,比如: Idx
   * @returns
   */
  public async RetrieveLikeKey(searchKey: string, attrsScop: string, condAttr: string | null = '', condVal: any | null = '', orderBy: string | null = '') {
    await this.Init();
    if (searchKey === '' || searchKey == null) {
      alert('请输入关键字');
      return;
    }

    const entity = this.GetNewEntity;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    handler.AddPara('ClassID', entity.classID);
    handler.AddPara('PK', entity.PK);

    handler.AddPara('SearchKey', searchKey);
    handler.AddPara('AttrsScop', attrsScop);

    handler.AddPara('CondAttr', condAttr);
    handler.AddPara('CondVal', condVal);
    handler.AddPara('OrderBy', orderBy);

    const rows = await handler.DoMethodReturnJson<Array<Row>>('Entities_RetrieveLikeKey');
    // 实体集合
    this.splice(0, this.length);

    for (const row of rows) {
      const row1 = new Row();
      const keys = Object.keys(row);
      for (const key of keys) {
        if (!row1.has(key)) {
          row1.SetValByKey(key, row[key]);
        }
      }
      const entity = this.GetNewEntity;
      entity.Row = row1;
      this.push(entity);
      // const entity = this.GetNewEntity
      // entity.Row = row
      // this.push(entity)
    }
    return this.length;
  }

  public async DeleteByIdList(idList: string, reverse: 0 | 1 = 0) {
    const entity = this.GetNewEntity;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    handler.AddPara('ClassID', entity.classID);
    handler.AddPara('idList', idList);
    handler.AddPara('reverse', reverse);
    const data = await handler.DoMethodReturnString('Entities_DeleteByIdList');
    if (typeof data === 'string' && data.includes('err@')) message.error(data.replace('err@', ''));
  }

  public async Delete(...args: any[]) {
    if (args.length == 0) {
      message.error('delete 必须带参数,否则表数据全部删除,需优化');
      return;
    }
    await this.Init();
    const entity = this.GetNewEntity;
    const { enable, key } = entity.LogicDelConfig;
    if (enable && key) {
      args = [key, 0, ...args];
    }
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    handler.AddPara('ClassID', entity.classID);
    handler.AddPara('Paras', createWhereArgs(args));
    const data = await handler.DoMethodReturnString('Entities_Delete');
    if (typeof data === 'string' && data.includes('err@')) message.error(data.replace('err@', ''));
  }

  public toJSONString() {
    try {
      return JSON.stringify(
        this.map((en) => {
          return Object.fromEntries(en.Row);
        }),
      );
    } catch (error) {
      console.error('Entities toJSONString error:', error);
      return '';
    }
  }
}
