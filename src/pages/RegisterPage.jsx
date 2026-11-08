import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest, useApiData } from "../api.js";
import { ErrorState, LoadingState, PageHeading, SectionHeading } from "../components/Ui.jsx";

const emptyForm = { name: "", email: "", courseId: "", message: "" };

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const courses = useApiData("/courses");
  const [form, setForm] = useState({ ...emptyForm, courseId: searchParams.get("course") ?? "" });
  const [status, setStatus] = useState({ message: "", error: false });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const courseId = searchParams.get("course");
    if (courseId) setForm((current) => ({ ...current, courseId }));
  }, [searchParams]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setStatus({ message: "", error: false });
  }

  async function submitForm(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ message: "", error: false });

    try {
      const result = await apiRequest("/enrollments", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setStatus({
        message: `Interest recorded for ${result.enrollment.courseTitle}. Your reference is ${result.enrollment.id.slice(0, 8)}.`,
        error: false
      });
      setForm({ ...emptyForm });
    } catch (error) {
      setStatus({ message: error.message, error: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeading eyebrow="Course catalog" title="Course interest"
        description="Submit a local demo request to explore the API-backed registration flow." />
      <div className="registration-layout">
        <section className="panel">
          <SectionHeading title="Tell us what you’re interested in"
            description="Submissions are stored locally by the demo API, not sent to the university." />
          <form className="registration-form" onSubmit={submitForm}>
            <div className="form-field">
              <label htmlFor="register-name">Your name</label>
              <input id="register-name" name="name" value={form.name} onChange={updateField}
                minLength="2" maxLength="100" autoComplete="name" required />
            </div>
            <div className="form-field">
              <label htmlFor="register-email">Email address</label>
              <input id="register-email" name="email" type="email" value={form.email} onChange={updateField}
                maxLength="254" autoComplete="email" required />
            </div>
            <div className="form-field form-span">
              <label htmlFor="register-course">Course of interest</label>
              {courses.loading && <LoadingState label="Loading courses…" />}
              {!courses.loading && courses.error && <ErrorState message={courses.error} onRetry={courses.retry} />}
              {!courses.loading && !courses.error && (
                <select id="register-course" name="courseId" value={form.courseId} onChange={updateField} required>
                  <option value="" disabled>Select a course</option>
                  {courses.data.courses.map((course) => <option value={course.id} key={course.id}>{course.code} · {course.title}</option>)}
                </select>
              )}
            </div>
            <div className="form-field form-span">
              <label htmlFor="register-message">Message <span className="muted-line">(optional)</span></label>
              <textarea id="register-message" name="message" value={form.message} onChange={updateField}
                maxLength="400" rows="4" placeholder="What would you like to learn?" />
            </div>
            <div className="form-span form-actions">
              <button className="button" type="submit" disabled={submitting || courses.loading || Boolean(courses.error)}>
                {submitting ? "Submitting…" : "Submit course interest"}
              </button>
              <button className="button button-secondary" type="reset"
                onClick={() => { setForm({ ...emptyForm }); setStatus({ message: "", error: false }); }}>Clear</button>
            </div>
            <p className={`form-status form-span ${status.error ? "error" : ""}`} role="status" aria-live="polite">{status.message}</p>
          </form>
        </section>
        <aside className="panel privacy-panel">
          <span className="resource-icon" aria-hidden="true">ⓘ</span>
          <h2>About this demo</h2>
          <p>Submitting this form writes the request to the ignored <code>server/store.json</code> file on this machine. It does not send anything to the University of Dhaka.</p>
          <p>Use fictional data while exploring. This project has no account system or production-grade privacy controls.</p>
          <Link to="/courses">Review the course catalog →</Link>
        </aside>
      </div>
    </>
  );
}
