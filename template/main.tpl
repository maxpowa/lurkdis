<!DOCTYPE html>

<!--
Hey you! Yeah you, snoopin' up in this page! Just look at the sourcecode
instead... https://github.com/maxpowa/lurkdis
-->

<html lang="en">
<head>

  <!-- Basic Page Needs
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <meta charset="utf-8">
  <title>LurkDis</title>

  <!-- Mobile Specific Metas
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta id="last_id" value="{{last_id}}">

  <!-- FONT
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <link href="//fonts.googleapis.com/css?family=Raleway:400,300,600" rel="stylesheet" type="text/css">

  <!-- CSS
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <link rel="stylesheet" href="/static/normalize.css">
  <link rel="stylesheet" href="/static/skeleton.css">
  <script src="/static/autolinker.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.5.3/clipboard.min.js"></script>

  <script>
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-71253078-1', 'auto');
    ga('send', 'pageview');
  </script>

  <!-- Favicon
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <link rel="icon" type="image/png" href="/static/favicon.png">

</head>
<body style='color: wheat; background-image: url("/static/bg.png");'>
  <!-- Primary Page Layout
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <div class="container" style="margin-top: 3em;">
    <div class="row">
      <h4>LurkDis</h4>
      <h6>'Cause watching Discord for hours just wasn't good enough - <a href="/feed.atom">RSS feed</a></h6>
      <div id="primary-body" class="container primary-body" style="padding-left: 0px; width:100%">
        % if announcement:
          <div id="announcement" class="row post announcement">
            <img class="u-pull-left avatar" style='background-image: url("{{announcement['avatar']}}")'/>
            <p class="post-body">
              <b class="sender">{{announcement['sender']}}</b> - <a href="#{{announcement['id']}}">{{announcement['pretty_time']}} UTC</a>
              <br />
              <span class="preformatted">{{announcement['msg']}}</span>
            </p>
          </div>
        % end
        % for message in messages:
          % include('template/post', post=message)
        % end
      </div>
    </div>
  </div>

<!-- End Document
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->

  <script>
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

    function hasClass(el, className) {
      if (el.classList)
        return el.classList.contains(className)
      else
        return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
    }

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
    function refreshCheck() {
      var meta_element = document.getElementById('last_id');
      var meta_id = meta_element.getAttribute('value');
      var last_id = JSON.parse(this.responseText).id;
      console.log(last_id + '=' + meta_id);
      if (meta_id != last_id) {
        console.warn("Previous statement was false, executing paradox coroutine")
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("load", updatePosts);
        xhr.open("GET", "/get_since/" + meta_id);
        xhr.send();
      }
    }
    function updatePosts() {
      var meta_element = document.getElementById('last_id');
      var parent_container = document.getElementById('primary-body');
      var announcement = document.getElementById('announcement');

      var response = JSON.parse(this.responseText);
      meta_element.setAttribute('value', response.last_id);

      for (var x in response.posts) {
        var post = response.posts[x];
        var tmp = document.createElement('div');
        tmp.innerHTML = Autolinker.link(post.html, {stripPrefix: false, email: false, twitter: false});
        var post_dom = tmp.firstChild;
        if (announcement) {
          parent_container.insertBefore(post_dom, announcement.nextSibling);
        } else {
          parent_container.insertBefore(post_dom, parent_container.firstChild);
        }
      }
      window.requestAnimFrame(function() {
        var gems = document.querySelectorAll('.hidden-gem');
        for (var idx in gems) {
          removeClass(gems[idx], 'hidden-gem');
        }
      });
      console.log("Paradox coroutine executed successfully, crisis averted");
    }

    var container = document.getElementById('primary-body');
    container.innerHTML = Autolinker.link( container.innerHTML, {stripPrefix: false, email: false, twitter: false} );

    var clip = new Clipboard('.clipboard-anchor', {
      text: function(trigger) {
        return trigger.getAttribute('data-markdown-text');
      }
    });

    clip.on('success', function(e) {
      var trigger = e.trigger;
      addClass(trigger, 'copied-to-clipboard');
      setTimeout(function() {
        removeClass(trigger, 'copied-to-clipboard')
      }, 2000);
    });

    clip.on('error', function(e) {
      console.warn("Failed to copy to clipboard automatically, you need to CTRL+C");
      var trigger = e.trigger;
      addClass(trigger, 'copied-to-clipboard-fallback');
      setTimeout(function() {
        removeClass(trigger, 'copied-to-clipboard-fallback')
      }, 2000);
    });

    setInterval(function(){
      var xhr = new XMLHttpRequest();
      xhr.addEventListener("load", refreshCheck);
      xhr.open("GET", "/last");
      xhr.send();
    }, 30000);
  </script>
</body>
</html>
