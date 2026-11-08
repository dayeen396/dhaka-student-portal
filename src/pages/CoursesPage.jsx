import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useApiData, useDebouncedValue } from "../api.js";
import { EmptyState, ErrorState, LoadingState, PageHeading } from "../components/Ui.jsx";

const categories = ["All categories", "Foundations", "Development", "Quality & AI"];

export default function CoursesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [searchParams] = useSearchParams();
  const debouncedQuery = useDebouncedValue(query);
  const apiQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
    if (category !== "All categories") params.set("category", category);
    return `/courses${params.size ? `?${params}` : ""}`;
  }, [debouncedQuery, category]);
  const { data, error, loading, retry } = useApiData(apiQuery);

  return (
    <>
      <PageHeading eyebrow="Explore & learn" title="Course catalog"
        description="Explore sample Software Engineering courses and choose a topic that interests you." />
      <section className="panel">
        <div className="filter-bar">
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <span className="sr-only">Search courses</span>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, code, or topic…" />
          </label>
          <label className="sr-only" htmlFor="course-category">Filter by category</label>
          <select className="control" id="course-category" value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        {loading && <LoadingState label="Loading courses…" />}
        {!loading && error && <ErrorState message={error} onRetry={retry} />}
        {!loading && !error && data.courses.length === 0 && <EmptyState>No courses match those filters. Try another search.</EmptyState>}
        {!loading && !error && data.courses.length > 0 && (
          <>
            <p className="result-count" aria-live="polite">{data.courses.length} {data.courses.length === 1 ? "course" : "courses"} found</p>
            <div className="course-grid">
              {data.courses.map((course) => (
                <article className={`course-card ${searchParams.get("course") === course.id ? "course-highlight" : ""}`} key={course.id}>
                  <div className="course-card-top">
                    <span className="course-icon" aria-hidden="true">{course.icon}</span>
                    <span className="course-level">{course.level}</span>
                  </div>
                  <p className="course-code">{course.code} · {course.category}</p>
                  <h2>{course.title}</h2>
                  <p>{course.description}</p>
                  <dl className="course-facts">
                    <div><dt>Credits</dt><dd>{course.credits}</dd></div>
                    <div><dt>Duration</dt><dd>{course.duration}</dd></div>
                    <div><dt>Seats shown</dt><dd>{course.seatsAvailable}</dd></div>
                  </dl>
                  <p className="instructor-line">Instructor: {course.instructor}</p>
                  <Link className="button button-secondary" to={`/register?course=${encodeURIComponent(course.id)}`}>Express interest →</Link>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
      <p className="demo-note">Course descriptions and availability are illustrative. Confirm official curriculum and enrollment details with the department.</p>
    </>
  );
}
