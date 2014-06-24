## 开搞

``` shell
$ npm install - g meanio@ lastest
$ mean init < app - name >
    $ cd < app - name > && npm install

// run with grunt
// run `node server`
```

PS: If grunt aborts because of JSHINT errors,
these can be overridden with the force flag: grunt - f

# #配置
All configuration is specified in the server / config folder,
particularly the config.js file and the env files
to specify application name,
database name,
and hook up any social app keys
if you want to integration with sns

db
app.name
sns oauth keys: clientID,
clientSecret,
callbackURL

$ NODE_ENV = test grunt
Running Node.js applications in the production environment enables caching

# # run it安装 mean.io 0.4.30
mean init < > - > Cloning branch: master into destination folder(0.3.3)

# # structure
We pre - included an article example.Check out:

The Model - Where we define our object schema.
The Controller - Where we take care of our backend logic.
NodeJS Routes - Where we define our REST service routes.
AngularJs Routes - Where we define our CRUD routes.
The AngularJs Service - Where we connect to our REST service.
The AngularJs Controller - Where we take care of our frontend logic.
The AngularJs Views Folder - Where we keep our CRUD views.


# #依赖

``` js
"dependencies": {
    "assetmanager": "^1.0.0", // asset in your templates by managing them in a single json file that's still compatible with grunt cssmin and uglify.
    "body-parser": "^1.2.0", // node.js body parsing middleware
    "bower": "^1.3.3", // browser package manager
    "compression": "^1.0.1", // compression middleware for connect
    "connect-flash": "^0.1.1", // flash message middleware for connect
    "consolidate": "^0.10.0", // template engine consolidation lib
    "cookie-parser": "^1.1.0", // cookie parsing with signature
    "dependable": "0.2.5", // a minimalist dependency injection framework for js
    "errorhandler": "^1.0.0", // connect's default error handler page
    "express": "^4.2.0",
    "express-session": "^1.1.0", // session middleware for express
    "express-validator": "^2.1.1", // validator for express
    "forever": "^0.11.1", // CLI tool for ensuring that a given node script runs continuously
    "grunt-cli": "^0.1.13",
    "grunt-concurrent": "^0.5.0",
    "grunt-contrib-clean": "^0.5.0",
    "grunt-contrib-csslint": "^0.2.0",
    "grunt-contrib-cssmin": "^0.9.0",
    "grunt-contrib-jshint": "^0.10.0",
    "grunt-contrib-uglify": "^0.4.0",
    "grunt-contrib-watch": "^0.6.1",
    "grunt-env": "^0.4.1",
    "grunt-nodemon": "0.2.1",
    "load-grunt-tasks": "^0.4.0",
    "lodash": "^2.4.1",
    "mean-connect-mongo": "0.4.3", // MongoDB session store for Connect
    "gridfs-stream": "^0.5.1", // Writable/Readable Nodejs compatible GridFS streams
    "mean-logger": "0.0.1", // a logging module for MEAN Apps
    "meanio": "0.4.x", // cli for installing and managing MEAN apps
    "method-override": "^1.0.0", // override http verbs
    "mongoose": "^3.8.8", // mongoose mongodb ODM
    "morgan": "^1.0.0", // http request logger middleware for node.js
    "passport": "^0.2.0", // unobtrusive authentication for node.js
    "passport-facebook": "^1.0.3",
    "passport-github": "^0.1.5",
    "passport-google-oauth": "^0.1.5",
    "passport-linkedin": "^0.1.3",
    "passport-local": "^1.0.0",
    "passport-twitter": "^1.0.2",
    "serve-favicon": "^2.0.0", // favicon serving middleware with caching
    "swig": "^1.3.2", // simple, powerful, extendable templating engine for node.js and tempalte
    "time-grunt": "^0.3.1",
    "view-helpers": "^0.1.4" // view helper methods for expressjs and other node stuff
}
```

### mean server directory

- config
    - env: all, test, dev, prod
    - system: bootstrap
    asserts.json, config, express, passport
- controllers
- models
- routes
- views

### mean - config - express

```js

```

### TODO

- import assets file and add to locals
- express/mongo session storage
- dynamic helpers
- use passport session
- mean middleware from modules before routes
- flash message
- favicon
- 主题相关? 
- events.on('modulesFound') ?

### assetmanager
Asset manager easily allows you to switch between development and production css and js files in your templates by managing them in a single json file that'still compatible with grunt cssmin and uglify.
非常好用！

这样在模板里面使用
```html
{% for file in assets.main.css %}
  <link rel="stylesheet" href="{{file}}">
{% endfor %}
```

