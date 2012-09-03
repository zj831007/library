var LayerWin = BaseLayer.extend({
    _currLevel:0,
    ctor:function (currLevel) {
        this._super();
        this._currLevel = currLevel;

        var tryAgainItem = cc.MenuItemImage.create(base_dir + succScene.tryAgainIcon.pic1, base_dir + (succScene.tryAgainIcon.pic2?succScene.tryAgainIcon.pic2:succScene.tryAgainIcon.pic1), this, this.playAgainCallback);
        var scoreItem = cc.MenuItemImage.create(base_dir + succScene.scoreIcon.pic1, base_dir + (succScene.scoreIcon.pic2?succScene.scoreIcon.pic2:succScene.scoreIcon.pic1), this, this.scoreboardCallback);

        var tryAgainMenu = cc.Menu.create(tryAgainItem);
        tryAgainItem.setAnchorPoint(cc.ccp(0, 1));
        var tryAgainPos = cc.sharedDirector.convertToGL(cc.ccp(succScene.tryAgainIcon.x, succScene.tryAgainIcon.y));
        tryAgainMenu.setPosition(tryAgainPos);
        this.addChild(tryAgainMenu);

        var scoreMenu = cc.Menu.create(scoreItem);
        scoreItem.setAnchorPoint(cc.ccp(0, 1));
        var scorePos = cc.sharedDirector.convertToGL(cc.ccp(succScene.scoreIcon.x, succScene.scoreIcon.y));
        scoreMenu.setPosition(scorePos);
        this.addChild(scoreMenu);

    },
    scoreboardCallback:function(){
        var scoreBoard = new ScoreBoard(base_dir + scoreScene.bgPic, this._currLevel);
        scoreBoard.runThisScene();
    },
    playAgainCallback:function(){
        var sceneLevel = new SceneLevel(this._currLevel);
        sceneLevel.runThisScene();

    }
});


var Win = BaseScene.extend({

    runThisScene:function () {
        var layerWin = new LayerWin(this._currLevel);
        this.addChild(layerWin);

        cc.Director.sharedDirector().replaceScene(this);
    }


});