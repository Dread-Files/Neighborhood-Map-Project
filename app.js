console.log(marker);
// Check to make sure the infowindow is not already opened on this marker.
if (infowindow.marker != marker) {
    infowindow.setContent('loading...');
    infowindow.open(map, marker);

    var client_id = 'BHU3FSEQDCGVDVFR1MYUNCKJK0HIUZ4SSLPMLDNQTWJCQBNG',
        client_secret = 'QWJVQ0MLI1U4L0ZVHB4W5OJKPYGQEK2GPBF4LQNQJHVBV45X',
        query = "restaurant",
        location,
        venue;

    $.ajax({
        url:'https://api.foursquare.com/v2/venues/search',
        dataType: 'json',
        data:   {
            limit: '1',
            ll: '40.707496,-73.990774',
            query: marker.title,
            client_id: client_id,
            client_secret: client_secret,
            v: '20161113'
        }
     }).done(function (data) {
         // If incoming data has a venues object set the first one to the var venue
         venue = data.response.hasOwnProperty("venues") ? data.response.venues[0] : '';

         // If the new venue has a property called location set that to the variable location
         location = venue.hasOwnProperty('location') ? venue.location : '';
         // If new location has prop address then set the observable address to that or blank
         if (location.hasOwnProperty('address')) {
             var address = location.address || '';
         }

        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div><p>' + address + '</p>');
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });

     }).fail(function (e) {
         infowindow.setContent('<h5>Foursquare data is unavailable.</h5>');
         self.showMessage(true);
     });
}
}
