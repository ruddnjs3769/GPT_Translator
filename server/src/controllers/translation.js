const TranslationService = require("../services/translator");

class TranslationController {
  async translate(req, res) {
    try {
      const { texts, model } = req.body;

      if (!texts || !Array.isArray(texts)) {
        return res
          .status(400)
          .json({ error: "올바른 텍스트 형식이 아닙니다." });
      }

      const translatedTexts = await TranslationService.translate(texts, model);
      res.json({ translations: translatedTexts });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new TranslationController();
