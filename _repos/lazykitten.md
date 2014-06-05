
### 简单的express template

### Tips:
- __dirname: 特殊变量
- exports和module.exports的区别
- express 项目的一般layout
- JSON.stringify({ a:1, b:2, c:3 }, null, 4) -pretty print

```javascript

// pkg.js
var fs = require('js');
exports.fetch = function() {
    return JSON.parse(fs.readFileSync(__dirname + '/package.json'));
}

exports.set = function(obj) {
    if (obj && typeof(obj) == 'object') {
        fs.writeFileSync(__dirname + '/package.json', JSON.stringify(obj));
        return obj;
    } else {
        return false;
    }
}

// bin/server.js
#!/user/bin/env node

require('../main').start();

// main.js
// 引入类库依赖
var express = require('express'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    pkg = require('./pkg').fetch(),
    color = require('colorful'),
    optimist = require('optimist'),
    argv = optimist.argv;


exports.start = function() {

    var app = express(),
        port = argv.p ? argv.p : pkg.lazykitten.port,
        beaman = argv.beaman ? argv.beaman : false;

    app.set('port', process.env.PORT||port);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');

    app.use(express.favicon());
    app.use(express.logger('dev'));

    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.use(app.router); // IMPORTANT routes defined below used here

    app.use(require('less-middleware')({
        src: __dirname + '/public'
    }));
    app.use(express.static(path.join(__dirname, 'public')));

    if('development' == app.get('env')) {
        app.use(express.errorHandler());
    }

    if(beaman) {
        pkg.lazykitten.man = beaman;
        require('./pkg').set(pkg);
    }

    app.locals({sys: pkg});

    app.get('/html/:delay', require('./routes/index'));
    app.all('/api/:delay', require('./routes/api'));


    http.createServer(app).listen(app.get('port'), function() {
        console.log(color.yellow('['+pkg.name+']'+' is running on ......'+' ==> http://localhost:'+app.get('port')));
    });
};

// routes/api.js
module.exports = function(req, res, next) {
    delay(req.params.delay, function() {
        res.json(pkg.lazykitten.json);
    });
}


// lib/delay.js
module.exports = function(s, cb) {
    var delay = 1;
    if (!isNaN(parseFloat(s))) {
        delay = s;
    }
    setTimeout(function() {
        cb()
    }, delay*1000);
}

// lib/fetch.js
var request = require('request');

var basePlaceholder = function(tpl) {
    var cbFn = function(error, response, body) {
        if(!error && response.statusCode == 200) {
            cb(body);
        } else {
            cb('err');
        }
    };
    return function(params, cb) {
        request({
            url: tpl.replace('<width>', params.width).replace('<height>', params.height),
            encoding: null
        }, cbFn);
    };
};
exports.kitten = basePlaceholder('http://placekitten.com/<width>/<height>');
exports.beaman = basePlaceholder('http://placekitten.com/<width>x<height>');
```