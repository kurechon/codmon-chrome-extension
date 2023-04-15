import $ from "jquery";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

async function getImageUrl(img) {
  let url = img.src;
  const parsedUrl = new URL(url);
  parsedUrl.searchParams.set("width", "0");
  parsedUrl.searchParams.set("height", "0");
  const testUrl = parsedUrl.toString();

  try {
    await fetch(testUrl, { method: "HEAD" });
    return testUrl;
  } catch (error) {
    parsedUrl.searchParams.set("width", "2300");
    parsedUrl.searchParams.set("height", "2300");
    return parsedUrl.toString();
  }
}

function createLoadingIndicator(totalImages) {
  const loadingIndicator = document.createElement("div");
  loadingIndicator.id = "loading-indicator";
  loadingIndicator.className =
    "d-flex flex-column justify-content-center align-items-center position-fixed";
  loadingIndicator.style.top = "0";
  loadingIndicator.style.left = "0";
  loadingIndicator.style.width = "100%";
  loadingIndicator.style.height = "100%";
  loadingIndicator.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  loadingIndicator.style.zIndex = "100001";

  const spinner = document.createElement("div");
  spinner.className = "spinner-border text-light mb-3";
  spinner.style.width = "3rem";
  spinner.style.height = "3rem";
  loadingIndicator.appendChild(spinner);

  const progressText = document.createElement("p");
  progressText.id = "progress-text";
  progressText.className = "text-light mb-0";
  progressText.textContent = `0 / ${totalImages} images loaded`;
  loadingIndicator.appendChild(progressText);

  document.body.appendChild(loadingIndicator);

  return loadingIndicator;
}

function createOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "image-overlay";
  overlay.className = "container-fluid fixed-top h-100 w-100";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  overlay.style.zIndex = "100000";
  overlay.style.overflowY = "scroll";
  overlay.style.paddingTop = "2rem";
  document.body.appendChild(overlay);
  return overlay;
}

function createCloseButton(overlay) {
  const closeButton = document.createElement("button");
  closeButton.className = "btn btn-danger position-fixed";
  closeButton.style.top = "10px";
  closeButton.style.right = "10px";
  closeButton.style.zIndex = "100001";
  closeButton.textContent = "Close";
  closeButton.onclick = () => overlay.remove();
  overlay.appendChild(closeButton);
}

async function fetchImageUrls(imageElements) {
  const imageUrls = [];

  for (const [index, img] of imageElements.entries()) {
    const storageKey = `imgUrl_${img.src}`;

    const cachedUrl = await new Promise((resolve) => {
      chrome.storage.local.get(storageKey, (items) => {
        resolve(items[storageKey]);
      });
    });

    let url;
    if (cachedUrl) {
      url = cachedUrl;
    } else {
      url = await getImageUrl(img);
      chrome.storage.local.set({ [storageKey]: url });
    }

    imageUrls.push(url);
  }

  return imageUrls;
}

function displayNoImagesMessage(overlay) {
  const noImagesMessage = document.createElement("div");
  noImagesMessage.className = "text-center text-white mt-5";
  noImagesMessage.textContent = "このページには画像がありません。";
  overlay.appendChild(noImagesMessage);
}

function displayFetchedImages(overlay, imageUrls) {
  imageUrls.forEach((url) => {
    const img = document.createElement("img");
    img.src = url;
    img.className = "img-thumbnail m-2";
    img.style.maxWidth = "200px";
    img.style.maxHeight = "200px";
    img.style.cursor = "pointer";
    img.title = "Click to download";
    img.onclick = (event) => {
      event.preventDefault();
      chrome.runtime.sendMessage({
        action: "downloadImage",
        url: url,
      });
    };
    overlay.appendChild(img);
  });
}

async function displayImages() {
  const overlay = createOverlay();
  createCloseButton(overlay);

  const imageElements = Array.from(
    document.querySelectorAll(".ons__carousel img")
  );
  const totalImages = imageElements.length;
  const loadingIndicator = createLoadingIndicator(totalImages);
  const progressText = document.getElementById("progress-text");

  const imageUrls = await fetchImageUrls(imageElements);

  loadingIndicator.remove();

  if (imageUrls.length === 0) {
    displayNoImagesMessage(overlay);
  } else {
    displayFetchedImages(overlay, imageUrls);
  }
}

// Listen for a message from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "iconClicked") {
    displayImages();
  }
});

function createImageButton() {
  const imageButton = document.createElement("button");
  imageButton.id = "image-list-button";
  imageButton.className = "btn btn-primary position-fixed";
  imageButton.style.top = "10px";
  imageButton.style.left = "10px";
  imageButton.style.zIndex = "100000";
  imageButton.textContent = "画像の一覧";
  imageButton.onclick = () => displayImages();
  document.body.appendChild(imageButton);
}

createImageButton();
