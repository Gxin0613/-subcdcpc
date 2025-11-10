import { getCookie } from '/@/utils/request/decode';

export enum CCBPMRunModel {
  /// <summary>
  /// 单机版
  /// </summary>
  Single,
  /// <summary>
  /// 集团模式
  /// </summary>
  GroupInc,
  /// <summary>
  /// 多租户模式
  /// </summary>
  SAAS,
}

export class DBType {
  public static readonly MSSQL = 'MSSQL';
  public static readonly MySQL = 'MySQL';
  public static readonly Oracle = 'Oracle';
}

interface DynamicObject {
  [props: string]: any;
}

// . 这里需要在加载后，就要从后台赋值上.
// 从后台获取
export const SystemConfig: DynamicObject = {
  CCBPMRunModel: getCookie('CCBPMRunModel'),
  AppCenterDBType: getCookie('AppCenterDBType'),
  CustomName: getCookie('CustomName'),
  CustomNo: localStorage.getItem('CustomNo') || getCookie('CustomNo'),
};
