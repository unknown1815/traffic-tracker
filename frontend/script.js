// =======================
// 🔐 AUTH SYSTEM
// =======================
let isLogin = true;

function toggleAuth() {
  isLogin = !isLogin;

  document.getElementById("authTitle").innerText =
    isLogin ? "Login" : "Signup";

  document.querySelector(".switch").innerText =
    isLogin
      ? "Don't have account? Signup"
      : "Already have account? Login";
}

function handleAuth() {
  const user = document.getElementById("authUser").value;
  const pass = document.getElementById("authPass").value;

  if (!user || !pass) {
    document.getElementById("authMsg").innerText = "Fill all fields";
    return;
  }

  // Save login state
  localStorage.setItem("loggedIn", "true");

  showApp();
}

function showApp() {
  document.getElementById("authScreen").style.display = "none";
  document.getElementById("app").style.display = "block";
}

function logout() {
  localStorage.removeItem("loggedIn");

  document.getElementById("app").style.display = "none";
  document.getElementById("authScreen").style.display = "flex";
}


// =======================
// 🧠 AUTO DETECT TIME/DAY
// =======================
function autoDetect() {
  const now = new Date();
  const hour = now.getHours();

  let timeValue = "morning";
  if (hour >= 5 && hour < 12) timeValue = "morning";
  else if (hour >= 12 && hour < 17) timeValue = "afternoon";
  else if (hour >= 17 && hour < 21) timeValue = "evening";
  else timeValue = "night";

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayValue = days[now.getDay()];

  document.getElementById("time").value = timeValue;
  document.getElementById("day").value = dayValue;
}


// =======================
// 🔮 PREDICT FUNCTION
// =======================
async function predict() {
  const time = document.getElementById("time").value;
  const day = document.getElementById("day").value;
  const location = document.getElementById("location").value.trim();
  const origin = document.getElementById("origin").value.trim();
  const destination = document.getElementById("destination").value.trim();

  if (!time || !day || !location || !origin || !destination) {
    alert("Please fill all fields!");
    return;
  }

  const resultBox = document.getElementById("result");
  resultBox.innerText = "⏳ Fetching live data...";
  resultBox.style.color = "white";

  try {
    const res = await fetch("http://127.0.0.1:5000/api/traffic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time, day, location, origin, destination }),
    });

    const data = await res.json();
    console.log("✅ API RESPONSE:", data);

    if (!res.ok || data.error) {
      resultBox.innerText = "❌ " + (data.error || "Prediction failed");
      resultBox.style.color = "red";
      return;
    }

    const score =
      !isNaN(Number(data.score)) ? Number(data.score).toFixed(2) : "N/A";

    const trafficIndex =
      !isNaN(Number(data.trafficIndex))
        ? Number(data.trafficIndex).toFixed(2)
        : "N/A";

    resultBox.innerText = `Traffic: ${
      data.level || "N/A"
    }  |  Score: ${score}  |  Weather: ${
      data.weather || "N/A"
    }  |  Traffic Index: ${trafficIndex}`;

    if (data.level === "Low") resultBox.style.color = "#00e676";
    else if (data.level === "Medium") resultBox.style.color = "#ffaa00";
    else resultBox.style.color = "#ff3333";

    await showMap(origin, destination, location, data.level);
  } catch (err) {
    console.error("❌ FRONTEND ERROR:", err);
    resultBox.innerText =
      "❌ Network error — check backend server (port 5000)";
    resultBox.style.color = "red";
  }
}


// =======================
// 📍 GEOCODE HELPER
// =======================
const TOMTOM_KEY = "yrRF5NkQ9WrQiUxxSP3Ke3tWZxYDeY1j"; // 🔥 PUT YOUR REAL KEY

let mapInstance = null;

async function geocode(query) {
  const res = await tt.services.fuzzySearch({
    key: TOMTOM_KEY,
    query: query,
  });

  if (!res.results || res.results.length === 0) {
    throw new Error(`Could not geocode: "${query}"`);
  }

  const pos = res.results[0].position;
  return [pos.lng, pos.lat];
}


// =======================
// 🗺️ SHOW MAP + ROUTE
// =======================
async function showMap(origin, destination, city, level) {
  if (typeof tt === "undefined" || typeof tt.services === "undefined") {
    console.error("❌ TomTom SDK not loaded");
    return;
  }

  let routeColor = "#00e676";
  if (level === "Medium") routeColor = "#ffaa00";
  if (level === "High") routeColor = "#ff3333";

  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  document.getElementById("map").innerHTML = "";

  mapInstance = tt.map({
    key: TOMTOM_KEY,
    container: "map",
    center: [77.5946, 12.9716],
    zoom: 11,
  });

  mapInstance.on("load", async () => {
    try {
      const originCoords = await geocode(`${origin}, ${city}`);
      const destinationCoords = await geocode(`${destination}, ${city}`);

      const routeData = await tt.services.calculateRoute({
        key: TOMTOM_KEY,
        locations: [originCoords, destinationCoords],
      });

      const geojson = routeData.toGeoJson();

      mapInstance.addSource("route", {
        type: "geojson",
        data: geojson,
      });

      mapInstance.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: {
          "line-color": routeColor,
          "line-width": 6,
        },
      });

      new tt.Marker().setLngLat(originCoords).addTo(mapInstance);
      new tt.Marker({ color: "red" })
        .setLngLat(destinationCoords)
        .addTo(mapInstance);

      const bounds = new tt.LngLatBounds();
      geojson.features[0].geometry.coordinates.forEach((c) =>
        bounds.extend(c)
      );

      mapInstance.fitBounds(bounds, { padding: 50 });
    } catch (err) {
      console.error("❌ Map error:", err.message);
    }
  });
}


// =======================
// 🚀 INIT (FINAL FIX)
// =======================
window.onload = () => {
  // Auth check
  const isLoggedIn = localStorage.getItem("loggedIn");

  if (isLoggedIn === "true") {
    showApp();
  } else {
    document.getElementById("authScreen").style.display = "flex";
    document.getElementById("app").style.display = "none";
  }

  // Auto detect time/day
  autoDetect();
};