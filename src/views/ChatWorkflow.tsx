import { AppContext } from '@/context/AppContext';
import { IWorkflow } from '@/type/workflow';
import { Flex } from '@mantine/core';
import { useContext, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Chat from './Chat';

type Props = {
	workflow?: IWorkflow;
	sessionId?: string;
};

export default function ChatWorkflow({ workflow, sessionId }: Props) {
	const { refreshConversations, conversations } = useContext(AppContext);
	const id = useMemo(() => sessionId ?? `temp-${workflow?.id}-${uuidv4()}`, []);
	const workflowConversation = useMemo(() => conversations.find((c) => c.sessionId === id), [conversations]);
	const messages = useMemo(() => {
		return workflowConversation?.conversationContext?.messages ?? [];
	}, [sessionId, conversations]);
	useEffect(() => {
		window.ipcRenderer.getConversationById(id).then(() => {
			refreshConversations();
		});
	}, []);
	return (
		<Flex className="flex-1 overflow-x-hidden" direction="column">
			<Chat
				messages={messages}
				onSendMessage={(query) => {
					return window.ipcRenderer.chat(id, workflow?.id, query, workflow).then(() => {
						refreshConversations();
					});
				}}
			/>
		</Flex>
	);
}
