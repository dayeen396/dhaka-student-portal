import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

const navigation = [
  { to: "/", label: "Overview", icon: "⌂", end: true },
  { to: "/courses", label: "Course catalog", icon: "▦" },
  { to: "/schedule", label: "Calendar & news", icon: "◷" },
  { to: "/students", label: "Student directory", icon: "♙" },
  { to: "/resources", label: "Resources & campus", icon: "↗" }
];

export default function AppLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("portal-theme") ?? "light");
  const today = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("portal-theme", theme);
  }, [theme]);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      {menuOpen && <button className="sidebar-backdrop" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? "is-open" : ""}`} id="site-sidebar" aria-label="Portal sidebar">
        <div className="sidebar-brand-row">
          <Link className="brand" to="/" aria-label="Student Portal home">
            <span className="brand-mark" aria-hidden="true">DU</span>
            <span><strong>Student Portal</strong><small>University of Dhaka</small></span>
          </Link>
          <button className="icon-button sidebar-close" type="button" aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}>×</button>
        </div>
        <p className="nav-label">Workspace</p>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>{item.label}
            </NavLink>
          ))}
          <NavLink to="/register"><span className="nav-icon" aria-hidden="true">＋</span>Course interest</NavLink>
          <NavLink to="/contact"><span className="nav-icon" aria-hidden="true">✉</span>Contact</NavLink>
          <NavLink to="/about"><span className="nav-icon" aria-hidden="true">ⓘ</span>About project</NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <strong>Need a hand?</strong>
            <p>Find department details and official university resources.</p>
            <Link to="/contact">Contact the department →</Link>
          </div>
          <p className="nav-label">Educational project · Demo data</p>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button menu-toggle" id="menu-toggle" type="button"
              aria-label="Toggle navigation"
              aria-controls="site-sidebar" aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}>☰</button>
            <span className="topbar-date"><span aria-hidden="true">◷</span>{today}</span>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" type="button"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
              aria-pressed={theme === "dark"}
              onClick={() => setTheme((current) => current === "light" ? "dark" : "light")}>
              <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
            </button>
            <div className="profile-chip"><span className="avatar" aria-hidden="true">SE</span>
              <span className="profile-copy"><strong>Student</strong><small>Portal demo</small></span>
            </div>
          </div>
        </header>

        <main className="page-content" id="main-content"><Outlet /></main>
        <footer className="site-footer" id="footer">
          <span>Student Portal Demo · University of Dhaka · {new Date().getFullYear()}</span>
          <span>Independent educational project · <Link to="/about">About this project</Link></span>
          <a href="#main-content">Back to top ↑</a>
        </footer>
      </div>
    </div>
  );
}
