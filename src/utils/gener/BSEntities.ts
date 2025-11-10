// 实体
import request from '/@/utils/request';
import { createWhereArgs } from '/@/utils/gener/ParamsUtils';
import { REQUEST_URL } from '/@/config/EnvProperties';
interface RequestParams {
  DoType: 'Entities_DoMethodReturnString' | 'Entities_DoMethodReturnJSON';
  MethodName: string;
  PKVal?: string;
  t: number;
  EnsName?: string;
}

export default class BSEntities {
  [x: string]: any;
  private readonly EnsName: string = '';
  private queryArgs: Array<string> = [];
  private data: Array<any> = [];
  // 初始化实体类
  constructor(EnsName: string, ...args: Array<string>) {
    this.EnsName = EnsName;
    this.queryArgs = args;
  }

  // 设置查询条件
  public async Retrieve(...args: Array<string | any>) {
    /*if (args.length < 2>) {
      throw new Error('查询条件不匹配');
    }*/
    this.queryArgs = args;
    await this.Init();
  }

  public async Init() {
    this.data = await request.post<null, Array<any>>(REQUEST_URL, null, {
      params: {
        DoType: 'Entities_Init',
        EnsName: this.EnsName,
        Paras: createWhereArgs(this.queryArgs),
      },
    });
  }
  private generateFormData(): FormData {
    this.collectProperties();
    const data = JSON.parse(JSON.stringify(this.data));
    delete data.AtPara;
    const keys = Object.keys(data);
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
  public async Delete(...args: Array<string | any>) {
    this.queryArgs = args;
    await request.post<null, Array<any>>(REQUEST_URL, null, {
      params: {
        DoType: 'Entities_Delete',
        EnsName: this.EnsName,
        Paras: createWhereArgs(this.queryArgs),
      },
    });
  }
  // 是否为空数据
  public isEmpty() {
    return this.data.length === 0;
  }

  public getData() {
    return this.data;
  }

  // 执行Entity方法返回String，二者没有任何区别，底层都已经处理好了
  public async DoMethodReturnString(methodName: string, ...params: string[]) {
    return await this.execEntityMethod(methodName, params);
  }

  // 执行Entity方法返回JSON，二者没有任何区别，底层都已经处理好了
  public async DoMethodReturnJSON(methodName: string, ...params: string[]) {
    return await this.execEntityMethod(methodName, params);
  }

  private async execEntityMethod(methodName: string, params: string[] = []) {
    const formData = new FormData();
    if (params.length > 0) {
      formData.append('paras', params.join('~'));
    }
    const requestParams: RequestParams = {
      DoType: 'Entities_DoMethodReturnString',
      MethodName: methodName,
      t: Date.now(),
    };
    if (this.EnsName) {
      requestParams.EnsName = this.EnsName;
    }
    if (this.PKVal) {
      requestParams.PKVal = encodeURIComponent(this.PKVal);
    }
    return await request.post<any, any>(REQUEST_URL, formData, {
      params: requestParams,
    });
  }
}
