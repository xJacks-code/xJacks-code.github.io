(function($){

    function PhotographicMemoriesController(config){
        this._init(config);
    }

    PhotographicMemoriesController.prototype = {
        _init: function(config){
            let me = this;
            $.extend(me,config);
            this._initEvents();
        },
        _initEvents: function(){

            this.loop = null;
            this.imageContainer = $('#photo-mem-image');
            this.imageContainerUpNext = $('#photo-mem-image-upnext');
            this.loader = $('.loading-gif');
            this.photos = $('.photo-mem-holder');
            this.registerClickHandlers(this);
            this.showFirstImage();
            
        },
        registerClickHandlers: function(me){

            let transitionSpeed = 3000; //in ms
            
            $('.photo-mem-prev-btn').on('click',function(){
                me.prevClicked(transitionSpeed);
            })
            $('.photo-mem-next-btn').on('click',function(){
                me.nextClicked(transitionSpeed);
            })
            
            $('#photo-mem-close').on('click',function(e) {
                me.stopMusic(e,me)
                me.showFirstImage()
            });
            $('#audio-player').on('playing', function(e) {
                me.audioPlaying(e,me);
            })
            $('#audio-player').on('pause', function(e) {
                me.audioPlaying(e,me)
            })
            $('#audio-player').on('ended', function(e) {
                me.ended(e,me)
            })
            $('#photo-mem-image').on('load', function(e) {
                me.imageLoaded(transitionSpeed);
            })
            
            $(".photographicMemories-link").on('click', function(e) {
               me.startMusic(e,me);
            })
        },
        showFirstImage: function(){
            this.imageContainer.data('current-photo-id',0)
            let firstSource = $('.photo-mem-holder').first().data('src');
            this.imageContainer.attr('src',firstSource)
            this.imageContainer.show();
            
            let upNext = $('.photo-mem-holder')[1] || null;
            this.imageContainerUpNext.attr('src',$(upNext).data('src'))            
            
        },
        audioPlaying: function(event,me){
            if (event.type == 'playing'){
                me.photoMemLoop(true,me);
            }else {
                me.photoMemLoop(false,me);
            }        
        },
        ended: function(event,me){
            //me.photoMemLoop(false,me);
            let audio = document.getElementById('audio-player');
            audio.currentTime = 0; 
            audio.play(); 
        
        },
        
        startMusic: function(event, me){
            me.photoMemLoop(true,me)
            let audio = document.getElementById('audio-player');
            audio.play();            
        },
        
        stopMusic: function(event,me){
            
            me.photoMemLoop(false,me)
            let audio = document.getElementById('audio-player');
            audio.pause();
            audio.currentTime = 0;            
        
        },
        photoMemLoop: function(doLoop,me){

            let transitionSpeed = 9000;
            //console.log("Transition Speed: " + transitionSpeed);
            if (doLoop){
            me.loop = setInterval(function() {
                    $('.photo-mem-next-btn').trigger('click');
                }, transitionSpeed);
            }
            else {
                clearInterval(me.loop);
            }
        },
        
            
        
        prevClicked: function(transitionSpeed){
            let me = this;
            let currentIndex = me.imageContainer.data('current-photo-id')
            let numPhotos = me.photos.length;
            let indexToShow = currentIndex <= 0 ? numPhotos-1 : currentIndex - 1;
            let newSrc = null;
            
            me.imageContainer.fadeOut(transitionSpeed,function(){
                me.photos.each(function(index) {
                    if (indexToShow == index){
                        newSrc = $(this).data('src');
                        if (me.imageContainerUpNext.complete == false){
                            me.showLoader(true,null);
                        }
                        me.imageContainer.attr('src',newSrc)
                        me.imageContainer.data('current-photo-id',indexToShow)
                    }
                })
                me.imageContainer.fadeIn(transitionSpeed);
            })
        },
        nextClicked: function(transitionSpeed){
            
            let me = this;
            let currentIndex = me.imageContainer.data('current-photo-id')
            let numPhotos = me.photos.length;
            let indexToShow = currentIndex >= numPhotos-1 ? 0 : currentIndex + 1;
            let newSrc = null;
            
            me.imageContainer.fadeOut(transitionSpeed,function(){
                me.photos.each(function(index) {
                    if (indexToShow == index){
                        newSrc = $(this).data('src');
                        if (me.imageContainerUpNext.complete == false){
                            me.showLoader(true,null);
                        }
                        me.imageContainer.attr('src',newSrc);
                        me.imageContainer.data('current-photo-id',indexToShow)
                        me.preloadNextImage(indexToShow+1,numPhotos)
                    }
                })
                
            })
            
        },
        showLoader: function(show,callback){
            show ? $(this.loader).fadeIn(200,callback) :$(this.loader).fadeOut(200,callback);
        },
        imageLoaded: function(transitionSpeed){
            let me = this;
            this.showLoader(false,function() {
                me.imageContainer.fadeIn(transitionSpeed);
            });            
        },
        preloadNextImage: function (nextIndex,numPhotos){
            if (nextIndex < numPhotos){
                let upNext = $('.photo-mem-holder')[nextIndex] || null;
                this.imageContainerUpNext.attr('src',$(upNext).data('src')) 
            }

        }
    
    }
    BOMPhotoMemoriesCtrl = PhotographicMemoriesController;


}(frpJQ));

var controller = null;
frpJQ(document).ready(function(){
    var config = {};
    controller = new BOMPhotoMemoriesCtrl(config);
});


