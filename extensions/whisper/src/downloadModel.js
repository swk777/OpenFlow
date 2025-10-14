/**
 * This script downloads Whisper model files that have been converted to ggml format.
 * This way you don't have to convert them yourself.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const process = require('process');
const { URL } = require('url');

// ANSI color codes
const BOLD = '\u001b[1m';
const RESET = '\u001b[0m';

// Default sources
let src = 'https://huggingface.co/ggerganov/whisper.cpp';
let pfx = 'resolve/main/ggml';

// Whisper models list
const models = `tiny
tiny.en
tiny-q5_1
tiny.en-q5_1
tiny-q8_0
base
base.en
base-q5_1
base.en-q5_1
base-q8_0
small
small.en
small.en-tdrz
small-q5_1
small.en-q5_1
small-q8_0
medium
medium.en
medium-q5_0
medium.en-q5_0
medium-q8_0
large-v1
large-v2
large-v2-q5_0
large-v2-q8_0
large-v3
large-v3-q5_0
large-v3-turbo
large-v3-turbo-q5_0
large-v3-turbo-q8_0`.split('\n');

// List available models
function listModels() {
	console.log('\nAvailable models:');
	let modelClass = '';

	for (const model of models) {
		const thisModelClass = model.split(/[.-]/)[0];
		if (thisModelClass !== modelClass) {
			process.stdout.write('\n ');
			modelClass = thisModelClass;
		}
		process.stdout.write(` ${model}`);
	}

	console.log('\n\n___________________________________________________________');
	console.log(`${BOLD}.en${RESET} = english-only ${BOLD}-q5_[01]${RESET} = quantized ${BOLD}-tdrz${RESET} = tinydiarize`);
}
const writeOutput = (text) => {
	if (process.stdout && process.stdout.write) {
		process.stdout.write(text);
	} else {
		console.log(text);
	}
};

// // Check if model is valid
// if (!models.includes(model)) {
// 	console.log(`Invalid model: ${model}`);
// 	listModels();
// 	process.exit(1);
// }

// // Update source and prefix if model contains 'tdrz'
// if (model.includes('tdrz')) {
// 	src = 'https://huggingface.co/akashmjn/tinydiarize-whisper.cpp';
// 	pfx = 'resolve/main/ggml';
// }

// Download function using native Node.js HTTPS
// function downloadFile(url, outputPath, redirectCount = 0) {
// 	return new Promise((resolve, reject) => {
// 		// Prevent infinite redirect loops
// 		if (redirectCount > 5) {
// 			reject(new Error('Too many redirects'));
// 			return;
// 		}

// 		// Parse URL to determine if http or https should be used
// 		const urlObj = new URL(url);
// 		const httpModule = urlObj.protocol === 'https:' ? require('https') : require('http');

// 		const request = httpModule.get(url, (response) => {
// 			// Handle redirects (status codes 301, 302, 303, 307, 308)
// 			if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
// 				// Close the current request
// 				request.abort();

// 				// Get the redirect URL (might be relative or absolute)
// 				const redirectUrl = new URL(response.headers.location, url).href;
// 				console.log(`\nRedirecting to: ${redirectUrl}`);

// 				// Follow the redirect
// 				return downloadFile(redirectUrl, outputPath, redirectCount + 1)
// 					.then(resolve)
// 					.catch(reject);
// 			}

// 			if (response.statusCode !== 200) {
// 				reject(new Error(`Failed to download, status code: ${response.statusCode}`));
// 				return;
// 			}

// 			const file = fs.createWriteStream(outputPath);
// 			let downloadedBytes = 0;
// 			let totalBytes = parseInt(response.headers['content-length'] || '0', 10);
// 			let lastLogTime = Date.now();

// 			response.on('data', (chunk) => {
// 				downloadedBytes += chunk.length;
// 				file.write(chunk);

// 				// Update progress every 500ms
// 				const now = Date.now();
// 				if (now - lastLogTime > 500) {
// 					lastLogTime = now;
// 					const progress = totalBytes ? Math.round((downloadedBytes / totalBytes) * 100) : 0;
// 					writeOutput(`\rDownloading: ${progress}% (${formatBytes(downloadedBytes)}${totalBytes ? '/' + formatBytes(totalBytes) : ''})`);
// 				}
// 			});

// 			response.on('end', () => {
// 				file.end();
// 				console.log('\nDownload complete!');
// 				resolve();
// 			});

// 			response.on('error', (err) => {
// 				file.close();
// 				fs.unlink(outputPath, () => {}); // Delete the file on error
// 				reject(err);
// 			});

// 			file.on('error', (err) => {
// 				file.close();
// 				fs.unlink(outputPath, () => {}); // Delete the file on error
// 				reject(err);
// 			});
// 		});

// 		request.on('error', (err) => {
// 			fs.unlink(outputPath, () => {}); // Delete the file on error
// 			reject(err);
// 		});

// 		// Set a timeout for the request
// 		request.setTimeout(30000, () => {
// 			request.abort();
// 			fs.unlink(outputPath, () => {}); // Delete the file on error
// 			reject(new Error('Request timeout'));
// 		});
// 	});
// }
function downloadFile(url, outputPath, redirectCount = 0) {
	return new Promise((resolve, reject) => {
		// Prevent infinite redirect loops
		if (redirectCount > 5) {
			reject(new Error('Too many redirects'));
			return;
		}

		// Parse URL to determine if http or https should be used
		const urlObj = new URL(url);
		const httpModule = urlObj.protocol === 'https:' ? require('https') : require('http');

		const request = httpModule.get(url, (response) => {
			// Handle redirects (status codes 301, 302, 303, 307, 308)
			if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
				// Close the current request
				request.abort();

				// Get the redirect URL (might be relative or absolute)
				const redirectUrl = new URL(response.headers.location, url).href;
				console.log(`\nRedirecting to: ${redirectUrl}`);

				// Follow the redirect
				return downloadFile(redirectUrl, outputPath, redirectCount + 1)
					.then(resolve)
					.catch(reject);
			}

			if (response.statusCode !== 200) {
				reject(new Error(`Failed to download, status code: ${response.statusCode}`));
				return;
			}

			const file = fs.createWriteStream(outputPath);
			let downloadedBytes = 0;
			let totalBytes = parseInt(response.headers['content-length'] || '0', 10);
			let lastLogTime = Date.now();

			response.on('data', (chunk) => {
				downloadedBytes += chunk.length;
				file.write(chunk);

				// Update progress every 500ms
				const now = Date.now();
				if (now - lastLogTime > 500) {
					lastLogTime = now;
					const progress = totalBytes ? Math.round((downloadedBytes / totalBytes) * 100) : 0;
					writeOutput(`\rDownloading: ${progress}% (${formatBytes(downloadedBytes)}${totalBytes ? '/' + formatBytes(totalBytes) : ''})`);
				}
			});

			response.on('end', () => {
				file.end();
				console.log('\nDownload complete!');
				resolve();
			});

			response.on('error', (err) => {
				file.close();
				fs.unlink(outputPath, () => {}); // Delete the file on error
				reject(err);
			});

			file.on('error', (err) => {
				file.close();
				fs.unlink(outputPath, () => {}); // Delete the file on error
				reject(err);
			});
		});

		request.on('error', (err) => {
			fs.unlink(outputPath, () => {}); // Delete the file on error
			reject(err);
		});

		// Set a timeout for the request
		request.setTimeout(30000, () => {
			request.abort();
			fs.unlink(outputPath, () => {}); // Delete the file on error
			reject(new Error('Request timeout'));
		});
	});
}

// Format bytes to human-readable format
function formatBytes(bytes) {
	if (bytes === 0) return '0 Bytes';

	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));

	return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

// Check if whisper-cli exists in PATH
function checkWhisperCliInPath() {
	try {
		// Try to access the whisper-cli executable in common PATH locations
		const pathDirs = process.env.PATH.split(path.delimiter);
		for (const dir of pathDirs) {
			const whisperPath = path.join(dir, 'whisper-cli');
			try {
				fs.accessSync(whisperPath, fs.constants.X_OK);
				return true;
			} catch (err) {
				// Try with .exe extension for Windows
				try {
					fs.accessSync(`${whisperPath}.exe`, fs.constants.X_OK);
					return true;
				} catch (err2) {
					// Not found in this directory, continue to next
				}
			}
		}
		return false;
	} catch (err) {
		return false;
	}
}

export async function download(model, modelsPath) {
	// Download ggml model
	console.log(`Downloading ggml model ${model} from '${src}' ...`);

	// Make sure models path exists
	if (!fs.existsSync(modelsPath)) {
		try {
			fs.mkdirSync(modelsPath, { recursive: true });
		} catch (err) {
			console.error(`Failed to create directory ${modelsPath}: ${err.message}`);
			process.exit(1);
		}
	}

	// Check if model already exists
	const modelFilename = `ggml-${model}.bin`;
	const modelFullPath = path.join(modelsPath, modelFilename);

	if (fs.existsSync(modelFullPath)) {
		console.log(`Model ${model} already exists. Skipping download.`);
		// showUsageInstructions(modelFullPath);
		return;
	}

	// Download the model
	const downloadUrl = `${src}/${pfx}-${model}.bin`;
	console.log(downloadUrl);
	console.log(modelFullPath);
	try {
		await downloadFile(downloadUrl, modelFullPath);
		// showUsageInstructions(modelFullPath);
	} catch (error) {
		console.error(`Failed to download ggml model ${model}: ${error.message}`);
		console.error('Please try again later or download the original Whisper model files and convert them yourself.');

		// Clean up the partial file if it exists
		if (fs.existsSync(modelFullPath)) {
			try {
				fs.unlinkSync(modelFullPath);
			} catch (err) {
				// Ignore cleanup errors
			}
		}

		process.exit(1);
	}
}

function showUsageInstructions(modelPath) {
	// Check if 'whisper-cli' is available in the system PATH
	const whisperCmd = checkWhisperCliInPath() ? 'whisper-cli' : './build/bin/whisper-cli';

	console.log(`Done! Model '${model}' saved in '${modelPath}'`);
	console.log('You can now use it like this:\n');
	console.log(`  $ ${whisperCmd} -m ${modelPath} -f samples/jfk.wav`);
	console.log();
}
