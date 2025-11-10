import { Graph } from '@antv/x6';

// 计算实际绘制区域大小
export const calcDrawSize = (data) => {
  if (Array.isArray(data.nodes) && data.nodes.length > 0) {
    const xArr = data.nodes.map((node) => node.x);
    const yArr = data.nodes.map((node) => node.y);
    const maxX = Math.max.apply(null, xArr);
    const minX = Math.min.apply(null, xArr);
    const maxY = Math.max.apply(null, yArr);
    const minY = Math.min.apply(null, yArr);
    return {
      drawWidth: maxX - minX,
      drawHeight: maxY - minY,
    };
  }
  return {
    drawWidth: 0,
    drawHeight: 0,
  };
};

// 计算实际坐标偏移量
export const calcOffSet = (graph: Graph) => {
  const p2l = graph.clientToLocal(1000, 1000);
  const x = p2l.x - 1000;
  const y = p2l.y - 1000;
  return {
    x,
    y,
  };
};
