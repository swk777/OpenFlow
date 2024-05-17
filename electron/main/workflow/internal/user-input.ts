import { NodeletExecuteContext } from '../type';

export async function executeUserInput({ nodeId, globalContext, setNodeContext, setGlobalContext }: NodeletExecuteContext) {
	console.log(`executing node ${nodeId}, current message: ${globalContext?.currentMessage}`);
	setNodeContext &&
		setNodeContext({
			outputs: { query: globalContext?.currentMessage },
		});
	setGlobalContext &&
		setGlobalContext({
			...globalContext,
			messages: globalContext.messages.concat([globalContext?.currentMessage]),
		});
}
