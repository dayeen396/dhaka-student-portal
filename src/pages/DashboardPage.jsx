import { Link } from "react-router-dom";
import { useApiData } from "../api.js";
import { ButtonLink, ErrorState, LoadingState, PageHeading, SectionHeading, StatCard, formatDate } from "../components/Ui.jsx";

export default function DashboardPage() {
  const { data, error, loading, retry } = useApiData("/dashboard");

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={retry} />;

  return (
    <>
      <PageHeading eyebrow="Software Engineering · Student workspace"
        title="Welcome to your portal"
        description="A home for courses, campus updates, and student resources."
        action={<ButtonLink to="/register">＋ Course interest</ButtonLink>} />

      <aside className="announcement">
        <span aria-hidden="true">📣</span>
        <p><strong>Registration reminder</strong> — Always confirm course dates and requirements through official university announcements.</p>
        <Link to="/schedule">See updates →</Link>
      </aside>

      <section className="hero">
        <div>
          <p className="eyebrow">Your next chapter starts here</p>
          <h2>Learn today. Build what’s next.</h2>
          <p>Discover Software Engineering courses, explore resources, and stay connected with your department.</p>
          <ButtonLink to="/courses" secondary>Browse course catalog →</ButtonLink>
        </div>
        <div className="hero-art" aria-hidden="true">✦</div>
      </section>

      <section className="stats-grid" aria-label="Portal highlights">
        <StatCard icon="▦" label="Featured courses" value={data.stats.courses} note="Explore the course catalog" />
        <StatCard icon="♙" label="Sample students" value={data.stats.students} note="Fictional example records" />
        <StatCard icon="◷" label="Upcoming events" value={data.stats.events} note="Department demo calendar" />
        <StatCard icon="◇" label="Student resources" value={data.stats.resources} note="Useful links in one place" />
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <SectionHeading title="Featured courses" description="Explore topics in the department catalog."
            action={<Link className="text-link" to="/courses">All courses →</Link>} />
          <div className="course-grid compact-grid">
            {data.featuredCourses.map((course) => (
              <article className="course-card" key={course.id}>
                <div className="course-card-top"><span className="course-icon" aria-hidden="true">{course.icon}</span><span className="course-level">{course.level}</span></div>
                <p className="course-code">{course.code}</p>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <Link className="text-link" to={`/courses?course=${encodeURIComponent(course.id)}`}>Course details →</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <SectionHeading title="Coming up" description="Sample department activities."
            action={<Link className="text-link" to="/schedule">Full calendar →</Link>} />
          <div className="event-list">
            {data.upcomingEvents.map((event) => (
              <article className="event-row" key={event.id}>
                <time className="date-tile" dateTime={event.date}>
                  <strong>{formatDate(event.date, { day: "numeric" })}</strong>
                  <span>{formatDate(event.date, { month: "short" })}</span>
                </time>
                <div><h3>{event.title}</h3><p>{event.time} · {event.location}</p></div>
              </article>
            ))}
          </div>
          <div className="notice-card"><strong>Example data</strong><p>Dates and event details are for demonstration; verify through official channels.</p></div>
        </section>
      </div>

      <section className="panel">
        <SectionHeading title="Department updates" description="Recent sample announcements."
          action={<Link className="text-link" to="/schedule">View news →</Link>} />
        <div className="news-grid">
          {data.latestNews.map((item) => (
            <article className="news-card" key={item.id}>
              <span className="category-pill">{item.category}</span>
              <h3>{item.title}</h3>
              <p>{item.excerpt}</p>
              <time dateTime={item.date}>{formatDate(item.date)}</time>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
