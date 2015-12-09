<!DOCTYPE html>
<html lang="en">
<head>

  <!-- Basic Page Needs
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <meta charset="utf-8">
  <title>LurkDis</title>
  <meta name="description" content="">
  <meta name="author" content="">

  <!-- Mobile Specific Metas
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- FONT
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <link href="//fonts.googleapis.com/css?family=Raleway:400,300,600" rel="stylesheet" type="text/css">

  <!-- CSS
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <link rel="stylesheet" href="/static/normalize.css">
  <link rel="stylesheet" href="/static/skeleton.css">
  <script src="/static/autolinker.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.5.3/clipboard.min.js"></script>

  <!-- Favicon
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <link rel="icon" type="image/png" href="images/favicon.png">

</head>
<body style='color: wheat; background-image: url("/static/bg.png");'>

  <!-- Primary Page Layout
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <div class="container" style="margin-top: 3em;">
    <div class="row">
      <h4>LurkDis</h4>
      <h6>'Cause watching Discord for hours just wasn't good enough</h6>
      <div id="primary-body" class="container" style="padding-left: 0px; width:100%">
        % if announcement:
          <div class="row post announcement">
            <img class="u-pull-left avatar" style='background-image: url("{{announcement['avatar']}}")'/>
            <p class="post-body">
              <b class="sender">{{announcement['sender']}}</b> - <a href="#{{announcement['id']}}">{{announcement['pretty_time']}} UTC</a>
              <br />
              {{announcement['msg']}}
            </p>
          </div>
        % end
        % for message in messages:
          <div class="row post" id="{{message['id']}}">
            <img class="u-pull-left avatar" style='background-image: url("{{message['avatar']}}")'/>
            <p class="post-body">
              <b class="sender">{{message['sender']}}</b> - <a href="#{{message['id']}}">{{message['pretty_time']}} UTC</a>
              <br />
              {{message['msg']}}
              <a class="clipboard-anchor u-pull-right" data-markdown-text="{{message['markdown']}}">Copy</a>
            </p>
          </div>
        % end
      </div>
    </div>
  </div>

<!-- End Document
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->

  <script>
    var container = document.getElementById('primary-body');
    container.innerHTML = Autolinker.link( container.innerHTML, {stripPrefix: false, email: false, twitter: false} );

    function addClass(el, className) {
      if (el.classList)
        el.classList.add(className)
      else if (!hasClass(el, className)) el.className += " " + className
    }

    function removeClass(el, className) {
      if (el.classList)
        el.classList.remove(className)
      else if (hasClass(el, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
        el.className=el.className.replace(reg, ' ')
      }
    }

    new Clipboard('.clipboard-anchor', {
      text: function(trigger) {
        addClass(trigger, 'copied-to-clipboard');
        setTimeout(function() {
          removeClass(trigger, 'copied-to-clipboard')
        }, 2000);
        return trigger.getAttribute('data-markdown-text');
      }
    });
  </script>
</body>
</html>
