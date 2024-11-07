import fs from 'node:fs';
import vm from 'node:vm';
import { NodeletExecuteContext } from '../type';

export function executeCustom(context: NodeletExecuteContext) {
	const userCode = fs.readFileSync(context.nodelet?.codePath, 'utf8');

	const sandbox = { execute: null };
	vm.createContext(sandbox);
	
	const script = new vm.Script(userCode);
	script.runInContext(sandbox);
	sandbox.execute(context);
}
