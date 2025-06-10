const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js")
const britishOnly = require('./british-only.js')
const britishTitles = Object.fromEntries(
    Object.entries(americanToBritishTitles).map(([key, value]) => [value, key])
  );
const britishToAmericanSpelling = Object.fromEntries(
    Object.entries(americanToBritishSpelling).map(([key, value]) => [value, key])
  );

class Translator {
    constructor(){
        this.americanOnly = americanOnly;
        this.britishOnly = britishOnly;
        this.americanToBritishSpelling = americanToBritishSpelling;
        this.americanToBritishTitles = americanToBritishTitles;
        this.britishToAmericanTitles = britishTitles;
    }
   
    translateTime(text, highlite = true, locale) {
  const americanTimeRegex = /\b(\d{1,2}):(\d{2})\b/g;
  const britishTimeRegex = /\b(\d{1,2})\.(\d{2})\b/g;
if (locale === "american-to-british") {
  if( !highlite) {
    return text.replace(americanTimeRegex, '$1.$2');
  }
  return text.replace(americanTimeRegex, '<span class="highlight">$1.$2</span>');
}
  if( !highlite) {
    return text.replace(britishTimeRegex, '$1:$2');
  }
  return text.replace(britishTimeRegex, '<span class="highlight">$1:$2</span>');

}
    
 translateTitle(text, locale, highlight = true) {
  let titles = {};
  if (locale === "american-to-british") {
    titles = this.americanToBritishTitles;
  } else if (locale === "british-to-american") {
    titles = this.britishToAmericanTitles;
  } else {
    return text;
  }

  const escapedTitles = Object.keys(titles).map(title =>
    title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  );

  const titleRegex = new RegExp(`(?<!\\w)(${escapedTitles.join("|")})(?!\\w)`, "gi");

  return text.replace(titleRegex, match => {
    
    const key = Object.keys(titles).find(t => t.toLowerCase() === match.toLowerCase());

    if (!key) return match; 

    let translated = titles[key];

    
    if (match[0] === match[0].toUpperCase()) {
      translated = translated.charAt(0).toUpperCase() + translated.slice(1);
    }

    if (highlight) {
      return `<span class="highlight">${translated}</span>`;
    } else {
      return translated;
    }
  });
}


    translateWords(text, locale, highlight = true) {
  let dict = {};
  if (locale === "american-to-british") {
    dict = {
      ...this.americanOnly,
      ...this.americanToBritishSpelling,
    };
  } else {
    dict = {
      ...this.britishOnly,
      ...britishToAmericanSpelling};

  }

  
  const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length);

  for (let phrase of sortedKeys) {
    const escaped = phrase.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");  
     const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    text = text.replace(regex, match => {
      let translated = dict[phrase];
      
      if (locale === "american-to-british" && this.americanToBritishTitles[match.toLowerCase()]) {
        translated = this.americanToBritishTitles[match.toLowerCase()];
        translated = translated.charAt(0).toUpperCase() + translated.slice(1);
      }
      return highlight ? `<span class="highlight">${translated}</span>` : translated;
    });
  }

  return text;
}

    translate(text, locale, highlight = true){
  let translated = this.translateTitle(text,locale, highlight); 
  
  translated = this.translateWords(translated, locale, highlight);
  translated = this.translateTime(translated, highlight, locale);
  return translated;
}
}

module.exports = Translator;