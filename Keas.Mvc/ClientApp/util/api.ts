import 'isomorphic-fetch';

const doFetch = async (
  url: string,
  antiForgeryToken: string,
  init?: RequestInit
): Promise<any> => {
  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: [
      ['Accept', 'application/json'],
      ['Content-Type', 'application/json'],
      ['RequestVerificationToken', antiForgeryToken]
    ]
  });

  if (!res.ok) {
    let errorMsg = '';

    try {
      const errRes = await res.json();

      if (typeof errRes === 'string') {
        errorMsg = errRes;
      }
    } catch (error) {
      throw new Error();
    }

    throw new Error(errorMsg);
  }

  return await res.json();
};

const createFetch = (antiForgeryToken: string) => (url, init) =>
  doFetch(url, antiForgeryToken, init);

export { createFetch, doFetch };
