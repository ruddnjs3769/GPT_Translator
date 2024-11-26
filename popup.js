document.getElementById("saveApiKey").addEventListener("click", () => {
  const apiKey = document.getElementById("apiKey").value;
  const model = document.getElementById("modelSelect").value;
  chrome.storage.sync.set({ apiKey: apiKey, model: model }, () => {
    alert("API Key and Model saved!");
  });
});
