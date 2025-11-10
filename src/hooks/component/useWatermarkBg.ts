import { computed, ComputedRef } from 'vue';
import WebUser from '/@/bp/web/WebUser';
import { getAppEnvConfig } from '/@/utils/env';
interface WatermarkProps {
  text: number;
  fontSize: number;
  gap: number;
}

interface WatermarkResult {
  base64: string;
  size: number;
  styleSize: number;
}
const { VITE_GLOB_APP_TITLE } = getAppEnvConfig();

export const useWatermarkBg = (props: WatermarkProps): ComputedRef<WatermarkResult> => {
  return computed(() => {
    // 创建一个 canvas
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const devicePixelRatio = window.devicePixelRatio || 1;
    // 设置字体大小
    const fontSize = props.fontSize * devicePixelRatio;
    const font = fontSize + 'px serif';
    const ctx: any = canvas.getContext('2d');
    // 获取文字宽度
    ctx.font = font;
    const text = textEnum(props.text);
    const { width } = ctx.measureText(text);
    const canvasSize = Math.max(100, width) + props.gap * devicePixelRatio;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    // 旋转 45 度让文字变倾斜
    ctx.rotate((Math.PI / 180) * -45);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // 将文字画出来
    ctx.fillText(text, 0, 0);
    return {
      base64: canvas.toDataURL(),
      size: canvasSize,
      styleSize: canvasSize / devicePixelRatio,
    };
  });
};

const textEnum = (val) => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  switch (val) {
    case 0:
      return VITE_GLOB_APP_TITLE;
    case 1:
      return WebUser.No;
    case 2:
      return WebUser.Name;
    case 3:
      return `${year}年${month}月${day}日`;
    case 4:
      return `${year}年${month}月${day}日${hours}时${minutes}分`;
    case 5:
      return `${WebUser.Name}+${year}年${month}月${day}日`;
    case 6:
      return `${WebUser.Name}+${year}年${month}月${day}日${hours}时${minutes}分`;
    default:
      return VITE_GLOB_APP_TITLE;
  }
};
