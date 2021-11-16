mapboxgl.accessToken = maptoken;
  const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/outdoors-v11',
  center: campgrounds.geometry.coordinates,
  zoom: 10
});

new mapboxgl.Marker({color:'Green'})
.setLngLat(campgrounds.geometry.coordinates)
.setPopup(
  new mapboxgl.Popup({offset: 25})
  .setHTML(
    `<h3>${campgrounds.title}</h3> <p>${campgrounds.location}</p>`
  )
)
.addTo(map)
map.addControl(new mapboxgl.NavigationControl());