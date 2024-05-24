export interface IExecution {
	executionId: string;
	createDate: string;
	updateDate: string;
	workflowId: string;
	nodeContext: {
		[id: string]: any;
	};
	globalContext: {
		[id: string]: any;
	};
}
export interface IConversation {
	sessionId: string;
	name: string;
	workflowId: string;
	executions: IExecution[];
	conversationContext: {
		messages: string[];
		currentMessage: string;
	};
}
