/*
 * @Description: 测试流程: 帮助用户初始化数据库
 */
import open from 'open';
import { MongoClient } from 'mongodb';
import { logger } from '@foxpage/foxpage-component-shared';
import * as InquirerHelper from '../../utils/inquirer-helper';
import { commandExist } from '../../utils/command-tool';
import Config from '../../constants/config';

const mongoUrl = 'mongodb://localhost:27017';

const main = async () => {
  logger.colorLog('green', 'test ???');
  const hasMongo = await commandExist('mongo');
  const hasMongoD = await commandExist('mongod');
  if (!hasMongo || !hasMongoD) {
    logger.error('未安装 mongo | mongod, 请安装后再操作\n');
    const yes = await InquirerHelper.confirm('是否立即前往mongo官网? ');
    if (yes) await open(Config.mongoDBUrl);
    process.exit();
  }
  await connectMongo();
};

const connectMongo = async ({ count = 0 } = {}) => {
  if (count >= 10) {
    logger.error('connectMongo 尝试次数过多, 请检查');
    return;
  }
  const dbName = 'foxpage_demo';
  const client = new MongoClient(mongoUrl);
  client.connect(async err => {
    if (err) {
      if (err.name === 'MongoNetworkError') {
        logger.error('未启动 mongod, 请先运行 mongod 启动服务后再尝试初始化 foxpage mongo 数据库...');
      } else {
        logger.error(err.message);
      }
      process.exit();
    }
    logger.colorLog('green', 'Connected successfully to server');
    const db = client.db(dbName);
    const cols = await db.collections();
    console.log(cols);
    client.close();
  });
};

main();
