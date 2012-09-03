

(function($) {
    
    /**
     * 滚动轴插件
     */
    $.fn.axismove = function(settings) {
        var defaults = {
            baseUrl:"",
            canvasbg:"",
            canvasbtn:"",
            
            xrayimg:"",
            xrayopacity:1,
            
            xrayoriention:'x',
            btnimg:"",
            btnxposition:"",
            btnyposition:"",
            
            xraywidth:"",
            xrayheight:"",
            
            
            touchAudioAct:{
                callback: undefined
            }
        
        };
        settings = $.extend(true, {}, defaults, settings);
        
        //
        return this.each(function(){
            var $canvas = $("#"+settings.canvasbg);
            var $canvasBtn = $("#"+settings.canvasbtn);
            
            //创建canvas容器
            var axismove_canvas = new fabric.Canvas($canvas.attr("id"),{
                selection: false,
                backgroundImageStretch:false
            });
            var axismove_btn_canvas = new fabric.Canvas($canvasBtn.attr("id"),{
                selection: false,
                backgroundImageStretch:false
            });
            
            var centerCoord = axismove_canvas.getCenter();
           
            fabric.Image.fromURL(settings.baseUrl+settings.xrayimg, function(img) {
                var oImg = img.set({
                    left: centerCoord.left, 
                    top: centerCoord.top,
                    scaleX:axismove_canvas.width/img.width,
                    scaleY:axismove_canvas.height/img.height,
                    selectable:false
                });
               
                oImg.setOpacity(settings.xrayopacity);
                axismove_canvas.add(oImg);
                axismove_canvas.renderAll();
                
                axismove_canvas.clipTo = function(ctx) {
                    ctx.rect(0,0,0,0);
                };
                axismove_canvas.renderAll();
            });
            (function(){
                //确定按钮的位置
                fabric.Image.fromURL(settings.baseUrl+settings.btnimg, function(img) {
                    var left=0;
                    var top=0;
                
                    var xraywidth = settings.xraywidth;
                    var xrayheight = settings.xrayheight;
                
                    var xpos = settings.btnxposition; //l r
                    var ypos = settings.btnyposition; //t b
                
                
                    if(xpos == "l" && ypos=="t"){
                        //left top
                        left = img.width/2;
                        top = img.height/2;
                    }
                    if(xpos == "l" && ypos=="b"){
                        //left bottom
                        left = img.width/2;
                        top = axismove_canvas.height-img.height/2;
                    }
                    if(xpos == "r" && ypos=="t"){
                        //right top
                        left = axismove_canvas.width-img.width/2;
                        top = img.height/2;
                        
                    }
                    if(xpos == "r" && ypos=="b"){
                        //right bottom
                        left = axismove_canvas.width-img.width/2;
                        top = axismove_canvas.height-img.height/2;
                    }
                
                    var oImg = img.set({
                        left: left, 
                        top: top,
                        hasBorders:false,
                        hasControls:false,
                        selectable:true,
                    });
               
                    oImg.setOpacity(1);
                 
                
                    axismove_btn_canvas.add(oImg);
                    axismove_btn_canvas.bringToFront(oImg);
                
                    if(settings.xrayoriention == "y"){
                        oImg.lockMovementX = true;
                        oImg.lockMovementY = false;
                    }else{
                        oImg.lockMovementX = false;
                        oImg.lockMovementY = true;
                    }
               
                    axismove_btn_canvas.renderAll();
                    var obj_tmp_left = 0;
                    var obj_tmp_top = 0;
                    
                    
                    axismove_btn_canvas.on('object:selected', function(e) {
                        if($.isFunction(settings.touchAudioAct.callback)){
                            settings.touchAudioAct.callback();
                        }
                
                        var activeObject = axismove_btn_canvas.getActiveObject();
                        var left = activeObject.left;
                        var top = activeObject.top;
                        obj_tmp_left = left;
                        obj_tmp_top = top;
                        if(activeObject != null){
                            switch(settings.xrayoriention){
                                case "x":
                                    axismove_canvas.clipTo = function(ctx) {
                                        ctx.rect(left-settings.xraywidth/2, 0, settings.xraywidth, axismove_canvas.height);
                                    };
                                    axismove_canvas.renderAll();
                                    break;
                                case "y":
                                    axismove_canvas.clipTo = function(ctx) {
                                        ctx.rect(0, top-settings.xrayheight/2, axismove_canvas.width, settings.xrayheight);
                                    };
                                    axismove_canvas.renderAll();     
                                    break;
                            }
                        }
                       
                    });
                    
                    axismove_btn_canvas.on('mouse:up', function(e) {
                        axismove_canvas.clipTo = function(ctx) {
                            ctx.rect(0,0,0,0);
                        };
                        axismove_canvas.renderAll();
                    });
                   
                    axismove_btn_canvas.observe('object:moving', function(e) {
                        var target = e.target;
                        var left = target.left;
                        var top = target.top;
                
                        switch(settings.xrayoriention){
                            case "x":
                                //边界check
                                var tmpx = left-target.width/2;
                                
                                if(tmpx <0 || tmpx > axismove_canvas.width-target.width){
                                    e.target.left =obj_tmp_left;
                                    e.target.top =obj_tmp_top;
                                    break;
                                }
                                obj_tmp_left = left;
                                obj_tmp_top = top;
                                axismove_canvas.clipTo = function(ctx) {
                                    ctx.rect(left-settings.xraywidth/2, 0, settings.xraywidth, axismove_canvas.height);
                                };
                                axismove_canvas.renderAll();
                                break;
                            case "y":
                                var tmpy = top-target.height/2;
                                if(tmpy <0 || tmpy > axismove_canvas.height-target.height){
                                    e.target.left =obj_tmp_left;
                                    e.target.top =obj_tmp_top;
                                    break;
                                }
                                obj_tmp_left = left;
                                obj_tmp_top = top;
                                axismove_canvas.clipTo = function(ctx) {
                                    ctx.rect(0, top-settings.xrayheight/2, axismove_canvas.width, settings.xrayheight);
                                };
                                axismove_canvas.renderAll();     
                                break;
                        }
                    });
               
                });
            
            })();
            
        });
    }

})(jQuery);