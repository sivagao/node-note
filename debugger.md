# Using Debugger

## WHY
我需要在我需要的地方『定』住，然后去 REPL.

## HOW

- 1 在需要的地方输入 debugger; statement
- 2 node debugger <your script path>
- 3 在 shell 中使用 c(continue), n(next)等
- 4 在断点处，驶入 REPL 进入 playground!

PS: 特此记录，是因为比较奇葩的是，需要输入 REPL 才会进入，感觉违反直觉

##CODE

```js
var GitHubApi = require("github");

var github = new GitHubApi({
    // required
    version: "3.0.0"
});
github.authenticate({
    type: "oauth",
    token: 'YOURS-OAUTH'
});
github.user.get({}, function(err, res) {
    console.log("GOT ERR?", err);
    console.log("GOT RES?", res);
    debugger;

    github.repos.getAll({}, function(err, res) {
        debugger;
        console.log("GOT ERR?", err);
        console.log("GOT RES?", res);
    });
});
```