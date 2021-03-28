(function($){
    $(document).foundation();
    let config = {
        lightboxMode: 'static',
        mediaItemAdditionalDataClasses: ["media-item-caption"],
    }; //See lightbox.js for config options

    if(typeof Lightbox != "undefined"){
        lightbox = new Lightbox(config);
    }
}(frpJQ));


