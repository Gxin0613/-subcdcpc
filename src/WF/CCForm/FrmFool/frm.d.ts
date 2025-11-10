 import { FrmAttachment, GroupField, MapData, MapDtl, MapExt } from '/#/entity';
 import { WaiGuaBaseFrm } from '/@/bp/UIEntity/WaiGuaBaseFrm';
 interface GroupFieldExt extends GroupField {
    dtl?: MapDtl;
    ath?: FrmAttachment;
    ParentOID?:number;
    isCompare?:number;
    
  }
  interface FrmStyleContent{
    frmContent: string;
    frmTitle: string;
    GroupTitle: string;
    frmstyle: string;
  }
export interface FrmConfig {
  frmData:Record<string, any>; //表单的所有信息
  gfs: GroupFieldExt[]; //分组
  dtlGroup: GroupFieldExt[]; //从表分组
  mapData:MapData; //表单信息
  mapAttrs:MapAttrExt;//字段属性
  mapExts:MapExt[]; //表单扩展属性
  aths:FrmAttachment[];// 附件属性集合
  dtls:MapDtl[];//从表属性集合
  mainData:Record<string, any>; //主表处理后信息
  origData:Record<string, any>;//主表原始信息
  frmStyleContent:FrmStyleContent;//表单样式
  tableCol:number;//表格列数
  labPostion:string; //字段标签位置 左、上
  labAlign:string;// 字段标签 左右中
  nodeInfo:Record<string, any>;//节点属性信息，有可能不存在
  isHaveEditWorkCheck:boolean; //是否启用了审核组件
  isHaveSignCheck:boolean;// 是否存在签批字段
  checkField:string;//签批字段
  fwcVer:number;//审核组件 
  examineMode:string;//审核组件模式
  athInputUpload:string;//表格附件必填

  /*************增加方法的使用****************/
  isZDPC:(groupID:number|string)=>void;
  handleUpdate:(updata:any)=>void;
  ChangeMainData:(atPara: AtPara, key: string)=>void;
  changeTrack:()=>void;
  changeNormal:()=>void;
  changeTimeTrack:()=>void;
}