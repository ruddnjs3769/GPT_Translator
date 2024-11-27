class StorageManager {
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

export default new StorageManager();
