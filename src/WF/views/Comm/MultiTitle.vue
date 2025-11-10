<template>
  <Card :title="'多表头设置'">
    <Table :columns="columns" :data-source="tableData" bordered size="small" :rowKey="(record, index) => index" :pagination="false" :scroll="{ x: 1000 }">
      <template #headerCell="{ column }">
        <template
          v-if="
            (column.key != column.title && (secondHeader.includes(column.key + ',') || gradeHeader.includes(column.key + ','))) ||
            (column.key === column.title && gradeHeader.includes(column.key + ','))
          "
        >
          <div v-if="!!column.children"
            >{{ column.title }}<Button type="primary" size="small" shape="circle" :icon="h(CloseOutlined)" @click="DeleteSpecTitle(column.title)"
          /></div>
          <span v-else>{{ column.title }}</span>
        </template>
        <template v-else>
          <div v-if="!!column.children"
            ><Checkbox v-model:checked="columnChecks[column.key]">{{ column.title }}</Checkbox
            ><Button type="primary" size="small" shape="circle" :icon="h(CloseOutlined)" @click="DeleteSpecTitle(column.title)"
          /></div>
          <Checkbox v-else v-model:checked="columnChecks[column.key]">{{ column.title }}</Checkbox>
        </template>
      </template>
    </Table>
    <div>
      <Button type="primary" @click="AddGroup">{{ '增加一级表头' }}</Button>
      <Divider type="vertical" />
      <Button type="primary" @click="AddGroup2">{{ '增加二级表头' }}</Button>
      <Divider type="vertical" />
      <Button type="primary" @click="ClearAll">{{ '清除全部设置' }}</Button>
      <Divider type="vertical" />
    </div>
  </Card>
</template>

