import fs from 'node:fs';
import path from 'node:path';
import { NodeletExecuteContext } from '../type';

export async function saveToObsidian({ nodeInputs, nodeConfig, integrationConfig }: NodeletExecuteContext) {
	const { content } = nodeInputs as { content: string };
	const { title, folderPath = '' } = nodeConfig;
	const obsidianVault = integrationConfig?.vaultPath;
	if (!obsidianVault) {
		throw new Error('Obsidian vault path is required');
	}

	const fullPath = path.join(obsidianVault, folderPath);
	console.log(folderPath);
	// Create directory if it doesn't exist
	if (!fs.existsSync(fullPath)) {
		fs.mkdirSync(fullPath, { recursive: true });
	}
	fs.writeFile(path.join(fullPath, `${title || content.slice(0, 10)}.md`), content, (err) => {
		if (err) {
			console.log('An error occurred creating the Obsidian note: ' + err.message);
		} else {
			console.log('The Obsidian note has been successfully saved');
		}
	});
}
