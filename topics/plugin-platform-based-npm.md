# Plugin Center based on npm

```js
var toGitUrl = require('github-url-from-git');
var npm = require('npm');
var devnull = require('fs').openSync('/dev/null', 'w');

// load npm，并且定时更新
npm.load({ logfd: devnull, outfd: devnull }, function (err) {
  // dead if no npm :(
  if (err) throw err;

  // update every `interval` seconds
  setInterval(loadResults(), interval*1000);
});


// load from specific packages from npm 
npm.commands.search(['mongoose'], function(err, r) {
  if(err) return error(err);

  var names = object.keys(r), pending = 0;
  names.forEach(function(name) {
    ++pending;
    npm.commands.view([name+'@latest'], true, function(err, json) {
      if(!err) {
        massage(json);
      }
      if(--pending) return;

      updating = false;
      processResult(r, true);
    });
  });
  function massage(obj) {
    // 整理数据格式
    // github url, repo etc
  }
});

// 处理npm 搜索 json，补全 words 搜索词库，写入文件
function processResult (r, writeFile) {
  search.cache = r;
  console.error('  cache updated');

  // cachekeys are regexps used in search
  cachekeys = [];

  // same: Returns true if any of the values in the list pass the predicate truth test. Short-circuits and stops traversing the list if a true element is found
  // same 是『短路』！
  Object.keys(search.cache).some(function (key) {
    // don't display mongoose in results
    if ('mongoose' == key) return;

    var hit = search.cache[key];
    var words = [key].concat(hit.words || []);

    // if hit.github, 处理 moongose 本身
    // 同时把用户抽取出来放到搜索词中
    if (hit.github) {
      if ('https://github.com/LearnBoost/mongoose' == hit.github) {
        delete search.cache[key];
        return;
      }

      var username = hit.github.replace(/^.*github\.com\/([^\/]+)\/.*/, '$1');
      words.push(username)
    }

    words.forEach(function (word) {
      var rgx = new RegExp(rgEscape(word), 'i');
      rgx.key = key; // package name?
      cachekeys.push(rgx);
    });
  });

  search.emit('results', r);

  if (writeFile) {
    fs.writeFile(cachefile, JSON.stringify(r), 'utf8', function (err) {
      // ignore errors
    });
  }
}

// export 的 search 方法， 和搜索词库中的正则匹配
var search = module.exports = exports = function search (term, cb) {
  if ('function' != typeof cb) throw TypeError('missing callback');

  return search.cache
    ? cb(null, find(term))
    : search.once('results', function () {
        cb(null, find(term));
      });

  function find (term) {
    term || (term = '');
    if ('*' == term) term = '';
    var termRgx = new RegExp(rgEscape(term), 'i');
    var hits = [];
    var found = {};

    cachekeys.forEach(function (rgx) {
      var key = rgx.key || term;
      if (key in found) return;
      if (!term || rgx.test(term) || termRgx.test(rgx.source)) {
        found[key] = 1;
        hits.push(search.cache[key]);
      }
    });

    hits.sort(function (a, b) {
      a = new Date(a.time);
      b = new Date(b.time);
      return a < b
        ? 1
        : b < a
          ? -1
          : 0;
    });

    return hits;
  }
}

search.__proto__ = require('events').EventEmitter.prototype;
```

