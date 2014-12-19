// Init
var totalWidth = 0;
var maxScrollPosition = 0;

function serverRequest(endpoint, method, json, success){
  $.ajax({
    type: method,
    url: endpoint,
    data: json,
    dataType: 'JSON',
    success: function(data){
      success(data);
    },
    error: function() {
      alert('Could not reach server.');
    }
  });
}

function refreshGallery(data){
  //Delete Old Images
  $("#imgur-results").empty();
  totalWidth = 0;
  //Fill with new
  $.each(data.data, function(i,data){
    if(!data.is_album){
    $("<img/>").attr("src", 'http://i.imgur.com/' + data.id + '.jpg').attr("class", "gallery__img").attr("alt", "")
    .one('load',function() {
      //Change gallery width on image load
      totalWidth = totalWidth + $(this).parent().outerWidth(true);
      $(".gallery").width(totalWidth);
      maxScrollPosition = totalWidth - $(".gallery-wrap").outerWidth();
    }).appendTo(
      //$("<a/>").attr("class", "gallery__link").attr("id", "single_image").attr("href", 'http://imgur.com/gallery/' + data.id)
      //.appendTo(
        $("<div/>").attr("class", "gallery__item").attr("data-content", data.title)
        .on("click",function(){
          var div = $(this);
          serverRequest('/api/upvotes', 'POST', data, function(d){
            //Make border green for upvoted image
            div.find(".gallery__img").css("border", "4px solid #85BF25");
            //One time only upvote
            div.off("click");
            div.addClass("gallery__item-off");
          });
        })
        .appendTo("#imgur-results"));
    }
    if ( i == 19 ) return false;
  });

  //Find first image
  $(".gallery__item:first").addClass("gallery__item--active");
  $(".gallery").css({ "left": "0"});
};

function toGalleryItem(targetItem){
    if(targetItem.length){
        var newPosition = targetItem.position().left;
        if(newPosition <= maxScrollPosition){
            targetItem.addClass("gallery__item--active");
            targetItem.siblings().removeClass("gallery__item--active");
            $(".gallery").animate({
                left : - newPosition
            });
        } else {
            $(".gallery").animate({
                left : - maxScrollPosition
            });
        };
    };
};

$(window).load(function(){
  //Check url hash
  if(document.location.hash.length > 0){
    //If url contains an hash string
    $('#imagesearch').val(unescape(document.location.hash.substring(1)));
    //Request images from api
    var data = {search : unescape(document.location.hash.substring(1))};
    serverRequest('/api/getimages', 'POST', data, function(d){
      //Load new images
      refreshGallery(d);
    });
  }else{
    //Initial state (get imgur frontpage pictures)
    serverRequest('/api/getfrontpage', 'GET', {}, function(d){
      //Load new images
      refreshGallery(d);
    });
  }

    // Search imgur for related pictures
  $('#imagesearch').bind('input propertychange', function() {
    document.location.hash = escape($('#imagesearch').val());
    if(document.location.hash.length > 0){
      //console.log($('#imagesearch').val());
      var data = {
        search : $('#imagesearch').val()
      };
      serverRequest('/api/getimages', 'POST', data, function(d){
        //Load new images
        refreshGallery(d);
      });
    }else{
      //Initial state (get imgur frontpage pictures)
      serverRequest('/api/getfrontpage', 'GET', {}, function(d){
        //Load new images
        refreshGallery(d);
      });
    }
  });

  // When the prev button is clicked
  $(".gallery__controls-prev").click(function(){
      // Set target item to the item before the active item
      var targetItem = $(".gallery__item--active").prev();
      toGalleryItem(targetItem);
  });

  // When the next button is clicked
  $(".gallery__controls-next").click(function(){
      // Set target item to the item after the active item
      var targetItem = $(".gallery__item--active").next();
      toGalleryItem(targetItem);
  });
});
