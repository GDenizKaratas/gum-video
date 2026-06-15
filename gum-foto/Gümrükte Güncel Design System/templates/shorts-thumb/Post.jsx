// ShortsThumb template. Exposes window.ShortsThumb.
(() => {
  function ShortsThumb() {
    const { VideoThumb, Hot } = window.GMrKteGNcelDesignSystem_500523;
    const base = window.GG_ASSET_BASE || '../../assets';
    return (
      <VideoThumb
        format="shorts"
        photo={base + '/photos/arac-arazi.png'}
        photoPos="center"
        scrim="bottom"
        align="center"
        eyebrow="Dikkat"
        title={<>En <Hot>pahalı</Hot> hata</>}
        callout="ARAÇ MEN"
        calloutTone="hot"
      />
    );
  }
  window.ShortsThumb = ShortsThumb;
})();
