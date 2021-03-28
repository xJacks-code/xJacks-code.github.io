(function($){
$( document ).ready(function() {
    
    let me = this;
    
    //console.log(me);
    
    me.posting = false; // GD-07-15-2019
    me.mask = $(".tribute-mask");
    me.post = $(".post-button");
    me.tributeActionsDesc = $('.tributeActions-description');
    me.tributeActionsContainer = $('.tributeActions-container');
    me.tributeActions = $('.tributeActions');
    me.tributelist = $(".tribute-list");
    me.currentPage = 1;
    me.maxPages = maxPages;
    me.featuredFirst = false;
    me.featuredComment = false;
    me.type = "all";
    me.commentForm = false; 
    
    showLoginLoader ( false );  // GD-07-15-19
    me.mask.toggle();
    me.post.toggle();
    me.tributeActionsDesc.toggle();
    me.tributeActionsContainer.toggle();
    me.tributeActions.toggle();
    
    $('.tributePost-controls').show();

    updateButtons();
    displayNumberRemaningImages();
    
    $('.leaveCondolenceTile').on("click",".delete-media",function(){
        $(this).parent().remove();
    });
    
    $("button.post").on('click', function(){
        
        console.log("click post");
        
        //If we have a videoWidget
        if(typeof videoWidget !== "undefined"){
            //Check for video recording
            var video = videoWidget.getDataURL();
            
            if (video && $("#leaveCondolence").val() == "") {
                $("#leaveCondolence").val("Video Condolence");
            }else{
                $("#tribute-wall").foundation('validateInput', $("#leaveCondolence"));
            }
        }            
    });
    
    $('.tributes').on( 'click', '.pagination-next, .pagination-previous, .pagination-last, .pagination-first, .pagination-more', function (e) {
        
        // GD: If we've disabled a button because that page is out of range, don't handle a click on it.
        if($(this).hasClass('disabled')) {
          return;
        }
        
        me.appendPage = false;
        if($(this).hasClass('pagination-more')){
            me.loadPage = me.currentPage+1;
            me.appendPage = true;
        }else if($(this).hasClass('pagination-next')){
            me.loadPage = me.currentPage+1;
        }else if($(this).hasClass('pagination-last')){
            me.loadPage = me.maxPages;
        }else if($(this).hasClass('pagination-previous')){
            me.loadPage = me.currentPage-1;
        }else if($(this).hasClass('pagination-first')){
            me.loadPage = 1;
        }

        // GD-2020-05-20  When paging, scroll back to the top of the tribute wall section.  Only on formats/themes that it makes sense to do so.
        if ( $('#tributeWall').length ) {
            $('html,body').animate({
                scrollTop: ($('#tributeWall').first().offset().top)
            },500);
        }

        getTributePage(me.loadPage);   
    });
    
    $('.tribute-list').on( 'click', '.showAll', function (e) {
        me.type = $(this).data("type");
        getTributePage(1);                
    });

    $('.tribute-list').on('click', '.comment', function (e) {
        
        let $comment = $(this).closest(".tributeTile").find(".leave-comment");
        $comment.find('.comment-text').val("");

        if(!me.focusout){
            $comment.toggle();
        }else{
            me.focusout = false;
        }
    });
    
    $('.tribute-list').on('click', '.share', function (e) {
        
        let $share = $(this).closest(".tributeTile").find(".share-tribute");
        $share.find('.comment-text').val("");
        $share.toggle();
    
    });    
    
    $('.tribute-list').on('click', '.show-all-comments', function (e) {
        
        let $comments = $(this).closest(".tributeTile").find(".tributePost-reply");
        let $showComments = $(this).closest(".tributeTile").find(".tributePost-showComments");
        $comments.removeClass("hide");
        $showComments.hide();
        
    });        
    
    $('.tribute-list').on("formvalid.zf.abide", ".comment-form", function(ev,frm) {

        let commentText = $(frm).find(".comment-text").val();
        let tributeId = $(frm).find(".tributeId").val();
        
        let data = {
            commentText: commentText,
            tributeId: tributeId,
            tributeUserId: me.tributeUserId,
            FBUserId: me.FBUserId
        }            
        
        me.mask.show();
        
        $.ajax({
            url: 'ajax/tribute-wall.php',
            type: 'POST',
            data: data, 
            success: function(data){
                
               if(data.require_login == 1){
                    $('#loginModal').foundation('open');
                    me.commentForm = frm;
               }else if ( data.blocked == 1 ) { // GD-Jan-16-19
                    alert ( "Your e-mail address has been blocked.");
               }else if ( data.dirty == 1) {
                    alert ( "Your submission contained blocked word(s), please fix and re-submit" );
               }else if(data.success){
                    frm.closest(".tributePost-content").find(".comment").click();
                    me.featuredComment = data.commentId;
                    me.tributelist.empty();
                    getTributePage(me.currentPage);
               }
            },
            dataType: 'json' 
        }).fail(function(){
            alert('Something Went Wrong, Please Try Again.');
        }).always(function(){
            //me.mask.hide();              
        });    
    })
    .on("submit", function(ev) {
        ev.preventDefault();
    });
           
    $("#leaveCondolence").keyup(function(e){
        $("#tribute-wall").foundation('validateInput', $("#leaveCondolence"));
    });
            
    function getTributePage(pageNum){
        me.mask.show();

        $.ajax({
            url: 'ajax/tribute-wall.php',
            type: 'POST',
            data: {pageNum: pageNum, type:me.type}, 
            success: function(data){
                
               if(!me.appendPage){
                    me.tributelist.empty();
               }
               
               me.tributelist.append(data.html);
               
               //Recall foundation
               $(document).foundation();
	       
	       if(typeof FB != "undefined"){ 
               	  //Reparse FB
               	  FB.XFBML.parse();
	       }	
               
               me.maxPages = data.pages;
               
               if(me.featureFirst){
                    $(".tribute-list .tributeTile ").first().addClass("featured");
                    
               }
               
               if(me.featuredComment){
                    $comment= $('[data-commentid="'+ me.featuredComment + '"]');
                    $comment.addClass("featured");
                    
                    $comment.find(".tributePost-photo, .tributePost-content").addClass("featured-desktop");                    
        
                    $(document).scrollTop($comment.offset().top - 10);
               }
               
                $('.tributePost-controls').show();  // GD- Loaded new page of tributes -- show the tributePost-controls.
               me.featureFirst = false;
               me.featuredComment = false;
            },
            dataType: 'json' 
        }).fail(function(){
            alert('Something Went Wrong, Please Try Again.');
        }).always(function(){
            me.mask.hide();
            me.currentPage = pageNum;
            
            //Update Text
            $(".tributes #pageNumber").text(me.currentPage);
            $(".tributes #maxPages").text(me.maxPages);
            
            //update buttons
            updateButtons();
            displayNumberRemaningImages();
            
            lightbox.mediaSectionClickEvents();
        });            
    }
    
    function updateButtons(){
        //Update buttons
        $(".pagination-previous, .pagination-first, .pagination-next, .pagination-last").removeClass("disabled");
        if(me.currentPage == me.maxPages){
            $(".pagination-next, .pagination-last").addClass("disabled");
            $(".pagination-more").hide();
        }
        if(me.currentPage == 1){
            $(".pagination-previous, .pagination-first").addClass("disabled");
        }               
    }
    
    // form validation passed, form will submit if submit event not returned false
    $("#tribute-wall").on("formvalid.zf.abide", function(ev,frm) {

        me.message = $("#tribute-wall #leaveCondolence").val();
        me.isPrivate = $("#tribute-wall #isPrivate").is(":checked");
        
        //Get name/email values
        me.name = $("#tribute-wall #fullname").val();
        me.email = $("#tribute-wall #email").val();
        
        // GD-2021-01-13  Get the recaptcha response if available and needed.
        me.recaptcha = $("#tribute-wall #g-recaptcha-response").val();
        
        // GD-07-15-2019
        if ( me.posting ) {
            //console.log ( "already posting..." );
            return; // already posting - don't send again
        }
        me.posting = true;
        
        me.mask.show();
        me.assets = getMediaItems(ev);
        data = {
            message: me.message,
            assets: me.assets,   //can check for empty on server side.
            isPrivate: me.isPrivate,
            visible: !me.isPrivate,
            tributeUserId: me.tributeUserId,
            FBUserId: me.FBUserId,
            'g-recaptcha-response': me.recaptcha  // GD-2021-01-13
        };
        
        //Check for name and email
        if(me.name){
            data.name = me.name;
        }
        if(me.email){
            data.email = me.email;
        }
        
        $.ajax({
            url: 'ajax/tribute-wall.php',
            type: 'POST',
            data: data,
            beforeSend: function(){
                showLoader(true);
            },                
            success: function(data){
                
               if(data.require_login == 1){
                    $('#loginModal').foundation('open');
               }else if ( data.blocked == 1) {
                    alert ( "Your e-mail address has been blocked.");
               }else if ( data.dirty == 1) {
                    alert ( "Your submission contained blocked word(s), please fix and re-submit" );
               }else if ( data.captchafailed == 1 ){    // GD-2021-01-13
                    alert ( data.msg );
               }else if(data.success){
                    emptyTributeMediaList();
                    me.maxPages = data.pages;
                    $("#tribute-wall #leaveCondolence").val("");
                    $("#tribute-wall").foundation('validateInput', $("#leaveCondolence"));
                    
                    console.log("formvalid sucess validate");
                    
                    //Reset recording
                    if(typeof videoWidget !== "undefined"){
                        videoWidget.resetRecording();
                    }
                    
                    if(data.isVisible){
                        getTributePage(1);
                        me.featureFirst = true;
                    }
                    
                    $('.cond_post_success_noun').text ( "condolence" ); // GD-24890
                    $('#condolencePosted').foundation('open');
               } else if ( data.imagefailed ) {   // GD-03-12-19
                alert ( "Encounterd an error saving media file(s)." );
               }
            },
            dataType: 'json' 
        }).fail(function(jqXHR, textStatus, errorThrown){
            // GD-25263  If image is too large, at least let the user know why it failed.
            if ( errorThrown == "Request Entity Too Large" ) {
                alert('Attached image too large, exceeds size limits');
            }
            else {
                alert('Something Went Wrong, Please Try Again.  Error = ' + errorThrown );
            }
        }).always(function(){
            me.posting = false; // GD-07-15-2019
            me.mask.hide();
            showLoader(false);
        });    
    })
    // field element is invalid
    .on("invalid.zf.abide", function(ev,elem) {
        me.post.hide();
        me.tributeActionsDesc.hide();
        me.tributeActionsContainer.hide();

    })
    // field element is valid
    .on("valid.zf.abide", function(ev,elem) {
      me.post.show();
      me.tributeActionsDesc.show();
      me.tributeActionsContainer.show();
    
    })
    .on("submit", function(ev) {
        ev.preventDefault();
    });
    
    $("#loginModal").on("formvalid.zf.abide", function(ev,frm) {
        
        me.name = $("#loginModal #fullname").val();
        me.email = $("#loginModal #email").val();

        registerNewUser(me.email, me.name, null, null);             
        
    }).on("submit", function(ev) {
        ev.preventDefault();
    });
});
}(frpJQ));



