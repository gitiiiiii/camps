document.addEventListener('DOMContentLoaded', () => {
  const routeSelector = document.getElementById('routeSelector');
  const busList = document.getElementById('active-bus-list');
  const loadingState = document.getElementById('loading-state');
  const cardTemplate = document.getElementById('bus-card-template');

  // Read the embedded route data
  const routesDataJSON = document.getElementById('routes-data').textContent;
  const routesData = JSON.parse(routesDataJSON);

  const busMarkers = {};
  const routeLayers = L.layerGroup();
  
  // 1. Initialize Leaflet Map
  const map = L.map('map').setView([12.9716, 77.5946], 12); 
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  routeLayers.addTo(map);

  // 2. Connect to Socket.IO
  // Thanks to server.js, this socket is now associated with our session
  const socket = io();

  // 3. LISTEN for live 'locationUpdate' events (for the map icon)
  socket.on('locationUpdate', (busData) => {
    // This logic is unchanged
    console.log('Socket update received:', busData);
    const currentRouteId = routeSelector.value;
    const busRouteId = busData.route ? busData.route._id : busData.route;
    
    if (currentRouteId === 'all' || currentRouteId === busRouteId) {
      updateBusOnMap(busData);
    }
  });
  
  // ✅ 4. NEW: Listen for the *PERSONAL* GEOFENCE ALERT
  socket.on('stopApproaching', (data) => {
    // This alert will ONLY be received by the logged-in user
    // whose stop is being approached.
    alert(`🔔 SMART ALERT 🔔\nDriver ${data.driverName} is now approaching your stop: ${data.stopName}!`);
  });


  // 5. Handle route selection
  routeSelector.addEventListener('change', () => {
    const routeId = routeSelector.value;
    clearAllBuses();
    routeLayers.clearLayers();
    
    // This logic is now only for drawing the map
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

  // --- (All other helper functions: drawRoutePath, fetchInitialLocations, etc. are correct) ---

  function drawRoutePath(route) {
    if (!route.stops || route.stops.length === 0) { return; }
    const stopCoordinates = route.stops
      .sort((a, b) => a.sequence - b.sequence)
      .map(stop => [stop.lat, stop.lng]); 

    stopCoordinates.forEach((coords, index) => {
      const stop = route.stops[index];
      L.circleMarker(coords, {
        radius: 8, color: '#0d6efd', fillColor: '#fff', fillOpacity: 1, weight: 3
      }).bindPopup(`<b>Stop ${stop.sequence}:</b> ${stop.name}`).addTo(routeLayers);
    });
    const routeLine = L.polyline(stopCoordinates, {
      color: '#0d6efd', weight: 5, opacity: 0.7
    }).addTo(routeLayers);
    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
  }

  async function fetchInitialLocations(routeId) {
    loadingState.style.display = 'block';
    busList.innerHTML = ''; 
    try {
      const response = await fetch(`/tracking/api/locations/${routeId}`);
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const buses = await response.json();
      if (buses.length > 0) {
        loadingState.style.display = 'none'; 
        buses.forEach(bus => { updateBusOnMap(bus); });
      } else {
        loadingState.textContent = 'No active buses on this route.';
      }
    } catch (err) {
      console.error('Error fetching initial locations:', err);
      loadingState.textContent = 'Error loading buses.';
    }
  }

  function updateBusOnMap(bus) {
    if (!bus.location || !bus.driverInfo) { return; }
    loadingState.style.display = 'none'; 
    const [lng, lat] = bus.location.coordinates;
    const driverId = bus.driverInfo._id;
    const driverName = bus.driverInfo.name;

    if (busMarkers[driverId]) {
      busMarkers[driverId].setLatLng([lat, lng]);
    } else {
      busMarkers[driverId] = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<b>Driver:</b> ${driverName}`);
    }

    let card = busList.querySelector(`.bus-card[data-bus-id="${driverId}"]`);
    if (!card) {
      if (!cardTemplate) { return; }
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
      map.removeLayer(busMarkers[id]);
      delete busMarkers[id];
    }
    busList.innerHTML = '';
    loadingState.style.display = 'block';
    loadingState.textContent = 'Waiting for live bus data...';
  }

  fetchInitialLocations('all');
});