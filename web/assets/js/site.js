const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");

function closeNavigation() {
  if (!menuToggle || !primaryNav) return;
  menuToggle.setAttribute("aria-expanded", "false");
  primaryNav.classList.remove("is-open");
}

if (menuToggle && primaryNav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    primaryNav.classList.toggle("is-open", !expanded);
  });

  primaryNav.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) closeNavigation();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNavigation();
  });

  document.addEventListener("click", (event) => {
    if (
      event.target instanceof Node &&
      !menuToggle.contains(event.target) &&
      !primaryNav.contains(event.target)
    ) {
      closeNavigation();
    }
  });
}

const sourceList = document.querySelector("#sources");
const sourceCount = document.querySelector("#sources-count");

function showSourcesMessage(message, state) {
  if (!sourceList || !sourceCount) return;
  const status = document.createElement("p");
  status.className = "sources-status";
  status.textContent = message;
  sourceList.replaceChildren(status);
  sourceCount.textContent = state;
}

async function loadSources() {
  if (!sourceList || !sourceCount) return;

  try {
    const response = await fetch("data/sources.json");
    if (!response.ok) throw new Error(`Source list request failed (${response.status}).`);

    const data = await response.json();
    if (!data || !Array.isArray(data.sources)) {
      throw new Error("Source list has an unexpected format.");
    }

    if (data.sources.length === 0) {
      showSourcesMessage("No project data sources are available right now.", "0 SOURCES");
      return;
    }

    const fragment = document.createDocumentFragment();
    data.sources.forEach((source, index) => {
      const hasUrl = typeof source.url === "string" && source.url.trim() !== "";
      const row = document.createElement(hasUrl ? "a" : "div");
      row.className = "source-row";

      if (hasUrl) {
        row.href = source.url;
        row.target = "_blank";
        row.rel = "noopener";
        row.setAttribute("aria-label", `View ${source.title} source in a new tab`);
      }

      const number = document.createElement("span");
      number.className = "source-index";
      number.textContent = String(index + 1).padStart(2, "0");

      const copy = document.createElement("div");
      copy.className = "source-copy";

      const title = document.createElement("h3");
      title.textContent = source.title || "Untitled source";

      const provider = document.createElement("span");
      provider.className = "source-provider";
      provider.textContent = source.provider || "Provider not specified";

      const description = document.createElement("p");
      description.textContent = source.usedFor || "Project source; additional description is not available.";

      const arrow = document.createElement("span");
      arrow.className = "source-arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = hasUrl ? "View source ↗" : "No link";

      copy.append(title, provider, description);
      row.append(number, copy, arrow);
      fragment.append(row);
    });

    sourceList.replaceChildren(fragment);
    sourceCount.textContent = `${data.sources.length} SOURCES`;
  } catch (error) {
    console.warn("Could not load the project data sources.", error);
    showSourcesMessage("The source list could not be loaded. Please try again later.", "UNAVAILABLE");
  }
}

loadSources();

const missionFrame = document.querySelector("#mission-frame");
const gameShell = document.querySelector(".game-shell");
const fullscreenButton = document.querySelector("#fullscreen-button");

if (missionFrame && gameShell && fullscreenButton) {
  missionFrame.addEventListener("load", () => {
    const frameDocument = missionFrame.contentDocument;
    const hasWebGlCanvas = Boolean(frameDocument?.querySelector("canvas"));
    if (!hasWebGlCanvas || typeof gameShell.requestFullscreen !== "function") return;

    fullscreenButton.hidden = false;
    fullscreenButton.disabled = false;
    missionFrame.title = "Mission Trainer Unity WebGL game";
  });

  fullscreenButton.addEventListener("click", async () => {
    if (fullscreenButton.disabled) return;
    try {
      await gameShell.requestFullscreen();
    } catch (error) {
      console.error("Could not enter fullscreen mode.", error);
    }
  });
}
