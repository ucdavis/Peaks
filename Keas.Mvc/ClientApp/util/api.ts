import "isomorphic-fetch";
import { RequestInfo } from "_debugger";

const doFetch = async (url: string, init?: RequestInit) : Promise<any> => {
    const res = await fetch(url, init);
    
    if (!res.ok) throw new Error(res.statusText);

    return await res.json();
}

const createFetch = () => doFetch;

export {
    createFetch,
    doFetch
};