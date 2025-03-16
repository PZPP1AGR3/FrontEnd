export const mapOrderNumberToLiteral = (order: number | undefined) => {
  switch(order) {
    case -1:
      return 'desc';
    case 1:
      return 'asc';
    default:
      return undefined;
  }
}

export const mapOrderLiteralToNumber = (order: 'asc' | 'desc' | undefined) => {
  switch(order) {
    case 'asc':
      return 1;
    case 'desc':
      return -1;
    default:
      return undefined;
  }
}

export const mapRangeToPagination = (start: number, rows: number) => {
  const page = Math.floor(
    start / rows
  );
  return {
    page: page + 1,
    pageSize: rows
  }
}
