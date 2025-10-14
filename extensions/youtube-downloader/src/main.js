const path = require('path');
const fs = require('fs');
const { downloadYouTubeVideo } = require('./download');

async function execute(context) {
	const { setNodeContext, nodeConfig, nodeInputs, globalContext } = context;
	console.log(nodeInputs);
	const result = await downloadYouTubeVideo(nodeInputs.url, globalVariables.workspacePath);
	setNodeContext &&
		setNodeContext({
			outputs: { filePath: result.filePath },
		});
	return;
}
module.exports = execute;
