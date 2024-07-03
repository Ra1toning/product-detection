export function shortenedCol(arrayOfArrays: any[], indexList: number[]): any[] {
    return arrayOfArrays.map(array => indexList.map(idx => array[idx]));
  }
  