<template>

    <vxe-grid ref="gridRef" v-bind="gridOptions"
      @cell-menu="cellMenuEvent"
      @menu-click="menuClickEvent"
      @toolbar-button-click="toolbarButtonClickEvent"
    >
    <template v-for="slot in slots" #[slot]="data">
      <slot :name="slot" v-bind="data"></slot>
    </template>
    </vxe-grid>

</template>

<script>

import { VxeUI } from 'vxe-table'
import { getUserTableStyle,saveUserTableStyle } from '/@/api/hsw/cdc/common.js'
// 查询表格信息接口
const findCustomSetting = (id) => {
  return new Promise(resolve => {
    setTimeout(() => {
      try {
        if (sessionStorage.getItem(id)) {
          resolve(JSON.parse(sessionStorage.getItem(id) || ''))
          // VxeUI.modal.message({
          //   status: 'success',
          //   content: '异步还原用户个性化数据成功'
          // })
        } else {

          let params = {
            tabelNo:id
          }
          // getUserTableStyle(params).then(res=>{
          //   if(res.code == 200){
          //     if(res.data&&res.data.length==0){
          //       resolve({})
          //     }else{
          //       let reData = JSON.parse(res.data[0].content)
          //       resolve(reData)
          //     }
          //   }
          // })
          // resolve({})
        }
      } catch (e) {
        resolve({})
      }
    }, 500)
  })
}
// 保存表格信息接口
const saveCustomSetting = (id, storeData) => {
  return new Promise(resolve => {
    setTimeout(() => {
      sessionStorage.setItem(id, JSON.stringify(storeData))
      let params = {
        tabelNo:id,
        content:JSON.stringify(storeData)
      }
      saveUserTableStyle(params).then(res=>{
        if(res.code == 200){
          resolve()
        }else{
          VxeUI.modal.message({
            content: res.msg,
             status: 'error'
          })
        }
      })

    }, 200)
  })
}


export default {

  props:{
    tableConfig:{
      type:Object,
      default:()=>{}
    },
    tableData:{
      type:Array,
      default:()=>[]
    }
  },
  data () {
    const gridOptions = {

      pagerConfig:{
        enabled:true,
        layouts:['Total','PrevPage','Page','NextPage','Size','Jump'],
      },

       proxyConfig: {
        // props: {
        //   result: 'result', // 配置响应结果列表字段
        //   total: 'page.total' // 配置响应结果总页数字段
        // },
        ajax: {
          query: ({ page }) => {
            console.log(page,'lllooooo')
            // 默认接收 Promise<{ result: [], page: { total: 100 } }>
            return this.findPageList(page.pageSize, page.currentPage)
          }
        }
      },


      columnConfig: {
        drag: true,
        resizable: true
      },
      toolbarConfig: {
        custom: true
      },
      //隐藏排序图标
      sortConfig: {
        trigger: 'cell',
        showIcon: false
      },
      columnDragConfig: {
        showGuidesStatus: true,//开启列拖拽
        showIcon: false,//隐藏拖拽图标
        isCrossDrag: true,
        showGuidesStatus: true,
        trigger: 'cell'
        // icon: 'vxe-icon-arrow-down'
      },
      printConfig:{},
      customConfig: {
        storage: true,//本地储存开启
        // updateStore ({ storeData }) {
        //   // 模拟异步，实现服务端保存
        //   return saveCustomSetting(storeData)
        // }
        restoreStore ({ id }) {
          return findCustomSetting(id)
        },
        updateStore ({ id, storeData }) {
          // 模拟异步，实现服务端保存
          return saveCustomSetting(id, storeData)
        }
      },
      columns: this.tableConfig.columns || [],
      data: this.tableData || [],
    }
    return {
      gridOptions,
      // 此处放置不定义在columns中的插槽枚举
      staticSlots: ['form', 'top', 'bottom', 'pager'],
      //备份
      insertRecords:[]
    }
  },
   computed: {
    tableList(){
      return this.tableData
    },
    slots() {
      const columns = this.tableConfig.columns;
      // 获取定义在columns上的插槽
      const extendSlot = [];
      columns.forEach(col => {
        if (col.slots) {
          const slots = Object.values(col.slots);
          extendSlot.push(...slots);
        }
      });
      return [...this.staticSlots, ...extendSlot];
    }
  },
  watch:{
    tableConfig:{
      handler(newVal){
        console.log(newVal,'oooooooo')
        this.gridOptions.columns = newVal.columns
        this.gridOptions = {...this.gridOptions,...newVal.props}

      },
      immediate:true
    },
    tableData:{
      handler(newVal){
        this.gridOptions.data = newVal
      },
      immediate:true
    }
  },
  methods: {

    //右键方法
    cellMenuEvent ({ row }) {
      const $grid = this.$refs.gridRef
      if ($grid) {
        $grid.setCurrentRow(row)
      }
    },
    menuClickEvent ({ menu }) {
      VxeUI.modal.message({ content: `点击了 ${menu.code}`, status: 'success' })
    },
    // 模拟接口
    findPageList (pageSize, currentPage) {
      console.log(`调用查询接口 pageSize=${pageSize} currentPage=${currentPage}`)
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            result: this.tableList.slice((currentPage - 1) * pageSize, currentPage * pageSize),
            page: {
              total: this.tableList.length
            }
          })
        }, 100)
      })
    },
    //工具栏点击事件
    toolbarButtonClickEvent (params) {
      console.log(params.code)
      if(params.code == 'myAdd'){
        this.addEvent()
      }
    },
    //新增一行
    async addEvent () {
      const $grid = this.$refs.gridRef
      if ($grid) {
        const record = {

        }
        const newRow = await $grid.createRow(record)
        this.gridOptions.data.unshift(newRow)
        this.insertRecords.push(newRow)
        await this.$nextTick()
        $grid.setEditRow(newRow)
      }
    },
  }
}
</script>
