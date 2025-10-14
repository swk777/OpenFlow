import { InternalNodelets } from '@/constants/nodelets';
import { IExecution } from '@/type/conversation';
import { IDAGNode } from '@/type/dag';
import { INodelet } from '@/type/nodelet';
import { InputsObject } from './type';

export const getNodeInputObj = (node: IDAGNode, nodelet: INodelet, execution: IExecution) => {
	const inputsObj: InputsObject = {};
	if ((nodelet?.inputs || []).length === 0) return {};
	nodelet?.inputs.forEach((input) => {
		const { sourceHandle, id = '' } = node.sourceNodes.find((n) => n.targetHandle === input.id) || {};
		const sourceOutput = execution.nodeContext[id]?.outputs?.[sourceHandle!];
		if (sourceOutput !== undefined) {
			inputsObj[input.id] = sourceOutput;
		}
	});
	return inputsObj;
};

export const getContextPrompt = (contextStr: string, queryStr: string) => `Context information is below. \n
    --------------------- 
    ${contextStr} 
    \n---------------------\n 
    Given the context information and not prior knowledge, 
    answer the question: ${queryStr}\n`;

export const checkConditionNode = (node: IDAGNode) => node.data.nodeletId === InternalNodelets.If;
