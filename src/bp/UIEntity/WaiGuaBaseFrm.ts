import { getRequestParams } from '/@/utils/request/decode';
import { MapData } from '/@/WF/Admin/FrmLogic/MapData';
//基类
export abstract class WaiGuaBaseFrm {
  public EnityID?: string;
  public FrmID?: string; //表单ID.
  public OID?: number | string; //数据主键OID
  //表单主表数据,全局可以访问
  public FrmBodyJson: Record<string, any> = {};
  public MapAttrs: Record<string, any>[] = [];
  public Groups: Record<string, any>[] = [];
  public mapData: MapData = null;
  public params: Record<string, any> = {};
  /**
   * 获得外部的参数
   * @param key 参数key
   * @returns
   */
  public RequestVal(key: string) {
    return this.params[key] || getRequestParams(key);
  }

  public SetFrmBodyJson(frmBodyJson: Record<string, any>) {
    this.FrmBodyJson = frmBodyJson;
  }
  /**
   * @param frmID 类名
   */
  protected constructor(frmID: string) {
    this.EnityID = frmID;
  }
  public async FrmLoadBefore(): Promise<string | null> {
    return null;
  }
  public async FrmLoadAfter(): Promise<string | null> {
    return null;
  }

  public async FrmBodyItemChange(_attrKey: string, _selectVal: string): Promise<string | null> {
    return null;
  }
  public async FrmBodyTextBoxBlur(_attrKey: string, _Val: string): Promise<string | null> {
    return null;
  }

  public async FrmBodyBtnClick(_attrKey: string, _Val: string): Promise<string | null> {
    return null;
  }

  public SetTextBoxVal(attrKey: string, val: string) {
    if (this.FrmBodyJson != null) this.FrmBodyJson[attrKey] = val;
  }
  public GetTextBoxVal(attrKey: string) {
    if (this.FrmBodyJson == null) return null;
    const val = this.FrmBodyJson[attrKey];
    return val;
  }

  public async FrmAthUploadBefore(_athID: string): Promise<string | null> {
    return null;
  }

  public async FrmDtlBtnClick(_dtlID: string, _attrKey: string, _Val: string): Promise<string | null> {
    return null;
  }

  public async FrmDtlBtnRowClick(_dtlID: string, _attrKey: string, _Val: string): Promise<string | null> {
    return null;
  }

  public async FrmDtlItemChange(_dtlID: string, _attrKey: string, _selectVal: string): Promise<string | null> {
    return null;
  }
  public async FrmDtlTextBoxBlur(_dtlID: string, _attrKey: string, _Val: string): Promise<string | null> {
    return null;
  }

  public async FrmDtlTextBoxChange(_dtlID: string, _attrKey: string, _Val: string): Promise<string | null> {
    return null;
  }

  public SetTextBoxValDtl(_dtlID: string, attrKey: string, val: string) {
    if (this.FrmBodyJson != null) this.FrmBodyJson[attrKey] = val;
  }
  public GetTextBoxValDtl(_dtlID: string, attrKey: string) {
    if (this.FrmBodyJson == null) return null;
    const val = this.FrmBodyJson[attrKey];
    return val;
  }

  public async SaveBefore(_mainData?: Record<string, any>): Promise<string | true> {
    return true;
  }
  public async SaveAfter(_mainData?: Record<string, any>): Promise<string | true> {
    return true;
  }
  public async DeleteBefore() {
    return true;
  }
  public async DeleteAfter() {
    return true;
  }
}
