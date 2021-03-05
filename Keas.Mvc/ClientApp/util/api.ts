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

  console.log(res);

  if (!res.ok) {
    let erorrMsg = '';

    if (res.status === 500) {
      throw new Error(erorrMsg);
    } else if (res.status === 400) {
      const errRes = await res.json();

      if (typeof errRes === 'string') {
        erorrMsg = errRes;
      }
    }

    throw new Error(erorrMsg);
  }

  return await res.json();
};

const createFetch = (antiForgeryToken: string) => (url, init) =>
  doFetch(url, antiForgeryToken, init);

export { createFetch, doFetch };
