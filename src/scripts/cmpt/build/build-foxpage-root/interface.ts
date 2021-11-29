export type PackageHashMap = Record<string, string>;

export interface PackageDataType {
  name: string;
  pkgName: string;
  hash: string;
  packagePath: string;
  useCache: boolean;
}
export type PackagesDataType = PackageDataType[];
