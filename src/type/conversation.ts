export interface IConversation {
	sessionId: string;
	createDate: string;
	name: string;
	updateDate: string;
	workflowId: string;
	nodeContext: {
		[id: string]: any;
	};
	globalContext: any;
}
