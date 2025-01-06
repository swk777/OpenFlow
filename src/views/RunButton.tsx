import { AppContext } from '@/context/AppContext';
import { IWorkflow, IWorkflowCategory } from '@/type/workflow';
import { getMissIntegrations } from '@/utils/utils';
import { Button, Drawer, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBrandHipchat, IconPlayerPlay } from '@tabler/icons-react';
import { useContext, useState } from 'react';
import ChatWorkflow from './ChatWorkflow';
import IntegrationComplement from './IntegrationComplement';
import RunAutomation from './RunAutomation';

type Props = { category: IWorkflowCategory; workflow: IWorkflow };

export default function RunButton({ category, workflow }: Props) {
	const [chatOpened, setChatOpened] = useState(false);
	const { integrations } = useContext(AppContext);
	const [inputsModalOpened, { open, close }] = useDisclosure(false);
	const [integrationModalOpened, { open: openIntegrationModal, close: closeIntegrationModal }] = useDisclosure(false);
	const missIntegrations = getMissIntegrations(workflow.data.nodes, integrations);

	return (
		<>
			<Button
				size="sm"
				className="h-7 gap-1"
				onClick={() => {
					if (missIntegrations.length > 0) {
						openIntegrationModal();
						return;
					}
					if (category === IWorkflowCategory.Chatbot) {
						setChatOpened(true);
					} else {
						open();
					}
				}}
			>
				{category === IWorkflowCategory.Chatbot ? (
					<IconBrandHipchat className="h-3.5 w-3.5 mr-1" />
				) : (
					<IconPlayerPlay className="h-3.5 w-3.5 mr-1" />
				)}
				<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">{category === IWorkflowCategory.Chatbot ? 'Chat' : 'Run'}</span>
			</Button>
			<Drawer
				opened={chatOpened}
				onClose={() => {
					setChatOpened(false);
				}}
				title="Chat"
				position="right"
				withOverlay={false}
				size="sm"
				styles={{
					inner: { right: 0, margin: '0.8rem' },
				}}
			>
				<ChatWorkflow
					workflow={
						{
							...workflow,
						} as IWorkflow
					}
				/>
			</Drawer>
			<Modal opened={integrationModalOpened} size="lg" onClose={closeIntegrationModal} title="Complete Integrations">
				<IntegrationComplement
					integrations={[...missIntegrations]}
					onSave={() => {
						closeIntegrationModal();
					}}
				/>
			</Modal>
			<Modal opened={inputsModalOpened} size="lg" onClose={close} title="Run Automation">
				<RunAutomation workflow={{ ...workflow }} />
			</Modal>
		</>
	);
}
