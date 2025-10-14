import { NodeletExecuteContext } from '../type';

export async function executeFileInput({ globalContext, setNodeContext, nodeConfig }: NodeletExecuteContext) {
	console.log(`executing node , current message: ${globalContext?.userInput}`);
	console.log(nodeConfig);
	setNodeContext &&
		setNodeContext({
			outputs: { filePath: nodeConfig?.file },
		});
}
