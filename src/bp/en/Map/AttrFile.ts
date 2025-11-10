/// 属性
export class AttrFile {
  public FileNo: string | null = null;
  public FileName: string | null = null;

  constructor(fileNo = '', fileName = '') {
    this.FileNo = fileNo;
    this.FileName = fileName;
  }
}

export class AttrFiles extends Array {
  constructor() {
    super();
  }
  public Add(fileNo: string, fileName: string) {
    this.push(new AttrFile(fileNo, fileName));
  }
}
