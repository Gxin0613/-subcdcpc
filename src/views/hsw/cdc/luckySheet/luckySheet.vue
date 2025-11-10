<!--在线编辑-->
<template>
  <div>
    <el-dialog title="表格编辑" v-model="localTableOpen" width="80%" :close-on-click-modal="false" append-to-body @opened="handleDialogOpened" @close="handleDialogClose">
      <div :id="containerId" :key="Math.random()" style="margin: 0px; padding: 0px; width: 100%; height: 500px"></div>
      <!--    <button @click="outputExcel">导出Excel</button>-->
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handlSave">保 存</el-button>
          <el-button @click="handleDialogClose">关 闭</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog title="提示" v-model="dialogVisible" width="30%" class="dialog" :close-on-click-modal="false" append-to-body>
      <el-upload class="upload-demo" action="" :on-change="fileChange" drag accept=".xlsx" style="width: 100%" :auto-upload="false">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <div class="el-upload__tip">只能上传xlsx文件，且不超过500kb</div>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="doImport">确 定</el-button>
          <el-button @click="cancelImport()">取 消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script>
  import LuckyExcel from 'luckyexcel';
  import ExcelJS from 'exceljs';
  import { exportExcel } from '/@/views/hsw/utils/export.js';
  import { download, upload } from '/@/api/hsw/cdc/testMethod/cdcTStep';

  // import   ExcelJS from ' exceljs';
  // import { excelOptions } from "@/common/common.js"
  // import luckysheet from "luckysheet";
  // import { Univer } from '@univerjs/core';
  // import { UniverSheetsPlugin } from '@univerjs/sheets';

  // import $ from 'jquery';
  // import LuckySheet from 'luckysheet';
  // import 'luckysheet/dist/plugins/css/pluginsCss.css';
  // import 'luckysheet/dist/plugins/plugins.css';
  // import 'luckysheet/dist/css/luckysheet.css';
  // import 'luckysheet/dist/assets/iconfont/iconfont.css';
  export default {
    name: 'Luckysheet',
    data() {
      return {
        excelTitel: '6666',
        dialogVisible: false,
        options: undefined,
        savedSheetData: {},
        currentComponentId: '',
        localComponentId: '',
        localTableOpen: false,
        tableOpen: false,
        methodName: undefined, //检测项目名称
        methodRow: undefined,
        //检测步骤当前行
        stepRow: undefined,
        tableType: undefined, //当前表格类型
        //当前表格缓存数据
        excelData: {},
      };
    },

    computed: {
      containerId() {
        return `luckysheet_${this.localComponentId}`;
      },
    },
    watch: {
      currentComponentId(newVal) {
        this.localComponentId = newVal;
      },
      tableOpen(newVal) {
        this.localTableOpen = newVal;
        if (!newVal && window.luckysheet) {
          window.luckysheet.destroy();
          document.getElementById(this.containerId).innerHTML = '';
        }
      },
    },

    mounted() {
      window.handleOutClick = () => {
        this.outputExcel();
      };
      window.handleInClick = () => {
        this.openUpDialog();
      };
      // window.outputExcel = this.outputExcel();
    },
    beforeUnmount() {
      // 组件销毁时移除全局方法
      window.handleDynamicClick = null;
    },
    methods: {
      init(data) {
        this.$nextTick(() => {
          const container = document.getElementById(this.containerId);
          if (!container) {
            console.error('Luckysheet container not found:', this.containerId);
            return;
          }
          // 销毁现有实例并清空容器
          if (window.luckysheet) {
            window.luckysheet.destroy();
          }
          container.innerHTML = '';
          this.options = {
            container: this.containerId, // 使用动态容器ID
            title: this.methodRow.name, //表 头名
            lang: 'zh', //中文
            gridKey: 'ceshi123',
            allowUpdate: true,
            sheetFormulaBar: true,
            allowCopy: true,
            showinfobar: true, //是否隐藏信息栏
            forceCalculation: true,
            showSheetBar: false,
            // editMode:'click',
            enableEdit: true,
            functionButton:
              '<button id="load" class="btn btn-primary" onclick="window.handleOutClick()" style="padding:3px 6px;font-size: 12px;margin-right: 10px;">下载</button> <button id="" class="btn btn-primary btn-danger" onclick="window.handleInClick()"  style=" padding:3px 6px; font-size: 12px; margin-right: 10px;">导入</button>',
            showtoolbarConfig: {
              undoRedo: true,
              paintFormat: true,
              currencyFormat: true,
              percentageFormat: true,
              numberDecrease: true,
              numberIncrease: true,
              moreFormats: true,
              font: true,
              fontSize: true,
              bold: true,
              italic: true,
              strikethrough: true,
              underline: true,
              textColor: true,
              fillColor: true,
              border: true,
              mergeCell: true,
              horizontalAlignMode: true,
              verticalAlignMode: true,
              textWrapMode: true,
              textRotateMode: true,
              image: true,
              link: true,
              chart: true,
              postil: true,
              pivotTable: true,
              function: true,
              frozenMode: true,
              sortAndFilter: true,
              conditionalFormat: true,
              dataVerification: true,
              splitColumn: true,
              screenshot: true,
              findAndReplace: true,
              protection: true,
              print: true,
            },
            data: data ||
              this.savedSheetData[this.localComponentId] || [
                {
                  name: 'Sheet1',
                  color: '',
                  index: 1,
                  status: 0,
                  order: 1,
                  celldata: [],
                  config: {},
                },
              ],
          };
          this.$nextTick(() => {
            console.log(window.luckysheet);
            window.luckysheet.create(this.options);
          });

        });
      },

      //父组件传值-用来回显表格
      handleDialogOpened() {
        this.$nextTick(() => {
          const data = this.savedSheetData[this.localComponentId];
          //修改时查询文件
          if (this.stepRow && this.stepRow['table' + this.tableType]) {
            download(this.stepRow['table' + this.tableType]).then((res) => {
              // const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
              const blob = new Blob([res], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              });
              //下载文件
              // const downloadUrl = window.URL.createObjectURL(blob);
              // const a = document.createElement('a');
              // a.href = downloadUrl;
              // a.download = 'download.xlsx';
              // document.body.appendChild(a);
              // a.click();
              // document.body.removeChild(a);
              // window.URL.revokeObjectURL(downloadUrl);

              LuckyExcel.transformExcelToLucky(blob, (exportJson) => {
                if (!exportJson.sheets) return;
                // window.luckysheet.destroy();
                this.init(exportJson.sheets);
              });
            });
          } else {
            // console.log(data);
            // console.log(this.savedSheetData);
            // console.log(window.luckysheet);
            this.init(data);
          }
        });
      },
      handleDialogClose() {
        // this.localTableOpen = false;
        this.tableOpen = false;
        // this.$emit('update:tableOpen', false);
      },
      excelFeedback(item) {
        // this.$nextTick(() => {
        // if (this.excelData.length == 0) {
        //   this.currentComponentId = Math.random();
        // }
        // })
        // if (item) {
        //   const cellData = JSON.parse(item);
        //   this.savedSheetData[this.localComponentId] = cellData;
        // } else {
        //   this.savedSheetData[this.localComponentId] = null;
        // }
      },
      //刷新初始化
      reset() {
        this.excelData = {};
        this.savedSheetData = {};
        this.methodRow = undefined;
        this.stepRow = undefined;
      },
      //保存
      handlSave() {
        luckysheet.exitEditMode(); // 退出编辑模式
        this.savedSheetData[this.localComponentId] = luckysheet.getAllSheets(); // 按组件ID保存表格数据
        // window.luckysheet.destroy();
        //文件导出并上产
        this.exportAndUpload();
        this.localTableOpen = false;
        this.$emit('update:tableOpen', false);
      },

      exportWithLuckyExcel() {
        let opt = excelOptions();
        // 检测本地库中是否有配置
        let excelValue = window.localStorage.getItem('excelValue');
        if (excelValue != null) {
          //有值
          let checkExcelValue = JSON.parse(excelValue);
          opt.data[0] = checkExcelValue;
        }
        this.changeExcelOption = opt;
        luckysheet.create(opt);
        // 保存初始表格名称
        this.excelTitel = this.changeExcelOption.title;
      },
      // 保存excel数据
      saveExcel() {
        var objsheet = luckysheet.getAllSheets(); // 得到表的数据
        // options = objsheet // 将表的数据保存本地

        // 获取标内容更新变化
        luckysheet.setWorkbookName(this.excelTitel);
        this.changeExcelOption.title = this.excelTitel;
      },

      // 导出表格
      outputExcel() {
        // console.log(luckysheet.getLuckysheetfile())
        let fileName = this.methodRow.name + '_' + this.methodRow.id;
        // this.exportAndUpload();
        exportExcel(luckysheet.getAllSheets(), fileName);
        // this.exportExcel(luckysheet.getLuckysheetfile());
        // const sheets = luckysheet.getAllSheets(); // 获取所有 sheet 数据
        // 清理数据
        // const cleanedSheets = sheets.map(sheet => ({
        //   ...sheet,
        //   celldata: sheet.celldata?.map(cell => cell || {}) ?? []
        // }));
        // LuckyExcel.transformExcelToLucky(sheets, "export.xlsx", (exportData) => {
        //   LuckyExcel.downloadExcel(exportData, "export.xlsx");
        // });
        // this.exportExcel();
        // try {
        //   const sheets = luckysheet.getAllSheets();
        //   LuckyExcel.transformExcelToLucky(sheets, "export.xlsx", (data) => {
        //     if (data) {
        //       LuckyExcel.downloadExcel(data, "export.xlsx");
        //     } else {
        //       this.exportWithSheetJS(); // 降级到 SheetJS
        //     }
        //   });
        // } catch (err) {
        //   console.error("LuckyExcel 导出失败，改用 SheetJS:", err);
        //   this.exportWithSheetJS();
        // }
      },

      //文件保存并上产
      async exportAndUpload() {
        const workbook = new ExcelJS.Workbook();
        const sheets = luckysheet.getAllSheets();
        sheets.forEach((sheet) => {
          const worksheet = workbook.addWorksheet(sheet.name);
          const data = luckysheet.getSheetData(sheet.index);
          // 填充数据到Excel工作表
          data.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
              if (cell != null) {
                const excelCell = worksheet.getCell(rowIndex + 1, colIndex + 1);
                excelCell.value = cell.v; // v是Luckysheet单元格的值
                // 可选：设置样式
                if (cell.ct) {
                  excelCell.numFmt = this.getNumberFormat(cell.ct.fa);
                }
              }
            });
          });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        // let fileName = ""
        let stepId = this.stepRow == undefined ? 'stepId' : this.stepRow.id;
        // 上传服务器
        let fileName = this.methodRow.name + '_' + this.methodRow.id + '_' + stepId + '_' + this.tableType + '.xlsx';
        const formData = new FormData();
        formData.append('file', blob, fileName);
        formData.append('flag', this.tableType);
        //id不存在需要缓存
        if (!this.stepRow) {
          // fileName = this.methodRow.name + "_" + this.methodRow.id;
          // formData.append('file', blob, fileName);
          // this.$emit('saveLists', formData);
          this.excelData['table' + this.tableType] = formData;
          //执行保存操作
        } else {
          formData.append('stepId', this.stepRow.id);
          upload(formData).then((res) => {
            console.log(res);
            this.savedSheetData = [];
          });
        }
        // console.log( this.excelData)
        // await fetch( process.env.VUE_APP_BASE_API +'/cdc/step/upload', {
        //    method: 'POST',
        //    body: formData
        //  });
      },
      getNumberFormat(format) {
        const formats = {
          0: '0',
          '0.00': '0.00',
          '#,##0': '#,##0',
          '#,##0.00': '#,##0.00',
          '0%': '0%',
          '0.00%': '0.00%',
        };
        return formats[format] || undefined;
      },
      //lucksheet仅文件保存
      uploadSaves(stepId, stepRow) {
        let i = 0;
        let keys = Object.keys(this.excelData);
        for (let key in this.excelData) {
          let formData = this.excelData[key];
          let fileName = this.methodRow.name + '_' + this.methodRow.id + '_' + stepId + '_' + key.replace('table', '') + '.xlsx';
          stepRow[key] = fileName;
          stepRow.id = stepId;
          this.$emit('updateStepByLuckySheet', stepRow);
          const file = formData.get('file');
          formData.set('file', file, fileName);
          formData.append('stepId', stepId);
          upload(formData).then((resExcel) => {
            console.log('文件上传');
            i++;
            if (i == keys.length) {
              // this.excelData = {}
              this.savedSheetData = [];
            }
          });
        }
      },

      exportWithSheetJS() {
        import('xlsx').then((XLSX) => {
          const sheetData = luckysheet.getSheetData();
          const ws = XLSX.utils.aoa_to_sheet(sheetData);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
          XLSX.writeFile(wb, 'export_fallback.xlsx');
        });
      },
      borderConvert(borderType, style, color) {
        // 对应luckysheet的config中borderinfo的的参数
        if (!borderType) {
          return {};
        }
        const luckyToExcel = {
          type: {
            'border-all': 'all',
            'border-top': 'top',
            'border-right': 'right',
            'border-bottom': 'bottom',
            'border-left': 'left',
          },
          style: {
            0: 'none',
            1: 'thin',
            2: 'hair',
            3: 'dotted',
            4: 'dashDot', // 'Dashed',
            5: 'dashDot',
            6: 'dashDotDot',
            7: 'double',
            8: 'medium',
            9: 'mediumDashed',
            10: 'mediumDashDot',
            11: 'mediumDashDotDot',
            12: 'slantDashDot',
            13: 'thick',
          },
        };
        let template = {
          style: luckyToExcel.style[style],
          color: { argb: color.replace('#', '') },
        };
        let border = {};
        if (luckyToExcel.type[borderType] === 'all') {
          border['top'] = template;
          border['right'] = template;
          border['bottom'] = template;
          border['left'] = template;
        } else {
          border[luckyToExcel.type[borderType]] = template;
        }
        return border;
      },

      // 导入表格
      importExcel(event) {
        let file = event.target.files[0];
        let that = this;
        const types = file.name.split('.')[1];
        // 判断类型
        const fileType = ['xlsx'].some((item) => item === types);
        // console.log(file)
        if (!fileType) {
          alert('只支持上传xlsx后缀的表格!');
          return;
        }
        LuckyExcel.transformExcelToLucky(file, (exportJson, luckysheetfile) => {
          if (exportJson.sheets === null || exportJson.sheets.length === 0) {
            this.$message.error('无法读取excel文件的内容，当前不支持xls文件！');
            return;
          }
          window.luckysheet.destroy();
          this.changeExcelOption.data = exportJson.sheets;
          window.luckysheet.create(this.changeExcelOption);
        });
      },
      // 打开上传更换弹窗
      openUpDialog() {
        this.dialogVisible = true;
      },
      // 上传文件变化
      fileChange(file) {
        this.file = file.raw;
      },
      // 执行上传确认操作
      doImport() {
        if (!this.file) return;
        this.uploadExcel();
        this.dialogVisible = false;
      },
      // 取消上传
      cancelImport() {
        this.file = null;
        this.dialogVisible = false;
      },
      // 本地导入
      uploadExcel() {
        // this.init();
        LuckyExcel.transformExcelToLucky(this.file, (exportJson) => {
          console.log(this.file, exportJson, '导入');
          if (exportJson.sheets == null || exportJson.sheets.length == 0) {
            alert('当前仅支持xlsx文件导入!');
            return;
          }

          exportJson.sheets = exportJson.sheets.map((sheet) => {
            if (sheet.celldata) {
              sheet.celldata = sheet.celldata.map((cell) => {
                if (cell.v && cell.v.f) {
                  // 移除多余的前导"="
                  cell.v.f = cell.v.f.replace(/^=+/, '=');
                  // 设置显示值
                  cell.v.m = `=${cell.v.f}`;
                }
                return cell;
              });
            }
            return sheet;
          });
          // window.luckysheet.destroy();
          // luckysheet.create({
          //   container: 'luckysheet',
          //   data: exportJson.sheets
          // });

          // console.log(exportJson);
          window.luckysheet.destroy();
          this.options.data = exportJson.sheets;
          console.log(this.options.data, '导入得水');
          window.luckysheet.create(this.options);
        });
      },
    },
  };
</script>

<style>
  /** 隐藏 Luckysheet Logo *!*/
  .luckysheet-info-logo {
    display: none !important;
  }

  /*隐藏返回按钮 */
  .luckysheet-info-return {
    display: none !important;
  }

  .luckysheet-share-logo {
    display: none;
  }

  .fa-angle-left:before {
    display: none;
  }

  .luckysheet_info_detail div.luckysheet_info_detail_back {
    display: none;
  }

  .luckysheet_info_detail_update {
    display: none;
  }

  .luckysheet_info_detail_save {
    display: none;
  }

  .luckysheet-cols-menu {
    z-index: 9999;
  }
</style>
