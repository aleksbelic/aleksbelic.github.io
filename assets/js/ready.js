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
