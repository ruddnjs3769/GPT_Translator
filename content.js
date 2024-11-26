async function translateText(text, apiKey, model) {
  let url;
  if (model === "claude_3.5_sonnet") {
    url = "https://api.claude.com/translate";
  } else if (model === "gpt_4o") {
    url = "https://api.gpt.com/translate";
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ text: text }),
  });

  if (!response.ok) {
    throw new Error("Translation failed");
  }

  const data = await response.json();
  return data.translatedText;
}

async function translatePage() {
  const apiKey = (await chrome.storage.sync.get("apiKey")).apiKey;
  if (!apiKey) {
    alert("API Key is not set!");
    return;
  }

  const elements = document.querySelectorAll("p, h1, h2, h3");
  for (const element of elements) {
    try {
      const translatedText = await translateText(element.innerText, apiKey);
      element.innerText = translatedText;
    } catch (error) {
      console.error(`Translation error: ${error.message}`);
      alert(`Translation error: ${error.message}`);
    }
  }
}

translatePage();
