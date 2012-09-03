var LayerLose = BaseLayer.extend({
    _currLevel:0,

    ctor:function (currLevel) {
        this._super();
        this._currLevel = currLevel;

        var tryAgainItem = cc.MenuItemImage.create(base_dir + loserScene.tryAgainIcon.pic1, base_dir + (loserScene.tryAgainIcon.pic2?loserScene.tryAgainIcon.pic2:loserScene.tryAgainIcon.pic1), this, this.playAgainCallback);
        var scoreItem = cc.MenuItemImage.create(base_dir + loserScene.scoreIcon.pic1, base_dir + (loserScene.scoreIcon.pic2?loserScene.scoreIcon.pic2:loserScene.scoreIcon.pic1), this, this.scoreboardCallback);

        var tryAgainMenu = cc.Menu.create(tryAgainItem);
        tryAgainItem.setAnchorPoint(cc.ccp(0, 1));
        var tryAgainPos = cc.sharedDirector.convertToGL(cc.ccp(loserScene.tryAgainIcon.x, loserScene.tryAgainIcon.y));
        tryAgainMenu.setPosition(tryAgainPos);
        this.addChild(tryAgainMenu);

        var scoreMenu = cc.Menu.create(scoreItem);
        scoreItem.setAnchorPoint(cc.ccp(0, 1));
        var scorePos = cc.sharedDirector.convertToGL(cc.ccp(loserScene.scoreIcon.x, loserScene.scoreIcon.y));
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


var Lose = BaseScene.extend({

    runThisScene:function () {
        var layerLose = new LayerLose(this._currLevel);
        this.addChild(layerLose);

        cc.Director.sharedDirector().replaceScene(this);
    }


});