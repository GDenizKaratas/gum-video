// WarningPost — sharp hook + factual payload + yellow warning strip. Exposes window.WarningPost.
(() => {
  function WarningPost() {
    const { PostFrame, WarningStrip, Highlight, Eyebrow, LineIcon } = window.GMrKteGNcelDesignSystem_500523;
    return (
      <PostFrame motif="routes" handle="@gumrukteguncel">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 40 }}>
          <Eyebrow tone="accent">
            <LineIcon name="alert" size={32} color="var(--accent)" strokeWidth={2.2} />
            UYARI
          </Eyebrow>
          <h1 style={{
            margin: 0,
            fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display)',
            fontWeight: 'var(--fw-black)', lineHeight: 'var(--lh-tight)',
            letterSpacing: 'var(--tr-tight)', color: 'var(--ink-strong)',
          }}>
            En <Highlight variant="fill">pahalı</Highlight> hata
          </h1>
          <p style={{
            margin: 0, maxWidth: 820,
            fontSize: 'var(--fs-body)', fontWeight: 'var(--fw-regular)',
            lineHeight: 'var(--lh-body)', color: 'var(--ink-muted)',
          }}>
            Yabancı plakalı arabanı Türkiye'de ailene bırakıp çıkarsan ne olur?
            Çoğu kişi bunu <Highlight>masum</Highlight> sanıyor.
          </p>
        </div>
        <WarningStrip icon="alert">Gümrük vergisinin ¼'ü ceza + araç men</WarningStrip>
      </PostFrame>
    );
  }
  window.WarningPost = WarningPost;
})();
