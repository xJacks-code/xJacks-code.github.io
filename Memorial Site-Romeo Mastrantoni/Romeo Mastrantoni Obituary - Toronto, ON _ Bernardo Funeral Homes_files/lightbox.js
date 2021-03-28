//Lightbox.js
/**
 * @description 
 * @author CL
 * @summary Read the incldued README.html file to understand how to implement this in your project.(Open in broswer)
 */

// TODO:  24745 - IE cannot open Lightbox.  says "Lightbox is undefined" since 'class' is not valid in IE.
class Lightbox {

    /** 
     * @method constructor Class constructor
     * @param {object} [config] - Lightbox config object : Empty object by default
     */
    constructor(config = {}) {

        this.static = 'static';
        this.dynamic = 'dynamic';
        this.imageType = 'image';
        this.videoType = 'video';
        this.lightboxMediaItemMap = new Map();
        this.config = this.setConfig(config);
        this.lightbox = this.createLightbox();
        this.cacheLightbox();
        this.loadFontAwesome();
        this.registerClickEvents();       
    }

    /** 
     * @method setConfig
     * @description Set the configuration for the lightbox and use any user defined settings over the defaults
     * @param {object} userConfig - User defined configuration
     * @returns config :The combination of user defined config settings and defaults as an object
     */
    setConfig(userConfig) {
        let config = {
            lightboxMode: userConfig.lightboxMode || this.static,
            lightboxDefaultImage: userConfig.lightboxDefaultImage || "default-image-here.jpg",
            lightboxDefaultVideo: userConfig.lightboxDefaultVideo || "default-video-here.png",
            fontAwesomeUrl: userConfig.fontAwesomeUrl || "https://use.fontawesome.com/releases/v5.3.1/css/all.css",
            lightboxClass: userConfig.lightboxClass || "lightbox",
            innerLightboxContainerClass: userConfig.innerLightboxContainerClass || "lightbox-inner-container",
            lightboxCloseButtonClasses: userConfig.lightboxCloseButtonClasses ||[ "fas","fa-close","fa-times","lightbox-close-button",],
            lightboxLeftArrowClasses: userConfig.lightboxLeftArrowClasses || ["fas", "fa-angle-left","lightbox-left-arrow"],
            lightboxRightArrowClasses: userConfig.lightboxRightArrowClasses || ["fas", "fa-angle-right","lightbox-right-arrow"],
            lightboxMediaElementContainerClass: userConfig.lightboxMediaElementContainerClass || "lightbox-media-element-container",
            lightboxMediaElementClass: userConfig.lightboxMediaElementClass || "lightbox-media-element",
            lightboxMediaElementImageClass: userConfig.lightboxMediaElementImageClass || "lightbox-media-image-element",
            lightboxMediaElementVideoClass: userConfig.lightboxMediaElementVideoClass || "lightbox-media-video-element",
            lightboxMediaAdditionalDataContainer: userConfig.lightboxMediaAdditionalDataContainer || "lightbox-media-additional-data-container",
            lightboxMediaAdditionalDataClasses: this.getPrefixedClassesForAdditionalData(userConfig),
            mediaSectionContainerClass: userConfig.mediaSectionContainerClass || "media-section-container",
            mediaItemClass : userConfig.mediaItemClass || "media-item-container",
            mediaItemContentClass : userConfig.mediaItemContentClass || "media-item-content",
            mediaItemAdditionalDataContainer : userConfig.mediaItemAdditionalDataContainer || "media-item-additional-data-container",            
            mediaItemAdditionalDataClasses : userConfig.mediaItemAdditionalDataClasses || [],            
        };
        return config;
    }

