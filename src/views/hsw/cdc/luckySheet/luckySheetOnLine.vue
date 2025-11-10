<!--在线编辑-->
<template>
  <div>
    <div>
      <div id="luckysheet" style="width:100%; height:550px;"></div>
      <div style="width: 100%;text-align: center">
         <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
      </div>

      <!-- 隐藏的打印专用容器 -->
      <div id="print-table" style="display: none;">
        <div id="luckysheet-print-area"></div>
      </div>


    </div>
    <el-dialog title="提示" :visible.sync="dialogVisible" width="30%" class="dialog" :close-on-click-modal="false"
               append-to-body>
      <el-upload class="upload-demo" action="" :on-change="fileChange" drag accept=".xlsx" style="width: 100%"
                 :auto-upload="false">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <div class="el-upload__tip">只能上传xlsx文件，且不超过500kb</div>
      </el-upload>
      <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="doImport">确 定</el-button>
    <el-button @click="cancelImport()">取 消</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>

  import * as XLSX from 'xlsx';
  import LuckyExcel from 'luckyexcel';
  // import  ExcelJS from ' exceljs';
  // import { excelOptions } from "@/common/common.js"

  import FileSaver from "file-saver";


  // import $ from 'jquery';
  // import LuckySheet from 'luckysheet';
  // import 'luckysheet/dist/plugins/css/pluginsCss.css';
  // import 'luckysheet/dist/plugins/plugins.css';
  // import 'luckysheet/dist/css/luckysheet.css';
  // import 'luckysheet/dist/assets/iconfont/iconfont.css';
  export default {
    name: 'luckysheet',
    data() {
      return {
        excelTitel: "6666",
        dialogVisible: false,
        options: undefined,
        tableOpen: false,
      }
    },
    watch: {
      // tableOpen(val){
      //   if(val){
      //     this.$nextTick(() => {
      //       this.init()
      //     })
      //   }
      // },

    },
    mounted() {
      window.handleOutClick = () => {
        this.outputExcel();
      };
      window.handleInClick = () => {
        this.openUpDialog();
      };
      // window.outputExcel = this.outputExcel();

      const Excel = require('exceljs')
      this.$nextTick(() => {
        this.init()
        this.autoLoadLocalExcel('/files/66.xlsx')
      })
    },
    beforeUnmount() {
      // 组件销毁时移除全局方法
      window.handleDynamicClick = null;
    },
    methods: {
      init() {
        // console.log(luckysheet)
        this.options = {
          container: 'luckysheet', //luckysheet为容器id
          title: '大肠杆菌', //表 头名
          lang: 'zh', //中文
          gridKey: "ceshi123",
          allowUpdate: true,
          sheetFormulaBar: true,
          // column:"10",
          allowCopy: true,
          showinfobar: true,//是否隐藏信息栏
          forceCalculation: true,
          showSheetBar: false,
          functionButton: '<button id="load" class="btn btn-primary" onclick="window.handleOutClick()" style="padding:3px 6px;font-size: 12px;margin-right: 10px;">下载</button> <button id="" class="btn btn-primary btn-danger" onclick="window.handleInClick()"  style=" padding:3px 6px; font-size: 12px; margin-right: 10px;">导入</button>',
          // hook:{
          //   workbookCreateAfter:function () {
          //     // console.log(22222)
          //     document.getElementById("load").addEventListener('click',function () {
          //       // console.log(22222)
          //         this.outputExcel();
          //     })
          //
          //   }
          // },
          showtoolbarConfig: {
            undoRedo: true, //撤销重做，注意撤消重做是两个按钮，由这一个配置决定显示还是隐藏
            paintFormat: true, //格式刷
            currencyFormat: true, //货币格式
            percentageFormat: true, //百分比格式
            numberDecrease: true, // '减少小数位数'
            numberIncrease: true, // '增加小数位数
            moreFormats: true, // '更多格式'
            font: true, // '字体'
            fontSize: true, // '字号大小'
            bold: true, // '粗体 (Ctrl+B)'
            italic: true, // '斜体 (Ctrl+I)'
            strikethrough: true, // '删除线 (Alt+Shift+5)'
            underline: true, // '下划线 (Alt+Shift+6)'
            textColor: true, // '文本颜色'
            fillColor: true, // '单元格颜色'
            border: true, // '边框'
            mergeCell: true, // '合并单元格'
            horizontalAlignMode: true, // '水平对齐方式'
            verticalAlignMode: true, // '垂直对齐方式'
            textWrapMode: true, // '换行方式'
            textRotateMode: true, // '文本旋转方式'
            image: true, // '插入图片'
            link: true, // '插入链接'
            chart: true, // '图表'（图标隐藏，但是如果配置了chart插件，右击仍然可以新建图表）
            postil: true, //'批注'
            pivotTable: true,  //'数据透视表'
            function: true, // '公式'
            frozenMode: true, // '冻结方式'
            sortAndFilter: true, // '排序和筛选'
            conditionalFormat: true, // '条件格式'
            dataVerification: true, // '数据验证'
            splitColumn: true, // '分列'
            screenshot: true, // '截图'
            findAndReplace: true, // '查找替换'
            protection: true, // '工作表保护'
            print: true, // '打印'
          },
          data: [
            {
              "name": "Sheet1",
              "color": "",
              "index": 1,
              "status": 0,
              "order": 1,
              "celldata": [],
              "config": {}
            },
          ],
        }
        luckysheet.create(this.options)
      },

      printTable() {
        // 将 Luckysheet 表格内容复制到打印容器
        const source = document.querySelector('.luckysheet-cell-container');
        const target = document.querySelector('#luckysheet-print-area');
        target.innerHTML = source.innerHTML;

        // 触发打印
        this.$nextTick(() => {
          this.$print('#print-table');
        });
      },

      exportWithLuckyExcel() {
        let opt = excelOptions();
        // 检测本地库中是否有配置
        let excelValue = window.localStorage.getItem("excelValue");
        if (excelValue != null) {//有值
          let checkExcelValue = JSON.parse(excelValue)
          opt.data[0] = checkExcelValue;
        }
        this.changeExcelOption = opt;
        luckysheet.create(opt)
        // 保存初始表格名称
        this.excelTitel = this.changeExcelOption.title;
      },
      // 保存excel数据
      saveExcel() {
        var objsheet = luckysheet.getAllSheets() // 得到表的数据
        // options = objsheet // 将表的数据保存本地
        // console.log(objsheet)

        // 获取标内容更新变化
        luckysheet.setWorkbookName(this.excelTitel)
        this.changeExcelOption.title = this.excelTitel;
      },

      // 导出表格
      outputExcel() {
        this.exportExcel(luckysheet.getLuckysheetfile());
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
      exportWithSheetJS() {
        import("xlsx").then((XLSX) => {
          const sheetData = luckysheet.getSheetData();
          const ws = XLSX.utils.aoa_to_sheet(sheetData);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
          XLSX.writeFile(wb, "export_fallback.xlsx");
        });
      },


      async exportExcel(luckysheet) {
        const ExcelJS = require("exceljs");
        // 参数为luckysheet.getluckysheetfile()获取的对象
        // 1.创建工作簿，可以为工作簿添加属性
        const workbook = new ExcelJS.Workbook();
        // 2.创建表格，第二个参数可以配置创建什么样的工作表
        luckysheet.every((table) => {
          if (table.data.length === 0) return true;
          const worksheet = workbook.addWorksheet(table.name);
          // 3.设置单元格合并,设置单元格边框,设置单元格样式,设置值
          this.setStyleAndValue(table.data, worksheet);
          this.setMerge(table.config.merge, worksheet);
          this.setBorder(table.config.borderInfo, worksheet);
          return true;
        });
        // 4.写入 buffer
        const buffer = await workbook.xlsx.writeBuffer();
        //调用文件保存插件
        FileSaver.saveAs(
          new Blob([buffer], {type: "application/octet-stream"}),
          "66.xlsx"
        );
        return buffer;
      },

      setMerge(luckyMerge = {}, worksheet) {
        const mergearr = Object.values(luckyMerge);
        mergearr.forEach((elem) => {
          // elem格式：{r: 0, c: 0, rs: 1, cs: 2}
          // 按开始行，开始列，结束行，结束列合并（相当于 K10:M12）
          worksheet.mergeCells(elem.r + 1, elem.c + 1, elem.r + elem.rs, elem.c + elem.cs);
        });
      },

      setBorder(luckyBorderInfo, worksheet) {
        if (!Array.isArray(luckyBorderInfo)) return;
        luckyBorderInfo.forEach(function (elem) {
          var val = elem.value;
          let border = {};
          const luckyToExcel = {
            type: {
              "border-all": "all",
              "border-top": "top",
              "border-right": "right",
              "border-bottom": "bottom",
              "border-left": "left",
            },
            style: {
              0: "none",
              1: "thin",
              2: "hair",
              3: "dotted",
              4: "dashDot", // 'Dashed',
              5: "dashDot",
              6: "dashDotDot",
              7: "double",
              8: "medium",
              9: "mediumDashed",
              10: "mediumDashDot",
              11: "mediumDashDotDot",
              12: "slantDashDot",
              13: "thick",
            },
          };
          if (elem.rangeType === 'range') {
            let template = {
              style: luckyToExcel.style[elem.style],
              color: {argb: elem.color.replace("#", "")},
            };
            let border = {};
            if (luckyToExcel.type[elem.borderType] === "all") {
              border["top"] = template;
              border["right"] = template;
              border["bottom"] = template;
              border["left"] = template;
            } else {
              border[luckyToExcel.type[elem.borderType]] = template;
            }
            let rang = elem.range[0];
            // console.log('range', rang)
            let row = rang.row;
            let column = rang.column;
            for (let i = row[0] + 1; i < row[1] + 2; i++) {
              for (let y = column[0] + 1; y < column[1] + 2; y++) {
                worksheet.getCell(i, y).border = border;
              }
            }
          }


          // if (val) {
          //   if (val.t != undefined) {
          //     border["top"] = {
          //       style: luckyToExcel.style[val.t.style],
          //       color: val.t.color,
          //     };
          //   }
          //   if (val.r != undefined) {
          //     border["right"] = {
          //       style: luckyToExcel.style[val.r.style],
          //       color: val.r.color,
          //     };
          //   }
          //   if (val.b != undefined) {
          //     border["bottom"] = {
          //       style: luckyToExcel.style[val.b.style],
          //       color: val.b.color,
          //     };
          //   }
          //   if (val.l != undefined) {
          //     border["left"] = {
          //       style: luckyToExcel.style[val.l.style],
          //       color: val.l.color,
          //     };
          //   }
          //   worksheet.getCell(val.row_index + 1, val.col_index + 1).border = border;
          // }
        });
      },

      setStyleAndValue(cellArr, worksheet) {
        if (!Array.isArray(cellArr)) return;
        cellArr.forEach((row, rowid) => {
          row.every((cell, columnid) => {
            if (!cell) return true;
            let fill = this.fillConvert(cell.bg);
            let font = this.fontConvert(
              cell.ff,
              cell.fc,
              cell.bl,
              cell.it,
              cell.fs,
              cell.cl,
              cell.ul
            );
            let alignment = this.alignmentConvert(cell.vt, cell.ht, cell.tb, cell.tr);
            let value;
            if (cell.f) {
              value = {formula: cell.f, result: cell.v};
            } else {
              value = cell.v;
            }
            let target = worksheet.getCell(rowid + 1, columnid + 1);
            target.fill = fill;
            target.font = font;
            target.alignment = alignment;
            target.value = value;
            return true;
          });
        });
      },

      fillConvert(bg) {
        if (!bg) {
          return {
            type: "pattern",
            pattern: "solid",
            fgColor: {argb: "#ffffff".replace("#", "")},
          };
        }
        let fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {argb: this.colorHex(bg).replace("#", "")},
        };
        // console.log(fill);
        return fill;
      },
      //将rgb()转成16进制
      colorHex(color) {
        // RGB颜色值的正则
        var reg = /^(rgb|RGB)/;
        if (reg.test(color)) {
          var strHex = "#";
          // 把RGB的3个数值变成数组
          var colorArr = color.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
          // 转成16进制
          for (var i = 0; i < colorArr.length; i++) {
            var hex = Number(colorArr[i]).toString(16);
            if (hex === "0") {
              hex += hex;
            }
            strHex += hex;
          }
          return strHex;
        } else {
          return String(color);
        }
      },
      fontConvert(ff = 0, fc = "#000000", bl = 0, it = 0, fs = 10, cl = 0, ul = 0) {
        // luckysheet：ff(样式), fc(颜色), bl(粗体), it(斜体), fs(大小), cl(删除线), ul(下划线)
        const luckyToExcel = {
          0: "微软雅黑",
          1: "宋体（Song）",
          2: "黑体（ST Heiti）",
          3: "楷体（ST Kaiti）",
          4: "仿宋（ST FangSong）",
          5: "新宋体（ST Song）",
          6: "华文新魏",
          7: "华文行楷",
          8: "华文隶书",
          9: "Arial",
          10: "Times New Roman ",
          11: "Tahoma ",
          12: "Verdana",
          num2bl: function (num) {
            return num === 0 ? false : true;
          },
        };

        let font = {
          name: luckyToExcel[ff],
          family: 1,
          size: fs,
          color: {argb: fc.replace("#", "")},
          bold: luckyToExcel.num2bl(bl),
          italic: luckyToExcel.num2bl(it),
          underline: luckyToExcel.num2bl(ul),
          strike: luckyToExcel.num2bl(cl),
        };

        return font;
      },

      alignmentConvert(vt = "default", ht = "default", tb = "default", tr = "default") {
        // luckysheet:vt(垂直), ht(水平), tb(换行), tr(旋转)
        const luckyToExcel = {
          vertical: {
            0: "middle",
            1: "top",
            2: "bottom",
            default: "top",
          },
          horizontal: {
            0: "center",
            1: "left",
            2: "right",
            default: "left",
          },
          wrapText: {
            0: false,
            1: false,
            2: true,
            default: false,
          },
          textRotation: {
            0: 0,
            1: 45,
            2: -45,
            3: "vertical",
            4: 90,
            5: -90,
            default: 0,
          },
        };

        let alignment = {
          vertical: luckyToExcel.vertical[vt],
          horizontal: luckyToExcel.horizontal[ht],
          wrapText: luckyToExcel.wrapText[tb],
          textRotation: luckyToExcel.textRotation[tr],
        };
        return alignment;
      },

      borderConvert(borderType, style, color) {
        // 对应luckysheet的config中borderinfo的的参数
        if (!borderType) {
          return {};
        }
        const luckyToExcel = {
          type: {
            "border-all": "all",
            "border-top": "top",
            "border-right": "right",
            "border-bottom": "bottom",
            "border-left": "left",
          },
          style: {
            0: "none",
            1: "thin",
            2: "hair",
            3: "dotted",
            4: "dashDot", // 'Dashed',
            5: "dashDot",
            6: "dashDotDot",
            7: "double",
            8: "medium",
            9: "mediumDashed",
            10: "mediumDashDot",
            11: "mediumDashDotDot",
            12: "slantDashDot",
            13: "thick",
          },
        };
        let template = {
          style: luckyToExcel.style[style],
          color: {argb: color.replace("#", "")},
        };
        let border = {};
        if (luckyToExcel.type[borderType] === "all") {
          border["top"] = template;
          border["right"] = template;
          border["bottom"] = template;
          border["left"] = template;
        } else {
          border[luckyToExcel.type[borderType]] = template;
        }
        return border;
      },

      // 导入表格
      importExcel(event) {
        let file = event.target.files[0]
        let that = this;
        const types = file.name.split(".")[1];
        // 判断类型
        const fileType = ["xlsx"].some(
          item => item === types
        );
        // console.log(file)
        if (!fileType) {
          alert("只支持上传xlsx后缀的表格!")
          return
        }
        LuckyExcel.transformExcelToLucky(file, (exportJson, luckysheetfile) => {
          if (exportJson.sheets === null || exportJson.sheets.length === 0) {
            this.$message.error('无法读取excel文件的内容，当前不支持xls文件！')
            return
          }
          window.luckysheet.destroy()
          this.changeExcelOption.data = exportJson.sheets
          window.luckysheet.create(this.changeExcelOption)
        })
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
          if (exportJson.sheets == null || exportJson.sheets.length == 0) {
            alert('当前仅支持xlsx文件导入!');
            return;
          }

          exportJson.sheets = exportJson.sheets.map(sheet => {
            if (sheet.celldata) {
              sheet.celldata = sheet.celldata.map(cell => {
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
          window.luckysheet.create(this.options);
        });
      },

      // 自动加载本地文件
      async autoLoadLocalExcel(path) {
        try {
          const arrayBuffer = await this.fetchLocalFile(path);
          this.parseExcelData(arrayBuffer);
        } catch (error) {
          console.error('自动导入失败:', error);
        }
      },

      // 获取本地文件
      async fetchLocalFile(path) {
        const response = await fetch(path);
        if (!response.ok) throw new Error('文件不存在');
        return await response.arrayBuffer();
      },

      // 解析数据
      parseExcelData(arrayBuffer) {
        LuckyExcel.transformExcelToLucky(arrayBuffer, (exportJson) => {

          if (!exportJson.sheets) return;

          luckysheet.destroy();
          luckysheet.create({
            container: 'luckysheet',
            data: exportJson.sheets,
            title: '自动加载文档'
          });
        });
      }


    }
  }
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
