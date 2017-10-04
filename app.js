var map,
    infoWindow,
    markers = [];

// my locations arrey to add markers and knockout
var locations = [
    {title: "Six flags America", location:{lat: 38.907313, lng: -76.774371}},
    {title: "Mount Vernon, VA", location:{lat: 38.707961, lng: -77.086521}},
    {title: "Smithsonian National Museum", location:{lat: 38.888152, lng: -77.019868}},
    {title: "Burke Lake Park", location:{lat :38.760764, lng: -77.307478}},
    {title: "Ocean City, VA", location:{lat: 38.391591, lng: -75.064601}}
];

// initalizes the map.
function initMap() {

  // loads the map in an html element with an id = map
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10, center:{lat: 38.907313, lng: -76.774371}
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
      animation: google.maps.Animation.DROP,
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
    if (infoWindow.marker != marker) {
      infoWindow.marker = marker;

      infoWindow.setContent("<div><h2>" + marker.title + "</h2></div>" + "<div id=\"wiki-container\">" +
          "<h3 id=\"wikipedia-header\">Relevant Wikipedia Links</h3>" +
          "</div>");

// wiki api adds links for more relevent information to their apropriate infoWindow.
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
  var self = this;

//initializes filter with a value to avoid error in filteredItems
  this.filter = ko.observable('');

// opens the infoWindow and centers on a marker when an item is selected from the side panel
  this.panToMap = function(location) {

// uses the location object in the locations arrey to center on a marker
    map.panTo(location.location);
    google.maps.event.trigger(location.markers, 'click');
  }

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
}
