/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 12-7-14
 * Time: 下午2:28
 * To change this template use File | Settings | File Templates.
 */

var Level = BaseLayer.extend({
    _currLevel:0,
    _levelObject:null, //本级中所有json数据
    _cacheGameStatus:null, //上次游戏状态
    _readySprite:null,
    _timeLabel:null,
    _scoreLabel:null,
    _questionLabel:null,
    _starTexture:null,
    _isReady:false,

    _spriteArr:[], //所有精灵对象
    _currSpriteArr:[], //本次显示的精灵
    _currSpriteAnswer:null, //本次显示的正确答案
    _currRound:0, //当前回合

    _timeLimit:0, //剩下总时间数
    _currScores:0, //当前得分数
    ctor:function (level, cacheGameStatus) {
        this._super();
        this._currLevel = level;
        this._cacheGameStatus = cacheGameStatus;

        this._levelObject = levelScenes[level];
        this._timeLimit = this._levelObject.timeLimit;  //总时间
    },
    onEnter:function () {
        this._super();
        //
        if (vocab_bgsound_taggle) {
            Chidopi.JS.playPausableBgAudio(base_dir + this._levelObject.bgSound);
        }
        this._timeLabel = cc.LabelTTF.create(this._timeLimit, this._levelObject.timeText.fontFamily, this._levelObject.timeText.size);
        var timeLabelColor = this._levelObject.timeText.color;
        this._timeLabel.setColor(cc.ccc3(parseInt(timeLabelColor.r), parseInt(timeLabelColor.g), parseInt(timeLabelColor.b)));
        this._timeLabel.setAnchorPoint(cc.ccp(0, 1));
        var timeLabelPos = cc.sharedDirector.convertToGL(cc.ccp(this._levelObject.timeText.x, this._levelObject.timeText.y));
        this._timeLabel.setPosition(timeLabelPos);
        this.addChild(this._timeLabel, 1);

        this._scoreLabel = cc.LabelTTF.create(this._currScores, this._levelObject.scoreText.fontFamily, this._levelObject.scoreText.size);
        var scoreLabelColor = this._levelObject.scoreText.color;
        this._scoreLabel.setColor(cc.ccc3(parseInt(scoreLabelColor.r), parseInt(scoreLabelColor.g), parseInt(scoreLabelColor.b)));
        this._scoreLabel.setAnchorPoint(cc.ccp(0, 1));
        var scorePos = cc.sharedDirector.convertToGL(cc.ccp(this._levelObject.scoreText.x, this._levelObject.scoreText.y));
        this._scoreLabel.setPosition(scorePos);
        this.addChild(this._scoreLabel, 1);

        this._questionLabel = cc.LabelTTF.create("", this._levelObject.wordText.fontFamily, this._levelObject.wordText.size);
        var quesLabelColor = this._levelObject.wordText.color;
        this._questionLabel.setColor(cc.ccc3(parseInt(quesLabelColor.r), parseInt(quesLabelColor.g), parseInt(quesLabelColor.b)));
        this._questionLabel.setAnchorPoint(cc.ccp(0.5, 0.5));

        var quesPos = cc.sharedDirector.convertToGL(cc.ccp(this._levelObject.wordRect.x + this._levelObject.wordRect.width / 2, this._levelObject.wordRect.y + this._levelObject.wordRect.height / 2));
        quesPos.y += this._levelObject.wordRect.height / 4;   //为什么要这样加。。。不知道 ，位置有点偏差
        this._questionLabel.setPosition(quesPos);
        this.addChild(this._questionLabel, 1);

        var readyGoIcon = this._levelObject.readyGoIcon;
        this._readySprite = cc.Sprite.create(base_dir + readyGoIcon.pic1, cc.RectMake(0, 0, this._levelObject.readyWidth, readyGoIcon.height));
        this._readySprite.setPosition(cc.ccp(g_winSize.width / 2, g_winSize.height / 2));

        this._spriteArr = [];
        this._currSpriteArr = [];
        //继续游戏，恢复游戏状态
        if (this._cacheGameStatus != null) {
            this._timeLimit = this._cacheGameStatus.timeLimit;
            this._currScores = this._cacheGameStatus.currScores;
            this._currRound = this._cacheGameStatus.currRound;

            this._scoreLabel.setString(this._currScores); //更新分数标签
            this._timeLabel.setString(this._timeLimit);    //更新时间标签
            //跳过显示ready go,直接进入游戏
            this.schedule(this.levelGo, 0.5);
            this.initBalloons();

        } else {
            this.addChild(this._readySprite);
            this.schedule(this.levelReady, 2);
        }


    },
    ccTouchBegan:function (touch, event) {
        this._super(touch, event);
        if (this._isReady) {
            var getPoint = touch.locationInView(touch.view());

            //如果触摸单词区域，发出声音
            var wordPos = cc.sharedDirector.convertToGL(cc.ccp(this._levelObject.wordRect.x, this._levelObject.wordRect.y));
            var wordRect = cc.RectMake(wordPos.x, wordPos.y - this._levelObject.wordRect.height, this._levelObject.wordRect.width, this._levelObject.wordRect.height);

            var touchword = cc.Rect.CCRectContainsPoint(wordRect, getPoint);
            if (touchword) {
                if (this._currSpriteAnswer) {
                    Chidopi.JS.playOneAudio(cache_key + "audio", base_dir + this._currSpriteAnswer.getAudio());
                }
            }

            var len = this._currSpriteArr.length;

            for (var i = len - 1; i >= 0; i--) {
                var baloon = this._currSpriteArr[i];
                var baloonSize = baloon.getContentSize();

                var tempRectX = baloon.getPositionX() - baloonSize.width / 2;
                var tempRectY = baloon.getPositionY() - baloonSize.height;

                var rect = cc.RectMake(tempRectX, tempRectY, baloonSize.width, baloonSize.height);
                var isin = cc.Rect.CCRectContainsPoint(rect, getPoint);

                if (isin) {
                    //判断是否答对
                    var tag = parseInt(baloon.getTag());
                    if (tag == this._currSpriteAnswer.getTag()) {

                        Chidopi.JS.playOneAudio(cache_key + "audio", base_dir + game_vocab_json.rightAudio);

                        //答对了，真聪明 ,停止action
                        _.each(this._currSpriteArr, function (sprite) {
                            sprite.stopAllActions();
                        })
                        this.unschedule(this.updateQuestion);   //停止进入下一题

                        // 计分
                        this._currScores = this._currScores + parseInt(game_vocab_json.rightScore);
                        this._scoreLabel.setString(this._currScores);

                        //如果有爆炸动画，就播一个
                        if (this._currSpriteAnswer.getAnswer() != "") {
                            try {
                                var currPos = this._currSpriteAnswer.getPosition();
                                baloon.setPosition(cc.ccp(0, 0)); //将原气球移除屏幕

                                var animation = cc.Animation.create();
                                var batch = cc.SpriteBatchNode.create(base_dir + this._currSpriteAnswer.getAnswer(), 1);
                                var gameAnswerSize = this._levelObject.gameAnswerSize;

                                //var detaX = gameAnswerSize.width / parseInt(gameAnswerSize.col);
                                var detaX = 0;
                                for (var i = 0; i < gameAnswerSize.col; i++) {
                                    var texture = batch.getTexture();
                                    var height =0;
                                    if (texture instanceof cc.Texture2D) {
                                        var s = texture.getContentSize();
                                        height = s.height;
                                        detaX = s.width / parseInt(gameAnswerSize.col);
                                    } else if ((texture instanceof HTMLImageElement) || (texture instanceof HTMLCanvasElement)) {
                                        height = texture.height;
                                        detaX = texture.width / parseInt(gameAnswerSize.col);
                                    }

                                    //注意此处纹理宽高要这样取啊。。。搞到深夜才搞出来，不能直接用编辑器中传来的值。。。
                                    animation.addFrameWithTexture(texture, cc.RectMake(i * detaX, 0, detaX, height));
                                }


                                var bomb = new cc.Sprite();
                                bomb.setAnchorPoint(cc.ccp(0.5, 1));
                                bomb.setPosition(currPos);
                                this.addChild(bomb, 99);

                                var action1 = cc.Animate.create(1, animation, false);
                                var action2 = cc.CallFunc.create(this, function () {
                                    this.removeChild(bomb);
                                });
                                var action3 = cc.CallFunc.create(this, function () {
                                    this.updateQuestion();
                                });
                                bomb.runAction(cc.Sequence.create(action1, action2, action3));
                            } catch (e) {
                                this.updateQuestion();
                            }
                        } else {
                            //没有动画，直接进入下一回合，
                            this.updateQuestion();
                        }
                    } else {
                        //考，别瞎点，会扣分的
                        Chidopi.JS.playOneAudio(cache_key + "audio", base_dir + game_vocab_json.errorAudio);
                        this._currScores = this._currScores - parseInt(game_vocab_json.errorScore);
                        if (this._currScores < 0) this._currScores = 0;
                        this._scoreLabel.setString(this._currScores);
                    }
                    break;
                }

            }
        }
        return true;
    },
    ccTouchMoved:function (touch, event) {

    },
    ccTouchEnded:function (touch, event) {

    },
    levelReady:function () {
        this.unschedule(this.levelReady);
        this.removeChild(this._readySprite);

        var readyGoIcon = this._levelObject.readyGoIcon;
        this._goSprite = cc.Sprite.create(base_dir + readyGoIcon.pic1, cc.RectMake(this._levelObject.readyWidth, 0, readyGoIcon.width - this._levelObject.readyWidth, readyGoIcon.height));
        this._goSprite.setPosition(cc.ccp(g_winSize.width / 2, g_winSize.height / 2));

        this.addChild(this._goSprite);
        this.schedule(this.levelGo, 0.5);

        this.initBalloons();
    },
    initBalloons:function () {
        //游戏准备
        //创建气球
        var me = this;
        _.each(this._levelObject.gameContent, function (gcontent, index) {
            var baloon = Balloon.balloonWithImage(base_dir + gcontent.question, index);
            baloon.setAudio(gcontent.audio);
            baloon.setWord(gcontent.word);
            baloon.setAnswer(gcontent.answer);
            me.addChild(baloon, 1, index);
            me._spriteArr.push(baloon);
        })
        this._isReady = true;
    },
    levelGo:function () {
        if (this._isReady) {
            this.unschedule(this.levelGo);
            this.removeChild(this._goSprite);

            // game start
            this.schedule(this.updateTime, 1);          //倒计时
            this.updateQuestion();
        }
    },
    updateTime:function () {
        if (this._timeLimit == 0) {
            this.unschedule(this.updateTime); //时间到，结束游戏。。。
            var loser = new Lose(base_dir + loserScene.bgPic, this._currLevel);
            loser.runThisScene();
        } else {
            this._timeLimit = --this._timeLimit;
            this._timeLabel.setString(this._timeLimit);
        }
    },
    updateQuestion:function () {

        //如果到达指定回合数，进入下一级
        this.unschedule(this.updateQuestion);
        if (this._currRound > parseInt(this._levelObject.gameRounds)) {

            var totalLevel = levelScenes.length;
            //判断是否有下一级，
            if (this._currLevel >= totalLevel - 1) {
                //无下一级，进入完成页面
                Chidopi.JS.playOneAudio(cache_key + "audio", base_dir + game_vocab_json.finishAudio);
                var winScene = new Win(base_dir + succScene.bgPic, this._currLevel);
                winScene.runThisScene();
                return;
            } else {
                this._currSpriteAnswer = null;
                var sceneLevel = new SceneLevel(this._currLevel + 1);
                sceneLevel.runThisScene();
            }
        } else {
            this._currRound++;
            if (parseInt(this._levelObject.timeStay) == 0) {
                //this.schedule(this.updateQuestion, 999999999999);
            } else {
                this.schedule(this.updateQuestion, parseInt(this._levelObject.timeStay));
            }

        }

        var gameColomn = this._levelObject.gameColomn;
        //将屏幕上的气球移到最下面
        _.each(this._spriteArr, function (sprite) {
            sprite.setPosition(cc.ccp(0, 0));
        })
        if (this._cacheGameStatus != null) {
            //恢复保存的那轮答题，有答案
            var cacheGameStatus = this._cacheGameStatus;

            this._currSpriteArr = _.filter(this._spriteArr, function (spriteObj) {
                return _.include(cacheGameStatus.currSpriteArr, spriteObj.getTag());
            })
            this._currSpriteAnswer = _.find(this._spriteArr, function (spriteObj) {
                return spriteObj.getTag() == cacheGameStatus.currSpriteAnswer;
            })
            this._cacheGameStatus = null;   //清除继续状态
        } else {
            this._currSpriteArr = _.shuffle(this._spriteArr).slice(0, gameColomn);
            //显示其中一个问题
            var r = Math.ceil(Math.random() * gameColomn);
            if (r >= gameColomn) r = 0;
            this._currSpriteAnswer = this._currSpriteArr[r];
        }

        this._questionLabel.setString(this._currSpriteAnswer.getWord());
        if (this._currSpriteAnswer) {
            var curraudion = this._currSpriteAnswer.getAudio();
            Chidopi.JS.playOneAudio(cache_key + "audio", base_dir + curraudion);
        }

        //将气球运动到屏幕上
        var gameRect = this._levelObject.gameRect;  //x,y,width,height
        var rectPos = cc.sharedDirector.convertToGL(cc.ccp(gameRect.x, gameRect.y));

        var direction = this._levelObject.direction;

        switch(direction){
            case "BT":
                var deta_x = parseInt(gameRect.width) / (parseInt(gameColomn) + 1);
                var tempY = rectPos.y - parseInt(gameRect.height);
                _.each(this._currSpriteArr, function (currSprite, i) {
                    var x = deta_x * (i + 1);
                    var currSpriteW = currSprite.getContentSize().width ;
                    var currSpriteH = currSprite.getContentSize().height ;

                    var moveY = parseInt(Math.random() * parseInt(gameRect.height + currSpriteH));

                    if (moveY < currSpriteH) moveY = currSpriteH;
                    if (moveY > (gameRect.height - currSpriteH)) moveY =  gameRect.height - currSpriteH;

                    currSprite.setPosition(cc.ccp(gameRect.x + x, tempY));
                    var actionTo = cc.MoveBy.create(2, cc.ccp(0, moveY));
                    currSprite.runAction(actionTo);

                });

                break;
            case "TB":
                var deta_x = parseInt(gameRect.width) / (parseInt(gameColomn) + 1);

                _.each(this._currSpriteArr, function (currSprite, i) {
                    var x = deta_x * (i + 1);

                    var currSpriteW = currSprite.getContentSize().width ;
                    var currSpriteH = currSprite.getContentSize().height ;

                    var moveY = parseInt(Math.random() * parseInt(gameRect.height));

                    if (moveY < currSpriteH) moveY = currSpriteH;
                    if (moveY > (gameRect.height - currSpriteH)) moveY =  gameRect.height - currSpriteH;
                    currSprite.setPosition(cc.ccp(gameRect.x+ x, rectPos.y));

                    var actionTo = cc.MoveBy.create(2, cc.ccp(0, -moveY));
                    currSprite.runAction(actionTo);

                });

                break;

            case "LR":
                var deta_y = parseInt(gameRect.height) / (parseInt(gameColomn) + 1);
                _.each(this._currSpriteArr, function (currSprite, i) {
                    var x = rectPos.x;
                    var currSpriteW = currSprite.getContentSize().width ;
                    var currSpriteH = currSprite.getContentSize().height ;
                    var moveX = parseInt(Math.random() * parseInt(gameRect.width+currSpriteW));
                    if(moveX > (gameRect.width - currSpriteW)) moveX = x+gameRect.width- currSpriteW;
                    if(moveX < currSpriteW)  moveX =  currSpriteW;
                    currSprite.setPosition(cc.ccp(rectPos.x , rectPos.y-deta_y * (i+1)+currSpriteH/2));
                    //currSprite.setPosition(cc.ccp(rectPos.x, rectPos.y));

                    var actionTo = cc.MoveBy.create(2, cc.ccp(moveX, 0));
                    currSprite.runAction(actionTo);

                });

                break;
            case "RL":
                var deta_y = parseInt(gameRect.height) / (parseInt(gameColomn) + 1);
                _.each(this._currSpriteArr, function (currSprite, i) {
                    var x = rectPos.x + gameRect.width;
                    var currSpriteW = currSprite.getContentSize().width ;
                    var currSpriteH = currSprite.getContentSize().height ;
                    var moveX = parseInt(Math.random() * parseInt(gameRect.width+currSpriteW));
                    if(moveX > (gameRect.width - currSpriteW)) moveX = gameRect.width- currSpriteW;
                    if(moveX < currSpriteW)  moveX =  currSpriteW;

                    currSprite.setPosition(cc.ccp(x, rectPos.y-deta_y * (i+1)+currSpriteH/2));


                    var actionTo = cc.MoveBy.create(2, cc.ccp(-moveX, 0));
                    currSprite.runAction(actionTo);

                });


                break;
        }




    },
    mainMenuCallback:function () {
        //
        if (this._currSpriteAnswer == null) {
            //游戏还没有开始，你就返回，实在无法给你保存啊。。。
            this._super();
            return;
        }

        var currSpriteArr = _.map(this._currSpriteArr, function (currSprite) {
            return currSprite.getTag();
        });

        var gameStatus = {
            currSpriteArr:currSpriteArr,
            currSpriteAnswer:this._currSpriteAnswer.getTag(),
            currRound:this._currRound,
            timeLimit:this._timeLimit,
            currScores:this._currScores,
            currLevel:this._currLevel
        }
        var gameStatusJson = JSON.stringify(gameStatus);
        $.localStorage.saveData(cache_key, gameStatusJson);
        this._super();
    }
})

