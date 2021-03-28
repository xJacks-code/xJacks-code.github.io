//Test
(function($){
    $(document).ready(function () {
    
            // GD-wcLogin           
            $(".WCServiceLogin").click(function (e) {
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

             
            $(".send-email-map").click(function () {
                
                var Email = $(this).parent().find('input[name="email"]').val();
                var mapId= $(this).parent().find('input[name="mapid"]').val();
                var eventName= $(this).parent().find('input[name="eventName"]').val();
                var eventDate= $(this).parent().find('input[name="eventDate"]').val();
                var eventLocation= $(this).parent().find('input[name="eventLocation"]').val();
                var eventAddress= $(this).parent().find('input[name="eventAddress"]').val();
                var toAddress= $(this).parent().find('input[name="toAddress"]').val();
                var safeName= $(this).parent().find('input[name="safeName"]').val();
                $.ajax({
                        url: 'ajax/directions.php',//'service-details.php',
                        type: 'POST',
                        data: {email: Email, mapid: mapId, directionType: "email", eventName:eventName, eventDate:eventDate,eventLocation:eventLocation,eventAddress:eventAddress,toAddress:toAddress},
                        success: function(data){
                                    var result=$.parseJSON(data);
                                    if (result.success) {
                                        $('#emailModal-'+safeName).foundation('close');
                                        $('#directionsModalSent').foundation('open');
                                    }else if(result.emailError){
                                        $('.err-email-sp').text(result.errMessage);
                                    } else {
                                        alert('Something Went Wrong, Please Try Again!');
                                    }
                                }   
                    }).fail(function(){
                        alert('Something Went Wrong, Please Try Again!');
                    }).always(function(){
                    });
            });
            
           //Form Validation
            $(".smsFrm")       
                .on("formvalid.zf.abide", function(ev,frm) {
                    sendSMSMessage(this);   
                })          
                .on("submit", function(ev) {
                    ev.preventDefault();
                });            
            
        
            $(".send-sms-map").click(function () {
                //If this is NOT in an abide form, call sendSMSMessage
                if($(this).closest(".smsFrm").length == 0){
                    sendSMSMessage($(this).parent());
                }
            });

            $('.open-rsvp').click(function() {
                $('.rsvpmodal').find('.rsvpForm').show();
                $(".err-rsvp").hide();
                $(".succ-rsvp").hide();
            });
            
            // Open re-send rsvp email modal.
            $('.open-resendRSVP').click(function() {
                $(".err-resendrsvp").hide();
                $(".succ-resendrsvp").hide();
            });
            
            // Re-send my rsvp email
            var rsvpresendposting = false;
            $('.btn-resend-rsvp').click(function() {
                if( rsvpresendposting == true ) { // prevent the user from repeatedly mashing the submit button.
                    return;
                }
                rsvpresendposting = true;
                $('.rsvpmodal').find('.loader').show();
                $(".err-resendrsvp").hide();
                $(".succ-resendrsvp").hide();
                
                $.ajax({
                     url: "ajax/SubmitRSVP.php",
                     data: { op: "resendrsvp",
                             Email: $(this).closest('.rsvpresendmodal').find('.email-input').val(),
                             DrId: $(this).closest('.rsvpresendmodal').find('.rsvpdeathRecordId').val(),
                             EventId: $(this).closest('.rsvpresendmodal').find('.rsvpeventId').val(),
                     },
                     type: "POST",
                     error: function(err) {
                         console.error(err);
                     },
                     success: function(data) {
                         var res = $.parseJSON( data );
                         if (res.success) {
                             //console.log('RSVP resend successfully');
                             $(".succ-resendrsvp").text(res.msg).show();
                             $(".err-resendrsvp").hide();
                         } else {
                             //alert('something went wrong, Please try again.');
                             $(".err-resendrsvp").text(res.msg).show();
                             $(".succ-resendrsvp").hide();
                         }
                     },
                 }).always(function(){
                    rsvpresendposting = false;
                    $('.rsvpresendmodal').find('.loader').hide();
                });
            });
            
            
            // GD-RSVPMAX - user changed the number of guests.  Display a spot to enter info for each guest.
            $(".guests-input").bind('keyup mouseup', function ( ) {
                var numGuests = $(this).val();
                if ( numGuests > 0 ) {
                    $('.guestDisclaimer').show();
                } else {
                    $('.guestDisclaimer').hide();
                }
                $(".rsvpGuestInfo" ).empty(); // get rid of all children (only).
                for ( var guestCounter = 0; guestCounter < numGuests; guestCounter++ ) {
                    $( ".singleGuest" ).first().clone().appendTo( ".rsvpGuestInfo" );
                }
                // GD-27743 Re-init abide for the added fields.  These events are copied from just above sendRSVP()
                Foundation.reInit('abide');
                $(".rsvp-form")
                    .on("formvalid.zf.abide", function(e, frm) {
                        sendRSVP( e );
                    })
                    .on("submit", function(ev) {
                        ev.preventDefault();
                    });
            });
            
            // GD-RSVPMAX - user selected a time slot
            $('.btnSelectTimeslot').click(function() {
                // Unselect any selected ones.
                $('.singleTimeSlot').removeClass("singleTimeSlotSelected");
                // Set the selected button text (and reset all the unselectd btn text)
                $('.btnSelectTimeslot').text ( "Select Time" );
                $(this).text ( "Selected Time" );
                // Mark the selected one as selected.
                $(this).closest(".singleTimeSlot").addClass("singleTimeSlotSelected");
                // Update our input with the selected value.
                $('.selectedTimeSlot-input').val ( $(this).data('index') );
            });
            
            
            var rsvpposting = false;
            // GD-RSVPMAX  User is attempting to submit a RSVP  GD-27743 Added abide form validation to ensure fields filled out.
            //  Since we are potentially adding dynamic fields that ALSO need to be validated, these events are copied, above (in $(".guests-input").bind)
            $(".rsvp-form")
                .on("formvalid.zf.abide", function(e, frm) {
                    sendRSVP( e );
                })
                .on("submit", function(ev) {    // This is getting triggered whether the form is valid or not.
                    ev.preventDefault();
                });

            function sendRSVP ( e ) {
                // GD-27743  After adding abide validation, the meaning  of "this" changed.  Replaced with "e.target".
                e.preventDefault();
                if( rsvpposting == true ) { // prevent the user from mashing the submit button.
                    return;
                }
                rsvpposting = true;
                // Hide the modal content, and show the loader.
                $('.rsvpmodal').find('.rsvpForm').hide();
                $('.rsvpmodal').find('.loader').show();
                $(".err-rsvp").hide();
                $(".succ-rsvp").hide();

                // GD-2020-12-21  Removed 'I will be attending this event' checkbox.  We don't want to hear about people not attending.
                isAttending = 1;
                //var isAttending = 0;
                //if ( $(e.target).closest('.modal-body').find('.attending-input').is(":checked") ){
                //    isAttending = 1;
                //}
                
                // Get the text for any guests.
                var guestText = "";
                $(e.target).closest('.modal-body').find('.guestName').each (function (guestIndex) {
                    if ( guestIndex > 0 ) { guestText += ", "; }
                    guestText += $( this ).val() + " - ";       // this I'm assuming is the object in the each, NOT the global this referenced elsewhere in the function...
                    guestText += $(this).closest('.modal-body').find('.guestPhone').eq(guestIndex).val();
                });
                
                // Get the family rsvp password if needed.
                var password = "";
                var passelm = $(e.target).closest('.modal-body').find('.password-input');
                if ( passelm.length > 0 ) {
                    password = passelm.val();
                }

                var timeslot = "";
                var timeslotelm = $(e.target).closest('.modal-body').find('.selectedTimeSlot-input');
                if ( timeslotelm.length > 0 ) {
                    timeslot = timeslotelm.val();
                }
                
                var capt = $(e.target).closest('.modal-body').find('textarea[name="g-recaptcha-response"]').val();

                $.ajax({
                     url: "ajax/SubmitRSVP.php",
                     data: { op: "submitrsvp",
                             Attending: isAttending,
                             Name: $(e.target).closest('.modal-body').find('.name-input').val(),
                             Phone: $(e.target).closest('.modal-body').find('.phone-input').val(),
                             Email: $(e.target).closest('.modal-body').find('.email-input').val(),
                             Guests: $(e.target).closest('.modal-body').find('.guests-input').val(),
                             Comments: $(e.target).closest('.modal-body').find('.comment-input').val(),
                             Requirements: guestText,
                             DrId: $(e.target).closest('.modal-body').find('.rsvpdeathRecordId').val(),
                             EventId: $(e.target).closest('.modal-body').find('.rsvpeventId').val(),
                             Password: password,
                             TimeslotIndex: timeslot,
                             'g-recaptcha-response': capt
                     },
                     type: "POST",
                     error: function(err) {
                         console.error(err);
                     },
                     success: function(data) {
                         var res = $.parseJSON( data );
                         if (res.success) {
                             //console.log('RSVP Submitted successfully');
                             $(".succ-rsvp").text(res.msg).show();
                             $(".err-rsvp").hide();
                         } else {
                             //alert('something went wrong, Please try again.');
                             $(".err-rsvp").text(res.msg).show();
                             $(".succ-rsvp").hide();
                             $('.rsvpmodal').find('.rsvpForm').show();
                         }
                     },
                 }).always(function(){
                    rsvpposting = false;
                    $('.rsvpmodal').find('.loader').hide();
                });
            }
            
    
    });
    
}(frpJQ));

// Start Google Maps stuff
var map;
var directionsDisplay;
var directionsService;
var place;

function sendSMSMessage(form){
        
    var $ = frpJQ;
    var phoneNum = $(form).find('input[name="phnum"]').val();
    var mapId = $(form).find('input[name="mapid"]').val();
    var carrier=  $(form).find('#carrier-select').find(":selected").val();
    var eventName =  $(form).find('input[name="eventName"]').val();
    var toAddress = $(form).find('input[name="toAddress"]').val();
    var safeName = $(form).find('input[name="safeName"]').val();
    $.ajax({
        url: 'ajax/directions.php',//'service-details.php',
        type: 'POST',
        data: {phnum: phoneNum, mapid: mapId, eventName: eventName, toAddress: toAddress, phcarrier:carrier}, 
        success: function(data){
                    var result=$.parseJSON(data);
                    if (result.success) {
                        $('#smsModal-'+safeName).foundation('close');
                        $('#directionsModalSent').foundation('open');
                    }else if(result.phoneError){
                        $('.err-sms-sp').text(result.errMessage);
                    } else {
                        alert('Something Went Wrong, Please Try Again!');
                    }
                }   
    }).fail(function(){
        alert('Something Went Wrong, Please Try Again!');
    }).always(function(){
    });    
}

function renderGoogleMap(ev,safeName){
    
    var $ = frpJQ;
    let element = document.getElementById('directionsModal-${safeName}');
    let eventAddress= $(element).find('input[name="eventAddress"]').val();
    
    GoogleMapInit(safeName);
    GoogleMapGeoCode(safeName,eventAddress)
    // directions-map
}
    
    
    

function prepCalcRoute(ev){
    var $ = frpJQ;
    let modal = $(ev.toElement.closest('.directionsModal'));
    let safeName = $(modal).find('input[name="safeName"]').val();
    let eventAddress = $(modal).find('input[name="eventAddress"]').val();

    // GoogleMapInit(safeName);
    // GoogleMapGeoCode(safeName,eventAddress)
    GoogleMapCalcRoute(safeName,eventAddress);
}
function GoogleMapInit(safeName){
    
    var $ = frpJQ;
    //show the direction panel
    let isDirectionMap = 1
    if (isDirectionMap == 1)
    {
        $('#control'+safeName).css('display', 'block');
        //$('#bom-googlemap-'+safeName).css('width', '400px');
    }
    else
    {
        $('#bom-googlemap-'+safeName).css('width', '600px');
    }

    var options = {
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
        }
    };

    map = new google.maps.Map(document.getElementById('bom-googlemap-'+safeName), options);
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    
}

function GoogleMapGeoCode(safeName,eventAddress){
    
    var $ = frpJQ;
    let useCoords = 0;
    if (useCoords == 0){
        let address = eventAddress;
        // let address = document.getElementById('directions-'+safeName).value;
        place = address;
        geocoder = new google.maps.Geocoder();
        geocoder.geocode( { 'address': address}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location
                });
            }else {
                $('#bom-googlemap-${safeName}').html('<div class="map-error">Location of this event cannot be found on Google Maps.</div>')
            }
        });
    }
    else{
        point = new google.maps.LatLng( coords['lat'], coords['lng'] );
        place = point;
        map.setCenter(point);
        var marker = new google.maps.Marker({
            map: map,
            position: point
        });
    }
    google.maps.event.addDomListener(window, 'load', GoogleMapInit.bind(this,safeName));
}

function GoogleMapCalcRoute(safeName,address) {

    var $ = frpJQ;
    var start = document.getElementById('directions-${safeName}').value;
    end = address;

    var request = {
        origin:start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {            
            directionsDisplay.setDirections(result);
            directionsDisplay.setPanel(document.querySelector('#directionspanel-${safeName}'));
        }else {
            //show user directions were not OK
            $('#directionspanel-${safeName}').html('<div class="directions-error">Invalid Starting Address. Please be more specific.</div>')
        }
    });
}
    // End Google Maps stuff
