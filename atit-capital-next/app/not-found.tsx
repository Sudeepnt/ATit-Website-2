export const metadata = { title: 'Page not found' };

// Uses the site's existing interior-page hero and button styles.
export default function NotFound() {
  return (
    <section className="page active" id="not-found" data-group="none" suppressHydrationWarning>
      <div className="phero">
        <div className="wrap">
          <div className="crumbs"><a href="/">Home</a><span>/</span><span>Not found</span></div>
          <div className="eyebrow">404</div>
          <h1>This page does not exist.</h1>
          <p className="lede">The link may be old or mistyped.</p>
          <p><a className="btn" href="/">Back to home <span className="arr">→</span></a></p>
        </div>
      </div>
    </section>
  );
}
