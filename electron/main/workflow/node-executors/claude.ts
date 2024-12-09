import Anthropic from '@anthropic-ai/sdk';
import ExecutionError from '../../error/ExecutionError';
import { NodeletExecuteContext } from '../type';
import { getContextPrompt } from '../utils';

export async function executeClaude({
	nodeContext = {},
	nodeConfig,
	node,
	integrationConfig,
	nodeInputs,
	globalContext,
	setNodeContext,
}: NodeletExecuteContext) {
	const { context = [], query = '' } = nodeInputs as { context: any[]; query: string | string[] };
	const { model, systemPrompt, temperature, contextCount, prompt = '${query}' } = nodeConfig;
	const { messages = [] } = nodeContext;
	const combinedContext = Array.isArray(context) ? context.join('') : context;

	// Claude client setup
	if (!integrationConfig.apiKey) {
		throw new ExecutionError(node.id, 'Claude API key is required');
	}
	const anthropic = new Anthropic({
		apiKey: integrationConfig.apiKey,
	});

	const { variables } = globalContext;
	const replacedSystemPrompt = systemPrompt && systemPrompt.replace(/{(.*?)}/g, (match, key) => variables[key.trim()] || match);

	if (typeof query === 'string') {
		const queryVariables = { ...variables, query };
		const queryContent = prompt.replace(/{(.*?)}/g, (match, key) => queryVariables[key.trim()] || match);
		messages.push({
			role: 'user',
			content: context.length ? getContextPrompt(combinedContext, queryContent) : queryContent,
		});

		// Format messages for Claude
		const completeMessages = messages.filter((message) => message.role !== 'system').slice(-(parseInt(contextCount) * 2 + 1));
		let messageContent = '';
		if (replacedSystemPrompt) {
			messageContent += `System: ${replacedSystemPrompt}\n\n`;
		}
		completeMessages.forEach((msg) => {
			messageContent += `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}\n\n`;
		});

		const completion = await anthropic.messages.create({
			messages: [{ role: 'user', content: messageContent }],
			model: model,
			temperature: parseFloat(temperature),
			max_tokens: 4096,
		});

		const returnMessage = { role: 'assistant', content: completion.content };
		completeMessages.push(returnMessage);
		console.log(returnMessage);
		setNodeContext &&
			setNodeContext({
				...nodeContext,
				messages: completeMessages,
				outputs: { answer: returnMessage.content[0].type === 'text' ? returnMessage.content[0].text : '' },
			});
	} else if (Array.isArray(query) && query.length > 0) {
		const returnCompletions = await Promise.all(
			query.map(async (item) => {
				const queryVariables = { ...variables, query: item };
				const queryContent = prompt.replace(/{(.*?)}/g, (match, key) => queryVariables[key.trim()] || match);
				let messageContent = '';

				if (replacedSystemPrompt) {
					messageContent += `System: ${replacedSystemPrompt}\n\n`;
				}
				messageContent += `Human: ${context.length ? getContextPrompt(combinedContext, queryContent) : queryContent}`;

				return anthropic.messages.create({
					messages: [{ role: 'user', content: messageContent }],
					model: model,
					temperature: parseFloat(temperature),
					max_tokens: 4096,
				});
			}),
		);

		const returnMessages = returnCompletions.map((complete) => complete.content).join('');

		setNodeContext &&
			setNodeContext({
				...nodeContext,
				outputs: { answer: returnMessages || '' },
			});
	}
}
