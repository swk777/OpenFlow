import { Nodelet } from '@/type/nodelet';
import { WorkflowCategory } from './../type/nodelet';

export function getNodeletsByCategory(nodelets: Nodelet[], category: WorkflowCategory) {
	switch (category) {
		case WorkflowCategory.All:
			return nodelets;
		case WorkflowCategory.Automation:
			return nodelets.filter((nodelet) => [WorkflowCategory.Automation, WorkflowCategory.All].includes(nodelet.workflowCategory));
		case WorkflowCategory.Chatbot:
			return nodelets.filter((nodelet) => [WorkflowCategory.Chatbot, WorkflowCategory.All].includes(nodelet.workflowCategory));
		default:
			return nodelets;
	}
}
