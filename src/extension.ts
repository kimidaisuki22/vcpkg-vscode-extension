// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { existsSync, writeFile, writeFileSync } from 'fs';
import * as vscode from 'vscode';
import { getVcpkgJsonContent } from './vcpkgJsonContent';
import axios from 'axios';
import { getVcpkgJsonPath, parseVcpkgJson, getVcpkgConfigurationKeyName, getVcpkgConfigurationJsonPath } from './getVcpkgJsonPath';
import { VcpkgPortProvider } from './vcpkgPortsProvider';
import { exec } from 'child_process';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vcpkg" is now active!');
	let addCommand = (name:string,callback: (...args: any[]) => any,thisArg?:any) =>{
		context.subscriptions.push(vscode.commands.registerCommand(name,callback,thisArg));
	};
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	addCommand('vcpkg.addDependency', () => {
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
	addCommand('vcpkg.initVcpkgJson', () => {
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



	addCommand('vcpkg.setVcpkgConfigureRemoteURL',()=>{
		vscode.window.showInputBox().then(input =>{
			if(!input){
				return;
			}

			context.globalState.update(getVcpkgConfigurationKeyName(),input);
		});
	});
	addCommand('vcpkg.downloadConfiguration',()=>{
		let dest = getVcpkgConfigurationJsonPath();
		if(!dest){
			vscode.window.showErrorMessage("please use it within a dir.");
			return;
		}
		let url:string | undefined = context.globalState.get(getVcpkgConfigurationKeyName());
		if(!url){
			vscode.window.showErrorMessage("remote url not set");
			return;
		}
		axios.get(url).then(resp=>{
			let result = JSON.stringify(resp.data,null,2);
			if(dest){
				writeFileSync(dest,result,null);
			}
		});
	});
	let externInstall = ()=>{
		let lines: string[] = [];
		exec('vcpkg install',(exception,out,err)=>{
			if(exception){
				vscode.window.showErrorMessage(exception.message);
			}
			if(err){
				vscode.window.showErrorMessage(err);
			}
			lines.push(out);
			vscode.window.showInformationMessage(out);
		});
	};
	addCommand('vcpkg.installPorts',()=>{
		let term = vscode.window.createTerminal("vcpkg");
		term.show();
		term.sendText("/home/node/app/vcpkg/vcpkg install");
	});
	addCommand("vcpkg.getInstallCMakes",()=>{
		externInstall();
	});

	const rootPath =
		vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
			? vscode.workspace.workspaceFolders[0].uri.fsPath
			: undefined;
	if (rootPath) {
		vscode.window.registerTreeDataProvider(
			'vcpkg-ports',
			new VcpkgPortProvider(rootPath)
		);
	}

}

// This method is called when your extension is deactivated
export function deactivate() { }
