chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translate") {
    handleTranslation(request.texts, request.settings)
      .then(sendResponse)
      .catch((error) => sendResponse({ error: error.message }));
    return true; // 비동기 응답을 위해 true 반환
  }
});

async function handleTranslation(texts, settings) {
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    if (settings.model === "gpt_4o") {
      headers["Authorization"] = `Bearer ${settings.apiKey}`;
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content:
                  "당신은 전문 번역가입니다. 주어진 텍스트를 한국어로 자연스럽게 번역해주세요.",
              },
              {
                role: "user",
                content: texts.join("\n---\n"),
              },
            ],
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "번역 실패");
      return data.choices[0].message.content.split("\n---\n");
    } else if (settings.model === "claude_3.5_sonnet") {
      headers["x-api-key"] = settings.apiKey;
      headers["anthropic-version"] = "2023-06-01";

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          model: "claude-3-sonnet-20240229",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: `다음 텍스트들을 한국어로 번역해주세요:\n${texts.join(
                "\n---\n"
              )}`,
            },
          ],
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "번역 실패");
      return data.content[0].text.split("\n---\n");
    }
  } catch (error) {
    throw new Error(`번역 실패: ${error.message}`);
  }
}
