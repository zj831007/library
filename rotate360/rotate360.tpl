<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link  href="{temp_dictionary}css/style.css" rel="stylesheet" type="text/css" />
    <script src="{temp_dictionary}prototype.js" type="text/javascript" charset="utf-8"></script>
    <script src="{temp_dictionary}browserdetect.js" type="text/javascript" charset="utf-8"></script>
    <script src="{temp_dictionary}vr.js" type="text/javascript" charset="utf-8"></script>
    <script type="text/javascript">
    threeSixty = {
    	init: function() {	
        	this._vr = new AC.VR('viewer', '{r_file}', {r_number}, {invert:{r_invert},infiniteAxis: {r_infiniteAxis},mobileTotalFrames:{r_mobileTotalFrames}} );
    	},
   		
	didShow: function() {
        	this.init();
    	},
    
	willHide: function() {
        	recycleObjectValueForKey(this, "_vr");
    	},
   
   	shouldCache: function() {
        	return false;
    	}
    }

    if (!window.isLoaded) {
	Event.observe(window, 'load', function() {
	    threeSixty.init();
		if("{r_display}" == "none"){
			var container = document.getElementById("container");				
			Event.observe(container, 'click', clickMe.bindAsEventListener());
			var div = document.createElement("div");
			div.setAttribute('id',"div_link");
			var img = document.createElement("img");
			img.src = '{l_file}';
			div.appendChild(img);
			Event.observe(img, 'click', showRotate.bindAsEventListener());
			container.appendChild(div);
		}
	}); 
    }
	
	function BlockMove(event) {   
		// Tell Safari not to move the window.   
		event.preventDefault() ;  
	}
	
	function clickMe(event){
		var id = Event.element(event).getAttribute("id");		
		if("container" == id){
			document.getElementById('viewer').style.display='none';
		}	
	}

	function showRotate(event){
         document.getElementById('viewer').style.display='';
		 event.preventDefault();
	}
    </script>
<style type="text/css">
<!--
#container{
	width:{b_width}px ;
	height:{b_height}px;
	background:url({b_File}) no-repeat scroll center center #fff;
	position:relative;
}
#viewer{
	top:{r_top}px;
	left:{r_left}px; 
	width:{r_width}px;
	height:{r_height}px; 
}
.icon{
	background : url({temp_dictionary}arrow.png) no-repeat scroll 0 0  rgba({icon_r}, {icon_g},{icon_b}, 1);
}
#div_link {
    position:absolute;
	left:{l_left}px;
	top:{l_top}px; 
	z-index:1;	
}
-->
</style></head>
<body>
<div id="container">
     <div id="viewer" style="display:{r_display};"></div>
</div>
</body>
</html>