import { AppContextProvider } from '@/context/AppContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import ChatConversation from './ChatConversation';
import ChooseWorkspace from './ChooseWorkspace';
import ErrorBoundary from './components/ErrorBoundry';
import Conversations from './Conversations';
import { Dashboard } from './Dashboard';
import Extensions from './Extensions';
import FlowEdit from './FlowEdit';
import { Integration } from './Integration';
import KnowledgeBase from './KnowledgeBase';
import KnowledgeBaseBoard from './KnowledgeBaseBoard';
import Playground from './Playground';
import Templates from './Templates';
import Workflow from './Workflow';

type Props = {};

export default function MainRouter({}: Props) {
	const { workspace } = useWorkspace();
	return !workspace ? (
		<ChooseWorkspace />
	) : (
		<ErrorBoundary>
			<AppContextProvider>
				<ReactFlowProvider>
					<HashRouter>
						<Routes>
							<Route path="/" element={<Dashboard />}>
								<Route index element={<Playground />} />
								<Route path="/workflows" element={<Workflow />} />

								<Route path="/workflow-edit/:workflowId" element={<FlowEdit />} />
								<Route path="/integration/:integrationId?" element={<Integration />}></Route>
								<Route path="/extensions" element={<Extensions />}></Route>
								<Route path="/chat" element={<Conversations />}>
									<Route path="/chat/:conversationId" element={<ChatConversation />} />
								</Route>
								<Route path="/knowledge-base/:id" element={<KnowledgeBase />} />
								<Route path="/knowledgeBaseBoard" element={<KnowledgeBaseBoard />} />
								<Route path="/templates" element={<Templates />} />
							</Route>
						</Routes>
					</HashRouter>
				</ReactFlowProvider>
			</AppContextProvider>
		</ErrorBoundary>
	);
}
