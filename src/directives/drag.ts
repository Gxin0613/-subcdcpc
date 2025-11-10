import { Directive, DirectiveBinding } from 'vue';

const vDrag: Directive<any, void> = (el: HTMLElement, _: DirectiveBinding) => {
  const mouseDown = (e: MouseEvent) => {
    e.preventDefault();
    const x = e.clientX - el.offsetLeft + 10;
    const y = e.clientY - el.offsetTop + 10;
    const move = (e: MouseEvent) => {
      el.style.left = e.clientX - x + 'px';
      el.style.top = e.clientY - y + 'px';
    };
    const up = async () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  };
  el.addEventListener('mousedown', mouseDown);
};

export default vDrag;
