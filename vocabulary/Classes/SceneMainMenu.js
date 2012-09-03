var StartMenuLayer = cc.Layer.extend({
    ctor:function () {
        this._super();


        var startItem = cc.MenuItemImage.create(base_dir + startScene.startIcon.pic1, base_dir + (startScene.startIcon.pic2?startScene.startIcon.pic2:startScene.startIcon.pic1), this, this.startCallback);
        var continueItem = cc.MenuItemImage.create(base_dir + startScene.continueIcon.pic1, base_dir + (startScene.continueIcon.pic2?startScene.continueIcon.pic2:startScene.continueIcon.pic1), this, this.continueCallback);
        var scoreItem = cc.MenuItemImage.create(base_dir + startScene.scoreIcon.pic1, base_dir + (startScene.scoreIcon.pic2?startScene.scoreIcon.pic2:startScene.scoreIcon.pic1), this, this.scoreCallback);


        var startMenu = cc.Menu.create(startItem);
        startItem.setAnchorPoint(cc.ccp(0, 1));
        var startPos = cc.sharedDirector.convertToGL(cc.ccp(startScene.startIcon.x, startScene.startIcon.y));
        startMenu.setPosition(startPos);
        this.addChild(startMenu);

        var saveGameStatus = $.localStorage.loadData(cache_key);
        if (saveGameStatus != undefined && saveGameStatus != "") {
            var continueMenu = cc.Menu.create(continueItem);
            continueItem.setAnchorPoint(cc.ccp(0, 1));
            var continuePos = cc.sharedDirector.convertToGL(cc.ccp(startScene.continueIcon.x, startScene.continueIcon.y));
            continueMenu.setPosition(continuePos);
            this.addChild(continueMenu);
        }


        var scoreMenu = cc.Menu.create(scoreItem);
        scoreItem.setAnchorPoint(cc.ccp(0, 1));
        var scorePos = cc.sharedDirector.convertToGL(cc.ccp(startScene.scoreIcon.x, startScene.scoreIcon.y));
        scoreMenu.setPosition(scorePos);
        this.addChild(scoreMenu);

        var bgsoundItemYes = cc.MenuItemImage.create(base_dir + startScene.bgSoundIcon.pic1);
        var bgsoundItemNo = cc.MenuItemImage.create(base_dir + (startScene.bgSoundIcon.pic2?startScene.bgSoundIcon.pic2:startScene.bgSoundIcon.pic1));

        var bgsoundItem = cc.MenuItemToggle.create(this,
            this.bgsoundCallback,
            bgsoundItemYes,
            bgsoundItemNo);
        var bgsoundMenu = cc.Menu.create(bgsoundItem);
        bgsoundItem.setAnchorPoint(cc.ccp(0, 1));
        var bgsoundPos = cc.sharedDirector.convertToGL(cc.ccp(startScene.bgSoundIcon.x, startScene.bgSoundIcon.y));
        bgsoundMenu.setPosition(bgsoundPos);
        this.addChild(bgsoundMenu);
    },
    startCallback:function (sender) {
        var sceneLevel = new SceneLevel(0); //从0级开始
        sceneLevel.runThisScene();
    },
    continueCallback:function (sender) {
        var saveGameStatus = JSON.parse($.localStorage.loadData(cache_key));

        var sceneLevel = new SceneLevel(saveGameStatus.currLevel, saveGameStatus); //从0级开始
        sceneLevel.runThisScene();
    },
    scoreCallback:function (sender) {
        var scoreBoard = new ScoreBoard(base_dir + scoreScene.bgPic, 0);
        scoreBoard.runThisScene();
    },
    bgsoundCallback:function (sender) {
        Chidopi.JS.playPausableBgAudio(base_dir+game_vocab_json.startScene.bgSound);
        vocab_bgsound_taggle = !vocab_bgsound_taggle;
    }
});


var SceneMainMenu = cc.Scene.extend({
    ctor:function () {

        g_winSize = cc.Director.sharedDirector().getWinSize();
        //1 添加背景层
        var menuBgLayer = new cc.Layer();          //cc.LazyLayer()
        menuBgLayer.setPosition(cc.PointZero())

        var background = cc.Sprite.create(base_dir + startScene.bgPic);
        background.setPosition(cc.ccp(g_winSize.width / 2, g_winSize.height / 2));
        menuBgLayer.addChild(background, 0);
        this.addChild(menuBgLayer);

        var startMenuLayer = new StartMenuLayer();
        this.addChild(startMenuLayer, 0);

        return true;
    }

})
