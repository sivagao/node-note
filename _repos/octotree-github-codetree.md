
### Summary
非常cool啊， 昨天刚想找类似的插件（想不用下载也能很爽的看代码）
jsTree的合理运用和pjax(github现有)


#### github.js
a higher-level wrapper around the Github API. intended for the browser

var repo = github.getRepo(username, reponame);

If you want to access all blobs and trees recursively, you can add ?recursive=true.
repo.getTree('master?recursive=true', function(err, tree) {});

Given a filepath, retrieve the reference blob or tree sha.
repo.getSha('master', '/path/to/file', function(err, sha) {});



#### jstree

- state plugin
saves the state of the tree(selected nodes, opened nodes) on the user's computer using avaiable options(localStorage, cookies, etc)

- types plugin
makes it possible to add predefined tyeps for groups of nodes, which make it possible to easily control nesting rules and icon for each group.

- wholerow plugin
Makes each node appear block level

- // other plugins: sort, search, dnd, checkbox, contentmenu

- dnd: 可以运行拖拽改变node的顺序等
- checkbox: render checkbox ioncs in front of each node, making multiple selection much easier.

特殊的事件如：
ready.tree


```js
$(document.ready(function() {
    loadRepo();

    // setUp deltectLocationChang to re loadRepo

    Mousetrap.bind('ctrl+b', toggleSider);
}));

function loadRepo(reload) {
    var repo = getRepoFromPath(),
        repoChanged = JSON.stringify(repo) !== JSON.stringify(currentRepo);

    if(repo && (repoChanged || reload)) {
        currentRepo = repo;

        if (!domInitialized) {
            $('body')
                .append($sidebar)
                .append($toggleBtn.click(toggleSidebar))
            domInitialized = true;
        }

        fetchData(repo, function(err, tree) {
            if (err) return onFetchErrror(err);
            renderTree(repo, tree);
        })
    }
}

function getRepoFromPath() {
    // match from location
    return {
        username: match[1],
        reponame: match[2],
        branch: $('*[data-master-branch]').data('ref') || 'master'
    }
}

function fetchData(repo, done) {
    // using github api to load
    var api = github.getRepo(repo.username, repo.reponame);

    api.getTree(encodeURIComponent(repo.branch) + '?recursive=true', function(err, tree) {
        // 整理数据tree - 把treeList 变成真正的 tree
        // raw data
        /*
        https://api.github.com/repos/buunguyen/octotree/git/trees/master?recursive=true&1400218624262
        {
            sha,
            tree: [{mode, path, sha, size, type, url}]
            url
        }
        */
        /*
            split to folder, name, remix url etc, and sort folder
        */
    })
}

function renderTree(repo, tree) {
    $treeView.empty().jstree({
        core: {data: tree, animation: 100, themes:  {
            responsive: false
        }},
        plugins: ['wholerow', 'state'],
        state: {key: PREFIX + '.' + repo.username + '/' + repo.reponame}
    }).delegate('.jstree-open>a', 'click.jstree', function() {
        $.jstree.reference(this).close_node(this);
    }).on('click', function(e) {
        // check on a.jstree-anchor, and type is blob
        $.pjax({
            url: $target.attr('href'),
            timeout: 5000,
            container: $('#js-repo-pjax-container')
        });
    }).on('ready.tree', function() {
        // updateSider(headerText)
    })
}

function toggleSidebar() {
    var shown = store.get(SHOWN)
    if (shown) $html.removeClass(PREFIX)
    else $html.addClass(PREFIX)
    store.set(SHOWN, !shown)
}

// utily
function Storage() {
    this.get = function(key) {
        var val = localStorage.getItem(key);
        try {
            return JSON.parse(val);
        } catch(e) {
            return val;
        }
    };
    this.set = function(key, val) {
        return localStorage.setItem(key, JSON.stringify(val));
    }
}

```


