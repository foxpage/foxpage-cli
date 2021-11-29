import inquirer, { Question, Answers } from 'inquirer';

export function quiz(msg: any, backup: any, options: Question<Answers> = {}) {
  return inquirer
    .prompt([
      {
        name: 'input',
        type: 'input',
        default: backup,
        message: msg,
        ...options,
      },
    ])
    .then(({ input }) => input);
}

export function confirm(msg: any, backup = true, options: Question<Answers> = {}) {
  return inquirer
    .prompt([
      {
        name: 'yes',
        type: 'confirm',
        default: backup,
        message: msg,
        ...options,
      },
    ])
    .then(({ yes }) => yes);
}

export function select(msg: any, choices: any, backup: any, options: Question<Answers> = {}) {
  return inquirer
    .prompt([
      {
        name: 'select',
        type: 'list',
        choices,
        default: backup,
        message: msg,
        ...options,
      },
    ])
    .then(({ select }) => select);
}

export function checks(msg: any, choices: any, options: Question<Answers> = {}) {
  return inquirer
    .prompt([
      {
        name: 'checks',
        type: 'checkbox',
        choices,
        message: msg,
        ...options,
      },
    ])
    .then(({ checks }) => checks);
}
