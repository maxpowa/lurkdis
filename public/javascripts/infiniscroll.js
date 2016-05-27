(function() {

    // Used to improve performance in rapidly repeating events
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this,
                args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    function handle_scroll(e) {
        // When we're half a page from the bottom, load next chunk
        if ($(window).scrollTop() + $(window).height() >= $(document).height() - ($(window).height() / 2)) {
            $(window).off('scroll');
            $.ajax({
                type: "GET",
                url: "/before/" + last,
                dataType: "json"
            }).done(function(res) {
                $('.messages.infiniscroll').append(res.messages);
                last = res.after;
            }).always(function() {
                $(window).on('scroll', debounce(handle_scroll, 250));
            })
        }
    }

    $(window).on('scroll', debounce(handle_scroll, 250));

})();
