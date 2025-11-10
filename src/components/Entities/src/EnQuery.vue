<script lang="tsx">
  import { Button as AntButton, Input as AntInput, Menu, MenuItem, Select, SelectOption, Tooltip, TreeSelect } from 'ant-design-vue';
  import { computed, defineComponent, reactive, ref, Fragment, onMounted, onUnmounted, unref } from 'vue';
  import { DTSearchWay, SearchNormals } from '/@/bp/en/Map/SearchNormal';
  import { SearchFKEnums } from '/@/bp/en/Map/SearchFKEnum';
  import { SearchFields } from '/@/bp/en/Map/SearchFields';
  import { SearchNumAttrs } from '/@/bp/en/Map/SearchNumAttr';
  import NumRangePicker from './NumRangePicker.vue';
  import dayjs, { Dayjs } from 'dayjs';
  import { DataType } from '/@/bp/en/DataType';
  import { NDatePicker } from 'naive-ui';
  import { RefMethod } from '/@/bp/en/Map/RefMethod';
  import { DownOutlined, UpOutlined } from '@ant-design/icons-vue/lib/icons';
  import { Entity } from '/@/bp/en/Entity';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { UAC } from '/@/bp/en/Map/UAC';
  import { EnCfg } from '/@/bp/sys/EnCfg';
  import webUser from '/@/bp/web/WebUser';
  import { UserRegedit } from '/@/bp/sys/UserRegedit';
  import { QueryFormEmitEvents } from './typing';
  import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
  import { ClassFactoryOfWaiGuaEntity } from '/@/WF/Comm/UIEntity/ClassFactoryOfWaiGuaEntity';
  import { Entities } from '/@/bp/en/Entities';
  import { ExtModel } from '/@/bp/en/Map/EnMapExt';
  import DBAccess from '/@/utils/gener/DBAccess';
  import { useRoute } from 'vue-router';
  import { parseValByType, useDDLDataLoader } from '/@/hooks/ens/useDDLDataLoader';
  import { FieldType } from '/@/bp/en/EnumLab';
  import { splitAtString } from '/@/bp/tools/ParamUtils';

  const props = {
    classId: {
      type: String,
      default: '',
    },
    searchParams: {
      type: Object,
      default: () => {
        return {};
      },
    },
    queryBtnInForm: {
      type: Boolean,
      default: true,
    },
    hiddenAction: {
      type: Boolean,
      default: true,
    },
  };
  interface SearchDef {
    DTSearchKey: any;
    DTSearchLabel: string;
    DTSearchWay: DTSearchWay;
    searchNormals: SearchNormals;
    searchFKEnums: SearchFKEnums;
    searchFields: SearchFields;
    searchNumAttrs: SearchNumAttrs;
    hiddenCondition: SearchNormals;
    SearchKey: string;
    DTFrom?: Dayjs;
    DTTo?: Dayjs;
    DTVals: any;
    DTSearchKeys: { label: string; value: any }[];
  }

  interface Condition {
    selected: any | any[];
    title: string;
    key: string;
    isBoolean: boolean;
    width: number;
    dataType: DataType;
    options: any[];
  }

  export default defineComponent({
    name: 'EnQuery',
    props,
    setup(props, ctx) {
      const emit = ctx.emit as QueryFormEmitEvents;
      const route = useRoute();
      const searchInfo = reactive<SearchDef>({
        DTSearchKey: undefined,
        DTSearchLabel: '',
        DTSearchWay: DTSearchWay.None,
        searchNormals: new SearchNormals(),
        searchFKEnums: new SearchFKEnums(),
        searchFields: new SearchFields(),
        searchNumAttrs: new SearchNumAttrs(),
        hiddenCondition: new SearchNormals(),
        SearchKey: '',
        DTSearchKeys: [],
        DTVals: '',
      });
      const renderKeywords = () => {
        return (
          <Fragment>
            <div class="search-key flex" style="width: 180px">
              <AntInput class="input-search" v-model:value={searchInfo.SearchKey} placeholder={enCfg.KeyPlaceholder || '请输入关键字'} />
            </div>
            {searchInfo.searchFields.length > 0 &&
              searchInfo.searchFields.map((sf) => (
                <div class="search-key flex" style="width: 120px" key={sf.label}>
                  <AntInput class="input-search" v-model:value={sf.value} placeholder={sf.placeholder} />
                </div>
              ))}
          </Fragment>
        );
      };

      const outerQueryPrefix = 's_key_';
      // 查询条件 end
      const booleanToRadioGroup = () => {
        return [
          { label: '全部', value: '' },
          { label: '是', value: '1' },
          { label: '否', value: '0' },
        ];
      };
      const prepareConditions = async () => {
        const { getDDLData } = useDDLDataLoader(_enInst!);
        const { DTSearchLabel, DTSearchWay, searchNumAttrs, searchFields, searchFKEnums, attrs } = _enInst!._enMap;
        const searchNormals = _enInst!._enMap.searchNormals.filter((condition) => !condition.IsHidden) as SearchNormals;
        const hiddenConditions = _enInst!._enMap.searchNormals.filter((condition) => condition.IsHidden) as SearchNormals;
        for (const searchField of searchFields) {
          searchField.value = props.searchParams[outerQueryPrefix + searchField.searchKey] || route.query[searchField.searchKey] || '';
        }
        searchInfo.DTSearchKeys = attrs
          .filter((attr) => attr.MyDataType == DataType.AppDate || attr.MyDataType == DataType.AppDateTime)
          .map((attr) => ({ label: attr.Desc, value: attr.Key + '' }));
        // 处理外键
        const fkFields = attrs.filter((attr) => attr.MyDataType === FieldType.FK && attr.UIBindKey?.includes(','));
        if (fkFields.length > 0) {
          for await (const fkField of fkFields) {
            const tempArr = fkField.UIBindKey?.split?.(',') || [];
            const fkEnName = tempArr[tempArr.length - 1];
            if (!fkEnName.includes('.')) {
              alert('外键类名错误:' + fkEnName);
            }
            const fkEn = await ClassFactory.GetEn(fkEnName);
            await fkEn.Init();
          }
        }
        // 处理时间日期格式
        fkConditions.value = [];
        for await (const sn of searchFKEnums) {
          const attr = attrs.find((attr) => attr.Key === sn.Key);
          if (!attr) continue;
          fkConditions.value.push({
            selected: attr.IsBoolean ? '' : [],
            title: attr.Desc,
            key: attr.Key,
            width: sn.Width,
            dataType: attr.MyDataType,
            isBoolean: attr.IsBoolean,
            options: attr.IsBoolean ? booleanToRadioGroup() : await getDDLData(attr),
          });
        }
        normalConditions.value = [];
        for await (const sn of searchNormals) {
          const attr = attrs.find((attr) => attr.Key === sn.Key);
          if (!attr) continue;
          normalConditions.value.push({
            selected: attr.IsBoolean ? '' : [],
            title: attr.Desc,
            key: attr.Key,
            dataType: attr.MyDataType,
            isBoolean: attr.IsBoolean,
            width: sn.Width,
            options: attr.IsBoolean ? booleanToRadioGroup() : await getDDLData(attr),
          });
        }
        searchInfo.searchFields = searchFields;
        searchInfo.DTSearchLabel = DTSearchLabel;
        searchInfo.DTSearchWay = DTSearchWay;
        searchInfo.searchNormals = searchNormals;
        searchInfo.searchFKEnums = searchFKEnums;
        searchInfo.searchNumAttrs = searchNumAttrs;
        searchInfo.hiddenCondition = hiddenConditions;
      };

      const updateSNRange = () => {};
      const renderNumberRange = () => {
        return (
          <Fragment>
            {_sn_init.value &&
              searchInfo.searchNumAttrs.map((sn) => (
                <div class="search-key flex" key={sn.label}>
                  <NumRangePicker searchNumAttr={sn} onUpdateRange={updateSNRange} />
                </div>
              ))}
          </Fragment>
        );
      };
      // 查询条件
      const normalConditions = ref<Condition[]>([]);
      const fkConditions = ref<Condition[]>([]);
      const toggleConditions = ref(false);
      const searchFlexWidth = ({ width }) => {
        return {
          width: width + 'px',
        };
      };

      const triggerDDLEvents = async (key, row, cfgKey) => {
        const exts = _enInst?._enMap.enMapExts.filter((item) => item.ExtModel === ExtModel.DDLRelation && item.Tag1 === cfgKey);
        if (!Array.isArray(exts)) return;
        for (const ext of exts) {
          const triggerItem = [...fkConditions.value, ...normalConditions.value].find((item) => item.key === ext.Tag2);
          if (!triggerItem) continue;
          const rawData = await DBAccess.RunSQLReturnTable(ext.Doc.replace(/@Key/g, key));
          triggerItem.options = rawData.map((item) => {
            return {
              label: item.Name,
              value: item.No,
              text: item.Name,
            };
          });
          triggerItem.selected = undefined;
        }
      };
      const renderSelections = () => {
        return (
          <Fragment>
            {[...fkConditions.value, ...normalConditions.value].map((condition) => (
              <div class="search-key flex" style={searchFlexWidth(condition)} key={condition.title}>
                {condition.isBoolean && <div class="label">{condition.title}:</div>}
                {enCfg.IsSelectMore == 0 ? (
                  <Select
                    v-model:value={condition.selected}
                    mode={enCfg.IsSelectMore ? 'multiple' : undefined}
                    onChange={(key, row) => triggerDDLEvents(key, row, condition.key)}
                    style="width: 100%"
                    virtual={false}
                    allowClear
                    placeholder={condition.title}
                  >
                    {condition.options.map((item) => (
                      <SelectOption key={item.value}> {item.label} </SelectOption>
                    ))}
                  </Select>
                ) : (
                  <TreeSelect
                    v-model:value={condition.selected}
                    onChange={(key, row) => triggerDDLEvents(key, row, condition.key)}
                    treeCheckable={!condition.isBoolean}
                    style="width: 100%"
                    virtual={false}
                    allowClear
                    placeholder={condition.title}
                    showSearch
                    treeNodeFilterProp="label"
                    treeData={condition.options}
                  />
                )}
              </div>
            ))}
          </Fragment>
        );
      };

      const DTRangeSearchKeys = ref<[number, number] | null>(null);
      const dateRangeChange = (timeStamp: [number, number]) => {
        DTRangeSearchKeys.value = timeStamp;
      };
      const dateChange = (timeStamp: number) => {
        searchInfo.DTVals = timeStamp;
      };
      const searchDateFlexWidth = computed(() => {
        return {
          width: toggleConditions.value ? '20%' : '24%',
        };
      });

      const renderDates = () => {
        const type = DTSearchWay.ByDateTime === searchInfo.DTSearchWay ? 'datetimerange' : 'daterange';
        const datePickerProps: Recordable = {
          type,
          'v-model:value': DTRangeSearchKeys,
          onUpdateValue: dateRangeChange,
          onUpdateValueOnClose: true,
          actions: null,
          clearable: true,
          placeholder: searchInfo.DTSearchLabel,
        };
        if ([DTSearchWay.ByYear, DTSearchWay.ByYearMonth].includes(searchInfo.DTSearchWay)) {
          datePickerProps['v-model:value'] = searchInfo.DTVals;
          datePickerProps.onUpdateValue = dateChange;
        }
        return (
          <Fragment>
            {searchInfo.DTSearchWay !== DTSearchWay.None && (
              <div class="search-key flex" style="width: 160px">
                <Select
                  v-model:value={searchInfo.DTSearchKey}
                  mode={enCfg.IsSelectMore ? 'multiple' : undefined}
                  style="width: 100%"
                  virtual={false}
                  allowClear={true}
                  placeholder={'请选择'}
                >
                  {searchInfo.DTSearchKeys.map((item) => (
                    <SelectOption key={item.value}> {item.label} </SelectOption>
                  ))}
                </Select>
              </div>
            )}

            {searchInfo.DTSearchWay !== DTSearchWay.None && (
              <div class="search-key flex" style={searchDateFlexWidth}>
                <NDatePicker {...datePickerProps} />
              </div>
            )}
          </Fragment>
        );
      };

      const { queryBtnInForm } = unref(props);
      const formVisible = ref(true);

      let _enInst: null | Entity = null;
      let _ensInst: null | Entities = null;
      let _uac: null | UAC = null;
      let _enExtInst: null | WaiGuaBaseEntity = null;
      const enCfg = reactive(new EnCfg());

      const initEnCfg = async () => {
        await enCfg.Init();
        enCfg.SetValByKey('No', props.classId);
        if (!(await enCfg.RetrieveFromDBSources())) {
          try {
            await enCfg.Insert();
            await enCfg.Retrieve();
          } catch (e: any) {
            if (window.confirm('查询页面初始化失败，是否重试？')) {
              await InitSearch();
            }
          }
        }
      };
      const urMyPK = webUser.No + '_' + props.classId + '_SearchAttrs';
      // UserRegedit为查询对象
      const userRegedit = reactive<UserRegedit>(new UserRegedit());
      const getValidDateStr = (str: string) => (str.includes('-') ? dayjs(str).valueOf() : 0);
      const _sn_init = ref(false);
      const loopFunction = async (item: Recordable, obj: Recordable) => {
        const { key } = item;
        if (!!obj[key]) {
          const selected = obj[key].includes(',') ? obj[key].split(',') : obj[key];
          item.selected = Array.isArray(selected) ? selected.map((s) => parseValByType(item.dataType, s)) : parseValByType(item.dataType, selected);
        }
        //解决初始化级联数据的赋值问题
        const cascadeItems = _enInst!._enMap.enMapExts.filter((item) => item.ExtModel === ExtModel.DDLRelation && item.Tag1 === key) || [];
        for (const ext of cascadeItems) {
          const fkItem = [...fkConditions.value].find((item) => item.key === ext.Tag2);
          if (!fkItem) continue;
          const rawData = await DBAccess.RunSQLReturnTable(ext.Doc.replace(/@Key/g, item.selected));
          fkItem.options = rawData.map((item: Recordable) => {
            return {
              label: item.Name,
              value: item.No,
              text: item.Name,
            };
          });
        }
      };
      const initUserRegedit = async () => {
        userRegedit.setPKVal(urMyPK);
        const res = await userRegedit.RetrieveFromDBSources();
        if (res == 0) {
          await resetUserRegedit();
        } else {
          // @ts-ignore
          const { searchNumAttrs } = _enInst._enMap;
          // 范围选择器
          if ([DTSearchWay.ByDate, DTSearchWay.ByDateTime].includes(searchInfo.DTSearchWay)) {
            const fts = getValidDateStr(userRegedit.DTFrom || '');
            const tts = getValidDateStr(userRegedit.DTTo || '');
            if (fts == 0 || tts == 0) {
              DTRangeSearchKeys.value = null;
            } else {
              DTRangeSearchKeys.value = [fts, tts];
            }
          } else {
            searchInfo.DTVals = getValidDateStr(userRegedit.DTTo || '');
          }

          if (typeof searchInfo.DTVals === 'string' && searchInfo.DTVals === '') {
            searchInfo.DTVals = undefined;
          }
          const dtLabel = searchInfo.DTSearchKeys.find((item) => item.value == userRegedit.DTSearchKey)?.label;
          searchInfo.DTSearchLabel = dtLabel || '';
          searchInfo.DTSearchKey = userRegedit.DTSearchKey + '' || undefined;
          searchInfo.SearchKey = userRegedit.SearchKey;
          const obj: Recordable = {};
          const params = splitAtString(userRegedit.Vals);
          for (const param of params) {
            const [k, v] = param.split('=');
            //如果存在UrL参数中，需要使用URL的数据
            //判断是否含有查询条件的值
            const paraVal = props.searchParams[k] || route.query[k] || '';
            obj[k] = !!paraVal ? paraVal : v;
          }
          for (const sn of searchNumAttrs) {
            const vals = userRegedit.GetParaString(sn.searchKey);
            if (!vals.includes(',')) {
              continue;
            }
            const [sVal, eVal] = vals.split(',');
            sn.startVal = parseFloat(sVal) || 0;
            sn.endVal = parseFloat(eVal) || 0;
          }
          _sn_init.value = true;
          // 处理下拉框回显
          fkConditions.value.forEach((item) => loopFunction(item, obj));
          normalConditions.value.forEach((item) => loopFunction(item, obj));
          searchInfo.hiddenCondition.forEach((item) => loopFunction(item, obj));
        }

        // 处理url传入的查询key，时间
        const SearchKey = route.query.SearchKey || '';
        const DTFrom = route.query.DTFrom || '';
        const DTTo = route.query.DTTo || '';
        if (SearchKey) userRegedit.SearchKey = SearchKey as string;
        if (DTFrom) userRegedit.DTFrom = DTFrom as string;
        if (DTTo) userRegedit.DTTo = DTTo as string;
      };
      const resetUserRegedit = async () => {
        userRegedit.MyPK = urMyPK;
        userRegedit.SearchKey = '';
        userRegedit.AtPara = '';
        userRegedit.DTFrom = '';
        userRegedit.DTTo = '';
        userRegedit.FK_Emp = webUser.No;
        userRegedit.CfgKey = 'SearchAttrs';
        userRegedit.Vals = '';
        userRegedit.FK_MapData = props.classId;
        userRegedit.OrderBy = '';
        userRegedit.OrderWay = '';
        if (!(await userRegedit.IsExits())) {
          await userRegedit.Insert();
        } else {
          await userRegedit.Update();
        }
      };

      // 处理时间日期
      const getFormats = (type: DTSearchWay) => {
        const formatsDef = ['', 'YYYY-MM-DD', 'YYYY-MM-DD HH:mm', 'YYYY-MM', 'YYYY'];
        return formatsDef[type];
      };
      const handleTimestamp = (ts: number | undefined | null) => {
        if (ts) {
          return dayjs(ts).locale('zh-cn').format(getFormats(searchInfo.DTSearchWay));
        }
        return '';
      };

      // 更新查询条件
      const updateSearchCondition = () => {
        // 处理关键字
        userRegedit.SearchKey = searchInfo.SearchKey || '';
        // 处理时间
        if ([DTSearchWay.ByDate, DTSearchWay.ByDateTime].includes(searchInfo.DTSearchWay)) {
          userRegedit.DTFrom = handleTimestamp(DTRangeSearchKeys.value?.[0]);
          userRegedit.DTTo = handleTimestamp(DTRangeSearchKeys.value?.[1]);
        } else if ([DTSearchWay.ByYear, DTSearchWay.ByYearMonth].includes(searchInfo.DTSearchWay) && !!searchInfo.DTVals) {
          userRegedit.DTFrom = handleTimestamp(parseInt(searchInfo.DTVals) || 0);
        }
        const q = {};
        let queryArgs = '';
        for (const condition of [...fkConditions.value, ...normalConditions.value]) {
          if (Array.isArray(condition.selected) && condition.selected.length > 0) {
            queryArgs += `@${condition.key}=${condition.selected.join(',') || ''}`;
            q[condition.key] = condition.selected.join(',') || '';
            continue;
          }
          if (!Array.isArray(condition.selected)) {
            if (condition.selected === 0) queryArgs += `@${condition.key}=0`;
            else queryArgs += `@${condition.key}=${condition.selected || ''}`;
            q[condition.key] = condition.selected || '';
          }
        }

        // 隐藏条件
        // for (const hiddenCondition of searchInfo.hiddenCondition) {
        //   const { RefAttrKey, DefaultSymbol, DefaultVal } = hiddenCondition;
        //   //queryArgs += `@${RefAttrKey}${DefaultSymbol}${GloWF.DealExp(DefaultVal, {}) || ''}`;
        //   queryArgs += `@${RefAttrKey}${DefaultSymbol}${GloWF.DealExp(DefaultVal, {}) || ''}`;
        // }
        // 字段查询
        for (const searchField of searchInfo.searchFields) {
          //queryArgs += `@${searchField.searchKey}=${searchField.value || ''}`;
          userRegedit.SetPara(searchField.searchKey, searchField.value);
          q[searchField.searchKey] = searchField.value;
        }

        // 数字
        for (const sn of searchInfo.searchNumAttrs) {
          if (sn.startVal || sn.endVal) {
            userRegedit.SetPara(sn.searchKey, sn.startVal + ',' + sn.endVal);
            q[sn.searchKey] = sn.startVal + ',' + sn.endVal;
          } else userRegedit.DelPara(sn.searchKey);
        }

        // 解析url参数
        const args = {
          ...props.searchParams,
          ...route.query,
        };
        const argKeys = Object.keys(args);
        for (const k of argKeys) {
          if (k.startsWith(outerQueryPrefix) && args[k]) {
            const rKey = k.replace(outerQueryPrefix, '');
            queryArgs += `@${rKey}=${args[k]}`;
            q[rKey] = args[k];
          }
        }
        userRegedit.Vals = queryArgs;
        userRegedit.OrderBy = enCfg.OrderBy;
        userRegedit.OrderWay = enCfg.IsDeSc ? 'desc' : 'asc';
        return q;
      };
      // 执行批处理方法
      const batchFunctions = ref<RefMethod[]>([]);
      const getBatchFunctions = () => {
        const batchFuncs = _enInst?._enMap.rms.filter((rm) => rm.IsCanBatch) as RefMethod[];
        const btnDefStr = _enExtInst?.SearchToolbarBtns;
        if (!btnDefStr) return batchFuncs;
        const extBatchFuncs = btnDefStr
          .split(',')
          .filter((btn) => btn)
          .map((btnLab) => {
            const refMethod = new RefMethod();
            refMethod.Title = btnLab;
            refMethod.ClassMethod = btnLab;
            refMethod.Tag = 'WaiGua';
            return refMethod;
          });
        const enCfgBtns: RefMethod[] = [];
        for (let i = 1; i <= 3; i++) {
          const key = 'BtnLab' + i;
          const fTitle = enCfg.GetValByKey(key);
          if (!fTitle) continue;
          const refMethod = new RefMethod();
          refMethod.Title = fTitle;
          refMethod.ClassMethod = key;
          refMethod.Tag = 'EnCfg';
          enCfgBtns.push(refMethod);
        }
        return [...batchFuncs, ...extBatchFuncs, ...enCfgBtns];
      };
      const ready = ref(false);
      const InitSearch = async () => {
        _ensInst = await ClassFactory.GetEns(props.classId);
        _enInst = _ensInst.GetNewEntity;
        _uac = _enInst.HisUAC;
        const extClassId = ('WGEntity_' + props.classId.substring(props.classId.lastIndexOf('.') + 1)) as string;
        _enExtInst = await ClassFactoryOfWaiGuaEntity.GetEn(extClassId);
        await initEnCfg();
        batchFunctions.value = getBatchFunctions();
        await prepareConditions();
        await initUserRegedit();
        ready.value = true;
      };

      const renderQueryButtons = () => {
        return (
          <div style="flex: 1 0 200px; display: flex; align-items: center; justify-content: flex-end">
            {!queryBtnInForm && renderFormButton()}
            {_uac?.IsInsert && (
              <AntButton type="primary" onClick={() => emit('add')} style="margin-left: 6px">
                新建
              </AntButton>
            )}
            {_uac?.IsDelete && (
              <AntButton danger onClick={() => emit('delete-selected')} style="margin-left: 6px">
                删除
              </AntButton>
            )}
            {enCfg.IsExp != 0 && (
              <AntButton type="primary" onClick={() => emit('export-table')} style="margin-left: 6px">
                导出
              </AntButton>
            )}
            {enCfg.IsImp && (
              <AntButton type="primary" onClick={() => emit('import-table')} style="margin-left: 6px">
                导入
              </AntButton>
            )}
            {enCfg.IsGroup && (
              <AntButton type="primary" onClick={() => emit('open-analy-page')} style="margin-left: 6px">
                分析
              </AntButton>
            )}
            {webUser.IsAdmin && (
              <AntButton type="primary" onClick={() => emit('open-setting')} style="margin-left: 6px">
                设置
              </AntButton>
            )}
            {batchFunctions.value.map((func) => (
              <AntButton type="primary" key={func.ClassMethod} onClick={() => emit('exec-method', func as RefMethod)} style="margin-left: 6px">
                {func.Title}
              </AntButton>
            ))}

            <a style="font-size: 14px; margin-left: 12px" onClick={() => (formVisible.value = !formVisible.value)}>
              <Tooltip title={formVisible.value ? '隐藏条件' : '显示条件'}>
                {{
                  default: () => (formVisible.value ? <UpOutlined /> : <DownOutlined />),
                  overlay: () => (
                    <Menu onClick={(ev) => emit('change-density', ev)}>
                      <MenuItem key="large"> 默认 </MenuItem>
                      <MenuItem key="small"> 紧凑 </MenuItem>
                    </Menu>
                  ),
                }}
              </Tooltip>
            </a>
          </div>
        );
      };

      const renderFormButton = () => {
        return (
          <div class="search-key flex">
            <AntButton
              type="primary"
              onClick={() => {
                const q = updateSearchCondition();
                emit('query', q);
              }}
              style="margin-left: 6px"
            >
              查询
            </AntButton>
            <AntButton
              type="default"
              onClick={async () => {
                await resetUserRegedit();
                await InitSearch();
                emit('reset');
              }}
              style="margin-left: 6px"
            >
              重置
            </AntButton>
          </div>
        );
      };

      const renderForm = () => {
        return (
          <Fragment>
            {formVisible.value && (
              <div class="search-container flex">
                {renderKeywords()}
                {renderNumberRange()}
                {renderSelections()}
                {renderDates()}
                {queryBtnInForm && renderFormButton()}
              </div>
            )}
          </Fragment>
        );
      };

      onMounted(() => {
        InitSearch();
      });

      onUnmounted(async () => {
        if (!enCfg.IsCond) return;
        await resetUserRegedit();
      });

      return () => (
        <Fragment>
          {ready.value && (
            <Fragment>
              {renderForm()}
              {!props.hiddenAction && renderQueryButtons()}
            </Fragment>
          )}
        </Fragment>
      );
    },
  });
</script>

<style lang="less" scoped>
  .search-container {
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-start;

    .search-key {
      align-items: center;
      width: calc(100% / 6);
      flex-shrink: 0;
      padding: 4px 10px 4px 0;

      .column-setting {
        font-size: 17px;
        margin: 0 10px;
        display: flex;
        align-items: center;
      }

      .label {
        min-width: 80px;
        text-align: right;
        height: 32px;
        line-height: 32px;
        padding-right: 12px;
        box-sizing: border-box;
        font-weight: 550; //关键字 数据源字体加粗
      }

      .input-search {
        border-radius: 5px;
      }

      :deep(.ant-select-selector) {
        border-radius: 5px;
      }
    }

    .search-buttons {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;

      .column-setting {
        font-size: 17px;
        margin: 0 10px;
        display: flex;
        align-items: center;
      }
    }

    .toggle-btn {
      margin-left: 12px;
      font-size: 12px;
      color: #459dff;
      cursor: pointer;
    }
  }
</style>
