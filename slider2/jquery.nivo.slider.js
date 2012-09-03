/*
 * jQuery Nivo Slider v2.7.1
 * http://nivo.dev7studios.com
 *
 * Copyright 2011, Gilbert Pellegrom
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * March 2010
 */

(function($) {

    var NivoSlider = function(element, options){
		//Defaults are below
		var settings = $.extend({}, $.fn.nivoSlider.defaults, options);

        //Useful variables. Play carefully.
        var vars = {
            currentSlide: 0,
            currentImage: '',
            totalSlides: 0,
            running: false,
            paused: false,
            stop: !settings.autoRun,
			flip_face:true,
			lastSlide: 0,
            turnstile_num: 0,
        };
    
        //Get this slider
        var slider = $(element);
        slider.data('nivo:vars', vars);
        slider.css('position','relative');
        slider.addClass('nivoSlider');
        
        //Find our slider children
        var kids = slider.children();
        kids.each(function() {
            var child = $(this);
            var link = '';
            if(!child.is('img')){
                if(child.is('a')){
                    child.addClass('nivo-imageLink');
                    link = child;
                }
                child = child.find('img:first');
            }
            //Get img width & height
            var childWidth = child.width();
            if(childWidth == 0) childWidth = child.attr('width');
            var childHeight = child.height();
            if(childHeight == 0) childHeight = child.attr('height');
            //Resize the slider
            if(childWidth > slider.width()){
                slider.width(childWidth);
            }
            if(childHeight > slider.height()){
                slider.height(childHeight);
            }
            if(link != ''){
                link.css('display','none');
            }
            child.css('display','none');
            vars.totalSlides++;
        });
        
        //If randomStart
        if(settings.randomStart){
        	settings.startSlide = Math.floor(Math.random() * vars.totalSlides);
        }
        
        //Set startSlide
        if(settings.startSlide > 0){
            if(settings.startSlide >= vars.totalSlides) settings.startSlide = vars.totalSlides - 1;
            vars.currentSlide = settings.startSlide;
        }
        
        //Get initial image
        if($(kids[vars.currentSlide]).is('img')){
            vars.currentImage = $(kids[vars.currentSlide]);
        } else {
            vars.currentImage = $(kids[vars.currentSlide]).find('img:first');
        }
        
        //Show initial link
        if($(kids[vars.currentSlide]).is('a')){
            $(kids[vars.currentSlide]).css('display','block');
        }
        var slider_container = $('<div class="nivo_subcontainer" style="/*position:absolute;*/"></div>').width(slider.width()).height(slider.height());

		var slider_show = $('<div class="nivo_show" style=""></div>').width(slider.width()).height(slider.height());
		if(settings.effect == "flip"){
			settings.slices = 1;
			slider_show.addClass("face");
			slider_container.append(slider_show);
			slider.prepend(slider_container);
		}else{
            slider.append(slider_show);
		}
        //Set first background
        //slider.css('background','url("'+ vars.currentImage.attr('src') +'") no-repeat');
        slider_show.css('background','url("'+ vars.currentImage.attr('src') +'") no-repeat')
                   .css('background-size', slider.width() + "px " + slider.height()+ "px")
                   .css('opacity','1');
        
        //Create caption
        slider.append(
            $('<div class="nivo-caption"><p></p></div>').css({ display:'none', opacity:settings.captionOpacity })
        );		
        
        // Cross browser default caption opacity
        $('.nivo-caption', slider).css('opacity', 0);
		
		// Process caption function
		var processCaption = function(settings){
			var nivoCaption = $('.nivo-caption', slider);
			if(vars.currentImage.attr('title') != '' && vars.currentImage.attr('title') != undefined){
				var title = vars.currentImage.attr('title');
				if(title.substr(0,1) == '#') title = $(title).html();	

				if(nivoCaption.css('opacity') != 0){
					nivoCaption.find('p').stop().fadeTo(settings.animSpeed, 0, function(){
						$(this).html(title);
						$(this).stop().fadeTo(settings.animSpeed, 1);
					});
				} else {
					nivoCaption.find('p').html(title);
				}					
				nivoCaption.stop().fadeTo(settings.animSpeed, settings.captionOpacity);
			} else {
				nivoCaption.stop().fadeTo(settings.animSpeed, 0);
			}
		}
		
        //Process initial  caption
        processCaption(settings);
        
        //In the words of Super Mario "let's a go!"
        var timer = 0;
        if(!settings.manualAdvance && kids.length > 1){
            timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
        }

        //Add Control nav
        if(settings.controlNav){
            var nivoControl = $('<div class="nivo-controlNav"></div>');
			
			if(settings.controlNavPosition == 'top'){
                slider.prepend(nivoControl);
			}else{
				slider.append(nivoControl);
			}
            for(var i = 0; i < kids.length; i++){
                if(settings.controlNavThumbs){
                    var child = kids.eq(i);
                    if(!child.is('img')){
                        child = child.find('img:first');
                    }
                    if (settings.controlNavThumbsFromRel) {
                        nivoControl.append('<a class="nivo-control" rel="'+ i +'"><img src="'+ child.attr('rel') + '" alt="" /></a>');
                    } else {
                        nivoControl.append('<a class="nivo-control" rel="'+ i +'"><img src="'+ child.attr('src').replace(settings.controlNavThumbsSearch, settings.controlNavThumbsReplace) +'" alt="" /></a>');
                    }
                } else {
					if(settings.controlNavText){
                    	nivoControl.append('<a class="nivo-control ' + settings.controlNavSize +'" rel="'+ i +'">'+ (i + 1) +'</a>');
					}else{
						nivoControl.append('<a class="nivo-control ' + settings.controlNavSize +'" rel="'+ i +'"></a>');
					}
                }                
            }
            //console.log(slider.width() + " - " +nivoControl.width());
			switch(settings.controlNavAlign){
			    case 'left':
					nivoControl.css('left','15px');
				    break;
				case 'right':
					nivoControl.css('right','15px');
				    break;
				case 'center':
					nivoControl.css('left', (slider.width()- nivoControl.width()) / 2 + "px");
			}

			if(settings.controlNavPosition == 'top'){
                nivoControl.css("top", - nivoControl.height()+ "px");
				slider.parent().parent().css('margin-top', nivoControl.height()+ "px");
				var top;
				if(settings.effect == "flip"){					
					top = parseInt(slider.parent().parent().css("top"));
                    slider.parent().parent().css("top", (top + nivoControl.height()) + "px" );
				}else{
					top = parseInt(slider.parent().css("top"));
                    slider.parent().css("top", (top + nivoControl.height()) + "px" );
				}
			}else{
                nivoControl.css("bottom", -nivoControl.height()+ "px");
				slider.parent().parent().css('margin-bottom', nivoControl.height()+ "px");
			}
			
			nivoControl.bind("mousedown mousemove mouseup mouseout  touchmove ",function(e){e.preventDefault();return false;});
			
			//Set initial active link
            $('.nivo-controlNav a:eq('+ vars.currentSlide +')', slider).addClass('active');
            
            $('.nivo-controlNav a', slider).live('click', function(){
                if(vars.running) return false;
                if($(this).hasClass('active')) return false;
                clearInterval(timer);
                timer = '';
               // slider.css('background','url("'+ vars.currentImage.attr('src') +'") no-repeat');
				slider_show.css('background','url("'+ vars.currentImage.attr('src') +'") no-repeat')
				           .css('background-size', slider.width() + "px " + slider.height()+ "px")
				           .css('opacity','1');
                vars.currentSlide = $(this).attr('rel') - 1;
                nivoRun(slider, kids, settings, 'control');
            });

			//console.log(nivoControl.width() + " | " + nivoControl.height());
        }

		 //Add Direction nav
        if(settings.directionNav){
			var directionNav = $('<div class="nivo-directionNav"><a class="nivo-prevNav">'+ settings.prevText +'</a><a class="nivo-nextNav">'+ settings.nextText +'</a></div>');
            slider.append(directionNav);
            if(settings.directionNavPos == 2){
				var prev = $(".nivo-prevNav",directionNav);
				var margin_left = prev.width() + 12;
			    prev.css("left", (-margin_left) + "px" );
			    $(".nivo-nextNav",directionNav).css("right",  (-margin_left) + "px" );
				slider.parent().parent().css("margin-left" , margin_left + "px").css("margin-right", margin_left + "px");
			}
            //Hide Direction nav
            if(settings.directionNavHide){
                $('.nivo-directionNav', slider).hide();
                slider.hover(function(){
                    $('.nivo-directionNav', slider).show();
                }, function(){
                    $('.nivo-directionNav', slider).hide();
                });
            }

			directionNav.bind("mousedown mousemove mouseup mouseout touchmove ",function(e){e.preventDefault();return false;});

            
            $('.nivo-prevNav', slider).live('click', function(){
                if(vars.running) return false;
                clearInterval(timer);
                timer = '';
                vars.currentSlide -= 2;
                nivoRun(slider, kids, settings, 'prev');
            });
            
            $('.nivo-nextNav', slider).live('click', function(){
                if(vars.running) return false;
                clearInterval(timer);
                timer = '';
                nivoRun(slider, kids, settings, 'next');
            });

        }
        
        //Keyboard Navigation
        if(settings.keyboardNav){
            $(window).keypress(function(event){
                //Left
                if(event.keyCode == '37'){
                    if(vars.running) return false;
                    clearInterval(timer);
                    timer = '';
                    vars.currentSlide-=2;
                    nivoRun(slider, kids, settings, 'prev');
                }
                //Right
                if(event.keyCode == '39'){
                    if(vars.running) return false;
                    clearInterval(timer);
                    timer = '';
                    nivoRun(slider, kids, settings, 'next');
                }
            });
        }
        
        //For pauseOnHover setting
        if(settings.pauseOnHover){
            slider.hover(function(){
                vars.paused = true;
                clearInterval(timer);
                timer = '';
            }, function(){
                vars.paused = false;
                //Restart the timer
                if(timer == '' && !settings.manualAdvance){
                    timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
                }
            });
        }
        
        //Event when Animation finishes
        slider.bind('nivo:animFinished', function(){ 
            vars.running = false; 
            //Hide child links
            $(kids).each(function(){
                if($(this).is('a')){
                    $(this).css('display','none');
                }
            });
            //Show current link
            if($(kids[vars.currentSlide]).is('a')){
                $(kids[vars.currentSlide]).css('display','block');
            }
            //Restart the timer
            if(timer == '' && !vars.paused && !settings.manualAdvance){
                timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
            }
            //Trigger the afterChange callback
            settings.afterChange.call(this);
            
            //$(".nivo_show",slider).hide()
        });
        
        // Add slices for slice animations
        var createSlices = function(slider, settings, vars){
            for(var i = 0; i < settings.slices; i++){
				var sliceWidth = Math.round(slider.width()/settings.slices);
				var c = (settings.effect == "flip") ? slider_container : slider;
				if(i == settings.slices-1){
				    c.append(
						$('<div class="nivo-slice"></div>').css({ 
							left:(sliceWidth*i)+'px', width:(slider.width()-(sliceWidth*i))+'px',
							height:'0px', 
							opacity:'0', 
							background: 'url("'+ vars.currentImage.attr('src') +'") no-repeat -'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px 0%',
							backgroundSize: slider.width() + 'px ' + slider.height()+ 'px'
						})
					);
				} else {
					c.append(
						$('<div class="nivo-slice"></div>').css({ 
							left:(sliceWidth*i)+'px', width:sliceWidth+'px',
							height:'0px', 
							opacity:'0', 
							background: 'url("'+ vars.currentImage.attr('src') +'") no-repeat -'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px 0%',
							backgroundSize: slider.width() + 'px ' + slider.height()+ 'px' 
						})
					);
				}
			}
        }
		
		// Add boxes for box animations
		var createBoxes = function(slider, settings, vars){
			var boxWidth = Math.round(slider.width()/settings.boxCols);
			var boxHeight = Math.round(slider.height()/settings.boxRows);
			
			for(var rows = 0; rows < settings.boxRows; rows++){
				for(var cols = 0; cols < settings.boxCols; cols++){
					var c = (settings.effect == "flip") ? slider_container : slider;
					if(cols == settings.boxCols-1){
						c.append(
							$('<div class="nivo-box"></div>').css({ 
								opacity:0,
								left:(boxWidth*cols)+'px', 
								top:(boxHeight*rows)+'px',
								width:(slider.width()-(boxWidth*cols))+'px',
								height:boxHeight+'px',
								background: 'url("'+ vars.currentImage.attr('src') +'") no-repeat -'+ ((boxWidth + (cols * boxWidth)) - boxWidth) +'px -'+ ((boxHeight + (rows * boxHeight)) - boxHeight) +'px',
								backgroundSize: slider.width() + "px " + slider.height()+ "px" 
							})
						);
					} else {
						c.append(
							$('<div class="nivo-box"></div>').css({ 
								opacity:0,
								left:(boxWidth*cols)+'px', 
								top:(boxHeight*rows)+'px',
								width:boxWidth+'px',
								height:boxHeight+'px',
								background: 'url("'+ vars.currentImage.attr('src') +'") no-repeat -'+ ((boxWidth + (cols * boxWidth)) - boxWidth) +'px -'+ ((boxHeight + (rows * boxHeight)) - boxHeight) +'px',
								backgroundSize: slider.width() + "px " + slider.height()+ "px" 
							})
						);
					}
				}
			}
		}

        // Private run method
		var nivoRun = function(slider, kids, settings, nudge){
			//Get our vars
			var vars = slider.data('nivo:vars');
            
            //Trigger the lastSlide callback
            if(vars && (vars.currentSlide == vars.totalSlides - 1)){ 
				settings.lastSlide.call(this);
			}
            
            // Stop
			if((!vars || vars.stop) && !nudge) return false;
			
			//Trigger the beforeChange callback
			settings.beforeChange.call(this);
					
			//Set current background before change
			if(!nudge){
                slider_show.css('background','url("'+ vars.currentImage.attr('src') +'") no-repeat')
                           .css('background-size', slider.width() + "px " + slider.height()+ "px" )
                           .css('opacity','1');
				//slider.css('background','url("'+ vars.currentImage.attr('src') +'") no-repeat');
			} else {
				if(nudge == 'prev'){
					slider_show.css('background','url("'+ vars.currentImage.attr('src') +'") no-repeat')
					           .css('background-size', slider.width() + "px " + slider.height()+ "px" )
					           .css('opacity','1');
					//slider.css('background','url("'+ vars.currentImage.attr('src') +'") no-repeat');
				}
				if(nudge == 'next'){
					slider_show.css('background','url("'+ vars.currentImage.attr('src') +'") no-repeat')
					           .css('background-size', slider.width() + "px " + slider.height()+ "px" )
					           .css('opacity','1');
					//slider.css('background','url("'+ vars.currentImage.attr('src') +'") no-repeat');
				}
			}
			vars.currentSlide++;
            //Trigger the slideshowEnd callback
			if(vars.currentSlide == vars.totalSlides){ 
				vars.currentSlide = 0;
				settings.slideshowEnd.call(this);
			}
			if(vars.currentSlide < 0) vars.currentSlide = (vars.totalSlides - 1);
			//Set vars.currentImage
			if($(kids[vars.currentSlide]).is('img')){
				vars.currentImage = $(kids[vars.currentSlide]);
			} else {
				vars.currentImage = $(kids[vars.currentSlide]).find('img:first');
			}
			
			//Set active links
			if(settings.controlNav){
				$('.nivo-controlNav a', slider).removeClass('active');
				$('.nivo-controlNav a:eq('+ vars.currentSlide +')', slider).addClass('active');
			}
			
			//Process caption
			processCaption(settings);
			
			// Remove any slices from last transition
			$('.nivo-slice', slider).remove();
			
			// Remove any boxes from last transition
			$('.nivo-box', slider).remove();
			
			var currentEffect = settings.effect;
			//Generate random effect
			if(settings.effect == 'random'){
				var anims = new Array('sliceDownRight','sliceDownLeft','sliceUpRight','sliceUpLeft','sliceUpDown','sliceUpDownLeft','fold','fade',
                'boxRandom','boxRain','boxRainReverse','boxRainGrow','boxRainGrowReverse');
				currentEffect = anims[Math.floor(Math.random()*(anims.length + 1))];
				if(currentEffect == undefined) currentEffect = 'fade';
			}
            
            //Run random effect from specified set (eg: effect:'fold,fade')
            if(settings.effect.indexOf(',') != -1){
                var anims = settings.effect.split(',');
                currentEffect = anims[Math.floor(Math.random()*(anims.length))];
				if(currentEffect == undefined) currentEffect = 'fade';
            }
            
            //Custom transition as defined by "data-transition" attribute
            if(vars.currentImage.attr('data-transition')){
            	currentEffect = vars.currentImage.attr('data-transition');
            }
		
            // handle transparent phn animation
            if(currentEffect !='flip' && settings.transparent){
            	$(".nivo_show",slider).animate({ opacity:'0' }, (settings.animSpeed));
            }
            
			//Run effects
			vars.running = true;
			if(currentEffect == "flip"){		
				
				slider_show.css("-webkit-transform", "rotateY("+ (vars.turnstile_num * -180 )+"deg)");
				slider_show.css("-moz-transform", "rotateY("+ (vars.turnstile_num * -180 )+"deg)");
				slider_show.css("transform", "rotateY("+ (vars.turnstile_num * -180 )+"deg)");
				slider_show.css("z-index",6);
				
				//console.log("slider_show1: " + slider_show.css("background-image"));
                //console.log("set timeteout 1");
                var old  = vars.turnstile_num;
				 setTimeout(function(){
					 // console.log("timeount1");
					  createSlices(slider, settings, vars);
				      var slice = $('.nivo-slice:first', slider);
				      if(old % 2 == 0)
				          slice.addClass("back");				  
					  slice.css({ top:'0px', height:'100%',opacity: 1});
                     // console.log("timeout 1 end");					
				 }, 500);
               
				
                if(vars.currentSlide == (vars.totalSlides-1) && vars.lastSlide == 0){					
					vars.turnstile_num += -1;
				}else if(vars.currentSlide == 0 && vars.lastSlide == (vars.totalSlides -1)){					
				    vars.turnstile_num += 1;
				}else{					
				    vars.turnstile_num += (vars.currentSlide - vars.lastSlide > 0) ? 1 : -1;
				}
				vars.lastSlide = vars.currentSlide;
				var angle = vars.turnstile_num * -180;
				var parent = slider.parent();
				//console.log("2: " + vars.turnstile_num);
				slider_container.css("-webkit-transform", "rotateY("+angle+"deg)");
				slider_container.css("-moz-transform", "rotateY("+angle+"deg)");
				slider_container.css("transform", "rotateY("+angle+"deg)");
				slider.trigger('nivo:animFinished');

                if($(".nivo-directionNav",slider).size()){
					$(".nivo-directionNav",slider).remove();
					var directionNav = $('<div class="nivo-directionNav" style="position:relative;top:45%;"><a class="nivo-prevNav" >' 
										 + settings.prevText 
										 + '</a><a class="nivo-nextNav">'+ settings.nextText +'</a></div>');
					slider.parent().parent().append(directionNav);
					directionNav = $(".nivo-directionNav",slider.parent().parent());
					
					 if(settings.directionNavPos == 2){
						var prev = $(".nivo-prevNav",directionNav);
						var margin_left = prev.width() + 12;
						prev.css("left", (-margin_left) + "px" );
						$(".nivo-nextNav",directionNav).css("right",  (-margin_left) + "px" );
						//slider.parent().parent().css("margin-left" , margin_left + "px").css("margin-right", margin_left + "px");
					}
					
					$('.nivo-prevNav', directionNav).bind('click', function(){
						
						slider.prev();
					});
					$('.nivo-nextNav', directionNav).bind('click', function(){
						slider.next();
					});
				}
				
			}
			else if(currentEffect == 'sliceDown' || currentEffect == 'sliceDownRight' || currentEffect == 'sliceDownLeft'){
				createSlices(slider, settings, vars);
				var timeBuff = 0;
				var i = 0;
				var slices = $('.nivo-slice', slider);
				if(currentEffect == 'sliceDownLeft') slices = $('.nivo-slice', slider)._reverse();
				
				slices.each(function(){
					var slice = $(this);
					slice.css({ 'top': '0px' });
					if(i == settings.slices-1){
						setTimeout(function(){
							slice.animate({ height:'100%', opacity:'1.0' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
						}, (100 + timeBuff));
					} else {
						setTimeout(function(){
							slice.animate({ height:'100%', opacity:'1.0' }, settings.animSpeed);
						}, (100 + timeBuff));
					}
					timeBuff += 50;
					i++;
				});
			} 
			else if(currentEffect == 'sliceUp' || currentEffect == 'sliceUpRight' || currentEffect == 'sliceUpLeft'){
				createSlices(slider, settings, vars);
				var timeBuff = 0;
				var i = 0;
				var slices = $('.nivo-slice', slider);
				if(currentEffect == 'sliceUpLeft') slices = $('.nivo-slice', slider)._reverse();
				
				slices.each(function(){
					var slice = $(this);
					slice.css({ 'bottom': '0px' });
					if(i == settings.slices-1){
						setTimeout(function(){
							slice.animate({ height:'100%', opacity:'1.0' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
						}, (100 + timeBuff));
					} else {
						setTimeout(function(){
							slice.animate({ height:'100%', opacity:'1.0' }, settings.animSpeed);
						}, (100 + timeBuff));
					}
					timeBuff += 50;
					i++;
				});
			} 
			else if(currentEffect == 'sliceUpDown' || currentEffect == 'sliceUpDownRight' || currentEffect == 'sliceUpDownLeft'){
				createSlices(slider, settings, vars);
				var timeBuff = 0;
				var i = 0;
				var v = 0;
				var slices = $('.nivo-slice', slider);
				if(currentEffect == 'sliceUpDownLeft') slices = $('.nivo-slice', slider)._reverse();
				
				slices.each(function(){
					var slice = $(this);
					if(i == 0){
						slice.css('top','0px');
						i++;
					} else {
						slice.css('bottom','0px');
						i = 0;
					}
					
					if(v == settings.slices-1){
						setTimeout(function(){
							slice.animate({ height:'100%', opacity:'1.0' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
						}, (100 + timeBuff));
					} else {
						setTimeout(function(){
							slice.animate({ height:'100%', opacity:'1.0' }, settings.animSpeed);
						}, (100 + timeBuff));
					}
					timeBuff += 50;
					v++;
				});
			} 
			else if(currentEffect == 'fold'){
				createSlices(slider, settings, vars);
				var timeBuff = 0;
				var i = 0;
				
				$('.nivo-slice', slider).each(function(){
					var slice = $(this);
					var origWidth = slice.width();
					slice.css({ top:'0px', height:'100%', width:'0px' });
					if(i == settings.slices-1){
						setTimeout(function(){
							slice.animate({ width:origWidth, opacity:'1.0' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
						}, (100 + timeBuff));
					} else {
						setTimeout(function(){
							slice.animate({ width:origWidth, opacity:'1.0' }, settings.animSpeed);
						}, (100 + timeBuff));
					}
					timeBuff += 50;
					i++;
				});
			}  
			else if(currentEffect == 'fade'){
				createSlices(slider, settings, vars);
				
				var firstSlice = $('.nivo-slice:first', slider);
                firstSlice.css({
                    'height': '100%',
                    'width': slider.width() + 'px'
                });
				firstSlice.animate({ opacity:'1.0' }, (settings.animSpeed*2), '', function(){ slider.trigger('nivo:animFinished'); });
			}          
            else if(currentEffect == 'slideInRight'){
				createSlices(slider, settings, vars);
				
                var firstSlice = $('.nivo-slice:first', slider);
                firstSlice.css({
                    'height': '100%',
                    'width': '0px',
                    'opacity': '1'
                });

                firstSlice.animate({ width: slider.width() + 'px' }, (settings.animSpeed*2), '', function(){ slider.trigger('nivo:animFinished'); });
            }
            else if(currentEffect == 'slideInLeft'){
				createSlices(slider, settings, vars);
				
                var firstSlice = $('.nivo-slice:first', slider);
                firstSlice.css({
                    'height': '100%',
                    'width': '0px',
                    'opacity': '1',
                    'left': '',
                    'right': '0px'
                });

                firstSlice.animate({ width: slider.width() + 'px' }, (settings.animSpeed*2), '', function(){ 
                    // Reset positioning
                    firstSlice.css({
                        'left': '0px',
                        'right': ''
                    });
                    slider.trigger('nivo:animFinished'); 
                });
            }
			else if(currentEffect == 'boxRandom'){
				createBoxes(slider, settings, vars);
				
				var totalBoxes = settings.boxCols * settings.boxRows;
				var i = 0;
				var timeBuff = 0;
				
				var boxes = shuffle($('.nivo-box', slider));
				boxes.each(function(){
					var box = $(this);
					if(i == totalBoxes-1){
						setTimeout(function(){
							box.animate({ opacity:'1' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
						}, (100 + timeBuff));
					} else {
						setTimeout(function(){
							box.animate({ opacity:'1' }, settings.animSpeed);
						}, (100 + timeBuff));
					}
					timeBuff += 20;
					i++;
				});
			}
			else if(currentEffect == 'boxRain' || currentEffect == 'boxRainReverse' || currentEffect == 'boxRainGrow' || currentEffect == 'boxRainGrowReverse'){
				createBoxes(slider, settings, vars);
				
				var totalBoxes = settings.boxCols * settings.boxRows;
				var i = 0;
				var timeBuff = 0;
				
				// Split boxes into 2D array
				var rowIndex = 0;
				var colIndex = 0;
				var box2Darr = new Array();
				box2Darr[rowIndex] = new Array();
				var boxes = $('.nivo-box', slider);
				if(currentEffect == 'boxRainReverse' || currentEffect == 'boxRainGrowReverse'){
					boxes = $('.nivo-box', slider)._reverse();
				}
				boxes.each(function(){
					box2Darr[rowIndex][colIndex] = $(this);
					colIndex++;
					if(colIndex == settings.boxCols){
						rowIndex++;
						colIndex = 0;
						box2Darr[rowIndex] = new Array();
					}
				});
				
				// Run animation
				for(var cols = 0; cols < (settings.boxCols * 2); cols++){
					var prevCol = cols;
					for(var rows = 0; rows < settings.boxRows; rows++){
						if(prevCol >= 0 && prevCol < settings.boxCols){
							/* Due to some weird JS bug with loop vars 
							being used in setTimeout, this is wrapped
							with an anonymous function call */
							(function(row, col, time, i, totalBoxes) {
								var box = $(box2Darr[row][col]);
                                var w = box.width();
                                var h = box.height();
                                if(currentEffect == 'boxRainGrow' || currentEffect == 'boxRainGrowReverse'){
                                    box.width(0).height(0);
                                }
								if(i == totalBoxes-1){
									setTimeout(function(){
										box.animate({ opacity:'1', width:w, height:h }, settings.animSpeed/1.3, '', function(){ slider.trigger('nivo:animFinished'); });
									}, (100 + time));
								} else {
									setTimeout(function(){
										box.animate({ opacity:'1', width:w, height:h }, settings.animSpeed/1.3);
									}, (100 + time));
								}
							})(rows, prevCol, timeBuff, i, totalBoxes);
							i++;
						}
						prevCol--;
					}
					timeBuff += 100;
				}
			}
		}
		
		// Shuffle an array
		var shuffle = function(arr){
			for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
			return arr;
		}
        
        // For debugging
        var trace = function(msg){
            if (this.console && typeof console.log != "undefined")
                console.log(msg);
        }
        
        // Start / Stop
        this.stop = function(){
            if(!$(element).data('nivo:vars').stop){
                $(element).data('nivo:vars').stop = true;
                //trace('Stop Slider');
            }
        }
        
        this.start = function(){
            if($(element).data('nivo:vars').stop){
                $(element).data('nivo:vars').stop = false;
                //trace('Start Slider');
            }
        }
        

		this.prev = function(){
			if(vars.running) return false;
			clearInterval(timer);
			timer = '';
			vars.currentSlide -= 2;
			nivoRun(slider, kids, settings, 'prev');
			//trace('Prev Slider');
		};
		
		this.next = function(){
			if(vars.running) return false;
			clearInterval(timer);
			timer = '';
			nivoRun(slider, kids, settings, 'next');
			//trace('Next Slider');
		};

		this.getSetting = function(){
		    return settings;
		}

		this.updateOptions = function(options){
		    settings = $.extend({},settings,options);
		}
        
		if(settings.supportTouch){
			slider.touchwipe({
				wipeLeft: function() {
					slider.next();
				},
				wipeRight: function() {
					slider.prev();
				},
			});
		}

        //Trigger the afterLoad callback
        settings.afterLoad.call(this);
		
		return this;
    };
        
    $.fn.nivoSlider = function(options) {
		// this = dom object
        return this.each(function(key, value){			
            var element = $(this);
			var a =  element.data('nivoslider');
			if(a){
				a.updateOptions(options);				
				return a;
			}
            // Return early if this element already has a plugin instance
           // if (element.data('nivoslider')) return element.data('nivoslider');
            // Pass options to plugin constructor
            var nivoslider = new NivoSlider(this, options);
            // Store plugin object in this element's data
            element.data('nivoslider', nivoslider);
        });

	};

	$.fn.start = function(){
	     return this.each(function(key, value){			
            var slider = $(this).data('nivoslider');
            if(slider) slider.start();
        });
	};

	$.fn.stop = function(){
	     return this.each(function(key, value){			
            var slider = $(this).data('nivoslider');
            if(slider) slider.stop();
        });
	};

	$.fn.prev = function(){
	     return this.each(function(key, value){			
            var slider = $(this).data('nivoslider');
            if(slider) slider.prev();
        });
	};

	$.fn.next = function(){
	     return this.each(function(key, value){			
            var slider = $(this).data('nivoslider');
            if(slider) slider.next();
        });
	};
	
	//Default settings
	$.fn.nivoSlider.defaults = {
		effect: 'random',
		slices: 15,
		boxCols: 8,
		boxRows: 4,
		animSpeed: 500,
		pauseTime: 3000,
		startSlide: 0,
		directionNav: false,
		directionNavPos: 1, // 1 : inside | 2: outside
		directionNavHide: false,
		controlNavPosition: 'top', // top | bottom
		controlNavAlign: 'left', // left | center | right
		controlNavSize : 'normal', // normal | small | large
		controlNavText : false,
		controlNav: false,
		controlNavThumbs: false,
        controlNavThumbsFromRel: false,
		controlNavThumbsSearch: '.jpg',
		controlNavThumbsReplace: '_thumb.jpg',
		keyboardNav: true,
		pauseOnHover: true,
		manualAdvance: false,
		captionOpacity: 0.8,
		prevText: 'Prev',
		nextText: 'Next',
		randomStart: false,
		supportTouch:false,
		autoRun:false,
		transparent:false,
		beforeChange: function(){},
		afterChange: function(){},
		slideshowEnd: function(){},
        lastSlide: function(){},
        afterLoad: function(){}
	};
	
	$.fn._reverse = [].reverse;
	
})(jQuery);
