import uniqolor from 'uniqolor';
import chalk from 'chalk';

const KeywordUniqueColorCfg = {
  format: 'hex' as const,
  lightness: [50, 90],
  saturation: [50, 90],
};

export const getUniqueColorChalk = (keyword: string, isBold = true) => {
  const uniqueColor = uniqolor(keyword, KeywordUniqueColorCfg);
  if (isBold) {
    return chalk.bold.hex(uniqueColor.color)(keyword);
  }
  return chalk.hex(uniqueColor.color)(keyword);
};
