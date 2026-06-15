// ValuePost — evergreen explainer with a hero stat. Exposes window.ValuePost.
(() => {
  function ValuePost() {
    const { PostFrame, StatNumber, Eyebrow, LineIcon } = window.GMrKteGNcelDesignSystem_500523;
    return (
      <PostFrame motif="routes" handle="@gumrukteguncel">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 40 }}>
          <Eyebrow tone="faint">
            <LineIcon name="car" size={32} color="var(--ink-faint)" strokeWidth={2} />
            YABANCI PLAKALI ARAÇ
          </Eyebrow>
          <StatNumber value="730" unit="GÜN" />
          <h1 style={{
            margin: 0, maxWidth: 880,
            fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)',
            fontWeight: 'var(--fw-black)', lineHeight: 'var(--lh-head)',
            letterSpacing: 'var(--tr-tight)', color: 'var(--ink-strong)',
            textWrap: 'balance',
          }}>
            Yabancı plakalı araç Türkiye'de ne kadar kalır?
          </h1>
          <p style={{
            margin: 0, maxWidth: 760,
            fontSize: 'var(--fs-body)', fontWeight: 'var(--fw-regular)',
            lineHeight: 'var(--lh-body)', color: 'var(--ink-muted)',
          }}>
            Cevap kim olduğuna göre değişiyor. Detaylar YouTube kanalımızda.
          </p>
        </div>
      </PostFrame>
    );
  }
  window.ValuePost = ValuePost;
})();