    /** 
     * @method getPrefixedClassesForAdditionalData
     * @description Loop over the mediaItemAdditionalDataClasses and append 'lightbox' to the front and return a new array. 
    */
    getPrefixedClassesForAdditionalData(userConfig){
        let classes = [];
        if (userConfig.mediaItemAdditionalDataClasses){

            //for (const className of userConfig.mediaItemAdditionalDataClasses) {
            for (var i=0; i<userConfig.mediaItemAdditionalDataClasses.length; i++) {
                var className = userConfig.mediaItemAdditionalDataClasses[i];               
                classes.push('lightbox-' + className);
            }
        }
        return classes;
   }
    /** 
     * @method createLightbox
     * @description Appends the necessary lightbox html to the dom. 
     * @returns lightbox : The appended Lightbox section element
     */
    createLightbox() {
        let lightbox = document.createElement('section');
        lightbox.classList.add(this.config.lightboxClass);

        let innerLightboxContainer = document.createElement('section');
        innerLightboxContainer.classList.add(this.config.innerLightboxContainerClass)

        let lightBoxCloseButton = document.createElement('div');
        lightBoxCloseButton.setAttribute('id','lightbox-close-button');
        //for (const className of this.config.lightboxCloseButtonClasses) {
         for (var i=0; i<this.config.lightboxCloseButtonClasses.length; i++) {
             var className = this.config.lightboxCloseButtonClasses[i];          
            lightBoxCloseButton.classList.add(className)
        }

        let leftArrow = document.createElement('div');
        leftArrow.setAttribute('id','lightbox-left-arrow');
        //for (const className of this.config.lightboxLeftArrowClasses) {
         for (var i=0; i<this.config.lightboxLeftArrowClasses.length; i++) {
             var className = this.config.lightboxLeftArrowClasses[i];        
                leftArrow.classList.add(className)
        }

        let rightArrow = document.createElement('div');
        rightArrow.setAttribute('id','lightbox-right-arrow');
        //for (const className of this.config.lightboxRightArrowClasses) {
         for (var i=0; i<this.config.lightboxRightArrowClasses.length; i++) {
             var className = this.config.lightboxRightArrowClasses[i];          
            rightArrow.classList.add(className)
        }

        let mediaElementContainer = document.createElement('section');
        mediaElementContainer.classList.add(this.config.lightboxMediaElementContainerClass)

        let mediaImage = document.createElement('img');
        mediaImage.classList.add(this.config.lightboxMediaElementImageClass);
        mediaImage.setAttribute('hidden',true);
        
        let mediaVideo = document.createElement('video');
        mediaVideo.classList.add(this.config.lightboxMediaElementVideoClass);
        mediaVideo.setAttribute('hidden',true);
        mediaVideo.setAttribute('controls',true);
        mediaVideo.autoplay = false;

        
        
        let mediaAdditionalDataContainer = document.createElement('section');
        mediaAdditionalDataContainer.classList.add(this.config.lightboxMediaAdditionalDataContainer);
        //for (const className of this.config.lightboxMediaAdditionalDataClasses) {
         for (var i=0; i<this.config.lightboxMediaAdditionalDataClasses.length; i++) {
             var className = this.config.lightboxMediaAdditionalDataClasses[i];           
            let tempElement = document.createElement('section');
            tempElement.classList.add(className);
            mediaAdditionalDataContainer.appendChild(tempElement);
        }
        

        mediaElementContainer.appendChild(mediaImage);
        mediaElementContainer.appendChild(mediaVideo);

        innerLightboxContainer.appendChild(mediaElementContainer);
        innerLightboxContainer.appendChild(mediaAdditionalDataContainer);

        lightbox.appendChild(innerLightboxContainer);
        lightbox.appendChild(leftArrow);
        lightbox.appendChild(rightArrow);
        lightbox.appendChild(lightBoxCloseButton);

        document.body.appendChild(lightbox);
        return lightbox;
    }

    /** 
     * @method cacheLightbox
     * @description Cache the lightbox at *this* moment
    */
   cacheLightbox(){
       this.lightboxClean = this.lightbox;
    }
    
    /** 
    * @method getCleanLightbox
    * @description return the clean (cahced) lightbox element
    */
    getCleanLightbox(){
        return this.lightboxClean;
    }

    /** 
     * @method loadFontAwesome
     * @description Check the currently loaded style sheets for font awesome, and when not found load our version. 
     * @returns fontAwesomeLoaded : If fontAwesome is loaded -- should always be true
     * @todo Could pass in a list of key value pairs url => keywords and load any css file with a regex for the keywords. 
     */
    loadFontAwesome() {
        let fontAwesomeLoaded = false;
        let regex = /(font-awesome|fontawesome|font_awesome)/gi;

        //Look for font awesome in stylesheet href's
        //for (const sheet of document.styleSheets) {
        for (var i in document.styleSheets) {
            var sheet = document.styleSheets[i];
            if (sheet['href']) {
                if (sheet['href'].match(regex)){

                    fontAwesomeLoaded = true;
                }
            }
        }

        //create the link and append to head
        if (fontAwesomeLoaded == false) {
            let link = document.createElement('link');
            link.href = this.config.fontAwesomeUrl;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            document.getElementsByTagName('head')[0].appendChild(link);
            fontAwesomeLoaded = true;
        }
        return fontAwesomeLoaded;
    }
    
