<template>
   <div class="p-5">
    <Table :columns="columns" :data-source="tableData" bordered size="small" :pagination="false" :scroll="{ y: 'calc(100vh - 160px)' }">
      <template #headerCell="{ column }">
        <div style="text-align: center;">
          <template v-if="column.key === 'KeyOfEn'">
            <span>{{column.title}}</span>
          </template>
          <template v-else>
            <span>{{column.customTitle.titlePart1}}</span><br/><span>{{column.customTitle.titlePart2}}</span>
          </template>
        </div> 
    </template>
    </Table>
   </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import {  message, Table } from 'ant-design-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
 

  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  const loading = ref(false);
  const columns = ref<Record<string,any>[]>([]);
  const tableData = ref<Record<string,any>[]>([]);
  const frmDBVers = ref();
  const mapAttrs = ref();
  const mapDtls = ref();
  const aths = ref();

  //初始化方法
  const InitPage = async () => {
    try {
      loading.value = true;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddJson(props.params);
      const data = await handler.DoMethodReturnJson('FrmDBVer_CompareAll');
      mapAttrs.value = data.Sys_MapAttr;
      frmDBVers.value = data.Sys_FrmDBVer;
      mapDtls.value = data.Sys_MapDtl;
      aths.value = data.Sys_FrmAttachment;
      InitColumn();
      InitTable();
    } catch (e: any) {
      message.error(e.toString());
      console.trace(e.toString());
    } finally {
      loading.value = false;
    }
  };
  //列的处理
  const InitColumn=()=>{
    columns.value.push({
      key: 'KeyOfEn',
      title: '数据项',
      dataIndex: 'KeyOfEn',
    });
    frmDBVers.value.forEach(item=>{
      columns.value.push({
        key: item.NodeID+'-'+item.RecNo,
        dataIndex: item.NodeID+'-'+item.RecNo,
        title:'',
        customTitle: { 
          titlePart1: item.RecName,
          titlePart2: item.NodeName
        }
        //title: '<span>'+item.RecName+'</span><br/><span>'+item.NodeName+'</span>',
        //customHeaderCell: (text) => ({ html: text }), 
       
      });
    })
  }
  const InitTable=()=>{
    const map:Record<string, any> = {};
    const mapKeyVal:Record<string,string> = {};
    map['RDT']=[];
    mapKeyVal.RDT ='修改日期';
    mapAttrs.value.forEach(attr=>{
      map[attr.KeyOfEn]=[];
      mapKeyVal[attr.KeyOfEn] = attr.Name;
    });
    mapDtls.value.forEach(mapDtl=>{
      const no= mapDtl.Alias || mapDtl.No;
      map[no] = [];
      mapKeyVal[no] = mapDtl.Name;
    })
    aths.value.forEach(ath=>{
      map[ath.NoOfObj] = [];
      mapKeyVal[ath.NoOfObj] = ath.Name;
    })
    //记录上一个 MyPK
    frmDBVers.value.forEach(dbVer=>{
      //主表字段
      const frmDB = JSON.parse(dbVer.FrmDB);
      map['RDT'].push(dbVer.RDT);
      for(const key in frmDB){
        if(key==='RDT' || map[key]==undefined)
          continue;
        map[key].push(frmDB[key+'Text'] || frmDB[key+'T'] || frmDB[key]);
      }
      //从表
      const mapDtls = JSON.parse(dbVer.FrmDtlDB);
      for(const key in mapDtls){
        if(map[key]==undefined)
          continue;
        map[key].push(mapDtls[key]);
      }
      //附件
      const aths = JSON.parse(dbVer.FrmAthDB);
      for(const key in aths){
        if(map[key]==undefined)
          continue;
        map[key].push(aths[key]);
      }
    });
    for(const key in map){
      const item={};
      columns.value.forEach((obj,index)=>{
        if(obj.key === 'KeyOfEn'){
          item['KeyOfEn'] = mapKeyVal[key];
        }else{
          const idx = index-1;
          const val = map[key][idx];
          const oldVal = map[key][idx-1];
          //从表、附件
          if(Array.isArray(val)){
              if(idx == 0) item[obj.key] = '初始值';
              else{
                if(JSON.stringify(val) == JSON.stringify(oldVal))
                  item[obj.key] = '无变化';
                else item[obj.key] = '有变化';
              }
          }else{
            if(idx == 0) item[obj.key] = val;
            else{
              if(val===oldVal)item[obj.key] ='●'
              else item[obj.key] = val;
            }
          }
          
        }
      })
      tableData.value.push(item);
    }
  }
  InitPage();
</script>

<style scoped>

  .ant-table-thead th {
    white-space: pre-line; /* 识别 \n 换行 */
  }
</style>
