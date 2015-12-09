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
              <b class="sender">{{announcement['sender']}}</b> - <a href="#{{announcement['id']}}">{{announcement['time']}} UTC</a>
              <br />
              {{announcement['msg']}}
            </p>
          </div>
        % end
        % for message in messages:
          <div class="row post" id="{{message['id']}}">
            <img class="u-pull-left avatar" style='background-image: url("{{message['avatar']}}")'/>
            <p class="post-body">
              <b class="sender">{{message['sender']}}</b> - <a href="#{{message['id']}}">{{message['time']}} UTC</a>
              <br />
              {{message['msg']}}
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
  </script>
</body>
</html>
