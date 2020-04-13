import * as vscode from 'vscode';
import { spawn, ChildProcess, SpawnOptions } from 'child_process';
import treeKill from 'tree-kill';

const runningProcesses: ChildProcess[] = [];
let commandOutput = null;

function runCommand(args: any[]) {
  const opts: SpawnOptions = {
    cwd: vscode.workspace.rootPath,
  };
  const cmd = args[0];
  const process = spawn(cmd, args.slice(1), opts);
  commandOutput.appendLine(`> Running command \`${cmd}\`...`)
  function printOutput(data) { commandOutput.append(data.toString()); }
  process.stdout.on('data', printOutput);
  process.stderr.on('data', printOutput);
  process.on('close', (status) => {
    if (status === 0) {
      commandOutput.appendLine(`> Command ${cmd} ran successfully.`);
    } else {
      commandOutput.appendLine(`> ERROR: Command ${cmd} exited with status code ${status}.`);
    }
  });
  runningProcesses.push(process);
}

export function activate(context: vscode.ExtensionContext) {
  commandOutput = vscode.window.createOutputChannel('ExecBG');
  context.subscriptions.push(commandOutput);
  context.subscriptions.push(
    vscode.commands.registerCommand('execbg.runCommand', runCommand));
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
