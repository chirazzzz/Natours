const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiY2hpcmF6enp6bSIsImEiOiJjbGtxeDRidHAwMm9kM2VvMXgzd2UxeXBnIn0.Lc1OWytMyBbi9Mifpg06NA';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/chirazzzzm/clks47u5400bl01o89uoxaahp',
  scrollZoom: false,
  // center: [-118.115006, 34.137116],
  // zoom: 7,
  // interactive: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  // Create marker
  const el = document.createElement('div');
  el.className = 'marker';

  // Add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add popup
  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  // Extends map bounds to include current locations
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