<script lang="ts" setup>
  import { Card, Table, Button, Divider, Checkbox, message } from 'ant-design-vue';
  import { CloseOutlined } from '@ant-design/icons-vue';
  import { MapDtl } from '/@/WF/Admin/FrmLogic/MapDtl';
  import { MapData } from '/@/WF/Admin/FrmLogic/MapData';
  import { MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { h, ref } from 'vue';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import { EnCfg } from '/@/bp/sys/EnCfg';
  import { EnSearchCols } from '/@/bp/sys/EnSearchCol';
  import { MapExtAttr } from '/@/WF/Admin/FrmLogic/MapExt';
  // 父组件传过来的属性
  const props = defineProps({
    params: {
      //表单属性集合
      type: Object,
      default: () => {},
    },
  });

  //定义从表表格展示的数据和列
  const columns = ref<any[]>([]);
  const tableData = ref<any[]>([]);
  const columnChecks = ref<Record<string, any>>({});
  let enEntity;
  let mapAttrs;
  const InitPage = async () => {
    columns.value = [];
    columnChecks.value = {};
    haveShowColums.value = ',';
    if (props.params.DoType === 'Ens') {
      enEntity = new BSEntity('BP.Sys.EnCfg');
      enEntity.setPK(props.params.PKVal);
      await enEntity.RetrieveFromDBSources();
      const orignAttrs = await enEntity.DoMethodReturnJSON('GenerAttrs');
      const showColModel = enEntity.data.ShowColModel || 0;
      if (showColModel == 0) mapAttrs = orignAttrs;
      if (showColModel == 1) {
        mapAttrs = [];
        const ens = new EnSearchCols();
        await ens.Retrieve(MapExtAttr.FK_MapData, enEntity.No, 'ExtModel', 'SearchCol', 'Idx');
        ens.forEach((en) => {
          const item = orignAttrs.find((attr) => attr.KeyOfEn == en.AttrOfOper);
          mapAttrs.push(item);
        });
      }
      console.log(props.params);
    }
    if (props.params.DoType === 'Dtl') {
      enEntity = new MapDtl(props.params.PKVal);
      await enEntity.RetrieveFromDBSources();
      mapAttrs = new MapAttrs();
      await mapAttrs.Retrieve('FK_MapData', props.params.PKVal, 'Idx');
    }
    if (props.params.DoType === 'Bill' || props.params.DoType === 'Dict') {
      enEntity = new MapData(props.params.PKVal);
      await enEntity.RetrieveFromDBSources();
      const orignAttrs = new MapAttrs();
      await orignAttrs.Retrieve('FK_MapData', props.params.PKVal, 'Idx');
      const showColModel = enEntity.ShowColModel || 0;
      if (showColModel == 0) mapAttrs = orignAttrs;
      if (showColModel == 1) {
        mapAttrs = [];
        const ens = new EnSearchCols();
        await ens.Retrieve(MapExtAttr.FK_MapData, enEntity.No, 'ExtModel', 'SearchCol', 'Idx');
        ens.forEach((en) => {
          const item = orignAttrs.find((attr) => attr.KeyOfEn == en.AttrOfOper);
          mapAttrs.push(item);
        });
      }
    }
    InitColumn();
    console.log(columns.value);
  };
  /**
   * 初始化从表表头信息
   * @constructor
   */
  const haveShowColums = ref(',');
  const secondHeader = ref(',');
  const gradeHeader = ref(',');
  const secondArr = ref<string[]>([]);
  const gradeArr = ref<string[]>([]);
  const InitColumn = () => {
    //二级表头
    secondHeader.value = GetPara(props.params.DoType === 'Ens' ? enEntity.data.AtPara : enEntity.AtPara, 'MultiTitle') || '';
    secondArr.value = secondHeader.value.split(';');
    //三级表头
    gradeHeader.value = GetPara(props.params.DoType === 'Ens' ? enEntity.data.AtPara : enEntity.AtPara, 'MultiTitle1') || '';
    gradeArr.value = gradeHeader.value.split(';');
    mapAttrs
      .filter((mapAttr) => parseInt(mapAttr.UIVisible) === 1)
      .forEach((attr) => {
        if (gradeHeader.value.includes(',' + attr.KeyOfEn + ',') == false && secondHeader.value.includes(',' + attr.KeyOfEn + ',') == false) {
          columns.value.push(SetColumnByAttr(attr));
          columnChecks.value[attr.KeyOfEn] = false;
        }
        //在三级目录下面
        if (gradeHeader.value.includes(',' + attr.KeyOfEn + ',') == true) {
          const str = gradeArr.value.find((item) => item.includes(',' + attr.KeyOfEn + ',')) || '';
          const strs = str.split(',');
          if (str != '' && haveShowColums.value.includes(',' + strs[0] + ',') == false) {
            haveShowColums.value += strs[0] + ',';
            columns.value.push({
              title: strs[0],
              key: strs[0],
              children: GetChildren(strs, null),
            });
            columnChecks.value[strs[0]] = false;
          }
        }
        //在二级目录下面
        if (secondHeader.value.includes(',' + attr.KeyOfEn + ',') == true) {
          let str = secondArr.value.find((item) => item.includes(',' + attr.KeyOfEn + ',')) || '';
          let strs = str.split(',');
          if (str != '' && haveShowColums.value.includes(',' + strs[0] + ',') == false) {
            //需要先判断二级目录是否在三级目录下
            if (gradeHeader.value.includes(',' + strs[0] + ',') == true) {
              str = gradeArr.value.find((item) => item.includes(',' + strs[0] + ',')) || '';
              strs = str.split(',');
              if (str != '' && haveShowColums.value.includes(',' + strs[0] + ',') == false) {
                haveShowColums.value += strs[0] + ',';
                columns.value.push({
                  title: strs[0],
                  key: strs[0],
                  children: GetChildren(strs, null),
                });
                columnChecks.value[strs[0]] = false;
              }
            } else {
              haveShowColums.value += strs[0] + ',';
              columns.value.push({
                title: strs[0],
                key: strs[0],
                children: GetChildren(null, strs),
              });
              columnChecks.value[strs[0]] = false;
            }
          }
        }
      });
  };
  /**
   * 获取表头的子级
   * @param grade
   * @param second
   * @constructor
   */
  const GetChildren = (grade: string[] | null, second: string[] | null) => {
    let curColumns: any[] = [];
    if (grade != null) {
      //获取grade的子级
      for (let i = 1; i < grade.length; i++) {
        const key = grade[i];
        if (key === '') continue;
        //判断是否在mapAttr中，不存在是二级目录
        const attr = mapAttrs.filter((item) => item.KeyOfEn === key && parseInt(item.UIVisible) === 1);
        if (attr.length != 0) {
          curColumns.push(SetColumnByAttr(attr[0]));
          continue;
        }
        haveShowColums.value += key + ',';
        const str = secondArr.value.find((item) => item.includes(key + ',')) || '';
        curColumns.push({
          title: key,
          key: key,
          children: GetChildren(null, str.split(',')),
        });
      }
    }
    if (second != null) {
      //second
      for (let i = 1; i < second.length; i++) {
        const key = second[i];
        if (key === '') continue;
        //判断是否在mapAttr中
        const attr = mapAttrs.filter((item) => item.KeyOfEn === key && parseInt(item.UIVisible) === 1);
        if (attr.length != 0) {
          curColumns.push(SetColumnByAttr(attr[0]));
          continue;
        }
      }
    }
    return curColumns;
  };
  const SetColumnByAttr = (attr) => {
    const column = ref<any[]>([]);
    column.value['title'] = attr.Name;
    column.value['key'] = attr.KeyOfEn;
    column.value['align'] = 'center'; //居中
    //column.value['resizable'] = true;
    //column.value['ellipsis'] = true;
    return column.value;
  };
  //增加一级表头
  const AddGroup = async () => {
    let selectKeys = ',';
    for (const key in columnChecks.value) {
      if (columnChecks.value[key] === true) selectKeys += key + ',';
    }
    let selectAttrs: any[] = [];
    let isLX = true;
    let keyIdx = 0;
    mapAttrs
      .filter((mapAttr) => parseInt(mapAttr.UIVisible) === 1)
      .forEach((mapAttr, index) => {
        if (selectKeys.includes(',' + mapAttr.KeyOfEn + ',')) {
          if (keyIdx === 0) keyIdx = index;
          else if (keyIdx + 1 != index) {
            isLX = false;
          }
          keyIdx = index;
          selectAttrs.push(mapAttr.KeyOfEn);
        }
      });
    if (selectAttrs.length <= 1) {
      message.error('增加一级表头选择的列至少选择两列');
      return;
    }
    //判断是否连续
    if (isLX === false) {
      message.error('所选的列不连续！');
      return;
    }

    // 选择的字段，在历史的选择中出现也是错误的.
    if (!!secondHeader.value) {
      for (const key in selectAttrs) {
        if (secondHeader.value.includes(',' + key + ',')) {
          message.error('错误:该列已经选择过.');
          return;
        }
      }
    }
    //获取分组名称；
    const name = window.prompt('输入一级表头名称', '');
    if (name == null) return;
    //检查名称是否重复
    if (!!secondHeader.value && secondHeader.value.includes(name + ',')) {
      message.error('错误:名称已经存在.');
      return;
    }
    //拼接目标数据.
    secondHeader.value += name + ',' + selectAttrs.join(',') + ',' + ';';
    //赋值
    if (props.params.DoType === 'Ens') enEntity.setPara('MultiTitle', secondHeader.value);
    else enEntity.SetPara('MultiTitle', secondHeader.value);
    await enEntity.Update();
    await InitPage();
  };
  //增加二级表头
  const AddGroup2 = async () => {
    //检查设置的完整性.
    //求出来选择的字段.
    let selectKeys = '';
    for (const key in columnChecks.value) {
      if (columnChecks.value[key] === true) selectKeys += key + ',';
    }
    // 1. 选择的数量小于等于1 是错误的.
    const fls = selectKeys.split(',');
    if (fls.length - 1 <= 1) {
      message.error('所选的分组不可少于一列');
      return;
    }
    // 2. 选择的没有按照连续选择，也是错误的.
    let curIdx = 0;
    for (let idx = 0; idx < mapAttrs.length; idx++) {
      const attr = mapAttrs[idx];
      if (parseInt(attr.UIVisible) == 0) {
        if (curIdx != 0) curIdx++;
        continue;
      }
      if (selectKeys.includes(mapAttrs[idx].KeyOfEn + ',')) {
        if (curIdx != 0 && curIdx + 1 != idx) {
          message.error('所选的列不连续！');
          return;
        }
        curIdx = idx;
      } else {
        const secFile = getMutliFile(mapAttrs[idx].KeyOfEn, secondHeader.value);
        if (secFile != '' && selectKeys.includes(secFile[0] + ',')) {
          if (secondHeader.value.includes(mapAttrs[idx].KeyOfEn + ',')) {
            if (curIdx != 0 && curIdx + 1 != idx) {
              alert('所选的列不连续！');
              return;
            }
            curIdx = idx;
          }
        }
      }
    }

    // 3. 选择的字段，在历史的选择中出现也是错误的.
    if (!!gradeHeader.value) {
      for (let i = 0; i < fls.length; i++) {
        if (gradeHeader.value.includes(',' + fls[i] + ',')) {
          message.error('错误:该列已经选择过.');
          return;
        }
      }
    }
    //获取分组名称；
    const name = window.prompt('输入二级表头名称', '');
    if (name == null) return;
    //检查名称是否重复
    if (gradeHeader.value && gradeHeader.value.includes(name + ',')) {
      message.error('错误:名称已经存在.');
      return;
    }

    //拼接目标数据.
    gradeHeader.value += name + ',' + selectKeys + ';';

    //赋值
    if (props.params.DoType === 'Ens') enEntity.setPara('MultiTitle1', gradeHeader.value);
    else enEntity.SetPara('MultiTitle1', gradeHeader.value);
    await enEntity.Update();
    await InitPage();
  };
  const getMutliFile = (keyOfEn, multi) => {
    const fields = multi.split(';');
    for (let i = 0; i < fields.length; i++) {
      const str = fields[i];
      if (str == '') continue;
      if (str.includes(',' + keyOfEn + ',') == false) continue;
      const strs = str.substring(0, str.length - 1).split(',');
      return strs;
    }
    return '';
  };
  //清空设置
  const ClearAll = async () => {
    if (props.params.DoType === 'Ens') {
      enEntity.setPara('MultiTitle', '');
      enEntity.setPara('MultiTitle1', '');
    } else {
      enEntity.SetPara('MultiTitle', '');
      enEntity.SetPara('MultiTitle1', '');
    }

    await enEntity.Update();
    await InitPage();
  };
  //移除表头
  const DeleteSpecTitle = async (title) => {
    if (window.confirm('您确定要删除【' + title + '】吗?') == false) return;
    //如果二级表头包含在一级表头中不能移除
    if (gradeHeader.value.includes(',' + title + ',') && secondHeader.value.includes(title + ',')) {
      message.warn('二级表头包含在一级表头中请先删除');
      return;
    }
    let multiType = 0; //二级表头
    //一级表头
    if (gradeHeader.value.includes(title + ',') && secondHeader.value.includes(title + ',') === false) multiType = 1;
    //按照;分开.
    let strs: any[] = [];
    if (multiType == 0) strs = secondHeader.value.split(';');
    else strs = gradeHeader.value.split(';');

    let newTitle = ''; //创建新的strs.
    for (let i = 0; i < strs.length; i++) {
      const str = strs[i];
      if (str.indexOf(title + ',') == 0) continue;
      newTitle += str + ';'; //重新组合newtitle.
    }
    newTitle = newTitle.substr(0, newTitle.length - 1);
    if (props.params.DoType === 'Ens') {
      if (multiType == 0) enEntity.setPara('MultiTitle', newTitle);
      else enEntity.setPara('MultiTitle1', newTitle);
    } else {
      if (multiType == 0) enEntity.SetPara('MultiTitle', newTitle);
      else enEntity.SetPara('MultiTitle1', newTitle);
    }

    await enEntity.Update();
    await InitPage();
  };
  InitPage();
</script>

<style scoped></style>