    /** 
     * @method registerClickEvents
     * @description Add click listeners to our elements
     */
    registerClickEvents() {
      
        console.log("register clicks");
        
        this.mediaSectionClickEvents();
        this.lightboxArrowsClickEvents();
        this.lightboxCloseButtonClickEvent()
    }

/** 
     * @method mediaSectionClickEvents
     * @description Add click listeners to our elements
     */
    mediaSectionClickEvents() {
        let mediaContainers = $(document).find("." + this.config.mediaSectionContainerClass);
        //for (const element of mediaContainers) {
        for (var i=0; i<mediaContainers.length; i++) {
            var element = mediaContainers[i];         
         
            //element.addEventListener('click',(event) => {
            var me = this;
            $(element).on('click', function(event){
                event.stopPropagation();
                let indexToShow = $(event.target).data('lightbox-index');
                if (me.config.lightboxMode == me.static){                    
                    let mediaContainer = $(event.target).closest('.' + me.config.mediaSectionContainerClass); //add a . for class specificty
                    me.prepareForStaticLightbox(mediaContainer,indexToShow)
                }else if(me.config.lightboxMode == me.dynamic){
                    me.prepareForDynamicLightbox(indexToShow)
                }else {
                    console.log(`Lightbox Mode not set properly. Cannot use mode: ${me.config.lightboxMode}`);
                }                
            });
        }
    }

