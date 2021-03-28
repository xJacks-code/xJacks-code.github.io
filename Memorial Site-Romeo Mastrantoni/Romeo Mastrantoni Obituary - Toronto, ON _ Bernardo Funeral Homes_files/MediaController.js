(function($){


$( document ).ready(function() {
    
    let me = this;
    
    // GD-02-26-19 was not handling a click to the delete-media X button.
    $('#addPhotosTile').on("click",".delete-media",function(){
        $(this).parent().remove();
    });
    
    // GD-Jan-11-19
    $('.photosVideosTile').on('click', '.addPhotos', function (e) {
        e.preventDefault(); //Prevent any default actions that this element may do. 
        //addMediaPhotos ( e );
    });
    // GD-Jan-11-19  User has uploaded photos (no condolence).
    $("#addPhotosTile").on("submit", function(ev) {
	var promise = new Promise( function (resolve,reject) {
		me.mask.show();
		me.assets = getMediaItems(ev);
		var assetCount = me.assets.length;
		var assetsProcessed = 0;

		    //for(var asset of me.assets ){
          me.assets.forEach(function(asset){
			data = {
			    addPhotosOp: 1,
			    visible: !getIsPrivateStatus(),
			    assets: [ asset ],
                            tributeUserId: me.tributeUserId,
                            FBUserId : me.FBUserId
			};
			$.ajax({
			    url: 'ajax/tribute-wall.php',
			    type: 'POST',
			    data: data,
			    beforeSend: function(){
				showLoader(true);
			    },                
			    success: function(data){
			       if(data.require_login == 1){
				    me.BOMphotoPostingLogin = true;
				    $('#loginModal').foundation('open');
			
			       }else if ( data.blocked == 1) {
				    alert ( "Your e-mail address has been blocked.");
			       }else if(data.success){
				    $('#addPhotosTile').hide();
				    // Empty photo media list.  Post success message.
				    emptyPhotoMediaList();
                                    assetsProcessed ++;
                                    if (assetCount == assetsProcessed){
                                        resolve("complete");
                                    }
			       }
			       else if ( data.imagefailed ) {   // GD-03-12-19
				    alert ( "Encounterd an error saving photo(s)" );
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
			    me.mask.hide();
			    showLoader(false);
			}).complete( function () {
			} );    
		})
	    })
	promise.then( function (data){
            if (data == 'complete'){
                $('.cond_post_success_noun').text ( "photo(s)" ); // GD-24890
                $('#condolencePosted').foundation('open');
            }
	//	document.location.href = "index.php#photos"; 
	//	document.location.reload();
	});

	})
});

}(frpJQ));

function getIsPrivateStatus(){
	var checkbox = document.querySelector(".photo-media-visible");
	if (checkbox){
		return checkbox.checked;
	}
	return false;
}
    
function addMediaPhotos(e){
    var $ = frpJQ;
    e.preventDefault();
    $('#mediaPhotoUpload').click();
}

function emptyPhotoMediaList(){
    var $ = frpJQ;
    $(".addphoto-media-list").empty();
}
function closeUploadError(event){
    var target = event.target ? event.target : event.currentTarget ? event.currentTarget : null;
    if (target){
        $(target.parentNode).fadeOut(250, function(){
            $(target.parentNode).remove();
        });
    }
}
function showUploadError(type,fileName,referenceNode){
    var $ = frpJQ;
    var errorEl = document.createElement('div');
    errorEl.classList.add('file-upload-error');

    var errorIcon = "<i class='fa fa-exclamation-circle uploadErrorIcon' aria-hidden='true'></i>"
    var closeIcon = "<i onclick='closeUploadError(event)' class='fa fa-times-circle uploadErrorCloseIcon' aria-hidden='true'></i>"

    switch(type){
        case 'size':{
            errorEl.innerHTML = errorIcon+fileName+" exceeds the 8MB file limit. Please resize the image and try again." +closeIcon;	
            break;
        }
        case 'limit':{
            errorEl.innerHTML = errorIcon+"You can only upload 10 photos at a time."+closeIcon;	
            break;
        }
        default : {
            errorEl.innerHTML = errorIcon+"There was a problem processing "+fileName+closeIcon;	
            break;
        }
    }
   
   insertElementAfter(errorEl,referenceNode);
	
}
function insertElementAfter(newNode,referenceNode){
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
    
    //Image Uploader
    function mediaFilesAdded(e, holder){  // GD-Jan-11-19
    var $ = frpJQ;
        

	//this needs to stay in sync with BaseController...
	var max_file_size = 8388608 ;
	var max_num_files = 10;
	var photoDisclaimerElement = document.querySelector(".photoUploadDisclaimer");

        let files = e.target.files; // FileList object
        let countFiles= files.length;
        countFiles > 0 ? alterGestureBarVisibilty(false) : alterGestureBarVisibilty(true);
        let image_holder = $(holder);
        image_holder.empty();
        
        $('#addPhotosTile').show();
	var limitReached = false;    
        for(let j=0; j<countFiles; j++){
	    if (files[j].size > max_file_size){
		showUploadError("size",files[j].name,photoDisclaimerElement);
	    }else if (j >= max_num_files){
		if (limitReached == false){
			showUploadError("limit",files[j].name,photoDisclaimerElement);
			limitReached = true;
		}
	    }else{
		elm = "<div id='loading-"+j+"' class='media-item' type='image'><img class='preview-img' src='/book-of-memories/lib/assets/load-image.gif'></img></div>";
		$(image_holder).append(elm); 
	    }
        }
         
        for (let i = 0, f; f = files[i]; i++) {
	    if (f.size <= max_file_size &&  i < max_num_files){ 
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
        }
    }
    
