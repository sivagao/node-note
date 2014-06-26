比较陌生的点： express

```js
// to restrict parameters to a given regular expression
// or parse, capture them

// app.param: Map logic to route parameters.

app.param(function(name, fn){
  if (fn instanceof RegExp) {
    return function(req, res, next, val){
      var captures;
      if (captures = fn.exec(String(val))) {
        req.params[name] = captures;
        next();
      } else {
        next('route');
      }
    }
  }
});

app.param('range', /^(\w+)\.\.(\w+)?$/);

app.get('/range/:range', function(req, res){
  var range = req.params.range;
  res.send('from ' + range[1] + ' to ' + range[2]);
});


app.param('user', function(req, res, next, id){
  User.find(id, function(err, user){
    if (err) {
      next(err);
    } else if (user) {
      req.user = user;
      next();
    } else {
      next(new Error('failed to load user'));
    }
  });
});


// app.locals: app local variables provided to all templates useful for providing helper functions and app-level data

app.locals.title = 'My App';
app.locals.strftime = require('strftime');
app.set('title', 'My App');
// use settings.title in a view



// app.route(path)
// Returns an instance of a single route which can then be used to handle HTTP verbs with optional middleware. Using app.route() is a recommended approach to avoiding duplicate route naming and thus typo errors.
app.route('/events')
.all(function(req, res, next) {
  // runs for all HTTP verbs first
  // think of it as route specific middleware!
})
.get(function(req, res, next) {
  res.json(...);
})
.post(function(req, res, next) {
  // maybe add a new event...
})

```

## use 和 all 的区别？

app.all(*) actually loops through all HTTP methods (from the 'methods' npm package) and does a app.\<method\>('*', function (req, res, next) {..}) for each HTTP method. 

There is big difference between the use of these two examples. Function registered with app.use is general middleware function and is called appropriate to its position on middleware stack, typically inside app.configure function. This type of middleware is usually placed before app.route with the exception of error handling functions.

On the other hand app.all is routing function (not usually called middleware) which covers all HTTP methods and is called only and only inside app.route. If any of your previous router function matches the '/some/path' and did not call next callback, app.all will not be executed, so app.all functions are usually on the beginning of your routing block.

There is also third type of middleware, used in your routing functions, eg.

`app.get('/some/path', middleware1, middleware2, function(req, res, next) {});`, which is typicaly used for limiting access or perform general tasks related to '/some/path' route.

For practical application you can use both functions, but be care of different behaviour when using app.use with '/some/path'. Unlike app.get app.use strips '/some/path' from the route before invoking anonymous function.

// 处理特殊的例子，static, favicon 等， 一般中间件是要 next()的，只是装饰 req, resp 等
// 位置执行先后不一样： use 一般在 app.configure 中，， 通常在 app.route 之前执行，并且有(error handling functions..)
// 第三种类似的 middleware，很酷， app.get('/some/path', needLogin, checkRole, fn), 执行特定于 path 的一些逻辑

