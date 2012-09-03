var Balloon = cc.Sprite.extend({
    show:false,
    _tag:0,
    _audio:"",
    _word:"",
    _answer:"",
    setTag:function (tag) {
        this._tag = tag;
    },
    getTag:function () {
        return this._tag;
    },
    setAudio:function (audio) {
        this._audio = audio;
    },
    getAudio:function () {
        return this._audio;
    },
    setWord:function (word) {
        this._word = word;
    },
    getWord:function () {
        return this._word;
    },
    setAnswer:function(answer){
        this._answer = answer;
    },
    getAnswer:function(){
        return this._answer;
    }

})

Balloon.balloonWithImage = function (imgSrc, tag) {

    var baloons = new Balloon();
    baloons.initWithFile(imgSrc);
    baloons.setTag(tag);
    baloons.setAnchorPoint(cc.ccp(0.5, 1));
    baloons.setPosition(cc.PointMake(0, 0));

    return baloons;
};