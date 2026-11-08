import { useApiData } from "../api.js";
import { ErrorState, LoadingState, PageHeading, SectionHeading } from "../components/Ui.jsx";

export default function ResourcesPage() {
  const { data, error, loading, retry } = useApiData("/resources");

  return (
    <>
      <PageHeading eyebrow="Keep exploring" title="Resources & campus"
        description="A curated set of external learning links and a map of the University of Dhaka area." />
      <section className="panel">
        <SectionHeading title="Learning links" description="External websites open in a new tab." />
        {loading && <LoadingState label="Loading resources…" />}
        {!loading && error && <ErrorState message={error} onRetry={retry} />}
        {!loading && !error && (
          <div className="resource-grid">
            {data.resources.map((resource) => (
              <article className="resource-card" key={resource.id}>
                <span className="category-pill">{resource.category}</span>
                <h2>{resource.title}</h2>
                <p>{resource.description}</p>
                <a href={resource.url} target="_blank" rel="noopener noreferrer">Open resource ↗</a>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="panel map-panel" id="external-content">
        <SectionHeading title="University of Dhaka campus" description="Map provided by OpenStreetMap; an internet connection is required." />
        <iframe className="map-frame" title="Map showing the University of Dhaka campus"
          src="https://www.openstreetmap.org/export/embed.html?bbox=90.388%2C23.725%2C90.405%2C23.740&amp;layer=mapnik&amp;marker=23.735%2C90.398"
          loading="lazy" referrerPolicy="no-referrer" />
        <a className="text-link map-link" href="https://www.openstreetmap.org/?mlat=23.735&amp;mlon=90.398#map=16/23.735/90.398"
          target="_blank" rel="noopener noreferrer">Open larger map ↗</a>
      </section>
    </>
  );
}
