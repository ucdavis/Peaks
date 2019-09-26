export function validateEmail(email: string): boolean {
  /* tslint:disable-next-line:max-line-length */
  // per: https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
  const regex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return regex.test(email);
}
