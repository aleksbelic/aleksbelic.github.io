(() => {
  const hex = '0123456789abcdef';

  function randomHash() {
    let hash = '';
    for (let i = 0; i < 7; i++) {
      hash += hex[Math.floor(Math.random() * hex.length)];
    }
    return hash;
  }

  document.querySelectorAll('[data-hash]').forEach((el) => {
    el.textContent = randomHash();
  });
})();
