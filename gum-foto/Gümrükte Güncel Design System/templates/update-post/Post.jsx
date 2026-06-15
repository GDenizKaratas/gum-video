// UpdatePost — legislation-tracking / current news post. Exposes window.UpdatePost.
(() => {
  function UpdatePost() {
    const { PostFrame, Eyebrow, Highlight, LineIcon } = window.GMrKteGNcelDesignSystem_500523;
    return (
      <PostFrame motif="combo" handle="@gumrukteguncel">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 40 }}>
          <Eyebrow tone="accent" rule>2026 GÜNCEL</Eyebrow>
          <h1 style={{
            margin: 0, maxWidth: 900,
            fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display)',
            fontWeight: 'var(--fw-black)', lineHeight: 'var(--lh-tight)',
            letterSpacing: 'var(--tr-tight)', color: 'var(--ink-strong)',
          }}>
            Kurallar sürekli <Highlight>değişiyor</Highlight>
          </h1>
          <p style={{
            margin: 0, maxWidth: 800,
            fontSize: 'var(--fs-body)', fontWeight: 'var(--fw-regular)',
            lineHeight: 'var(--lh-body)', color: 'var(--ink-muted)',
          }}>
            <Highlight>27 Şubat 2026</Highlight>'da yürürlüğe giren yeni düzenlemeler
            dış ticareti doğrudan etkiliyor.{' '}
            <strong style={{ color: 'var(--ink-strong)', fontWeight: 'var(--fw-bold)' }}>Takipte kalın.</strong>
          </p>
        </div>
      </PostFrame>
    );
  }
  window.UpdatePost = UpdatePost;
})();
