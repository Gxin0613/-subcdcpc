import { Row } from './Map/Row';
import { DataType } from '/@/bp/en/DataType';
import { AtPara as AtParaCls } from '/@/bp/da/AtPara';
import { createWhereArgs } from '/@/utils/gener/ParamsUtils';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { Map as EntityMap } from '/@/bp/en/Map/Map';
import BigNumber from 'bignumber.js';
import { Trim } from '/@/utils/gener/StringUtils';
import { message } from 'ant-design-vue';
import { ClassFactory } from '../da/ClassFactory';
import { UAC } from './Map/UAC';
import { FieldType } from './EnumLab';
import { AesEncryption } from '/@/utils/cipher';
import { getAppEnvConfig } from '/@/utils/env';
import { cloneDeep } from 'lodash';
import { WaiGuaBaseEntity } from '../UIEntity/WaiGuaBaseEntity';
import { BaseEntityExt } from '../UIEntity/BaseEntityExt';

const gloMapCache = new Set<string>();

const logicDelConfErr = () => {
  alert('启用逻辑删除，需要配置逻辑删除对应的状态字段，如[ IsDelete, deleted ] 等。');
};

export abstract class Entity {
  [x: string]: any;

  abstract get PK(): string; //重写:主键OID,MyPK,No,NodeID
  abstract get PKVal(): string | number; //重写:主键值,

  public setPKVal(val: any) {
    this.SetValByKey(this.PK, val);
  }

  public DirectCreate = false; //创建时自动插入.

