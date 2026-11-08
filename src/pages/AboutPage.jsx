import { Link } from "react-router-dom";
import { PageHeading, SectionHeading } from "../components/Ui.jsx";

const features = [
  ["Overview", "A summary of portal data, featured courses, events, and announcements."],
  ["Course catalog", "API-backed course search, categories, descriptions, and interest links."],
  ["Student directory", "Searchable fictional sample profiles served by the local API."],
  ["Calendar & news", "Department activity and announcement examples."],
  ["Resources & campus", "Learning references and an embedded external campus map."]
];

export default function AboutPage() {
  return (
    <>
      <PageHeading eyebrow="Project information" title="About this student portal"
        description="A full-stack learning project demonstrating a multi-page React app and a small JSON API." />
      <section className="panel" id="additional-elements">
        <SectionHeading title="What’s included" description="Explore the main parts of the demo." />
        <div className="feature-grid">
          {features.map(([title, description]) => (
            <article className="feature-card" key={title}><span className="feature-check" aria-hidden="true">✓</span><div><h2>{title}</h2><p>{description}</p></div></article>
          ))}
        </div>
      </section>
      <section className="panel project-notice">
        <h2>Demo boundaries</h2>
        <p>All student names and course information in this project are examples. The interest API writes to a git-ignored local JSON file and is not connected to the university.</p>
        <p>There is no sign-in, authorization, email delivery, or production data protection. Do not enter real personal information.</p>
        <Link className="text-link" to="/courses">Start exploring →</Link>
      </section>
    </>
  );
}
