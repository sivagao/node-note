
# node REPL

REPL: read eval print loop. it provides a easy way to interactively run javascript and see the results. it can be used for debugging, testing, or just trying things out.

## Usage

进入： `node`
使用： simplistic emacs line-editing

特殊命令：
.save - Save the current REPL session to a file `.save ./file/to/save.js`
.clear - Resets the context object to an empty object and clears any multi-line expression.

`repl.start("> ").context.m = msg; // REPL provides access to any variables in the global scope. `


server

```js
var repl = require('repl')
var net = require('net')
 
net.createServer(function (socket) {
  var r = repl.start({
      prompt: 'socket '+socket.remoteAddress+':'+socket.remotePort+'> '
    , input: socket
    , output: socket
    , terminal: true
    , useGlobal: false
  })
  r.on('exit', function () {
    socket.end()
  })
  r.context.socket = socket
}).listen(1337)
```

client

```js
var net = require('net');

var sock = net.connect(1337);

process.stdin.pipe(sock);
sock.pipe(process.stdout);
```


```js
var http = require('http')
  , repl = require('repl')
  , buf0 = new Buffer([0])
 
var server = http.createServer(function (req, res) {
  res.setHeader('content-type', 'multipart/octet-stream')
 
  res.write('Welcome to the Fun House\r\n')
  repl.start({
      prompt: 'curl repl> '
    , input: req
    , output: res
    , terminal: false
    , useColors: true
    , useGlobal: false
  })
 
  // log
  console.log(req.headers['user-agent'])
 
  // hack to thread stdin and stdout
  // simultaneously in curl's single thread
  var iv = setInterval(function () {
    res.write(buf0)
  }, 100)
 
  res.connection.on('end', function () {
    clearInterval(iv)
  })
})
server.listen(8000)

/*
☮ ~ (master) ⚡ curl -sSNT. localhost:8000
Welcome to the Fun House
curl repl> process.platform
'darwin'
*/
```

