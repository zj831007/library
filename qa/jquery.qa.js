/* 
 * qa插件
 */
(function($) {
    var methods = {
        init : function( settings ) {
            var defaults = {
                blackimg:'',
                topictpl:"",
                topicResultTpl:"",
                topicContiner:"",
                topicForm:"",
                resultForm:"",
                baseUrl:"",
                flipPage:0, //0 無效果,  1淡入淡出 ,  2 滑動效果
                scoreType:0, // 0 100分為滿分  1 對錯題數  2 兩者兼具
                rightEvent:0, // 0 留在原处  1 跳下一页
                rightAudio:"",
                rightPic:"",
                errorAudio:"",
                errorPic:"",
                finishAudio:"",
                audioId:0,
                
                rightCount:0,
                errCount:0,
                currTopic:0, //当前每几题
                topics:[]  //题目列表
            };
            settings = $.extend(true, {}, defaults, settings);
           
           
            return this.each(function(){
                var $this = $(this);
                //初始化插件操作
                var data = $this.data('jqQa');
                if(data){
                   
                }else{
                    $this.data('jqQa', settings);
                    //如果有记录：
                    var lastR = parseInt($.localStorage.loadData(settings.resultForm+"_r")) ;
                    var lastW = parseInt($.localStorage.loadData(settings.resultForm+"_w")) ;
                    if(lastR){
                        var result = {
                            scoreType:settings.scoreType,
                            score:parseInt(lastR/(lastR+lastW)*100,10),
                            rightCount:lastR,
                            errCount:lastW
                        };
                    
                        $(settings.resultForm).html($(settings.topicResultTpl).render(result));
                        $(settings.resultForm).show();
                        $(settings.topicForm).hide();
                        
                    }else{
                        
                        var topics = settings.topics;
                        var initTopic = topics[settings.currTopic];
                   
                        $(settings.topicContiner).html($(settings.topictpl).render(initTopic));
                    
                        if(initTopic.type == "0"){
                            $(settings.topicContiner).hradio();
                        }else{
                            $(settings.topicContiner).hcheckbox();
                        }
                    }
                }
            });
        },
        reset : function( ) {
            return this.each(function(){
                var $this = $(this);
                //初始化插件操作
                var data = $this.data('jqQa');
                data.rightCount = 0;
                data.errCount = 0;
                data.currTopic = 0;
                $(data.resultForm).hide();
                $(data.topicForm).show();
                
                $this.data('jqQa', data);
                var topics = data.topics;
                var initTopic = topics[data.currTopic];
                   
                $(data.topicContiner).html($(data.topictpl).render(initTopic));
                    
                if(initTopic.type == "0"){
                    $(data.topicContiner).hradio();
                }else{
                    $(data.topicContiner).hcheckbox();
                }
                    
            });
        },
        submit : function( ) {
            
            function jump2Next(data){
                //判断是否到最后一题  rightCount   errCount currTopic topicForm resultForm
                var totalTopic = data.topics.length;
                var preTopic = data.currTopic;
                
                if(totalTopic == preTopic+1){
                    //最后一题,计算分数
                    
                    var result = {
                        scoreType:data.scoreType,
                        score:parseInt(data.rightCount/(data.rightCount+data.errCount)*100),
                        rightCount:data.rightCount,
                        errCount:data.errCount
                    };
                    
                    $(data.resultForm).html($(data.topicResultTpl).render(result));
                    //保存最后得分
                    $.localStorage.saveData(data.resultForm+"_r",data.rightCount);
                    $.localStorage.saveData(data.resultForm+"_w",data.errCount);
                    
                    if(data.finishAudio != undefined && data.finishAudio != ""){
                        Chidopi.JS.playOneAudio(data.audioId,data.baseUrl+data.finishAudio);
                    }
                    
                    if(data.flipPage == 0){
                        $(data.topicForm).hide("slow",function(){
                            $(data.resultForm).show();
                        });
                    }else if(data.flipPage == 1){
                        $(data.topicForm).fadeOut("slow",function(){
                            $(data.resultForm).fadeIn();
                        });
                    }else if(data.flipPage == 2){
                        $(data.topicForm).slideUp("slow",function(){
                            $(data.resultForm).slideDown();
                        });
                    }
                }else{
                    data.currTopic = preTopic+1;
                    var topics = data.topics;
                    var cuurTopic = topics[data.currTopic];
                   
                    $(data.topicContiner).html($(data.topictpl).render(cuurTopic));
                    
                    if(cuurTopic.type == "0"){
                        $(data.topicContiner).hradio();
                    }else{
                        $(data.topicContiner).hcheckbox();
                    }
                    $(data.topicContiner).data('jqQa', data);
                    
                    if(data.flipPage == 0){
                        $(data.topicForm).show("slow",function(){});
                    }else if(data.flipPage == 1){
                        $(data.topicForm).fadeIn("slow",function(){});
                    }else if(data.flipPage == 2){
                        $(data.topicForm).slideDown("slow",function(){});
                    }
                }
            }
            
            return this.each(function(){
                var $this = $(this);
            
                //render下一题
                var data = $this.data('jqQa');
                if(data){
                    //提交按钮点击时，首先判断是否正确
                    var inputs = $(data.topicContiner).find("input:checked");
                    
                    if(inputs.length>0){
                        var flug = true;
                        
                        inputs.each(function(){
                            var dataRight = ($(this).attr("data-right"))
                            if(dataRight == 0){
                                flug = false;
                            }
                        })
                        
                     
                        if(flug){
                            //正确，显示图片，播放声音
                            data.rightCount = data.rightCount+1;
                            if(data.rightAudio != undefined && data.rightAudio != ""){
                                Chidopi.JS.playOneAudio(data.audioId,data.baseUrl+data.rightAudio);
                            }
                           
                            if(data.rightPic != undefined && data.rightPic != ""){
                                $(data.imgContiner).find("img").attr("src",data.baseUrl+data.rightPic);
                            }
                        }else{
                            data.errCount = data.errCount+1;
                            if(data.errorAudio != undefined && data.errorAudio != ""){
                                Chidopi.JS.playOneAudio(data.audioId,data.baseUrl+data.errorAudio);
                            }
                            if(data.errorPic != undefined && data.errorPic != ""){
                                $(data.imgContiner).find("img").attr("src",data.baseUrl+data.errorPic);
                            }
                        }
                        
                        $(data.imgContiner).show();
                      
                        if(data.rightEvent == 0){
                            //留在原理
                            $(data.imgContiner).unbind().bind("click",function(){
                                if(data.flipPage == 0){
                                    $(data.imgContiner).hide("slow",function(){
                                        $(data.imgContiner).find("img").attr("src",data.blackimg);
                                        $(data.imgContiner).unbind();
                                        ////跳到下一题
                                        jump2Next(data);
                                    });
                                }else if(data.flipPage == 1){
                                    $(data.imgContiner).fadeOut("slow",function(){
                                        $(data.imgContiner).find("img").attr("src",data.blackimg);
                                        $(data.imgContiner).unbind();
                                        ////跳到下一题
                                        jump2Next(data);
                                    });
                                }else if(data.flipPage == 2){
                                    $(data.imgContiner).slideUp("slow",function(){
                                        $(data.imgContiner).find("img").attr("src",data.blackimg);
                                        $(data.imgContiner).unbind();
                                        ////跳到下一题
                                        jump2Next(data);
                                    });
                                }
                            });
                        }else{
                            //跳到下一题
                            if(data.flipPage == 0){
                                $(data.imgContiner).hide("slow",function(){
                                    ////跳到下一题
                                    jump2Next(data);
                                });
                            }else if(data.flipPage == 1){
                                $(data.imgContiner).fadeOut("slow",function(){
                                    ////跳到下一题
                                    jump2Next(data);
                                });
                            }else if(data.flipPage == 2){
                                $(data.imgContiner).slideUp("slow",function(){
                                    ////跳到下一题
                                    jump2Next(data);
                                });
                            }
                        }
                       
                            
                    }
                        
                }
                
            });
        }
       
    };

    $.fn.jqQa = function( method ) {
    
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.jqQa' );
        }    
  
    };


})(jQuery);