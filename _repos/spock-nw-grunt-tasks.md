

### Summary

```html
<div class="sidebar">
    <div class="sidebar__shadow"></div>
    <div class="sidebar__title">Open Project</div>
    <div class="sidebar__list">
    </div>
    <div class="sidebar__null"></div>
</div>
<div class="task-tab"></div>
```


```js
// spock - run grunt project task using gui


// - Main.js
$(document).ready(function() {

    $body.on('click', '.JS-Sidebar-Item', function() {
        // swtich project
        spock.app.switchProject($(this).attr('data-id'));
        return false;
    });

    $body.on('click', '.JS-Project-Remove', function() {
        // remove project
        spock.app.removeProject($(this).attr('data-id'));
        return false;
    });

    $body.on('click', '.JS-Task-Run', function() {
        var project_id = $(this).attr('data-project-id');
        var task_name = $(this).attr('data-task-name');
        spock.app.runTask(project_id, task_name);
        return false;
    });

    $body.on('click', '.JS-Task-Terminal', function() {
        var project_id = $(this).attr('data-project-id');
        var task_name = $(this).attr('data-task-name');
        $('#console_' + project_id + "_" + task_name).fadeIn();

        //scroll to bottom
        spock.app.terminalScrollToBottom(project_id, task_name);
        // 临时变量 - showConsoleId
        spock.temp.showConsoleId = '#console_' + project_id + "_" + task_name;

        return false;
    });

    $body.on('click', '.JS-Task-Stop', function() {
        spock.app.stopTask(project_id, task_name);
    });

    document.body.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        e.stopPropagation();
        e.preventDefault();
        console.log('handleDrop');

        var files = e.dataTransfer.files;

        _.each(files, function(file) {
            var stats = fs.statsSync(file.path);

            if(stats.isDirectory() && path.dirname(file.path) !== file.path) {
                spock.app.addProject(file.path);
            } else if(stas.isFile()) {
                spock.app.addProject(path.dirname(file.path));
            }
        });

        return false;
    }

    // node-wenkit, 快捷键
    window.addEventListener('keydown', function(e) {
        var idKey = e.keyIdentifier;
        if (idKey === 'F12') {
            winMain.showDevTools();
        } else if (idKey === 'F5') {
            winMain.reload();
        } else if (idKey === 'U_001B') {
            if (spock.temp.showConsoleId) {
                $(spock.temp.showConsoleId).fadeOut();
                spock.temp.showConsoleId = '';
            }
        }
    });

    // node-webkit 相关的事件监听
    winMain.on('close', function() {
        spock.terminalManager.killWorkers();
        gui.App.closeAllWindows();
        gui.App.quit();
    });
});

// TmTSpock.js
// main wrapper for underlying fs/terminal/grunt work, and html op
var TmTSpock = (function() {

    function TmTSpock() {

    }

    TmTSpock.prototype.addProject = function(dir) {
        var self = this;
        spock.projectManager.add(dir, function(project) {
            self.addProjectHTML(project);
            self.switchProject(project.id);
        });
    };

    TmTSpock.prototype.addProjectHTML = function(project) {
        var project_html = spock.util.getTemplate('sidebar_item', project);
        $(project_html).appendTo($('.sidebar__list'));

        var tasks_html = spock.util.getTemplate('tasks', project);
        $(tasks_html).appendTo($('.task-tab'));
    };

    TmTSpock.prototype.runTask = function(project_id, project_name) {
        spock.terminalManager.runTask(project_id, project_name, startFn, endFn, errorFn);

        function startFn() {
            // 把该 list item 的状态变化 - task running, not eror, show stop btn, hide run btn, show terminal panel.
        }
        // fn def: endFn, errorFn
    }
});

// projectManager -
var projectManager = (function() {
    var projectManager = function() {
        this.projects = spock.storageService.getProjects();
    };

    projectManager.prototype.add = function(dir, cb) {

        // check if project exists
        var exist = false;
        // > path.relative('~/projects/1.txt', '~/Downloads/1.txt')
        // '../../Downloads/1.txt'
        _.each(this.projects, function(project) {
            if (!path.relative(project.path, dir)) {
                exist = true;
            }
        });

        if(!exist) {
            var project_name = path.basename(dir);
            var project_id = spock.util.uid(project_name);

            var GruntPath = dir + '/node_modules/grunt/';

            if (!fs.existsSync(GruntPath)) {
                window.alert('Unable to find local grunt.');
                return;
            }

            var grunt = require(GruntPath);
            var GruntinitConfigFnPath = grunt.file.findup('Gruntfile.{js,coffee}', {cwd: dir, nocase: true});

            if (GruntinitConfigFnPath === null) {
                window.alert('Unable to find Gruntfile.');
                return;
            }

            require(GruntinitConfigFnPath)(grunt);

            var tasks = [];
            _.each(grunt.task._tasks, function(task) {
                tasks.push(task.name);
            });

            var project = {
                id: project_id,
                name: project_name,
                path: dir,
                tasks: tasks,
                config: {}
            };

            this.projects.push(project);
            spock.storageService.setProjects(this.projects);

            cb(project);
        }
    };

    return projectManager;
})();


// TerminalManager.js
var TerminalManager = (function() {
    var TerminalManager = function() {
        this.command = (process.platform === 'win32') ? 'grunt.cmd' : 'grunt';
        this.process_list = {};
    };

    TerminalManager.prototype.runTask = function(project_id, task_name, startFn, endFn, errorFn) {
        var project = spock.projectManager.getById(project_id);
        startFn();

        var terminal = spawn(this.command, [task_name], {cwd: project.path});

        if(_.isUndefined(this.process_list[project_id])) {
            this.process_list[project_id] = {};
        }

        this.process_list[project_id][task_name] = {
            name: task_name,
            terminal: terminal,
            status: 'running'
        };

        terminal.stdout.setEncoding('utf8');
        terminal.stdout.on('data', function(data) {
            spock.app.putCliLog(data, project_id, task_name);
        });

        terminal.stderr.on('data', function(data) {
            spock.app.putCliLog(data, project_id, task_name);
            errorFn();
        });

        terminal.on('close', function(code) {
            endFn();
            terminal.status = 'stop';
        });
    };
    return TerminalManager;
})();


```