export default function createInfoWindowConfig (geocoderResult, options) {
  function pluck (typeName) {
    for (var i = 0; i < geocoderResult.address_components.length; i++) {
      if (geocoderResult.address_components[i].types[0] === typeName) {
        return geocoderResult.address_components[i].short_name
      }
    }

    return ''
  }

  return {
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
  }
}
