import { logger } from '@foxpage/foxpage-component-shared';
import { ResultMessage, WorkMessage } from './interface';

const debug = (msg: string, ...params: any[]) => {
  logger.debug(` <worker:${process.pid}> ${msg}`, ...params);
};

async function handleWorkerMessage(msg: WorkMessage) {
  const { action, payload, from } = msg;
  if (from === process.pid) {
    return;
  }
  switch (action) {
    case 'run':
      debug('run work under context: ', payload);
      const fn = require(payload.filename)[payload.exportName];
      if (typeof fn === 'function') {
        debug(`run work fn: "${fn.name}"`);
        return await fn(...payload.args);
      }
      break;
  }
}

process.on('message', (msg: WorkMessage) => {
  handleWorkerMessage(msg)
    .then(
      data => {
        const msg: ResultMessage = {
          action: 'result',
          payload: { ok: true, data },
          from: process.pid,
        };
        return msg;
      },
      err => {
        const msg: ResultMessage = {
          action: 'result',
          payload: { ok: false, data: null, err },
          from: process.pid,
        };
        return msg;
      },
    )
    .then(msg => {
      process.send?.(msg);
    });
});
