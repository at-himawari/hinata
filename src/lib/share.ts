const SHARE_TEXT = "日記をつけました。 https://hinata.at-himawari.com #hinata";

export function openShareWindow() {
  if (typeof window === "undefined") {
    return;
  }

  const shareUrl = new URL("https://twitter.com/intent/tweet");
  shareUrl.searchParams.set("text", SHARE_TEXT);
  window.open(shareUrl.toString(), "_blank", "noopener,noreferrer");
}

export function getShareText() {
  return SHARE_TEXT;
}
