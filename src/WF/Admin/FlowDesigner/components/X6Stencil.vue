<script lang="tsx">
  import { computed, defineComponent, onMounted, shallowRef, ref, inject } from 'vue';
  import type { PropType } from 'vue';
  import type { Graph } from '@antv/x6';
  import { initStencil } from '/@flow/utils/StencilUtils';
  import { LeftOutlined } from '@ant-design/icons-vue';
  import { flowEntityKeys } from '../utils/keys';

  const VisibleKey = 'stencilOpened';
  export default defineComponent({
    name: 'X6Stencil',
    components: { LeftOutlined },
    props: {
      graph: {
        type: Object as PropType<Graph>,
      },
    },
    setup(props) {
      const stencilRef = shallowRef<HTMLElement>();
      const stencilVisible = ref(false);
      // 面板属性
      const stencilStyle = computed(() => {
        return {
          left: stencilVisible.value ? '0' : '-240px',
        };
      });

      // 开关属性
      const switchStyle = computed(() => {
        return {
          transform: `rotate(${stencilVisible.value ? '0' : '180deg'})`,
        };
      });
      const { flowEntity, updateFlowEntity } = inject(flowEntityKeys)!;
      const flowAtPara = computed(() => {
        if (flowEntity.value?.atPara) {
          return flowEntity.value?.atPara;
        }
        return {};
      });
      const toggleStencil = async () => {
        stencilVisible.value = !stencilVisible.value;
        await updateFlowEntity(VisibleKey, stencilVisible.value ? 1 : 0, true);
      };
      onMounted(async () => {
        initStencil(props.graph!, stencilRef.value!);
        if (!flowAtPara.value.map.has(VisibleKey)) {
          await updateFlowEntity(VisibleKey, 1, true);
          stencilVisible.value = true;
          return;
        }
        stencilVisible.value = flowAtPara.value.map.get(VisibleKey) == 1 || false;
      });
      return () => (
        <div class="stencil" ref={stencilRef} style={stencilStyle.value}>
          <div
            class="switch"
            onClick={() => {
              toggleStencil();
            }}
          >
            <LeftOutlined class="icon" style={switchStyle.value} />
          </div>
        </div>
      );
    },
  });
</script>

<style scoped lang="less">
  .stencil {
    width: 250px;
    height: calc(100% - 55px);
    position: absolute;
    left: 0;
    top: 55px;
    background-color: white;
    z-index: 999;
    transition: all ease 0.3s;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;

    :deep(.x6-widget-stencil-group-title) {
      background: color-mix(in srgb, var(--system-bg-color) 70%, transparent);
      color: white;
    }
    .switch {
      position: absolute;
      z-index: 12;
      top: 50%;
      right: -20px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: rgba(149, 157, 165, 0.2) 0 8px 24px;

      .icon {
        transition: all ease 0.4s;
      }
    }
  }
  :deep(.x6-widget-stencil-group-content) {
    background-color: white;
  }

  :deep(.x6-widget-stencil) {
    background-color: #fff;
  }

  :deep(.x6-widget-stencil-title) {
    background-color: #fff;
    display: none;
  }

  :deep(.x6-widget-transform) {
    margin: -1px 0 0 -1px;
    padding: 0px;
    border: 1px solid #239edd;
  }
</style>
