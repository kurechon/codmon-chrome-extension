document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];

    chrome.tabs.sendMessage(
      currentTab.id,
      { action: "fetchImages" },
      (imageUrls) => {
        // Log image URLs to the console
        console.log("Image URLs:", imageUrls);
      }
    );
  });
});
