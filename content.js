class PageTranslator {
  constructor() {
    this.translationCache = new Map();
    this.initializeMessageListener();
    this.excludeSelectors = ["pre", "code", ".math", "[data-no-translate]"];
    this.initialize();
  }

  async initialize() {
    const settings = await this.getSettings();
    if (settings.translationEnabled) {
      this.translatePage();
    }
  }

  initializeMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "ping") {
        sendResponse("pong");
        return;
      }
      if (request.action === "toggleTranslation") {
        this.handleTranslationToggle(request.enabled);
      }
    });
  }

  async handleTranslationToggle(enabled) {
    if (enabled) {
      await this.translatePage();
    } else {
      this.restoreOriginalTexts();
    }
  }

  async translatePage() {
    const settings = await this.getSettings();

    if (!settings.apiKey || !settings.model) {
      console.error("API Key or Model not set");
      return;
    }

    const elements = this.getTranslatableElements();
    if (elements.length === 0) return;

    this.storeOriginalTexts(elements);

    try {
      const texts = elements
        .map((el) => el.innerText.trim())
        .filter((text) => text);

      const translatedTexts = await this.translateTexts(texts, settings);
      this.updateElements(elements, translatedTexts);
    } catch (error) {
      console.error("Translation failed:", error);
      this.restoreOriginalTexts();
    }
  }

  getTranslatableElements() {
    const selector = "p, h1, h2, h3, h4, h5, h6";
    const elements = Array.from(document.querySelectorAll(selector));
    return elements.filter(
      (el) =>
        !this.excludeSelectors.some(
          (selector) => el.matches(selector) || el.closest(selector)
        )
    );
  }

  storeOriginalTexts(elements) {
    elements.forEach((el) => {
      if (!el.dataset.originalText) {
        el.dataset.originalText = el.innerText.trim();
      }
    });
  }

  restoreOriginalTexts() {
    const elements = document.querySelectorAll("[data-original-text]");
    elements.forEach((el) => {
      el.innerText = el.dataset.originalText;
    });
  }

  async translateTexts(texts, settings) {
    if (!texts.length) return [];

    try {
      const response = await chrome.runtime.sendMessage({
        action: "translate",
        texts: texts,
        settings: settings,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response;
    } catch (error) {
      console.error("Translation API error:", error);
      throw new Error(`번역 API 오류: ${error.message}`);
    }
  }

  updateElements(elements, translatedTexts) {
    elements.forEach((el, index) => {
      if (translatedTexts[index]) {
        el.innerText = translatedTexts[index];
      }
    });
  }

  getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(
        ["apiKey", "model", "translationEnabled"],
        resolve
      );
    });
  }
}

// Initialize the translator
new PageTranslator();
