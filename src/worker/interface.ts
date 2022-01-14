export interface WorkContext {
  filename: string;
  exportName: string;
  args: any[];
  size?: number;
}

export type Message<A extends string, P> = {
  action: A;
  payload: P;
  from: number;
};

export type ResultMessage = Message<'result', { ok: boolean; message?: string; data?: any; err?: Error }>;

export type WorkMessage = Message<'run', WorkContext>;
