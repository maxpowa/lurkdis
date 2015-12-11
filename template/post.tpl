<div class="row post {{post['fancy']}}" id="{{post['id']}}">
  <img class="u-pull-left avatar" style='background-image: url("{{post['avatar']}}")'/>
  <p class="post-body">
    <b class="sender">{{post['sender']}}</b> - <a href="#{{post['id']}}">{{post['pretty_time']}} UTC</a>
    <br />
    <span class="preformatted">{{post['msg']}}</span>
    <a class="clipboard-anchor u-pull-right" data-markdown-text="{{post['markdown']}}">Copy</a>
  </p>
</div>
