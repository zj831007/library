(function ($) {
    $.fn.extend({
        //plugin name
        chdp_gravity: function (options) {

            //deafault settings
            var defaults = {

            };

            var options = $.extend(defaults, options);

            return this.each(function () {
                var o = options;
                var obj = $(this);			
				var xVal,yVal = 0;
				var xBool, yBool = true;

				var mouse = { start : {}},
					touch = document.ontouchmove !== undefined,
					viewport = {
						x: 0, 
						y: 0, 
						el: $('.cube',obj)[0],
						move: function(coords) {
							if(coords) {
								if(typeof coords.x === "number") this.x = coords.x;
								if(typeof coords.y === "number") this.y = coords.y;
							}
						    this.el.style.webkitTransform = "rotateX("+this.x+"deg) rotateY("+this.y+"deg)"; 
 
						},
						reset: function() {
							this.move({x: 0, y: 0});
						}
					};
					
				viewport.duration = function() {
					var d = touch ? 1000 : 500;
					viewport.el.style.webkitTransitionDuration = d + "ms";
					return d;
				}();
				var start = 0;
				$(window).bind("devicemotion", function(){
				//window.ondevicemotion = function(event) {
					start += event.interval;
					if(start.toFixed(2) > 0.5){
						if(window.innerWidth > window.innerHeight){
							xVal = Math.round(event.accelerationIncludingGravity.x);
							yVal = Math.round(-event.accelerationIncludingGravity.y);
						}else{
							xVal = Math.round(event.accelerationIncludingGravity.y);
							yVal = Math.round(event.accelerationIncludingGravity.x);
						}
						 
						if(Math.abs(xVal) > 3){
							if(xBool){								
								viewport.move({x: viewport.x + (xVal>0? 90 : -90)});
								xBool = false;
							}
						}else{
							xBool = true;
						}
						
						if(Math.abs(yVal) > 3){
							if(yBool){
							    viewport.move({y: viewport.y + (yVal>0? 90 : -90)});
    							yBool = false;
							}
						}else{
							yBool = true;
						}
					 }					
				});

				$(obj).bind('mousedown touchstart', function(evt) {
					delete mouse.last;
					if($(evt.target).is('a, iframe')) {
						return true;
					}
					
					evt.originalEvent.touches ? evt = evt.originalEvent.touches[0] : null;
					mouse.start.x = evt.pageX;
					mouse.start.y = evt.pageY;
					$(obj).bind('mousemove touchmove', function(event) {
						// Only perform rotation if one touch or mouse (e.g. still scale with pinch and zoom)
						if(!touch || !(event.originalEvent && event.originalEvent.touches.length > 1)) {
							event.preventDefault();
							// Get touch co-ords
							event.originalEvent.touches ? event = event.originalEvent.touches[0] : null;
							if(Math.abs(event.pageX - mouse.start.x) > 30 || Math.abs(event.pageY - mouse.start.y) > 30)
								  $(obj).trigger('move-viewport', {x: event.pageX, y: event.pageY});
							//event.stopPropagation();
						}			
					});	
					
					$(obj).bind('mouseup touchend', function () {
						$(obj).unbind('mousemove touchmove');
					});
				});
				
				$(obj).bind('move-viewport', function(evt, movedMouse) {
				
					// Reduce movement on touch screens
					var movementScaleFactor = touch ? 2 : 1;
					
					if (!mouse.last) {
						mouse.last = mouse.start;
					} else {
						if (forward(mouse.start.x, mouse.last.x) != forward(mouse.last.x, movedMouse.x)) {
							mouse.start.x = mouse.last.x;
						}
						if (forward(mouse.start.y, mouse.last.y) != forward(mouse.last.y, movedMouse.y)) {
							mouse.start.y = mouse.last.y;
						}
					}
					
					viewport.move({
						x: viewport.x + parseInt((mouse.start.y - movedMouse.y)/movementScaleFactor),
						y: viewport.y - parseInt((mouse.start.x - movedMouse.x)/movementScaleFactor)
					});
					
					mouse.last.x = movedMouse.x;
					mouse.last.y = movedMouse.y;		
						
					function forward(v1, v2) {
						return v1 >= v2 ? true : false;
					}
				});

            });
        }
    });
})(jQuery);// JavaScript Document