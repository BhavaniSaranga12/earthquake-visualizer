import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function App() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
    )
      .then((res) => res.json())
      .then((data) => {
        setEarthquakes(data.features);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  }, []);

  // 🌍 Colored marker icons for magnitudes
  const getLocationIcon = (mag) => {
    let color;
    if (mag >= 6) color = '#ef4444'; // red
    else if (mag >= 4) color = '#f97316'; // orange
    else if (mag >= 2) color = '#eab308'; // yellow
    else color = '#22c55e'; // green

    const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="" stroke-width="1.5">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5" fill="white"/>
    </svg>
  `;

    return L.divIcon({
      html: svgIcon,
      className: '',
      iconSize: [30, 40],
      iconAnchor: [15, 40],
      popupAnchor: [0, -36],
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white text-2xl animate-pulse">
        Fetching Earthquake Data...
      </div>
    );
  }

  const latestQuakes = earthquakes
    .sort((a, b) => b.properties.time - a.properties.time)
    .slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-zinc-900 to-neutral-900 text-gray-100">
      {/* HERO SECTION */}
      <section className="text-center py-10 bg-gradient-to-b from-black via-neutral-900 to-zinc-800 shadow-lg">
        <h1 className="text-4xl font-extrabold tracking-wide mb-2 animate-fadeIn text-white">
          🌍 Earthquake Visualizer
        </h1>
        <p className="text-gray-400 italic text-lg animate-fadeIn">
          Real-time Global Earthquake Dashboard
        </p>
      </section>

      {/* MAIN CONTENT */}
      <div className="flex flex-col sm:flex-row flex-1 p-6 gap-6">
        {/* LEFT SIDE MAP */}
        <div className="sm:w-[70%] w-full rounded-2xl shadow-2xl overflow-hidden border border-gray-700 bg-zinc-800 flex flex-col">
          <div className="flex-1">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              className="h-full w-full rounded-xl"
              style={{ height: '100%', minHeight: '75vh' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />
              {earthquakes.map((eq) => {
                const [lon, lat] = eq.geometry.coordinates;
                const { mag, place, time, url } = eq.properties;
                return (
                  <Marker
                    key={eq.id}
                    position={[lat, lon]}
                    icon={getLocationIcon(mag)}
                  >
                    <Popup>
                      <div className="text-sm text-black">
                        <b>{place}</b>
                        <br />
                        Magnitude: {mag}
                        <br />
                        Time: {new Date(time).toLocaleString()}
                        <br />
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline text-gray-700"
                        >
                          View Details
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* RIGHT SIDE INFO PANEL */}
        <div className="sm:w-[30%] w-full bg-white/10 backdrop-blur-md border border-gray-700 rounded-2xl shadow-xl p-6 flex flex-col justify-between transition-all duration-500 hover:shadow-2xl">
          {/* Stats */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-200 uppercase">
              Today's Earthquakes
            </h2>
            <p className="text-5xl font-bold text-white mt-3 animate-bounce">
              {earthquakes.length}
            </p>
          </div>

          {/* Latest Quakes */}
          <div className="flex-1 overflow-y-auto space-y-3">
            <h3 className="text-lg font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-1">
              Latest Earthquakes
            </h3>
            {latestQuakes.map((q, index) => (
              <div
                key={q.id}
                className="bg-white/5 rounded-xl border border-gray-700 p-3 hover:bg-white/10 transition-all duration-300"
                style={{
                  animation: `fadeInUp ${0.3 + index * 0.1}s ease-in-out`,
                }}
              >
                <p className="text-sm font-medium text-gray-200">
                  {q.properties.place}
                </p>
                <p className="text-xs text-gray-400">
                  Magnitude:{' '}
                  <span className="font-semibold text-gray-100">
                    {q.properties.mag}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(q.properties.time).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 bg-zinc-900 border border-gray-700 rounded-lg p-3 text-sm shadow-inner">
            <h4 className="font-semibold mb-1 text-gray-200">
              Magnitude Legend
            </h4>
            <div className="text-gray-400">🟢 Minor (&lt;2)</div>
            <div className="text-gray-400">🟡 Light (2–4)</div>
            <div className="text-gray-400">🟠 Moderate (4–6)</div>
            <div className="text-gray-400">🔴 Strong (&gt;6)</div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center py-3 bg-black text-gray-400 text-sm shadow-inner">
        Built by <b>Bhavani</b> | Data Source: USGS API
      </footer>
    </div>
  );
}

export default App;
