<template>
  <div class="watermark-container" ref="parentRef">
    <slot></slot>
  </div>
</template>

<script setup>
  import { onMounted, onUnmounted, ref, watchEffect } from 'vue';
  import { useWatermarkBg } from '/@/hooks/component/useWatermarkBg';

  const props = defineProps({
    //水印文本
    text: {
      type: Number,
      required: true,
      default: 0,
    },
    //水印文字大小
    fontSize: {
      type: Number,
      default: 30,
    },
    //水印间距
    gap: {
      type: Number,
      default: 50,
    },
    disable: {
      type: Boolean,
      default: false,
    },
  });

  const bg = useWatermarkBg(props);
  const parentRef = ref(null);
  const flag = ref(0); // 声明一个依赖
  let div;

  watchEffect(() => {
    if (props.disable) return;
    flag.value; // 将依赖放在 watchEffect 里
    if (!parentRef.value) {
      return;
    }
    if (div) {
      div.remove();
    }
    const { base64, styleSize } = bg.value;
    div = document.createElement('div');
    div.style.backgroundImage = `url(${base64})`;
    div.style.backgroundSize = `${styleSize}px ${styleSize}px`;
    div.style.backgroundRepeat = 'repeat';
    div.style.zIndex = 9999;
    div.style.position = 'absolute';
    div.style.inset = 0;
    // 元素不会接收鼠标事件，鼠标事件会透过元素传递到下层的元素上
    div.style.pointerEvents = 'none';
    parentRef.value.appendChild(div);
  });

  // 防篡改处理
  let ob;
  onMounted(() => {
    if (props.disable) return;
    ob = new MutationObserver((records) => {
      for (const record of records) {
        for (const dom of record.removedNodes) {
          if (dom === div) {
            flag.value++; // 删除节点的时候更新依赖
            return;
          }
        }
        if (record.target === div) {
          flag.value++; // 修改属性的时候更新依赖
          return;
        }
      }
    });
    ob.observe(parentRef.value, {
      childList: true,
      attributes: true,
      subtree: true,
    });
  });

  onUnmounted(() => {
    ob && ob.disconnect();
    div = null;
  });
</script>
