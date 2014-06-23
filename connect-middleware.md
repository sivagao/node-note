
middleware 分类

- 类似 json, query 这种，仅仅处理下 req.body， 继续 next
- 类似 favicon 这样， 直接检查 req.url, 然后 res.writeHead(200, icon.headers); res.end(icon.body);
- 类似 responseTime 这样的回形针

```js

function responseTime() {
  return function(req, res, next) {
    var start = new Date;
    
    if(res._responseTime) return next();
    res._responseTime = true;

    res.on('header', function() {
      var duration = new Date - start;
      res.setHeader('X-Response-Time', duration+'ms');
    });

    next();
  }
}

function timeout(ms) {
  ms = ms || 5000;

  return function(req, res, next) {
    var id = setTimeout(function(){
      req.emit('timeout', ms);
    }, ms);

    req.on('timeout', function(){
      if (req.headerSent) return debug('response started, cannot timeout');
      var err = new Error('Response timeout');
      err.timeout = ms;
      err.status = 503;
      next(err);
    });

    req.clearTimeout = function(){
      clearTimeout(id);
    };

    res.on('header', function(){
      clearTimeout(id);
    });

    next();
  };
};

function query(options) {
  return function(req, res, next) {
    if(!req.query) {
      req.query = ~req.url.indexOf('?')
        ? qs.parse(parse(req).query, options)
        : {};
    }
    next();
  };
};



connect()
  .use(connect.basicAuth(function(user, pass, fn){
    User.authenticate({ user: user, pass: pass }, fn);
  }))

function basicAuth(callback, realm) {
  var username, password;

  // user / pass strings
  if ('string' == typeof callback) {
    username = callback;
    password = realm;
    if ('string' != typeof password) throw new Error('password argument required');
    realm = arguments[2];
    callback = function(user, pass){
      return user == username && pass == password;
    }
  }

  realm = realm || 'Authorization Required';

  return function(req, res, next) {
    var authorization = req.headers.authorization;

    if (req.user) return next();
    if (!authorization) return unauthorized(res, realm);

    var parts = authorization.split(' ');

    if (parts.length !== 2) return next(utils.error(400));

    var scheme = parts[0]
      , credentials = new Buffer(parts[1], 'base64').toString()
      , index = credentials.indexOf(':');

    if ('Basic' != scheme || index < 0) return next(utils.error(400));

    var user = credentials.slice(0, index)
      , pass = credentials.slice(index + 1);

    // async
    if (callback.length >= 3) {
      var pause = utils.pause(req);
      callback(user, pass, function(err, user){
        if (err || !user)  return unauthorized(res, realm);
        req.user = req.remoteUser = user;
        next();
        pause.resume();
      });
    // sync
    } else {
      if (callback(user, pass)) {
        req.user = req.remoteUser = user;
        next();
      } else {
        unauthorized(res, realm);
      }
    }
  }
};


// list of banned IPs
var banned = [
'127.0.0.1',
'192.168.2.12'
];
// the middleware function
function banner(options) {
  return function(req, res, next) {
    if (options.banned.indexOf(req.connection.remoteAddress) > -1) {
      res.end('Banned');
    }
    else { next(); }
  }
};
```


```js
/**
 * JSON:
 *
 * Parse JSON request bodies, providing the
 * parsed object as `req.body`.
 */
 exports = module.exports = function(options) {

  return function json(req, res, next) {
    if(req._body) return next();

    if (!utils.hasBody(req)) return next();

    if ('application/json' != utils.mime(req)) return next();

    req._body = true; // flag as parsed

    limit(req, res, fucntion(err) {
      if(err) next next(err);
      var buf = '';
      req.setEncoding('utf8');
      req.on('data', function(chunk){buf+=chunk});
      req.on('end', function() {
        var first = buf.trim()[0];
        // check length, first wheather or not in '[','{' etc
        try {
          req.body = JSON.parse(buf, options.revier);
          next();
        } catch(err) {
          err.body = buf;
          err.status = 400;
          next(err);
        };
      });
    });
  }
 }
```
