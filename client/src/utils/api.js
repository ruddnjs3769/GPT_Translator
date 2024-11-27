class TranslationAPI {
  constructor() {
    this.baseURL = "http://localhost:3000/api";
  }

  async translate(texts, settings) {
    try {
      const response = await fetch(`${this.baseURL}/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          texts,
          model: settings.model,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      return data.translations;
    } catch (error) {
      throw new Error(`번역 요청 실패: ${error.message}`);
    }
  }
}

export default new TranslationAPI();
