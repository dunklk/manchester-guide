/* global React, ReactDOM, ManchesterMap */

const { useState, useMemo, useRef, useEffect } = React;

const VENUES = window.MCR_VENUES;
const CATEGORIES = window.MCR_CATEGORIES;
const ITINERARY = window.MCR_ITINERARY;
const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

function PhotoSlot({ name, label, src }) {
  // If src provided, use real image. Otherwise show moody placeholder.
  if (src) {
    return (
      <div className="photo-slot photo-slot--real" aria-label={name}>
        <img src={src} alt={name} className="photo-slot__img" />
      </div>
    );
  }
  return (
    <div className="photo-slot" aria-label={`Photo placeholder for ${name}`}>
      <div className="photo-slot__stripes" />
      <div className="photo-slot__label">
        <span className="photo-slot__crosshair">⌖</span>
        <span>{label || "drop photo"}</span>
        <span className="photo-slot__name">{name}</span>
      </div>
    </div>
  );
}

// YouTube intro video — Unlisted, hosted on YouTube to keep the repo small.
const INTRO_VIDEO_ID = "tAfTGNNfPqU";
function IntroVideoEmbed({ title }) {
  return (
    <iframe
      className="video-embed"
      src={`https://www.youtube-nocookie.com/embed/${INTRO_VIDEO_ID}?rel=0&modestbranding=1`}
      title={title || "Manchester intro"}
      loading="lazy"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}

function CategoryFilter({ active, setActive }) {
  return (
    <div className="filter-bar" role="tablist">
      <button
        className={`filter-chip ${active === "all" ? "filter-chip--on" : ""}`}
        onClick={() => setActive("all")}
        style={{ "--cat-color": "#15130f" }}>
        <span className="filter-chip__dot" />
        All <span className="filter-chip__count">{VENUES.length}</span>
      </button>
      {CATEGORIES.map(c => {
        const count = VENUES.filter(v => v.cat === c.id).length;
        const on = active === c.id;
        return (
          <button key={c.id}
            className={`filter-chip ${on ? "filter-chip--on" : ""}`}
            onClick={() => setActive(c.id)}
            style={{ "--cat-color": c.color }}>
            <span className="filter-chip__dot" />
            {c.label}
            <span className="filter-chip__count">{count}</span>
          </button>
        );
      })}
    </div>
  );
}

const VENUE_PHOTOS = {
  "The Refuge": "images/the-refuge.jpg",
  "20 Stories": "images/20-stories.jpg",
  "The Ivy": "images/the-ivy.jpg",
  "The Lass O'Gowrie": "images/lass-o-gowrie.jpg",
  "The Castle Hotel": "images/castle-hotel.jpg",
  "Big Hands": "images/big-hands.jpg",
  "Peveril of the Peak": "images/peveril.jpg",
  "The Marble Arch": "images/marble-arch.jpg",
  "The Britons Protection": "images/britons-protection.avif",
  "The Gas Lamp": "images/gas-lamp.jpg",
  "Sinclair's Oyster Bar": "images/sinclairs.jpg",
  "The Old Wellington": "images/old-wellington.webp",
  "Temple Bar": "images/temple-bar.webp",
  "YES": "images/yes.jpg",
  "The Molly House": "images/molly-house.jpg",
  "Common": "images/common.jpg",
  "Cloudwater": "images/cloudwater.jpg",
  "Track Brewing": "images/track.jpg",
  "Alphabet Brewing": "images/alphabet.jpg",
  "Port Street Beer House": "images/port-street.jpg",
  "Rudy's Pizza — Ancoats": "images/rudys.jpg",
  "Bundobust": "images/bundobust.jpg",
  "Mackie Mayor": "images/mackie-mayor.jpg",
  "Dishoom": "images/dishoom.jpg",
  "Pot Kettle Black": "images/pot-kettle-black.jpg",
  "Pollen Bakery": "images/pollen.jpg",
  "Albert Schloss": "images/albert-schloss.webp",
  "Band on the Wall": "images/band-on-the-wall.jpg",
  "Freight Island": "images/freight-island.png",
  "Affleck's": "images/afflecks.jpg",
  "Piccadilly Records": "images/piccadilly-records.webp",
  "Projekts MCR": "images/projekts.jpg",
  "John Rylands Library": "images/john-rylands.jpg",
  "Central Library": "images/central-library.jpg",
  "Chetham's Library": "images/chethams.jpg",
  "Manchester Cathedral": "images/cathedral.jpg",
  "Manchester Art Gallery": "images/art-gallery.jpg",
  "Whitworth": "images/whitworth.jpg",
  "Science & Industry Museum": "images/sim.webp",
  "People's History Museum": "images/peoples-history.jpeg",
  "National Football Museum": "images/football-museum.jpg",
  "Imperial War Museum North": "images/iwm-north.jpg",
  "Federal": "images/federal.jpg",
  "FDN Coffee": "images/fdn-coffee.jpg",
  "Idle Hands": "images/idle-hands.jpg",
};

function VenueCard({ v, onPhotoClick }) {
  const c = CAT_MAP[v.cat];
  const photo = VENUE_PHOTOS[v.name];
  const igHref = v.igUrl || (v.ig ? "https://www.instagram.com/" + v.ig + "/" : null);
  return (
    <article className="venue" id={`v-${v.n}`} data-cat={v.cat} data-comment-anchor={`venue-${v.n}`}>
      <div
        className="venue__photo"
        onClick={() => photo && onPhotoClick && onPhotoClick(photo, v.name)}
        style={photo ? { cursor: "zoom-in" } : undefined}
        role={photo ? "button" : undefined}
        tabIndex={photo ? 0 : undefined}
        onKeyDown={(e) => { if (photo && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onPhotoClick && onPhotoClick(photo, v.name); } }}
      >
        <PhotoSlot name={v.name} label="venue photo" src={photo} />
        <div className="venue__num" style={{ background: c.color }}>{v.n}</div>
        {v.ig && (
          <a
            className="venue__ig-btn"
            href={igHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${v.name} on Instagram`}
            onClick={(e) => e.stopPropagation()}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
        )}
      </div>
      <div className="venue__body">
        <h3 className="venue__name">{v.name}</h3>
        <p className="venue__blurb">{v.blurb}</p>
        {v.tip && (
          <p className="venue__tip">
            <span className="venue__tip-label" style={{ color: c.color }}>—</span> {v.tip}
          </p>
        )}
        <div className="venue__meta">
          <div className="venue__meta-row">
            <span className="venue__pin" aria-hidden="true">◉</span>
            <span>{v.area}</span>
          </div>
          {v.ig && (
            <div className="venue__meta-row">
              <a
                className="venue__ig-handle"
                href={igHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => { e.preventDefault(); window.open(igHref, '_blank', 'noopener,noreferrer'); }}
              >@{v.ig}</a>
            </div>
          )}
          <div className="venue__meta-row">
            <a
              className="venue__map-link"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.name + ", " + v.area + ", Manchester")}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${v.name} on Google Maps`}
              onClick={(e) => { e.preventDefault(); window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.name + ", " + v.area + ", Manchester")}`, '_blank', 'noopener,noreferrer'); }}
            >
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>Open in Google Maps</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function CategorySection({ cat, venues, onPhotoClick }) {
  if (venues.length === 0) return null;
  const isNQ = cat.id === "culture";
  return (
    <section className="cat-section" data-cat={cat.id} data-screen-label={cat.label}>
      <header className="cat-section__head">
        <div className="cat-section__rule" style={{ background: cat.color }} />
        <h2 className="cat-section__title" style={{ color: cat.color }}>{cat.label}</h2>
        <p className="cat-section__sub">{cat.sub}</p>
        {isNQ && (
          <p className="cat-section__intro">
            Stevenson Square, Tib St, Oldham St, Edge St — proper Manchester. Murals on every wall,
            record shops, vintage clothes, tattoo studios, dive bars next to coffee shops.
            Don't plan it. Just walk.
          </p>
        )}
      </header>
      <div className="cat-section__venues">
        {venues.map(v => <VenueCard key={v.n} v={v} onPhotoClick={onPhotoClick} />)}
      </div>
    </section>
  );
}

function ItineraryMap({ stops, theme }) {
  // Build a venue subset and a step-number override (venue.n → "1", "2", …)
  const itinVenues = stops.map(s => s.venue).filter(Boolean);
  const routeNumbers = {};
  itinVenues.forEach((v, i) => { routeNumbers[v.n] = String(i + 1); });
  const route = itinVenues.map(v => ({ x: v.x, y: v.y }));
  return (
    <div className="itinerary__map">
      <ManchesterMap
        venues={itinVenues}
        categories={CATEGORIES}
        activeCat="all"
        theme={theme}
        route={route}
        routeNumbers={routeNumbers}
        onPinClick={(v) => {
          const el = document.getElementById(`v-${v.n}`);
          if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: "smooth" });
            el.classList.add("venue--flash");
            setTimeout(() => el.classList.remove("venue--flash"), 1400);
          }
        }}
      />
      <div className="itinerary__map-legend">
        <span className="itinerary__map-walk" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13" cy="4" r="2"></circle>
            <path d="M9 22l2-7-3-3 1-5"></path>
            <path d="M14 9l-2 4 4 3 1 6"></path>
            <path d="M6 12l3-3"></path>
          </svg>
        </span>
        <span>Walking route · ~1.5 miles · 25 mins on foot</span>
      </div>
    </div>
  );
}

function Itinerary({ mapTheme = "light", onPhotoClick }) {
  const stops = ITINERARY.map((step, i) => {
    const v = VENUES.find(x => x.name === step.venue);
    return v ? { venue: v } : null;
  }).filter(Boolean);
  return (
    <section className="itinerary" data-screen-label="A Proper Night Out">
      <header className="itinerary__head">
        <p className="kicker">If you only do one night —</p>
        <h2 className="itinerary__title">A proper night out</h2>
        <p className="itinerary__sub">Mackie Mayor → Castle → Refuge → Temple → YES. The classic arc.</p>
      </header>
      <ol className="itinerary__list">
        {ITINERARY.map((step, i) => {
          const v = VENUES.find(x => x.name === step.venue);
          const c = v ? CAT_MAP[v.cat] : null;
          const photo = v ? VENUE_PHOTOS[v.name] : null;
          return (
            <li key={i} className="itin-step">
              <div className="itin-step__header">
                <div className="itin-step__num" style={{ background: c ? c.color : "#15130f" }}>
                  {i + 1}
                </div>
                <div className="itin-step__time">{step.time}</div>
              </div>
              <div
                className="itin-step__photo"
                onClick={() => photo && onPhotoClick && onPhotoClick(photo, step.venue)}
                style={photo ? { cursor: "zoom-in" } : undefined}
                role={photo ? "button" : undefined}
                tabIndex={photo ? 0 : undefined}
                onKeyDown={(e) => { if (photo && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onPhotoClick && onPhotoClick(photo, step.venue); } }}
              >
                <PhotoSlot name={step.venue} label="venue photo" src={photo} />
              </div>
              <div className="itin-step__body">
                <div className="itin-step__name">{step.venue}</div>
                <div className="itin-step__why">{step.why}</div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="itinerary__rule">Walk between every stop. No taxis. The best nights start with no plan.</p>
    </section>
  );
}

function Lightbox({ img, onClose }) {
  useEffect(() => {
    if (!img) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", handler);
    };
  }, [img]);
  if (!img) return null;
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={img.alt || "Photo"} onClick={onClose}>
      <button className="lightbox__close" type="button" aria-label="Close" onClick={onClose}>×</button>
      <img
        className="lightbox__img"
        src={img.src}
        alt={img.alt || ""}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function App({ mapTheme = "light" }) {
  const [active, setActive] = useState("all");
  const [lightbox, setLightbox] = useState(null);
  const openLightbox = (src, alt) => { if (src) setLightbox({ src, alt }); };

  const filtered = active === "all" ? VENUES : VENUES.filter(v => v.cat === active);

  // Group filtered venues by category, preserving CATEGORIES order
  const grouped = CATEGORIES.map(c => ({
    cat: c,
    venues: filtered.filter(v => v.cat === c.id)
  }));

  const handlePin = (v) => {
    const el = document.getElementById(`v-${v.n}`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
      el.classList.add("venue--flash");
      setTimeout(() => el.classList.remove("venue--flash"), 1400);
    }
  };

  return (
    <div className="guide">
      {/* COVER */}
      <header className="cover" data-screen-label="Cover">
        <div className="cover__bg">
          <PhotoSlot name="manchester mural" label="cover photo" src="images/cover-mural.jpg" />
        </div>
        <div className="cover__overlay" />
        <div className="cover__content">
          <h1 className="cover__title">MAN<br/>CHES<br/>TER</h1>
          <ul className="cover__list">
            <li>Old pubs.</li>
            <li>Dive bars.</li>
            <li>Gig venues.</li>
            <li>Craft beer.</li>
            <li>Proper food.</li>
            <li>Good coffee.</li>
          </ul>
          <div className="cover__video">
            <IntroVideoEmbed title="Manchester intro — cover" />
            <p className="cover__video-cap">Press play — quick hello before you dive in.</p>
          </div>
          <p className="cover__foot">Not a generic tourist guide.<br/>The places that matter.</p>
        </div>
      </header>

      {/* INTRO */}
      <section className="intro" data-screen-label="Intro">
        <p className="kicker">About this guide</p>

        {/* Video intro slot */}
        <div className="intro__video">
          <IntroVideoEmbed title="Manchester intro" />
          <p className="intro__video-cap">Press play — quick hello before you dive in.</p>
        </div>

        <p className="intro__lead">
          Honestly, there’s no way to do Manchester justice in two days — too much going on, too
          many corners worth getting lost in. So treat this as a starting point, not a checklist.
        </p>
        <p className="intro__body">
          Pick a couple of things and go. Wander the Northern Quarter. Get lost on purpose. The
          city’s walkable and the best nights start with no plan. If you want one anyway, scroll to
          <em> A Proper Night Out</em> at the bottom — that’s the route I’d take you on if I was there.
        </p>

        <aside className="intro__callout intro__callout--projekts">
          <p className="intro__callout-label">The gig — Mind Enterprise</p>
          <p className="intro__callout-body">
            <strong>Mind Enterprise at Projekts MCR.</strong> I’ve marked it on the map for you — #34.
            The skatepark is under the Mancunian Way flyover, on the edge of the city centre near
            Hulme. It’s still walkable to most places — Manchester’s a walking city if you’re up for
            it and the weather plays ball. Otherwise you’ll have no issues getting an Uber.
          </p>
        </aside>

        <aside className="intro__callout intro__callout--getting-around">
          <p className="intro__callout-label">Talking of getting around …</p>
          <p className="intro__callout-body">
            <strong>Trams will get you everywhere.</strong> The <strong>Bee Network</strong> app is
            good for getting your bearings and finding the nearest tram stop. Beyond that, they're
            very regular so you shouldn't need to plan meticulously. Just tap in and out at the
            platform with a debit card. If you go the wrong way, hop off and grab one heading back —
            you can't go wrong. You’ll be unlucky to wait more than five minutes. If all else fails,
            Uber is your friend.
          </p>
        </aside>
      </section>

      {/* MAP — inline on mobile, hidden on desktop (replaced by sticky sidebar) */}
      <section className="map-section is-mobile-only" data-screen-label="Map">
        <header className="map-section__head">
          <p className="kicker">The whole thing, sorted</p>
          <h2 className="map-section__title">Manchester, roughly</h2>
          <p className="map-section__sub">Not to scale. Mostly accurate. Mostly walkable. Google Maps links are included below.</p>
        </header>
        <div className="map-frame">
          <ManchesterMap
            venues={VENUES}
            categories={CATEGORIES}
            activeCat={active}
            onPinClick={handlePin}
            theme={mapTheme}
          />
        </div>
        <div className="map-legend">
          {CATEGORIES.map(c => (
            <div key={c.id} className="legend-row">
              <span className="legend-dot" style={{ background: c.color }} />
              <span className="legend-label">{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FILTER */}
      <div className="filter-wrap">
        <p className="kicker filter-wrap__kicker">Filter by what you want</p>
        <CategoryFilter active={active} setActive={setActive} />
      </div>

      {/* SECTIONS + DESKTOP SIDEBAR */}
      <div className="sections-wrap">
        <main className="sections">
          {grouped.map(({ cat, venues }) => (
            <CategorySection key={cat.id} cat={cat} venues={venues} onPhotoClick={openLightbox} />
          ))}
        </main>
        <aside className="desktop-side" aria-label="Map sidebar">
          <h3 className="desktop-side__title">Manchester, roughly</h3>
          <div className="map-frame">
            <ManchesterMap
              venues={VENUES}
              categories={CATEGORIES}
              activeCat={active}
              onPinClick={handlePin}
              theme={mapTheme}
            />
          </div>
          <div className="map-legend">
            {CATEGORIES.map(c => (
              <div key={c.id} className="legend-row">
                <span className="legend-dot" style={{ background: c.color }} />
                <span className="legend-label">{c.label}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* ITINERARY */}
      <Itinerary mapTheme={mapTheme} onPhotoClick={openLightbox} />

      {/* LIGHTBOX */}
      <Lightbox img={lightbox} onClose={() => setLightbox(null)} />

      {/* FOOTER */}
      <footer className="foot">
        <div className="foot__rule" />
        <p className="foot__line">Be sound. Have a good time.</p>
        <p className="foot__sub">Anything goes wrong, you know where I am.</p>
      </footer>
    </div>
  );
}

window.MCR_App = App;
