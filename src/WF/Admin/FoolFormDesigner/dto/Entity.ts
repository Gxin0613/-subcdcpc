// 实体类
import request from '/@form/utils/Request';
import { createWhereArgs } from '/@form/dto/ParamsUtils';
import { REQUEST_URL } from '/@/config/EnvProperties';
import { cloneDeep } from 'lodash-es';
import { splitAtString } from '/@/bp/tools/ParamUtils';

// 定义Entity实现
interface EntityDefine {
  [key: string]: any;
  setPK: (val: string) => void;
  setVal: (key: string, val: any) => void;
  getVal: (key: string) => any;
  setData: (key: string, val: any) => void;
  getData: (key: string) => any;
  getPara: (key: string) => any;
  setPara: (key: string, val: any) => void;
  Retrieve: (...args: string[]) => void;
  RetrieveFromDBSources: () => void;
  Init: () => void;
  Update: () => void;
  Insert: () => void;
  DoMethodReturnJSON: (methodName: string, params?: string[]) => any;
  DoMethodReturnString: (methodName: string, params?: string[]) => any;
}

// 实现动态获取增改属性
export default class Entity implements EntityDefine {
  // define index signature
  [key: string]: any;
  private readonly EnName: string = '';
  private PKVal = '';
  private queryArgs: Array<string> = [];
  private extraParams: Map<string, any> = new Map<string, any>();
  private data: Record<string, any> = {};

  constructor(EnName: string, PKVal = '') {
    this.EnName = EnName;
    this.PKVal = PKVal;
  }

  public setPK(val: string) {
    this.PKVal = val;
  }

  public setVal(key: string, val: any) {
    this.data[key] = val;
  }

  public getVal(key: string) {
    return this.data[key];
  }

  public setData(data: any) {
    this.data = data;
  }

  // 分解额外参数
  private decodeExtraParams() {
    const { AtPara } = this.data;
    if (!AtPara) return;
    if (AtPara.startsWith('@')) {
      const tempArr = splitAtString(AtPara);
      tempArr.forEach((temp: string) => {
        const [key, val] = temp.split('=');
        this.extraParams.set(key, val);
      });
    }
    // 浅拷贝
    // 暂不实现，数据没有动态更新
    // const keys = Object.keys(remainsObj)
    // for (const key of keys) {
    //     this[key] = this.data[key]
    // }
  }

  // 获取url参数
  private getUrlParams() {
    const params: { [propsName: string]: string } = {};
    if (!!this.EnName) params['EnName'] = this.EnName;
    if (!!this.PKVal) params['PKVal'] = this.PKVal;
    params['t'] = Date.now() + '';
    return params;
  }

  // 将额外参数转为字符串
  private encodeExtraParams(): string {
    let paramsStr = '';
    for (const [key, val] of this.extraParams) {
      paramsStr += `@${key}=${val}`;
    }
    return paramsStr;
  }

  // 获取表单传参 json => FormData
  public generateFormData(): FormData {
    const restFields = cloneDeep(this.data);
    delete restFields.AtPara;
    const keys = Object.keys(restFields);
    const formData = new FormData();
    for (const key of keys) {
      formData.append(key, `${this.data[key]}`);
    }
    formData.append('AtPara', this.encodeExtraParams());
    if (!keys.includes('pkval')) {
      formData.append('pkval', '');
    }
    return formData;
  }

  // 获取实体
  public async Init() {
    try {
      this.data = await request.post<null, any>(REQUEST_URL, null, {
        params: {
          DoType: 'Entity_Init',
          ...this.getUrlParams(),
        },
      });
      this.decodeExtraParams();
    } catch (e: any) {
      console.error(e);
    }
  }

  // 更新数据
  public async Update() {
    await request.post<string>(REQUEST_URL, this.generateFormData(), {
      params: {
        DoType: 'Entity_Update',
        ...this.getUrlParams(),
      },
    });
  }

  public async RetrieveFromDBSources() {
    this.data = await request.post<any, Record<string, any>>(REQUEST_URL, this.generateFormData(), {
      params: {
        DoType: 'Entity_RetrieveFromDBSources',
        ...this.getUrlParams(),
      },
    });
    this.decodeExtraParams();
    return this.data.RetrieveFromDBSources;
  }

  // 按条件查询,会替换掉data
  public async Retrieve(...args: string[]) {
    this.queryArgs = args;
    this.data = await request.post<any, Record<string, any>>(REQUEST_URL, this.generateFormData(), {
      params: {
        DoType: 'Entity_Init',
        ...this.getUrlParams(),
        Paras: createWhereArgs(this.queryArgs),
      },
    });
    this.decodeExtraParams();
  }

  // 新增
  public async Insert() {
    this.data = await request.post<any, Record<string, any>>(REQUEST_URL, this.generateFormData(), {
      params: {
        DoType: 'Entity_Insert',
        ...this.getUrlParams(),
      },
    });
    this.decodeExtraParams();
  }

  // 执行Entity方法返回String，二者没有任何区别，底层都已经处理好了
  public async DoMethodReturnString(methodName: string, params: string[] = []) {
    return await this.execEntityMethod(methodName, params);
  }

  // 执行Entity方法返回JSON，二者没有任何区别，底层都已经处理好了
  public async DoMethodReturnJSON(methodName: string, params: string[] = []) {
    return await this.execEntityMethod(methodName, params);
  }

  private async execEntityMethod(methodName: string, params: string[] = []) {
    const formData = new FormData();
    if (params.length > 0) {
      formData.append('paras', params.join('~'));
    }
    return await request.post<any, any>(REQUEST_URL, formData, {
      params: {
        DoType: 'Entity_DoMethodReturnString',
        EnName: this.EnName,
        PKVal: encodeURIComponent(this.PKVal),
        MethodName: methodName,
        t: Date.now(),
      },
    });
  }

  public getData() {
    return this.data;
  }

  // 获取表单额外参数
  public getPara(key: string) {
    return this.extraParams.get(key);
  }

  // 设置表单额外参数
  public setPara(key: string, val: any) {
    this.extraParams.set(key, val);
  }
}
