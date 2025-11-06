document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startTracking');
  const stopBtn = document.getElementById('stopTracking');
  const statusMsg = document.getElementById('statusMessage');
  const routeIdInput = document.getElementById('routeId');
  
  // Make sure all elements exist before adding listeners
  if (!startBtn || !stopBtn || !statusMsg || !routeIdInput) {
    console.log('Driver dashboard elements not found.');
    return;
  }

  const routeId = routeIdInput.value;
  let trackingInterval = null;

  // --- Main function to get and send location ---
  const sendLocation = () => {
    if (!navigator.geolocation) {
      statusMsg.textContent = 'Geolocation is not supported by your browser.';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        statusMsg.textContent = `Location updated: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        
        try {
          // Send data to the backend route we created
          const response = await fetch('/driver/update-location', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lat: latitude,
              lng: longitude,
              routeId: routeId
            }),
          });
          
          if (!response.ok) {
            statusMsg.textContent = 'Error sending location to server.';
          }
        } catch (err) {
          console.error('Fetch error:', err);
          statusMsg.textContent = 'Connection error.';
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        statusMsg.textContent = 'Error getting location. Please enable GPS.';
      }
    );
  };

  // --- Button Clicks ---
  startBtn.addEventListener('click', () => {
    console.log('Starting tracking...');
    
    // 1. Send location immediately
    sendLocation(); 
    
    // 2. Then, send location every 10 seconds (10000 ms)
    trackingInterval = setInterval(sendLocation, 10000);
    
    // 3. Update UI
    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-block';
    statusMsg.style.display = 'block';
    statusMsg.textContent = 'Tracking...';
  });

  stopBtn.addEventListener('click', () => {
    console.log('Stopping tracking...');
    
    // 1. Stop the interval
    if (trackingInterval) {
      clearInterval(trackingInterval);
    }
    
    // 2. Update UI
    stopBtn.style.display = 'none';
    startBtn.style.display = 'inline-block';
    statusMsg.textContent = 'Tracking stopped.';
  });
});