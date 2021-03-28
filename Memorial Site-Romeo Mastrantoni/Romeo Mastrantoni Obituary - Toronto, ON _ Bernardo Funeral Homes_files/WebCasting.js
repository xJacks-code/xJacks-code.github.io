(function($){
$(document).ready(function () {
    
            // GD-wcLogin           
            $(".WCLogin").click(function (e) {
                e.preventDefault();
                $.ajax({
                     url: "ajax/WebcastLogin.php",
                     data: { op: "wclogin",
                             username: $(this).closest('.modal-body').find('.wcuser').val(),
                             password: $(this).closest('.modal-body').find('.wcpass').val(),
                             EventId: $(this).closest('.modal-body').find('.wceventId').val(),
                             drId: $(this).closest('.modal-body').find('.wcdeathRecordId').val(),
                     },
                     type: "POST",
                     error: function(err) {
                         console.error(err);
                     },
                     success: function(data) {
                         var res = $.parseJSON( data );
                         if (res.success) {
                             //console.log('User logged in successfully');
                             window.open(res.target, '_blank');
                             $('.wcServiceModal').foundation('close');
                             $('.viewWCSecure').attr("href", res.target).show();
                             $('.openWCLoginModal').hide();
                         } else {
                             //alert('something went wrong, Please try again.');
                             $(".wcform-error").text(res.message).show();
                         }
                     },
                 });
            });
            
    });

}(frpJQ));