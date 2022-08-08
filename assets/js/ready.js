// ready
document.addEventListener('DOMContentLoaded', () => {
  // tooltips init
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );

  // highlight observer
  const highlightObserver = new IntersectionObserver(highlightObserverCallback);
  const highlightedElemements = document.querySelectorAll(
    '.highlight-pink, .highlight-dark'
  );
  highlightedElemements.forEach((element) => {
    highlightObserver.observe(element);
  });
  function highlightObserverCallback(elements, observer) {
    elements.forEach((element) => {
      if (element.isIntersecting) {
        element.target.classList.add('visible');
        observer.unobserve(element.target);
      }
    });
  }

  // copy email to clipboard
  document.getElementById('email').value = uncryptMailto(
    'dohnv1eholfCjpdlo1frp'
  );
  const copyEmailToClipboardElem = document.querySelector(
    '#copy-email-to-clipboard'
  );
  const copyEmailToClipboardTooltipObj = bootstrap.Tooltip.getOrCreateInstance(
    copyEmailToClipboardElem
  );
  copyEmailToClipboardElem.addEventListener('hidden.bs.tooltip', () => {
    copyEmailToClipboardTooltipObj.setContent({
      '.tooltip-inner': 'Copy email to clipboard',
    });
  });
  copyEmailToClipboardElem.addEventListener('click', () => {
    navigator.clipboard.writeText(uncryptMailto('dohnv1eholfCjpdlo1frp')).then(
      () => {
        copyEmailToClipboardTooltipObj.setContent({
          '.tooltip-inner': 'Copied!',
        });
      },
      () => {
        copyEmailToClipboardTooltipObj.setContent({
          '.tooltip-inner': 'Email could not be copied! :(',
        });
      }
    );
  });
  copyEmailToClipboardElem.addEventListener('mouseleave', () => {
    copyEmailToClipboardElem.blur();
  });

  // copy PGP key to clipboard
  const copyPgpKeyToClipboardElem = document.querySelector(
    '#copy-pgp-key-to-clipboard'
  );
  const copyPgpKeyToClipboardTooltipObj = bootstrap.Tooltip.getOrCreateInstance(
    copyPgpKeyToClipboardElem
  );
  copyPgpKeyToClipboardElem.addEventListener('hidden.bs.tooltip', () => {
    copyPgpKeyToClipboardTooltipObj.setContent({
      '.tooltip-inner': 'Copy PGP key to clipboard',
    });
  });
  const pgpKeyElem = document.querySelector('#pgp-key');
  copyPgpKeyToClipboardElem.addEventListener('click', () => {
    navigator.clipboard.writeText(pgpKeyElem.innerHTML).then(
      () => {
        copyPgpKeyToClipboardTooltipObj.setContent({
          '.tooltip-inner': 'Copied!',
        });
      },
      () => {
        copyPgpKeyToClipboardTooltipObj.setContent({
          '.tooltip-inner': 'PGP key could not be copied! :(',
        });
      }
    );
  });
  copyPgpKeyToClipboardElem.addEventListener('mouseleave', () => {
    copyPgpKeyToClipboardElem.blur();
  });

  // auto-close menu on select
  document.querySelectorAll('nav a.nav-link').forEach((navLink) => {
    navLink.addEventListener('click', () => {
      let hamburgerMenuBtn = document.querySelector(
        'button.navbar-toggler[aria-expanded="true"]'
      );
      if (hamburgerMenuBtn !== null) {
        hamburgerMenuBtn.click();
      }
    });
  });

  // my current interests chart
  let myCurrentInterestsChartObj = new Chartist.Pie(
    '#my-current-interests-chart',
    {
      series: [40, 40, 20],
      labels: ['Test automation', 'Node.js', 'SPA'],
    },
    {
      donut: true,
      showLabel: true,
      startAngle: 215,
    }
  );

  myCurrentInterestsChartObj.on('draw', function (data) {
    if (data.type === 'slice') {
      // Get the total path length in order to use for dash array animation
      let pathLength = data.element._node.getTotalLength();

      // Set a dasharray that matches the path length as prerequisite to animate dashoffset
      data.element.attr({
        'stroke-dasharray': pathLength + 'px ' + pathLength + 'px',
      });

      // Create animation definition while also assigning an ID to the animation for later sync usage
      let animationDefinition = {
        'stroke-dashoffset': {
          id: 'anim' + data.index,
          dur: 1000,
          from: -pathLength + 'px',
          to: '0px',
          easing: Chartist.Svg.Easing.easeOutQuint,
          // We need to use `fill: 'freeze'` otherwise our animation will fall back to initial (not visible)
          fill: 'freeze',
        },
      };

      // If this was not the first slice, we need to time the animation so that it uses the end sync event of the previous animation
      if (data.index !== 0) {
        animationDefinition['stroke-dashoffset'].begin =
          'anim' + (data.index - 1) + '.end';
      }

      // We need to set an initial value before the animation starts as we are not in guided mode which would do that for us
      data.element.attr({
        'stroke-dashoffset': -pathLength + 'px',
      });

      // We can't use guided mode as the animations need to rely on setting begin manually
      // See http://gionkunz.github.io/chartist-js/api-documentation.html#chartistsvg-function-animate
      data.element.animate(animationDefinition, false);
    }
  });

  // lil fucker
  let consoleNoseyLilFuckerStyle1 =
    'background-color: black; color: white; font-weight: bold; padding: 5px; border-radius: 5px;';
  let consoleNoseyLilFuckerStyle2 =
    'color: crimson; font-size: 22px; font-weight: bold;';
  console.log(
    "%c...nosey little fucker, aren't you?",
    consoleNoseyLilFuckerStyle1
  );
  console.log('%c( ಠ.ಠ)', consoleNoseyLilFuckerStyle2);
});
