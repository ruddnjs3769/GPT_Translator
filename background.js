chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["contentScript.js"],
      });
    } catch (error) {
      console.error("Script execution failed:", error);
    }
  }
});
