# Multicabs Near You – Map Prototype

This is a **pure web (HTML + CSS + JS)** prototype for a multicab live-view screen.

### What it does

- **Screen 1 only – Home**
  - Shows an interactive **map** (OpenStreetMap via Leaflet).
  - **Blue dot** = your current location (auto-detected via browser geolocation).
  - Several nearby **multicab icons** are rendered around you with color codes:
    - **Green** – _may bakante_
    - **Yellow** – _1–2 seats left_
    - **Red** – _puno_
  - Top card text: **"Multicabs near you"** with supporting copy:
    - 👉 _No search needed_
    - 🗺️ _App auto-uses your current location_

- If location access is blocked or fails, the app:
  - Falls back to a sample city location.
  - Still shows sample multicabs around that fallback point.
  - Shows a subtle toast explaining what happened.

### How to run

1. Open the project folder on your machine:

   - `c:\Users\Ace\OneDrive\Desktop\ace`

2. Use any of these options:

   - **Option A: Double-click**
     - Double-click `index.html` to open in your default browser.
   - **Option B: Small local server (recommended for some browsers)**
     - Using Python 3:
       - Open a terminal in this folder.
       - Run: `python -m http.server 8000`
       - Visit: `http://localhost:8000` in your browser.

3. When the page loads:

   - If asked, **allow location access** so the blue dot and multicabs appear around your real position.

### Tech notes

- No build step; everything is in:
  - `index.html`
- Map powered by:
  - **Leaflet** (CDN)
  - **OpenStreetMap** tiles

