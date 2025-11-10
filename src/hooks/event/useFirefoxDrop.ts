export function useFirefoxDrop() {
  if (navigator.userAgent.toLowerCase().indexOf('firefox') !== -1) {
    document.body.ondrop = function (event) {
      event.stopPropagation();
      event.preventDefault();
    };
  }
}
