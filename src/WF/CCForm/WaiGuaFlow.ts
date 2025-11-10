import { WaiGuaBaseFlow } from '/@/bp/UIEntity/WaiGuaBaseFlow';
import { message } from 'ant-design-vue';

export class WaiGuaFlow {
  public _en: WaiGuaBaseFlow;
  public constructor(en) {
    this._en = en;
  }
  public async SaveBefore() {
     const result = await this._en.SaveBefore();
    if (!!result) {
      if (result.toString().startsWith('err@')) {
        message.error(result);
        return false;
      }
      if (result.toString().trim().startsWith('####')) {
        return '@preview' + result;
      }
    }
    return true;
  }
  public async SaveAfter() {
     const result = await this._en.SaveAfter();
    if (!!result) {
      if (result.toString().startsWith('err@')) {
        message.error(result);
        return false;
      }
      if (result.toString().trim().startsWith('####')) {
        return '@preview' + result;
      }
    }
    return true;
  }
  /**
   * 发送前
   * @constructor
   */
  public async SendWhen() {
    const result = await this._en.SendWhen();
    if (!!result) {
      if (result.startsWith('err@')) {
        message.error(result);
        return false;
      }
      if (result.trim().startsWith('####')) {
        return '@preview' + result;
      }
    }
    return true;
  }
  /**
   * 发送报错的处理
   * @constructor
   */
  public async SendError() {
    const result = await this._en.SendError();
    if (!!result) {
      if (result.startsWith('err@')) {
        message.error(result);
        return false;
      }
      if (result.trim().startsWith('####')) {
        return '@preview' + result;
      }
    }
    return true;
  }
  /**
   * 发送成功的时候
   * @constructor
   */
  public async SendSuccess() {
    const result = await this._en.SendSuccess();
    if (!!result) {
      if (result.startsWith('err@')) {
        message.error(result);
        return false;
      }
      if (result.trim().startsWith('####')) {
        return '@preview' + result;
      }
    }
    return true;
  }
  /**
   * 流程结束时候
   * @constructor
   */
  public async FlowOverAfter() {
    const result = await this._en.FlowOverAfter();
    if (!!result) {
      if (result.startsWith('err@')) {
        message.error(result);
        return false;
      }
      if (result.trim().startsWith('####')) {
        return '@preview' + result;
      }
    }
    return true;
  }
  /**
   * 流程删除前
   * @constructor
   */
  public async BeforeFlowDel() {
    const result = await this._en.BeforeFlowDel();
    if (!!result) {
      if (result.startsWith('err@')) {
        message.error(result);
        return false;
      }
      if (result.trim().startsWith('####')) {
        return '@preview' + result;
      }
    }
    return true;
  }
  /**
   * 流程删除后
   * @constructor
   */
  public async AfterFlowDel() {
    const result = await this._en.AfterFlowDel();
    if (!!result) {
      if (result.startsWith('err@')) {
        message.error(result);
        return false;
      }
      if (result.trim().startsWith('####')) {
        return '@preview' + result;
      }
    }
    return true;
  }
  /**
   * 退回前
   * @constructor
   */
  public async ReturnBefore() {
    const result = await this._en.ReturnBefore();
    if (!!result) {
      if (result.startsWith('err@')) {
        message.error(result);
        return false;
      }
      if (result.trim().startsWith('####')) {
        return '@preview' + result;
      }
    }
    return true;
  }
  /**
   * 退回后
   * @constructor
   */
  public async ReturnAfter() {
    const result = await this._en.ReturnAfter();
    if (!!result) {
      if (result.startsWith('err@')) {
        message.error(result);
        return false;
      }
      if (result.trim().startsWith('####')) {
        return '@preview' + result;
      }
    }
    return true;
  }
  /**
   * 撤销前
   * @constructor
   */
  public async UndoneBefore() {
    const result = await this._en.UndoneBefore();
    if (!!result) {
      if (result.startsWith('err@')) {
        message.error(result);
        return false;
      }
      if (result.trim().startsWith('####')) {
        return '@preview' + result;
      }
    }
    return true;
  }
  /**
   * 撤销后
   * @constructor
   */
  public async UndoneAfter() {
    const result = await this._en.UndoneAfter();
    if (!!result) {
      if (result.startsWith('err@')) {
        message.error(result);
        return false;
      }
      if (result.trim().startsWith('####')) {
        return '@preview' + result;
      }
    }
    return true;
  }
  /**
   * 移交前
   * @constructor
   */
  public async ShiftBefore() {
    const result = await this._en.ShiftBefore();
    if (!!result) {
      if (result.startsWith('err@')) {
        message.error(result);
        return false;
      }
      if (result.trim().startsWith('####')) {
        return '@preview' + result;
      }
    }
    return true;
  }
  /**
   * 移交后
   * @constructor
   */
  public async ShiftAfter() {
    const result = await this._en.ShiftAfter();
    if (!!result) {
      if (result.startsWith('err@')) {
        message.error(result);
        return false;
      }
      if (result.trim().startsWith('####')) {
        return '@preview' + result;
      }
    }
    return true;
  }
}