function showLoader(showLoader){
    var $ = frpJQ;
    if (showLoader){
        document.querySelector('.loader').style.display = 'flex';
    }else {
        document.querySelector('.loader').style.display = 'none';
   }
}

// GD-07-15-19
function showLoginLoader(showLoader){
    var $ = frpJQ;
    if (showLoader){
        document.querySelector('.loginModalLoader').style.display = 'flex';
        document.querySelector('.loginModalSubmit').style.display = 'none';
    }else {
        document.querySelector('.loginModalLoader').style.display = 'none';
        document.querySelector('.loginModalSubmit').style.display = 'flex';
   }
}

function registerNewUser(email, name, fbUserId, fbUserPhoto){
    var $ = frpJQ;
    me.mask.show();
    // GD-07-15-2019
    if ( me.posting ) {
        //console.log ( "already posting, don't login again..." );
        return; // already posting - don't send again
    }
    me.posting = true;
    
    $.ajax({
        url: 'ajax/tribute-wall.php',
        type: 'POST',
        data: {name: name, email:email, fbUserId: fbUserId, fbUserPhoto: fbUserPhoto}, 
        beforeSend: function(){
            showLoginLoader(true);
        },   
        success: function(data){
            
            if(data.success){
                me.posting = false;
                $('#loginModal').foundation('close');
                me.tributeUserId = data.tributeUserId;
                
                if(me.commentForm !== false){
                    me.commentForm.submit();
                    me.commentForm = false; 
                }else if ( me.BOMphotoPostingLogin == true ) {  // GD-Jan-11-19
                    me.BOMphotoPostingLogin = false;
                    $('#addPhotosTile .post').click();  
                }else{
                    console.log("register new user click post");
                    $('#tribute-wall .post').click();
                }
            }else{
                alert("login failed.");
            }
            
        },
        dataType: 'json' 
    }).fail(function(){
        me.posting = false;
        alert('Something Went Wrong, Please Try Again.');
    }).always(function(){
        showLoginLoader(false);
        me.mask.hide();     
    });         
}

