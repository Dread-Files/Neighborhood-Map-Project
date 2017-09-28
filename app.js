var map,
    infoWindow,
    markers = [];


var locations = [
    {title: "Six flags America", location:{lat: 38.907313, lng: -76.774371}},
    {title: "Mount Vernon, VA", location:{lat: 38.707961, lng: -77.086521}},
    {title: "Smithsonian National Museum", location:{lat: 38.888152, lng: -77.019868}},
    {title: "Burke Lake Park", location:{lat :38.760764, lng: -77.307478}},
    {title: "Ocean City, VA", location:{lat: 38.391591, lng: -75.064601}}
];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10, center:{lat: 38.907313, lng: -76.774371}
  });

  infoWindow = new google.maps.InfoWindow();

  for (var i = 0; i < locations.length; i++) {
    createMarkersForPlaces();
  }

  function createMarkersForPlaces() {
    var position = locations[i].location;
    var title = locations[i].title;

    var marker = new google.maps.Marker({
      position: position,
      animation: google.maps.Animation.DROP,
      map: map,
      title: title,
      id: i
    });

    marker.addListener('click', function() {
      populateInfoWindow(this, infoWindow);
    });

    markers.push(marker);
  }

  function populateInfoWindow(marker, infoWindow) {
    if (infoWindow.marker != marker) {
      infoWindow.marker = marker;

      infoWindow.setContent("<div><h2>" + marker.title + "</h2></div>" + "<div id=\"wiki-container\">" +
          "<h3 id=\"wikipedia-header\">Relevant Wikipedia Links</h3>" +
          "</div>");

      var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
      $.ajax({
        url: wikiUrl,
        dataType: 'jsonp',
        success: function(responce) {
          console.log(responce);
          var articlelist = responce[3];
          for(var i = 0; i < articlelist.length; i++) {
            articleStr = articlelist[i];
            var url = 'http://en.wikipidia.org/wiki/' + articleStr;
            var $wikiElem = $('#wiki-container');
            $wikiElem.append('<span><a href="' + url + '">' + articleStr + '</a></span><br>');
          }
        }
      });

      infoWindow.open(map, marker);
      infoWindow.addListener('closeclick', function() {
        infoWindow.marker = null;
      });
    }
    infoWindow.open(map, marker);
  }
}

document.getElementById('search-button').addEventListener('click', function search() {
  var geocoder = new google.maps.Geocoder();
  var address = document.getElementById('search-box').value;
  if (address == " ") {
    console.log("Please enter an address!");
  }
  else {
    geocoder.geocode(
      {address: address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
          map.setZoom(8);
        }
          else {
            window.alert("Location could not be found, please try again.");
          }
      });
  }
});

var ViewModel = function() {
  var self = this;

  this.listMarkers = ko.observableArray();
  for(var i = 0; i < locations.length; i++) {
    this.listMarkers.push(locations[i]);
    this.className = listMarkers[i].title;
  }

  this.panToMap function() {
    var data = className;
    for(var i = 0; i < locations.length; i++) {
      if (data == listMarkers[i].title) {
        var lat = locations[i].location.lat;
        var lng = locations[i].location.lat;
        google.maps.panTo(lat, lng)
      }
    }
  }
}

var viewModel = new ViewModel();

ko.applyBindings(viewModel);
