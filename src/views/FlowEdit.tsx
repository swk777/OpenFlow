import { IconBrandHipchat, IconCheck, IconDeviceFloppy, IconPencil, IconPlayerPlay } from '@tabler/icons-react';
import { useContext, useMemo, useState } from 'react';

import { useEdgesState, useNodesState, useReactFlow } from 'reactflow';

import { getInitialWorkflow } from '@/constants/workflow';
import { AppContext } from '@/context/AppContext';
import { IWorkflow, IWorkflowCategory } from '@/type/workflow';
import { getNodeletsByCategory } from '@/utils/workflow';
import { Button, Divider, Drawer, Flex, FocusTrap, Group, Modal, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useParams, useSearchParams } from 'react-router-dom';
import 'reactflow/dist/style.css';
import ChatWorkflow from './ChatWorkflow';
import NodeletsBar from './NodeletsBar';
import RunAutomation from './RunAutomation';
import WorkflowEdit from './WorkflowEdit';

function FlowEdit() {
	const { workflowId = '' } = useParams();
	let [searchParams] = useSearchParams();

	const [inputsModalOpened, { open, close }] = useDisclosure(false);
	const { getEdges, getNodes } = useReactFlow();
	const { nodelets, workflows, updateWorkflow, integrations, refreshWorkflows } = useContext(AppContext);
	const workflow = workflows.find((w) => w.id === workflowId) || getInitialWorkflow(workflowId);
	const category = (searchParams.get('category') ?? workflow.category) as IWorkflowCategory;
	const [nodes] = useNodesState(workflow?.data?.nodes || []);
	const [edges] = useEdgesState(workflow?.data?.edges || []);
	const [isEditingName, setIsEditingName] = useState(false);
	const [chatOpened, setChatOpened] = useState(false);

	const [workflowName, setWorkflowName] = useState(workflow?.name);
	const workflowNodelets = useMemo(() => getNodeletsByCategory(nodelets, category), [nodelets, category]);

	return (
		<Flex className="flex-col flex-1">
			<Flex className="flex-row justify-between mx-10 my-5 align-middle">
				<Group>
					{isEditingName ? (
						<FocusTrap active={isEditingName}>
							<TextInput
								size="xs"
								value={workflowName}
								onChange={(e) => setWorkflowName(e.target.value)}
								onBlur={() => {
									setIsEditingName(false);
								}}
							></TextInput>
						</FocusTrap>
					) : (
						<div>{workflowName}</div>
					)}
					<IconPencil
						className="text-primary h-4 cursor-pointer"
						onClick={() => {
							setIsEditingName(true);
						}}
					/>
				</Group>
				<Flex direction={'row'} gap="md">
					<Button
						size="sm"
						className="h-7 gap-1"
						onClick={() => {
							updateWorkflow &&
								updateWorkflow(workflowId, {
									...workflow,
									name: workflowName,
									data: { nodes: getNodes(), edges: getEdges() },
									category,
								} as IWorkflow).then(() => {
									refreshWorkflows();
									notifications.show({
										title: 'Save Successfully',
										message: '',
										icon: <IconCheck />,
										color: 'teal',
										autoClose: 1000,
									});
								});
						}}
					>
						<IconDeviceFloppy className="h-3.5 w-3.5" />
						<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Save</span>
					</Button>
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
							<IconBrandHipchat className="h-3.5 w-3.5" />
						) : (
							<IconPlayerPlay className="h-3.5 w-3.5" />
						)}
						<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">{category === IWorkflowCategory.Chatbot ? 'Chat' : 'Run'}</span>
					</Button>
				</Flex>
			</Flex>
			<Divider />
			<div className="flex flex-1 relative">
				<NodeletsBar nodelets={workflowNodelets} />
				<Divider orientation="vertical" />
				<WorkflowEdit workflowId={workflowId} />
				<Modal opened={inputsModalOpened} size="lg" onClose={close} title="Run Automation">
					<RunAutomation workflow={{ ...workflow, data: { nodes, edges } }} />
				</Modal>
			</div>
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
							data: { nodes: getNodes(), edges: getEdges() },
						} as IWorkflow
					}
				/>
			</Drawer>
		</Flex>
	);
}

export default FlowEdit;
