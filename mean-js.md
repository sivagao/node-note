# #开搞

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