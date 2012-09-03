/*
	jQuery Coda-Slider v2.0 - http://www.ndoherty.biz/coda-slider
	Copyright (c) 2009 Niall Doherty
	This plugin available for use in all personal or commercial projects under both MIT and GPL licenses.
*/

$(function(){
	// Remove the coda-slider-no-js class from the body
	$("body").removeClass("coda-slider-no-js");
	// Preloader
	$(".coda-slider").children('.panel').hide().end().prepend('<p class="loading">Loading...<br /><img src="images/ajax-loader.gif" alt="loading..." /></p>');
});

var sliderCount = 0;

$.fn.codaSlider = function(settings) {

	settings = $.extend({
		autoHeight: true,
		autoHeightEaseDuration:  'normal',//1000',
		autoHeightEaseFunction:  'swing',//"easeInOutExpo",
		autoSlide: false,
		autoSlideInterval: 7000,
		autoSlideStopWhenClicked: true,
		crossLinking: true,
		dynamicArrows: true,
		dynamicArrowLeftText: "&#171; left",
		dynamicArrowRightText: "right &#187;",
		dynamicTabs: true,
		dynamicTabsAlign: "center",
		dynamicTabsPosition: "top",
		externalTriggerSelector: "a.xtrig",
		firstPanelToLoad: 1,
		panelTitleSelector: "h2.title",
		slideEaseDuration: 'normal',//1000,
		slideEaseFunction: 'swing',//"easeInOutExpo",
        supportTouchMove: false  // added by wofei
	}, settings);
	
	return this.each(function(){
        sliderCount++;

		// Uncomment the line below to test your preloader
		// alert("Testing preloader");
		
		var slider = $(this);
		
		// If we need arrows
		if (settings.dynamicArrows) {
			slider.parent().addClass("arrows");
			slider.before('<div class="coda-nav-left" id="coda-nav-left-' + sliderCount + '"><a href="#">' + settings.dynamicArrowLeftText + '</a></div>');
			slider.after('<div class="coda-nav-right" id="coda-nav-right-' + sliderCount + '"><a href="#">' + settings.dynamicArrowRightText + '</a></div>');
		};
		
		var panelWidth = slider.find(".panel").width();
		var panelCount = slider.find(".panel").size();
		var panelContainerWidth = panelWidth*panelCount;
		var navClicks = 0; // Used if autoSlideStopWhenClicked = true
		
		// Surround the collection of panel divs with a container div (wide enough for all panels to be lined up end-to-end)
		$('.panel', slider).wrapAll('<div class="panel-container"></div>');
		// Specify the width of the container div (wide enough for all panels to be lined up end-to-end)
		$(".panel-container", slider).css({ width: panelContainerWidth });
		
		// Specify the current panel.
		// If the loaded URL has a hash (cross-linking), we're going to use that hash to give the slider a specific starting position...
		if (settings.crossLinking && location.hash && parseInt(location.hash.slice(1)) <= panelCount) {
			var currentPanel = parseInt(location.hash.slice(1));
			var offset = - (panelWidth*(currentPanel - 1));
			$('.panel-container', slider).css({ marginLeft: offset });
		// If that's not the case, check to see if we're supposed to load a panel other than Panel 1 initially...
		} else if (settings.firstPanelToLoad != 1 && settings.firstPanelToLoad <= panelCount) { 
			var currentPanel = settings.firstPanelToLoad;
			var offset = - (panelWidth*(currentPanel - 1));
			$('.panel-container', slider).css({ marginLeft: offset });
		// Otherwise, we'll just set the current panel to 1...
		} else { 
			var currentPanel = 1;
		};
			
		// Left arrow click
		$("#coda-nav-left-" + sliderCount + " a").bind("click",goLastOne);

		function goLastOne(){
			if (currentPanel == 1) {
				offset = 0 + 50;
				currentPanel = 1;
				alterPanelHeight(0);				
				$('.panel-container', slider).animate({ marginLeft: offset}, settings.slideEaseDuration, settings.slideEaseFunction);
				$('.panel-container', slider).animate({ marginLeft: offset- 50}, settings.slideEaseDuration, settings.slideEaseFunction);
			} else {
				navClicks++;
				currentPanel -= 1;
				alterPanelHeight(currentPanel - 1);
				offset = - (panelWidth*(currentPanel - 1));
				slider.siblings('.coda-nav').find('a.current').removeClass('current').parent().prev().find('a').addClass('current');
				$('.panel-container', slider).animate({ marginLeft: offset }, settings.slideEaseDuration, settings.slideEaseFunction);
			};
			
			if (settings.crossLinking) { location.hash = currentPanel }; // Change the URL hash (cross-linking)
			return false;
		}
			
		// Right arrow click
		$('#coda-nav-right-' + sliderCount + ' a').bind("click",goNextOne);

		 function goNextOne(){

			if (currentPanel == panelCount) {				
                offset = - (panelWidth*(panelCount - 1)) - 50;
				alterPanelHeight(panelCount - 1);
				currentPanel = panelCount;				
				$('.panel-container', slider).animate({ marginLeft: offset}, settings.slideEaseDuration, settings.slideEaseFunction);
                $('.panel-container', slider).animate({ marginLeft: offset + 50}, settings.slideEaseDuration, settings.slideEaseFunction);
			} else {
				navClicks++;
				offset = - (panelWidth*currentPanel);
				alterPanelHeight(currentPanel);
				currentPanel += 1;
				slider.siblings('.coda-nav').find('a.current').removeClass('current').parent().next().find('a').addClass('current');
				$('.panel-container', slider).animate({ marginLeft: offset}, settings.slideEaseDuration, settings.slideEaseFunction);
			};		

			if (settings.crossLinking) { location.hash = currentPanel }; // Change the URL hash (cross-linking)
			return false;
		}
		
		// If we need a dynamic menu
		if (settings.dynamicTabs) {
			var dynamicTabs = '<div class="coda-nav" id="coda-nav-' + sliderCount + '"><ul></ul></div>';
			switch (settings.dynamicTabsPosition) {
				case "bottom":
					slider.parent().append(dynamicTabs);
					break;
				default:
					slider.parent().prepend(dynamicTabs);
					break;
			};
			ul = $('#coda-nav-' + sliderCount + ' ul');
			// Create the nav items
			$('.panel', slider).each(function(n) {
				ul.append('<li class="tab' + (n+1) + '"><a href="#' + (n+1) + '">' + $(this).find(settings.panelTitleSelector).text() + '</a></li>');												
			});
			navContainerWidth = slider.width() + slider.siblings('.coda-nav-left').width() + slider.siblings('.coda-nav-right').width();

			switch (settings.dynamicTabsAlign) {
				case "center":
					ul.css({ width: ($("li", ul).width() + 2) * panelCount });
					break;
				case "right":
					ul.css({ float: 'right' });
					break;
			};
		};
			
		// If we need a tabbed nav
		$('#coda-nav-' + sliderCount + ' a').each(function(z) {
			// What happens when a nav link is clicked
			$(this).bind("click", function() {				
				navClicks++;
				$(this).addClass('current').parents('ul').find('a').not($(this)).removeClass('current');
				offset = - (panelWidth*z);
				alterPanelHeight(z);
				currentPanel = z + 1;
				$('.panel-container', slider).animate({ marginLeft: offset}, settings.slideEaseDuration, settings.slideEaseFunction);

				if (!settings.crossLinking) { return false }; // Don't change the URL hash unless cross-linking is specified

			});
		});
		
		// External triggers (anywhere on the page)
		$(settings.externalTriggerSelector).each(function() {
			// Make sure this only affects the targeted slider
			if (sliderCount == parseInt($(this).attr("rel").slice(12))) {
				$(this).bind("click", function() {
					
					navClicks++;
					targetPanel = parseInt($(this).attr("href").slice(1));
					offset = - (panelWidth*(targetPanel - 1));
					alterPanelHeight(targetPanel - 1);
					currentPanel = targetPanel;
					// Switch the current tab:
					slider.siblings('.coda-nav').find('a').removeClass('current').parents('ul').find('li:eq(' + (targetPanel - 1) + ') a').addClass('current');
					// Slide
					$('.panel-container', slider).animate({ marginLeft: offset}, settings.slideEaseDuration, settings.slideEaseFunction);

					if (!settings.crossLinking) { return false }; // Don't change the URL hash unless cross-linking is specified
				});
			};
		});
			
		// Specify which tab is initially set to "current". Depends on if the loaded URL had a hash or not (cross-linking).
		if (settings.crossLinking && location.hash && parseInt(location.hash.slice(1)) <= panelCount) {
			$("#coda-nav-" + sliderCount + " a:eq(" + (location.hash.slice(1) - 1) + ")").addClass("current");
		// If there's no cross-linking, check to see if we're supposed to load a panel other than Panel 1 initially...
		} else if (settings.firstPanelToLoad != 1 && settings.firstPanelToLoad <= panelCount) {
			$("#coda-nav-" + sliderCount + " a:eq(" + (settings.firstPanelToLoad - 1) + ")").addClass("current");
		// Otherwise we must be loading Panel 1, so make the first tab the current one.
		} else {
			$("#coda-nav-" + sliderCount + " a:eq(0)").addClass("current");
		};
		
		// Set the height of the first panel
		if (settings.autoHeight) {
			panelHeight = $('.panel:eq(' + (currentPanel - 1) + ')', slider).height();
			slider.css({ height: panelHeight });
		};
		
		// Trigger autoSlide
		if (settings.autoSlide) {
			slider.ready(function() {
				setTimeout(autoSlide,settings.autoSlideInterval);
			});
		};
		
		function alterPanelHeight(x) {
			if (settings.autoHeight) {
				panelHeight = $('.panel:eq(' + x + ')', slider).height()
				slider.animate({ height: panelHeight }, settings.autoHeightEaseDuration, settings.autoHeightEaseFunction);
			};
		};
		
		function autoSlide() {
			if (navClicks == 0 || !settings.autoSlideStopWhenClicked) {
				if (currentPanel == panelCount) {
					var offset = 0;
					currentPanel = 1;
				} else {
					var offset = - (panelWidth*currentPanel);
					currentPanel += 1;
				};
				alterPanelHeight(currentPanel - 1);
				// Switch the current tab:
				slider.siblings('.coda-nav').find('a').removeClass('current').parents('ul').find('li:eq(' + (currentPanel - 1) + ') a').addClass('current');
				// Slide:
				$('.panel-container', slider).animate({ marginLeft: offset }, settings.slideEaseDuration, settings.slideEaseFunction);
				setTimeout(autoSlide,settings.autoSlideInterval);

			};
		};
		

		// add by wofei
		if(settings.supportTouchMove){

            // add mask div			
			var dynamicMask = '<div class="coda-slider-mask" id="coda-slider-mask-' + sliderCount + '" style="position:absolute;left:0px; top:0px;width:100%;height:100%;z-index=1000;"></div>';
            slider.append(dynamicMask);
			
			var draging = false;
			var marginleft=0;
			var startLeft =0 ,endLeft; 
			var startX,startY;  
			var point={X:0,Y:0};
			var currentIndex=0;
			var direction=0;
			var movepx = 0;
			
			var clearEvent = function(){ }
			

			//========================  Mouse Events ================================
			var startDrag = function(event)
			{
				event.preventDefault();
				if(!draging){
					//event.preventDefault();
					//startLeft = $(this).offset().left;
					
					startX = event.pageX;
					$(this)
					.stop(true, false)
					.mousemove(moveDrag)
					.css('cursor','move'); 
					;                       
					
					draging=true;
				} 
				return false;
			}
			
			var moveDrag = function(event){
				
				event.preventDefault();
				if(draging){
					movepx=event.pageX-startX;
					endLeft= startLeft+movepx;				
					$('.panel-container', slider).css("marginLeft", - (panelWidth*(currentPanel-1)-endLeft) );                       
				}
				return false;
			}
			
			var endDrag = function(event){				
				event.preventDefault();

				if(draging){
					$("#coda-slider-mask-" + sliderCount, slider).unbind("mousemove",moveDrag).css('cursor','auto'); 
                  
					if(movepx>0 && movepx>=(panelWidth/10) && currentPanel > 1){
						direction=1;
					}
					else if (movepx<0 && Math.abs(movepx)>=(panelWidth/10) && currentPanel < panelCount){
						direction=-1;
					}
					
					if(direction == 1){					
						goLastOne();//$("#coda-nav-left-" + sliderCount + " a").click();
					}else if(direction == -1){
						goNextOne();//$("#coda-nav-right-" + sliderCount + " a").click();
					}else{
						$('.panel-container', slider).animate({marginLeft: - (panelWidth*(currentPanel-1))},settings.slideEaseDuration, settings.slideEaseFunction);
					}
                    direction=0;
					draging=false;

				}
				return true;

			}//  Mouse Events End 
             
			//========================  Touch Events ================================
			var startTouch = function(event)
			{
				event.preventDefault();
				var touch=event.originalEvent.touches[0]||event.originalEvent.changedTouches[0];
				if(!draging){
					//startLeft = $(this).offset().left;					
					startX = touch.pageX;
					$(this)
					.stop(true, false)				
					.bind("touchmove",moveTouch)
					.css('cursor','move'); 
					;                       
					
					draging=true;
				} 
				return false;
			}

			var moveTouch = function(event){				
				event.preventDefault();
				var touch=event.originalEvent.touches[0]||event.originalEvent.changedTouches[0];
				if(draging){

					movepx=touch.pageX-startX;
					endLeft= startLeft+movepx;				
					$('.panel-container', slider).css("marginLeft", - (panelWidth*(currentPanel-1)-endLeft));                       
				}

				return false;
			}
			

			var endTouch = function(event){				
				event.preventDefault();

				if(draging){
					$("#coda-slider-mask-" + sliderCount ,slider).unbind("touchmove",moveTouch).css('cursor','auto'); 

					if(movepx>0 && movepx>=(panelWidth/10) && currentPanel > 1){
						direction=1;
					}
					else if (movepx<0 && Math.abs(movepx)>=(panelWidth/10) && currentPanel < panelCount){
						direction=-1;
					}
					
					if(direction == 1){					
						goLastOne();//$("#coda-nav-left-" + sliderCount + " a").click();
					}else if(direction == -1){
						goNextOne();//$("#coda-nav-right-" + sliderCount + " a").click();
					}else{
						$('.panel-container', slider).animate({marginLeft: - (panelWidth*(currentPanel-1))},settings.slideEaseDuration, settings.slideEaseFunction);
					}
                    direction=0;
					draging=false;

				}
				return true;

			}// Touch Events  End
			
			$("#coda-slider-mask-"+sliderCount, slider).bind("mousemove",function(e){
				point.X = e.pageX;
				point.Y = e.pageY;					
			}).bind("mouseup",endDrag);
			
			
			$("#coda-slider-mask-"+sliderCount, slider).bind("mousedown",startDrag)
			.bind("click",clearEvent)
			.bind("mouseup",endDrag).bind("mouseout",endDrag);


			$("#coda-slider-mask-" + sliderCount, slider)
				.bind("touchstart",startTouch)
				.bind("touchend",endTouch);
				//.bind("touchmove",moveTouch);
		}
		
		// Kill the preloader
		$('.panel', slider).show().end().find("p.loading").remove();
		slider.removeClass("preload");
		
	});
};