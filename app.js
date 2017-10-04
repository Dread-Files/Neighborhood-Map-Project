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
//initalizes the map.
function initMap() {
  //embeds the map in an html element with the id = map
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10, center:{lat: 38.907313, lng: -76.774371}
  });

  infoWindow = new google.maps.InfoWindow();
  // create the infoWindow for each item in the locations arrey.
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
      id: i,
      zoom: 13
    });

    marker.addListener('click', function() {
      populateInfoWindow(this, infoWindow);
    });

    markers.push(marker);
  }
  // this function adds content to the infoWindow when a marker is selected.
  function populateInfoWindow(marker, infoWindow) {
    if (infoWindow.marker != marker) {
      infoWindow.marker = marker;

      infoWindow.setContent("<div><h2>" + marker.title + "</h2></div>" + "<div id=\"wiki-container\">" +
          "<h3 id=\"wikipedia-header\">Relevant Wikipedia Links</h3>" +
          "</div>");
      // this section uses  wiki api to add links for more relevent information.
      var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
      $.ajax({
        url: wikiUrl,
        dataType: 'jsonp',
        success: function(responce) {
          console.log(responce);
          var articlelist = responce[1];
          for(var i = 0; i < articlelist.length; i++) {
            articleStr = articlelist[i];
            var url = 'http://en.wikipidia.org/wiki/' + responce[3];
            var $wikiElem = $('#wiki-container');
            $wikiElem.append('<span><a href=\"' + url + '\">' + articleStr + '</a></span><br>');
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

// this section utilizes the knockout library.
var ViewModel = function() {
  // here the elements in locations arrey is passed to listMarkers arrey and then displayed in a list, in the side panel.
  this.listMarkers = ko.observableArray([]);
  for(var i = 0; i < locations.length; i++) {
    this.listMarkers.push(locations[i]);
  }
  // this function is suppose to filter throught the list when text is entered in the search bar, currently isn't working properly.
  this.panToMap = ko.computed(function() {
    this.data = document.getElementById("#selector");
    console.log(this.data);
    for(var i = 0; i < locations.length; i++) {
      this.lat = ko.observable();
      this.lng = ko.observable();
      if (this.data === locations[i].title) {
        this.lat = locations[i].location.lat;
        this.lng = locations[i].location.lng;
        google.maps.panTo(this.lat, this.lng);
      }
    }
  });

  this.filteredItems = ko.computed(function() {
      this.filter = ko.observable();
      if (!filter) {
          return this.listMarkers;
      } else {
          return ko.utils.arrayFilter(this.listMarkers, function(item) {
              return ko.utils.stringStartsWith(listMarkers.title.toLowerCase(), filter);
          });
      }
  });
}


var viewModel = new ViewModel();

ko.applyBindings(viewModel);
