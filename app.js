// Basic map setup
const map = L.map("map", {
  zoomControl: true,
  attributionControl: true,
  worldCopyJump: true,
});

const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  minZoom: 3,
  attribution: "&copy; OpenStreetMap",
}).addTo(map);

// Layer group for multicab markers (so we can clear them in demo mode)
const multicabLayer = L.layerGroup().addTo(map);

// Store last location so we can re-add markers when exiting demo mode
let lastMapCenter = { lat: 9.7393, lng: 118.735 };

// Demo mode: show night / no cabs (5-tap on "Multicabs near you" to toggle)
let demoMode = false;

function updateActiveCabsList(cabs) {
  if (!activeCabsList) return;
  activeCabsList.innerHTML = "";
  if (!cabs || cabs.length === 0) {
    const empty = document.createElement("span");
    empty.className = "active-cabs-empty";
    empty.textContent = "No active cabs";
    activeCabsList.appendChild(empty);
    if (activeCabsBar) activeCabsBar.classList.add("empty");
    return;
  }
  if (activeCabsBar) activeCabsBar.classList.remove("empty");
  const count = cabs.length;
  const item = document.createElement("div");
  item.className = "active-route-item";
  item.innerHTML = `
    <span class="active-route-cab-logo" aria-hidden="true">🚐</span>
    <span class="active-route-title">${count} cab${count !== 1 ? "s" : ""} available</span>
  `;
  activeCabsList.appendChild(item);
}

function setDemoMode(on) {
  demoMode = on;
  if (on) {
    updateActiveCabsList([]);
    multicabLayer.clearLayers();
    if (emptyChip) emptyChip.classList.add("visible");
    if (emptyChipText) emptyChipText.textContent = "No multicabs at this hour.";
    showToast("Demo: night view (no cabs). Click the button again to exit.", 4000);
    if (demoButton) demoButton.classList.add("demo-active");
    if (demoButtonText) demoButtonText.textContent = "Exit demo";
  } else {
    addMulticabMarkers(lastMapCenter.lat, lastMapCenter.lng);
    showToast("Demo off. Showing multicabs again.", 2500);
    if (demoButton) demoButton.classList.remove("demo-active");
    if (demoButtonText) demoButtonText.textContent = "Demo: night view";
  }
}

// UI elements
const locationChipText = document.getElementById("locationChipText");
const emptyChipText = document.getElementById("emptyChipText");
const banner = document.getElementById("banner");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
const howButton = document.getElementById("howButton");
const sheetBackdrop = document.getElementById("sheetBackdrop");
const sheetClose = document.getElementById("sheetClose");
const emptyChip = document.getElementById("emptyChip");
const activeCabsBar = document.getElementById("activeCabsBar");
const activeCabsList = document.getElementById("activeCabsList");
const demoButton = document.getElementById("demoButton");
const demoButtonText = document.getElementById("demoButtonText");
const splash = document.getElementById("splash");
const panelToggle = document.getElementById("panelToggle");
const topPanel = document.querySelector(".top-panel");

function showToast(message, duration = 3800) {
  toastMessage.textContent = message;
  toast.classList.add("visible");
  if (duration > 0) {
    setTimeout(() => {
      toast.classList.remove("visible");
    }, duration);
  }
}

