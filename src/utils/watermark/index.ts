// utils/watermark.ts
export async function downloadImageWithWatermark(originalUrl: string, watermarkText: string, fileName = 'image.png'): Promise<void> {
  // 创建画布处理水印
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // 加载原始图片
  const img = new Image();
  img.crossOrigin = 'Anonymous'; // 处理跨域图片

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      // 设置画布尺寸
      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制原始图片
      ctx.drawImage(img, 0, 0);

      // 添加水印
      addWatermark(ctx, img.width, img.height, watermarkText);

      resolve();
    };
    img.onerror = reject;
    img.src = originalUrl;
  });

  // 触发下载
  triggerDownload(canvas, fileName);
}

function addWatermark(ctx: CanvasRenderingContext2D, width: number, height: number, text: string): void {
  ctx.font = 'bold 30px Arial';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  //   ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 主水印（居中）
  //   ctx.fillText(text, width / 2, height / 2);

  // 可选：添加重复水印
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.translate(width / 4, height / 4);
  ctx.rotate(-Math.PI / 6);

  for (let x = -width; x < width * 2; x += 200) {
    for (let y = -height; y < height * 2; y += 100) {
      ctx.fillText(text, x, y);
    }
  }
  ctx.restore();
}

function triggerDownload(canvas: HTMLCanvasElement, fileName: string): void {
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
