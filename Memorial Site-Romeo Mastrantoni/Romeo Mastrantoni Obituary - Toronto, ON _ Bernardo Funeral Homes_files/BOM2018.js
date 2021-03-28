var bom = bom || {};
bom.main = bom.main || {};

(function($) {

    function BOMMainController(config) {
        this._init(config);
    }

    BOMMainController.prototype = {
    
        _init: function(config) {
            var $ = frpJQ;
            var me = this;
            $.extend(me, config);
            this._initEvents();
        },
            
        _initEvents: function(){
            var $ = frpJQ;
             var me = this;    
    
            $('body').on('click', '.facebook-share', function(e) {
                e.preventDefault();
                
                //Check element for href
                var share = $(this).attr('href');
                if (typeof share == typeof undefined || share == false) {
                    //Look for child a tag
                    var share = $(this).find('a').attr('href');
                }
        
                // Parsing host/sharer.php?u=URL&t=blah
                // Relies on u=URL being first argument to sharer.php
                var url = decodeURIComponent(share.split('?')[1].split('&')[0].split('=')[1]);
                data = {scrape: true, id: url};
            
                showLoader(true);
                //setTimeout(function(){
                    $.ajax({
                        //url: 'https://graph.facebook.com/', 
                        //url: 'https://obituaries.frontrunnerpro.com/runtime/311039/book-of-memories/scrape-bom.php',
                        url: 'https://demo4.frontrunnerpro.com/runtime/234092/book-of-memories/scrape-bom.php',
                        type: 'POST',
                        data: data, 
                        async: false,
                        success: function(data){
                            console.log(share);
                            window.open(share);
                        }
                    }).fail(function(){
                        alert('Error submitting share request to Facebook.');
                    }).always(function(){
                        //me.mask.hide();
                        showLoader(false);
                    });
                //}, 100);
            });
        }
    };
    bom.main.BOMMainController = BOMMainController;
}(frpJQ));

    
    var templateController = null;
    frpJQ(document).ready(function() {
        var config = {};
        templateController = new bom.main.BOMMainController(config);
    });
