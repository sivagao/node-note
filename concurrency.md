# Node Concurrency
都说 node 能够非阻塞 I/O 高并发. 内幕是什么， 它的小伙伴是怎么做的？ 它的单进程单线程的模式如何利用好服务器的多 CPU 多核心？


```js
// worker.js
var port = Math.round(1+Math.random()*1000);
var http = require('http');
http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
}).listen(port, '127.0.0.1');
console.log(port);

// master
var fork = require('child_process').fork;
var cpus = require('os').cpus();

for(var i = 0; i<cpus.length; i++) {
    fork('./worker.js');
}

// run it: sudo node master.js
// check it: ps aux|grep worker.js
// ps: 非常有意思的是， 一开始 res 写错了， 然后我随意的访问 http://0.0.0.0:287/, 会使得那个 worker 异常退出，而 master 和其他 worker 保持依旧。
```

master-worker 模式下的消息通信

```js
// parent.js
var cp = require('child_process');
var n = cp.fork(__dirname + '/sub.js');

n.on('message', function(msg) {
    console.log('PARENT get message '+msg);
});
n.send({hello: 'world'});


// sub.js
process.on('message', function(m) {
    console.log('CHILD get message ', m);
});

process.send({foo: 'bar'});

// ps: fork 的子进程和 parent 共用一个 stdout(console.log)
```

IPC - 进程间通信的句柄传递（ 多 http server 的 worker， 监听相同端口）
如果没有句柄传递，那么需要在 http proxy 转发到 worker 的 prot 下进行处理后在 pipe 出去。

```js
// shared-handler-parent.js
var cp = require('child_process');
var child1 = cp.fork('./shared-handler-child.js');
var child2 = cp.fork('./shared-handler-child.js');

var server = require('net').createServer();
server.listen(1337, function() {
    console.log('route in PARENT to CHILD');
    child1.send('server', server);
    child2.send('server', server);

    // close it
    server.close();
});

// shared-handler-child.js
var http = require('http');
var server = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('handled by child, pid is ' + process.pid + '\n');
});

process.on('message', function(m, tcp) {
    if(m === 'server') {
        tcp.on('connection', function(socket) {
            console.log('route in CHILD to http server, pid '+process.pid);
            server.emit('connection', socket);
        });
    }
});

// PS: parent tcp server 的 connection 有两个回调，但是为什么当 connection 事件发生的时候，只会触发一个回调函数的执行？
// node 进程之间只有消息传递，不会真正的传递对象（所以使用的 api，已经封装处理的结果 - get(fd), parseJSON etc ）
// parent tcp server 建立的文件描述符同一时间只能被某个进程所用。（只有一个幸运的进程能够抢到连接。）
```

TODO: 句柄的发送和还原；端口共同监听


## 集群的稳定
### 进程事件： error, exit, close, disconnect.

### 自动重启

#### 自杀信号

#### 限量重启
如果启动过程中（或者接到请求）时就挂掉了，可能是因为代码问题或者依赖的外部资源问题， 导致无意义的重复启动。那么可以通过单位时间重启多少次，超过限制就触发 giveup 事件，让 master 移除。

### 负载均衡 
默认的是操作系统的抢占式（影响抢占的是 CPU 的繁忙程度， 而不能兼顾好 I/O 繁忙）， node v0.11引入了 调度 round-robin 策略，依次发送

## 状态共享
对于配置数据，Session 数据等，这些需要在多个进程应该是一致的。 所以应该存储如第三方的数据处，如 redis， 在所有工作进程启动的时候读取如内存中， 但是如果数据发生改变， 需要一种机制通知到各个子进程中。
引入通知进程（和 master 进程不一样的是， 它只是进行轮询和通知，而不是 worker 的管控。 同时，它的推送机制不是 IPC，而是 tcp 的跨多台服务器的方案）
