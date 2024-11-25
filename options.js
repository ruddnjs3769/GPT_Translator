// options.js
document.getElementById("save-key").addEventListener("click", () => {
  const apiKey = document.getElementById("api-key").value.trim();
  if (apiKey) {
    chrome.storage.local.set({ API_KEY: apiKey }, () => {
      document.getElementById("status").innerText = "API Key 저장됨!";
    });
  } else {
    document.getElementById("status").innerText = "API Key를 입력하세요.";
  }
});

chrome.storage.local.get("API_KEY", (result) => {
  console.log("Stored API Key:", result.API_KEY);
});
