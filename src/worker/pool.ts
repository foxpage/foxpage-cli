import { cpus } from 'os';
import { EventEmitter } from 'events';
import { WorkerAgent } from './agent';
import { logger } from '@foxpage/foxpage-component-shared';

const max = cpus().length - 1;

export class WorkerPool extends EventEmitter {
  size: number;
  agents: Array<WorkerAgent>;

  constructor(size = max) {
    super();
    this.size = size;
    this.agents = Array.from({ length: this.size }).map((_, idx) => {
      const agent = new WorkerAgent(String(idx));
      agent.on('done', () => {
        this.emit('idle-agent', agent);
      });
      return agent;
    });

    process.on('beforeExit', () => {
      this.destroy();
    });
  }

  async getInstance(): Promise<WorkerAgent> {
    const idleAgent = this.agents.find(agent => agent.idle);
    if (idleAgent) {
      idleAgent.lock();
      logger.debug('find idle worker agent: ', idleAgent._child.pid);
      return idleAgent;
    }
    logger.debug('wait idle agent: ');
    return this.waitIdleAgent();
  }

  waitIdleAgent() {
    return new Promise<WorkerAgent>(resolve => {
      const handle = (agent: WorkerAgent) => {
        if (agent.idle) {
          logger.debug('get one idle agent: ', agent._child.pid);
          agent.lock();
          resolve(agent);
          this.off('idle-agent', handle);
        }
      };
      this.on('idle-agent', handle);
    });
  }

  destroy() {
    for (const agent of this.agents) {
      agent.destroy();
    }
  }
}
