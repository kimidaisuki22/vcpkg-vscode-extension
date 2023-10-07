// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { existsSync, writeFile } from 'fs';
import * as vscode from 'vscode';
import { getVcpkgJsonContent } from './vcpkgJsonContent';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vcpkg" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vcpkg.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from vcpkg!');
	});
	let disposable2 = vscode.commands.registerCommand('vcpkg.initVcpkgJson', () => {

		let folders = vscode.workspace.workspaceFolders;
		if (folders) {
			let path = folders[0].uri.fsPath;
			vscode.window.showInformationMessage(`Working on ${folders[0].uri.fsPath}`);
			let vcpkgJsonPath = path + "/vcpkg.json";
			if (existsSync(vcpkgJsonPath)) {
				vscode.window.showInformationMessage("vcpkg.json already exists.");
			} else {
				writeFile(vcpkgJsonPath, getVcpkgJsonContent(), () => { });
				vscode.window.showInformationMessage("vcpkg.json has been created.");
			}
		} else {
			vscode.window.showErrorMessage("This function should used under a folder");
		}
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() { }
