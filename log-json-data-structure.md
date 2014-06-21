# Log json data structure

## WHY
 在处理不熟悉的 api 的时候，需要看看 json 数据格式,但是大量的数据（尤其是 length 很大的数组，很影响阅读）

##CODE

```js
function getStruct(raw) {
    if(raw instanceof Array) {
      return {
        length: raw.length,
        type: 'array',
        structure: getStruct(raw[0])
      };
    }

    if(!isObject(raw)) return raw;

    var typeObj = groupBy(raw, function(val, key) {
      if(typeof val === 'object') {
        if(val instanceof Array) return 'array';
        return 'object';
      }
      return typeof val;
    });

    if(typeObj['array']) {
      var _arr = typeObj['array'];
      _arr.forEach(function(key, idx) {
          var val = raw[key];
          var _inner = val[0];

          function getTransType(_inner) {
              switch (typeof _inner) {
                  case 'object':
                      return getStruct(_inner);
                  default:
                      return typeof _inner;
              }
          }
          return {
              length: val.length,
              key: key,
              structure: getTransType(_inner)
          };
      });
    }

    if(typeObj['object']) {
      var _arr = typeObj['object'];
      typeObj['object'] = {};
      _arr.forEach(function(key, idx) {
          var val = raw[key];
          typeObj['object'][key] = getStruct(val);
      });
    }
    return typeObj;
}

// group by string, number, boolean, array, object
/*
  {
    string: [key, key],
    number: [],
    array: [{
      key: '',
      length: 'number of',
      structure: selfFn(item)
    }],
    object: selfFn(item)
  }
*/
console.slog = function(raw) {
  console.log(getStruct(raw));
};


// helpers defined below
function isObject(value) {
  var type = typeof value;
  return type == 'function' || (value && type == 'object') || false;
}

function each(obj, fn) {
    for(var key in obj) {
        if(!obj.hasOwnProperty(key)) return;
        var val = obj[key];
        fn(val, key);
    }
}

function groupBy(obj, fn) {
  var _dict = {};
  each(obj, function(val, key) {
    var _tmpKey = fn(val, key);
    _dict[_tmpKey] ?
      _dict[_tmpKey].push(key) :
      ((_dict[_tmpKey]=[]) && _dict[_tmpKey].push(key));
  });
  return _dict;
}

// quick fix console.log, which dont support log nested level greater than 2
var _oldLog = console.log;
console.log = function() {
  // return console.dir.apply(this, arguments);
  if(arguments.length === 1) {
    try{
      arguments[0] = JSON.stringify(arguments[0], null, 2);
    }catch(e) {}
  }
  _oldLog.apply(this, arguments);
};

```

## output

```js
{ login: 'gaohailang',
  id: 697853,
  avatar_url: 'https://avatars.githubusercontent.com/u/697853?',
  gravatar_id: 'de94a6fc216198b392522a89c7587b25',
  url: 'https://api.github.com/users/gaohailang',
  html_url: 'https://github.com/gaohailang',
  followers_url: 'https://api.github.com/users/gaohailang/followers',
  following_url: 'https://api.github.com/users/gaohailang/following{/other_user}',
  gists_url: 'https://api.github.com/users/gaohailang/gists{/gist_id}',
  starred_url: 'https://api.github.com/users/gaohailang/starred{/owner}{/repo}',
  subscriptions_url: 'https://api.github.com/users/gaohailang/subscriptions',
  organizations_url: 'https://api.github.com/users/gaohailang/orgs',
  repos_url: 'https://api.github.com/users/gaohailang/repos',
  events_url: 'https://api.github.com/users/gaohailang/events{/privacy}',
  received_events_url: 'https://api.github.com/users/gaohailang/received_events',
  type: 'User',
  site_admin: false,
  name: 'gaohailang',
  company: '',
  blog: 'sivagao.com',
  location: 'Beijing, China',
  email: 'ghlndsl@126.com',
  hireable: true,
  bio: null,
  public_repos: 47,
  public_gists: 92,
  followers: 26,
  following: 113,
  created_at: '2011-03-29T18:36:32Z',
  updated_at: '2014-06-21T04:31:38Z',
  private_gists: 9,
  total_private_repos: 3,
  owned_private_repos: 0,
  disk_usage: 148270,
  collaborators: 0,
  plan:
   { name: 'free',
     space: 307200,
     collaborators: 0,
     private_repos: 0 },
  meta:
   { 'x-ratelimit-limit': '5000',
     'x-ratelimit-remaining': '4975',
     'x-oauth-scopes': 'user, public_repo, repo, repo:status, gist',
     'last-modified': 'Sat, 21 Jun 2014 04:31:38 GMT',
     etag: '"14dfc9a55059b5711d352732079c2d3f"',
     status: '200 OK' } }
{
  "string": [
    "login",
    "avatar_url",
    "gravatar_id",
    "url",
    "html_url",
    "followers_url",
    "following_url",
    "gists_url",
    "starred_url",
    "subscriptions_url",
    "organizations_url",
    "repos_url",
    "events_url",
    "received_events_url",
    "type",
    "name",
    "company",
    "blog",
    "location",
    "email",
    "created_at",
    "updated_at"
  ],
  "number": [
    "id",
    "public_repos",
    "public_gists",
    "followers",
    "following",
    "private_gists",
    "total_private_repos",
    "owned_private_repos",
    "disk_usage",
    "collaborators"
  ],
  "boolean": [
    "site_admin",
    "hireable"
  ],
  "object": {
    "bio": null,
    "plan": {
      "string": [
        "name"
      ],
      "number": [
        "space",
        "collaborators",
        "private_repos"
      ]
    },
    "meta": {
      "string": [
        "x-ratelimit-limit",
        "x-ratelimit-remaining",
        "x-oauth-scopes",
        "last-modified",
        "etag",
        "status"
      ]
    }
  }
}
```

