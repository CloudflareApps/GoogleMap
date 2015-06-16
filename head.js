(function(){
  if (!document.addEventListener) return;

  var installOptions, ready, callbackFunctionName, loadScript, mapEl;

  installOptions = INSTALL_OPTIONS;

  ready = function(fn) {
    if (document.readyState != 'loading'){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  };

  callbackFunctionName = 'EagerGoogleMapAPICallback';

  window[callbackFunctionName] = function() {
    var geocoder = new google.maps.Geocoder;

    geocoder.geocode({
      address: installOptions.location.address,
    }, function(results, status) {
      if (status !== google.maps.GeocoderStatus.OK) {
        return;
      }

      var center, mapOptions, map, marker, pluck, infoWindow;

      center = results[0].geometry.location;

      mapOptions = {
        zoom: parseInt(installOptions.zoom, 10),
        center: center,
        mapTypeId: google.maps.MapTypeId[installOptions.mapTypeId],
        panControl: false,
        zoomControl: false,
        scaleControl: false,
        disableDefaultUI: true,
        scrollwheel: true
      };

      map = new google.maps.Map(mapEl, mapOptions);

      google.maps.event.addDomListener(window, 'resize', function(){
        map.setCenter(center);
      });

      if (installOptions.location.showMarker) {
        marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
          draggable: !0,
          animation: google.maps.Animation.DROP
        });

        pluck = function(typeName) {
          for (var i = 0; i < results[0].address_components.length; i++) {
            if (results[0].address_components[i].types[0] === typeName) {
              return results[0].address_components[i].short_name;
            }
          }

          return '';
        };

        infoWindow = new google.maps.InfoWindow({
          content: '' +
            '<div style="position: relative; line-height: 1.34; min-width: 91px; min-height: 53px; overflow: hidden; white-space: nowrap; display: block; color: #000;">' +
              '<div style="margin-bottom: 2px; font-weight: 400">' +
                installOptions.location.title +
              '</div>' +
              '<div>' +
                pluck('street_number') + ' ' + pluck('route') + '<br>' +
                pluck('locality') + ', ' + pluck('administrative_area_level_1') + ' ' + pluck('postal_code') +
              '</div>' +
            '</div>' +
          ''
        });

        google.maps.event.addListener(marker, 'click', function() {
          infoWindow.open(map, marker)
        });
      }
    });
  };

  var loadScript = function() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true&callback=' + callbackFunctionName;
    document.body.appendChild(script);
  }

  ready(function(){
    var appContainer, mapContainer;

    appContainer = Eager.createElement(installOptions.container);
    mapContainer = document.createElement('div');
    mapContainer.className = 'eager-google-map-container';
    mapContainer.innerHTML = '' +
      '<style>' +
        '.eager-google-map-container {' +
          'position: relative;' +
          'height: 0;' +
          'padding-bottom: ' + installOptions.aspectRatio + '%;' +
        '}' +
        '.eager-google-map {' +
          'position: absolute;' +
          'top: 0;' +
          'height: 100%;' +
          'left: 0;' +
          'width: 100%;' +
          'background: #e5e3df;' +
        '}' +
      '</style>' +
      '<div class="eager-google-map"><div></div></div>' +
    '';
    mapEl = mapContainer.querySelector('.eager-google-map');
    appContainer.appendChild(mapContainer);

    loadScript();
  });
})();
