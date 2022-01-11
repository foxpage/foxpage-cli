export const isEmptyObject = (obj: Record<any, any>) => {
  if (!obj) return true;
  for (const key in obj) {
    return !key;
  }
  return true;
};