```js
app.use(function(req, res, next) {
  res.locals.asserts = assetsmanager.process({
    assets: assets, // assets = require('./assets.json'),
    debug: process.env.NODE_ENV !== 'production',
    webroot: 'public/public'
  });
  next();
});
// 配置文件格式
/*
{
  core: {
    <type: css, js>: {
      <min-one>: [
          <dep1>,
          <dep1>
      ]
    }
  }
}
*/
```


### view-helpers
used as middlewares, helpers used in views
暴露了一些变量和方法和 req 对象

* `createPagination(pages, page)` - creates pagination
* `formatDate(date)` - date is a mongoose `Date` object
* `isActive('/link/href/')` - to add active class to the link
* `stripScript(str)` - to escape javascript inputs
* `req.isMobile` - detects if the request is coming from tablet/mobile device
* `res.render('template', locals, cb)` - mobile templates - If the request is coming from a mobile device, then it would try to look for a `template.mobile.jade`

```js
// TODO
```



### method-override
Lets you use HTTP verbs such as PUT or DELETE in places you normally can't.
通过在 X-HTTP-Method-Override 头或者 req.body[key:_method]. if found method is supported by express, it will be used in req.method.

express 支持的方法 "get,post,put,head,delete,options,trace,copy,lock,mkcol,move,purge,propfind,proppatch,unlock,report,mkactivity,checkout,merge,m-search,notify,subscribe,unsubscribe,patch,search"


### express-validator
这个中间件非常有意思

配置：
errorFormatter: used to specify a function that can be used to format objects populate the error array returned in req.validationErrors()

扩展：
expressValidator.validator.extend('isFinite', function (str) {
    return isFinite(str);
});

使用：

```js
app.use(expressValidator([options])); // this line must be immediately after express.bodyParser()!

app.post('/:urlparam', function(req, res) {

  // checkBody only checks req.body; none of the other req parameters
  // Similarly checkParams only checks in req.params (URL params) and
  // checkQuery only checks req.query (GET params).
  req.checkBody('postparam', 'Invalid postparam').notEmpty().isInt();
  req.checkParams('urlparam', 'Invalid urlparam').isAlpha();
  req.checkQuery('getparam', 'Invalid getparam').isInt();

  // OR assert can be used to check on all 3 types of params.
  // req.assert('postparam', 'Invalid postparam').notEmpty().isInt();
  // req.assert('urlparam', 'Invalid urlparam').isAlpha();
  // req.assert('getparam', 'Invalid getparam').isInt();

  req.sanitize('postparam').toBoolean();

  var errors = req.validationErrors();
  if (errors) {
    res.send('There have been validation errors: ' + util.inspect(errors), 400);
    return;
  }
  res.json({
    urlparam: req.param('urlparam'),
    getparam: req.param('getparam'),
    postparam: req.param('postparam')
  });
});
```

```shell
$ curl -d 'postparam=1' http://localhost:8888/test?getparam=1
{"urlparam":"test","getparam":"1","postparam":true}

$ curl -d 'postparam=1' http://localhost:8888/t1est?getparam=1
There have been validation errors: [
  { param: 'urlparam', msg: 'Invalid urlparam', value: 't1est' } ]

$ curl -d 'postparam=1' http://localhost:8888/t1est?getparam=1ab
There have been validation errors: [
  { param: 'getparam', msg: 'Invalid getparam', value: '1ab' },
  { param: 'urlparam', msg: 'Invalid urlparam', value: 't1est' } ]
```

内幕： 注册一些方法到 req 中

```js
var expressValidator = function(options) {
  
  // 和 checkParam 类似
  function sanitize = function(request, param, value) {

    // 返回一个 methods, 其中每个 method 是调用 validator 的然后 request.upldateParam(param, result);
  }

  function checkParam(req, getter) {
    // use getter to assert val

    return function(param, failMsg) {

      // 注入错误 msg 到  req._validationErrors(via errorFormatter)
      var errorHandler = function (msg) {
        var error = _options.errorFormatter(param, msg, value);

        if (req._validationErrors === undefined) {
          req._validationErrors = [];
        }
        req._validationErrors.push(error);

        if (req.onErrorCallback) {
          req.onErrorCallback(msg);
        }
        return this;
      };

      var methods = [];
      // validator - require('validator');
      Object.keys(validator).forEach(function(methodName) {

        if() { // filter sanitizer(like trim, escape etc)
          methods[methodName] = function() {
            var args = [value].concat(Array.prototype.slice.call(arguments));
            var isCorrect = validator[methodName].apply(validator, args);

            if(!isCorrect) {
              errorHandler(failMsg || 'Invalid value');
            }
          }
        }
      });

      // len, notEmpty method

      return methods;
    }
  }

  return function(req, res, next) {
    // req.updateParam

    // req.check, req.checkFiles, checkBody, checkQuery

    req.checkBody = checkParam(req, function(item) {
      return req.body && req.body[item];
    });

    req.onValidationError = function(errback) {

    };
    req.validationErrors = function(errback) {
      if (req._validationErrors === undefined) {
        return null;
      }
      // or mapped with err.param as key

      return req._validationErrors;
    };

    req.filter = function(param) {
      return sanitize(this, param, this.param(param));
    };
    req.sanitize = req.filter;
    req.assert = req.check;
    req.validate = req.check;
    return next();
  }
};
```


