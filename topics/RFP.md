
### Summary


### API
- takeUntil:
- selectMany:
- flatMapLatest:
- bufferWithCount:
- select:

### Canvas Paint Example

```js
// Calcualte offset either layerX/Y or offsetX/Y
function getOffset(event) {
    return { 
        offsetX: event.offsetX === undefined ? event.layerX : event.offsetX,
        offsetY: event.offsetY === undefined ? event.layerY : event.offsetY
    };
}

function main() {
    var canvas = document.querySelector('#tutorial');
    
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        
        // Get mouse moves
        var mouseMoves = Rx.DOM.fromEvent(canvas, 'mousemove');
        
        // Calculate difference between two mouse moves
        var mouseDiffs = mouseMoves.bufferWithCount(2, 1).select(function (x) {
            return { first: getOffset(x[0]), second: getOffset(x[1]) };
        });
        
        // Get merge together both mouse up and mouse down
        var mouseButton = Rx.DOM.fromEvent(canvas, 'mousedown').select(function (x) { return true; })
        .merge(Rx.DOM.fromEvent(canvas, 'mouseup').select(function (x) { return false; }));
        
        // Paint if the mouse is down
        var paint = mouseButton.select(function (down) { return down ? mouseDiffs : mouseDiffs.take(0) }).switchLatest();
        
        // Update the canvas
        paint.subscribe(function (x) {
            ctx.moveTo(x.first.offsetX, x.first.offsetY);
            ctx.lineTo(x.second.offsetX, x.second.offsetY);
            ctx.stroke();
        });
    }
}

main();
```


### jQuery Bindings Time Files Examples
叼炸天啊！ 在main中mouseMoveOffset多次（以delay间隔）被订阅到更新char位置的DOM 函数中

```js
function getOffset(element) {
    var doc = element.ownerDocument,
        docElem = doc.documentElement;
    body = doc.body,
        clientTop  = docElem.clientTop  || body.clientTop  || 0,
            clientLeft = docElem.clientLeft || body.clientLeft || 0,
                scrollTop  = window.pageYOffset,
                    scrollLeft = window.pageXOffset;
    
    return { top : scrollTop  - clientTop, left: scrollLeft - clientLeft };
}

function main() {
    
    var text = 'TIME FLIES LIKE AN ARROW',
        container = document.querySelector('#textContainer'),
        mousemove = Rx.DOM.fromEvent(document, 'mousemove');
    
    // Get the offset on mousemove from the container
    var mouseMoveOffset = mousemove.map(function (e) {
        var offset = getOffset(container);
        return {
            offsetX : e.clientX - offset.left + document.documentElement.scrollLeft,
            offsetY : e.clientY - offset.top + document.documentElement.scrollTop
        };
    });
    
    for (var i = 0, len = text.length; i < len; i++) {
        
        (function (i) {
            // Add an element for each letter
            var s = document.createElement('span');
            s.innerHTML = text[i];
            s.style.position = 'absolute';
            container.appendChild(s);
            
            // move each letter with a delay based upon overall position
            mouseMoveOffset.delay(i * 100).subscribe(function (e) {
                s.style.top = e.offsetY + 'px';
                s.style.left = e.offsetX + i * 10 + 15 + 'px';
            });
        }(i));
        
    }
    
}

main();

```


### drag and drop exmaple
```js
(function (global) {

    function main () {
        var dragTarget = document.getElementById('dragTarget');

        // Get the three major events
        var mouseup = Rx.DOM.fromEvent(dragTarget, 'mouseup');
        var mousemove = Rx.DOM.fromEvent(document, 'mousemove');
        var mousedown = Rx.DOM.fromEvent(dragTarget, 'mousedown');

        var mousedrag = mousedown.selectMany(function (md) {

            // calculate offsets when mouse down
            var startX = md.offsetX, startY = md.offsetY;

            // Calculate delta with mousemove until mouseup
            return mousemove.map(function (mm) {
                (mm.preventDefault) ? mm.preventDefault() : event.returnValue = false; 

                return {
                    left: mm.clientX - startX,
                    top: mm.clientY - startY
                };
            }).takeUntil(mouseup);
        });

        // Update position
        subscription = mousedrag.subscribe(function (pos) {          
            dragTarget.style.top = pos.top + 'px';
            dragTarget.style.left = pos.left + 'px';
        });
    }

    main();

}(window));
```


### Konami code
```js
var codes = [
    38, // up
    38, // up
    40, // down
    40, // down
    37, // left
    39, // right
    37, // left
    39, // right
    66, // b
    65 // a
];

var konmai = Rx.Observable.fromArray(codes);
var result = $('#result');

$(document).keyupAsObserable()
    .map(function(e) {
        return e.keyVode;
    })
    .windowWithCount(10, 10)
    .selectMany(function(x) {
        return x.sequenceEqual(konmai);
    })
    .filter(function(equal) {
        return equal;
    })
    .subscribe(function() {
        result.html('KONMAI').fadeOunt(2000);
    });
```

### value change auto search
```js
var $input = $('#input'),
    $results = $('#results');

/* Only get the value from each key up */
var keyups = Rx.Observable.fromEvent($input, 'keyup')
    .map(function (e) {
        return e.target.value;
    })
    .filter(function (text) {
        return text.length > 2;
    });

/* Now throttle/debounce the input for 500ms */
var throttled = keyups
    .throttle(500 /* ms */);

/* Now get only distinct values, so we eliminate the arrows and other control characters */
var distinct = throttled
    .distinctUntilChanged();

function searchWikipedia (term) {
    return $.ajax({
        url: 'http://en.wikipedia.org/w/api.php',
        dataType: 'jsonp',
        data: {
            action: 'opensearch',
            format: 'json',
            search: term
        }
    }).promise();
}
// flatMapLatest to get the value and ensure that we're not introducing any out of order sequence calls.
var suggestions = distinct.flatMapLatest(searchWikipedia);
suggestions.subscribe( function (data) {
    var res = data[1];

    /* Do something with the data like binding */
    $results.empty();

    $.each(res, function (_, value) {
        $('<li>' + value + '</li>').appendTo($results);
    });
}, function (error) {
    /* handle any errors */
    $results.empty();

    $('<li>Error: ' + error + '</li>').appendTo($results);
});
```