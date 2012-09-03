(function ($) {

    /**
     ** 光线过滤器，参数r,g ,b a, weight
     **/
    fabric.Image.filters.CumtomLight = fabric.util.createClass({
        type:"CumtomLight",
        initialize:function (options) {
            options || (options = { });
            this.color = options.color || "w";
            this.opacity = options.opacity || 255;
            this.weight = options.weight || 0;
        },
        applyTo:function (canvasEl) {
            var context = canvasEl.getContext('2d'),
                imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
                data = imageData.data,
                color = this.color,
                opacity = parseInt(this.opacity),
                weight = parseInt(this.weight),
                r, g, b, a;

            //值安全检查

            switch (color) {
                case "r":
                    for (var i = 0, len = data.length; i < len; i += 4) {
                        r = data[i];
                        r += weight;
                        data[i] = r > 255 ? 255 : r;

                        if (opacity > 255) {
                            data[i + 3] = 255;
                        } else if (opacity < 0) {
                            data[i + 3] = 0;
                        } else {
                            data[i + 3] = opacity;
                        }
                    }
                    break;
                case "g":
                    for (var i = 0, len = data.length; i < len; i += 4) {
                        g = data[i + 1];
                        g += weight;
                        data[i + 1] = g > 255 ? 255 : g;

                        if (opacity > 255) {
                            data[i + 3] = 255;
                        } else if (opacity < 0) {
                            data[i + 3] = 0;
                        } else {
                            data[i + 3] = opacity;
                        }
                    }
                    break;
                case "b":

                    for (var i = 0, len = data.length; i < len; i += 4) {
                        b = data[i + 2];
                        b += weight;
                        data[i + 2] = b > 255 ? 255 : b;

                        if (opacity > 255) {
                            data[i + 3] = 255;
                        } else if (opacity < 0) {
                            data[i + 3] = 0;
                        } else {
                            data[i + 3] = opacity;
                        }
                    }
                    break;
                case "w":
                    for (var i = 0, len = data.length; i < len; i += 4) {
                        r = data[i];
                        r += weight;
                        data[i] = r > 255 ? 255 : r;

                        g = data[i + 1];
                        g += weight;
                        data[i + 1] = g > 255 ? 255 : g;

                        b = data[i + 2];
                        b += weight;
                        data[i + 2] = b > 255 ? 255 : b;

                        if (opacity > 255) {
                            data[i + 3] = 255;
                        } else if (opacity < 0) {
                            data[i + 3] = 0;
                        } else {
                            data[i + 3] = opacity;
                        }

                    }
                    break;
            }
            context.putImageData(imageData, 0, 0);
        },
        toJSON:function () {
            return {
                type:this.type,
                color:this.color,
                opacity:this.opacity,
                weight:this.weight
            };
        }
    });

    fabric.Image.filters.CumtomLight.fromObject = function (object) {
        return new fabric.Image.filters.CumtomLight(object);
    };


    /**
     * 按照灯插件
     */
    $.fn.jqSpotlight = function (settings) {
        var defaults = {
            baseUrl:"",

            color:"w",
            opacity:255,
            weight:0,

            img:"",
            imgEffect:"",

            spotShape:"",
            spotRadius:"",
            spotWidth:"",
            spotHeight:"",

            touchAction:"",

            touchAudioAct:{
                callback:undefined
            }

        };
        settings = $.extend(true, {}, defaults, settings);

        //
        return this.filter('canvas').each(function () {
            var $canvas = $(this);

            //创建canvas容器
            var spotlight_canvas = new fabric.Canvas($canvas.attr("id"), {
                selection:false,
                backgroundImageStretch:false
            });
            spotlight_canvas.clipTo = function (ctx) {
                ctx.rect(0, 0, 0, 0);
            };
            spotlight_canvas.renderAll.bind(spotlight_canvas)
            var centerCoord = spotlight_canvas.getCenter();
            setTimeout(function () {
                fabric.Image.fromURL(settings.baseUrl + settings.img, function (img) {
                    oImg = img.set({
                        left:centerCoord.left,
                        top:centerCoord.top,
                        scaleX:spotlight_canvas.width / img.width,
                        scaleY:spotlight_canvas.height / img.height,
                        selectable:false
                    })
                    oImg.setOpacity(1);
                    if (settings.imgEffect == "invert") {
                        oImg.filters[1] = new fabric.Image.filters.Invert();
                        oImg.applyFilters(spotlight_canvas.renderAll.bind(spotlight_canvas));
                    } else if (settings.imgEffect == "gray") {
                        oImg.filters[1] = new fabric.Image.filters.Grayscale();
                        oImg.applyFilters(spotlight_canvas.renderAll.bind(spotlight_canvas));
                    }

                    var len = oImg.filters.length;
                    oImg.filters[len + 1] = new fabric.Image.filters.CumtomLight({color:settings.color, opacity:settings.opacity, weight:settings.weight});
                   //由于此过滤器在ipad上速度如蜗牛。。暂时取消
                   // oImg.applyFilters(spotlight_canvas.renderAll.bind(spotlight_canvas));

                    spotlight_canvas.add(oImg);
                });
            }, 0);


            spotlight_canvas.on('mouse:down', function (e) {
                if ($.isFunction(settings.touchAudioAct.callback)) {
                    settings.touchAudioAct.callback();
                }
                var p = spotlight_canvas.getPointer(e.e);

                //触摸开始是否动画显示
                if (settings.touchAction == "eseinout") {
                    var step = 10;
                    var dr = settings.spotRadius / step;
                    var dx = settings.spotWidth / step;
                    var dy = settings.spotHeight / step;
                    var w = 0, h = 0, r = 0;
                    setTimeout(function animate() {
                        switch (settings.spotShape) {
                            case "cycle":
                                r += dr;

                                spotlight_canvas.clipTo = function (ctx) {
                                    ctx.arc(p.x, p.y, r, r, Math.PI * 2, true);
                                };
                                spotlight_canvas.renderAll();
                                if (r < settings.spotRadius) {
                                    setTimeout(animate, 10);
                                }
                                break;
                            case "squire":
                                w += dx;
                                h += dy;

                                spotlight_canvas.clipTo = function (ctx) {
                                    ctx.rect(p.x - w / 2, p.y - h / 2, w, h);
                                };
                                spotlight_canvas.renderAll();
                                if (w < settings.spotWidth) {
                                    setTimeout(animate, 30);
                                }
                                break;
                        }


                    }, 30);
                } else {
                    switch (settings.spotShape) {
                        case "cycle":
                            spotlight_canvas.clipTo = function (ctx) {
                                ctx.arc(p.x, p.y, settings.spotRadius, settings.spotRadius, Math.PI * 2, true);
                            };
                            spotlight_canvas.renderAll();
                            break;
                        case "squire":
                            spotlight_canvas.clipTo = function (ctx) {
                                ctx.rect(p.x - settings.spotWidth / 2, p.y - settings.spotHeight / 2, settings.spotWidth, settings.spotHeight);
                            };
                            spotlight_canvas.renderAll();
                            break;
                    }
                }


            });
            spotlight_canvas.on('mouse:move', function (e) {
                var p = spotlight_canvas.getPointer(e.e);
                switch (settings.spotShape) {
                    case "cycle":
                        spotlight_canvas.clipTo = function (ctx) {
                            ctx.arc(p.x, p.y, settings.spotRadius, settings.spotRadius, Math.PI * 2, true);
                        };
                        spotlight_canvas.renderAll();
                        break;
                    case "squire":
                        spotlight_canvas.clipTo = function (ctx) {
                            ctx.rect(p.x - settings.spotWidth / 2, p.y - settings.spotHeight / 2, settings.spotWidth, settings.spotHeight);
                        };
                        spotlight_canvas.renderAll();
                        break;
                }
            });
            spotlight_canvas.on('mouse:up', function (e) {
                var p = spotlight_canvas.getPointer(e.e);


                //触摸结束是否动画显示
                if (settings.touchAction == "eseinout") {
                    var step = 10;
                    var dr = settings.spotRadius / step;
                    var dx = settings.spotWidth / step;
                    var dy = settings.spotHeight / step;
                    var w = settings.spotWidth, h = settings.spotHeight, r = settings.spotRadius;
                    setTimeout(function animate() {
                        switch (settings.spotShape) {
                            case "cycle":
                                r -= dr;

                                spotlight_canvas.clipTo = function (ctx) {
                                    ctx.arc(p.x, p.y, r, r, Math.PI * 2, true);
                                };
                                spotlight_canvas.renderAll();
                                if (r > 0) {
                                    setTimeout(animate, 30);
                                }
                                break;
                            case "squire":
                                w -= dx;
                                h -= dy;

                                spotlight_canvas.clipTo = function (ctx) {
                                    ctx.rect(p.x - w / 2, p.y - h / 2, w, h);
                                };
                                spotlight_canvas.renderAll();
                                if (w > 0) {
                                    setTimeout(animate, 30);
                                }
                                break;
                        }


                    }, 30);
                } else {
                    switch (settings.spotShape) {
                        case "cycle":
                            spotlight_canvas.clipTo = function (ctx) {
                                ctx.arc(p.x, p.y, settings.spotRadius, settings.spotRadius, Math.PI * 2, true);
                            };
                            spotlight_canvas.renderAll();
                            break;
                        case "squire":
                            spotlight_canvas.clipTo = function (ctx) {
                                ctx.rect(p.x - settings.spotWidth / 2, p.y - settings.spotHeight / 2, settings.spotWidth, settings.spotHeight);
                            };
                            spotlight_canvas.renderAll();
                            break;
                    }
                }

            });

        });
    }

})(jQuery);