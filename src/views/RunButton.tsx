import { IWorkflow, IWorkflowCategory } from '@/type/workflow';
import { Button, Drawer, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBrandHipchat, IconPlayerPlay } from '@tabler/icons-react';
import { useState } from 'react';
import ChatWorkflow from './ChatWorkflow';
import RunAutomation from './RunAutomation';

type Props = { category: IWorkflowCategory; workflow: IWorkflow };

export default function RunButton({ category, workflow }: Props) {
	const [chatOpened, setChatOpened] = useState(false);
	const [inputsModalOpened, { open, close }] = useDisclosure(false);
	return (
		<>
			<Button
				size="sm"
				className="h-7 gap-1"
				onClick={() => {
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
			<Modal opened={inputsModalOpened} size="lg" onClose={close} title="Run Automation">
				<RunAutomation workflow={{ ...workflow }} />
			</Modal>
		</>
	);
}
