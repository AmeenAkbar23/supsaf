// --- New Dashboard Logic ---

function updateDashboard() {
    const now = new Date();
    
    // Update Clock
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('liveClock').textContent = timeString;

    // Update Date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('liveDate').textContent = now.toLocaleDateString(undefined, dateOptions);
}

// Simple Weather Fetch (Using a public API - requires an API Key for real data)
async function fetchWeather() {
    // You can get a free key from OpenWeatherMap and put it here
    const mockTemp = "22°C";
    const mockDesc = "Partly Cloudy";
    
    document.getElementById('weatherTemp').textContent = mockTemp;
    document.getElementById('weatherDesc').textContent = mockDesc;
}

// --- Modified Animation Loop ---
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Keep the aesthetic particles from your original code
    particles.forEach((part, index) => {
        part.update();
        part.draw();
        if (part.life <= 0) particles.splice(index, 1);
    });

    // Spawn random particles for background effect
    if (Math.random() < 0.1) {
        // Use your existing Particle class
        particles.push(new Particle(Math.random() * canvas.width, canvas.height - 150));
    }

    updateDashboard();
    requestAnimationFrame(animate);
}

// Initialize
setInterval(fetchWeather, 600000); // Update weather every 10 mins
fetchWeather();
animate();
