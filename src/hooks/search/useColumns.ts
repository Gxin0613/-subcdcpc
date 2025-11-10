import type { RowData, TableColumn } from 'naive-ui/es/data-table/src/interface';
import type { Attr } from '/@/bp/en/Map/Attr';
import { getAppEnvConfig } from '/@/utils/env';
import { type DataTableColumns } from 'naive-ui';
import { h, nextTick, type Ref, type ShallowRef, type UnwrapNestedRefs } from 'vue';
import { windowOpen } from '/@/utils/windowOpen';
import type BaseComponent from '/@/WF/Comm/BaseComponent.vue';
import type { EnCfg } from '/@/bp/sys/EnCfg';
import { GloWF } from '/@/WF/Admin/GloWF';
import { message, Switch, Tag } from 'ant-design-vue';
import { AtPara } from '/@/bp/da/AtPara';
import type { Entity } from '/@/bp/en/Entity';
import { Button as AntButton } from 'ant-design-vue';
import { RefMethod } from '/@/bp/en/Map/RefMethod';
import type { Attrs } from '/@/bp/en/Map/Attrs';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { ExtModel } from '/@/bp/en/Map/EnMapExt';
import { DataType } from '/@/bp/en/DataType';
import { FieldNumColors } from '/@/WF/Admin/FrmLogic/MapExt/FieldNumColor/FieldNumColor';
import { getConfigColor } from '/@/utils/color';
import { isComPage } from '/@/utils/gl';
import { FrmAttachment } from '/@/WF/Admin/FrmLogic/FrmAttachment/FrmAttachment';
import { getAtStrValByKey } from '/@/utils/stringUtils';
import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
import { DealExp } from '/@/utils/gener/StringUtils';
import { cloneDeep } from 'lodash';
import SearchSubTable from '/@/WF/Comm/subComponents/SearchSubTable.vue';
import SimpleSubTable from '/@/WF/Comm/subComponents/SimpleSubTable.vue';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons-vue/lib/icons';
import EnOnly from '/@/WF/Comm/EnOnly.vue';

const getRenderType = (attr, focusField, enCfg) => {
  if (enCfg.ShowEnumAttrColor && attr.IsEnum) {
    return Tag;
  }
  if (focusField.includes(attr.Key)) {
    return 'a';
  }
  return 'span';
};

const parseColor = (color: string): { r: number; g: number; b: number } | null => {
  color = color.trim();
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 8) {
      // Remove alpha channel if present
      hex = hex.slice(0, 6);
    }
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    if (hex.length !== 6) return null;
    const intVal = parseInt(hex, 16);
    return {
      r: (intVal >> 16) & 255,
      g: (intVal >> 8) & 255,
      b: intVal & 255,
    };
  } else if (color.startsWith('rgba')) {
    const vals = color
      .replace(/^rgba?\(/, '')
      .replace(/\)/, '')
      .split(',')
      .map((v) => parseFloat(v));
    if (vals.length < 3) return null;
    return { r: vals[0], g: vals[1], b: vals[2] };
  } else if (color.startsWith('rgb')) {
    const vals = color
      .replace(/^rgb?\(/, '')
      .replace(/\)/, '')
      .split(',')
      .map((v) => parseFloat(v));
    if (vals.length < 3) return null;
    return { r: vals[0], g: vals[1], b: vals[2] };
  }
  return null;
};

const createRowActions = (row: Recordable, entityWG: Ref<Nullable<WaiGuaBaseEntity>>, permissionStr: Ref<string>) => {
  if (!entityWG.value) return [];
  const rowFunctions: RefMethod[] = [];
  const btns = entityWG.value?.SearchOptBtns;
  let btnDef = '';
  if (typeof btns === 'function') {
    btnDef = btns(row);
  } else if (typeof btns === 'string') {
    btnDef = btns;
  }
  if (typeof btnDef === 'string') {
    const btnList = btnDef
      .split(',')
      .filter((b) => b)
      .map((b) => b.trim());

    for (const btn of btnList) {
      const refMethod: RefMethod = new RefMethod();
      refMethod.Title = btn;
      refMethod.ClassMethod = btn;
      refMethod.Tag = 'WaiGua';
      rowFunctions.push(refMethod);
    }
  }
  if (typeof permissionStr.value === 'string' && permissionStr.value.trim().length > 0) return rowFunctions.filter((rf) => permissionStr.value.includes(',' + rf.Title + ','));
  return rowFunctions;
};

