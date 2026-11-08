import { useMemo, useState } from "react";
import { useApiData, useDebouncedValue } from "../api.js";
import { EmptyState, ErrorState, LoadingState, PageHeading } from "../components/Ui.jsx";

export default function StudentsPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const path = useMemo(() => `/students${debouncedQuery.trim() ? `?q=${encodeURIComponent(debouncedQuery.trim())}` : ""}`, [debouncedQuery]);
  const { data, error, loading, retry } = useApiData(path);

  return (
    <>
      <PageHeading eyebrow="Our community" title="Student directory"
        description="Search a small set of fictional sample profiles. No real student information is shown." />
      <section className="panel">
        <div className="table-toolbar">
          <p className="result-count" aria-live="polite">
            {loading ? "Searching…" : `${data?.students.length ?? 0} sample ${data?.students.length === 1 ? "student" : "students"}`}
          </p>
          <label className="search-field directory-search">
            <span aria-hidden="true">⌕</span>
            <span className="sr-only">Search name, ID, major, or year</span>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, ID, major, or year…" />
          </label>
        </div>
        {loading && <LoadingState label="Loading student directory…" />}
        {!loading && error && <ErrorState message={error} onRetry={retry} />}
        {!loading && !error && data.students.length === 0 && <EmptyState>No sample students matched your search.</EmptyState>}
        {!loading && !error && data.students.length > 0 && (
          <div className="table-wrap">
            <table>
              <caption>Fictional example student records</caption>
              <thead><tr><th scope="col">Student</th><th scope="col">Student ID</th><th scope="col">Major</th><th scope="col">Year</th><th scope="col">Status</th></tr></thead>
              <tbody>
                {data.students.map((student) => (
                  <tr key={student.id}>
                    <td className="student-name"><span className="table-avatar" aria-hidden="true">{student.name.split(" ").map((word) => word[0]).join("")}</span>{student.name}</td>
                    <td className="student-id">{student.studentId}</td>
                    <td><span className="major-badge">{student.major}</span></td>
                    <td>{student.year}</td>
                    <td><span className="status-badge">{student.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="demo-note">This directory is populated with fictional records from the local demo API.</p>
    </>
  );
}
