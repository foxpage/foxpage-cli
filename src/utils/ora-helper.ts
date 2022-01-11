import ora from 'ora';
export const oraSafeLog = (spinner?: ora.Ora, cb = () => {}) => {
  spinner?.clear();
  cb();
  spinner?.render();
};
