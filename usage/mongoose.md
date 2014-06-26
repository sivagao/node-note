
## Misc
在终端中使用`mongo`, 然后可以通过 help 查看帮助

```shell
show dbs
use candy
show collections
db.boards.find
```

## Note from 『mongoose for application development』
Mongoose, a data modeling tool

- to dramatically speed up your development process
- it has a data model, and bringing control and management of that model into you app. 
- it enables you to create a robust yet rich data strcuture, a level of database management.

what is mongoose good for?

- be useful to interact with structured dat in a structured and repeatable way.
- to remove some complexity from the nested callbacks.
- has a suite of helper functions and methods


## Topic - Validation data

default validation: 
all：unique, required
numer: min, max
string: match, enum

understanding validation errors

自定义 validator

Tips: 有插件，来把 vdalidator 导出为 mongoose 适用的

```js
var weekdaySchema = new Schema({
     day : {type: String, match: /^(mon|tues|wednes|thurs|fri)day$/i}
});
// OR
var weekdays = ['monday', 'tuesday', 'wednesday', 'thursday',
   'friday'];
var weekdaySchema = new Schema({
 day : {type: String,  enum: weekdays}
});

// 如何捕获验证出错?
// 最好把这里抽到共用的地方 - 给 controller 返回错误 json，便于传递给 API 的使用者
user.save(function(err, user) {
   if(err) {
        // may be valdation error
    }
});
// 错误格式
{
    message: 'Validation failed',
    name: 'ValidationError',
    errors: {
        email: {
            message: 'Validator "required" failed for path email',
            name: 'ValidatorError',
            path: 'email',
            type: 'required'
        },
        name: {
            message: 'Validator "required" failed for path name',
            name: 'ValidatorError',
            path: 'name',
            type: 'required'
        }
    }
}


// valdiator fn 返回值固定为 Boolean
var lengthValidator = function (val) {
    if(val && val.length >= 5) {
        return true;
    }
    return false;
}

var validateObj = [
     {validator: lengthValidator, msg: 'Too short'} ,
     {validator: /^[a-z]+$/i, msg: 'Letters only'}
];
// schema path 的 validator 比较灵
// 可以是对象（多个验证[{validator, msg, type}]），可以是普通 Boolean Fn（正则也行）
name: {type: String, required: true, vlaidator: validateObj}
```


## Topic - Complex Schemas
dont like relational database, it has no SQL-style `JOIN` commands, instead it has concepts of population and subdocuments(embeded docuemnts).

```js
// population
var projectSchema = new mongoose.Schema({
     ...
     createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    ...
});

Project
    .findById(req.params.id)
    .populate('createBy')
    .exec(function(err, project){})
// partial subdocuemnt: .populate('craeteBy', 'name email')
// multi sundocuemnt .populate('createBy contributors')
Project
    .populate({
        path: 'contributors',
        match: {email: /@wandoujia\.com/i},
        select: 'name lastLogin',
        options: {limit: 5, sort: 'name'}
    }).exec()

// subdocuments
// subdocuments are documents that are stored within a parent document, instead of a MongoDB collection of their own.
var projectSchema = new mongoose.Schema({
     projectName: String,
     ...
     tasks: [taskSchema]
});

project.tasks.push({
   taskName: req.body.taskName,
   taskDesc: req.body.taskDesc,
   createdBy: req.session.user._id
 });
// accessing a specific subdocument: to use id()
var thisTask = project.tasks.id(req.params.taskID);

app.get('/project/:id/task/edit/:taskID', project.editTask);
app.post('/project/:id/task/edit/:taskID', project.doEditTask);
app.get('/project/:id/task/delete/:taskID', project.confirmDeleteTask);
app.post('/project/:id/task/delete/:taskID', project.doDeleteTask);
```

Thing to think about - data migration
to create a script to update all at once, or update on an ongoing "as needed" basis
综合考虑：latency, potential downtime, code complexity, and any other application specific consideration.



## Topic - Plugins - re-using code
http://plugins.mongoosejs.com - 非常有意思简单的基于 npm 的插件『平台』

```js
var mongoose = require('mongoose');
module.exports = exports = function modifiedOn(schema, options) {
    schema.add({modifiedOn: Date});

    schema.pre('save', function(next) {
        this.modifiedOn = Date.now();
        next(); // pass on execute chain
    });
};
// use it 
var modifiedOn = require('./modifiedOn');
userSchema.plugin(modifiedOn);
```

## Connecting
有个问题，localhost 要转成 127.0.0.1 才行(更我修改的 hosts 有关？！)

```js
var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://127.0.0.1:27017/test');
// db = mongoose.createConnection('mongodb://user:pass@localhost:port/database');
```

## Schemas
TODO: 更高级的 validation？ virtual key, pre, post hook 等
Aside from defining the structure of your documents and the types of data, a Schema handles the definition of:

- Validators
- Defaults
- Getters, Setters
- Indexes
- Middleware hook
- Methods
- Statics
- Plugins
- pseudo-JOINs

PS:
Virtuals are document properties that you can get and set but that do not get persisted to MongoDB. The getters are useful for formatting or combining fields, while settings are useful for de-composing a single value into multiple values for storage.

```js
// assign a function to the "statics" object of our animalSchema
animalSchema.statics.findByName = function (name, cb) {
  this.find({ name: new RegExp(name, 'i') }, cb);
}

personSchema.virtual('name.full').get(function () {
  return this.name.first + ' ' + this.name.last;
});

personSchema.virtual('name.full').set(function (name) {
  var split = name.split(' ');
  this.name.first = split[0];
  this.name.last = split[1];
});
```

```js
var PersonSchema = new mongoose.Schema({
    SSN: String,
    LastName: String,
    Vehicles: [{
        VIN: Number
    }]
});
var Person = db.model('person', PersonSchema);
```

## Insert

```js
db.on('open', function() {
    var person = new Person({
        SSN: '123-45-877',
        LastName: 'Pluck',
        Vehicles: [
            {
                VIN: 23232,
                Type: 'Jeep'
            },
            {
                VIN: 23232,
                Type: 'Jeep'
            }
        ]
    });
    person.SSN = 12; // 会被隐式的转变格式
    person.save(function(error) {
        db.close();

        if(error) {
            console.error(error);
        } else {
            console.log('Successfully saved!');
        }
    });
});
```

## Query
Query Builder, is cool like in Django and Rails

```js
User.find({'name' : 'Simon Holmes'})
   .where('age').gt(18)
   .sort('-lastLogin')
   .select('_id name email')
   .exec(function (err, users){
     if (!err){
       console.log(users); // output array of users found
    });
```


## Update

## Delete



## 其他

```js
// embedded documents: defined a key in the Schema that looks like:
// comments: [Comments]

var CommentSchema = new Schema({
    name  :  { type: String, default: 'hahaha' }
  , age   :  { type: Number, min: 18, index: true }
  , bio   :  { type: String, match: /[a-z]/ }
  , date  :  { type: Date, default: Date.now }
  , buff  :  Buffer
});

// a setter
CommentSchema.path('name').set(function (v) {
  return capitalize(v);
});

// middleware
CommentSchema.pre('save', function (next) {
  // you can do ...
  console.log(this.get('email'));
  next();
});

var Comment = db.model(CommentSchema);

// 如果保存：ValidationError: Path `age` (12) is less than minimum allowed value (18).

```

