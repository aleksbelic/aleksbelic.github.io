function uncryptMailto(s) {
  let n = 0;
  let r = '';
  for (var i = 0; i < s.length; i++) {
    n = s.charCodeAt(i);
    if (n >= 8364) {
      n = 128;
    }
    r += String.fromCharCode(n - 3);
  }
  return r;
}

function linkToUncryptMailto(s) {
  location.href = uncryptMailto(s);
}
