import { createContext, useContext, useEffect, useState } from 'react';

const WorkspaceContext = createContext<{ workspace?: string; setWorkspace: (workspace: string) => void }>({
	workspace: '',
	setWorkspace: () => {},
});

export const WorkspaceProvider = ({ children }) => {
	const [workspace, setWorkspace] = useState<string | undefined>();

	useEffect(() => {
		async function fetchWorkspace() {
			const savedWorkspace = await window.ipcRenderer.getWorkSpace();
			if (savedWorkspace) {
				setWorkspace(savedWorkspace);
			}
		}
		fetchWorkspace();

		window.ipcRenderer.on('workspace-set', fetchWorkspace);
	}, []);
	return <WorkspaceContext.Provider value={{ workspace, setWorkspace }}>{children}</WorkspaceContext.Provider>;
};

export const useWorkspace = () => useContext(WorkspaceContext);
