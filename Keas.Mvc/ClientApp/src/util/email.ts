export function validateEmail(email: string): boolean {
  // per: https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
  /* eslint-disable-next-line max-len */
  const regex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return regex.test(email);
}
