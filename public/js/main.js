(function ($) {

  $('.removetenant').on('click', function () {
    var link = this;
    var cell = $(link).data('cell');

    $.get('/removetenant/' + cell + '/?t=' + new Date().getTime())
    .success(function (data, xhr) {
      $(link).parent().parent().addClass('warning').fadeOut('slow');
    })
    .error(function (data) {
      alert('Error! failed to delete tenant');
    });
  });

})(jQuery);