const getActionBtnName = (entity: Entity, row) => {
  entity.Row.LoadObject(row);
  return entity.HisUAC.IsUpdate ? '编辑' : '详情';
};

export function useColumns(
  columns: Ref<DataTableColumns<RowData>>,
  sortColumn: Ref<Recordable[]>,
  enInst: Ref<Entity | null>,
  enCfg: UnwrapNestedRefs<EnCfg>,
  baseComponent: ShallowRef<InstanceType<typeof BaseComponent>>,
  rowFuncs: Ref<RefMethod[]>,
  execMethod: Function,
  entityExt: Ref<Nullable<WaiGuaBaseEntity>>,
  searchPageParams: Recordable = {},
  openItemKey: Ref<string>,
  permissionStr: Ref<string>,
) {
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const isTrueVal = (v: any) => v == 1 || v === true || v == '1' || v == 'true' || v == '是';
  // 缓存操作按钮名称，避免在渲染阶段重复触发实体的 Row 写入
  const actionNameCache = new Map<string, string>();
  const _getActionBtnNameCached = (row: Recordable) => {
    const pk = enInst.value?.PK as string;
    const cacheKey = String(row[pk]);
    const cached = actionNameCache.get(cacheKey);
    if (cached) return cached;
    const name = getActionBtnName(enInst.value!, row);
    actionNameCache.set(cacheKey, name);
    return name;
  };
  const handleRowDbClick = async (record: Recordable) => {
    openItemKey.value = record[enInst.value?.PK as string];
    let url = enCfg.UrlExt;
    const classID = enInst.value?.classID;
    if (classID === 'TS.CCBill.GenerBillExt') {
      url = `/src/CCFast/CCBill/MyDictFrameWork.vue?FrmID=${record.FrmID}&WorkID=${record.WorkID}`;
      enCfg.SearchUrlOpenType = 9;
      enCfg.OpenModel = 8;
    }
    if (parseInt(enCfg.SearchUrlOpenType) === 9) {
      url = GloWF.DealExp(url, record);
    } else {
      const componentType = parseInt(enCfg.SearchUrlOpenType);
      if (componentType === 0) {
        url = '/src/WF/Comm/En.vue';
      } else if (componentType === 1) {
        url = '/src/WF/Comm/EnOnly.vue';
      } else {
        message.error('没有设置对应打开页面');
        return;
      }
      const pageParams = cloneDeep(searchPageParams);
      const atParaObj = new AtPara(record.AtPara);
      const enName = atParaObj.GetValStrByKey('EnName') || enInst.value?.classID || pageParams['EnName'];
      url += `?EnName=${enName}&PKVal=${record[enInst.value?.PK as string]}`;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      const { controlKey, controlVal, PKVal, No, Name, EnName, ...rest } = pageParams;
      if (controlKey && controlVal) {
        url += `&${controlKey}=${pageParams['controlVal']}`;
      }
      if (Object.keys(rest).length > 0) {
        url += '&' + new URLSearchParams(rest).toString();
      }
    }
    const openModel = parseInt(enCfg.OpenModel);
    if (openModel === 4) {
      return;
    }
    if (openModel === 1) {
      const urlNew = isComPage(url).replace('En', 'Entity');
      windowOpen(urlNew);
      return;
    }
    if (openModel === 3) {
      enInst?.[enCfg.OpenModelFunc]?.();
      return;
    }
    const EnCfgDefWidth = {
      [5]: '30%',
      [6]: '50%',
      [7]: '70%',
      [8]: '90%',
    };
    await nextTick();
    const title = enInst.value?._enMap?.EnDesc + ':详情';

    if ([0, 2].includes(openModel)) {
      baseComponent.value?.openModalByUrl(title, url);
      return;
    }
    if ([5, 6, 7, 8].includes(openModel)) {
      baseComponent.value?.openDrawerByUrl(title, url, EnCfgDefWidth[openModel]);
      return;
    }
    if (openModel == 9) {
      baseComponent.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenIframeByDrawer75, url));
      return;
    }
    if (openModel == 10) {
      baseComponent.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByTab, url, title));
      return;
    }
    message.warn('尚未处理的类型: ' + openModel);
  };

  // 创建render
  const createColumns = (attrs: Attrs, focusField: string[], colorConfigList: FieldNumColors, enumConfig) => {
    const { enMapExts } = enInst.value!._enMap;
    // 单元格样式缓存：按 行主键 + 字段 缓存，减少重复计算
    const styleCache = new Map<string, Record<string, any> | undefined>();
    switch (enCfg.TableSelectRowType) {
      case 0:
        columns.value = [
          {
            type: 'selection',
            fixed: 'left',
          },
        ];
        break;
      case 1:
        columns.value = [
          {
            type: 'selection',
            multiple: false,
            fixed: 'left',
          },
        ];
        break;
      case 2:
        columns.value = [];
    }
    if (enCfg.SelectRowType == 0) {
    } else if (enCfg)
      if (enCfg.ListDtlShowWay > 0) {
        columns.value.push({
          type: 'expand',
          // 给展开图标所在单元格一个可识别的类，便于行双击时排除
          className: 'expand-trigger-cell',
          expandable: () => true,
          renderExpand: (rowData: RowData) => {
            if (parseInt(enCfg.ListDtlShowWay) === 4) {
              return h(EnOnly, { params: { EnName: enInst.value?.classID, PKVal: rowData[enInst.value!.PK] } });
            }
            if (parseInt(enCfg.ListDtlShowWay as unknown as string) === 3) {
              return h(SimpleSubTable, { entity: enInst.value!, mainTableRow: rowData });
            }
            return h(SearchSubTable, { entity: enInst.value!, mainTableRow: rowData, displayMode: enCfg.ListDtlShowWay });
          },
        });
      }
    // 显示序列号
    if (enCfg.ShowNumIdx != 0) {
      columns.value.push({
        title: '#',
        key: 'sys_default_idx',
        width: 50,
        render: (_, rowIndex) => {
          return h('span', {}, rowIndex + '');
        },
      });
    }
    // 实际类的字段
    columns.value = columns.value.concat(
      attrs
        .filter((attr: Attr) => attr.UIVisible && attr.UIContralType < 4)
        .map((attr: Attr) => {
          const obj: TableColumn = {
            title: attr.Desc,
            width: attr.UIWidth < 50 ? 50 : attr.UIWidth,
            key: attr.Key,
            className: attr.IsNum ? 'num-style' : '',
            align: attr.IsBoolean ? 'center' : 'left',
            ellipsis: enCfg.ShowEnumAttrColor && attr.IsEnum?{
              tooltip:false}:{
              tooltip: {
                maxWidth: 500,
                scrollable: true,
                trigger: 'hover',
              },
            },
          };
          // boolean 列标题居中
          if (attr.IsBoolean) (obj as any).titleAlign = 'center';
          if (attr.Key === enInst.value?.PK) {
            obj.fixed = 'left';
          }
          const sort = sortColumn.value.find((sort) => sort.key === attr.Key);
          if (sort) {
            obj.sorter = {
              compare: () => {
                return 0;
              },
              multiple: sort.priority,
            };
          }
          if (attr.Key === 'WebPath') {
            obj.render = (row: Recordable) => {
              const path = row['WebPath'] || '';
              if (!path) {
                return h('span', {}, '无');
              }
              const filePath = VITE_GLOB_API_URL + path;
              const fileName = row['MyFileName'] || '';
              if (/\.(jpg|jpeg|png|GIF|JPG|PNG)$/.test(filePath)) {
                return h('img', {
                  src: filePath,
                  onClick: () => {
                    baseComponent.value?.previewImg(fileName, filePath);
                  },
                  style: { width: '120px', height: '120px', objectFit: 'cover' },
                });
              }
              return h(
                'span',
                {
                  onClick: () => {
                    window.open(filePath);
                  },
                },
                '文件:' + fileName,
              );
            };
            return obj;
          }
          // 普通连接
          const linkExt = enMapExts.find((ext) => ext.ExtModel == ExtModel.FieldLink && ext.AttrOfOper === attr.Key);
          // gl连接
          const glLinkExt = enMapExts.find((ext) => ext.ExtModel == ExtModel.FieldLinkGenerList && ext.AttrOfOper === attr.Key);
          const getStyle = (row) => {
            const pk = enInst.value?.PK as string;
            const cacheKey = `${attr.Key}:${row[pk]}`;
            if (styleCache.has(cacheKey)) return styleCache.get(cacheKey);
            // 判断是否启用枚举字段颜色
            if (attr.IsEnum && enumConfig && enCfg.ShowEnumAttrColor) {
              const enumStyle = enumConfig[attr.Key]?.find((e) => [e.EnumKey, e.StrKey, e.IntKey].includes(row[attr.Key]));
              if (enumStyle) {
                const bgColor = enumStyle.ValColor || '#000';
                const rgb = parseColor(bgColor);
                let textColor = 'white';
                if (rgb) {
                  const brightness = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
                  textColor = brightness > 186 ? 'black' : 'white';
                }
                const style = {
                  color: textColor,
                  backgroundColor: bgColor,
                };
                styleCache.set(cacheKey, style);
                return style;
              }
            }
            if (attr.IsNum) {
              const style = getConfigColor(row, attr, colorConfigList);
              if (style) {
                styleCache.set(cacheKey, style);
                return style;
              }
            }
            if (linkExt || glLinkExt) {
              const style = {
                color: '#1279ff',
                cursor: 'pointer',
                'text-decoration': 'underline',
              };
              styleCache.set(cacheKey, style);
              return style;
            }
            styleCache.set(cacheKey, undefined);
          };
          obj.render = (row) => {
            if (attr.IsBoolean) {
              const checked = isTrueVal(row[attr.Key]);
              if (enCfg.BoolAttrDisplayMode > 0) {
                if (enCfg.BoolAttrDisplayMode == 1) {
                  return h(Switch, { checked, size: 'small', disabled: true });
                }
                if (enCfg.BoolAttrDisplayMode == 2) {
                  const IconComp = checked ? CheckOutlined : CloseOutlined;
                  return h('span', { style: { color: checked ? '#52c41a' : '#ff4d4f' } }, [h(IconComp)]);
                }
              }
              return h('span', { style: { color: checked ? '#52c41a' : '#ff4d4f', fontWeight: 600 } }, checked ? '是' : '否');
            }

            let renderStr = row[attr.Key + 'Text'] || row[attr.Key + 'T'] || row[attr.Key];
            if (attr.IsEnum) {
              renderStr = row[attr.Key + 'Text'];
            }
            if (attr.IsDateField) {
              const time = row[attr.Key];
              if (typeof time === 'string') {
                if (time.length > 16) {
                  renderStr = time.substring(0, 16);
                } else {
                  renderStr = time;
                }
              } else {
                renderStr = '[错误的日期数据]';
              }
            } else if (attr.IsBoolean) {
              renderStr = row[attr.Key] == 1 ? '是' : '否';
            } else if (!attr.IsEnum && attr.IsNum) {
              if (attr.MyDataType === DataType.AppInt) {
                renderStr = parseInt(row[attr.Key] as string);
              } else if ([DataType.AppFloat, DataType.AppDouble, DataType.AppMoney].includes(attr.MyDataType)) {
                renderStr = parseFloat(row[attr.Key] as string).toFixed(attr.Precision);
              }
            }
            const clickable = !!(linkExt || glLinkExt || focusField.includes(attr.Key));
            const props: any = { style: getStyle(row) };
            if (clickable) {
              props.onClick = () => {
                // url扩展
                const url = linkExt?.Tag1;
                if (url) {
                  let finalSrc = url;
                  finalSrc = DealExp(finalSrc, row, false, true);
                  if (finalSrc.startsWith('http://') || finalSrc.startsWith('https://')) {
                    baseComponent.value.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenIframeByDrawer100, finalSrc), attr.Desc);
                    return;
                  }
                  baseComponent.value.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, finalSrc), attr.Desc);
                  return;
                }
                // gl扩展
                const dbSrc = glLinkExt?.Tag1;
                if (dbSrc) {
                  const matches = dbSrc.match(/@\w+/g);
                  let finalSrc = dbSrc;
                  for (const m of matches) {
                    const key = m.substring(1);
                    finalSrc = finalSrc.replace(m, row[key]);
                  }
                  baseComponent.value.handleGPNCallback(
                    new GPNReturnObj(
                      GPNReturnType.OpenCompByModal,
                      {
                        compUrl: '/@/WF/views/GenerList.vue',
                        params: {
                          EnName: 'GL_SearchLinkField',
                          dbSrc: finalSrc,
                        },
                        width: glLinkExt.W,
                        height: glLinkExt.H,
                      },
                      glLinkExt?.Tag || 'GL:' + attr.Desc,
                    ),
                  );
                  return;
                }
                if (!focusField.includes(attr.Key)) {
                  return;
                }
                handleRowDbClick(row);
              };
            }
            return h(getRenderType(attr, focusField, enCfg), props, { default: () => renderStr });
          };
          return obj;
        }),
    );
    // 附件
    columns.value = columns.value.concat(
      attrs
        .filter((attr) => attr.UIContralType == 6)
        .map((attr) => {
          return {
            title: attr.Desc,
            key: attr.Key,
            width: attr.UIWidth,
            render: (row) => {
              return h(
                'a',
                {
                  onClick: async () => {
                    const EnName = enInst.value?.classID;
                    const PK = enInst.value?.PK;
                    if (!EnName || !PK) {
                      return;
                    }
                    const athTablePK = EnName + '_' + attr.Key;
                    const ath = new FrmAttachment(athTablePK);
                    await ath.Retrieve();
                    ath.Name = attr.Desc;
                    ath.FK_MapData = EnName;
                    ath.NoOfObj = attr.Key;
                    if (attr.UIBindKey!.toString().includes('AthType=AthSingle')) ath.TopNumOfUpload = 1;
                    if (attr.UIIsReadonly) ath.IsUpload = false;
                    const saveType = getAtStrValByKey(attr.UIBindKey!, 'SaveTo');
                    if (saveType) ath.AthSaveWay = saveType;
                    await ath.Save();
                    baseComponent.value?.handleGPNCallback(
                      new GPNReturnObj(
                        GPNReturnType.OpenCompByModal,
                        {
                          compUrl: '/src/WF/CCForm/Ath.vue?',
                          params: {
                            FrmID: EnName,
                            FK_FrmAttachment: athTablePK,
                            PKVal: row[PK],
                            IsReadonly: !!attr.UIIsReadonly ? 1 : 0,
                          },
                        },
                        '表格附件：' + attr.Desc,
                      ),
                    );
                  },
                },
                {
                  default: () => '查看附件',
                },
              );
            },
          };
        }),
    );
    // 扩展的虚拟列 wanglu
    const virtualColumns = entityExt.value?.CustomColumnsRender || [];
    // 添加虚拟列
    for (const vc of virtualColumns) {
      if (vc.afterColumn) {
        // @ts-ignore
        const index = columns.value.findIndex((col) => col.key === vc.afterColumn);
        if (index !== -1) {
          columns.value.splice(index + 1, 0, vc);
        }
      } else {
        columns.value.push(vc);
      }
    }

    columns.value.push({
      title: '操作',
      key: 'custom_functions',
      render(row) {
        const actionBtnName = _getActionBtnNameCached(row);
        const isDetailBtn = actionBtnName === '详情';
        return h(
          'div',
          {
            style: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
            },
          },
          [
            isDetailBtn
              ? h(
                  'a',
                  {
                    href: '#',
                    style: {
                      textDecoration: 'none',
                      display: 'inline-block',
                    },
                    onClick: (e: Event) => {
                      e.preventDefault();
                      handleRowDbClick(row);
                    },
                  },
                  actionBtnName,
                )
              : h(
                  AntButton,
                  {
                    type: 'primary',
                    size: 'small',
                    round: true,
                    onClick: () => {
                      handleRowDbClick(row);
                    },
                  },
                  () => actionBtnName,
                ),
            ...rowFuncs.value.map((fn) => {
              return h(
                AntButton,
                {
                  type: 'primary',
                  size: 'small',
                  round: true,
                  onClick: () => {
                    execMethod(row, fn, fn.Title, fn.Tag || 'EntityMap');
                  },
                } as any,
                () => fn.Title as string,
              ) as any;
            }),
            ...createRowActions(row, entityExt, permissionStr).map((fn) => {
              return h(
                AntButton,
                {
                  type: 'primary',
                  size: 'small',
                  round: true,
                  onClick: () => {
                    execMethod(row, fn, fn.Title, fn.Tag || 'EntityMap');
                  },
                } as any,
                () => fn.Title as string,
              ) as any;
            }),
          ],
        );
      },
      align: 'center',
      width: entityExt.value?.SearchOptBtnsWidth || 50,
      fixed: 'right',
    });
  };

  return {
    handleRowDbClick,
    createColumns,
  };
}
