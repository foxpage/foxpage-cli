//  fix: primordials is not defined
// "resolutions": {
//   "graceful-fs": "4.2.3"
// },
const {
  execSync
} = require('child_process');

function parseNodeVersion(version) {
  const match = version.match(/^v(\d{1,2})\.(\d{1,2})\.(\d{1,2})(?:-([0-9A-Za-z-.]+))?(?:\+([0-9A-Za-z-.]+))?$/); // eslint-disable-line max-len
  if (!match) {
    throw new Error('Unable to parse: ' + version);
  }
  const res = {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    pre: match[4] || '',
    build: match[5] || '',
  };
  return res;
}

const isYarnClient = process.env.npm_config_user_agent.indexOf('yarn') > -1;
const nodeVersion = parseNodeVersion(process.version);
const isNeedFix = nodeVersion.major > 11;
if (isNeedFix) {
  console.log('node version 12+');
  console.log('Auto fix error: primordials is not defined in Node12+');
  if (isYarnClient) {
    console.log('Run with yarn: auto fix primordials by resolutions.');
  } else {
    console.log('Run with npm, fix primordials by npm-force-resolutions');
    execSync('npx npm-force-resolutions', {
      stdio: 'inherit',
    });
  }
}