```js
(function() {
  const PREFIX = 'octotree'
      , TOKEN  = 'octotree.github_access_token'
      , SHOWN  = 'octotree.shown'
      , REGEXP = /([^\/]+)\/([^\/]+)(?:\/([^\/]+))?/ // (username)/(reponame)/(subpart)
      , RESERVED_USER_NAMES = [
          'settings', 'orgs', 'organizations', 
          'site', 'blog', 'about',      
          'styleguide', 'showcases', 'trending',
          'stars', 'dashboard', 'notifications'
        ]
      , RESERVED_REPO_NAMES = ['followers', 'following']

  var $html    = $('html')
    , $sidebar = $('<nav class="octotree_sidebar">' +
                     '<div class="octotree_header">loading...</div>' +
                     '<div class="octotree_treeview"></div>' +
                   '</nav>')
    , $treeView = $sidebar.find('.octotree_treeview')
    , $tokenFrm = $('<form>' +
                     '<div class="message"></div>' +
                     '<div>' +
                       '<input name="token" type="text" placeholder="Paste access token here"></input>' +
                     '</div>' +
                     '<div>' +
                       '<button type="submit" class="button">Save</button>' +
                       '<a href="https://github.com/buunguyen/octotree#github-api-rate-limit" target="_blank">Why need access token?</a>' +
                     '</div>' +
                     '<div class="error"></div>' +
                   '</form>')
    , $toggleBtn = $('<a class="octotree_toggle button"><span></span></a>')
    , $dummyDiv  = $('<div/>')
    , store      = new Storage()
    , domInitialized = false
    , currentRepo    = false

  $(document).ready(function() {
    loadRepo()

    // When navigating from non-code pages (i.e. Pulls, Issues) to code page
    // GitHub doesn't reload the page but uses pjax. Need to detect and load Octotree.
    var href = location.href
      , hash = location.hash
    function detectLocationChange() {
      if (location.href !== href || location.hash != hash) {
        href = location.href
        hash = location.hash
        loadRepo()
      }
      window.setTimeout(detectLocationChange, 200)
    }
    detectLocationChange()

    Mousetrap.bind('ctrl+b', toggleSidebar)
  })

  function loadRepo(reload) {
    var repo = getRepoFromPath()
      , repoChanged = JSON.stringify(repo) !== JSON.stringify(currentRepo)

    if (repo && (repoChanged || reload)) {
      currentRepo = repo

      if (!domInitialized) {
        $('body')
          .append($sidebar)
          .append($toggleBtn.click(toggleSidebar))
        domInitialized = true
      }

      fetchData(repo, function(err, tree) {
        if (err) return onFetchError(err)
        renderTree(repo, tree)
      })
    }
  }

  function getRepoFromPath() {
    // 404 page, skip
    if ($('#parallax_wrapper').length) return false

    var match = location.pathname.match(REGEXP)
    if (!match) return false
     
    // Not a repository, skip
    if (~RESERVED_USER_NAMES.indexOf(match[1])) return false
    if (~RESERVED_REPO_NAMES.indexOf(match[2])) return false

    // Not a code page, skip
    if (match[3] && !~['tree', 'blob'].indexOf(match[3])) return false

    return { 
      username : match[1], 
      reponame : match[2],
      branch   : $('*[data-master-branch]').data('ref') || 'master'
    }
  }

  function fetchData(repo, done) {
    var github  = new Github({ token: store.get(TOKEN) })
      , api     = github.getRepo(repo.username, repo.reponame)
      , root    = []
      , folders = { '': root }

    api.getTree(encodeURIComponent(repo.branch) + '?recursive=true', function(err, tree) {
      if (err) return done(err)
      tree.forEach(function(item) {
        var path   = item.path
          , type   = item.type
          , index  = path.lastIndexOf('/')
          , name   = path.substring(index + 1)
          , folder = folders[path.substring(0, index)]
          , url    = '/' + repo.username + '/' + repo.reponame + '/' + type + '/' + repo.branch + '/' + path

        folder.push(item)
        item.text = sanitize(name)
        item.icon = type // use `type` as class name for tree node
        if (type === 'tree') {
          folders[item.path] = item.children = []
          item.a_attr = { href: '#' }
        }
        else if (type === 'blob') {
          item.a_attr = { href: url }
        }
        // TOOD: handle submodule, anyone?
      })

      done(null, sort(root))

      function sort(folder) {
        folder.sort(function(a, b) {
          if (a.type === b.type) return a.text.localeCompare(b.text)
          return a.type === 'tree' ? -1 : 1
        })
        folder.forEach(function(item) {
          if (item.type === 'tree') sort(item.children)
        })
        return folder
      }
    })
  }

  function onFetchError(err) {
    var header = 'Error: ' + err.error
      , hasToken = !!store.get(TOKEN)
      , message

    if (err.error === 401) {
      header  = 'Invalid token!'
      message = 'The token is invalid. Follow <a href="https://github.com/settings/tokens/new" target="_blank">this link</a> to create a new token and paste it in the textbox below.'
    }

    else if (err.error === 404) {
      header = 'Private or invalid repository!'
      if (hasToken) message = 'You are not allowed to access this repository.'
      else          message = 'Accessing private repositories requires a GitHub access token. Follow <a href="https://github.com/settings/tokens/new" target="_blank">this link</a> to create one and paste it in the textbox below.'
    }

    else if (err.error === 403 && ~err.request.getAllResponseHeaders().indexOf('X-RateLimit-Remaining: 0')) {
      header = 'API limit exceeded!'
      if (hasToken) message = 'Whoa, you have exceeded the API hourly limit, please create a new access token or take a break :).'
      else          message = 'You have exceeded the GitHub API hourly limit and need GitHub access token to make extra requests. Follow <a href="https://github.com/settings/tokens/new" target="_blank">this link</a> to create one and paste it in the textbox below.'
    }

    updateSidebar('<div class="octotree_header_error">' + header + '</div>', message)
  }

  function renderTree(repo, tree) {
    $treeView
      .empty()
      .jstree({
        core    : { data: tree, animation: 100, themes : { responsive : false } },
        plugins : ['wholerow', 'state'],
        state   : { key : PREFIX + '.' + repo.username + '/' + repo.reponame }
      })
      .delegate('.jstree-open>a', 'click.jstree', function() {
        $.jstree.reference(this).close_node(this)
      })
      .delegate('.jstree-closed>a', 'click.jstree', function() {
        $.jstree.reference(this).open_node(this)
      })
      .on('click', function(e) {
        var $target = $(e.target)
        if ($target.is('a.jstree-anchor') && $target.children(':first').hasClass('blob')) {
          $.pjax({ 
            url       : $target.attr('href'), 
            timeout   : 5000, //gives it more time, should really have a progress indicator...
            container : $('#js-repo-pjax-container') 
          })
        }
      })
      .on('ready.jstree', function() {
        var headerText = '<div class="octotree_header_repo">' + 
                           repo.username + ' / ' + repo.reponame + 
                         '</div>' +
                         '<div class="octotree_header_branch">' + 
                           repo.branch + 
                         '</div>'
        updateSidebar(headerText)
      })
  }

  function updateSidebar(header, message) {
    $sidebar.find('.octotree_header').html(header)

    if (message) {
      var token = store.get(TOKEN)
      if (token) $tokenFrm.find('[name="token"]').val(token)
      $tokenFrm.find('.message').html(message)
      $treeView.empty().append($tokenFrm.submit(saveToken))
    }

    // Shows sidebar when:
    // 1. First time after extension is installed
    // 2. If it was previously shown (TODO: many seem not to like it)
    if (store.get(SHOWN) !== false) {
      $html.addClass(PREFIX)
      store.set(SHOWN, true)
    }
  }

  // remeber to toogle SHOWN state in localStorage
  function toggleSidebar() {
    var shown = store.get(SHOWN)
    if (shown) $html.removeClass(PREFIX)
    else $html.addClass(PREFIX)
    store.set(SHOWN, !shown)
  } 

  function saveToken(event) {
    event.preventDefault()

    var token  = $tokenFrm.find('[name="token"]').val()
      , $error = $tokenFrm.find('.error').text('')

    if (!token) return $error.text('Token is required')

    store.set(TOKEN, token)
    loadRepo(true)
  }

  function sanitize(str) {
    return $dummyDiv.text(str).html()
  }

  // cool, shortcut to prototype method definition
  function Storage() {
    this.get = function(key) {
      var val = localStorage.getItem(key)
      try {
        return JSON.parse(val)
      } catch (e) {
        return val
      }
    }
    this.set = function(key, val) {
      return localStorage.setItem(key, JSON.stringify(val))
    }
  }
})()

```