import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import vm from 'node:vm';
import { NodeletExecuteContext } from '../type';

export async function executeCustom(context: NodeletExecuteContext) {
	const userCode = fs.readFileSync(context.nodelet?.codePath, 'utf8');
	const __dirname = path.dirname(new URL(import.meta.url).pathname);
	const nodeRequire = createRequire(import.meta.url);

	const sandbox = {
		require: (modulePath: string) => {
			// Support loading built-in modules (like 'fs', 'path')
			try {
				return nodeRequire(modulePath);
			} catch (e) {
				// Support loading relative path modules (resolve based on actual path)
				const fullPath = path.resolve(__dirname, modulePath);
				return nodeRequire(fullPath);
			}
		},
		module: { exports: {} },
		exports: {},
		globalVariables: { workspacePath: globalThis.workspacePath },
		// Optional: Inject other needed global variables (like console)
		console: console,
		process: process,
		__dirname: __dirname,
		global: global,
		Buffer: Buffer,
		URL: URL,
		clearTimeout: clearTimeout,
		TextEncoder: TextEncoder,
		ReadableStream: ReadableStream,
		Blob: Blob,
		URLSearchParams: URLSearchParams,
		AbortSignal: AbortSignal,
		MessagePort: MessagePort,
		TextDecoder: TextDecoder,
		performance: performance,
		Event: Event,
		EventTarget: EventTarget,
		DOMException: DOMException,
		queueMicrotask: queueMicrotask,
		setTimeout: setTimeout,
		clearImmediate: clearImmediate,
	};

	vm.createContext(sandbox);
	const script = new vm.Script(userCode);
	script.runInContext(sandbox);

	const execute = sandbox.module.exports;

	// Handle async or sync function execution
	try {
		// @ts-ignore
		let result;
		if (context.nodelet?.isAsync) {
			// If the executed function returns a Promise, await it
			// @ts-ignore
			result = await execute(context);
		} else {
			// @ts-ignore
			result = await Promise.resolve(execute(context));
		}
	} catch (error) {
		console.error('Error executing user code:', error);
		throw error;
	}
}
