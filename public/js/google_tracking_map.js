// This function is called by the Google Maps script tag
function initMap() {
  const routeSelector = document.getElementById('routeSelector');
  const busList = document.getElementById('active-bus-list');
  const loadingState = document.getElementById('loading-state');
  const cardTemplate = document.getElementById('bus-card-template');

  // Read the embedded route data
  const routesDataJSON = document.getElementById('routes-data').textContent;
  const routesData = JSON.parse(routesDataJSON);

  const busMarkers = {}; // Stores [driverId]: google.maps.Marker
  
  // Store route features (lines, stops)
  let routePath = null;
  let routeStops = [];

  // 1. Initialize Google Map
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 12.9716, lng: 77.5946 }, // Centered on Bangalore
    zoom: 12,
  });

  // 2. Connect to Socket.IO
  const socket = io();

  // 3. LISTEN for live 'locationUpdate' events
  socket.on('locationUpdate', (busData) => {
    console.log('Socket update received:', busData);
    const currentRouteId = routeSelector.value;
    const busRouteId = busData.route ? busData.route._id : busData.route;
    
    if (currentRouteId === 'all' || currentRouteId === busRouteId) {
      updateBusOnMap(busData);
    }
  });

  // 4. Handle route selection
  routeSelector.addEventListener('change', () => {
    const routeId = routeSelector.value;
    clearAllBuses();
    clearRoutePath();
    
    if (routeId && routeId !== 'all') {
      const selectedRoute = routesData.find(r => r._id === routeId);
      if (selectedRoute && selectedRoute.stops) {
        drawRoutePath(selectedRoute);
      }
      fetchInitialLocations(routeId);
    } else {
      fetchInitialLocations('all');
    }
  });

  // --- Helper Functions ---

  function drawRoutePath(route) {
    if (!route.stops || route.stops.length === 0) return;
    
    const bounds = new google.maps.LatLngBounds();

    const stopCoordinates = route.stops
      .sort((a, b) => a.sequence - b.sequence)
      .map(stop => ({ lat: stop.lat, lng: stop.lng })); // Google uses {lat, lng}

    // 1. Draw Stops
    stopCoordinates.forEach((coords, index) => {
      const stop = route.stops[index];
      const stopMarker = new google.maps.Marker({
        position: coords,
        map: map,
        title: `Stop ${stop.sequence}: ${stop.name}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#fff',
          fillOpacity: 1,
          strokeColor: '#0d6efd',
          strokeWeight: 4,
        }
      });
      routeStops.push(stopMarker);
      bounds.extend(coords);
    });

    // 2. Draw Line
    routePath = new google.maps.Polyline({
      path: stopCoordinates,
      geodesic: true,
      strokeColor: '#0d6efd',
      strokeOpacity: 0.7,
      strokeWeight: 5,
    });
    routePath.setMap(map);

    // 3. Zoom map
    map.fitBounds(bounds);
  }

  async function fetchInitialLocations(routeId) {
    loadingState.style.display = 'block';
    busList.innerHTML = ''; 
    
    try {
      const response = await fetch(`/tracking/api/locations/${routeId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const buses = await response.json();

      if (buses.length > 0) {
        loadingState.style.display = 'none'; 
        buses.forEach(bus => updateBusOnMap(bus));
      } else {
        loadingState.textContent = 'No active buses on this route.';
      }
    } catch (err) {
      console.error('Error fetching initial locations:', err);
      loadingState.textContent = 'Error loading buses.';
    }
  }

  function updateBusOnMap(bus) {
    if (!bus.location || !bus.driverInfo) return;

    loadingState.style.display = 'none'; 

    const [lng, lat] = bus.location.coordinates;
    const driverId = bus.driverInfo._id;
    const driverName = bus.driverInfo.name;
    const position = { lat, lng };

    // 1. Update Map Marker
    if (busMarkers[driverId]) {
      busMarkers[driverId].setPosition(position);
    } else {
      busMarkers[driverId] = new google.maps.Marker({
        position: position,
        map: map,
        title: `Driver: ${driverName}`,
        // You can use a custom bus icon here
        // icon: '/images/bus-icon.png' 
      });
    }

    // 2. Update "Active Buses" List
    let card = busList.querySelector(`.bus-card[data-bus-id="${driverId}"]`);
    if (!card) {
      if (!cardTemplate) return;
      card = cardTemplate.content.cloneNode(true).firstElementChild;
      card.dataset.busId = driverId;
      busList.appendChild(card);
    }

    card.querySelector('.bus-name').textContent = `Driver: ${driverName}`;
    card.querySelector('.bus-route').textContent = `Route: ${bus.route ? bus.route.name : 'N/A'}`;
    card.querySelector('.bus-updated').textContent = `Last update: ${new Date(bus.createdAt).toLocaleTimeString()}`;
  }
  
  function clearAllBuses() {
    for (const id in busMarkers) {
      busMarkers[id].setMap(null); // Remove marker from map
      delete busMarkers[id];
    }
    busList.innerHTML = '';
    loadingState.style.display = 'block';
    loadingState.textContent = 'Waiting for live bus data...';
  }

  function clearRoutePath() {
    if (routePath) {
      routePath.setMap(null);
      routePath = null;
    }
    routeStops.forEach(marker => marker.setMap(null));
    routeStops = [];
  }

  // Load buses for "Show All" by default
  fetchInitialLocations('all');
}
