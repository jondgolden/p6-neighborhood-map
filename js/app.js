var infowindow, map, marker;

// hard-coded locations for the map
var Locations = [{
    "name": "Taco Mamacita",
    "address": "109 N Market St, Chattanooga, TN 37405",
    "latLng": {lat: 35.063960, lng: -85.309651},
},
{
    "name": "Urban Stack Burger Lounge",
    "address": "12 W 13th St, Chattanooga, TN 37402",
    "latLng": {lat: 35.039239, lng: -85.308595},
},
{
    "name": "Terminal Brewhouse",
    "address": "6 E 14th St, Chattanooga, TN 37408",
    "latLng": {lat: 35.036630, lng: -85.307064},
},
{
	 "name": "Community Pie",
   "address": "850 Market St, Chattanooga, TN 37402",
	 "latLng": {lat: 35.046463, lng: -85.309176},
},
{
	 "name": "Clyde's on Main",
   "address": "122 W Main St, Chattanooga, TN 37408",
	 "latLng": {lat: 35.036617, lng: -85.309202},
},
{
    "name": "Good Dog",
    "address": "34 Frazier Ave, Chattanooga, TN 37405",
    "latLng": {lat: 35.062256, lng: -85.307432},
},
{
	 "name": "Revelator Coffee Company",
   "address": "10 Frazier Ave, Chattanooga, TN 37405",
	 "latLng": {lat: 35.062410, lng: -85.308430},
},
{
    "name": "Brash Coffee",
    "address": "1110 Market St, Chattanooga, TN 37402",
    "latLng": {lat: 35.043158, lng: -85.308971},
}];

function Place(data) {
    this.name = data.name;
    this.address = data.address;
    this.latLng = data.latLng;
    this.marker = ko.observable(data.marker);
}

var ViewModel = function() {
  var self = this;

  // when list item is clicked, links list view to marker
  self.itemClick = function(marker) {
        google.maps.event.trigger(this.marker, 'click');
  };

  // Google Map centered on Chattanooga, TN
  self.googleMap = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 35.045733, lng: -85.309542},
    zoom: 14,
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.LARGE,
      position: google.maps.ControlPosition.RIGHT_BOTTOM
     }
  });

  var contentString;
  //google map InfoWindow
  self.infowindow = new google.maps.InfoWindow({
    content: contentString
  });

  // new place object is created for each Location object
  self.allLocations = [];
  Locations.forEach(function(place) {
    self.allLocations.push(new Place(place));
  });

  // Places markers onto map
  self.allLocations.forEach(function(place) {

    var markerOptions = {
      map: self.googleMap,
      position: place.latLng
    };

    place.marker = new google.maps.Marker(markerOptions);

     // Foursquare API
      var clientID = "IZKUGM502WGW00IQIQ1IP0HS3IVLGKYOLFKDSGQSGYOKQETQ";
      var clientSecret = "R2W4UNPCDIQMGCPBNUVWKSTEQJOFQ1RQISCAASWP2RLNSGTW";
      var foursquareURL = 'https://api.foursquare.com/v2/venues/search?limit=1&ll=' + place.latLng.lat + ',' + place.latLng.lng + '&client_id=' + clientID + '&client_secret='+ clientSecret + '&v=20140806';
      var results, name, url, street, city;

      $.getJSON(foursquareURL, function(data){
        results = data.response.venues[0],
        place.name = results.name,
        place.url= results.hasOwnProperty('url') ? results.url : '';
        place.street = results.location.formattedAddress[0],
        place.city = results.location.formattedAddress[1]

    // error handling
  }).fail(function() { alert("You messed up, bro.");});

    // adds click listener to marker and opens infowindow
    place.marker.addListener('click', function(){

      // set timeout for marker animation
      place.marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){ place.marker.setAnimation(null); }, 1400);


      contentString = '<h4>' + place.name + '</h4>\n<p>' + place.street + '</p>\n<p>' + place.city + '</p><a href= ' + place.url + '>' + place.url + '</a>';
      /* Open info window and set its content */
      self.infowindow.setContent(contentString);
      self.infowindow.open(self.googleMap, place.marker);
      setTimeout(function() {self.infowindow.open(null);}, 7000);

    });
  });

  //observableArray for filter function
  self.visibleLocations = ko.observableArray();

  // all locations visible upon launch of app
  self.allLocations.forEach(function(place) {
    self.visibleLocations.push(place);
  });

  // listens to user input
  self.userInput = ko.observable('');

  // checks user input to check for a match of locations
  self.filterMarkers = function() {
    var searchInput = self.userInput().toLowerCase();
    self.visibleLocations.removeAll();

   self.allLocations.forEach(function(place) {
      place.marker.setVisible(false);

      if (place.name.toLowerCase().indexOf(searchInput) !== -1) {
        self.visibleLocations.push(place);
      }
    });
    self.visibleLocations().forEach(function(place) {
      place.marker.setVisible(true);
    });
  };
};
function myMap() {
ko.applyBindings(new ViewModel());
}
function googleError(){
  if (typeof(google) === null){
    alert('Google maps is currerntly unavailable');
  }
}
