export class ReactTableUtil {
    public static setPageSize(pageSize) {
        localStorage.setItem('PeaksDefaultPageSize', pageSize);
    }

    public static getPageSize() {
        return localStorage.getItem('PeaksDefaultPageSize') || 20;
    }
}
