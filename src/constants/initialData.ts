import { Integrations } from './integrations';
import { KnowledgeBases } from './knowledgeBase';
import { Nodelets } from './nodelets';
import { Templates } from './templates';

export const DefaultData = {
	integrations: Integrations,
	knowledgeBases: KnowledgeBases,
	conversations: [],
	workflows: [],
	nodelets: Nodelets,
	settings: { playgroundModel: 'gpt-5' },
	executions: [],
	extensions: [],
	templates: Templates,
};
