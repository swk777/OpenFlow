import { tavily } from '@tavily/core';
import { NodeletExecuteContext } from '../type';

export async function executeSearch({ globalContext, nodeInputs, nodeConfig, integrationConfig, setNodeContext }: NodeletExecuteContext) {
	console.log(`executing node current message: ${globalContext?.userInput}`);

	const { inputText } = nodeInputs;
	const { assemble } = nodeConfig;
	const tvly = tavily({ apiKey: integrationConfig?.apiKey ?? '' });
	const response = await tvly.search(assemble.replace('{query}', inputText));
	setNodeContext &&
		setNodeContext({
			outputs: { searchResults: response.results.map((res) => res.content).join(' ') },
		});
}
