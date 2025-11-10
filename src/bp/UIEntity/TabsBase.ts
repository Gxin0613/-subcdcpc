import { GloComm } from '/@/WF/Comm/GloComm';
import { getRequestParams } from '/@/utils/request/decode';
import { Raw, Component } from 'vue';

type UrlType = 'iframe' | 'vue';
let serialNo = 0;
export class TabInfo {
  public title: string;
  public icon: string;
  public url: string;
  public urlType: UrlType;
  public key: string;
  public params: Recordable = {};
  public comp: Raw<Component> | null = null;
  constructor(title: string, icon: string, url: string, urlType: UrlType = 'vue') {
    serialNo++;
    this.title = title;
    this.icon = icon;
    this.url = url;
    this.urlType = urlType;
    this.key = 'tab_key_' + serialNo;
  }
}
//标签页
export abstract class TabsBase {
  public PageTitle: string | null = ''; //页面标题.
  public ClassID?: string; //实体类ID比如: TreeEn_XXXX.
  public tabList: TabInfo[] = [];

  abstract Init();
  /**
   * 获得外部的参数
   * @param key 参数key
   * @returns
   */
  public RequestVal(key: string) {
    return getRequestParams(key);
  }

  public AddSelfUrl(_title: string, _icon: string, _url: string, _urlType: UrlType = 'vue') {
    this.tabList.push(new TabInfo(_title, _icon, _url, _urlType));
  }
  public AddSearch(title: string, icon: string, enName: string, paras: string) {
    const url = GloComm.UrlMobileSearch(enName, paras);
    this.AddSelfUrl(title, icon, url, 'vue');
  }
  public AddGL(_title: string, icon: string, enName: string, paras: string) {
    const url = GloComm.UrlGenerList(enName, paras);
    this.AddSelfUrl(_title, icon, url, 'vue');
  }
  /**
   * @param clsId 类名
   */
  protected constructor(clsId: string) {
    this.ClassID = clsId;
  }
}
