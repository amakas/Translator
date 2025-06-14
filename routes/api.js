'use strict';

const Translator = require('../components/translator.js');

module.exports = function (app) {
  
  const translator = new Translator();

  app.route('/api/translate')
    .post((req, res) => {
      const text = req.body.text
      const locale = req.body.locale
      if(!locale || text === undefined || text === null || locale === null || locale === undefined){
        return res.json({ error: 'Required field(s) missing' })
      }
      if(text === " " || text.trim() === ""){
        return res.json({ error: 'No text to translate' })
      }
      if(locale !== "american-to-british" && locale !== "british-to-american"){
        return res.json({ error: 'Invalid value for locale field' })
      }
      
      const result = translator.translate(text, locale)
      if (text === result){
        return res.json({ text, translation: "Everything looks good to me!"})
      }
      return res.json({text, translation: result})
    });

};
