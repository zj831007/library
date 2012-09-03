var LayerScoreBoard = BaseLayer.extend({
    _currLevel:0,

    ctor:function (currLevel) {
        this._super();
        this._currLevel = currLevel;


    }

});


var ScoreBoard = BaseScene.extend({

    runThisScene:function () {
        var layerScoreBoard = new LayerScoreBoard(this._currLevel);
        this.addChild(layerScoreBoard);

        cc.Director.sharedDirector().replaceScene(this);
    }


});