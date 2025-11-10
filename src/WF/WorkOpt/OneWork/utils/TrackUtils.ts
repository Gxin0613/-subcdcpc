import { Graph, Point } from '@antv/x6';
import { IsMobile } from '/@/utils/gener/StringUtils';
/**
 * 计算轨迹图详情弹窗位置，处理边界情况
 **/
const SAFE_DISTANCE = 20;
export function calcPanelPosition(container: DOMRect, nodeWidth: number, nodeHeight: number, nodePosition: Point.PointLike, panelWidth: number, panelHeight: number) {
  const displayPos = {
    x: 0,
    y: 0,
  };

  // 如果节点在画布左边界
  if (nodePosition.x < SAFE_DISTANCE) {
    displayPos.x = SAFE_DISTANCE;
  }

  // 画布右边界
  if (nodePosition.x > container.width - panelWidth) {
    displayPos.x = container.width - panelWidth - SAFE_DISTANCE;
  }

  // 画布下边界
  if (nodePosition.y + nodeHeight + panelHeight > container.height) {
    displayPos.y = nodePosition.y - panelHeight - nodeHeight;
  }

  // 如果是处于中间部分
  if (displayPos.x == 0) {
    displayPos.x = nodePosition.x - (panelWidth - nodeWidth) / 2;
    if (displayPos.x < 0) {
      displayPos.x = SAFE_DISTANCE;
    }
  }

  if (displayPos.y == 0) {
    displayPos.y = nodePosition.y + nodeHeight + SAFE_DISTANCE;
  }

  if (displayPos.y < 0 || displayPos.y + panelHeight > container.height) {
    displayPos.y = (container.height - panelHeight) / 2;
    displayPos.x = nodePosition.x > container.width / 2 ? nodePosition.x - panelWidth - SAFE_DISTANCE : nodePosition.x + nodeWidth + SAFE_DISTANCE;
  }

  return displayPos;
}

// SVG -> image 图片加载问题检测,可能存在性能问题
export const checkImg = (avatarSrc): Promise<void> =>
  new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.onerror = () => {
      reject();
      img.remove();
    };
    img.onload = () => {
      resolve();
      img.remove();
    };
    img.src = avatarSrc;
  });

export const addMobileSupport = (el: HTMLElement, graph: Graph) => {
  if (!IsMobile()) return;
  el.addEventListener('touchstart', function (evt) {
    evt.preventDefault();
    // 计算初始位置
    const { tx, ty } = graph.translate();
    // 计算手指相对于元素的位置
    const offsetX = evt.touches[0].clientX;
    const offsetY = evt.touches[0].clientY;
    let distance = 0;
    // 当手指移动时触发touchmove事件
    document.addEventListener('touchmove', moveGraph);
    // 如果是两根手指
    if (evt.touches.length == 2) {
      distance = Math.hypot(evt.touches[1].clientX - offsetX, evt.touches[1].clientY - offsetY);
    }

    // 当手指抬起时触发touchend事件
    document.addEventListener('touchend', function () {
      document.removeEventListener('touchmove', moveGraph);
    });

    // 移动元素的函数
    function moveGraph(event) {
      // 阻止默认事件
      event.preventDefault();

      if (event.touches.length == 2) {
        const currDistance = Math.hypot(event.touches[1].clientX - event.touches[0].clientX, event.touches[1].clientY - event.touches[0].clientY);
        if (distance != 0) {
          const rate = currDistance / distance;
          graph.zoomTo(rate);
        }
      } else {
        // 计算元素的新位置
        const x = tx + event.touches[0].clientX - offsetX;
        const y = ty + event.touches[0].clientY - offsetY;
        // 设置元素的新位置
        graph.translate(x, y);
      }
    }
  });
};
