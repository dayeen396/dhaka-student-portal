import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="not-found panel">
      <span className="not-found-code">404</span>
      <h1>We can’t find that page</h1>
      <p>The address may be outdated, or the page may have moved.</p>
      <Link className="button" to="/">Return to overview</Link>
    </section>
  );
}
