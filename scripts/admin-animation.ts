const menuOpenBtn = document.querySelector('.menuToggle') as HTMLElement | null;
const linkBtn = document.querySelectorAll('.topBar-menu a') as NodeListOf<HTMLAnchorElement>;
const menu = document.querySelector('.topBar-menu') as HTMLElement | null;

if (menuOpenBtn) {
  menuOpenBtn.addEventListener('click', menuToggle);
}

linkBtn.forEach((item) => {
  item.addEventListener('click', closeMenu);
});

function menuToggle(): void {
  if (!menu) return;
  if (menu.classList.contains('openMenu')) {
    menu.classList.remove('openMenu');
  } else {
    menu.classList.add('openMenu');
  }
}

function closeMenu(): void {
  if (!menu) return;
  menu.classList.remove('openMenu');
}


