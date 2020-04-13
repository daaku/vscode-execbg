import * as vscode from 'vscode';
import { spawn, ChildProcess, SpawnOptions } from 'child_process';
import treeKill from 'tree-kill';

const runningProcesses: ChildProcess[] = [];
let commandOutput = null;

interface Args {
  cmd?: string;
  cwd?: string;
  args?: string[];
}

function run(args: Args) {
  if (!args || !args.cmd) {
    vscode.window.showErrorMessage('ExecBG: Error: No command specified!');
    return;
  }
  const opts: SpawnOptions = {
    cwd: args.cwd || vscode.workspace.rootPath,
  };
  const process = spawn(args.cmd, args.args || [], opts);
  commandOutput.appendLine(`> Running command \`${args.cmd}\`...`)
  function printOutput(data) { commandOutput.append(data.toString()); }
  process.stdout.on('data', printOutput);
  process.stderr.on('data', printOutput);
  process.on('close', (status) => {
    if (status === 0) {
      commandOutput.appendLine(`> Command ${args.cmd} ran successfully.`);
    } else {
      commandOutput.appendLine(`> ERROR: Command ${args.cmd} exited with status code ${status}.`);
    }
  });
  runningProcesses.push(process);
}

export function activate(context: vscode.ExtensionContext) {
  commandOutput = vscode.window.createOutputChannel('ExecBG');
  context.subscriptions.push(commandOutput);
  context.subscriptions.push(
    vscode.commands.registerCommand('execbg.run', run));
}

export function deactivate() {
  runningProcesses.forEach((process) => {
    treeKill(process.pid, 'SIGTERM', function (err) {
      if (err) {
        treeKill(process.pid, 'SIGKILL');
      }
    });
  })
}
