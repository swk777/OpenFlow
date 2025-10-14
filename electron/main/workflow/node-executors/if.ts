import { NodeletExecuteContext } from '../type';
enum ConditionMode {
	isEmpty = 'isEmpty',
	contains = 'contains',
	notContains = 'notContains',
}
export async function executeIf({ globalContext, nodeInputs, nodeConfig, setNodeContext }: NodeletExecuteContext) {
	console.log(`executing node current message: ${globalContext?.userInput}`);

	const { content } = nodeInputs;
	const { conditionMode, value } = nodeConfig;
	let conditionValue = false;
	switch (conditionMode) {
		case ConditionMode.isEmpty:
			conditionValue = content.trim() === '';
			break;
		case ConditionMode.contains:
			conditionValue = content.includes(value);
			break;
		case ConditionMode.notContains:
			conditionValue = !content.includes(value);
			break;
	}
	setNodeContext &&
		setNodeContext({
			conditionValue,
		});
}