### morgan logger - by tj

```js

exports = module.exports = function logger(options) {
    // check options
    if(options && typeof options !== 'object') {
        options = {format: options};
    } else {
        options = options || {};
    }

    // immediate, skip(support filter fn), fmt, compile, stream, buffer?

    // compile format
    if ('function' != typeof fmt) fmt = compile(fmt);

    // options
    var stream = options.stream || process.stdout;

    return function logger(req, res, next) {
        req._startAt = process.hrtime();
        req._startTime = new Date;
        req._remoteAddress = req.connection && req.connection.remoteAddress;

        function logRequest(){
          res.removeListener('finish', logRequest);
          res.removeListener('close', logRequest);
          if (skip(req, res)) return;
          var line = fmt(exports, req, res);
          if (null == line) return;
          stream.write(line + '\n');
        };

        // immediate
        if (immediate) {
          logRequest();
        // proxy end to output logging
        } else {
          res.on('finish', logRequest);
          res.on('close', logRequest);
        }


        next();
    }
};

// compile `fmt` into a function
function compile(fmt) {
  fmt = fmt.replace(/"/g, '\\"');
  var js = '  return "' + fmt.replace(/:([-\w]{2,})(?:\[([^\]]+)\])?/g, function(_, name, arg){
    return '"\n    + (tokens["' + name + '"](req, res, "' + arg + '") || "-") + "';
  }) + '";'
  console.log(js);
  return new Function('tokens, req, res', js);

  // import fmt: :remote-addr - - [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
  /*
    return ""
      + (tokens["remote-addr"](req, res, "undefined") || "-") + " - - ["
      + (tokens["date"](req, res, "undefined") || "-") + "] \""
      + (tokens["method"](req, res, "undefined") || "-") + " "
      + (tokens["url"](req, res, "undefined") || "-") + " HTTP/"
      + (tokens["http-version"](req, res, "undefined") || "-") + "\" "
      + (tokens["status"](req, res, "undefined") || "-") + " "
      + (tokens["res"](req, res, "content-length") || "-") + " \""
      + (tokens["referrer"](req, res, "undefined") || "-") + "\" \""
      + (tokens["user-agent"](req, res, "undefined") || "-") + "\"";
  */
}

// format
exports.format = function(name, fmt) {
    exports[name] = fmt;
    return this;  
};

exports.format('default', ':remote-addr - - [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"');

exports.format('dev', function(tokens, req, res){
  var color = 32; // green
  var status = res.statusCode;

  if (status >= 500) color = 31; // red
  else if (status >= 400) color = 33; // yellow
  else if (status >= 300) color = 36; // cyan

  var fn = compile('\x1b[90m:method :url \x1b[' + color + 'm:status \x1b[90m:response-time ms - :res[content-length]\x1b[0m');

  return fn(tokens, req, res);
});


// token
exports.token = function(name, fn) {
  exports[name] = fn;
  return this;
};

exports.token('remote-addr', function(req) {
    if(req.ip) return req.ip;
    if(req._remoteAddress) return req._remoteAddress;
    if(req.connection) return req.connection.remoteAddress;
    return undefined;
});
```


### mean-log

```js

var logger = module.exports = exports = new Logger;
function Logger() {}
Logger.prototype = {
    init: function(app, passport, mongoose) {
        // check for valid init
        if(!app || !passport || !mongoose) {
            throw new Error('Logger Could not initialize!');
        }
        // invoke initModel, initRoute
    },
    initModel: function() {}, // set mongoose model-Log{message, created}
    initRoute: function() {},// logger/log?msg logger/show <-(self.mongoose.models.Log.find().sort('-created'))
    log: function() {}
}
```