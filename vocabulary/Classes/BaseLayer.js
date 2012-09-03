var BaseLayer = cc.Layer.extend({
    _emitter:null,
    _size:null,
    _starTexture:null,
    ctor:function () {
        this._super();
        this.setIsTouchEnabled(true);
        this._size = cc.Director.sharedDirector().getWinSize();
        if(game_vocab_json.useParticle){
            this._starTexture = cc.TextureCache.sharedTextureCache().addImage(base_dir+game_vocab_json.particle.img);
        }

        var backMenuItem = cc.MenuItemImage.create(base_dir + game_vocab_json.backIcon.pic1, base_dir + game_vocab_json.backIcon.pic1, this, this.mainMenuCallback);
        var backMenu = cc.Menu.create(backMenuItem, null);
        var backPos = cc.sharedDirector.convertToGL(cc.ccp(game_vocab_json.backIcon.x, game_vocab_json.backIcon.y));
        backMenuItem.setAnchorPoint(cc.PointMake(0,1));
        backMenu.setPosition(backPos);
        this.addChild(backMenu);
    },
    mainMenuCallback:function () {
        var scene = new SceneMainMenu();

        //切加首页背景音乐
        if(vocab_bgsound_taggle){
            Chidopi.JS.playPausableBgAudio(base_dir+game_vocab_json.startScene.bgSound);
        }

        var switchModel = game_vocab_json.sceneSwitchMode;
        var trans = null;
        switch(switchModel){
            case "LR":
                trans = cc.TransitionSlideInR.create(1.2, scene);
                break;
            case "RL":
                trans = cc.TransitionSlideInL.create(1.2, scene);
                break;
            case "TB":
                trans = cc.TransitionSlideInB.create(1.2, scene);
                break;
            case "BT":
                trans = cc.TransitionSlideInT.create(1.2, scene);
                break;
            default:
                trans = cc.TransitionSlideInL.create(1.2, scene);
        }
        cc.Director.sharedDirector().replaceScene(trans);
    },
    registerWithTouchDispatcher:function () {
        cc.TouchDispatcher.sharedDispatcher().addTargetedDelegate(this, 0, false);
    },
    ccTouchBegan:function (touch, event) {
        if(game_vocab_json.useParticle){
            if (this._emitter) {
                this.removeChild(this._emitter);
            }
            switch(game_vocab_json.particle.type){
                case "ParticleFlower":
                    this._emitter = new cc.ParticleFlower();
                    break;
                case "ParticleGalaxy":
                    this._emitter = new cc.ParticleGalaxy();
                    break;
                case "ParticleExplosion":
                    this._emitter = new cc.ParticleExplosion();
                    break;
                default:
                    this._emitter = new cc.ParticleExplosion();
            }

            this._emitter.initWithTotalParticles(game_vocab_json.particle.number);
            this._emitter.setSpeed(200);
            this._emitter.setIsAutoRemoveOnFinish(true);
            this.addChild(this._emitter, 10);

            this._emitter.setTexture(this._starTexture);
            this._emitter.setShapeType(cc.PARTICLE_STAR_SHAPE);

            if(touch!=undefined){
                var getPoint = touch.locationInView(touch.view());
                this._emitter.setPosition(getPoint);
            }

        }

        return true;
    },
    ccTouchMoved:function (touch, event) {

    },
    ccTouchEnded:function (touch, event) {

    }

});