import { Link } from "react-router-dom";
import { PageHeading, SectionHeading } from "../components/Ui.jsx";

export default function ContactPage() {
  return (
    <>
      <PageHeading eyebrow="We’re here to help" title="Contact & department information"
        description="Use official university channels for current contact information, student services, and academic support." />
      <div className="two-column-layout">
        <section className="panel" id="contact">
          <SectionHeading title="Department of Software Engineering" description="University of Dhaka" />
          <address className="address-block">
            University of Dhaka<br />
            Dhaka 1000<br />
            Bangladesh
          </address>
          <p>Department contact details and office hours can change. Please verify them on the official university website.</p>
          <a className="button" href="https://www.du.ac.bd/" target="_blank" rel="noopener noreferrer">Visit official website ↗</a>
        </section>
        <aside className="panel">
          <SectionHeading title="Student support" description="Helpful next steps." />
          <ul className="support-list">
            <li><Link to="/schedule">Check the calendar and announcements →</Link></li>
            <li><Link to="/courses">Explore course information →</Link></li>
            <li><Link to="/resources">Browse campus and learning resources →</Link></li>
            <li><Link to="/register">Try the sample course-interest form →</Link></li>
          </ul>
          <div className="notice-card"><strong>Project disclaimer</strong><p>This student portal is an independent educational demo, not an official University of Dhaka website.</p></div>
        </aside>
      </div>
    </>
  );
}
