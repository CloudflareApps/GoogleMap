(function () {
  if (!document.addEventListener) return

  const CALLBACK_FUNCTION_NAME = 'EagerGoogleMapAPICallback'
  const API_KEY = 'AIzaSyB1G6nET3SgFcsP5Gd42hJVJ3rKGIl7zDo'
  const options = INSTALL_OPTIONS
  let mapEl

  window[CALLBACK_FUNCTION_NAME] = function cloudflareGoogleMapLoad () {
    const {maps} = window.google
    const geocoder = new maps.Geocoder()

    geocoder.geocode({address: options.location.address}, (results, status) => {
      if (status !== maps.GeocoderStatus.OK) return

      const [result] = results

      const center = result.geometry.location

      const mapOptions = {
        zoom: parseInt(options.zoom, 10),
        center,
        mapTypeId: maps.MapTypeId[options.mapTypeId],
        panControl: false,
        zoomControl: false,
        scaleControl: false,
        disableDefaultUI: true,
        scrollwheel: false
      }

      const map = new maps.Map(mapEl, mapOptions)

      function setMapScrollWheelOption (value) {
        map.setOptions({scrollwheel: value})
      }

      maps.event.addListener(map, 'mousedown', () => setMapScrollWheelOption(true))

      maps.event.addDomListener(window, 'scroll', () => setMapScrollWheelOption(false))

      maps.event.addDomListener(document.body, 'click', event => {
        if (!mapEl.contains(event.target)) {
          setMapScrollWheelOption(false)
        }
      })

      maps.event.addDomListener(window, 'resize', () => map.setCenter(center))

      function pluck (typeName) {
        for (var i = 0; i < result.address_components.length; i++) {
          if (result.address_components[i].types[0] === typeName) {
            return result.address_components[i].short_name
          }
        }

        return ''
      }

      if (options.location.showMarker) {
        const marker = new maps.Marker({
          map,
          position: result.geometry.location,
          draggable: true,
          animation: maps.Animation.DROP
        })

        const infoWindow = new maps.InfoWindow({
          content: `
            <div style="position: relative; line-height: 1.34; min-width: 91px; min-height: 53px; overflow: hidden; white-space: nowrap; display: block; color: #000;">
              <div style="margin-bottom: 2px; font-weight: 400">
                ${options.location.title}
              </div>

              <div>
                ${pluck('street_number')} ${pluck('route')}
                <br>
                ${pluck('locality')}, ${pluck('administrative_area_level_1')} ${pluck('postal_code')}
              </div>
            </div>
          `
        })

        maps.event.addListener(marker, 'click', () => {
          infoWindow.open(map, marker)
        })
      }
    })
  }

  function loadScript () {
    var script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `https://maps.googleapis.com/maps/api/js?v=3.exp&key=${API_KEY}&callback=${CALLBACK_FUNCTION_NAME}`
    document.body.appendChild(script)
  }

  function updateElement () {
    const appContainer = INSTALL.createElement(options.container)
    const mapContainer = document.createElement('div')

    mapContainer.className = 'eager-google-map-container'
    mapContainer.innerHTML = `
      <style>
        .eager-google-map-container {
          position: relative;
          height: 0;
          padding-bottom: ${options.aspectRatio}%;
        }
        .eager-google-map {
          position: absolute;
          top: 0;
          height: 100%;
          left: 0;
          width: 100%;
          background: #e5e3df;
        }
      </style>

      <div class="eager-google-map">
        <div></div>
      </div>
    `

    mapEl = mapContainer.querySelector('.eager-google-map')
    appContainer.appendChild(mapContainer)

    loadScript()
  }

  if (document.readyState !== 'loading') {
    updateElement()
  } else {
    document.addEventListener('DOMContentLoaded', updateElement)
  }
}())
