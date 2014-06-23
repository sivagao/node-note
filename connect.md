# Connect 内幕
看看 Connnect 如何 run 起来的！

中间件的顺序非常重要
中间件的记得在 非 endpoint 的 handler 记得 调用 next

Connect Patch
```js
var res = http.ServerResponse.prototype
  , setHeader = res.setHeader
  , _renderHeaders = res._renderHeaders
  , writeHead = res.writeHead;

if(!res._hasConnectPatch) {

  res.__defineGetter__('headerSent', function() {
    return this._header;
  });

  res.setHeader = function(field, val) {

  };

  res.writeHead = function() {
    if(!this._emittedHeader) this.emit('header');
    this._emittedHeader = true;
    return writeHead.apply(this, arguments);
  };

  res._hasConnectPath = true;
}
```

// connect/index.js

```js
module.exports = createServer;

function createServer() {
  function app(req, res, next){ app.handle(req, res, next); }
  merge(app, proto);
  merge(app, EventEmitter.prototype);
  app.route = '/';
  app.stack = [];
  return app;
}
// connect/proto.js : exports app
var app = module.exports = {};

// Utilize the given middleware `handle` to the given `route`, defaulting to _/_. 
app.use = function(route, fn) {
  // default route to '/'. if route typeof nto string
  // wrap sub-apps
  if('function' == typeof fn.handle) {
    var server = fn;
    server.route = route;
    fn = function(req, res, next) {
      server.handle(req, res, next);
    };
  }

  this.stack.push({
    route: route,
    handle: fn
  });

  return this;
};

// handle server requests, punting them down the middleware stack
app.handle = function(req, res, out) {
  var index = 0;

  function next(err) {
    var layer;

    layer = stack[index++];
    if(!layer) {
      done(err);
      return;
    }

    try{
      // skip the layer if route doesn't match
      if (0 != path.toLowerCase().indexOf(layer.route.toLowerCase())) return next(err);

      // call the layer handler(trim off the matched before routes)
      }catch(e) {
        next(e);
      }
  }

  next();
};

```

