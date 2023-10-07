import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {getVcpkgJsonPath, parseVcpkgJson,VcpkgDependency} from './getVcpkgJsonPath';

export class VcpkgPortProvider implements vscode.TreeDataProvider<Port>{
    constructor(private workspaceRoot: string) {}

    getTreeItem(element: Port): vscode.TreeItem {
      return element;
    }

    getChildren(element?: Port): Thenable<Port[]> {
      if (!this.workspaceRoot) {
        vscode.window.showInformationMessage('No port in empty workspace');
        return Promise.resolve([]);
      }

      if (element) {
        return Promise.resolve(
          this.getDepsInPackageJson(
            path.join(this.workspaceRoot, 'node_modules', element.name, 'package.json')
          )
        );
      } else {
        const packageJsonPath = getVcpkgJsonPath(this.workspaceRoot);
        if(!packageJsonPath){
            return Promise.resolve([]);
        }
        if (this.pathExists(packageJsonPath)) {
          return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
        } else {
          vscode.window.showInformationMessage('Workspace has no vcpkg.json');
          return Promise.resolve([]);
        }
      }
    }

  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  private getDepsInPackageJson(packageJsonPath: string): Port[] {
    if (this.pathExists(packageJsonPath)) {
      const toDep = (moduleName: string, version: string): Port => {

          return new Port(moduleName, version, vscode.TreeItemCollapsibleState.None);

      };

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      const deps = packageJson.dependencies
        ? packageJson.dependencies.map((dep: any) =>{
            let name = dep.name ? dep.name : dep;
            return toDep(name, "");
        }
          )
        : [];

      return deps ;
    } else {
      return [];
    }
  }

private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
  }
}

class Port extends vscode.TreeItem {
  constructor(
    public  name: string,
    private version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(name, collapsibleState);
    this.tooltip = `${this.name}-${this.version}`;
    this.description = this.version;
  }

  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
  };
}
