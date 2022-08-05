// ready
document.addEventListener('DOMContentLoaded', () => {
  // highlight observer
  const highlightObserver = new IntersectionObserver(observerCallback);
  const highlightedElemements = document.querySelectorAll(
    '.highlight-pink, .highlight-dark'
  );
  highlightedElemements.forEach((element) => {
    highlightObserver.observe(element);
  });
  function observerCallback(elements, observer) {
    elements.forEach((element) => {
      if (element.isIntersecting) {
        element.target.classList.add('visible');
        observer.unobserve(element.target);
      }
    });
  }

  // lil fucker
  let consoleNoseyStyle1 =
    'background-color: black; color: white; font-weight: bold; padding: 5px; border-radius: 5px;';
  let consoleNoseyStyle2 =
    'color: crimson; font-size: 22px; font-weight: bold;';
  console.log("%c...nosey little fucker, aren't you?", consoleNoseyStyle1);
  console.log('%c( ಠ.ಠ)', consoleNoseyStyle2);
});
