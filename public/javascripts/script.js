// Init
var totalWidth = 0;
var maxScrollPosition = 0;
var canSearch = true;

function getImages(sq){
  $.ajax({
    type: 'POST',
    url: '/api/getimages',
    data: {search:sq},
    dataType: 'JSON',
    success: function(data) {
      refreshGallery(data);
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
    $("<img/>").attr("src", 'http://i.imgur.com/' + data.id + '.jpg').attr("class", "gallery__img").attr("alt", "").appendTo(
      $("<a/>").attr("class", "gallery__link").attr("id", "single_image").attr("href", 'http://imgur.com/gallery/' + data.id).appendTo(
        $("<div/>").attr("class", "gallery__item").appendTo("#imgur-results")));
    }
    if ( i == 49 ) return false;
  });

  //Find first image
  $(".gallery__item:first").addClass("gallery__item--active");
  $(".gallery").css({ "left": "0"});
  //Find total width
  $(".gallery__item").each(function(){
    var item = $(this);
    //Only try to find width of image containers when the image is loaded
    $(this).find(".gallery__img").one('load',function() {
      totalWidth = totalWidth + item.outerWidth(true);

      $(".gallery").width(totalWidth);

      maxScrollPosition = totalWidth - $(".gallery-wrap").outerWidth();
    });
  });
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
  if(document.location.hash !=""){
    //If url contains an hash string
    $('#imagesearch').val(unescape(document.location.hash.substring(1)));
    getImages(unescape(document.location.hash.substring(1)));
  }
  else{
    //Initial state (get imgur frontpage pictures)
    $.ajax({
      type: 'GET',
      url: '/api/getfrontpage',
      dataType: 'JSON',
      success: function(data) {
        refreshGallery(data);
      },
      error: function() {
        alert('Could not reach server.');
      }
    });
  }

    // Search imgur for related pictures
  $('#imagesearch').bind('input propertychange', function() {
    document.location.hash = escape($('#imagesearch').val());
    if (canSearch) {
      canSearch = false;
      setTimeout(function(){
        canSearch = true;
        getImages($('#imagesearch').val());
      }, 500);
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
