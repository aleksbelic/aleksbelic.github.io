(() => {
  const likes = [
    'coffee',
    'digital design & street art',
    'sci-fi',
    'AI/ML',
    'cryptography',
    'indie gamedev'
  ];

  const dislikes = [
    'bugs & code smells',
    '"What idiot wrote this?.. oh wait, that was me" moments',
    'comments more confusing than the code itself',
    'TODO lists',
    'peas',
  ];

  const container = document.getElementById('likes-dislikes-diff');
  if (!container) return;

  let html = '<div class="git-diff">';
  html += `<div class="diff-header">@@ -1,${dislikes.length} +1,${likes.length} @@ likes_dislikes.conf</div>`;

  likes.forEach((item, i) => {
    html += `<div class="diff-line diff-add"><span class="line-num">${i + 1}</span><span class="line-prefix">+</span> ${item}</div>`;
  });

  dislikes.forEach((item, i) => {
    html += `<div class="diff-line diff-remove"><span class="line-num">${likes.length + i + 1}</span><span class="line-prefix">-</span> ${item}</div>`;
  });

  html += '</div>';
  container.innerHTML = html;
})();
