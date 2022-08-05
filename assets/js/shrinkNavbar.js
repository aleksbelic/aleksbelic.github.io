const animatedNavbar = (() => {
  let navbarElem = document.querySelector('#navbar');
  let didScroll = false;
  let shrinkNavbarBoundary = 100; // px

  function init() {
    window.addEventListener('scroll', (e) => {
      if (!didScroll) {
        didScroll = true;
        setTimeout(checkShrink, 100);
      }
    });
  }

  function checkShrink() {
    if (window.scrollY >= shrinkNavbarBoundary) {
      navbarElem.classList.add('navbar-shrink');
    } else {
      navbarElem.classList.remove('navbar-shrink');
    }
    didScroll = false;
  }

  document.addEventListener('DOMContentLoaded', () => {
    checkShrink();
    init();
  });
})();
