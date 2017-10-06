var map,
    infoWindow,
    markers = [];

// initalizes the map.
function initMap() {

  // loads the map in an html element with an id = map
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8, center:{lat: 38.907313, lng: -76.774371}
  });

  infoWindow = new google.maps.InfoWindow();

  // iterates through the locations arrey to create markers and infoWindow
  for (var i = 0; i < locations.length; i++) {
    createMarkersForPlaces();
  }

// creates markers for each locations item
  function createMarkersForPlaces() {
    var position = locations[i].location;
    var title = locations[i].title;

    var marker = new google.maps.Marker({
      position: position,
      map: map,
      title: title,
      id: i,
      zoom: 13
    });

// opens the infoWindow for a marker when it is selected on the map
    marker.addListener('click', function() {
      populateInfoWindow(this, infoWindow);
    });

// passes each marker back to the locations object arrey to be used in knockout
    locations[i].markers = marker;
  }

// the knockout viewModel had to be called here after the markers were made to avoid
// errors when they were selected from the side panel
  var viewModel = new ViewModel();

  ko.applyBindings(viewModel);

  // this function adds content to the infoWindow when a marker is selected.
  function populateInfoWindow(marker, infoWindow) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    }, 750);
    if (infoWindow.marker != marker) {
      infoWindow.marker = marker;

// wiki api adds links for more relevent information to their apropriate infoWindow.
      var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
      $.ajax({
        url: wikiUrl,
        dataType: 'jsonp',
        success: function(responce) {
          console.log(responce);
            var articleStr = responce[1];
            var url = responce[3];
            var info = responce[2];
            infoWindow.setContent("<div><h2>" + marker.title + "</h2></div>" + "<div>" +
                "<h3 id=\"wikipedia-header\">Relevant Wikipedia Link</h3>" +
                "<p><a href=\"" + url[0] + "\">" + articleStr[0] + "</a></p>" +
                "<p>" + info[0] + "</p></div>");
        },
        error: function (jqXHR, exception) {
          var message = '';
          if (jqXHR.status === 0) {
              message = 'Not connect.\n Verify Network.';
          } else if (jqXHR.status == 404) {
              message = 'Requested page not found. [404]';
          } else if (jqXHR.status == 500) {
              message = 'Internal Server Error [500].';
          } else if (exception === 'parsererror') {
              message = 'Requested JSON parse failed.';
          } else if (exception === 'timeout') {
              message = 'Time out error.';
          } else if (exception === 'abort') {
              message = 'Ajax request aborted.';
          } else {
              message = 'Uncaught Error.\n' + jqXHR.responseText;
          }
          infoWindow.setContent(message);
        },
      });

      infoWindow.open(map, marker);
      infoWindow.addListener('closeclick', function() {
        infoWindow.marker = null;
      });
    }
    infoWindow.open(map, marker);
  }
}

// pop-in and pop-out the side panel
function myFunction(x) {
    x.classList.toggle("change");
    if(document.getElementById("search-panel").style.left !== "0" && document.getElementById("map").style.left !== "370px") {
      document.getElementById("search-panel").style.left = "0";
      document.getElementById("map").style.left = "370px";
    } else {
      document.getElementById("search-panel").style.left = "-360px";
      document.getElementById("map").style.left = "0";
    }
}

// error handling for the map
function mapError() {
  $("#map").append("<h1>Error while loading the map!</h1>");
}

// this section utilizes the knockout library.
var ViewModel = function() {
  var self = this;

//initializes filter with a value to avoid error in filteredItems
  this.filter = ko.observable('');

// opens the infoWindow and centers on a marker when an item is selected from the side panel
  this.panToMap = function(location) {

// uses the location object in the locations arrey to center on a marker
    map.panTo(location.location);
    google.maps.event.trigger(location.markers, 'click');
  };

// knockout filter function to 'filter' items in the side panel
  this.filteredItems = ko.computed(function() {

// makes values in the search bar to lower case
      var selector = self.filter().toLowerCase();
      return ko.utils.arrayFilter(locations, function(item) {

// the locations that do not return value of -1 when knockout is filtering and stores them in match
         var match = item.title.toLowerCase().indexOf(selector) !== -1;

// returns the filtered items to the side panel
         item.markers.setVisible(match);
         return match;
      });
  });
};
