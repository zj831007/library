/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

(function($) {

    $.fn.jqLianliankan = function(settings) {
        var defaults = {
            baseUrl:"",
            bgpic:"",
            lineWidth:2,
            lineColor:"#ff0000",
            errorAudio:"",
            errorImg:"",
            finishImg:"",
            rightAudio:"",
            rightImg:"",
            lines:[],
            points:[],
            rightAduioAct:{
                callback: undefined
            },
            errorAduioAct:{
                callback: undefined
            },
            rightImgAct:{
                callback: undefined
            },
            errorImgAct:{
                callback: undefined
            },
            finishImgAct:{
                callback: undefined
            },
            finishAudioAct:{
                callback: undefined
            }
        
        };
        settings = $.extend(true, {}, defaults, settings);
     
        //两点间距离
        var distance2point = function(x1,y1,x2,y2){
            
            var xdiff = eval(x2 - x1);
            var ydiff = eval(y2 - y1);
            var res =  Math.pow((xdiff * xdiff + ydiff * ydiff), 0.5);
            res = Math.round(res);
           
            return res;
        };
        //判断是线是否在在
        var checkLineExisted = function(line,rightList){
            var len = rightList.length;
            for(var i=0; i<len; i++){
                var rline = rightList[i];
                if((line.ps == rline.ps && line.pe == rline.pe)||(line.pe == rline.ps && line.ps == rline.pe)){
                    return true;
                }
            }
            return false;
        };
        //
        return this.filter('canvas').each(function(){
            var $canvas = $(this);
            
            var ismove = true;
            var curr_line_obj = null;
            var lineJson = {};
            var rightLines = [];
            //创建canvas容器
            var llk_canvas = new fabric.Canvas($canvas.attr("id"),{
                selection: false,
                backgroundImageStretch:true
            });
            
            llk_canvas.backgroundImageStretch = true;
            llk_canvas.setBackgroundImage(settings.bgpic, llk_canvas.renderAll.bind(llk_canvas));
            llk_canvas.HOVER_CURSOR = 'pointer';
            //创建文本和图标
            var pointLen = settings.points.length;
            for(var i=0; i<pointLen; i++){
                var point = settings.points[i];
                switch(point.type){
                    case 'circle':
                        var c = fabric.Circle.fromObject(point);
                        c.uqid = point.uqid;
                        c.hasControls  = false;
                        c.selectable = false;
                        c.hasBorders = false;
                        llk_canvas.add(c);
                        break;
                    case 'line':
                        //                        var l = fabric.Line.fromObject(point);
                        //                        l.uqid = point.uqid;
                        //                        l.selectable = false;
                        //                        llk_canvas.add(l);
                        //                        llk_canvas.sendToBack(l);
                        break;
                    case 'text':
                        var t = fabric.Text.fromObject(point);
                        t.selectable = false;
                        llk_canvas.add(t);
                        break;
                    case 'image':
                       
                        (function(){
                            var src = point.src;
                            src=settings.baseUrl+src;

                            point.src = src;
                            var i = fabric.Image.fromObject(point,function(obj){
                                if(obj!=undefined && obj!= null){
                                    obj.selectable = false;
                                    llk_canvas.add(obj);
                                    llk_canvas.sendToBack(obj);
                                }
                            });
                        })();
                        break;
                }
            }
          
          
            //事件监听
            llk_canvas.on('mouse:down', function(e) {
               
                if(curr_line_obj){
                    llk_canvas.remove(curr_line_obj);
                }
                 
                //画线开始
                ismove = true;
                var p = llk_canvas.getPointer(e.e);
                lineJson.x1= p.x;
                lineJson.y1= p.y;
                
                var coords = [lineJson.x1,lineJson.y1,p.x,p.y];
                curr_line_obj =  new fabric.Line(coords, {
                    fill: settings.lineColor,
                    strokeWidth: settings.lineWidth,
                    selectable: false
                });
                llk_canvas.add(curr_line_obj);
            });
            llk_canvas.on('mouse:move', function(e) {
                if(ismove){
                    var p = llk_canvas.getPointer(e.e);
                    lineJson.x2= p.x;
                    lineJson.y2= p.y;
                    
                    if(p!= null && p!= undefined && curr_line_obj != null){
                        curr_line_obj.set({
                            'x2': lineJson.x2, 
                            'y2':lineJson.y2
                        });
                    }
                    llk_canvas.renderAll();
                }
            });
          
            llk_canvas.on('mouse:up', function(e) {
                ismove = false;
                var p = llk_canvas.getPointer(e.e);
                if(p!=undefined && curr_line_obj != null){
                    curr_line_obj.set({
                        'x2': p.x-settings.pointWidth, 
                        'y2':p.y-settings.pointWidth
                    });
                }
                llk_canvas.sendToBack(curr_line_obj);
                llk_canvas.renderAll();
                //检查画线是否正确,正确就调整线位置到精确位置，播放正确图片，错误删除线，播放错误图片[
                if(settings.lines.length == rightLines.length){
                    llk_canvas.remove(curr_line_obj);
                }else{
                    
                    //检查画线是否正确
                    var lineR = false;
                    for(var i= 0; i<settings.lines.length; i++){
                        var line = settings.lines[i];
                        //1,检查line是否已经画完
                        if(checkLineExisted(line, rightLines)){
                            continue;
                        }
                        //从canvas中找出线真实点坐标
                        var pps = {};
                        var ppe = {};
                        llk_canvas.forEachObject(function(obj) {
                            if(obj.type == 'circle' && line.ps == obj.uqid){
                                pps.uqid = obj.uqid;
                                pps.x = obj.left;
                                pps.y = obj.top;
                            }else if(obj.type == 'circle' && line.pe == obj.uqid){
                                ppe.uqid = obj.uqid;
                                ppe.x = obj.left;
                                ppe.y = obj.top;
                            }
                        });
                        var a=distance2point(lineJson.x1,lineJson.y1,pps.x,pps.y);
                        var b =distance2point(lineJson.x2,lineJson.y2,ppe.x,ppe.y);
                        var c = distance2point(lineJson.x1,lineJson.y1,ppe.x,ppe.y);
                        var d = distance2point(lineJson.x2,lineJson.y2,pps.x,pps.y);
                   
                        if((a<20 && b<20)||(c<20 && d<20)){
                            //校正画线位置
                            if(curr_line_obj != null){
                                curr_line_obj.set({
                                    "x1": pps.x,
                                    "y1": pps.y,
                                    'x2': ppe.x, 
                                    'y2': ppe.y
                                });
                            }
                            rightLines.push({
                                ps:pps.uqid,
                                pe:ppe.uqid
                            });
                            lineR = true;
                            break;
                        }
                    }
                    //-------------------结果处理------------------
                    //判断线是否正确
                    if(lineR){
                            
                        if(settings.lines.length ==rightLines.length){
                            //已经完成
                            if($.isFunction(settings.finishImgAct.callback)){
                                settings.finishImgAct.callback();
                                if($.isFunction(settings.finishAudioAct.callback)){
                                    settings.finishAudioAct.callback();
                                }
                                
                            }
                        }else{
                            //正确 
                            //播放正确音效
                            if($.isFunction(settings.rightAduioAct.callback)){
                                settings.rightAduioAct.callback();
                            }
                            //显示正确图片
                            if($.isFunction(settings.rightImgAct.callback)){
                                settings.rightImgAct.callback();
                            }
                        }
                        
                    }else{
                        //画线错误处理TODO
                        if($.isFunction(settings.errorAduioAct.callback)){
                            settings.errorAduioAct.callback();
                        }
                        //显示正确图片
                        if($.isFunction(settings.errorImgAct.callback)){
                            settings.errorImgAct.callback();
                        }
                        llk_canvas.remove(curr_line_obj);
                    }
                    
                    curr_line_obj = null;
                    llk_canvas.renderAll();
                }
            });
            
        });
    }

})(jQuery);