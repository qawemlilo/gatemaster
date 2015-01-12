(function ($) {

  var button = $('#openGate');

  button.on('click', function () {
    button.attr('disabled', true);

    $.get('/opengate?t=' + new Date().getTime())
    .success(function (data, xhr) {
      button.attr('disabled', false);
    })
    .error(function (data) {
      button.attr('disabled', false);
      console.log(data.responseText);
    });
  });

})(jQuery);