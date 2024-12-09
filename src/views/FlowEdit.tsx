import { IconCheck, IconDeviceFloppy, IconPencil } from '@tabler/icons-react';
import { useContext, useState } from 'react';

import { useReactFlow } from 'reactflow';

import { getInitialWorkflow } from '@/constants/workflow';
import { AppContext } from '@/context/AppContext';
import { IWorkflow, IWorkflowCategory } from '@/type/workflow';
import { Button, Divider, Flex, FocusTrap, Group, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useParams, useSearchParams } from 'react-router-dom';
import 'reactflow/dist/style.css';
import RunButton from './RunButton';
import WorkflowEditSection from './WorkflowEditSection';

function FlowEdit() {
	const { workflowId = '' } = useParams();
	let [searchParams] = useSearchParams();

	const { getEdges, getNodes } = useReactFlow();
	const { workflows, updateWorkflow, refreshWorkflows } = useContext(AppContext);
	const wf = workflows.find((w) => w.id === workflowId) || getInitialWorkflow(workflowId);
	const [workflow, setWorkflow] = useState(wf);
	const category = (searchParams.get('category') ?? workflow.category) as IWorkflowCategory;
	const [isEditingName, setIsEditingName] = useState(false);

	const [workflowName, setWorkflowName] = useState(workflow?.name);

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
					<RunButton category={category} workflow={{ ...workflow, data: { nodes: workflow.data.nodes, edges: workflow.data.edges } }} />
				</Flex>
			</Flex>
			<Divider />
			<WorkflowEditSection category={category} workflow={workflow} onWorkflowChange={setWorkflow} />
		</Flex>
	);
}

export default FlowEdit;
