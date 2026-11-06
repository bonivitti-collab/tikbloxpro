(function () {
  var link = document.getElementById('tikblox-fonts');
  if (!link) return;
  function enable() {
    link.media = 'all';
  }
  link.addEventListener('load', enable);
  if (link.sheet) enable();
})();
