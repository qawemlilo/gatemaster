(function () {

  var button = document.getElementById('openGate');

  button.onclick = function () {
    button.disabled = true;

    atomic.get('/opengate?t=' + new Date().getTime())
    .success(function (data, xhr) {
      button.disabled = false;
    })
    // this doesn't really work, its never called
    .error(function (data, xhr) {});
  };

})();