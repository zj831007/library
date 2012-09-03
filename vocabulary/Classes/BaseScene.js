/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 12-7-14
 * Time: 下午6:26
 * To change this template use File | Settings | File Templates.
 */


var cc = cc = cc || {};

var BaseScene = cc.Scene.extend({
    _bgImg:"",
    _currLevel:0,
    ctor:function (bgImg, currLevel) {
        this._super();
        this._currLevel = currLevel;

        var bgLayer = new cc.Layer();  //cc.LazyLayer()
        bgLayer.setPosition(cc.PointZero());

        var background = cc.Sprite.create(bgImg);
        background.setPosition(cc.ccp(g_winSize.width / 2, g_winSize.height / 2));
        bgLayer.addChild(background, 0);

        this.addChild(bgLayer);
        return true;
    },
    onEnter:function () {
        this._super();
        return true;
    },
    runThisScene:function () {
        var switchModel = game_vocab_json.sceneSwitchMode;
        var trans = null;
        switch(switchModel){
            case "LR":
                trans = cc.TransitionSlideInL.create(1.2, this);
                break;
            case "RL":
                trans = cc.TransitionSlideInR.create(1.2, this);
                break;
            case "TB":
                trans = cc.TransitionSlideInT.create(1.2, this);
                break;
            case "BT":
                trans = cc.TransitionSlideInB.create(1.2, this);
                break;
            default:
                trans = cc.TransitionSlideInL.create(1.2, this);
        }

        cc.Director.sharedDirector().replaceScene(trans);
    }
});


