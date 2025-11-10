import Event from '../../../../utils/Events';
import request from '/@/utils/request';
import { REQUEST_URL } from '/@/config/EnvProperties';

export default class HttpHandler {
  AddFile(UploadFile: any) {
    throw new Error('Method not implemented.');
  }
  HttpHandlerName = '';
  params: { [propName: string]: any } = {};
  query: { [propName: string]: any } = {};
  formData: FormData = new FormData();
  DoType = 'HttpHandler';

  public setDoType(type: string) {
    this.DoType = type;
  }

  // 构造方法创建
  constructor(handlerName: string) {
    this.HttpHandlerName = handlerName;
  }

  public validate(str: string) {
    if (!str) {
      return false;
    }
    const s = str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    return !(s == '' || s == 'null' || s == 'undefined');
  }

  // 添加参数
  public AddQuery(key: string, val: any) {
    this.query[key] = val;
  }

  // 添加参数
  public AddPara(key: string, val: any) {
    this.params[key] = val;
  }

  // 添加json类型
  public AddJson(json: { [propName: string]: any }) {
    this.params = {
      ...this.params,
      ...json,
    };
  }

  public Clear() {
    this.params = {};
    this.formData = new FormData();
  }

  // 添加url参数
  public AddUrlData(url: string) {
    let queryString = url;
    if (url === null || url === undefined || url == '') {
      queryString = document.location.search.substring(1);
    }
    queryString = decodeURI(queryString);
    for (const data of queryString.split('&')) {
      const [key, val] = data.split('=');
      if (!this.validate(key) || !this.validate(val)) {
        continue;
      }
      if (key == 'DoType' || key == 'DoMethod' || key == 'HttpHandlerName') {
        continue;
      }
      this.AddPara(key, decodeURIComponent(val));
    }
  }

  // todo vue中应该是用不到此方法，历史原因保留
  // 添加formData
  public AddFormData() {
    if (Array.from(document.querySelectorAll('form')).length === 0) {
      Event.emit('showErr', '只有表单可以调用此方法');
      return;
    }
  }

  // 获取url参数, 向外提供？
  public getParams() {
    const params = JSON.parse(JSON.stringify(this.params));
    const keys = Object.keys(params);
    const pArr: string[] = [];
    for (const key of keys) {
      let val = params[key];
      if (val.includes('<script')) {
        val = '';
      }
      pArr.push(`${key}=${val}`);
    }
    return pArr.join('&');
  }

  private paramsToFormData() {
    const params = JSON.parse(JSON.stringify(this.params));
    const keys = Object.keys(params);
    if (keys.length === 0) return null;
    const formData = new FormData();
    for (const key of keys) {
      formData.append(key, `${params[key]}`);
    }
    return formData;
  }

  // 这两个方法其实没有差别，因为已经在axios里面判断过了
  public async DoMethodReturnString(methodName: string) {
    return await request.post<null, string>(REQUEST_URL, this.paramsToFormData(), {
      params: {
        DoType: this.DoType,
        DoMethod: methodName,
        HttpHandlerName: this.HttpHandlerName,
        ...this.query,
        t: Math.random(),
      },
    });
  }

  public async DoMethodReturnJson<T>(methodName: string) {
    return await request.post<null, T>(REQUEST_URL, this.paramsToFormData(), {
      params: {
        DoType: this.DoType,
        DoMethod: methodName,
        HttpHandlerName: this.HttpHandlerName,
        ...this.query,
        t: Math.random(),
      },
    });
  }
}
