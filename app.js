var map;
var markers = [];
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10, center:{lat: 38.907313, lng: -76.774371}
  });

  var infoWindow = new google.maps.InfoWindow();

  var locations = [
    {title: "Six flags America", location:{lat: 38.907313, lng: -76.774371}},
    {title: "Mount Vernon", location:{lat: 38.707961, lng: -77.086521}},
    {title: "Smithsonian National Museums", location:{lat: 38.888152, lng: -77.019868}},
    {title: "Burke Lake Park", location:{lat :38.760764, lng: -77.307478}},
    {title: "Ocean City", location:{lat: 38.391591, lng: -75.064601}}
  ];

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
      populateInfoWindow(marker, infoWindow, markers);
      wikiLink();
    });

    markers.push(marker);
  }

  function populateInfoWindow(marker, infoWindow, markers) {
    if (infoWindow.marker != marker) {
      infoWindow.marker = marker;

      infoWindow.setContent('<div><h2>' + marker.title + '</h2></div>');
      infoWindow.setContent("<div class=\"wikipedia-container\">" +
          "<h3 id=\"wikipedia-header\">Relevant Wikipedia Links</h3>" +
          "</div>");
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

function wikiLink() {
  var wikiUrl = 'http://en.wikipidia.org/w/api.php?action=opensearch&search' + marker.title + '&format=json&callback=wikicallback';
  $.ajax({
    url: wikiUrl,
    datatype: "jsonp",
    success: function(responce) {
      var articlelist = responce[1];
      console.log(articlelist);
      for(var i = 0; i < articlelist.length; i++) {
        var articleStr = articlelist[i];
        var url = 'http://en.wikipidia.org/wiki/' + articleStr;
        $wikiElem.append('<li><a href="' + wikiUrl + '">' + articleStr + '</a></li>');
      }
    }
  });
}

var ViewModel = function() {
  var listMarkers = ko.observableArray();
  for(var i = 0; i < locations.length; i++) {
    listMarkers.push(locations[i]);
  }
}

ko.applyBindings(new ViewModel());
