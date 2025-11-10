import { type Ref } from 'vue';

export function usePackUp(
  modalShow: Function,
  fileInoStr: string,
  URL: Ref<string>,
  IsHtmlPage: Ref<boolean>,
  IsPdfPage: Ref<boolean>,
  IsZipPage: Ref<boolean>,
  PrintType: Ref<string>,
  dataPrint: Ref<Array<Recordable>>,
  basePath: string,
) {
  dataPrint.value = JSON.parse(fileInoStr.replace('info@', ''));
  dataPrint.value.forEach((item) => {
    // item.Name = item.Name.replace(basePath + '/', '');
    if (PrintType.value == 'Html') {
      PrintType.value = 'htm';
    }
    if (PrintType.value == item.No && item.No == 'htm') {
      IsHtmlPage.value = true;
      let realUrl = '';
      const startIndex = item.Name.indexOf('/DataUser/');
      const relativePath = item.Name.substring(startIndex);
      realUrl = basePath + '/' + relativePath;
      URL.value = realUrl;
      modalShow('Packup', '打印');
      return;
    }
    if (PrintType.value.toLowerCase() == item.No && item.No == 'pdf') {
      IsPdfPage.value = true;
      let realUrl = '';
      const startIndex = item.Name.indexOf('/DataUser/');
      const relativePath = item.Name.substring(startIndex);
      realUrl = basePath + '/' + relativePath;
      URL.value = realUrl;
      window.open(realUrl);
      modalShow('Packup', '打印');
      return;
    }
    if (PrintType.value.toLowerCase() == item.No && item.No == 'zip') {
      IsZipPage.value = true;
      let realUrl = '';
      const startIndex = item.Name.indexOf('/DataUser/');
      const relativePath = item.Name.substring(startIndex);
      realUrl = basePath + '/' + relativePath;
      URL.value = realUrl;
      window.location.href = realUrl;
      modalShow('Packup', '打印');
      return;
    }
  });
}
