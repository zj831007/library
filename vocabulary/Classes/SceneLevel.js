/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 12-7-14
 * Time: 下午3:00
 * To change this template use File | Settings | File Templates.
 */


var cc = cc = cc || {};

var SceneLevel = BaseScene.extend({
    _cacheGameStatus: null,
    ctor:function (level, cacheGameStatus) {

        this._super(base_dir + levelScenes[level].bgPic, level);
        this._cacheGameStatus = cacheGameStatus;
        return true;
    },
    onEnter:function () {
        this._super();

        return true;
    },
    runThisScene:function () {

        var level = new Level(this._currLevel, this._cacheGameStatus);
        level.setPosition(cc.PointZero());
        this.addChild(level);

        this._super();
    }

});


