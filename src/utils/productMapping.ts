
export const productMapping: { [key: string]: string } = {
    "0": "Миний Монголын Сүү",
    "1": "Yogurt",
    "2": "Cheese",
  };
  
  export function getProductName(id: string): string {
    return productMapping[id] || `${id}`;
  }