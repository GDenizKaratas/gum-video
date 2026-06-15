// CarouselDeck — a swipeable multi-slide Instagram carousel (1080×1080
// per slide) in the brand language. Demo content = the opening
// "yabancı plakalı araç" story: cover → stat → warning → CTA.
// Exposes window.CarouselDeck.
(() => {
  function CarouselDeck() {
    const { PostFrame, StatNumber, Eyebrow, Highlight, WarningStrip, LineIcon } =
      window.GMrKteGNcelDesignSystem_500523;
    const base = window.GG_ASSET_BASE || '../../assets';
    const { useState } = React;
    const [i, setI] = useState(0);

    const slides = [
      // 0 — COVER
      (
        <PostFrame motif="combo" handle="@gumrukteguncel">
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 36 }}>
            <Eyebrow tone="accent" rule>BİLGİ NOTU · ARAÇ</Eyebrow>
            <h1 style={{ margin: 0, maxWidth: 880, fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display)', fontWeight: 900, lineHeight: 0.98, letterSpacing: '-0.02em', color: 'var(--ink-strong)' }}>
              Yabancı plakalı araç <Highlight>rehberi</Highlight>
            </h1>
            <p style={{ margin: 0, maxWidth: 720, fontSize: 'var(--fs-body)', color: 'var(--ink-muted)', lineHeight: 'var(--lh-body)' }}>
              Süre, kurallar ve en sık yapılan hata — kaydırın.
            </p>
          </div>
        </PostFrame>
      ),
      // 1 — STAT
      (
        <PostFrame motif="routes" handle="@gumrukteguncel">
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 36 }}>
            <Eyebrow tone="faint"><LineIcon name="car" size={32} color="var(--ink-faint)" /> NE KADAR KALIR?</Eyebrow>
            <StatNumber value="730" unit="GÜN" />
            <p style={{ margin: 0, maxWidth: 800, fontSize: 'var(--fs-body)', color: 'var(--ink-muted)', lineHeight: 'var(--lh-body)' }}>
              Yabancı plakalı bir araç Türkiye'de azami <Highlight>730 gün</Highlight> kalabilir. Süre kişiye göre değişir.
            </p>
          </div>
        </PostFrame>
      ),
      // 2 — WARNING
      (
        <PostFrame motif="routes" handle="@gumrukteguncel">
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 36 }}>
            <Eyebrow tone="accent"><LineIcon name="alert" size={32} color="var(--accent)" /> EN PAHALI HATA</Eyebrow>
            <h1 style={{ margin: 0, maxWidth: 880, fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 900, lineHeight: 1.04, letterSpacing: '-0.02em', color: 'var(--ink-strong)' }}>
              Aracı ailene bırakıp <Highlight>çıkarsan</Highlight> ne olur?
            </h1>
          </div>
          <WarningStrip icon="alert">Gümrük vergisinin ¼'ü ceza + araç men</WarningStrip>
        </PostFrame>
      ),
      // 3 — CTA
      (
        <PostFrame motif="combo" handle="@gumrukteguncel">
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 40 }}>
            <LineIcon name="document" size={96} color="var(--accent)" strokeWidth={1.6} />
            <h1 style={{ margin: 0, maxWidth: 820, fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 900, lineHeight: 1.02, letterSpacing: '-0.02em', color: 'var(--ink-strong)' }}>
              Detaylar <Highlight>YouTube</Highlight> kanalımızda
            </h1>
            <p style={{ margin: 0, fontSize: 'var(--fs-body)', color: 'var(--ink-muted)' }}>Takipte kalın · @gumrukteguncel</p>
          </div>
        </PostFrame>
      ),
    ];

    const dot = (on) => ({ width: on ? 30 : 12, height: 12, borderRadius: 999, background: on ? 'var(--accent)' : 'rgba(255,255,255,0.3)', transition: 'all .2s', cursor: 'pointer', border: 'none', padding: 0 });

    return (
      <div style={{ position: 'relative', width: 1080, height: 1080 }}>
        {slides[i]}
        {/* slide counter */}
        <div style={{ position: 'absolute', top: 96, right: 96, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--ink-faint)', letterSpacing: '0.04em' }}>
          {i + 1} / {slides.length}
        </div>
        {/* nav arrows */}
        {i > 0 && <button onClick={() => setI(i - 1)} style={navBtn('left')}>‹</button>}
        {i < slides.length - 1 && <button onClick={() => setI(i + 1)} style={navBtn('right')}>›</button>}
        {/* dots */}
        <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 10 }}>
          {slides.map((_, k) => <button key={k} aria-label={'slayt ' + (k + 1)} style={dot(k === i)} onClick={() => setI(k)} />)}
        </div>
      </div>
    );
  }

  function navBtn(side) {
    return {
      position: 'absolute', top: '50%', [side]: 24, transform: 'translateY(-50%)',
      width: 72, height: 72, borderRadius: 999, border: 'none', cursor: 'pointer',
      background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 44, lineHeight: '64px',
      fontFamily: 'var(--font-display)', backdropFilter: 'blur(6px)',
    };
  }

  window.CarouselDeck = CarouselDeck;
})();
