;
(function($){
    $.fn.hcheckbox=function(options){
        $(':checkbox ~ label',this).each(function(){
            $(this).addClass('checkbox');
            if($(this).parent().find(":checkbox").is(':disabled')==false){
               if( $(this).parent().find(":checkbox").is(':checked')){
                    $(this).addClass("checked");
                }
            }else{
                $(this).addClass('disabled');
            }
        }).click(function(event){
            if(!$(this).parent().find(":checkbox").is(':checked')){
                $(this).addClass("checked");
                $(this).parent().find(":checkbox")[0].checked = true;
            }
            else{
                $(this).removeClass('checked');			
                $(this).parent().find(":checkbox")[0].checked = false;
            }
            event.stopPropagation();
        }).parent().find(":checkbox").hide();
    }

    $.fn.hradio = function(options){
        var self = this;
      
        return $(':radio ~ label',this).each(function(){
            $(this).addClass('hRadio');
            if($(this).parent().find(":radio").is("checked")){
                 $(this).addClass('hRadio_Checked');
            }
               
        }).click(function(event){
            $(this).parent().siblings().each(function(){
                $(this).find("label").removeClass("hRadio_Checked")
            });
            if(!$(this).parent().find(":radio").is(':checked')){
                $(this).addClass("hRadio_Checked");
                $(this).parent().find(":radio")[0].checked = true;
            }
            event.stopPropagation();
        })
        .parent().find(":radio").hide();
    }

})(jQuery)