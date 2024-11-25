chrome.storage.local.get("API_KEY", async ({ API_KEY }) => {
  if (!API_KEY) {
    console.error("API Key가 설정되지 않았습니다.");
    return;
  }

  const endpoint = "https://api.openai.com/v1/chat/completions";

  // 번역이 필요한 태그 선택
  const tagsToTranslate = ["p", "h1", "h2", "h3", "span", "div"];

  // 대상 태그들의 텍스트를 추출
  const elements = document.querySelectorAll(tagsToTranslate.join(","));
  const originalTexts = Array.from(elements)
    .map((el) => el.innerText.trim()) // 텍스트만 추출
    .filter((text) => text.length > 0); // 빈 텍스트 필터링

  // GPT API 요청 생성
  const translationRequest = originalTexts.map((text) => ({
    role: "user",
    content: `Translate the following text into Korean:\n"${text}"`,
  }));

  const loadingIndicator = document.createElement("div");
  loadingIndicator.innerText = "번역 중...";
  document.body.appendChild(loadingIndicator);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a translation assistant." },
          ...translationRequest,
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No translation choices returned.");
    }

    const translatedTexts = data.choices.map((choice) =>
      choice.message.content.trim()
    );

    if (translatedTexts.length > 0) {
      Array.from(elements).forEach((el, index) => {
        if (translatedTexts[index]) {
          el.innerText = translatedTexts[index];
        }
      });
    }
  } catch (err) {
    console.error("Translation error:", err);
  } finally {
    document.body.removeChild(loadingIndicator);
  }
})();
