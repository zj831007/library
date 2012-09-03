/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

(function($) {

    $.fn.jqDiypuzzle = function(settings) {
        var defaults = {
            timeLimit:0,
            scoreShow:false,
            retestShow:false,
            scrollid:"",
            blockDis:"",
            baseUrl:"",
            bgpic:"",
            points:[],
            timeRestart:'0',
            timeerOnAct:{
                callback: undefined
            },
            rightAduioAct:{
                callback: undefined
            },
            finishAudioAct:{
                callback: undefined
            },
            rightImgAct:{
                callback: undefined
            },
            finishImgAct:{
                callback: undefined
            },
            rightTextAct:{
                callback: undefined
            },
            finishTextAct:{
                callback: undefined
            },
            rightEffectAct:{
                callback: undefined
            },
            finishEffectAct:{
                callback: undefined
            }
            
        
        };
        settings = $.extend(true, {}, defaults, settings);
        
        function appendImg(diypuzzle_canvas,imgname, x, y, width, height){
            var img=$("<img />");

            img.attr({
                src:settings.baseUrl+imgname,
                width:100,
                height:100,
                data_x:x,
                data_y:y,
                data_width:width,
                data_height:height
            });
            img.bind("click", function(e){
                $(this).css("border","1px solid #00ff00");
                
                var centerCoord = diypuzzle_canvas.getCenter();
                fabric.Image.fromURL(img.attr("src"), function(imgobj) {
                    var oImg = imgobj.set({
                        left: centerCoord.left, 
                        top: centerCoord.top,
                        data_x:img.attr("data_x"),
                        data_y: img.attr("data_y"),
                        selectable : true,
                        hasControls : false,
                        hasBorders:false
                    })
                    diypuzzle_canvas.add(oImg);
            
                });
                $(this).remove();
            })
            if(settings.blockDis == "t"|| settings.blockDis == "b"){
                $("#"+settings.scrollid+" p").append(img);
            }else{
                $("#"+settings.scrollid).append(img);
            }
       
        }
        function resetPoint(diypuzzle_canvas){
            var pointLen = settings.points.length;
            var point;
            diypuzzle_canvas.clear();
            if(settings.blockDis == "rand"){
                //
                for(var i=0; i<pointLen; i++){
                    point = settings.points[i];
                    (function(){
                        var src = point.src;
                        src=settings.baseUrl+src;
                        point.src = src;

                        var i = fabric.Image.fromObject(point,function(obj){
                            if(obj!=undefined && obj!= null){
                                obj.selectable = true;
                                obj.hasControls = false;
                                obj.hasBorders = false;
                                obj.data_x = obj.left;
                                obj.data_y = obj.top;
                                //随机坐标
                                var randx= parseInt(Math.random()*(diypuzzle_canvas.getWidth()-point.width));
                                var randy= parseInt(Math.random()*(diypuzzle_canvas.getHeight()-point.height));
                                
                                obj.left = randx+point.width/2;
                                obj.top = randy+point.height/2;
                                diypuzzle_canvas.add(obj);
                            }
                        });
                    })();
                }
                
            }else{
                if(settings.blockDis == "t"|| settings.blockDis == "b"){
                    $("#"+settings.scrollid+" p").html("");
                }else{
                    $("#"+settings.scrollid).html("");
                }
            
                for(var i=0; i<pointLen; i++){
                    point = settings.points[i];
                    appendImg(diypuzzle_canvas,point.src,point.left,point.top,point.width,point.height);
                }
            }
        }
        //
        return this.filter('canvas').each(function(){
            var $canvas = $(this);
            var id = $canvas.attr("id");
            var time = new Date().getTime();
            var rightCount = 0;
            var timeInterval = null;
            
           
            //创建canvas容器
            var diypuzzle_canvas = new fabric.Canvas($canvas.attr("id"),{
                selection: false,
                backgroundImageStretch:false
            });
            
            diypuzzle_canvas.backgroundImageStretch = false;
            diypuzzle_canvas.setBackgroundImage(settings.bgpic, diypuzzle_canvas.renderAll.bind(diypuzzle_canvas));
            diypuzzle_canvas.HOVER_CURSOR = 'pointer';
            
            var calcTime = function(){
                var timeE = new Date().getTime();
                var sec = (timeE-time)/1000;
                var mid = parseInt(settings.timeLimit *60 -sec);
                    
                if($.isFunction(settings.timeerOnAct.callback)){
                    if(mid >0){
                        settings.timeerOnAct.callback(mid);
                    }else{
                        if(settings.timeRestart == "1"){
                            settings.timeerOnAct.callback(0);
                            clearInterval(timeInterval)
                                
                            var l = $canvas.width()/2-140;
                            var finishDiv = $("<div/>");
                            finishDiv.addClass("finish-div").css({
                                left:l,
                                top:0
                            });
                            var a = $("<a>Timeout,Tap to retest!</a>");
                            a.bind("click", function(){
                                rightCount =0;
                                time = new Date().getTime();
                                finishDiv.remove();
                                //初始化图片块，随机或四周分布
                                time = new Date().getTime();
                                resetPoint(diypuzzle_canvas);
                                timeInterval= setInterval(calcTime,1000);
                            });
                            var again = $("<p/>").css("text-align","center").append(a);
                            finishDiv.append(title).append(topScore).append(again);
                            finishDiv.slideDown('5000', function() { });
                            $canvas.parent().append(finishDiv);
                                
                        }else{
                            settings.timeerOnAct.callback(0);
                            clearInterval(timeInterval)
                        }
                    }
                        
                }
            }
            if(settings.timeLimit>0){
                timeInterval= setInterval(calcTime,1000);
            }
            //-------------------
            var ts = 0;
            if($.localStorage.loadData(id)){
                ts= $.localStorage.loadData(id);
            }
            ////finsh div
            if(ts >0 && settings.scoreShow == '1'){
                var l = $canvas.width()/2-140;
                var finishDiv = $("<div/>");
                finishDiv.addClass("finish-div").css({
                    left:l,
                    top:0
                });
                //var topScore = $("<p/>").html("最高分数："+ts);
                var title = $("<p/>").html("RESULT").css("text-align","center");
                var topScore = $("<p/>").html("Score："+ts);
                var a = $("<a>Retest</a>");
                a.bind("click", function(){
                    rightCount =0;
                    time = new Date().getTime();
                    finishDiv.remove();
                    //初始化图片块，随机或四周分布
                    time = new Date().getTime();
                    resetPoint(diypuzzle_canvas);
                });
                var again = $("<p/>").css("text-align","center").append(a);
                finishDiv.append(title).append(topScore).append(again);
                finishDiv.slideDown('5000', function() { });
                $canvas.parent().append(finishDiv);
            }else{
                time = new Date().getTime();
                resetPoint(diypuzzle_canvas);
            }
            
           
            //事件处理
            diypuzzle_canvas.on('mouse:up', function(e) {
                //var p = diypuzzle_canvas.getPointer(e.memo.e);
                var target = e.target;
                var obj = e.target;
                if(obj!=undefined){
                    if(Math.abs(obj.left-obj.data_x)<20 && Math.abs(obj.top-obj.data_y)<20){
                        obj.left = obj.data_x;
                        obj.top = obj.data_y;
                        obj.selectable = false;
                        //将ojb放入最底层
                        diypuzzle_canvas.sendToBack(obj);
                        diypuzzle_canvas.renderAll();
                        
                        rightCount ++;
                        
                        if(rightCount >=settings.points.length){
                            //拼图完成 计算分数：
                        
                            if(settings.scoreShow == '1'){
                                var endTime = new Date().getTime();
                                var useTime = (endTime-time)/1000;
                        
                                if(useTime>settings.timeLimit*60){
                                    sc = 0;
                                }else{
                                    sc = 100-parseInt((useTime/(settings.timeLimit*60))*100)
                                }
                        
                                var ts = 0;
                                if($.localStorage.loadData(id)){
                                    ts= $.localStorage.loadData(id);
                                }
                                if(sc>ts){
                                    $.localStorage.saveData(id,sc);
                                }
                                var l = $canvas.width()/2-140;
                                var finishDiv = $("<div/>");
                                finishDiv.addClass("finish-div").css({
                                    left:l,
                                    top:0
                                });
                                //var topScore = $("<p/>").html("最高分数："+ts);
                                var topScore = $("<p/>").html("RESULT").css("text-align","center");
                                var score = $("<p/>").html("Score："+sc);
                                var a = $("<a>Retest</a>");
                                a.bind("click", function(){
                                    rightCount =0;
                                    time = new Date().getTime();
                                    finishDiv.remove();
                                    //初始化图片块，随机或四周分布
                                    time = new Date().getTime();
                                    resetPoint(diypuzzle_canvas);
                                });
                                var again = $("<p/>").css("text-align","center").append(a);
                                finishDiv.append(topScore).append(score).append(again);
                                finishDiv.slideDown('5000', function() { });
                                $canvas.parent().append(finishDiv);
                            }else{
                                //是否重来
                                if(settings.retestShow == '1'){
                                    var l = $canvas.width()/2-140;
                                    var finishDiv = $("<div/>");
                                    finishDiv.addClass("finish-div").css({
                                        left:l,
                                        top:0,
                                    });
                                    var a = $("<a>Retest</a>");
                                    a.bind("click", function(){
                                        finishDiv.remove();
                                        //初始化图片块，随机或四周分布
                                        time = new Date().getTime();
                                        resetPoint(diypuzzle_canvas);
                                    });
                                    var again = $("<p/>").css("text-align","center").append(a);
                                    finishDiv.append(again);
                                    finishDiv.slideDown('5000', function() { });
                                    $canvas.parent().append(finishDiv);
                                }
                                
                            }
                            //--------------------
                            if($.isFunction(settings.finishAudioAct.callback)){
                                settings.finishAudioAct.callback();
                            }
                            if($.isFunction(settings.finishImgAct.callback)){
                                settings.finishImgAct.callback();
                            }
                            if($.isFunction(settings.finishEffectAct.callback)){
                                settings.finishEffectAct.callback(target.left,target.top);
                            }
                            if($.isFunction(settings.finishTextAct.callback)){
                                settings.finishTextAct.callback(target.left,target.top);
                            }
                        }else{
                            //拼图正确
                            if($.isFunction(settings.rightAduioAct.callback)){
                                settings.rightAduioAct.callback();
                            }
                            if($.isFunction(settings.rightImgAct.callback)){
                                settings.rightImgAct.callback();
                            }
                            if($.isFunction(settings.rightEffectAct.callback)){
                                settings.rightEffectAct.callback(target.left,target.top);
                            }
                            if($.isFunction(settings.rightTextAct.callback)){
                                settings.rightTextAct.callback(target.left,target.top);
                            }
                            
                        }
                    }
                    
                }
            });
            
            
        });
    }

})(jQuery);