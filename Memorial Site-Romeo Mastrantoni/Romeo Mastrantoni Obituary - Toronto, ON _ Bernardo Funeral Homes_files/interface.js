      String.prototype.replaceAll = function(search, replacement) {
          var target = this;
          return target.replace(new RegExp(search, 'g'), replacement);
      };

(function($){
      
      $( document ).ready(function() {
            
        // GD-FILogin  If we can find a FI login modal, and the FamilyLoginStartOpen div existins, open the modal on page load.
        var FILoginOpen = $('#FamilyLoginStartOpen');
        var FILoginModal = $('#familyLoginModal');
        var FITab = $('#ntmenu-tabs');
        if ( FILoginOpen.length ) {
            if (FILoginModal.length) {
                  FILoginModal.foundation('open');
            }
            else if ( FITab.length ) {
                  FITab.foundation("selectTab",$("#fam"));
            }
        }
        

            // GD-24994 share with another friend
            $('.email-share-again').click ( function () {
                  // Close current modal.
                  $('#emailSentModal .close-button').trigger('click');
                  // Open share by email modal.
                  $('#emailShareModal').foundation('open');
                  $('#toEmail').val("");
                  // 24994 - since we allow them to write a custom message, we probs don't want that to be cleared - they may want to use it again.
                  // Still emptying the email though, to prompt them to enter SOMETHING before sending again.
                  // empty recipient fields
                  //$('#recipientName').val("");
                  // ensure message field is not displaying previous recipient name.
                  //updateMessage();
            });
        
        me = this;
        me.msg = false;
        $('#message').hide();
                
        $('.emailForm').on('keyup', '#fromName, #recipientName', function(ev){
          
          if($("#fromName").val().length > 1 && $("#recipientName").val().length > 1){
            $('.emailForm').find("#messageSelect").removeAttr("disabled");
            // If msg has been set, GD-24994 and msg is not the custom one
            if(me.msg !== false && me.msg != "" ){
              updateMessage();
            }
            
          }else{
            $('.emailForm').find("#messageSelect").attr("disabled", true);
          }
        });
        
         $('.emailForm').on('change', "#messageSelect", function(e){
            
            if($(e.target).val() == 1){
              me.msg = message1;
              $('#message').show();
            }else if($(e.target).val() == 2){
              me.msg = message2;
              $('#message').show();
            }else if($(e.target).val() == 3){ // GD-24994
              me.msg = message3;
              $('#message').show();
            }else{
              $('#message').hide();
              me.msg = false;
            }
            updateMessage();
          
         });
         
         
         $('.email-share').click(function(e){
          
            me.data = {checkLogin: true};
            
            $.ajax({
              url: 'share-email.php',
              type: 'POST',
              data: me.data, 
              success: function(data){
                
                if(data.require_login != 1){
                  $("#fromName").removeAttr("required").val(data.name);
                  $("#fromEmail").removeAttr("required").val(data.email);
                }
                
                $('#emailShareModal').foundation('open');
              },
              dataType: 'json' 
            }).fail(function(){
              alert('Something Went Wrong, Please Try Again.');
            }).always(function(){
              //me.mask.hide();              
            });
            
          });
         
         
        $('.emailForm').on("formvalid.zf.abide", function(ev,frm) {
          me.data = frm.serialize();
          me.mask.show();
          
          $.ajax({
            url: 'share-email.php',
            type: 'POST',
            data: me.data, 
            success: function(data){
              
              if(data.success){
                $('#emailSentModal').foundation('open');
              }else{
                frm.find(".form-error").text(data.message).show();
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
         
         function updateMessage(){
          
            //if(me.msg == false) return;
          
            let newMsg = me.msg;
        
            var newline = String.fromCharCode(13, 10);
            newMsg = newMsg.replaceAll('\\n', newline);
            newMsg = newMsg.replaceAll('%recipientName%', $("#recipientName").val());
            newMsg = newMsg.replaceAll('%fromName%', $("#fromName").val());
            
            $("#message").val(newMsg);          
         }
        
        $('.loginForm').on("formvalid.zf.abide", function(ev,frm) {
          me.data = frm.serialize();
          me.mask.show();
          
          $.ajax({
            url: 'family-login.php',
            type: 'POST',
            data: me.data, 
            success: function(data){
              
              if(data.success){
                parent.location = "family-interactive.php";
              }else{
                frm.find(".form-error").text(data.message).show();
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
       
        $(".logout").on("click", function(){
          
          me.data = {doLogout: 1};
          
          $.ajax({
            url: 'family-login.php',
            type: 'POST',
            data: me.data, 
            success: function(data){
              if(data.success){
                parent.location.reload();
              }else{
                alert('Something Went Wrong, Please Try Again.');
              }
            },
            dataType: 'json'
          }).fail(function(){
            alert('Something Went Wrong, Please Try Again.');            
          });          
        });
        
        
            // GD-25506  Contact FH form submit.
            $('.contactFHForm').on("formvalid.zf.abide", function() {
                var Email = $('#contactFHModal').find('input[name="contactFHEmail"]').val();
                var Name = $('#contactFHModal').find('input[name="contactFHName"]').val();
                var Message = $('#contactFHModal').find('textarea[name="contactFHMessage"]').val();
                var capt = $('#contactFHModal').find('textarea[name="g-recaptcha-response"]').val();

                $.ajax({
                        url: 'ajax/contact-funeral-home.php',
                        type: 'POST',
                        data: {contactFH: true, fromEmail: Email, fromName: Name, Message: Message, 'g-recaptcha-response': capt },
                        success: function(data){
                                    var result=$.parseJSON(data);
                                    if (result.success) {
                                        $('#contactFHModal').foundation('close');
                                        $('#contactFHModalSent').foundation('open');
                                    }else{
                                        $('.err-contact-fh').text( result.errMessage );
                                    }
                                }
                    }).fail(function(){
                  //console.log ( "huh?" );
                        alert('Something Went Wrong, Please Try Again!');
                    }).always(function(){
                    });
            })
            .on("submit", function(ev) {
                  // prevent postback on submit.
                  ev.preventDefault();
            });
            
            // After the payment has been completed (howerver it turns out), reload the page.
            $('#CFDonationHPP').on('closed.zf.reveal', function() {
                  location.reload();
            });

            // GD-PROPAY - begin process of crowd fund donation.
            $('.startCFDonation').on("formvalid.zf.abide", function() {
                        var unindexed_array = $('.startCFDonation').serializeArray();
                        var frmdata = {};
                        $.map(unindexed_array, function(n, i){
                            frmdata[n['name']] = n['value'];
                        });
                        frmdata['startVDonation'] = true;

                $.ajax({
                        url:"vantage-crowd-funding.php",
                        type: 'POST',
                        data: frmdata,
                        //data: {startVDonation: true, Amount: Amount, fromName: Name, Message: Message, Email: Email },
                        success: function(data){
                                    var result=$.parseJSON(data);

                                    if (result.success == true) {
                                          postToProPayUI ( result );
                                          $('#startCFDonation').foundation('close');
                                    }else{
                                          $('.CFDonationError').text( result.error );
                                          //console.log ( result.error );
                                          //alert ( result.error );
                                    }
                                }
                    }).fail(function(jqXHR, textStatus, error){
                        //console.log ( textStatus );
                        //console.log ( error );
                        alert('Something Went Wrong, Please Try Again!');
                    }).always(function(){
                    });
            })
            .on("submit", function(ev) {
                  // prevent postback on submit.
                  ev.preventDefault();
            });
            
            function postToProPayUI ( paymentdata ) {
                  //console.log ( paymentdata );
                 // $data['comment1']
                 // $data['comment2']
                  $.ajax({
                        //url: "https://jasondemo.frontrunnerpro.com/dynasite/ims/ProPay/public/ProPayUI.php",
                        //url: "/ims/frontrunnerv4/dynasite/ims/ProPay/public/ProPayUI.php",
                        //url: "https://jasondemo.frontrunnerpro.com/runtime/289642/ims/ProPay/public/ProPayUI.php",

                        // LIVE URL:
                        url: "https://prod4.frontrunnerpro.com/runtime/311039/ims/ProPay/public/ProPayUI.php",
                        // DEV URL:       // DO NOT PUSh LIVE
                        //url: "../../../ims/ProPay/public/ProPayUI.php", // DO NOT PUSh LIVE

                        type: 'POST',
                        data: paymentdata,
                        success: function(data){
                                    var result=$.parseJSON(data);
                                    //console.log ( result );
                                    if (result.success ) {
                //                        $('#contactFHModal').foundation('close');
                                          $('#CFDonationHPP #CFDonationHPP-iframe').attr("src", result.src );
                                          $('#CFDonationHPP').foundation('open');
                                    }else{
                                          //console.log ( result );
                //                        $('.err-contact-fh').text( result.errMessage );
                                    }
                                }
                    }).fail(function(){
                  //console.log ( "huh?" );
                        alert('Something Went Wrong, Please Try Again!');
                    }).always(function(){
                    });
            }

            // GD-PROPAY - listen for success message from HPP iframe.
            window.addEventListener("message", receiveVanCFMessage, false);
            function receiveVanCFMessage(event) {
                  //console.log ( "received message!" + event );
                  if ( event.data == "VanCFSuccess" || event.data.msg == "VanCFSuccess" ) {
                        $('.genRec').data('pay', event.data.pay ); // GD- indicate the payment for the receipt btn.
                        //console.log ( "VanCFSuccess!" );
                        $("#CFDonationHPP-iframe").remove();
                        $(".cf_header_noback").hide();
                        $(".DonationSuccess").show();
                  }
            }

            // GD-PROPAY  Successfuly crowdfund payment - generate receipt pdf
            $(".genRec").on("click", function(){
                  paymentdata = $('.genRec').data("pay");
                  
                  // LIVE URL:
                  recUrl = "https://prod4.frontrunnerpro.com/runtime/311039/ims/ProPay/public/GetReceiptPDF.php?paymentId=" + paymentdata;
                  // DEV URL:       // DO NOT PUSh LIVE
                  //recUrl =  "../../../ims/ProPay/public/GetReceiptPDF.php?paymentId=" + paymentdata; // DO NOT PUSh LIVE
                  window.open( recUrl, '_blank');
            });
      });

      
}(frpJQ));