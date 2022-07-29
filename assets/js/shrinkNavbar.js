const animatedNavbar = (() => {

  let navbarElem = document.querySelector('.navbar.fixed-top');
  let didScroll = false;
  let shrinkNavbarOnPx = 150;

  function init() {
    window.addEventListener('scroll', (e) => {
      if (!didScroll) {
        didScroll = true;
        setTimeout(scrollPage, 100);
      }
    });
  }

  function scrollPage() {
    if (window.scrollY >= shrinkNavbarOnPx) {
      navbarElem.classList.add('navbar-shrink');
    }
    else {
      navbarElem.classList.remove('navbar-shrink');
    }
    didScroll = false;
  }

  init();

})();
