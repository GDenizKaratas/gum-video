// PhotoPost — photo-background variant: customs/trade image, navy wash,
// bottom scrim, big legible headline. Exposes window.PhotoPost.
(() => {
  function PhotoPost() {
    const { PostFrame, Eyebrow, Highlight } = window.GMrKteGNcelDesignSystem_500523;
    const base = window.GG_ASSET_BASE || '../../assets';
    return (
      <PostFrame
        photo={base + '/photos/liman-gemi.png'}
        photoPos="center"
        scrim="bottom"
        handle="@gumrukteguncel"
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 32 }}>
          <Eyebrow tone="accent" rule>İHRACAT</Eyebrow>
          <h1 style={{
            margin: 0, maxWidth: 880,
            fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)',
            fontWeight: 'var(--fw-black)', lineHeight: 'var(--lh-head)',
            letterSpacing: 'var(--tr-tight)', color: 'var(--ink-strong)',
            textWrap: 'balance',
            textShadow: '0 2px 24px rgba(7,16,31,0.55)',
          }}>
            İhracatta gümrük süreçleri <Highlight>nasıl işliyor?</Highlight>
          </h1>
          <p style={{
            margin: 0, maxWidth: 760,
            fontSize: 'var(--fs-body)', fontWeight: 'var(--fw-regular)',
            lineHeight: 'var(--lh-body)', color: 'var(--ink-muted)',
          }}>
            Beyannameden konşimentoya, adım adım anlattık. Detaylar YouTube kanalımızda.
          </p>
        </div>
      </PostFrame>
    );
  }
  window.PhotoPost = PhotoPost;
})();
