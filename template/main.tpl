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

  <!-- Favicon
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <link rel="icon" type="image/png" href="images/favicon.png">

</head>
<body style='color: wheat; background-image: url("/static/bg.png");'>

  <!-- Primary Page Layout
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <div class="container" style="margin-top: 10%;">
    <div class="row">
      <h4>LurkDis</h4>
      <h6>'Cause watching Discord for hours just wasn't good enough</h6>
      <div class="container" style="padding-left: 0px; width:100%">
        % for message in messages:
          <div class="row post">
            <img class="u-pull-left avatar" style='background-image: url("{{message['avatar']}}")'/>
            <b>{{message['sender']}}</b> - {{message['time']}}
            <br />
            {{message['msg']}}
          </div>
        % end
      </div>
    </div>
  </div>

<!-- End Document
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
</body>
</html>
