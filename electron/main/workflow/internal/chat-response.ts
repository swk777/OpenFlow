import { NodeletExecuteContext } from '../type';

export async function executeChatResponse({ nodeInputs, globalContext, setGlobalContext }: NodeletExecuteContext) {
	const { output } = nodeInputs as { output: string };
	setGlobalContext &&
		setGlobalContext({
			...globalContext,
			latestMessage: output,
			messages: globalContext.messages.concat([output]),
		});
}
