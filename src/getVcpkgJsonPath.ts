import { readFileSync } from 'fs';
import * as vscode from 'vscode';

export class VcpkgDependency {
}
;
export class VcpkgManifest {
	name!: string;
	dependencies!: Array<VcpkgDependency | string>;
}
;
function getWorkDir() {
	let folders = vscode.workspace.workspaceFolders;
	if (!folders) {
		return null;
	}
	let path = folders[0].uri.fsPath;
	return path;
}
export function getVcpkgJsonPath(root: string | null = getWorkDir()) {
	if (!root) {
		return null;
	}
	let path = root;

	let vcpkgJsonPath = path + "/vcpkg.json";
	return vcpkgJsonPath;
}
export function getVcpkgConfigurationJsonPath() {
	let root = getWorkDir();
	if (!root) {
		return null;
	}
	return root + "/vcpkg-configuration.json";
}
export function getVcpkgConfigurationKeyName() {
	return "VcpkgConfigureRemoteURL";
}
export function parseVcpkgJson(path: string | null): VcpkgManifest | null {
	if (!path) {
		return null;
	}
	let rawContent = readFileSync(path);
	if (!rawContent) {
		return null;
	}
	return JSON.parse(rawContent.toString());
}
