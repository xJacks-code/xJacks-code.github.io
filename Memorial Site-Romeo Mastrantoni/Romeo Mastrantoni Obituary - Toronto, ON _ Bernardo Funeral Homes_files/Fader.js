var bom = bom || {};
bom.widget = bom.widget || {};

(function($){
    
    function Fader(config){
        this._init(config);
    }
    
    Fader.prototype = {
        items: null,
        itemCnt: null,
        currentItem: 0,
        delay: 3000,
        fadeInDuration: 1500,
        fadeOutDuration: 1500,
        _init: function(config){
            var me = this;
            $.extend(me,config);
            
            // this.items = $('#bom-photo-con img');
            this.items = $('#bom-photo-con .bom-photo-lazy-load'); 
            this.itemCnt = this.items.length;
            this.imageContainer = $('#bom-photo-image');

           setTimeout(function(){me.showFrame(1)}, me.delay);
        },
    
        showFrame: function(frameNumber){
         
          if(this.itemCnt == 1){
           return;
          }
         
            let transitionSpeed = 3500;
            let me = this;
            this.index = frameNumber;
            let src = null;
            if (this.index >= this.itemCnt){
                this.index = 0;
            }
            src = $(this.items[this.index]).data('src')
            
            this.imageContainer.fadeOut(transitionSpeed, function(){
                me.imageContainer.attr('src',src)
                me.preloadNextImage(me.index+1);
                    me.imageContainer.fadeIn(transitionSpeed,function(){
                        
                        setTimeout(function() {me.showFrame(me.index + 1)}, me.delay);
                    })
            });
        //  $(this.items[me.currentItem]).fadeIn(me.fadeInDuration).delay(me.delay).fadeOut(me.fadeOutDuration,function(){});
     },
     preloadNextImage: function (index){
        if (this.items[index]){
            let nextSrc = $(this.items[index]).data('src');
            $('#bom-photo-image-preload').attr('src',nextSrc) 
        }

     }
 };
 
 $(document).ready(function() {
  this.Fader = new bom.widget.Fader();
 });
 bom.widget.Fader = Fader;
 
}(frpJQ));

            
