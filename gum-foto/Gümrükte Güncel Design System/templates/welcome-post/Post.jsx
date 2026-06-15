// WelcomePost — opening identity post. Exposes window.WelcomePost.
(() => {
  function WelcomePost() {
    const { PostFrame, TopicChips, Highlight } = window.GMrKteGNcelDesignSystem_500523;
    return (
      <PostFrame motif="combo" brand={false} handle="@gumrukteguncel">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 56 }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch', gap: 20 }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-black)',
              fontSize: 150, lineHeight: 0.9, letterSpacing: '0.005em',
              color: 'var(--white)', whiteSpace: 'nowrap',
            }}>GÜMRÜKTE</span>
            <span style={{ height: 5, background: 'var(--white)', borderRadius: 2 }} />
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-black)',
              fontSize: 150, lineHeight: 0.9, letterSpacing: '0.135em',
              color: 'var(--white)', textAlign: 'center', whiteSpace: 'nowrap',
              paddingLeft: '0.135em',
            }}>GÜNCEL</span>
          </div>
          <p style={{
            margin: 0, maxWidth: 760,
            fontSize: 'var(--fs-lead)', fontWeight: 'var(--fw-medium)',
            lineHeight: 'var(--lh-body)', color: 'var(--ink-muted)',
            letterSpacing: '-0.005em',
          }}>
            Gümrük ve dış ticaret mevzuatını sade, doğru ve{' '}
            <Highlight>güncel</Highlight> anlatıyoruz.
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
          <TopicChips items={['İthalat', 'İhracat', 'Vergi', 'Lojistik', 'Mevzuat']} />
        </div>
      </PostFrame>
    );
  }

  window.WelcomePost = WelcomePost;
})();