    /** 
     * @method lightboxArrowsClickEvents
     * @description Set the click events for the lightbox arrows
    */
    lightboxArrowsClickEvents(){
         var me = this;
         $(document).find(`#lightbox-left-arrow`).on('click', function(event) {
             event.stopPropagation();
             me.changeImage(-1)
         })
         
         $(document).find(`#lightbox-right-arrow`).on('click', function(event) {
             event.stopPropagation();
             me.changeImage(1)
         })
    }
    /** 
     * @method lightboxCloseButtonClickEvent
     * @description Set the click events for the lightbox close button
    */
   lightboxCloseButtonClickEvent(){
       var me = this;
       
        $(document).find(`#lightbox-close-button`).on('click', function(event) {
            me.showLightbox(false);
        });       
         
    }
    changeImage(direction) {
        
        let currIndex = $(this.lightbox).data('current-index');
        let newIndex = parseFloat(currIndex) + parseFloat(direction);
        
        if(currIndex == $(this.lightbox).data('num-media-items') -1 && direction == 1){
            newIndex = 0;
        }
        else if(currIndex == 0 && direction == -1){
            newIndex = $(this.lightbox).data('num-media-items') -1;
        }

        if (this.lightboxMediaItemMap.has(newIndex)){
            this.renderImageToLightbox(newIndex);
        }        
    }
   
            
    /** 
     * @method prepareMediaItemsForLightbox
     * @description 
     */
    prepareForStaticLightbox(mediaContainer,indexToShow) {

        let mediaItems = $(mediaContainer).find("." + this.config.mediaItemClass);
        $(this.lightbox).data('num-media-items', mediaItems.length);
        
        //for (const item of mediaItems) {
        for (var i=0; i<mediaItems.length; i++) {
            var item = mediaItems[i];
            
            //let contentItem = item.querySelector(`.${this.config.mediaItemContentClass}`)
            let contentItem = $(item).find('.' + this.config.mediaItemContentClass);
            //let lightboxIndex = contentItem.dataset.lightboxIndex;
            let lightboxIndex = $(contentItem).data("lightbox-index");            
            let mediaData = {
                //'src': contentItem.dataset.lightboxSrc || null,
                'src': $(contentItem).data("lightbox-src") || null,
                // 'src': contentItem.src || null,
                //'type': contentItem.dataset.lightboxType,
                'type': $(contentItem).data("lightbox-type"),
                'additionalData':[],
                'element': item,
            };
            this.config.mediaItemAdditionalDataClasses.forEach(element => {
                if($(item).find('.' + element) == null){
                //if(item.querySelector(`.${element}`) == null){
                    return;
                }
                //let textContent = item.querySelector(`.${element}`).textContent.replace(/(\n|\r)/g, "").trim();
                let textContent = $(item).find('.'+element).text().replace(/(\n|\r)/g, "").trim();
                let tempObj = {
                    [element] : textContent
                }
                mediaData['additionalData'].push(tempObj);
            });

            this.lightboxMediaItemMap.set(parseFloat(lightboxIndex),mediaData);
            if ($(contentItem).data('lightbox-index') == indexToShow){
                this.renderImageToLightbox(parseFloat(indexToShow));
            }
        }
    }
    /** 
     * @method prepareForDynamicLightbox
     * @description - Ajax for all the media - This function changes depending on your project
     */
    prepareForDynamicLightbox(indexToShow) {


    }
    /** 
    * @method renderImageToLightbox
    * @param {number} indexToShow -The lightbox index on the element clicked
    * @description 
     */
    renderImageToLightbox(indexToShow) {
        let mediaData = this.lightboxMediaItemMap.get(indexToShow);
        $(this.lightbox).data('current-index', indexToShow);
        
        if(mediaData.type == this.imageType){
            this.showLightboxPhoto(mediaData,true) 
        }else if(mediaData.type == this.videoType){
            this.showLightboxVideo(mediaData,true) ;
        }else {
            console.log(`"${mediaData.type}" is not a supported source type. Expectiing "image" or "video"`)
        }
        
    }
    /**
     * @method showLightboxPhoto
     * @description Set the lightbox's photo element to visible,hide the video element, and set the given src
     * @param {object} mediaData - Object with src,type, and additional classes to grab
     * @param {boolean} show - Flag wether to show or hide this element
     */
    showLightboxPhoto(mediaData,show){  
        let imageElement = this.lightbox.querySelector(`.${this.config.lightboxMediaElementImageClass}`);
        if (show){
            imageElement.src = "/book-of-memories/lib/assets/load-image.gif";
            imageElement.src = mediaData.src || this.config.lightboxDefaultImage;
            imageElement.removeAttribute('hidden');
            this.showMediaElementAdditionalData(mediaData)
            this.showLightboxVideo(null,false)
            this.showLightbox(true);
        }else {
            imageElement.setAttribute('hidden',true);
            imageElement.src = "";
        }        
    }
    /**
     * @method showLightboxVideo
     * @description Set the lightbox's video element to visible,hide the photo element, and set the given src
     * @param {string} source - The source for the video - typically URL
     
     */
    showLightboxVideo(mediaData,show){  
        let videoElement = this.lightbox.querySelector(`.${this.config.lightboxMediaElementVideoClass}`);
        if (show){
            videoElement.src = "../../assets/load-image.gif";
            videoElement.src = mediaData.src || this.config.lightboxDefaultImage;
            videoElement.removeAttribute('hidden');
            this.showMediaElementAdditionalData(mediaData)
            this.showLightboxPhoto(null,false)
            this.showLightbox(true);
        }else {
            videoElement.setAttribute('hidden',true);
            videoElement.src = "";
        }       
    }

    /** 
    * @method showLightbox
    * @description - Show/hide the lightbox depending on param show 
    * @param {boolean} show - Flag wether to show or hide this element
    */
    showLightbox(show) {
        if(show){
            this.lightbox.style.display = 'flex';
        }else {
            this.lightbox.style.display = 'none';
            this.lightbox = this.getCleanLightbox();
        }    
    }

    /** 
     * @method mediaData
     * @description Set the additional info inside the lightbox, with the text we grabbed from the clicked element.
    */
    showMediaElementAdditionalData(mediaData){
        
        //for (const item of mediaData.additionalData) {
        for (var i=0; i<mediaData.additionalData.length; i++) {
            var item = mediaData.additionalData[i];
            
            for (var value in item) {
                let classname = value;
                let text = item[value];
                document.querySelector(`.lightbox-${classname}`).textContent = text;
                // Hide the textbox's parent element if there is no caption to display.
                if ( text == "" ) {
                  document.querySelector(`.lightbox-${classname}`).parentNode.style.display = 'none';
                }
                else {
                  document.querySelector(`.lightbox-${classname}`).parentNode.style.display = 'flex';
                }
            }
        }        
    }
}
            