function focusElement(selector){
    var $ = frpJQ;
    
    document.querySelector('.blanket-dim-all-content').style.opacity = '1';
    document.querySelector(selector).classList.add('focus')
    
}
function resetFocus(selector){
    var $ = frpJQ;
    document.querySelector('.blanket-dim-all-content').style.opacity = '0';
    document.querySelector(selector).classList.remove('focus')
    
}

function displayNumberRemaningImages(){
    var $ = frpJQ;
    $('.media-section-container').each( function(index){
        let lastTribute = $(this).find('.condolence-thumb').last();
        let remainder = $(this).find('.condolence-remainder');
        $(remainder).show();
        $(lastTribute).append(remainder);
        $(lastTribute).css('position','relative');            
    });
}
function addMedia(e){
    var $ = frpJQ;
    e.preventDefault(); //Prevent any default actions that this element may do. 
    $('#mediafileUpload').click();
}

//Image Uploader
function filesAdded(e){
    var $ = frpJQ;
    
    let files = e.target.files; // FileList object
    let countFiles= files.length;
    countFiles > 0 ? alterGestureBarVisibilty(false) : alterGestureBarVisibilty(true);
    let image_holder = $(".condolence-media-list");
    image_holder.empty();
    $(".condolence-media-disclaimer").toggle(); // GD-25378

    for(let j=0; j<countFiles; j++){
        elm = "<div id='loading-"+j+"' class='media-item' type='image'><img class='preview-img' src='/book-of-memories/lib/assets/load-image.gif'></img></div>";
        $(image_holder).append(elm); 
    }
     
    for (let i = 0, f; f = files[i]; i++) {
        let reader = new FileReader();
        me.FileNum=0;
        reader.onload = (function(theFile) {
            return function(e) {
                let base64 = e.target.result;
                if (base64.indexOf("data:image") != -1) {
                    el = "<div class='media-item' type='image'><img class='preview-img' title='"+escape(theFile.name)+"' src='" + e.target.result + "'></img><div class='delete-media'></div></div>";
                }else if (base64.indexOf("data:video") != -1) {
                    el = "<div class='media-item' type='video'><video class='preview-img'><source type='video/mp4' title='"+escape(theFile.name)+"' src='" + e.target.result + "'></video><div class='delete-media'></div></div>";
                }
                $('#loading-'+me.FileNum).remove();
                $(image_holder).append(el);
                me.FileNum=me.FileNum+1;
            };
        })(f);
            reader.readAsDataURL(f);
    }
};
function getMediaItems(e) {
    var $ = frpJQ;
    e.preventDefault();

    let assets = [];
    $.each($(".media-item"), function() {
        if ($(this).attr('type') == 'video') {
            assets.push({
                base64: $(this).find("source").attr('src'),
                title: $(this).find("source").attr('title'),
                type: $(this).attr('type')
            });
        }else{
            assets.push({
                base64: $(this).find("img").attr('src'),
                title: $(this).find("img").attr('title'),
                type: $(this).attr('type')
            });
        }
    });
    
    //If we have a videoWidget
    if(typeof videoWidget !== "undefined"){
        //Check for video recording
        var video = videoWidget.getDataURL();
        
        if (video) {
            //fd.append('videoData',video);
            assets.push({
                base64: video,
                title: "Video Condolence",
                type: "video"
            });
        }
    }

    return assets;
}

function alterGestureBarVisibilty(show){
    var $ = frpJQ;
    //NOTE: This isn't working correctly right now.
    // if (show){
    //     $('.tributeActions-description').css('opacity','1');
    //     $('.tributeAction').css('opacity','1');
    // }else {
    //     $('.tributeActions-description').css('opacity','0');
    //     $('.tributeAction').css('opacity','0');
    // }
}

function emptyTributeMediaList(){
    var $ = frpJQ;
    $(".condolence-media-list").empty();
}

var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
var eventer = window[eventMethod];
var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

// Listen to message from child window
eventer(messageEvent,function(e) {
    var $ = frpJQ;
    var me = document;
    
    try{
        var myobj = JSON.parse(e.data);
        me.tributeUserId = myobj.UserId;
        me.FBUserId = myobj.FBUserId;
    }catch(err){}
    
    if(typeof me.tributeUserId !== "undefined"){
    
        $('#loginModal').foundation('close');
   
        if(me.commentForm !== false){
            me.commentForm.submit();
            me.commentForm = false;   
        }else{
            console.log("eventer click post");
            $('#tribute-wall .post').click();
        }
    }
},false);

