class TranslatorUI {
  constructor() {
    this.initializeElements();
    this.attachEventListeners();
    this.loadSavedSettings();
  }

  initializeElements() {
    this.apiKeyInput = document.getElementById("api-key");
    this.modelSelect = document.getElementById("model-select");
    this.verifyButton = document.getElementById("verify-api-key");
    this.messageEl = document.getElementById("message");
    this.toggleContainer = document.getElementById("toggle-container");
    this.translationToggle = document.getElementById("translation-toggle");
    this.loading = document.querySelector(".loading");
    this.progressBar = document.querySelector(".progress-bar");
    this.progressBarFill = document.querySelector(".progress-bar-fill");
  }

  attachEventListeners() {
    this.verifyButton.addEventListener("click", () => this.verifyApiKey());
    this.translationToggle.addEventListener("change", (e) =>
      this.handleToggle(e)
    );
  }

  async loadSavedSettings() {
    const data = await this.getStorageData([
      "apiKey",
      "model",
      "translationEnabled",
    ]);

    if (data.apiKey) {
      this.apiKeyInput.value = data.apiKey;
      this.modelSelect.value = data.model || "gpt_4o";
      this.toggleContainer.style.display = "block";
      this.translationToggle.checked = data.translationEnabled;
    }
  }

  showLoading(show) {
    this.loading.style.display = show ? "inline-block" : "none";
    this.verifyButton.disabled = show;
  }

  showMessage(message, isError = false) {
    this.messageEl.textContent = message;
    this.messageEl.className = isError ? "error" : "success";
  }

  async verifyApiKey() {
    const apiKey = this.apiKeyInput.value.trim();
    const model = this.modelSelect.value;

    if (!apiKey) {
      this.showMessage("API 키를 입력하세요.", true);
      return;
    }

    this.showLoading(true);

    try {
      const isValid = await this.validateApiKey(apiKey, model);

      if (isValid) {
        await this.saveSettings(apiKey, model);
        this.showMessage("API 키가 확인되었습니다.");
        this.toggleContainer.style.display = "block";
      }
    } catch (error) {
      this.showMessage(`검증 실패: ${error.message}`, true);
    } finally {
      this.showLoading(false);
    }
  }

  async validateApiKey(apiKey, model) {
    // API 키 검증 로직 (이전과 동일)
    return true; // 임시 반환
  }

  async handleToggle(event) {
    const isEnabled = event.target.checked;

    try {
      await this.saveSettings(null, null, isEnabled);

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      // 1. 먼저 content script가 이미 주입되어 있는지 확인
      try {
        await chrome.tabs.sendMessage(tab.id, { action: "ping" });
      } catch (error) {
        // 2. content script가 없다면 주입
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"],
        });
      }

      // 3. 그 후 메시지 전송
      await chrome.tabs.sendMessage(tab.id, {
        action: "toggleTranslation",
        enabled: isEnabled,
      });
    } catch (error) {
      console.error("Toggle failed:", error);
      this.showMessage("설정 저장 실패: " + error.message, true);
      event.target.checked = !isEnabled;
    }
  }

  getStorageData(keys) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(keys, resolve);
    });
  }

  async saveSettings(apiKey, model, translationEnabled) {
    const settings = {};
    if (apiKey) settings.apiKey = apiKey;
    if (model) settings.model = model;
    if (translationEnabled !== undefined)
      settings.translationEnabled = translationEnabled;

    await chrome.storage.sync.set(settings);
  }
}

// Initialize the UI
document.addEventListener("DOMContentLoaded", () => {
  new TranslatorUI();
});