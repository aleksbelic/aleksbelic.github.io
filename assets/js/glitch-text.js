(() => {
  const el = document.getElementById('name');
  if (!el) return;

  const original = el.textContent;
  const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  function scramble() {
    const arr = original.split('');
    const count = Math.floor(Math.random() * 4) + 1;
    const indices = [];

    while (indices.length < count) {
      const i = Math.floor(Math.random() * arr.length);
      if (arr[i] !== ' ' && !indices.includes(i)) indices.push(i);
    }

    indices.forEach(i => {
      arr[i] = chars[Math.floor(Math.random() * chars.length)];
    });

    el.textContent = arr.join('');

    setTimeout(() => {
      el.textContent = original;
    }, 40);
  }

  function schedule() {
    const delay = Math.random() * 2000 + 2000;
    setTimeout(() => {
      scramble();
      schedule();
    }, delay);
  }

  schedule();
})();
