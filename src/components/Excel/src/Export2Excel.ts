import xlsx from 'xlsx';
import type { WorkBook } from 'xlsx';
import type { JsonToSheet, AoAToSheet } from './typing';

// 声明全局JSBridge接口
declare global {
  interface Window {
    androidJSBridge?: {
      DownloadPdf: (url: string) => void;
      DownloadExcel: (filename: string, base64Data: string) => void;
    };
  }
}
const { utils, writeFile } = xlsx;

const DEF_FILE_NAME = 'excel-list.xlsx';

export function jsonToSheetXlsx<T = any>({ data, header, filename = DEF_FILE_NAME, json2sheetOpts = {}, write2excelOpts = { bookType: 'xlsx' } }: JsonToSheet<T>) {
  const arrData = [...data];
  if (header) {
    arrData.unshift(header);
    json2sheetOpts.skipHeader = true;
  }

  const worksheet = utils.json_to_sheet(arrData, json2sheetOpts);

  /* add worksheet to workbook */
  const workbook: WorkBook = {
    SheetNames: [filename],
    Sheets: {
      [filename]: worksheet,
    },
  };
  /* output format determined by filename */
  writeFile(workbook, filename, write2excelOpts);
  /* at this point, out.xlsb will have been downloaded */
}

// 通过JSBridge下载的方法
function downloadViaJSBridge(workbook: xlsx.WorkBook, filename: string, opts?: xlsx.WritingOptions) {
  try {
    // 生成文件数据
    const excelBuffer = xlsx.write(workbook, {
      bookType: opts?.bookType || 'xlsx',
      type: 'array',
    });

    // 转换为base64
    const base64String = btoa(new Uint8Array(excelBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));

    // 调用Android的Excel下载方法
    window.androidJSBridge!.DownloadExcel(filename, base64String);
  } catch (error) {
    console.error('Excel下载失败:', error);
    // 降级到传统下载方式
    writeFile(workbook, filename, opts);
  }
}

export function aoaToSheetXlsx<T = any>({ data, header, filename = DEF_FILE_NAME, write2excelOpts = { bookType: 'xlsx' } }: AoAToSheet<T>) {
  const arrData = [...data];
  if (header) {
    arrData.unshift(header);
  }

  const worksheet = utils.aoa_to_sheet(arrData);

  /* add worksheet to workbook */
  const workbook: WorkBook = {
    SheetNames: [filename],
    Sheets: {
      [filename]: worksheet,
    },
  };
  // 判断环境并选择下载方式
  if (window.androidJSBridge?.DownloadExcel) {
    downloadViaJSBridge(workbook, filename, write2excelOpts);
  } else {
    writeFile(workbook, filename, write2excelOpts);
  }
}
