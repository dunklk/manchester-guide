/* global React */
// Manchester map — clean Google basemap + our overlays + zoom/pan.
const { useState, useRef, useEffect } = React;

function ManchesterMap({ venues, categories, activeCat, onPinClick, theme, route, routeNumbers }) {
  const isDark = theme === "dark";
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));
  const visibleVenues = venues.filter(v => v.x != null && v.y != null).map(v => ({
    ...v,
    dim: activeCat && activeCat !== "all" && v.cat !== activeCat
  }));

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const wrapRef = useRef(null);
  const dragRef = useRef(null);

  const ZOOM_MIN = 1;
  const ZOOM_MAX = 4;
  const ZOOM_STEP = 0.5;

  // Clamp pan so you can't drag the map away from view
  function clampPan(p, z, w, h) {
    if (z <= 1) return { x: 0, y: 0 };
    const maxX = (w * (z - 1)) / 2;
    const maxY = (h * (z - 1)) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, p.x)),
      y: Math.max(-maxY, Math.min(maxY, p.y))
    };
  }

  function setZoomAt(newZoom, originPx) {
    if (!wrapRef.current) { setZoom(newZoom); return; }
    const rect = wrapRef.current.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    // origin defaults to centre
    const ox = originPx ? originPx.x : w / 2;
    const oy = originPx ? originPx.y : h / 2;
    // Convert origin to image coords (relative to image centre, accounting for current pan/zoom)
    const imgCx = (ox - w / 2 - pan.x) / zoom;
    const imgCy = (oy - h / 2 - pan.y) / zoom;
    // After zoom change, we want imgCx/imgCy to project back to ox/oy
    const newPan = {
      x: ox - w / 2 - imgCx * newZoom,
      y: oy - h / 2 - imgCy * newZoom
    };
    setZoom(newZoom);
    setPan(clampPan(newPan, newZoom, w, h));
  }

  function zoomIn()  { setZoomAt(Math.min(ZOOM_MAX, zoom + ZOOM_STEP)); }
  function zoomOut() { setZoomAt(Math.max(ZOOM_MIN, zoom - ZOOM_STEP)); }
  function resetView() { setZoom(1); setPan({ x: 0, y: 0 }); }

  // Drag-to-pan
  function handlePointerDown(e) {
    // Don't start a drag if the user tapped a button (zoom controls, pins)
    if (e.target.closest('button')) return;
    if (zoom <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
  }
  function handlePointerMove(e) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    setPan(clampPan(
      { x: dragRef.current.panX + dx, y: dragRef.current.panY + dy },
      zoom, rect.width, rect.height
    ));
  }
  function handlePointerUp(e) {
    dragRef.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  }

  // Wheel-to-zoom (desktop)
  function handleWheel(e) {
    if (!e.ctrlKey && !e.metaKey && Math.abs(e.deltaY) < 30) return; // ignore tiny scrolls
    e.preventDefault();
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const ox = e.clientX - rect.left;
    const oy = e.clientY - rect.top;
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom + delta));
    setZoomAt(newZoom, { x: ox, y: oy });
  }

  // Districts — soft polygons + labels
  const districts = [
    { id: "salford",       name: "SALFORD",          color: "#9C7B5A",
      path: "M 2,18 Q 10,12 18,16 Q 24,22 20,30 Q 14,36 6,32 Q 0,26 2,18 Z",
      labelX: 11, labelY: 22 },
    { id: "spinningfields",name: "SPINNINGFIELDS",   color: "#E8B23A",
      path: "M 26,42 Q 34,40 40,46 Q 42,54 36,58 Q 28,58 24,52 Q 24,46 26,42 Z",
      labelX: 33, labelY: 50 },
    { id: "city",          name: "CITY CENTRE",      color: "#B58FE6",
      path: "M 42,42 Q 52,40 58,46 Q 58,54 52,56 Q 44,56 42,50 Q 40,46 42,42 Z",
      labelX: 49, labelY: 49 },
    { id: "nq",            name: "NORTHERN QUARTER", color: "#3CC8B5",
      path: "M 56,30 Q 66,28 70,34 Q 70,42 64,46 Q 56,46 54,40 Q 52,34 56,30 Z",
      labelX: 61, labelY: 38 },
    { id: "ancoats",       name: "ANCOATS",          color: "#5BB872",
      path: "M 70,28 Q 82,26 86,32 Q 86,40 80,44 Q 72,44 68,38 Q 68,32 70,28 Z",
      labelX: 77, labelY: 35 },
    { id: "piccadilly",    name: "PICCADILLY",       color: "#E8742C",
      path: "M 60,52 Q 72,50 78,56 Q 78,64 72,68 Q 64,68 60,62 Q 58,56 60,52 Z",
      labelX: 68, labelY: 60 },
    { id: "mayfield",      name: "MAYFIELD",         color: "#E84B7C",
      path: "M 72,66 Q 82,64 84,70 Q 84,76 78,78 Q 72,78 70,72 Q 70,68 72,66 Z",
      labelX: 77, labelY: 72 },
    { id: "oxford",        name: "OXFORD ROAD",      color: "#4FA8E0",
      path: "M 46,72 Q 58,70 62,76 Q 62,82 56,84 Q 48,84 46,80 Q 44,76 46,72 Z",
      labelX: 54, labelY: 78 },
    { id: "hulme",         name: "HULME",            color: "#A8341A",
      path: "M 32,76 Q 44,74 48,80 Q 48,86 42,88 Q 34,88 32,84 Q 30,80 32,76 Z",
      labelX: 40, labelY: 82 }
  ];

  // Stations — re-positioned at the actual icon coordinates from the latest basemap
  // (The basemap has no labels of its own — these ARE the labels.)
  const stations = [
    { name: "VICTORIA",    x: 47.5, y: 27 },
    { name: "PICCADILLY",  x: 65,   y: 63 },
    { name: "OXFORD RD",   x: 47,   y: 81 }
  ];

  // Labels scale-down with zoom so they don't get huge when zoomed in.
  // (Counter-scale: divide font size by zoom roughly.)
  const labelScale = 1 / Math.sqrt(zoom);

  // Inner content (everything that scales together): basemap + overlays + pins
  const inner = (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        transformOrigin: "center center",
        transition: dragRef.current ? "none" : "transform 0.2s ease-out"
      }}
    >
      {/* Base map */}
      <img
        src="images/manchester-map.jpg"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: isDark
            ? "invert(0.92) hue-rotate(180deg) saturate(0.55) brightness(0.95) contrast(0.95) sepia(0.15)"
            : "saturate(0.85) contrast(1.02)",
          userSelect: "none",
          pointerEvents: "none"
        }}
        draggable={false}
      />

      {/* District blobs */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          pointerEvents: "none",
          mixBlendMode: isDark ? "screen" : "multiply"
        }}
      >
        {districts.map(d => (
          <path
            key={d.id}
            d={d.path}
            fill={d.color}
            opacity={isDark ? 0.32 : 0.22}
            stroke={d.color}
            strokeOpacity={isDark ? 0.6 : 0.5}
            strokeWidth="0.25"
            strokeDasharray="0.8 0.6"
          />
        ))}
      </svg>

      {/* Labels (district + station) — drawn separately so blend mode doesn't murder them */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        {districts.map(d => (
          <text
            key={d.id}
            x={d.labelX} y={d.labelY}
            textAnchor="middle"
            fill={isDark ? "#f1ece0" : "#15130f"}
            stroke={isDark ? "#15130f" : "#f4f0e8"}
            strokeWidth={0.8 * labelScale}
            paintOrder="stroke"
            fontSize={1.9 * labelScale}
            fontWeight="800"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            style={{ letterSpacing: "0.12em" }}
          >
            {d.name}
          </text>
        ))}
        {stations.map(s => (
          <g key={s.name}>
            {/* small rail icon dot */}
            <circle cx={s.x} cy={s.y - 2.4 * labelScale} r={0.7 * labelScale}
                    fill="#a8341a" stroke={isDark ? "#15130f" : "#f4f0e8"} strokeWidth={0.25 * labelScale} />
            <text
              x={s.x} y={s.y}
              textAnchor="middle"
              fill="#a8341a"
              stroke={isDark ? "#15130f" : "#f4f0e8"}
              strokeWidth={1.0 * labelScale}
              paintOrder="stroke"
              fontSize={1.6 * labelScale}
              fontWeight="900"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              style={{ letterSpacing: "0.05em" }}
            >
              {s.name}
            </text>
          </g>
        ))}
      </svg>

      {/* Walking route (only when route prop provided) */}
      {route && route.length > 1 && (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        >
          <polyline
            points={route.map(p => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke={isDark ? "#E8742C" : "#A8341A"}
            strokeWidth={0.7 * labelScale}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${1.4 * labelScale} ${1.2 * labelScale}`}
            opacity="0.95"
          />
        </svg>
      )}

    </div>
  );

  // Pins live OUTSIDE the scaled inner so their visual size stays exact —
  // their position is computed from pan/zoom in JS so they track the map.
  const pinsLayer = (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {visibleVenues.map(v => {
        const c = catMap[v.cat];
        const dim = v.dim;
        const label = routeNumbers && routeNumbers[v.n] ? routeNumbers[v.n] : v.n;
        // Convert venue % position into final on-screen position based on pan + zoom.
        // Inner is scaled around centre, then translated by pan.
        // Final pct = 50 + (v - 50) * zoom + panPct
        // We render via CSS calc using container size (left/top in %).
        const cx = 50 + (v.x - 50) * zoom; // % within container before pan
        const cy = 50 + (v.y - 50) * zoom;
        return (
          <button
            key={v.n}
            type="button"
            onClick={(e) => { e.stopPropagation(); onPinClick && onPinClick(v); }}
            aria-label={`${v.n}. ${v.name}`}
            style={{
              position: "absolute",
              left: `calc(${cx}% + ${pan.x}px)`,
              top:  `calc(${cy}% + ${pan.y}px)`,
              width: 30,
              height: 30,
              transform: "translate(-50%, -50%)",
              border: 0,
              padding: 0,
              cursor: "pointer",
              background: "transparent",
              opacity: dim ? 0.18 : 1,
              transition: dragRef.current ? "none" : "left 0.2s ease-out, top 0.2s ease-out, opacity 0.25s",
              zIndex: dim ? 1 : 3,
              pointerEvents: "auto",
              filter: dim ? "none" : "drop-shadow(0 2px 4px rgba(0,0,0,0.4))"
            }}
          >
            <span style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "100%", height: "100%",
              borderRadius: "50%",
              background: c.color,
              border: `2px solid ${isDark ? "#0c0a07" : "#fff"}`,
              color: "#fff",
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              fontSize: 13, fontWeight: 800, lineHeight: 1
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div
      ref={wrapRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        overflow: "hidden",
        background: isDark ? "#15130f" : "#f4f0e8",
        borderRadius: 4,
        cursor: zoom > 1 ? (dragRef.current ? "grabbing" : "grab") : "default",
        touchAction: "none"
      }}
    >
      {inner}
      {pinsLayer}

      {/* Zoom controls */}
      <div style={{
        position: "absolute",
        top: 10,
        right: 10,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        zIndex: 10
      }}>
        <ZoomBtn isDark={isDark} disabled={zoom >= ZOOM_MAX} onClick={(e) => { e.stopPropagation(); zoomIn(); }} label="Zoom in">＋</ZoomBtn>
        <ZoomBtn isDark={isDark} disabled={zoom <= ZOOM_MIN} onClick={(e) => { e.stopPropagation(); zoomOut(); }} label="Zoom out">−</ZoomBtn>
        {zoom > 1 && (
          <ZoomBtn isDark={isDark} onClick={(e) => { e.stopPropagation(); resetView(); }} label="Reset zoom" small>↺</ZoomBtn>
        )}
      </div>

      {/* Hint chip when zoomed out */}
      {zoom === 1 && (
        <div style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: isDark ? "rgba(20,18,15,0.85)" : "rgba(255,253,247,0.92)",
          color: isDark ? "#d6cfbe" : "#5a5448",
          padding: "5px 10px",
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: 10,
          letterSpacing: "0.06em",
          borderRadius: 3,
          textTransform: "uppercase",
          pointerEvents: "none",
          border: `1px solid ${isDark ? "#3a342a" : "#d8d0bc"}`
        }}>
          Tap ＋ to zoom · drag to pan
        </div>
      )}
    </div>
  );
}

function ZoomBtn({ children, onClick, disabled, label, isDark, small }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      disabled={disabled}
      aria-label={label}
      style={{
        width: small ? 30 : 36,
        height: small ? 30 : 36,
        borderRadius: 4,
        background: isDark ? "#1f1c17" : "#fffdf6",
        color: isDark ? "#f1ece0" : "#15130f",
        border: `1px solid ${isDark ? "#3a342a" : "#c9c0a8"}`,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        fontSize: small ? 16 : 22,
        fontWeight: 600,
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        fontFamily: "ui-sans-serif, system-ui, sans-serif"
      }}
    >
      {children}
    </button>
  );
}

window.ManchesterMap = ManchesterMap;
