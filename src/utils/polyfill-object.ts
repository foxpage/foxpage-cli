/*
 * @Author: j.yangf
 * @Date: 2021-08-16 15:59:18
 * @LastEditors: j.yangf
 * @LastEditTime: 2021-10-12 14:51:50
 * @Description: polyfill object helper function
 */

export const isEmptyObject = (obj: Record<any, any>) => {
  if (!obj) return true;
  for (const key in obj) {
    return !key;
  }
  return true;
};
