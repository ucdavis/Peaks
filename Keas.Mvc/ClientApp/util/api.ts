import "isomorphic-fetch";

const doFetch = async (url: string, init?: RequestInit): Promise<any> => {
    const res = await fetch(url, {
        ...init,
        headers: [
            ["Accept", "application/json"],
            ["Content-Type", "application/json"],
        ],
    });

    if (!res.ok) { throw new Error(res.statusText); }

    return await res.json();
};

const createFetch = () => doFetch;

export {
    createFetch,
    doFetch,
};
