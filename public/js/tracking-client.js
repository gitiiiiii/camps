// polling client to fetch latest tracking for a selected route
async function startPolling(routeId){
  if (!routeId) return;
  const el = document.getElementById('liveFeed');
  el.innerHTML = 'Loading...';
  async function fetchLatest(){
    const res = await fetch(`/tracking/latest/${routeId}`);
    const data = await res.json();
    if (!data || data.length===0) el.innerHTML = '<div class="card">No tracking data yet.</div>';
    else {
      el.innerHTML = '';
      data.forEach(d=>{
        const time = new Date(d.timestamp).toLocaleString();
        el.innerHTML += `<div class="card">Lat: ${d.lat} | Lng: ${d.lng} | Note: ${d.note || ''} <div class="small">At: ${time}</div></div>`;
      });
    }
  }
  await fetchLatest();
  window._pollInterval = setInterval(fetchLatest, 5000);
}
function stopPolling(){ if (window._pollInterval) clearInterval(window._pollInterval); }
// 1. Connect to the socket server
const socket = io();

// 2. Keep track of the route we are currently watching
let currentRouteId = null;

/**
 * Helper function to add a new tracking update to the feed
 */
function updateFeed(d) {
  const el = document.getElementById('liveFeed');
  if (!el) return;

  const time = new Date(d.timestamp).toLocaleString();
  const newEntry = document.createElement('div');
  newEntry.className = 'card';
  newEntry.innerHTML = `Lat: ${d.lat} | Lng: ${d.lng} | Note: ${d.note || ''} <div class="small">At: ${time}</div>`;

  // Add the new update to the top of the list
  el.prepend(newEntry);
}

// 3. LISTEN FOR LIVE UPDATES
// This runs when the server broadcasts 'locationUpdate' (from Step 1)
socket.on('locationUpdate', (data) => {
  console.log('Received location update:', data);

  // 4. Check if the update is for the route we are currently watching
  if (data.route === currentRouteId) {
    updateFeed(data);
  }
});


/**
 * This function is called when the user selects a route.
 * We will now fetch the initial data ONCE, then listen for socket events.
 */
async function startPolling(routeId) {
  if (!routeId) return;
  stopPolling(); // Clear any previous state
  currentRouteId = routeId;

  const el = document.getElementById('liveFeed');
  el.innerHTML = 'Loading...';

  // 6. Fetch the *initial* data just once using your existing API route
  const res = await fetch(`/tracking/latest/${routeId}`);
  const data = await res.json();

  if (!data || data.length === 0) {
    el.innerHTML = '<div class="card">No tracking data yet.</div>';
  } else {
    el.innerHTML = '';
    // reverse() so we add the oldest items first, ending with the newest at top
    data.reverse().forEach(d => {
      updateFeed(d);
    });
  }

  // 7. ❌ DELETE THE POLLING INTERVAL
  // window._pollInterval = setInterval(fetchLatest, 5000); // <--- DELETE THIS LINE
}

/**
 * This function now just resets the UI and the current route.
 */
function stopPolling() {
  // if (window._pollInterval) clearInterval(window._pollInterval); // <--- DELETE THIS LINE
  currentRouteId = null;
  const el = document.getElementById('liveFeed');
  if (el) {
    el.innerHTML = '<div class="card">Select a route to see live tracking.</div>';
  }
}