function formatCoords(lat, lng) {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

// User marker (blue dot)
let userMarker;

function setUserLocation(lat, lng) {
  const pos = [lat, lng];

  if (!userMarker) {
    const userIcon = L.divIcon({
      className: "",
      html: `
        <div style="
          width: 16px;
          height: 16px;
          border-radius: 999px;
          background: #38bdf8;
          box-shadow:
            0 0 0 6px rgba(56, 189, 248, 0.35),
            0 0 18px rgba(56, 189, 248, 0.85);
          border: 2px solid #0f172a;
        "></div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    userMarker = L.marker(pos, { icon: userIcon }).addTo(map);
  } else {
    userMarker.setLatLng(pos);
  }

  map.setView(pos, 16);
  locationChipText.textContent = formatCoords(lat, lng);
}

// Real multicabs list (using exact coordinates when provided).
// You can add more entries here as you collect real data.
const REAL_MULTICABS = [
  {
    id: "MC-1",
    lat: 9.740285077719754,
    lng: 118.73768247492072,
    routeNumber: 1,
    routeName: "Rizal St route",
    driverName: "Juan Dela Cruz",
    plateNumber: "ABC 1234",
    direction: "towards",
  },
  {
    id: "MC-2",
    lat: 9.741504708213384,
    lng: 118.74420242752834,
    routeNumber: 1,
    routeName: "Rizal St route",
    driverName: "Driver 2",
    plateNumber: "CAB 0002",
    direction: "away",
  },
  {
    id: "MC-3",
    lat: 9.742567376933073,
    lng: 118.73084673847242,
    routeNumber: 2,
    routeName: "Malvar route",
    driverName: "Driver 3",
    plateNumber: "CAB 0003",
    direction: "towards",
  },
  {
    id: "MC-4",
    lat: 9.744656351439975,
    lng: 118.74039903063725,
    routeNumber: 2,
    routeName: "Malvar route",
    driverName: "Driver 4",
    plateNumber: "CAB 0004",
    direction: "away",
  },
  {
    id: "MC-5",
    lat: 9.74233300463957,
    lng: 118.7364941280831,
    routeNumber: 2,
    routeName: "Malvar route",
    driverName: "Driver 5",
    plateNumber: "CAB 0005",
    direction: "towards",
  },
  {
    id: "MC-6",
    lat: 9.740116982049187,
    lng: 118.74087643913037,
    routeNumber: 1,
    routeName: "Rizal St route",
    driverName: "Driver 6",
    plateNumber: "CAB 0006",
    direction: "away",
  },
  {
    id: "MC-7",
    lat: 9.740683549197378,
    lng: 118.73032741591591,
    routeNumber: 1,
    routeName: "Rizal St route",
    driverName: "Driver 7",
    plateNumber: "CAB 0007",
    direction: "towards",
  },
];

// Fallback generator if there are no real entries defined.
// Keeps the streets logic so the prototype still works without data.
function generateMockMulticabs(centerLat, centerLng) {
  const configs = [
    { status: "green", label: "May bakante", seats: "3–4 seats available" },
    { status: "green", label: "May bakante", seats: "2–3 seats available" },
    { status: "yellow", label: "1–2 seats left", seats: "2 seats left" },
    { status: "yellow", label: "1–2 seats left", seats: "1 seat left" },
    { status: "red", label: "Puno", seats: "Standing na lang" },
  ];

  const details = [
    { driverName: "Juan Dela Cruz", plateNumber: "ABC 1234" },
    { driverName: "Maria Santos", plateNumber: "XYZ 5678" },
    { driverName: "Pedro Reyes", plateNumber: "KLM 9101" },
    { driverName: "Ana Lopez", plateNumber: "DEF 2345" },
    { driverName: "Rico Cruz", plateNumber: "GHI 6789" },
  ];

  const rizalLat = centerLat + 0.0004;
  const malvarLng = centerLng - 0.0004;

  const results = [];

  configs.forEach((cfg, index) => {
    const baseDetail = details[index % details.length];
    const isRoute1 = index % 2 === 0;
    const routeNumber = isRoute1 ? 1 : 2;
    const routeName = isRoute1 ? "Rizal St route" : "Malvar route";

    let lat;
    let lng;

    if (isRoute1) {
      const deltaLng = (Math.random() - 0.5) * 0.006;
      lat = rizalLat;
      lng = centerLng + deltaLng;
    } else {
      const deltaLat = (Math.random() - 0.5) * 0.006;
      lat = centerLat + deltaLat;
      lng = malvarLng;
    }

    results.push({
      id: "MC-" + (index + 1),
      lat,
      lng,
      status: cfg.status,
      label: cfg.label,
      seats: cfg.seats,
      driverName: baseDetail.driverName,
      plateNumber: baseDetail.plateNumber,
      routeNumber,
      routeName,
    });
  });

  return results;
}

function getStatusColor(status) {
  if (status === "green") return "#22c55e";
  if (status === "yellow") return "#facc15";
  return "#ef4444";
}

function getStatusText(status) {
  if (status === "green") return "3+ seats vacant";
  if (status === "yellow") return "1–2 seats vacant";
  return "No seats available";
}

function getDirectionText(cab) {
  // Red arrow (currently when direction === "away") = heading back to town
  if (cab.direction === "away") {
    return "Heading back to town";
  }
  // Green arrow (other cases) = leaving town
  return "Leaving town";
}

// Simple helper to rotate the arrow based on route + direction.
// Route 1 (Rizal): left/right; Route 2 (Malvar): up/down.
function getArrowAngleForCab(cab) {
  const dir = cab.direction || "towards";
  if (cab.routeNumber === 1) {
    // Horizontal street
    return dir === "away" ? 180 : 0; // 0° = ➡, 180° = ⬅ (after rotation)
  }
  // Vertical street
  return dir === "away" ? 90 : -90; // 90° = ⬇, -90° = ⬆ (after rotation)
}

function addMulticabMarkers(lat, lng) {
  // If you have real multicabs defined, use them; otherwise fall back to mock ones.
  const source =
    REAL_MULTICABS.length > 0 ? REAL_MULTICABS.map((cab, index) => {
      // Randomly assign status + seats if not provided
      const statuses = ["green", "yellow", "red"];
      const status = cab.status || statuses[Math.floor(Math.random() * statuses.length)];
      const seatsMap = {
        green: "3+ seats vacant",
        yellow: "1–2 seats vacant",
        red: "No seats available / standing only",
      };

      return {
        id: cab.id || `MC-${index + 1}`,
        lat: cab.lat,
        lng: cab.lng,
        routeNumber: cab.routeNumber,
        routeName: cab.routeName,
        driverName: cab.driverName,
        plateNumber: cab.plateNumber,
        status,
        seats: cab.seats || seatsMap[status],
        direction: cab.direction || "towards",
        arrowAngle: getArrowAngleForCab(cab),
      };
    }) : generateMockMulticabs(lat, lng);

  const multicabs = source;
  lastMapCenter = { lat, lng };

  // Clear previous multicab markers (e.g. when exiting demo mode)
  multicabLayer.clearLayers();

  if (emptyChip) {
    if (!multicabs || multicabs.length === 0) {
      emptyChip.classList.add("visible");
      if (emptyChipText) {
        const hour = new Date().getHours();
        const isNight = hour >= 20 || hour < 5;
        emptyChipText.textContent = isNight
          ? "No multicabs at this hour."
          : "No active multicabs on Rizal / Malvar right now.";
      }
    } else {
      emptyChip.classList.remove("visible");
    }
  }

  multicabs.forEach((cab) => {
    const color = getStatusColor(cab.status);
    const statusText = getStatusText(cab.status);
    const isAway = cab.direction === "away";
    const arrowChar = isAway ? "←" : "→";

    const icon = L.divIcon({
      className: "",
      html: `
        <div style="
          position: relative;
          transform: translateY(-2px);
        ">
          <div style="
            position: relative;
            width: 28px;
            height: 28px;
            border-radius: 10px;
            background: ${color};
            box-shadow:
              0 0 0 6px rgba(15, 23, 42, 0.9),
              0 0 18px rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0f172a;
            font-size: 13px;
            font-weight: 800;
          ">
            <span style="font-size: 17px; margin-right: 1px;">🚐</span>
            <span style="
              position: absolute;
              top: -6px;
              right: -6px;
              width: 16px;
              height: 16px;
              border-radius: 999px;
              background: rgba(15, 23, 42, 0.98);
              border: 1px solid rgba(148, 163, 184, 0.8);
              color: #e5e7eb;
              font-size: 10px;
              font-weight: 700;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              ${cab.routeNumber}
            </span>
            <span style="
              position: absolute;
              bottom: -14px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 16px;
              color: ${isAway ? "#ef4444" : "#22c55e"};
              text-shadow:
                0 0 4px rgba(0,0,0,1),
                0 0 10px rgba(0,0,0,1),
                0 0 14px rgba(0,0,0,1);
              font-weight: 900;
            ">
              ${arrowChar}
            </span>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 24],
    });

    const marker = L.marker([cab.lat, cab.lng], { icon }).addTo(multicabLayer);

    const directionText = getDirectionText(cab);

    const popupHtml = `
      <div>
        <div class="popup-title">Multicab ${cab.id}</div>
        <div class="popup-meta"><strong>Driver:</strong> ${cab.driverName}</div>
        <div class="popup-meta"><strong>Plate no.:</strong> ${cab.plateNumber}</div>
        <div class="popup-meta"><strong>Route ${cab.routeNumber}:</strong> ${cab.routeName}</div>
        <div class="popup-meta"><strong>Direction:</strong> ${directionText}</div>
        <div class="popup-meta">${cab.seats}</div>
        <div class="popup-pill">
          <span class="popup-pill-dot ${cab.status}"></span>
          <span>${statusText}</span>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml);
  });

  updateActiveCabsList(multicabs);
}

function fallbackLocation() {
  // Fallback: simple city center (e.g. Cebu City)
  const fallbackLat = 10.3157;
  const fallbackLng = 123.8854;

  setUserLocation(fallbackLat, fallbackLng);
  addMulticabMarkers(fallbackLat, fallbackLng);

  banner.innerHTML =
    '<span class="banner-dot"></span><span><strong>Note:</strong> Di ma-access ang exact GPS mo. Showing sample multicabs near a default location.</span>';

  showToast("Di ma-access ang GPS. Gumamit kami ng sample location.", 4500);
}

// Initialize geolocation flow
function init() {
  // Show active cabs bar immediately (so it’s visible before location loads)
  updateActiveCabsList([]);

  if (!navigator.geolocation) {
    fallbackLocation();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation(latitude, longitude);
      addMulticabMarkers(latitude, longitude);
      banner.innerHTML =
        '<span class="banner-dot"></span><span><strong>Nice!</strong> We are using your location to show multicabs around you.</span>';
    },
    () => {
      fallbackLocation();
    },
    {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 0,
    }
  );

  // Nudge user to allow location early
  setTimeout(() => {
    showToast("Please allow GPS so we can show multicabs near you.");
  }, 1200);

  // Splash auto-hide safety (in case animation doesn't run)
  if (splash) {
    setTimeout(() => {
      splash.style.display = "none";
    }, 3500);
  }

  // How it works handlers
  howButton.addEventListener("click", () => {
    sheetBackdrop.classList.add("open");
  });

  sheetClose.addEventListener("click", () => {
    sheetBackdrop.classList.remove("open");
  });

  sheetBackdrop.addEventListener("click", (event) => {
    if (event.target === sheetBackdrop) {
      sheetBackdrop.classList.remove("open");
    }
  });

  // Demo button (below "How it works") toggles night / no cabs view
  if (demoButton) {
    demoButton.addEventListener("click", () => setDemoMode(!demoMode));
  }

  // 5-tap on "Multicabs near you" also toggles demo mode (hidden shortcut)
  const demoTrigger = document.getElementById("demoTrigger");
  if (demoTrigger) {
    let tapCount = 0;
    let tapTimer = null;
    demoTrigger.addEventListener("click", () => {
      tapCount += 1;
      if (tapTimer) clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { tapCount = 0; }, 800);
      if (tapCount >= 5) {
        tapCount = 0;
        if (tapTimer) clearTimeout(tapTimer);
        setDemoMode(!demoMode);
      }
    });
  }

  // Collapse / expand top panel
  if (panelToggle && topPanel) {
    panelToggle.addEventListener("click", () => {
      const collapsed = topPanel.classList.toggle("collapsed");
      const iconSpan = panelToggle.querySelector("span");
      const textSpan = panelToggle.querySelectorAll("span")[1];
      if (collapsed) {
        if (iconSpan) iconSpan.textContent = "▴";
        if (textSpan) textSpan.textContent = "Show";
      } else {
        if (iconSpan) iconSpan.textContent = "▾";
        if (textSpan) textSpan.textContent = "Hide";
      }
    });
  }

}

init();