  //protected
  abstract get HisUAC(): UAC;
  //从设置里面获取，如果没有从子类获取. @yln
  public async GenerUAC() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    handler.AddPara('EnName', this.classID);
    handler.AddPara('PKVal', this.PKVal || '');
    const data = await handler.DoMethodReturnString('Entity_UAC');
    const uac = new UAC();
    uac.IsInsert = data['IsInsert'] === 2 ? this.HisUAC.IsInsert : data['IsInsert'] === 1;
    uac.IsUpdate = data['IsUpdate'] === 2 ? this.HisUAC.IsUpdate : data['IsUpdate'] === 1;
    uac.IsDelete = data['IsDelete'] === 2 ? this.HisUAC.IsDelete : data['IsDelete'] === 1;
    uac.IsImp = data['IsImp'] === 2 ? this.HisUAC.IsImp : data['IsImp'] === 1;
    uac.IsExp = data['IsExp'] === 2 ? this.HisUAC.IsExp : data['IsExp'] === 1;
    return uac;
  }

  // 是否空白
  get IsBlank(): boolean {
    return false;
  }
  public readyState = 0;

  // 逻辑删除配置
  get LogicDelConfig() {
    return {
      enable: false,
      key: '',
    };
  }

  // 获取关联的扩展类
  public GetRefExt(): WaiGuaBaseEntity | BaseEntityExt | null {
    return null;
  }

  // 扩展外部参数
  private pageParams: Recordable = {};
  public GetAllPageParam() {
    return this.pageParams;
  }
  public GetPageParam(key: string) {
    return this.pageParams[key];
  }
  public SetPageParamByKey(key: string, val: any) {
    this.pageParams[key] = val;
  }
  public SetPageParam(pageParams) {
    this.pageParams = pageParams;
    const keys = Object.keys(pageParams);
    for (const k of keys) {
      if (this.Row.has(k)) this.Row.set(k, pageParams[k]);
    }
  }
  // end

  public classID = ''; //当前实体类.
  public RefEnName = ''; //关联的.
  protected constructor(clsId: string, refEnName?: string) {
    if (clsId) this.classID = clsId.trim();
    if (refEnName) this.RefEnName = refEnName;
    return new Proxy(this, {
      set: (target: Entity, key: string | symbol, value: any, receiver: any) => {
        // 禁止修改row为非Row对象
        if (typeof key === 'string' && key.toLowerCase() === 'row' && !(value instanceof Row)) {
          const err = new Error('请规范编码，row属性只能被赋值为Row对象, 请打开控制台查看调用路径');
          console.error(err.stack);
          throw err;
        }
        // 禁止覆盖原有的方法
        if (typeof key === 'string' && typeof target[key] === 'function') {
          const err = new Error('禁止修改实体类原型方法，请规范编码，控制台可查看调用路径');
          console.error(err.stack);
          throw err;
        }
        if (typeof key === 'string' && target.Row.has(key)) {
          target.SetValByKey(key, value);
          return true;
        }
        return Reflect.set(target, key, value, receiver);
      },
      get: (target: Entity, key: string, receiver: any) => {
        const rowVal = target.Row.get(key);
        if (rowVal !== undefined && rowVal !== '' && rowVal !== null) return rowVal;
        const reflectVal = Reflect.get(target, key, receiver);
        if (reflectVal !== undefined && reflectVal != null && reflectVal !== '') return reflectVal;
        return rowVal;
      },
    });
  }

  /**
   * 初始化函数.
   * 是否更新缓存的map.
   * @returns
   */
  protected async SyncMap(): Promise<void> {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    handler.AddPara('ClassID', this.classID);
    this._enMap.EnClassID = this.classID;
    const { VITE_GLOB_ENCRYPTION_KEY, VITE_GLOB_VERSION_CODE } = getAppEnvConfig();
    const encryption = new AesEncryption({ key: VITE_GLOB_ENCRYPTION_KEY });
    this._enMap.ParaFields = Trim(this._enMap.ParaFields);
    const _backend_map = cloneDeep(this._enMap) as Recordable;
    delete _backend_map._validator;
    delete _backend_map.enMapExts;
    delete _backend_map.loaders;
    const str = encodeURIComponent(JSON.stringify(_backend_map));
    handler.AddPara('Map', encryption.encryptByAES(str));
    handler.AddPara('VersionCode', VITE_GLOB_VERSION_CODE);
    await handler.DoMethodReturnString('Entity_SetMap');
  }

  private _sub_dtls: string[] | null = null;
  private getSubDtls() {
    if (!this._sub_dtls)
      this._sub_dtls = this._enMap.rms
        .filter((rm) => rm.RefMethodType === 6)
        .map((rm) => rm.RefDtlClsID)
        .filter((item) => !!item);
    return this._sub_dtls;
  }
  public async Init() {
    if (gloMapCache.has(this.classID)) return;
    const subFKEns = this._enMap.attrs.filter((attr) => attr.MyFieldType == FieldType.FK && !!attr.HisFKEns).map((attr) => attr.HisFKEns);
    const subDtls = this.getSubDtls();
    const subEntities = [...subDtls, ...subFKEns];
    for (const subEntity of subEntities) {
      if (!subEntity) continue;
      if (gloMapCache.has(subEntity)) continue;
      const entity = await ClassFactory.GetEn(subEntity);
      await entity.Init();
      gloMapCache.add(subEntity);
    }
    await this.SyncMap();
    gloMapCache.add(this.classID);
  }

  // 强制更新map缓存
  public async UpdateMapCache() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    handler.AddPara('ClassID', this.classID);
    handler.AddPara('Map', JSON.stringify(this._enMap));
    await handler.DoMethodReturnString('Entity_SetMap');
  }

  private _tmpEnMap: EntityMap | null = null;

  get _enMap() {
    if (!this._tmpEnMap) {
      // js 对象转 map
      this._tmpEnMap = this.EnMap;
      this._tmpEnMap.EnClassID = this.classID;
    }
    return this._tmpEnMap;
  }

  set _enMap(value: EntityMap) {
    this._tmpEnMap = value;
    this._tmpEnMap.EnClassID = this.classID; //设置它的classID.
    const { enable, key } = this.LogicDelConfig;
    if (!enable) return;
    if (!key) {
      logicDelConfErr();
      return;
    }
    this._tmpEnMap.AddTBInt(this.LogicDelConfig.key, 0, '逻辑删除key', false, true, false, '逻辑删除key');
  }

  abstract get EnMap(): EntityMap;

  private _row: Row | null = null;

  get Row() {
    if (this._row == null) {
      this._row = new Row();
      this._row.LoadAttrs(this._enMap.attrs);
    }
    return this._row;
  }

  set Row(value: Row) {
    this._row = value;
    // this.mountProperty();
  }

  public GetValByKey(attrKey: string) {
    return this.Row.GetValByKey(attrKey);
  }

  // 直接查询数据库
  /**
   * 从数据库里查询
   * @returns 返回查询的条数.
   */
  public async RetrieveFromDBSources() {
    await this.Init();
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    handler.AddPara('ClassID', this.classID);
    handler.AddPara('RefEnName', this.RefEnName); //服务端的entity.
    handler.AddPara('PK', this.PK);
    handler.AddPara('PKVal', this.PKVal);
    // handler.AddPara("Map", JSON.stringify(this._enMap));
    const data = await handler.DoMethodReturnJson<any>('Entity_RetrieveFromDBSources');
    if (data == '0') return 0;
    this.UpdateRow(data);
    return 1;
  }

  /**
   * 直接调用更新，不调用 beforeUpdate(), 等重写事件.
   * @returns 返回影响行数，更新不成功返回0.
   */
  public async DirectUpdate() {
    await this.Init();
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    handler.AddPara('ClassID', this.classID);
    handler.AddPara('RefEnName', this.RefEnName); //服务端的entity.
    handler.AddPara('PK', this.PK);
    handler.AddPara('PKVal', this.PKVal);
    handler.AddPara('Row', encodeURIComponent(JSON.stringify(Object.fromEntries(this.Row))));
    // handler.AddPara("Map", JSON.stringify(this._enMap));
    return await handler.DoMethodReturnString('Entity_Update');
  }
  public async InsertAsNew() {
    return await this.Insert();
  }
  /**
   * 执行更新.
   * @returns 返回影响行数, return 0 没有执行成功.
   */
  public async Insert() {
    // this.collectProperties();
    await this.Init();
    // 插入前检查失败
    if (!(await this.beforeInsert())) return false;
    if (!(await this.beforeUpdateInsertAction())) return false;
    const response = await this.DirectInsert();
    if (response === '1') {
      await this.afterInsert();
    }
    return response;
  }

  /** 实体插入 */
  protected async beforeInsert() {
    return true;
  }

  protected async afterInsert() {
    return true;
  }

  public async DirectInsert() {
    await this.Init();
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    handler.AddPara('ClassID', this.classID);
    handler.AddPara('RefEnName', this.RefEnName); //服务端的entity.
    handler.AddPara('PK', this.PK);
    handler.AddPara('PKVal', this.PKVal);
    handler.AddPara('Row', encodeURIComponent(JSON.stringify(Object.fromEntries(this.Row))));
    // handler.AddPara("Map",  this._enMap.ToJson());
    //超级管理员避免重复
    if (Object.fromEntries(this.Row).No == 'ccs') {
      return '1';
    }
    const data = await handler.DoMethodReturnJson<Record<string, any>>('Entity_Insert');
    const keys = Object.keys(data);
    for (const key of keys) {
      this.SetValByKey(key, data[key]);
    }
    return '1';
  }

  /**
   * 保存数据：如果更新不到，就执行insert.
   * @returns 返回影响的行数.
   */
  public async Save() {
    await this.Init();
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    handler.AddPara('ClassID', this.classID);
    handler.AddPara('RefEnName', this.RefEnName); //服务端的entity.
    handler.AddPara('PK', this.PK);
    handler.AddPara('PKVal', this.PKVal);
    if (!this.PKVal) await this.beforeInsert();
    handler.AddPara('Row', encodeURIComponent(JSON.stringify(Object.fromEntries(this.Row))));
    const data = await handler.DoMethodReturnJson<Record<string, any>>('Entity_Save');
    const keys = Object.keys(data);
    for (const key of keys) {
      this.SetValByKey(key, data[key]);
    }
    return '1';
  }

  /** 实体更新 */
  protected async beforeUpdate() {
    //不允许修改.
    if (this.GetParaInt('EditType') == 1) {
      message.info('记录不允许修改');
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  }

  protected async afterUpdate() {
    return Promise.resolve(true);
  }

  public async Update() {
    await this.Init();
    // this.collectProperties();
    if (!(await this.beforeUpdate())) return -1;
    if (!(await this.beforeUpdateInsertAction())) return -1;
    const data = await this.DirectUpdate();
    if (typeof data === 'string' && data.includes('err@')) {
      message.error(data.replace('err@', ''));
      return -1;
    }
    if (parseInt(data) == 1) await this.afterUpdate();
    return data;
  }

  /** end */

  protected async beforeUpdateInsertAction() {
    // todo 需要实现接口调用
    return Promise.resolve(true);
  }

  public async IsExits() {
    await this.Init();
    if (!this.PKVal) {
      alert('没有给主键赋值，不能执行判断.' + this.classID);
      return false;
      //throw new Error('没有给主键赋值，不能执行判断.');
    }
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    handler.AddPara('ClassID', this.classID);
    handler.AddPara('RefEnName', this.RefEnName); //服务端的entity.
    handler.AddPara('PK', this.PK);
    handler.AddPara('PKVal', this.PKVal);
    const val = await handler.DoMethodReturnString('Entity_IsExits');
    return val == '1';
  }

  public async GenerSQLAttrDB(attrKey: string, row?: Recordable) {
    await this.Init();
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    handler.AddPara('ClassID', this.classID);
    handler.AddPara('PK', this.PK);
    handler.AddPara('AttrKey', attrKey);
    const innerRow = Object.fromEntries(this.Row) || row;
    for (const key in row) {
      if (innerRow.hasOwnProperty(key) == true && !innerRow[key]) innerRow[key] = row[key];
      if (innerRow.hasOwnProperty(key) == false) innerRow[key] = row[key];
    }
    handler.AddPara('Row', JSON.stringify(innerRow));
    return await handler.DoMethodReturnJson('Entity_GenerSQLAttrDB');
  }

  /** 实体删除 */
  protected async beforeDelete() {
    //系统参数是否可编辑.
    const eType = this.GetParaInt('EditType');
    if (eType == 1 || eType == 2) {
      message.info('记录不允许删除.');
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  }

  protected async afterDelete() {
    return Promise.resolve(true);
  }

  public async Delete() {
    await this.Init();
    if (!(await this.beforeDelete())) {
      return 0;
    }
    const data = await this.DirectDelete();
    if (data == 1) {
      await this.afterDelete();
      return 1;
    }
    return data; // parseInt(data);
  }
  public async DirectDelete() {
    const { enable, key } = this.LogicDelConfig;
    if (enable && !key) {
      logicDelConfErr();
      return 0;
    }
    if (enable && key) {
      this.SetValByKey(this.LogicDelConfig.key, 1);
      await this.DirectUpdate();
      return 1;
    }
    await this.Init();
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    handler.AddPara('ClassID', this.classID);
    handler.AddPara('RefEnName', this.RefEnName); //服务端的entity.
    handler.AddPara('PK', this.PK);
    handler.AddPara('PKVal', this.PKVal);
    const num = await handler.DoMethodReturnString('Entity_Delete');
    return parseInt(num);
  }

  get atPara() {
    const atParaStr = this.GetValStringByKey('AtPara') || '';
    return new AtParaCls(atParaStr);
  }

  // 从返回数据处理Row，主要是针对富文本的情况
  private UpdateRow(data: string | Recordable) {
    const row = new Row();
    if (typeof data === 'string' && (decodeURIComponent(data).includes('<') || decodeURIComponent(data).includes('\\'))) {
      const splitArgs = data.substring(1, data.length - 1).split(',');
      for (const args of splitArgs) {
        const symbolIdx = args.indexOf(':');
        const key = args.substring(1, symbolIdx - 1);
        const val = args.substring(symbolIdx + 2, args.length - 1);
        row.SetValByKey(
          key,
          val
            .replace(/\\n/g, '')
            .replace(/\\\//g, '/')
            .replace(/\\\\\\\\\"/g, ''),
        );
      }
    } else {
      const keys = Object.keys(data);
      for (const key of keys) {
        row.SetValByKey(key, data[key]);
      }
    }
    this.Row = row;
  }

  /**
   * 复制Json.
   */
  public CopyJson(json: string) {
    try {
      const obj = JSON.parse(json);
      delete obj[this.PK];
      const keys = Object.keys(obj);
      for (const key of keys) {
        this.Row.SetValByKey(key, obj[key]);
      }
    } catch (e: any) {
      console.error('Copy JSON Error:' + e.toString());
    }
  }

  public CopyFromEntity(en: Entity) {
    const row = en.Row;
    for (const [k, v] of row) {
      if (k === this.PK) continue;
      this.SetValByKey(k, v);
    }
  }

  public Copy(json) {
    try {
      const obj = JSON.parse(json);
      delete obj[this.PK];
      const keys = Object.keys(obj);
      for (const key of keys) {
        this.Row.SetValByKey(key, obj[key]);
      }
    } catch (e: any) {
      console.error('Copy JSON Error:' + e.toString());
    }
  }

  // 会经过后端的缓存里面取出数据
  public async Retrieve(...args: string[]) {
    await this.Init();
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    handler.AddPara('ClassID', this.classID);
    handler.AddPara('RefEnName', this.RefEnName); //服务端的entity.
    handler.AddPara('PK', this.PK);
    handler.AddPara('PKVal', this.PKVal);
    // 如果传入了查询条件
    if (args.length > 0) {
      handler.AddPara('Paras', createWhereArgs(args));
    }
    const data = await handler.DoMethodReturnJson<any>('Entity_Retrieve');
    if (data == null) return 0;
    this.UpdateRow(data);
    return 1;
  }

  // 从额外参数获取字符串
  public GetParaString(key: string, isNullAsVal = ''): string {
    const str = this.atPara.GetValStrByKey(key);
    return DataType.IsNullOrEmpty(str) ? isNullAsVal : str;
  }

  public GetParaInt(key: string, isNullAsVal = 0) {
    return this.atPara.GetValIntByKey(key, isNullAsVal);
  }

  public GetParaFloat(key: string, isNullAsVal = 0): number {
    return this.atPara.GetValFloatByKey(key, isNullAsVal);
  }

  public GetParaBoolean(key: string, IsNullAsVal?: boolean): boolean {
    return this.atPara.GetValBooleanByKey(key, IsNullAsVal);
  }

  public GetValStringByKey(attrKey: string): string {
    if (this.Row == null) throw new Error('@没有初始化Row.');
    try {
      return this.Row.get(attrKey);
    } catch (ex: any) {
      if (!this.Row.has(attrKey)) throw new Error('@获取值期间出现如下异常：' + ex + '  ' + attrKey + ' 您没有在类【' + JSON.stringify(this) + '】增加这个属性.');
      const val = JSON.stringify(this.Row[attrKey]);
      return val || '';
    }
  }

  public GetValIntByKey(attrKey: string) {
    return parseInt(this.GetValStringByKey(attrKey));
  }

  public GetValFloatByKey(attrKey: string) {
    return parseFloat(this.GetValStringByKey(attrKey));
  }

  public GetValDecimalByKey(attrKey: string) {
    return new BigNumber(this.GetValStringByKey(attrKey));
  }

  public GetValBooleanByKey(attrKey: string) {
    return this.GetValStringByKey(attrKey) == '1';
  }
  public SetValByKey(key: string, val: unknown) {
    if (this._enMap.ParaFields.includes(key)) {
      this.SetPara(key, val);
    }
    this.Row.set(key, val);
    // return;
    // if (typeof val === 'boolean') {
    //   this.Row.set(key, val ? 1 : 0);
    // } else {
    //   this.Row.set(key, val);
    // }
  }

  public DelPara(key: string) {
    const atParaStr = this.GetValStringByKey('AtPara');
    if (!atParaStr.includes('@' + key + '=')) {
      return;
    }
    // 存在就更新atPara的数据
    const atParaObj = new AtParaCls(atParaStr);
    atParaObj.DelKey(key);
    this.SetValByKey('AtPara', atParaObj.GenerAtParaStrs());
  }

  public SetPara(key: string, obj: any) {
    const item = this.EnMap.GetAttrByKey('AtPara');
    let atParaStr = this.GetValStringByKey('AtPara') || '';
    if (item == null) {
      console.log(item);
      throw new Error(`类[${this.classID}] 没有声明AtPara 字段`);
    }
    if (!atParaStr.includes('@' + key + '=')) {
      atParaStr += '@' + key + '=' + obj;
      this.SetValByKey('AtPara', atParaStr);
      return;
    }
    // 存在就更新atPara的数据
    const atParaObj = new AtParaCls(atParaStr);
    atParaObj.SetVal(key, obj);
    this.SetValByKey('AtPara', atParaObj.GenerAtParaStrs());
  }
}
