export class ReactTableUtil {
  public static setPageSize(pageSize) {
    localStorage.setItem('PeaksDefaultPageSize', pageSize);
  }

  public static getPageSize(): number {
    return parseInt(localStorage.getItem('PeaksDefaultPageSize')) || 20;
  }
}
