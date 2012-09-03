(function(){
    if(!window.JS){
        window['JS'] = {}
    }
    var addEvent = function( obj, type, fn ) {
        if (obj.addEventListener)
            obj.addEventListener( type, fn, false );
        else if (obj.attachEvent) {
            obj["e"+type+fn] = fn;
            obj.attachEvent( "on"+type, function() {
                obj["e"+type+fn]();
            } );
        }
    };
    var onReady = function(loadEvent,waitForImages) {
        return addEvent(window, 'load', loadEvent);      
    }
    JS.onReady = onReady;
})()

var Chidopi = {};
Chidopi.JS = {};

Chidopi.Device = {   
	detect: function(key) {
		if(this['_'+key] === undefined) {
			this['_'+key] = navigator.userAgent.match(new RegExp(key, 'i'));
		}
		return this['_'+key];
	},
	iPhone: function() {
		return this.detect('iPhone') ;
	},
	iPad: function(){
		return this.detect('iPad');
	},
	android: function() {
		return this.detect('Android');
	},
	webOS: function() {
		return this.detect('webOS');
	},
	windowsPhone : function(){
		return this.detect('Windows Phone');
	}
}; 