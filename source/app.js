import * as mapStyles from './map-styles'
import createInfoWindowConfig from './create-info-window-config'

(function () {
  if (!document.addEventListener) return

  const CALLBACK_FUNCTION_NAME = 'EagerGoogleMapAPICallback'
  const API_KEY = 'AIzaSyB1G6nET3SgFcsP5Gd42hJVJ3rKGIl7zDo'
  const defaultStyles = ['roadmap', 'satellite', 'hybrid']
  let appContainer
  let mapContainer
  let options = INSTALL_OPTIONS
  let maps
  let geocoder
  let mapEl
  let map
  let center
  let marker
  let infoWindow

  window[CALLBACK_FUNCTION_NAME] = function cloudflareGoogleMapLoad () {
    maps = window.google.maps
    geocoder = new maps.Geocoder()

    geocoder.geocode({address: options.location.address}, (results, status) => {
      if (status !== maps.GeocoderStatus.OK) return

      const [result] = results
      center = result.geometry.location
      const mapOptions = {
        zoom: parseInt(options.zoom, 10),
        center,
        mapTypeControlOptions: {
          mapTypeIds: defaultStyles
        },
        mapTypeId: options.theme,
        panControl: false,
        zoomControl: false,
        scaleControl: false,
        disableDefaultUI: true,
        scrollwheel: false
      }

      map = new maps.Map(mapEl, mapOptions)

      if (defaultStyles.indexOf(options.theme) === -1) {
        map.mapTypes.set(options.theme, new maps.StyledMapType(mapStyles[options.theme], {}))
      }

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

      marker = new maps.Marker({
        map,
        position: result.geometry.location,
        draggable: false,
        animation: maps.Animation.DROP
      })

      infoWindow = new maps.InfoWindow(createInfoWindowConfig(result, options))

      maps.event.addListener(marker, 'click', () => infoWindow.open(map, marker))

      marker.setVisible(options.location.showMarker)
    })
  }

  function loadScript () {
    var script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `https://maps.googleapis.com/maps/api/js?v=3.exp&key=${API_KEY}&callback=${CALLBACK_FUNCTION_NAME}`
    document.body.appendChild(script)
  }

  function bootstrap () {
    appContainer = INSTALL.createElement(options.container, appContainer)
    mapContainer = document.createElement('div')

    mapContainer.className = 'cf-google-map-container'
    mapContainer.innerHTML = `
      <style>
        .cf-google-map-container {
          position: relative;
          height: 0;
        }
        .cf-google-map {
          position: absolute;
          top: 0;
          height: 100%;
          left: 0;
          width: 100%;
          background: #e5e3df;
        }
      </style>

      <div class="cf-google-map">
        <div></div>
      </div>
    `

    mapContainer.style.paddingBottom = `${options.aspectRatio}%`

    mapEl = mapContainer.querySelector('.cf-google-map')
    appContainer.appendChild(mapContainer)

    loadScript()
  }

  if (document.readyState !== 'loading') {
    bootstrap()
  } else {
    document.addEventListener('DOMContentLoaded', bootstrap)
  }

  window.INSTALL_SCOPE = {
    setAppContainer (nextOptions) {
      options = nextOptions

      appContainer = INSTALL.createElement(options.container, appContainer)
      appContainer.appendChild(mapContainer)
    },
    setMapLocation (nextOptions) {
      options = nextOptions

      geocoder.geocode({address: options.location.address}, (results, status) => {
        if (status !== maps.GeocoderStatus.OK) return

        const [result] = results
        center = result.geometry.location

        map.setCenter(center)

        marker.setPosition(result.geometry.location)
        marker.setVisible(options.location.showMarker)

        infoWindow.setContent(createInfoWindowConfig(result, options).content)
        if (!options.location.showMarker) infoWindow.close()
      })
    },
    setMapZoom (nextOptions) {
      options = nextOptions

      map.setZoom(parseInt(options.zoom, 10))
    },
    setMapTheme (nextOptions) {
      options = nextOptions

      if (!(options.theme in map.mapTypes) && defaultStyles.indexOf(options.theme) === -1) {
        map.mapTypes.set(options.theme, new maps.StyledMapType(mapStyles[options.theme], {}))
      }

      map.setMapTypeId(options.theme)
    },
    setMapAspectRatio (nextOptions) {
      options = nextOptions

      mapContainer.style.paddingBottom = `${options.aspectRatio}%`
      maps.event.trigger(map, 'resize')
    }
  }
}())
