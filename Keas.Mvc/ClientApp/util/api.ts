import "isomorphic-fetch";
import { RequestInfo } from "_debugger";

const doFetch = async (req: Request) : Promise<any> => {
    const res = await fetch(req);
    
    if (!res.ok) throw new Error(res.statusText);

    return await res.json();
}

const createFetch = () => doFetch;

export {
    createFetch,
    doFetch
};