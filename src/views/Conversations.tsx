import { AppContext } from '@/context/AppContext';
import { Button, Divider, Flex, Group, Stack, Text } from '@mantine/core';
import { IconMessage2 } from '@tabler/icons-react';
import { Fragment, useContext } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import EditableText from './components/EditableText';

type Props = {};

export default function Conversations({}: Props) {
	const { conversations, refreshConversations } = useContext(AppContext);
	const { conversationId = '' } = useParams();

	const navigate = useNavigate();
	return (
		<Flex className="flex-1">
			<Flex direction={'column'} className="w-52 py-4">
				<div className="pt-3 pb-4">
					<Button
						size="sm"
						onClick={() => {
							navigate('/chat/new');
						}}
					>
						New Chat
					</Button>
				</div>
				<Divider />
				<Flex direction={'column'} className="pt-2 pb-4 px-2 ">
					{conversations.length === 0 ? (
						<Stack justify="center" align="center">
							<Text fw={500} className="text-gray-400 mt-8">
								No Conversations
							</Text>
						</Stack>
					) : (
						conversations
							.filter((conversation) => !conversation.sessionId.startsWith('temp'))
							.map((conversation) => {
								return (
									<Fragment key={conversation?.sessionId}>
										<Group
											gap={0}
											className={`h-11 px-1 flex rounded-sm align-middle ${conversationId === conversation?.sessionId ? 'bg-gray-200' : ''}`}
										>
											<IconMessage2 className="w-4 h-4 mt-1" />
											<EditableText
												initialName={conversation.name}
												onChange={async (v: string) => {
													await window.ipcRenderer.saveConversation(conversation.sessionId, { ...conversation, name: v });
													refreshConversations();
												}}
												showElement={
													<Text
														fz="sm"
														className="flex-1 truncate cursor-pointer hover:text-primary text-left ml-3"
														w={144}
														onClick={() => {
															navigate(`/chat/${conversation.sessionId}`);
														}}
													>
														{conversation?.name}
													</Text>
												}
											/>
										</Group>
										<Divider />
									</Fragment>
								);
							})
					)}
				</Flex>
			</Flex>
			<Divider orientation="vertical" />
			<Outlet />
		</Flex>
	);
}
