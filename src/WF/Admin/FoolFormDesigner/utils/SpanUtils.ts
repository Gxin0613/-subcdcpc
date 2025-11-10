interface WidgetInfo {
  dto: Recordable;
  inputType: string;
}

// 允许输入内容独占一行的情况
export function allowWholeLine(widget: WidgetInfo | Recordable) {
  return widget.dto.UIContralType == 60 || ['2', '3'].includes(widget.inputType);
}
