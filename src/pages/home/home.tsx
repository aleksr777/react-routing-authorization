import styles from './home.module.css';

const sections = [
  {
    title: 'Routing and authorization template',
    text: 'This project is a reference frontend for applications that need public pages, protected routes, administrator-only sections, persistent authentication sessions, and predictable navigation after sign-in.',
  },
  {
    title: 'Modal authentication',
    text: 'Login, registration, email-code confirmation, and password recovery are presented in reusable modal windows. The URL still reflects the authentication route, so direct links and protected-route redirects continue to work normally.',
  },
  {
    title: 'Session handling',
    text: 'The access token remains in memory while the refresh token is managed by the backend through an HttpOnly cookie. Protected routes validate the server session and recover authentication after a page reload when the refresh session is still valid.',
  },
  {
    title: 'Protected navigation',
    text: 'A user who opens a protected page without an active session is sent to the login modal. After successful authentication the router returns the user to the originally requested page instead of losing the navigation context.',
  },
  {
    title: 'Verification flows',
    text: 'Registration and password recovery include resend cooldowns, attempt limits, lockout handling, six-digit verification codes, validation errors, and automatic authentication after a successful confirmation.',
  },
  {
    title: 'Account management',
    text: 'Authenticated users can inspect their profile, edit personal data, change email and password, manage active sessions, revoke remote sessions, and delete their account through protected routes.',
  },
  {
    title: 'Administration',
    text: 'Administrator routes provide user search, account inspection, blocking and unblocking, deletion workflows, and session management while the backend remains the actual authorization boundary.',
  },
  {
    title: 'Reusable UI behavior',
    text: 'The template includes animated native dialogs, background scroll locking, focus restoration, responsive layouts, and a custom overlay scrollbar that does not consume page width when it appears or disappears.',
  },
];

const Home = () => {
  return (
    <section className={styles.page}>
      <h2 className={styles.title}>Home page</h2>
      <p className={styles.lead}>
        Explore the template features. The layout adapts to your screen, and the scrollbar appears
        whenever the page needs scrolling.
      </p>
      <div className={styles.sections}>
        {sections.map((section) => (
          <article className={styles.section} key={section.title}>
            <h3>{section.title}</h3>
            <p>{section.text}</p>
            <p>
              Resize the window to see the layout adapt. When the content exceeds the viewport, use
              the mouse wheel, keyboard, or scrollbar to explore the page.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Home;
