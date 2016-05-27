(function() {
  var clip = new Clipboard('a.clip', {
    text: function(trigger) {
      return trigger.getAttribute('data-clip-text');
    }
  });
  clip.on('success', function(e) {
    var trigger = e.trigger;

    $('.toast > span').css('background-color', '#64d65e').text("Successfully copied!");

    $('.toast').finish().fadeIn(250).delay(3000).fadeOut(250);
  });
  clip.on('error', function(e) {
    console.warn("Failed to copy to clipboard automatically, you need to CTRL+C");
    var trigger = e.trigger;

    $('.toast > span').css('background-color', '#fa6666').text("CTRL+C to copy message");
    $('.toast').finish().fadeIn(250).delay(3000).fadeOut(250);
  });

})();
