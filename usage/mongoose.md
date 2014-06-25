
## Misc
在终端中使用`mongo`, 然后可以通过 help 查看帮助

```shell
show dbs
use candy
show collections
db.boards.find
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

