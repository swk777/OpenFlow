const path = require('path');
const fs = require('fs');

const { promisify } = require('util');
const { download } = require('./downloadModel');
const { convertVideoToMp3 } = require('./convert');

const { whisper } = require(path.join(globalVariables.workspacePath, 'extensions/whisper/addon/addon.node'));
async function execute(context) {
	const { setNodeContext, nodeConfig, nodeInputs, globalContext } = context;
	console.log(globalContext);
	const { model } = nodeConfig;
	const extensionPath = path.join(globalVariables.workspacePath, 'extensions/whisper');
	const whisperAsync = promisify(whisper);
	let { filePath } = nodeInputs;
	if (!fs.existsSync(filePath)) {
		throw new Error(`File not found: ${filePath}`);
	}
	if (!fs.existsSync(path.join(extensionPath, `models/ggml-${model}.bin`))) {
		await download(model, path.join(extensionPath, 'models'));
	}
	if (!filePath.endsWith('.mp3') && !filePath.endsWith('.wav')) {
		await convertVideoToMp3(`${extensionPath}/bin`, filePath, `${globalContext.tempPath}/tmp.mp3`);
		filePath = `${globalContext.tempPath}/tmp.mp3`;
	}
	const whisperParams = {
		language: 'auto',
		model: path.join(extensionPath, `models/ggml-${model}.bin`),
		fname_inp: filePath,
		use_gpu: true,
		flash_attn: false,
		no_prints: true,
		comma_in_time: false,
		no_timestamps: true,
		audio_ctx: 0,
		max_len: 0,
		progress_callback: (progress) => {
			console.log(`progress: ${progress}%`);
		},
	};

	const results = await whisperAsync(whisperParams);
	console.log(results);
	setNodeContext &&
		setNodeContext({
			outputs: { transcription: results.map((result) => result[2]).join(',') },
		});
	return;
}
module.exports = execute;
