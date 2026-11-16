// Public browser configuration only. The matching secret stays in Grima.
export const environment = {
  production: false,
  contact: {
    apiUrl: 'http://localhost:8888/grima-bot',
    turnstileSiteKey: "0x4AAAAAAGCzeRtB9rMT9dq_",
    turnstileAction: 'contact'
  }
};
