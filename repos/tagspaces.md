

### Summary
tagspaces 是个非常棒的个人文件管理系统 based on tags, and file directory itself, backend-less(just to sync)

### 代码结构
非常赞， 因为可以通过ext来扩展更多的文件类型的对应处理逻辑
主要的业务逻辑在js目录下（ext是各种类型的文件的处理代码）
#### js代码结构分为：

- 核心驱动部分：
    - core.api
    - core.ui

- 视图组件部分：
    - directories.ui
    - directorybrowser
    - tags.ui
    - tagutils
    - search
    - options.ui
    - perspective.manager

- 基础模块：
    - fileopener
    - ioapi.dropbox
    - postioapi
    - settings.api
    - settings.default


#### 模板呐代码分为：

主要的页面在index.html中，视图组件的模板在templates目录下

index.html 包括：
    各种menu, 各种modal, 还有主要的框架，还有loading

templates 目录：

- DirectoryBrowserDialog，DirectoryCreateDialog
- LocationCreateDialog，LocationEditDialog
- FilePropertiesDialog
- OptionsDialog
- WelcomeDialog，WelcomeScreen


#### perspective 视角（grid, list）代码如下：代码如下：

```
initPerspectives
hideAllPerspectives
redrawCurrentPerspective
getNextFile, getPrevFile
```


#### core.ui:

```
initUI
clearSearchFilter
enableTopToolbar, disableTopToolbar
showContextMenu
showAlertDialog, showConfirmDialog
showFileNameRenameDialog,showFileCreateDialog, showFileDeleteDialog
showWelcomeDialog,
showTagEditDialog, showTagsPanel
showLocationsPanel, showDirectoryBrowserDialog
hideAllDropDownMenus
```


#### core.api

```
// proxy applications parts
Config = tsSettings;
IO = tsIOApi;
PerspectiveManager = tsPersManager;
TagUtils = tsTagUtils;
FileOpener = tsFileOpener;
Search = tsSearch;

// public api definition
initApp
updateLogger
showLoadingAnimation, hideLoadingAnimation
reloadUI
openFileViewer, closeFileViewer
toggleLeftPanel, toggleFullWidth,
updateNewVersionData
exportFileListCSV, exportFileListArray
removeFileModel, updateFileModel

// proxy functions from tsCoreUI
clearSearchFilter, enableTopToolbar, disableTopToolbar
showAlertDialog, showConfirmDialog,
showFile<Related>: rename, create, delete>
showLocationsPanel, showTagsPanel
showContextMenu, hideAllDropDownMenus
showDirectoryBrowserDialog, showTagEditDialog

// proxy functions from tsTagsUI

// proxy functions from directoriesUI:
openLocation, updateSubDirs, initLocations, showCreateDirectoryDialog, closeCurrentLocation, navigateToDirectory

// public variables defintion
currentPath, currentView, selectedFiles, fileList, selectedTag, selectedTagData, startTime, subfolderDirBrowser, directoryBrowser,

fileListFILEEXT, fileListTITLE, fileListTAGS, size, mdt, path, name,
```

#### markdown文件 Viewer
```js
// viewerMd
define(function(require, exports, module) {

    console.log('loading viewerMD');

    exports.id = 'viewerMD'; // ID should be equal to the directory name where the ext, is located
    exports.title = 'MD Viewer';
    exports.type = 'editor';
    exports.supportedFileTypes = ['md', 'markdown', 'mdown'];

    var TSCORE = require('tscore');

    var md2htmlConverter = undefined;
    var containerElID = undefined;
    var currentFilePath = undefined;

    var extensionDirectory = TSCORE.Config.getExtensionPath()+'/'+exports.id;

    exports.init = function(filePath, containerElID) {
        console.log("Initalization MD Viewer...");
        currentFilePath = filePath;
        require(['css!'+extensionDirectory+'/viewerMD.css']);
        require([extensionDirectory+'/showdown/showdown.js'], function() {
            md2htmlConverter = new Showdown.converter();
            TSCORE.IO.loadTextFile(filePath);
        })
    };

    exports.setContent = function(content) {
        // filter content

        $('#'+containerElID).append($('<div>', {
            class: 'viewerMDContainer'
        }))
        .append(md2htmlConverter.makeHtml(content));

        // change content images
    };

    // setFileType, viewerMode, getContent
});

````

#### 图片文件 Viewer
```js
// viewerImage
exports.init = function(filePath, elementID) {
    console.log('Initalization Browser Image Viewer...');

    require([
        extensionDirectory+'/viewerUI.js',
        'text!'+extensionDirectory+'/mainUI.html',
        extensionDirectory+'/jquery.panzoom/jquery.panzoom.min.js',
        extensionDirectory+'/jquery.mousewheel/jquery.mousewheel.js'
    ], function(extUI, uiTPL) {
        var uiTemplate = Handlerbars.compile(uiTPL);
        UI = new extUI.ExtUI(extensionID, elementID, filePath);
        UI.buildUI(uiTemplate);
        TSCORE.hideLoadingAnimation();
    });
};

// viewerUI.js
ExtUI.prototype.buildUI = function(uiTemplate) {
    console.log('Init UI Module');

    this.viewContainer = $('#'this.extensionID+'Container').empty();
    this.viewToolbar = $('#'this.extensionID+'Toolbar').empty();
    this.viewFooter = $('#'this.extensionID+'Footer').empty();

    var self = this;
    var content = {
        id: this.extensionID,
        imgPath: this.filePath
    };

    this.containerElem.append(uiTemplate(context));

    if(isCordova) {
        // hide zoomout, zoomin btn
    }

    $('#'+this.extensionID+'imgViewer')
        .panzoom({
            $zoomIn: $('#'+this.extensionID+'ZoomIn'),

            easing: 'ease-in-out',
            contain: 'invert'
        })
        .hammer().on('swipeleft', function(event) {
            TSCORE.FileOpener.openFile(TSCORE.PerspectiveManager.getNextFile(self.internPath));
        });
        // do the same for swiperight

    // wheel to zoom
    $('#'+this.extensionID+'imgViewer').parent().on('mousewheel.focal', function(e) {
            e.preventDefault();
            var delta = e.delta || e.originalEvent.wheelDelta;
            var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
            $("#"+self.extensionID+"imgViewer").panzoom('zoom', zoomOut, {
                increment: 0.1,
                focal: e
            });
        });

    // rotateLeft
    // same as below. x.pixastic('brightness', {brightness: 60})

    // brighter
    $('#'+extensionID+'Brighter').click(function() {
        $('#'extensionID+'imgViewer').pixastic('brightness', {
            brightness: 60
        });
    });
};
```




