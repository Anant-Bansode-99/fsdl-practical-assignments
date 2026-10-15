// ─── City Data ────────────────────────────────────────────────────────────────
const cityData = {
    delhi: {
        temp: 33, feelsLike: 36, humidity: 48,
        conditionIcon: "☀️", conditionText: "Sunny",
        weekTemps: [35, 33, 30, 28, 31, 34, 33],
        conditionSplit: [4, 2, 1, 0],
        hourly: [
            { time: "6 AM", icon: "🌤️", temp: 27 },
            { time: "8 AM", icon: "☀️", temp: 29 },
            { time: "10 AM", icon: "☀️", temp: 32 },
            { time: "12 PM", icon: "☀️", temp: 35 },
            { time: "2 PM", icon: "🌤️", temp: 36 },
            { time: "4 PM", icon: "⛅", temp: 34 },
            { time: "6 PM", icon: "🌥️", temp: 31 },
            { time: "8 PM", icon: "🌙", temp: 28 },
            { time: "10 PM", icon: "🌙", temp: 26 },
        ]
    },
    mumbai: {
        temp: 28, feelsLike: 32, humidity: 79,
        conditionIcon: "⛅", conditionText: "Partly Cloudy",
        weekTemps: [27, 28, 29, 26, 25, 28, 28],
        conditionSplit: [1, 3, 2, 1],
        hourly: [
            { time: "6 AM", icon: "🌧️", temp: 25 },
            { time: "8 AM", icon: "⛅", temp: 26 },
            { time: "10 AM", icon: "🌥️", temp: 27 },
            { time: "12 PM", icon: "⛅", temp: 29 },
            { time: "2 PM", icon: "🌦️", temp: 28 },
            { time: "4 PM", icon: "🌧️", temp: 27 },
            { time: "6 PM", icon: "⛅", temp: 26 },
            { time: "8 PM", icon: "🌙", temp: 25 },
            { time: "10 PM", icon: "🌙", temp: 24 },
        ]
    },
    bangalore: {
        temp: 22, feelsLike: 21, humidity: 65,
        conditionIcon: "🌤️", conditionText: "Mostly Clear",
        weekTemps: [21, 23, 22, 20, 19, 22, 22],
        conditionSplit: [3, 2, 2, 0],
        hourly: [
            { time: "6 AM", icon: "🌤️", temp: 18 },
            { time: "8 AM", icon: "☀️", temp: 20 },
            { time: "10 AM", icon: "☀️", temp: 22 },
            { time: "12 PM", icon: "🌤️", temp: 23 },
            { time: "2 PM", icon: "⛅", temp: 23 },
            { time: "4 PM", icon: "🌦️", temp: 21 },
            { time: "6 PM", icon: "🌧️", temp: 20 },
            { time: "8 PM", icon: "⛅", temp: 19 },
            { time: "10 PM", icon: "🌙", temp: 18 },
        ]
    },
    kolkata: {
        temp: 30, feelsLike: 34, humidity: 70,
        conditionIcon: "🌦️", conditionText: "Light Rain",
        weekTemps: [29, 30, 31, 28, 27, 30, 30],
        conditionSplit: [1, 2, 3, 1],
        hourly: [
            { time: "6 AM", icon: "🌧️", temp: 26 },
            { time: "8 AM", icon: "🌦️", temp: 27 },
            { time: "10 AM", icon: "⛅", temp: 29 },
            { time: "12 PM", icon: "🌤️", temp: 31 },
            { time: "2 PM", icon: "⛅", temp: 31 },
            { time: "4 PM", icon: "🌦️", temp: 30 },
            { time: "6 PM", icon: "🌧️", temp: 28 },
            { time: "8 PM", icon: "🌙", temp: 27 },
            { time: "10 PM", icon: "🌙", temp: 26 },
        ]
    },
    chennai: {
        temp: 34, feelsLike: 38, humidity: 74,
        conditionIcon: "🌩️", conditionText: "Thunderstorm",
        weekTemps: [33, 34, 35, 32, 30, 33, 34],
        conditionSplit: [1, 1, 2, 3],
        hourly: [
            { time: "6 AM", icon: "⛅", temp: 28 },
            { time: "8 AM", icon: "🌤️", temp: 30 },
            { time: "10 AM", icon: "☀️", temp: 33 },
            { time: "12 PM", icon: "⛅", temp: 35 },
            { time: "2 PM", icon: "🌩️", temp: 34 },
            { time: "4 PM", icon: "🌧️", temp: 31 },
            { time: "6 PM", icon: "🌦️", temp: 30 },
            { time: "8 PM", icon: "🌙", temp: 29 },
            { time: "10 PM", icon: "🌙", temp: 28 },
        ]
    }
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Chart Instances ──────────────────────────────────────────────────────────
let tempChart, conditionChart;

// ─── Set Date ─────────────────────────────────────────────────────────────────
function setDate() {
    const now = new Date();
    const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-IN', opts);
}

// ─── Update Cards ─────────────────────────────────────────────────────────────
function updateCards(data) {
    document.getElementById('temp').textContent = data.temp + '°C';
    document.getElementById('temp-feel').textContent = 'Feels like ' + data.feelsLike + '°C';
    document.getElementById('humidity').textContent = data.humidity + '%';
    document.getElementById('condition-icon').textContent = data.conditionIcon;
    document.getElementById('condition-text').textContent = data.conditionText;
}

// ─── Hourly Strip ─────────────────────────────────────────────────────────────
function updateHourly(hourly) {
    const strip = document.getElementById('hourly-strip');
    strip.innerHTML = hourly.map(h => `
    <div class="hourly-card">
      <div class="h-time">${h.time}</div>
      <div class="h-icon">${h.icon}</div>
      <div class="h-temp">${h.temp}°C</div>
    </div>
  `).join('');
}

// ─── Build Charts ─────────────────────────────────────────────────────────────
function buildCharts(data) {
    if (tempChart) tempChart.destroy();
    if (conditionChart) conditionChart.destroy();

    // Temperature Line Chart
    tempChart = new Chart(document.getElementById('tempChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Temp (°C)',
                data: data.weekTemps,
                borderColor: '#1a6fd4',
                backgroundColor: 'rgba(26,111,212,0.08)',
                borderWidth: 2.5,
                pointBackgroundColor: '#1a6fd4',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                tension: 0.35,
                fill: true
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: '#f0f4f8' },
                    ticks: { color: '#9aaabf', font: { size: 11 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#9aaabf', font: { size: 11 } }
                }
            }
        }
    });

    // Condition Doughnut
    conditionChart = new Chart(document.getElementById('conditionChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Sunny', 'Cloudy', 'Rainy', 'Stormy'],
            datasets: [{
                data: data.conditionSplit,
                backgroundColor: ['#f7a440', '#7bafd4', '#1a6fd4', '#6c5ce7'],
                borderWidth: 3,
                borderColor: '#ffffff'
            }]
        },
        options: {
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { boxWidth: 11, font: { size: 11 }, color: '#7a8a9a', padding: 14 }
                }
            }
        }
    });
}

// ─── Load City ────────────────────────────────────────────────────────────────
function loadCity() {
    const data = cityData[document.getElementById('city-select').value];
    updateCards(data);
    updateHourly(data.hourly);
    buildCharts(data);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
setDate();
loadCity();
