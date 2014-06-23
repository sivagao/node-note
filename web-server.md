## Web Server @ Node.js
一些常见于 web 服务器中的函数和 task的解决方法，记录于下。

convert bytes(in fs.stats) to human-readable format



```js
function sizeToStr(bytes) {
    var sizeStr = '';

    if(bytes < 1024) {
        return bytes + 'B';
    }

    var units = 'KMGTP'.split('');
    var u = -1;
    do {
        bytes /= 1024;
        ++u;
    } while (bytes >= 1024);
    return bytes.toFixed(1) + units[u];
}
```


```js


/*
param: stats -> {mode: 33188}
return: '-rw-r--r--'
*/
/* parseInt('xx',10) NaN */
function permsToString(stats) {
    var dir = stat.isDirectory() ? 'd': '-',
        mode = stat.mode.toString(8);

    return dir + mode.slice(-3).split('').map(function(n) {
        return [
          '---',
          '--x',
          '-w-',
          '-wx',
          'r--',
          'r-x',
          'rw-',
          'rwx'
        ][parseInt(n, 10)];
    }).join('');
}
```
