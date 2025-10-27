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
