import { AppContext } from '@/context/AppContext';
import { IWorkflow, IWorkflowCategory } from '@/type/workflow';
import { getNodeletsByCategory } from '@/utils/workflow';
import { Divider } from '@mantine/core';
import { useContext, useMemo } from 'react';
import NodeletsBar from './NodeletsBar';
import WorkflowEdit from './WorkflowEdit';

interface WorkflowEditSectionProps {
	category: IWorkflowCategory;
	workflow: IWorkflow;
	onWorkflowChange: (workflow: IWorkflow) => void;
}

function WorkflowEditSection({ category, workflow, onWorkflowChange }: WorkflowEditSectionProps) {
	const { nodelets } = useContext(AppContext);
	const workflowNodelets = useMemo(() => getNodeletsByCategory(nodelets, category), [nodelets, category]);

	return (
		<div className="flex flex-1 relative">
			<NodeletsBar nodelets={workflowNodelets} />
			<Divider orientation="vertical" />
			<WorkflowEdit workflow={workflow} workflowId={workflow.id} onWorkflowChange={onWorkflowChange} />
		</div>
	);
}

export default WorkflowEditSection;
