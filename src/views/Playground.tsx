import { AppContext } from '@/context/AppContext';
import InternalNode from '@/node/InternalNode';
import { IWorkflow } from '@/type/workflow';
import { Button, Center, Divider, Flex, Group, Loader, Paper, Select, SelectProps, Text, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconPencil, IconSend, IconSettings } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import RunButton from './RunButton';

const nodeTypes = { internalNodelet: InternalNode };
export default function Playground() {
	const { settings, integrations, updateWorkflow, refreshSettings, generateWorkflowByAI } = useContext(AppContext);

	const navigate = useNavigate();
	const { playgroundModel = 'gpt-4o' } = settings;
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [prompt, setPrompt] = useState('');
	const [workflow, setWorkflow] = useState<IWorkflow>();

	const handleSubmit = async () => {
		if (!prompt.trim()) return;
		setIsLoading(true);
		let modelResponse = '';
		try {
			modelResponse = await generateWorkflowByAI(prompt, playgroundModel);
		} catch (error) {
			notifications.show({
				title: error.message,
				message: '',
				color: 'red',
			});
			console.log(error);
		}
		setIsLoading(false);
		setIsSubmitted(true);
		if (modelResponse) {
			const wf = JSON.parse(modelResponse);
			setWorkflow(wf);
		}
	};

	const iconProps = {
		stroke: 1.5,
		color: 'currentColor',
		size: 13,
	};
	const settingIconProps = {
		className: 'hover:text-blue-600',
		onClick: (e) => {
			e.stopPropagation();
			navigate(`/integration/${e.target.dataset.id}`);
		},
	};
	const icons: Record<string, React.ReactNode> = {
		'gpt-4o': <IconSettings {...iconProps} {...settingIconProps} data-id="OpenAI" />,
		'claude-3-5-sonnet-latest': <IconSettings {...iconProps} {...settingIconProps} data-id="Claude" />,
	};

	const renderSelectOption: SelectProps['renderOption'] = ({ option, checked }) => (
		<Flex flex="1" gap="xs" align="end" justify="space-between">
			<Group gap={2}>
				<Text size="xs" className="text-gray-600">
					{option.label}
				</Text>
				{checked && <IconCheck {...iconProps} className="text-blue-600" />}
			</Group>
			{icons[option.value]}
		</Flex>
	);

	return (
		<Flex
			className={`flex-1 justify-center transition-all  bg-gradient-to-br from-blue-50 to-purple-50 ${isSubmitted ? 'pt-10' : 'pt-60'}`}
		>
			<div className="flex flex-col max-w-3xl gap-4 mx-5 flex-1">
				<div className={`transition-all duration-500 ${isSubmitted ? '' : 'mb-40'}`}>
					<Textarea
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						placeholder="Enter your prompt..."
						className="flex-1 transition-all hover:shadow-lg"
						size="lg"
						radius="md"
						styles={{
							input: {
								'&:focus': {
									borderColor: '#4C6EF5',
									boxShadow: '0 0 0 2px rgba(76, 110, 245, 0.2)',
								},
							},
						}}
						rightSection={
							<Flex direction={'column'} gap={0} align={'bottom'}>
								<Button radius="md" size="lg" variant="transparent" className="h-8 outline-none border-none " onClick={handleSubmit}>
									{isLoading ? <Loader size={22} /> : <IconSend size={26} />}
								</Button>
								<Select
									variant="unstyled"
									className="transform scale-75 text-gray-500"
									placeholder="model"
									value={playgroundModel}
									allowDeselect={false}
									styles={{
										input: { textAlign: 'center', opacity: '0.7' },
									}}
									onChange={(value) => {
										window.ipcRenderer.saveSettings({ ...settings, playgroundModel: value }).then(() => {
											refreshSettings();
										});
									}}
									data={[
										{ value: 'claude-3-5-sonnet-latest', label: 'claude-3.5-sonnet' },
										{ value: 'gpt-4o', label: 'gpt-4o' },
									]}
									size="xs"
									w="134"
									comboboxProps={{
										transitionProps: { transition: 'pop', duration: 200 },
										zIndex: 1000,
										width: 170,
									}}
									renderOption={renderSelectOption}
								/>
							</Flex>
						}
						rightSectionProps={{ className: 'mr-4 mt-5 w-16' }}
					/>
				</div>
				{isSubmitted && workflow && (
					<Paper shadow="sm" radius="md" p="md" className="animate-fadeIn flex flex-col flex-1 mb-6 relative">
						<Group className="flex-center bg-white " gap="xl">
							<Button
								variant="default"
								size="sm"
								className="h-7 gap-1"
								onClick={async () => {
									const workflowId = uuidv4();
									await updateWorkflow(workflowId, {
										...workflow,
										id: workflowId,
										lastModified: format(new Date(), 'yyyy-MM-dd hh:mm a'),
									} as IWorkflow);

									navigate(`/workflow-edit/${workflowId}?category=${workflow.category}`);
								}}
							>
								<IconPencil className="h-3.5 w-3.5 mr-1" />
								Edit
							</Button>
							<RunButton category={workflow.category} workflow={workflow} />
						</Group>
						<Divider my="md" />
						<Center className="flex flex-1">
							<ReactFlow
								nodes={workflow?.data.nodes.map((node) => {
									return {
										...node,
										type: 'internalNodelet',
										data: {
											...node.data,
										},
									};
								})}
								edges={workflow?.data.edges}
								className="flex-1 min-h-20"
								nodeTypes={nodeTypes}
								defaultViewport={{ x: 100, y: 0, zoom: 0.8 }}
							>
								<MiniMap />
								<Controls />
								<Background />
							</ReactFlow>
						</Center>
					</Paper>
				)}
			</div>
		</Flex>
	);
}
