
const data = {
  properties: [],
  rooms: [],
  tenants: [],
  payments: []
};

function money(amount) {
  return "₱" + Number(amount || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function showPage(page, button) {
  const title = document.getElementById("page-title");
  const content = document.getElementById("page-content");

  title.textContent = page === "Dashboard"
    ? "Landlord Dashboard"
    : page;

  document.querySelectorAll(".nav").forEach(nav => {
    nav.classList.remove("active");
  });

  if (button) {
    button.classList.add("active");
  } else {
    document.querySelectorAll(".nav").forEach(nav => {
      if (nav.textContent.includes(page)) {
        nav.classList.add("active");
      }
    });
  }

  if (page === "Dashboard") {
    renderDashboard();
    return;
  }

  const pages = {
    "My Profile": renderProfile,
    "Add Property": renderPropertyForm,
    "My Properties": renderProperties,
    "My Units": renderRooms,
    "Tenants": renderTenants,
    "Assign Tenant": renderAssignTenant,
    "Rent Payments": renderPaymentForm,
    "Rent History": renderPayments
  };

  if (pages[page]) {
    content.innerHTML = "";
    pages[page]();
  }
}

function renderDashboard() {
  const content = document.getElementById("page-content");

  content.innerHTML = `
    <div class="cards">
      <div class="card"><p>Total Properties</p>
        <h2 id="properties">${data.properties.length}</h2></div>
      <div class="card"><p>Total Rooms</p>
        <h2 id="rooms">${data.rooms.length}</h2></div>
      <div class="card"><p>Total Tenants</p>
        <h2 id="tenants">${data.tenants.length}</h2></div>
      <div class="card"><p>Available Rooms</p>
        <h2 id="available">${data.rooms.filter(r => r.status === "Available").length}</h2></div>
    </div>

    <div class="rent-cards">
      <div class="rent-card pending"><p>Pending Rent</p>
        <h2>${money(data.tenants.filter(t => !t.paid).reduce((s,t) => s + Number(t.rent), 0))}</h2></div>
      <div class="rent-card overdue"><p>Overdue Rent</p>
        <h2>${money(data.tenants.filter(t => !t.paid && t.overdue).reduce((s,t) => s + Number(t.rent), 0))}</h2></div>
      <div class="rent-card collected"><p>Collected Rent</p>
        <h2>${money(data.payments.reduce((s,p) => s + Number(p.amount), 0))}</h2></div>
    </div>

    <div class="panel">
      <h3>Quick Actions</h3>
      <div class="actions">
        <button onclick="showPage('Add Property')">＋ Add Property</button>
        <button onclick="showPage('My Units')">＋ Add Room</button>
        <button onclick="showPage('Tenants')">＋ Add Tenant</button>
        <button onclick="showPage('Rent Payments')">₱ Record Payment</button>
      </div>
      <p class="note">Welcome to ApartmentPro. Manage your properties, rooms, tenants and rent records in one place.</p>
    </div>

    <div class="panel">
      <h3>Recent Room Records</h3>
      ${roomTable()}
    </div>`;
}

function roomTable() {
  if (!data.rooms.length) {
    return `<p class="empty">No rooms added yet. Use My Units to add your first room.</p>`;
  }

  return `<div class="table-wrap"><table>
    <thead><tr><th>Room No.</th><th>Type</th><th>Tenant</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>${data.rooms.map((r,i) => `
      <tr>
        <td>${safe(r.number)}</td>
        <td>${safe(r.type)}</td>
        <td>${safe(r.tenant || "—")}</td>
        <td><span class="status ${r.status.toLowerCase()}">${safe(r.status)}</span></td>
        <td><button onclick="deleteRoom(${i})">Delete</button></td>
      </tr>`).join("")}</tbody>
  </table></div>`;
}

function renderProfile() {
  const c = document.getElementById("page-content");
  c.innerHTML = `<div class="panel">
    <h3>Administrator Profile</h3>
    <form class="form" onsubmit="saveProfile(event)">
      <div><label>Full Name</label><input id="profileName" required placeholder="Enter your name"></div>
      <div><label>Email</label><input id="profileEmail" type="email" placeholder="Enter email"></div>
      <div class="full"><button>Save Profile</button></div>
    </form><p class="note">Demo profile only. Login security will be added separately.</p>
  </div>`;
}

function saveProfile(event) {
  event.preventDefault();
  alert("Profile details saved for this session.");
}

function renderPropertyForm() {
  document.getElementById("page-content").innerHTML = `
    <div class="panel"><h3>Add Apartment Property</h3>
    <form class="form" onsubmit="addProperty(event)">
      <div><label>Property Name</label><input id="propertyName" required placeholder="e.g. Sunrise Apartment"></div>
      <div><label>Location</label><input id="propertyLocation" required placeholder="Address / Barangay"></div>
      <div><label>Number of Floors</label><input id="propertyFloors" type="number" min="1" required></div>
      <div><label>Description</label><input id="propertyDescription" placeholder="Optional details"></div>
      <div class="full"><button>Add Property</button></div>
    </form></div>
    <div class="panel"><h3>Property Records</h3>${propertyTable()}</div>`;
}

function addProperty(event) {
  event.preventDefault();
  data.properties.push({
    name: document.getElementById("propertyName").value.trim(),
    location: document.getElementById("propertyLocation").value.trim(),
    floors: document.getElementById("propertyFloors").value,
    description: document.getElementById("propertyDescription").value.trim()
  });
  showPage("Add Property");
  alert("Property added!");
}

function propertyTable() {
  if (!data.properties.length) return `<p class="empty">No properties added yet.</p>`;
  return `<div class="table-wrap"><table>
    <tr><th>Property</th><th>Location</th><th>Floors</th><th>Action</th></tr>
    ${data.properties.map((p,i) => `<tr>
      <td>${safe(p.name)}</td><td>${safe(p.location)}</td>
      <td>${safe(p.floors)}</td><td><button onclick="deleteProperty(${i})">Delete</button></td>
    </tr>`).join("")}
  </table></div>`;
}

function renderProperties() {
  document.getElementById("page-content").innerHTML = `
    <div class="panel"><h3>My Properties</h3>
      <button onclick="showPage('Add Property')">＋ Add Property</button>
      ${propertyTable()}
    </div>`;
}

function deleteProperty(i) {
  if (confirm("Delete this property?")) {
    data.properties.splice(i,1);
    renderProperties();
  }
}

/* UPDATED ROOM MANAGEMENT WITH PICTURES */

function renderRooms() {
  const content = document.getElementById("page-content");

  const roomTypes = [
    {
      name: "Single Room",
      icon: "🛏️",
      image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=700&q=80",
      description: "Ideal for one person"
    },
    {
      name: "Double Room",
      icon: "🛌",
      image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=700&q=80",
      description: "Comfortable double occupancy"
    },
    {
      name: "Suite",
      icon: "🏨",
      image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=700&q=80",
      description: "Spacious premium room"
    },
    {
      name: "Studio Apartment",
      icon: "🏢",
      image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=700&q=80",
      description: "Bedroom and living space"
    }
  ];

  content.innerHTML = `
    <div class="room-heading">
      <div>
        <h2>Room Management</h2>
        <p>Manage your apartment rooms and availability.</p>
      </div>
      <button class="room-add-btn"
        onclick="document.getElementById('room-form').scrollIntoView({behavior:'smooth'})">
        + Add New Room
      </button>
    </div>

    <div class="room-type-grid">
      ${roomTypes.map(type => {
        const count = data.rooms.filter(r => r.type === type.name).length;
        const available = data.rooms.filter(
          r => r.type === type.name && r.status === "Available"
        ).length;
        const occupied = data.rooms.filter(
          r => r.type === type.name && r.status === "Occupied"
        ).length;
        const cleaning = data.rooms.filter(
          r => r.type === type.name && r.status === "Cleaning"
        ).length;

        return `
          <div class="room-type-card">
            <img src="${type.image}"
              alt="${type.name}"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">

            <div class="room-image-fallback">${type.icon}</div>

            <div class="room-type-info">
              <h3>${type.name}</h3>
              <p>${type.description}</p>

              <div class="room-type-stats">
                <span>Total: <b>${count}</b></span>
                <span class="available-text">Available: ${available}</span>
              </div>

              <div class="room-status-summary">
                <span>🟢 ${available} Available</span>
                <span>🔴 ${occupied} Occupied</span>
                <span>🟠 ${cleaning} Cleaning</span>
              </div>

              <button onclick="selectRoomType('${type.name}')">
                View / Add Rooms
              </button>
            </div>
          </div>`;
      }).join("")}
    </div>

    <div class="panel room-form-panel" id="room-form">
      <h3>＋ Add New Room</h3>

      <form class="form" onsubmit="addRoom(event)">
        <div>
          <label>Room Number</label>
          <input id="roomNumber" required placeholder="e.g. R001">
        </div>

        <div>
          <label>Room Type</label>
          <select id="roomType">
            <option>Single Room</option>
            <option>Double Room</option>
            <option>Suite</option>
            <option>Studio Apartment</option>
          </select>
        </div>

        <div>
          <label>Monthly Rent (₱)</label>
          <input id="roomRent" type="number" min="1" required placeholder="e.g. 3500">
        </div>

        <div>
          <label>Room Status</label>
          <select id="roomStatus">
            <option>Available</option>
            <option>Occupied</option>
            <option>Cleaning</option>
          </select>
        </div>

        <div class="full">
          <button type="submit">Save Room</button>
        </div>
      </form>
    </div>

    <div class="panel">
      <h3>All Room Records</h3>
      <div id="room-filter-info"></div>
      ${roomTable()}
    </div>
  `;
}

function selectRoomType(type) {
  const select = document.getElementById("roomType");
  if (select) {
    select.value = type;
  }

  const info = document.getElementById("room-filter-info");
  if (info) {
    info.innerHTML = `<p class="note">Selected room type: ${safe(type)}. You can add this room using the form above.</p>`;
  }

  const form = document.getElementById("room-form");
  if (form) {
    form.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

function addRoom(event) {
  event.preventDefault();
  const number = document.getElementById("roomNumber").value.trim();

  if (data.rooms.some(r => r.number.toLowerCase() === number.toLowerCase())) {
    alert("Room number already exists.");
    return;
  }

  data.rooms.push({
    number,
    type: document.getElementById("roomType").value,
    rent: Number(document.getElementById("roomRent").value),
    status: document.getElementById("roomStatus").value,
    tenant: ""
  });

  renderRooms();
  alert("Room added successfully!");
}

function deleteRoom(i) {
  if (confirm("Delete this room?")) {
    data.rooms.splice(i,1);
    renderDashboard();
  }
}

function renderTenants() {
  const c = document.getElementById("page-content");
  c.innerHTML = `
    <div class="panel"><h3>Add Tenant</h3>
      <form class="form" onsubmit="addTenant(event)">
        <div><label>Full Name</label><input id="tenantName" required></div>
        <div><label>Contact Number</label><input id="tenantPhone" type="tel" required></div>
        <div><label>Monthly Rent (₱)</label><input id="tenantRent" type="number" min="1" required></div>
        <div><label>Due Day (1–28)</label><input id="tenantDue" type="number" min="1" max="28" value="1" required></div>
        <div class="full"><button>Add Tenant</button></div>
      </form>
    </div>
    <div class="panel"><h3>Tenant Records</h3>${tenantTable()}</div>`;
}

function addTenant(event) {
  event.preventDefault();
  data.tenants.push({
    name: document.getElementById("tenantName").value.trim(),
    phone: document.getElementById("tenantPhone").value.trim(),
    rent: Number(document.getElementById("tenantRent").value),
    due: document.getElementById("tenantDue").value,
    paid: false,
    overdue: false,
    room: ""
  });
  renderTenants();
  alert("Tenant added successfully!");
}

function tenantTable() {
  if (!data.tenants.length) return `<p class="empty">No tenant records yet.</p>`;
  return `<div class="table-wrap"><table>
    <tr><th>Name</th><th>Contact</th><th>Monthly Rent</th><th>Room</th><th>Action</th></tr>
    ${data.tenants.map((t,i) => `<tr>
      <td>${safe(t.name)}</td><td>${safe(t.phone)}</td><td>${money(t.rent)}</td>
      <td>${safe(t.room || "Not assigned")}</td>
      <td><button onclick="deleteTenant(${i})">Delete</button></td>
    </tr>`).join("")}
  </table></div>`;
}

function deleteTenant(i) {
  if (confirm("Delete this tenant?")) {
    data.tenants.splice(i,1);
    renderTenants();
  }
}

function renderAssignTenant() {
  const available = data.rooms.filter(r => r.status === "Available");
  const c = document.getElementById("page-content");

  c.innerHTML = `<div class="panel"><h3>Assign Tenant to Room</h3>
    ${!data.tenants.length || !available.length
      ? `<p class="empty">Add a tenant and an available room first.</p>`
      : `<form class="form" onsubmit="assignTenant(event)">
        <div><label>Select Tenant</label><select id="assignTenant">
          ${data.tenants.map((t,i) => `<option value="${i}">${safe(t.name)}</option>`).join("")}
        </select></div>
        <div><label>Select Room</label><select id="assignRoom">
          ${available.map(r => `<option value="${safe(r.number)}">${safe(r.number)} — ${safe(r.type)}</option>`).join("")}
        </select></div>
        <div class="full"><button>Assign Room</button></div>
      </form>`}
  </div>`;
}

function assignTenant(event) {
  event.preventDefault();
  const tenant = data.tenants[Number(document.getElementById("assignTenant").value)];
  const room = data.rooms.find(r => r.number === document.getElementById("assignRoom").value);

  if (!tenant || !room || room.status !== "Available") {
    alert("Please select an available room and tenant.");
    return;
  }

  if (tenant.room) {
    alert("This tenant already has a room assigned.");
    return;
  }

  tenant.room = room.number;
  room.tenant = tenant.name;
  room.status = "Occupied";
  renderAssignTenant();
  alert("Tenant assigned successfully!");
}

function renderPaymentForm() {
  const c = document.getElementById("page-content");
  c.innerHTML = `<div class="panel"><h3>Record Rent Payment</h3>
    ${!data.tenants.length ? `<p class="empty">Add a tenant first before recording a payment.</p>` :
    `<form class="form" onsubmit="addPayment(event)">
      <div><label>Tenant</label><select id="paymentTenant">
        ${data.tenants.map((t,i) => `<option value="${i}">${safe(t.name)} — ${money(t.rent)}</option>`).join("")}
      </select></div>
      <div><label>Amount Paid (₱)</label><input id="paymentAmount" type="number" min="1" required></div>
      <div><label>Payment Date</label><input id="paymentDate" type="date" required></div>
      <div><label>Payment Method</label><select id="paymentMethod">
        <option>Cash</option><option>GCash</option><option>Bank Transfer</option>
      </select></div>
      <div class="full"><button>Save Payment</button></div>
    </form>`}
  </div>
  <div class="panel"><h3>Recent Payments</h3>${paymentTable()}</div>`;
}

function addPayment(event) {
  event.preventDefault();
  const index = Number(document.getElementById("paymentTenant").value);
  const tenant = data.tenants[index];
  const amount = Number(document.getElementById("paymentAmount").value);

  if (!tenant || amount <= 0) {
    alert("Enter a valid payment.");
    return;
  }

  data.payments.push({
    name: tenant.name,
    amount,
    date: document.getElementById("paymentDate").value,
    method: document.getElementById("paymentMethod").value
  });

  tenant.paid = true;
  tenant.overdue = false;
  renderPaymentForm();
  alert("Payment recorded!");
}

function paymentTable() {
  if (!data.payments.length) return `<p class="empty">No payment records yet.</p>`;
  return `<div class="table-wrap"><table>
    <tr><th>Tenant</th><th>Amount</th><th>Date</th><th>Method</th></tr>
    ${data.payments.map(p => `<tr>
      <td>${safe(p.name)}</td><td>${money(p.amount)}</td>
      <td>${safe(p.date)}</td><td>${safe(p.method)}</td>
    </tr>`).join("")}
  </table></div>`;
}

function renderPayments() {
  document.getElementById("page-content").innerHTML = `
    <div class="panel"><h3>Rent Payment History</h3>
      ${paymentTable()}
    </div>`;
}

function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

renderDashboard();


/* LOGIN, CREATE ACCOUNT AND LOGOUT
   Demo authentication for GitHub Pages only.
*/

function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem("apartmentAccounts") || "[]");
  } catch {
    return [];
  }
}

function showAuthPage(mode, message = "") {
  const app = document.querySelector(".app");
  if (app) app.style.display = "none";

  let auth = document.getElementById("auth-screen");

  if (!auth) {
    auth = document.createElement("div");
    auth.id = "auth-screen";
    document.body.prepend(auth);
  }

  const isRegister = mode === "register";

  auth.innerHTML = `
    <div class="auth-screen">
      <div class="auth-card">
        <h1>🏠 ApartmentPro</h1>
        <p class="auth-subtitle">
          ${isRegister ? "Create your account" : "Login to your account"}
        </p>

        <form class="auth-form"
          onsubmit="${isRegister ? "createAccount(event)" : "loginAccount(event")}">

          ${isRegister ? `
            <div>
              <label for="auth-name">Full Name</label>
              <input id="auth-name" required maxlength="80"
                autocomplete="name" placeholder="Enter your full name">
            </div>

            <div>
              <label for="auth-email">Email</label>
              <input id="auth-email" type="email" required
                autocomplete="email" placeholder="Enter your email">
            </div>
          ` : ""}

          <div>
            <label for="auth-username">Username</label>
            <input id="auth-username" required maxlength="40"
              autocomplete="username" placeholder="Enter username">
          </div>

          <div>
            <label for="auth-password">Password</label>
            <input id="auth-password" type="password" required
              minlength="6" autocomplete="${isRegister ? "new-password" : "current-password"}"
              placeholder="Enter password">
          </div>

          ${isRegister ? `
            <div>
              <label for="auth-confirm">Confirm Password</label>
              <input id="auth-confirm" type="password" required
                minlength="6" autocomplete="new-password"
                placeholder="Confirm password">
            </div>
          ` : ""}

          <p class="auth-message" role="status">${message}</p>

          <button type="submit">
            ${isRegister ? "Create Account" : "Login"}
          </button>
        </form>

        <p class="auth-switch">
          ${isRegister
            ? `Already have an account?
              <button type="button" onclick="showAuthPage('login')">Login</button>`
            : `Don't have an account?
              <button type="button" onclick="showAuthPage('register')">Create Account</button>`}
        </p>
      </div>
    </div>`;
}

function createAccount(event) {
  event.preventDefault();

  const name = document.getElementById("auth-name").value.trim();
  const email = document.getElementById("auth-email").value.trim().toLowerCase();
  const username = document.getElementById("auth-username").value.trim();
  const password = document.getElementById("auth-password").value;
  const confirmPassword = document.getElementById("auth-confirm").value;

  if (password !== confirmPassword) {
    showAuthPage("register", "Passwords do not match.");
    return;
  }

  const accounts = getAccounts();

  if (accounts.some(a =>
    a.username.toLowerCase() === username.toLowerCase() ||
    a.email === email
  )) {
    showAuthPage("register", "Username or email already exists.");
    return;
  }

  accounts.push({ name, email, username, password });

  try {
    localStorage.setItem("apartmentAccounts", JSON.stringify(accounts));
  } catch {
    showAuthPage("register", "Could not save account in this browser.");
    return;
  }

  showAuthPage("login", "Account created! Please log in.");
}

function loginAccount(event) {
  event.preventDefault();

  const username = document.getElementById("auth-username").value.trim();
  const password = document.getElementById("auth-password").value;

  const account = getAccounts().find(a =>
    a.username.toLowerCase() === username.toLowerCase() &&
    a.password === password
  );

  if (!account) {
    showAuthPage("login", "Incorrect username or password.");
    return;
  }

  sessionStorage.setItem("apartmentLoggedIn", "true");
  sessionStorage.setItem("apartmentUser", account.name);

  openApartmentDashboard(account.name);
}

function openApartmentDashboard(name) {
  const auth = document.getElementById("auth-screen");
  if (auth) auth.remove();

  const app = document.querySelector(".app");
  if (app) app.style.display = "flex";

  const topbar = document.querySelector(".topbar");
  if (topbar) {
    let userArea = document.getElementById("auth-user-area");

    if (!userArea) {
      userArea = document.createElement("div");
      userArea.id = "auth-user-area";
      userArea.style.display = "flex";
      userArea.style.alignItems = "center";
      userArea.style.gap = "8px";
      topbar.appendChild(userArea);
    }

    userArea.innerHTML = `
      <span>👤 ${safe(name)}</span>
      <button class="auth-logout" onclick="logoutAccount()">Logout</button>
    `;
  }

  renderDashboard();
}

function logoutAccount() {
  sessionStorage.removeItem("apartmentLoggedIn");
  sessionStorage.removeItem("apartmentUser");
  showAuthPage("login", "You have logged out.");
}

function initializeAuth() {
  if (sessionStorage.getItem("apartmentLoggedIn") === "true") {
    openApartmentDashboard(
      sessionStorage.getItem("apartmentUser") || "User"
    );
  } else {
    showAuthPage("login");
  }
}

initializeAuth();
