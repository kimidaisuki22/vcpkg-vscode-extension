// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { existsSync, readFileSync, writeFile, writeFileSync } from 'fs';
import * as vscode from 'vscode';
import { getVcpkgJsonContent } from './vcpkgJsonContent';

class VcpkgDependency{

};
class VcpkgManifest{
	name!: string;
	dependencies!:Array<VcpkgDependency|string>;
};

function getVcpkgJsonPath() {
	let folders = vscode.workspace.workspaceFolders;
	if (!folders) {
		return null;
	}
	let path = folders[0].uri.fsPath;

	let vcpkgJsonPath = path + "/vcpkg.json";
	return vcpkgJsonPath;
}
function parseVcpkgJson(path: string | null):VcpkgManifest | null {
	if (!path) {
		return null;
	}
	let rawContent = readFileSync(path);
	if (!rawContent) {
		return null;
	}
	return JSON.parse(rawContent.toString());
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vcpkg" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vcpkg.addDependency', () => {
		let path = getVcpkgJsonPath();
		if (!path) {
			return;
		}
		let jsonContent = parseVcpkgJson(path);
		if (!jsonContent) {
			vscode.window.showErrorMessage("failed to parse vcpkg.json");
			return;
		}
		vscode.window.showInputBox().then(dep => {
			if (!dep || !jsonContent) {
				return;
			}
			let deps = jsonContent["dependencies"];
			deps.push(dep);
			// false-positive error of TS
			if (path) {
				writeFile(path, JSON.stringify(jsonContent,null,2), () => { });
			}
		});
	});
	let disposable2 = vscode.commands.registerCommand('vcpkg.initVcpkgJson', () => {
		let vcpkgJsonPath = getVcpkgJsonPath();
		if (vcpkgJsonPath) {
			vscode.window.showInformationMessage(`Working with ${vcpkgJsonPath}`);
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
