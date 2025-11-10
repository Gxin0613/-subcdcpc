// 实体

import request from '../utils/Request';
import { createWhereArgs } from '/@form/dto/ParamsUtils';
import { REQUEST_URL } from '/@/config/EnvProperties';

export default class Entities {
  private readonly EnsName: string = '';
  private queryArgs: Array<string> = [];
  private data: Array<any> = [];
  // 初始化实体类
  constructor(EnsName: string, ...args: Array<string>) {
    // super();
    this.EnsName = EnsName;
    this.queryArgs = args;
  }

  // 设置查询条件
  public async Retrieve(...args: Array<string>) {
    if (args.length % 2 === 1) {
      throw new Error('查询条件不匹配');
    }
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
    // for (const argument of this.data) {
    //   this.push(argument)
    // }
    // console.log(this)
  }

  // 是否为空数据
  public isEmpty() {
    return this.data.length === 0;
  }

  public getData() {
    return this.data;
  }
}
