import { getInitialWorkflow } from '@/constants/workflow';
import { AppContext } from '@/context/AppContext';
import { WorkflowContextProvider } from '@/context/WorkflowContext';
import useValidate from '@/hooks/useValidate';
import Configuration from '@/node/config/Configuration';
import InternalNode from '@/node/InternalNode';
import { buildDefaultConfig } from '@/utils/utils';
import { ActionIcon, Drawer, TextInput } from '@mantine/core';
import { IconRobot } from '@tabler/icons-react';
import { MouseEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
	addEdge,
	Background,
	Connection,
	Controls,
	Edge,
	MiniMap,
	Node,
	ReactFlowInstance,
	useEdgesState,
	useNodesState,
} from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

type Props = { workflowId: string };
const nodeTypes = { internalNodelet: InternalNode };

export default function WorkflowEdit({ workflowId }: Props) {
	const { nodelets, workflows, integrations } = useContext(AppContext);
	const workflow = workflows.find((w) => w.id === workflowId) || getInitialWorkflow(workflowId);

	const [nodes, setNodes, onNodesChange] = useNodesState(workflow?.data?.nodes || []);
	const [edges, setEdges, onEdgesChange] = useEdgesState(workflow?.data?.edges || []);
	const reactFlowWrapper = useRef(null);

	const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance>();

	const [aiPrompt, setAiPrompt] = useState('');
	const [selectedNode, setSelectedNode] = useState<Node>();
	const [showAiInput, setShowAiInput] = useState(false);
	const [configOpened, setConfigOpened] = useState(false);
	const integration = integrations.find((intgn) => intgn.id === selectedNode?.data.nodeletId);
	const validatesResult = useValidate(nodes, nodelets, integrations);
	const [inputWidth, setInputWidth] = useState('40px');
	const selectedNodelet = useMemo(() => nodelets.find((nodelet) => nodelet.id === selectedNode?.data.nodeletId), [selectedNode]);

	const onDrop: React.DragEventHandler<HTMLDivElement> = useCallback(
		(event) => {
			event.preventDefault();
			const nodeletId = event.dataTransfer.getData('application/reactflow');
			if (typeof nodeletId === 'undefined' || !nodeletId) {
				return;
			}
			const nodelet = nodelets.find((n) => n.id === nodeletId);
			if (!nodelet) {
				return;
			}
			const position =
				reactFlowInstance &&
				reactFlowInstance.screenToFlowPosition({
					x: event.clientX,
					y: event.clientY,
				});
			const newNode = {
				id: uuidv4(),
				type: 'node',
				position,
				data: {
					label: nodelet.name,
					nodeletId,
					config: buildDefaultConfig(nodelet),
				},
			};
			setNodes((nds) => nds.concat(newNode as Node));
		},
		[reactFlowInstance],
	);
	const onDragOver: React.DragEventHandler<HTMLDivElement> = useCallback((event) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	}, []);
	const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
	const onNodeClick = useCallback((e: MouseEvent, node: Node) => {
		setSelectedNode(node);
	}, []);
	useEffect(() => {
		if (!configOpened && (selectedNodelet?.configDefinitions || []).length) {
			setConfigOpened(true);
		} else {
			setConfigOpened(false);
		}
	}, [selectedNode]);
	return (
		<>
			<WorkflowContextProvider
				onNodeClick={onNodeClick}
				nodes={nodes}
				nodelets={nodelets}
				integrations={integrations}
				validatesResult={validatesResult ?? []}
			>
				<div className="relative flex flex-1 reactflow-wrapper" ref={reactFlowWrapper}>
					<div
						className="absolute left-4 top-4 z-50"
						onMouseEnter={() => {
							setShowAiInput(true);
							setTimeout(() => setInputWidth('40rem'), 50);
						}}
						onMouseLeave={() => {
							if (!aiPrompt) {
								setInputWidth('40px');
								setTimeout(() => setShowAiInput(false), 300);
							}
						}}
					>
						<div
							className="flex items-center h-[40px] overflow-hidden transition-all duration-300 ease-in-out"
							style={{ width: inputWidth }}
						>
							{showAiInput ? (
								<TextInput
									placeholder="Enter your prompt..."
									value={aiPrompt}
									onChange={(e) => setAiPrompt(e.target.value)}
									onBlur={() => {
										if (!aiPrompt) {
											setInputWidth('40px');
											setTimeout(() => setShowAiInput(false), 300);
										}
									}}
									onKeyDown={(e) => {
										if (e.key === 'Enter' && aiPrompt) {
											console.log('AI Prompt:', aiPrompt);
											setAiPrompt('');
											setInputWidth('40px');
											setTimeout(() => setShowAiInput(false), 300);
										}
									}}
									autoFocus
									className="min-w-[40rem]"
									styles={{
										input: {
											transition: 'all 0.3s ease',
											height: '40px',
											'&:focus': {
												borderColor: 'var(--mantine-color-blue-5)',
											},
										},
									}}
								/>
							) : (
								<ActionIcon variant="filled" size="lg" className="transition-all duration-300 ease-in-out hover:scale-110">
									<IconRobot size={24} />
								</ActionIcon>
							)}
						</div>
					</div>

					<ReactFlow
						nodes={nodes.map((node) => {
							return {
								...node,
								type: 'internalNodelet',
								data: {
									...node.data,
								},
							};
						})}
						edges={edges}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						onConnect={onConnect}
						className="absolute bottom-0 left-0 top-0 right-0"
						nodeTypes={nodeTypes}
						onNodeClick={onNodeClick}
						onPaneClick={() => {
							setConfigOpened(false);
						}}
						onDrop={onDrop}
						onInit={setReactFlowInstance}
						onDragOver={onDragOver}
						defaultViewport={{ x: 100, y: 0, zoom: 0.8 }}
					>
						<MiniMap />
						<Controls />
						<Background />
					</ReactFlow>
				</div>
			</WorkflowContextProvider>

			<Drawer
				opened={configOpened}
				onClose={() => {
					setConfigOpened(false);
				}}
				title={`${selectedNodelet?.name} Configuration`}
				position="right"
				withOverlay={false}
				size="sm"
				styles={{
					inner: { right: 0, margin: '0.8rem' },
				}}
			>
				<Configuration
					key={selectedNodelet?.id}
					definitions={selectedNodelet?.configDefinitions || []}
					config={selectedNode?.data.config || {}}
					integrationConfig={integration?.config}
					style={{ padding: '20px 0' }}
					onChange={(config) => {
						const selectedNodeIndex = nodes.findIndex((node) => node.id === selectedNode?.id);
						setNodes([
							...nodes.slice(0, selectedNodeIndex),
							{
								...selectedNode,
								data: { ...selectedNode?.data, config },
							},
							...nodes.slice(selectedNodeIndex + 1),
						] as Node[]);
					}}
				/>
			</Drawer>
		</>
	);
}
