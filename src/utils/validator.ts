import semver from 'semver';

export const checkRequired = (value: any) => {
  return !!value;
};

export const checkNoUndefined = (value: any) => value !== undefined;

export const checkVersionValid = (value: any) => !!semver.valid(value);
