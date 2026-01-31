mapboxgl.accessToken =
  'pk.eyJ1IjoidHRzdWkxMjMiLCJhIjoiY21sMXF2dzBqMGF5eTNmb2tpcmpwYWI0NSJ9.SvNkLh4rFRPAttTFGwFLlA';

const mapMode = document.body.dataset.map; 

const styleUrl = (mapMode === 'counts')
  ? 'mapbox://styles/mapbox/dark-v10'
  : 'mapbox://styles/mapbox/light-v10';

const map = new mapboxgl.Map({
  container: 'map',
  style: styleUrl,
  center: [-98, 38],
  zoom: 3,
  minZoom: 2,
  projection: 'albers'
});

map.on('load', () => {
  if (mapMode === 'rates') {
    renderRatesChoropleth();
  } else if (mapMode === 'counts') {
    renderCountsProportional();
  } else {
    console.error('Missing or invalid data-map on <body>. Use "rates" or "counts".');
  }
});

function renderRatesChoropleth() {
  map.addSource('rates', {
    type: 'geojson',
    data: 'assets/us-covid-2020-rates.geojson'
  });

  map.addLayer({
    id: 'rates-fill',
    type: 'fill',
    source: 'rates',
    paint: {
      'fill-color': [
        'step',
        ['get', 'rates'],
        '#ffffcc',
        45, '#a1dab4',
        60, '#41b6c4',
        71, '#2c7fb8',
        85, '#253494'
      ],
      'fill-opacity': 0.82,
      'fill-outline-color': 'rgba(0,0,0,0.15)'
    }
  });

  map.on('mouseenter', 'rates-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'rates-fill', () => { map.getCanvas().style.cursor = ''; });


  map.on('click', 'rates-fill', (e) => {
    const p = e.features[0].properties;
    const rate = Number(p.rates).toFixed(1);

    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`
        <b>${p.county}, ${p.state}</b><br/>
        Rate: <b>${rate}</b> cases / 1,000<br/>
        Cases: ${Number(p.cases).toLocaleString()}<br/>
        Deaths: ${Number(p.deaths).toLocaleString()}
      `)
      .addTo(map);
  });
}

function renderCountsProportional() {
  map.addSource('countsPts', {
    type: 'geojson',
    data: 'assets/us-covid-2020-counts.geojson'
  });

  map.addLayer({
    id: 'cases-circles',
    type: 'circle',
    source: 'countsPts',
    paint: {
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'cases'],
        1, 2,
        5000, 4,
        25000, 9,
        100000, 15,
        300000, 22,
        800000, 30
      ],
      'circle-color': 'rgba(227,74,51,0.9)',
      'circle-opacity': 0.75,
      'circle-stroke-width': 0.6,
      'circle-stroke-color': 'rgba(0,0,0,0.6)'
    }
  });

  map.on('mouseenter', 'cases-circles', () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'cases-circles', () => { map.getCanvas().style.cursor = ''; });

  map.on('click', 'cases-circles', (e) => {
    const p = e.features[0].properties;

    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`
        <b>${p.county}, ${p.state}</b><br/>
        Cases: <b>${Number(p.cases).toLocaleString()}</b><br/>
        Deaths: ${Number(p.deaths).toLocaleString()}
      `)
      .addTo(map);
  });
}
