var cc = cc = cc || {};
//Cocos2d directory
cc.Dir = './';//in relate to the html file or use absolute
cc.loadQue = [];//the load que which js files are loaded
cc.COCOS2D_DEBUG = 2;
cc._DEBUG = 1;
cc._IS_RETINA_DISPLAY_SUPPORTED = 0;
//html5 selector method
cc.$ = function (x) {
    return document.querySelector(x);
};
cc.$new = function (x) {
    return document.createElement(x);
};

cc.loadjs = function (filename) {
    //add the file to the que
    var script = cc.$new('script');
    script.src = cc.Dir + filename;
    script.order = cc.loadQue.length;
    cc.loadQue.push(script);


    script.onload = function () {
        var hasLoaded = 0;
        var loadinterval = null;
        //file have finished loading,
        //if there is more file to load, we should put the next file on the head
        if (this.order + 1 < cc.loadQue.length) {
            cc.$('head').appendChild(cc.loadQue[this.order + 1]);
            //console.log(this.order);
        }
        else {
            cc.setup("justingame");

            //init audio,mp3 or ogg
            //for example:
            // cc.AudioManager.sharedEngine().init("mp3,ogg");
            // cc.AudioManager.sharedEngine().init("mp3");

            //we are ready to run the game
            cc.Loader.shareLoader().onloading = function () {
                // cc.LoaderScene.shareLoaderScene().draw();
                new DiyLoaderScene().draw();
            };
            cc.Loader.shareLoader().onload = function () {
                hasLoaded = 1;

            };
            //preload ressources
            cc.Loader.shareLoader().preload(g_ressources);
            loadinterval = setInterval(function() {
                if (hasLoaded == 1) {
                    clearInterval(loadinterval);
                    cc.AppController.shareAppController().didFinishLaunchingWithOptions();
                }
            }, 1000);

        }
    };
    if (script.order === 0)//if the first file to load, then we put it on the head
    {
        cc.$('head').appendChild(script);
    }
};

cc.loadjs('../cocos2d-html/Cocos2d-html5-canvasmenu-min.js');

// User files
cc.loadjs('Classes/Resources.js');
cc.loadjs('Classes/DiyLoaderScene.js');
cc.loadjs("Classes/config/levelConfig.js");

cc.loadjs('Classes/AppDelegate.js');//17
cc.loadjs('Classes/Balloon.js');

cc.loadjs('Classes/BaseScene.js');
cc.loadjs('Classes/BaseLayer.js');

cc.loadjs('Classes/Level.js');
cc.loadjs('Classes/SceneLevel.js');

cc.loadjs('Classes/Win.js');
cc.loadjs('Classes/Lose.js');
cc.loadjs('Classes/SceneMainMenu.js');//19



