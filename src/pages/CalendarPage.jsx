import { useApiData } from "../api.js";
import { ErrorState, LoadingState, PageHeading, SectionHeading, formatDate } from "../components/Ui.jsx";

export default function CalendarPage() {
  const events = useApiData("/events");
  const news = useApiData("/news");

  return (
    <>
      <PageHeading eyebrow="Stay in the loop" title="Calendar & news"
        description="A sample activity calendar and department updates for this student portal project." />
      <div className="two-column-layout">
        <section className="panel">
          <SectionHeading title="Upcoming activities" description="Demo events; check official announcements for real schedules." />
          {events.loading && <LoadingState label="Loading events…" />}
          {!events.loading && events.error && <ErrorState message={events.error} onRetry={events.retry} />}
          {!events.loading && !events.error && (
            <div className="event-list event-list-large">
              {events.data.events.map((event) => (
                <article className="event-row event-row-large" key={event.id}>
                  <time className="date-tile" dateTime={event.date}>
                    <strong>{formatDate(event.date, { day: "numeric" })}</strong>
                    <span>{formatDate(event.date, { month: "short" })}</span>
                  </time>
                  <div className="event-detail">
                    <div className="event-title-row"><h2>{event.title}</h2><span className="category-pill">{event.category}</span></div>
                    <p>{event.description}</p>
                    <p className="muted-line">{formatDate(event.date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })} · {event.time} · {event.location}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <section className="panel">
          <SectionHeading title="Department updates" description="Sample announcements, not official notices." />
          {news.loading && <LoadingState label="Loading updates…" />}
          {!news.loading && news.error && <ErrorState message={news.error} onRetry={news.retry} />}
          {!news.loading && !news.error && (
            <div className="news-list">
              {news.data.news.map((item) => (
                <article className="news-card news-card-list" key={item.id}>
                  <span className="category-pill">{item.category}</span>
                  <h2>{item.title}</h2>
                  <p>{item.excerpt}</p>
                  <time dateTime={item.date}>{formatDate(item.date)}</time>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
      <aside className="notice-card notice-wide"><strong>Important</strong><p>Event dates and registration windows change. Confirm details through the official University of Dhaka website or department office.</p></aside>
    </>
  );
}
