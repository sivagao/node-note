
dom element property by bind evnet handler : The problem with this method is that only one handler can be set per element and per event.

- event.preventDefault: Cancels the event (if it is cancelable).
- event.stopImmediatePropagation: For this particular event, no other listener will be called. Neither those attached on the same element, nor those attached on elements which will be traversed later (in capture phase, for instance)
- event.stopPropagation: Stops the propagation of events further along in the DOM.



```js

function simulateClick() {
  var event = new MouseEvent('click', {
    'view': window,
    'bubbles': true,
    'cancelable': true
  });
  var cb = document.getElementById('checkbox'); 
  var canceled = !cb.dispatchEvent(event);
  if (canceled) {
    // A handler called preventDefault.
    alert("canceled");
  } else {
    // None of the handlers called preventDefault.
    alert("not canceled");
  }
}

var event = new Event('build');

// Listen for the event.
elem.addEventListener('build', function (e) { ... }, false);

// Dispatch the event.
elem.dispatchEvent(event);

```


```js

(function () {
    'use strict';

    function fallback(urls) {
        var i = 0;

        (function createIframe() {
            var frame = document.createElement('iframe');
            frame.style.display = 'none';
            frame.src = urls[i++];
            document.documentElement.appendChild(frame);

            // the download init has to be sequential otherwise IE only use the first
            var interval = setInterval(function () {
                if (frame.contentWindow.document.readyState === 'complete') {
                    clearInterval(interval);

                    // Safari needs a timeout
                    setTimeout(function () {
                        frame.parentNode.removeChild(frame);
                    }, 1000);

                    if (i < urls.length) {
                        createIframe();
                    }
                }
            }, 100);
        })();
    }

    function multiDownload(urls) {
        if (!urls) {
            throw new Error('`urls` required');
        }

        if (typeof document.createElement('a').download === 'undefined') {
            return fallback(urls);
        }

        urls.forEach(function (url) {
            var a = document.createElement('a');
            a.download = '';
            a.href = url;
            // firefox doesn't support `a.click()`...
            a.dispatchEvent(new MouseEvent('click'));
        });
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = multiDownload;
    } else {
        window.multiDownload = multiDownload;
    }
})();

```