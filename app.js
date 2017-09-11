var wikiUrl = 'http://en.wikipidia.org/w/api.php?action=opensearch&search' + marker.title + '&format=json&callback=wikicallback';
$.ajax({
  Url: wikiUrl,
  datatype: "jsonp",
  success: function( responce ) {
    var articlelist = responce[1];
    for(var i = 0; i < articlelist.lencth; i++) {
      var articleStr = articlelist[i];
      var url = 'http://en.wikipidia.org/wiki/' + articleStr;
      $wikiElem.append('<li><a href="' + url + '">' + articleStr + '</a></li>');
    };
  }

  var ViewModel = function() {
    var listMarkers = ko.observableArry(locations);
  }

  ko.applyBindings(new ViewModel());
