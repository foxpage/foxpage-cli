import { EventEmitter } from 'events';
import { WorkerPool } from './pool';
import { WorkContext } from './interface';

type Fn = (...args: any[]) => any;

export interface Job<T extends Fn> {
  pre?: () => void;
  onSuc?: () => void;
  onFail?: () => void;
  args: Parameters<T>;
}

export class Master<T extends Fn> extends EventEmitter {
  jobs: Array<Job<T>>;
  pool: WorkerPool;
  context: Omit<WorkContext, 'args'>;

  constructor(ctx: Omit<WorkContext, 'args'>) {
    super();
    this.jobs = [];
    this.pool = new WorkerPool();
    this.context = ctx;
  }

  addJob(job: Job<T>) {
    this.jobs.push(job);
  }

  async run() {
    const promises = this.jobs.map(async job => {
      const worker = await this.pool.getInstance();
      job.pre?.();
      const result = await worker.apply({
        ...this.context,
        args: job.args,
      });
      if (result.ok) {
        job.onSuc?.();
      } else {
        job.onFail?.();
      }
      return {
        ...result,
        args: job.args,
      };
    });

    return await Promise.all(promises);
  }

  destroy() {
    this.pool.destroy();
  }
}

export const createWorker = <F extends Fn>(ctx: Omit<WorkContext, 'args'>) => {
  const ins = new Master<F>(ctx);
  return ins;
};
