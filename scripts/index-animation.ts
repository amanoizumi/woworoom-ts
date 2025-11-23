export default (function () {
  document.addEventListener('DOMContentLoaded', function () {
    const ele = document.querySelector('.recommendation-wall') as HTMLElement | null;
    if (!ele) return;
    ele.style.cursor = 'grab';
    let pos = { top: 0, left: 0, x: 0, y: 0 };
    const mouseDownHandler = function (e: MouseEvent) {
      ele.style.cursor = 'grabbing';
      ele.style.userSelect = 'none';

      pos = {
        left: ele.scrollLeft,
        top: ele.scrollTop,
        // Get the current mouse position
        x: e.clientX,
        y: e.clientY,
      };

      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    };
    const mouseMoveHandler = function (e: MouseEvent) {
      // How far the mouse has been moved
      const dx = e.clientX - pos.x;
      const dy = e.clientY - pos.y;

      // Scroll the element
      ele.scrollTop = pos.top - dy;
      ele.scrollLeft = pos.left - dx;
    };
    const mouseUpHandler = function () {
      ele.style.cursor = 'grab';
      ele.style.removeProperty('user-select');

      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };
    // Attach the handler
    ele.addEventListener('mousedown', mouseDownHandler);
  });
  // menu 切換
  const menuOpenBtn = document.querySelector('.menuToggle') as HTMLElement | null;
  const linkBtn = document.querySelectorAll('.topBar-menu a') as NodeListOf<HTMLAnchorElement>;
  const menu = document.querySelector('.topBar-menu') as HTMLElement | null;
  if (menuOpenBtn) menuOpenBtn.addEventListener('click', menuToggle);

  linkBtn.forEach((item) => {
    item.addEventListener('click', closeMenu);
  });

  function menuToggle() {
    if (!menu) return;
    if (menu.classList.contains('openMenu')) {
      menu.classList.remove('openMenu');
    } else {
      menu.classList.add('openMenu');
    }
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('openMenu');
  }
})();


