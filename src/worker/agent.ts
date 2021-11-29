import { EventEmitter } from 'events';
import { fork, ChildProcess } from 'child_process';
import { WorkContext, WorkMessage, ResultMessage } from './interface';
import { join } from 'path';

export class WorkerAgent extends EventEmitter {
  _child: ChildProcess;
  status: 'idle' | 'locked' | 'running';
  id: string;

  constructor(id: string) {
    super();
    this.id = id;
    this._child = fork(join(__dirname, './worker'), {
      stdio: 'inherit',
    });
    this.status = 'idle';
  }

  get idle() {
    return this.status === 'idle';
  }

  get locked() {
    return this.status === 'locked';
  }

  get running() {
    return this.status === 'running';
  }

  lock() {
    if (this.running) {
      throw new Error('Your need wait previous worker done!');
    }
    if (this.locked) {
      return;
    }
    this.status = 'locked';
    this.once('done', () => this.unlock());
  }

  unlock() {
    if (this.status === 'running') {
      throw new Error('Your need wait previous worker done!');
    }
    if (!this.locked) {
      return;
    }
    this.status = 'idle';
  }

  async apply(ctx: WorkContext) {
    if (this.status === 'running') {
      throw new Error('Your need wait previous worker done!');
    }
    this.status = 'running';
    const msg: WorkMessage = {
      from: process.pid,
      action: 'run',
      payload: ctx,
    };
    this.emit('apply', msg);
    this._child.send(msg);
    const result: ResultMessage['payload'] = await new Promise(resolve => {
      this._child.once('message', (msg: ResultMessage) => {
        resolve(msg.payload);
      });
    });
    this.status = 'idle';
    this.emit('done', result);
  }

  destroy() {
    this._child.kill();
  }
}
