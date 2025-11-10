<script lang="tsx">
  import { defineComponent, ref } from 'vue';
  import { NCalendar } from 'naive-ui';
  import isYesterday from 'dayjs/plugin/isYesterday';
  import dayjs from 'dayjs';
  import { message } from 'ant-design-vue';
  dayjs.extend(isYesterday);

  export default defineComponent({
    name: 'Calendar',
    setup() {
      const date = ref(dayjs(Date.now()).valueOf());
      const isDateDisabled = (timestamp: number) => dayjs(timestamp).isYesterday();
      const handleUpdateValue = (_: number, { year, month, date }: { year: number; month: number; date: number }) => {
        message.success(`${year}-${month}-${date}`);
      };
      return () => {
        return (
          <NCalendar vModel={date.value} is-date-disabled={isDateDisabled} onUpdateValue={handleUpdateValue}>
            {{ default: (args) => <h5>default slots: {args}</h5> }}
          </NCalendar>
        );
      };
    },
  });
</script>
