import { Link } from "react-router-dom";

export function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionHeading({ title, description, action }) {
  return (
    <div className="section-heading">
      <div><h2>{title}</h2>{description && <p>{description}</p>}</div>
      {action}
    </div>
  );
}

export function ButtonLink({ to, children, secondary = false, ...props }) {
  return <Link className={`button ${secondary ? "button-secondary" : ""}`} to={to} {...props}>{children}</Link>;
}

export function LoadingState({ label = "Loading portal data…" }) {
  return <div className="state-card" role="status"><span className="spinner" aria-hidden="true" />{label}</div>;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-card state-error" role="alert">
      <span><strong>Couldn’t load this information.</strong><br />{message}</span>
      {onRetry && <button className="button button-secondary" type="button" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function EmptyState({ children }) {
  return <div className="empty-state">{children}</div>;
}

export function StatCard({ icon, label, value, note }) {
  return (
    <article className="stat-card">
      <div className="stat-top"><span className="stat-label">{label}</span><span className="stat-icon" aria-hidden="true">{icon}</span></div>
      <strong className="stat-number">{String(value).padStart(2, "0")}</strong>
      <p className="stat-foot">{note}</p>
    </article>
  );
}

export function formatDate(date, options = { month: "short", day: "numeric", year: "numeric" }) {
  return new Intl.DateTimeFormat(undefined, options).format(new Date(`${date}T12:00:00`));
}
