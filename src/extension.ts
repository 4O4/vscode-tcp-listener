'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as isNumber from 'is-number';
import { Listener } from './listener';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "tcp-listener" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('tcpListener.startServer', () => {
        // The code you place here will be executed every time your command is executed

        let validatePort = (value: string) => {
            if (isNumber(value)) {
                let port = new Number(value);

                if (port >= 1 && port <= 65536) {
                    return "";
                }
            }

            return "Port must be an integer between 1 and 65536";
        }
        
        vscode.window.showInputBox({
            prompt: "TCP port to start listening on",
            value: "2723",
            validateInput: validatePort
        }).then((value) => {
            let validationMsg = validatePort(value);

            if (validationMsg.length > 0) {
                vscode.window.showErrorMessage(`Unable to start server. ${validationMsg}`);
            } else {
                let port: number = +value;
                let listener: Listener;

                vscode.workspace.openTextDocument({ language: "text" }).then((document) => {
                    vscode.workspace.onDidCloseTextDocument(closedDocument => {
                        if (listener && closedDocument === document) {
                            listener.kill();
                        }
                    });
                    vscode.window.showTextDocument(document).then(editor => {
                        listener = new Listener(editor, port, "0.0.0.0");
                    });
                });
            }
        });
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}