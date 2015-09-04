
//

// putting google maps and foursquare into one function.
function GoogleMapsAndFoursquare() {
    // for more info about 'user strict', go to link: http://stackoverflow.com/questions/4462478/jslint-is-suddenly-reporting-use-the-function-form-of-use-strict.//
    'use strict';

    

// the following function is to establish the structure of the info window of each click.//     
    function createInfoWindow(venue) {
        var contentString = '<div class="venue-infowindow">' 
                        + '<div class="venue-name">'
                        + '<a href ="' + venue.foursquareUrl + '">'
                        + venue.name
                        + '</a>'
                        + '</div>'
                        + '<div class="venue-contact">'
                        + venue.contact.formattedPhone
                        + '</div>'
                        + '</a>'
                        + '<div class="venue-url">'
                        + venue.url
                        + '</div>'                                                                                  
                        + '</div>';

        return  contentString;
    }
    
    // The following codes are to load data from foursquare//
    // reference: https://developer.foursquare.com/start/search//
    var $h1 = $('h1'),
        foursquare_ID = 'S2EMNUJJK1YLQSOOZRAUCDAGAJBYPKUQ0LJ22YGXNIKJ3Q2E',
        foursquare_SECRET = 'S1SC00UAMLUAI5D3NYIM1K10QPQR4BINK4LBFZLZRGQYFRLM',
        foursquare_VERSION = '20130815',
        infowindow = null;
    
    function getFourSquareData(data, map, marker) {

        var foursquareURL = 'https://api.foursquare.com/v2/venues/search?client_id=' + foursquare_ID + '&client_secret=' + foursquare_SECRET + '&v=' + foursquare_VERSION + '&ll='+ data.position.lat + ',' + data.position.lng + '&query=' + data.title;

        $.getJSON(foursquareURL, function(json) {
            
            var venues = json.response.venues;

            for (var key in venues) {
                if (venues[key].name === data.title) {
                    var foursquareContent = createInfoWindow(venues[key]);
                    // reference: https://developers.google.com/maps/documentation/javascript/markers
                    if (infowindow) {
                        infowindow.close();
                    }
                    infowindow = new google.maps.InfoWindow({
                        content: foursquareContent
                    });
                    // the following code defines showing info window when user clicks on the marker or list.//
                    infowindow.open(map, marker);
                }
            }
        }).error(function(e) {
            $h1.empty().text('Palo Alto Coffee Shops info could not be loaded');
        });
    }


// the following function is to set up the default when initially loading the website, by defining the area geolocation and pulling places from data.js//
    function initializeMap() {
        // the follwoing mapOptions defines the area of the city, Palo Alto.
        // reference: http://mygeoposition.com/
        var mapOptions,
            Palo_Alto_Coffee_Shops_LAT = 37.4241060,
            Palo_Alto_Coffee_Shops_LNG = -122.1660760,
            map;
            
            mapOptions = {
                zoom: 12,
                center: new google.maps.LatLng(Palo_Alto_Coffee_Shops_LAT, Palo_Alto_Coffee_Shops_LNG)
            };
            // The followoing code defines variable "map" as a new Map object and attaches it to map-canvas, also passes options defined within mapOptions
            map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

        var addMarker = function(data) {
          
            
            return new google.maps.Marker({
                map: map,
                title: data.title,
                position: data.position,
                animation: google.maps.Animation.DROP,
            });

            // marker.addListener('click', toggleBounce);
        };

        // The following code defines that when a marker on the map is clicked, the infowindow will be opened//
        var openInfoWindow = function(data) {
            var marker = data.marker;

            google.maps.event.addListener(marker, 'click', function() {
                getFourSquareData(data, map, marker);
            });
        };

        // see: data.js//
        var CoffeeShop = function(coffeeShopTitle, coffeeShopPosition, coffeeShopMarker) {
            var self = this;

            self.title = coffeeShopTitle;
            self.position = coffeeShopPosition;
            self.marker = coffeeShopMarker;
        };

        var CoffeeShopViewModel = function() {
            var self = this;

            self.locations = ko.observableArray();
            self.searchInput = ko.observable('');

            // the following code defines how to filter search from an existing list//
            self.filteredLocations = ko.computed(function() {
                return ko.utils.arrayFilter(self.locations(), function(location) {
                    if ( location.title.toLowerCase().match( self.searchInput().toLowerCase() ) ) {
                        return location;
                    }
                });
            });

            self.triggerMarker = function(coffeeShop) {
                google.maps.event.trigger(coffeeShop.marker, 'click');
            };

            // Bounces marker when user clicks on it
            function bounceMarker(coffeeshop) {
                var marker = self.locations()[key].marker;


                // For more info see: https://developers.google.com/maps/documentation/javascript/markers
                function toggleBounce() {
                    for ( var key in self.locations() ) {
                        if (marker.getAnimation() !== null) {
                            marker.setAnimation(null);
                        } else {
                            marker.setAnimation(google.maps.Animation.BOUNCE);

                            // Set the bouncing time to 900 ms.
                            setTimeout(function() {
                                marker.setAnimation(null);
                            }, 900);
                        }
                    }
                }

                google.maps.event.addListener(marker, 'click', toggleBounce);
                // google.maps.event.addListener(marker, 'click', function() {
                //     toggleBounce();
                // });


            }

        // window.addEventListener('load', function() {
        // var status = document.getElementById("status");

        // function updateOnlineStatus(event) {
        //     var condition = navigator.online ? "online" : "offline";

        //     status.className = condition;
        //     status.innerHTML = condition.toUpperCase();

        //     log.insertAdjacentHTML("beforeend", "Event: " + event.type + "; status: " + condition);
        // }
        // window.addEventListener('online', updateOnlineStatus);
        // window.addEventListener('offline', updateOnlineStatus);
        //  });

            function reAddMarkers() {
                for ( var key in self.filteredLocations() ) {
                    var marker = self.filteredLocations()[key].marker;

                    // For more info see: https://developers.google.com/maps/documentation/javascript/markers
                    marker.setMap(map);

                    openInfoWindow( self.filteredLocations()[key] );
                    bounceMarker( self.locations()[key] );
                }
            }

            // Populates map with markers
            for (var key in coffeeShops) {
                var coffeeShopMarker = new CoffeeShop(
                    coffeeShops[key].title,
                    coffeeShops[key].position,
                    addMarker(coffeeShops[key])
                );
                self.locations.push(coffeeShopMarker);
            }

            // The following code activates marker info windows//
            for (var key in self.locations()) {
                openInfoWindow( self.locations()[key] );
                bounceMarker( self.locations()[key] );
            }

            // the following code defines the "filteredLocations" and if there is a change, sets markers to null and re-adds "filteredLocations" markers
            self.filteredLocations.subscribe(function() { 
                for ( var key in self.locations() ) {
                    var marker = self.locations()[key].marker;

                    marker.setMap(null);
                }
                reAddMarkers();
            });
        };

        ko.applyBindings(new CoffeeShopViewModel());
    }

    // Calls initializeMap() when page loads
    google.maps.event.addDomListener(window, 'load', initializeMap());
}

GoogleMapsAndFoursquare();