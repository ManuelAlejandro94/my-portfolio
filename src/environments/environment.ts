// Public browser configuration only. Never put server secrets here.
export const environment = {
  production: true,
  contact: {
    // Set the independent Grima production URL, including /grima-bot.
    apiUrl: 'https://grima-bot.netlify.app/grima-bot',
    turnstileSiteKey: "0x4AAAAAAGCyHPBtXBBle3_5",
    turnstileAction: 'contact'
  }
};
