import { NodeletExecuteContext } from '../type';

export async function executeTextInput({ nodeId, globalContext, setNodeContext, nodeContext }: NodeletExecuteContext) {
	console.log(`executing node ${nodeId}, current message: ${globalContext?.userInput}`);
	setNodeContext &&
		setNodeContext({
			outputs: { output: nodeContext?.text },
		});
}
