import { NodeletExecuteContext } from '../type';

export async function executeUserInput({ nodeId, globalContext, setNodeContext, setGlobalContext }: NodeletExecuteContext) {
	console.log(`executing node ${nodeId}, current message: ${globalContext?.userInput}`);
	setNodeContext &&
		setNodeContext({
			outputs: { query: globalContext?.userInput },
		});
}
