// YouTubeThumb template. Exposes window.YouTubeThumb.
(() => {
  function YouTubeThumb() {
    const { VideoThumb, Y } = window.GMrKteGNcelDesignSystem_500523;
    const base = window.GG_ASSET_BASE || '../../assets';
    return (
      <VideoThumb
        format="youtube"
        photo={base + '/photos/arac-yol.png'}
        photoPos="center"
        scrim="bottom-left"
        eyebrow="Yabancı Plaka"
        title={<>Türkiye'de <Y>730 gün</Y> kuralı</>}
        callout="2026"
        calloutTone="hot"
      />
    );
  }
  window.YouTubeThumb = YouTubeThumb;
})();
