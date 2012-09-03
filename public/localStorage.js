/**
 * 本地存储插件，命名空间localStorage,
 * 调用方法： $.localStorage.saveData(....
 */

(function($){
    jQuery.localStorage = {

        saveData:function (key,data){
            if(checkLocalStorageSupport())
            {
                window.localStorage.setItem(key,data);
            }
        },

        loadData:function (key){
            if(checkLocalStorageSupport())
            {
                var data = window.localStorage.getItem(key);
                if(data != null)
                {
                    return data;  
                }         
            }
        },

        clearData:function (){
            if(checkLocalStorageSupport())
            {
                window.localStorage.clear();    
            }
        }
    };
    /*
     * 此函数不在闭包中，因此为私有函数，不能在命名空间中调用。
     */
    function checkLocalStorageSupport () {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    }
})(jQuery);
            
            
