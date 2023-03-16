export function isMaybeValidEmail(email: string) {
  /**
   * Email validation is tricky, this is a barebones, very slim validation
   * Taken from here: https://stackoverflow.com/a/4964766
   * More context + conversation here: https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
   */
  return /^\S+@\S+\.\S+$/.test(email);
}
