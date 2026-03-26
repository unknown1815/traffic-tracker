const API = "http://127.0.0.1:5000/api/traffic";
const AUTH_API = "http://127.0.0.1:5000/api/auth";


// =======================
// 🔐 AUTH CHECK
// =======================
function checkAuth() {
  const token = localStorage.getItem("token");

  const isAuthPage =
    window.location.pathname.includes("login") ||
    window.location.pathname.includes("signup");

  if (!token && !isAuthPage) {
    window.location.href = "login.html";
  }
}
checkAuth();


// =======================
// 🔮 PREDICT
// =======================
async function predict() {
  const time = document.getElementById("time").value;
  const day = document.getElementById("day").value;
  const location = document.getElementById("location").value;
  const weather = document.getElementById("weather").value;

  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": localStorage.getItem("token")
    },
    body: JSON.stringify({ time, day, location, weather })
  });

  const data = await res.json();

  const resultBox = document.getElementById("result");
  if (!resultBox) return;

  resultBox.innerText = `Traffic: ${data.level} (Score: ${data.score.toFixed(2)})`;

  // 🎨 Color indicator
  if (data.level === "Low") resultBox.style.color = "green";
  else if (data.level === "Medium") resultBox.style.color = "orange";
  else resultBox.style.color = "red";

  // ⏱ Peak detection
  if (time === "evening" && day === "friday") {
    resultBox.innerText += " ⚠ Peak Traffic Time!";
  }

  loadData();
}


// =======================
// 📋 LOAD HOME DATA
// =======================
async function loadData() {
  const list = document.getElementById("list");
  if (!list) return;

  const res = await fetch(API);
  const data = await res.json();

  list.innerHTML = "";

  data.forEach(item => {
    const li = document.createElement("li");

    li.innerHTML = `
      ${item.time} - ${item.day} (${item.location}, ${item.weather}) → ${item.level}
      <button onclick="deleteData('${item._id}')">❌</button>
    `;

    list.appendChild(li);
  });
}


// =======================
// ❌ DELETE
// =======================
async function deleteData(id) {
  await fetch(API + "/" + id, { method: "DELETE" });

  loadData();
  loadManage();
}


// =======================
// ✏ EDIT (UPDATE FEATURE)
// =======================
async function editData(id) {
  const time = prompt("Enter new time (morning/afternoon/evening/night):");
  const day = prompt("Enter new day (monday-sunday):");
  const location = prompt("Enter location (city/town/village):");
  const weather = prompt("Enter weather (clear/rain/fog):");

  if (!time || !day || !location || !weather) {
    alert("All fields required!");
    return;
  }

  await fetch(API + "/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ time, day, location, weather })
  });

  alert("Updated successfully!");

  loadManage();
  loadData();
}


// =======================
// ✏ MANAGE PAGE
// =======================
async function loadManage() {
  const list = document.getElementById("manageList");
  if (!list) return;

  const res = await fetch(API);
  const data = await res.json();

  list.innerHTML = "";

  data.forEach(item => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="record-info">
        <div class="main-info">
          ${item.time} | ${item.day} | ${item.location} | ${item.weather}
        </div>

        <div class="result-info">
          Score: ${item.score.toFixed(2)} → 
          <span class="${item.level.toLowerCase()}">${item.level}</span>
        </div>
      </div>

      <div class="action-buttons">
        <button class="edit-btn" onclick="editData('${item._id}')">✏</button>
        <button class="delete-btn" onclick="deleteData('${item._id}')">❌</button>
      </div>
    `;

    list.appendChild(li);
  });
}


// =======================
// 📊 GRAPH
// =======================
async function loadChart() {
  const canvas = document.getElementById("trafficChart");
  if (!canvas) return;

  const res = await fetch(API);
  const data = await res.json();

  const labels = data.map((_, i) => "Entry " + (i + 1));
  const scores = data.map(d => d.score);

  new Chart(canvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Traffic Score",
        data: scores,
        borderWidth: 2,
        tension: 0.3
      }]
    }
  });
}


// =======================
// 🔍 FILTER
// =======================
async function filterData() {
  const dropdown = document.getElementById("filterLevel");
  const list = document.getElementById("filterList");

  if (!dropdown || !list) return;

  const level = dropdown.value;

  const res = await fetch(API);
  const data = await res.json();

  const filtered = level === "All"
    ? data
    : data.filter(item => item.level === level);

  list.innerHTML = "";

  filtered.forEach(item => {
    const li = document.createElement("li");
    li.innerText = `${item.time} - ${item.day} → ${item.level}`;
    list.appendChild(li);
  });
}


// =======================
// 🔐 SIGNUP
// =======================
async function signup() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await fetch(AUTH_API + "/signup", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, email, password })
  });

  alert("Signup successful!");
  window.location.href = "login.html";
}


// =======================
// 🔐 LOGIN
// =======================
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(AUTH_API + "/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    alert("Login successful!");
    window.location.href = "index.html";
  } else {
    alert(data.error || "Login failed");
  }
}


// =======================
// 🚪 LOGOUT
// =======================
function logout() {
  localStorage.removeItem("token");
  alert("Logged out");
  window.location.href = "login.html";
}


// =======================
// 🚀 AUTO LOAD
// =======================
loadData();
loadManage();
loadChart();

const filterDropdown = document.getElementById("filterLevel");
if (filterDropdown) {
  filterDropdown.addEventListener("change", filterData);
}