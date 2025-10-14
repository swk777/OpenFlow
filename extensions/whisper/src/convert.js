const os = require('os');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

/**
 * Get the FFmpeg executable path for the current platform
 * @param {string} ffmpegDir - Directory path containing the FFmpeg executable
 * @returns {string} Complete path to the FFmpeg executable for the current platform
 * @throws {Error} If no suitable executable is found for the current platform
 */
function getFFmpegExecutable(ffmpegDir) {
	const platform = os.platform(); // 'win32', 'darwin', 'linux', etc.
	const arch = os.arch(); // 'x64', 'arm64', 'ia32', etc.

	let executableName;

	if (platform === 'win32') {
		executableName = 'win-ffmpeg.exe';
	} else if (platform === 'darwin') {
		// macOS
		if (arch === 'arm64') {
			executableName = 'mac-ffmpeg-arm';
		} else {
			executableName = 'mac-ffmpeg-intel';
		}
	} else if (platform === 'linux') {
		if (arch === 'x64') {
			executableName = 'ffmpeg-linux-amd64';
		} else if (arch === 'arm64') {
			executableName = 'ffmpeg-linux-arm64';
		} else if (arch === 'arm') {
			executableName = 'ffmpeg-linux-armhf';
		} else if (arch === 'ia32') {
			executableName = 'ffmpeg-linux-x86';
		}
	}

	if (!executableName) {
		throw new Error(`No FFmpeg executable found for current platform (${platform}) and architecture (${arch})`);
	}

	const executablePath = path.join(ffmpegDir, executableName);

	// Check if the file exists
	if (!fs.existsSync(executablePath)) {
		throw new Error(`FFmpeg executable not found: ${executablePath}`);
	}

	// On UNIX systems, ensure the file has execution permissions
	if (platform !== 'win32') {
		try {
			fs.chmodSync(executablePath, '755');
		} catch (err) {
			console.warn(`Unable to set execution permissions: ${err.message}`);
		}
	}

	return executablePath;
}

/**
 * Convert video file to MP3 audio
 * @param {string} ffmpegPath - Complete path to the FFmpeg executable
 * @param {string} inputVideoPath - Path to the input video file
 * @param {string} outputMp3Path - Path to the output MP3 file
 * @param {object} options - Conversion options
 * @param {string} options.audioBitrate - Audio bitrate, defaults to "192k"
 * @param {number} options.audioChannels - Number of audio channels, defaults to 2
 * @param {number} options.audioSampleRate - Audio sample rate, defaults to 44100
 * @returns {Promise<string>} Output information after conversion
 * @throws {Error} If an error occurs during conversion
 */
export async function convertVideoToMp3(ffmpegPath, inputVideoPath, outputMp3Path, options = {}) {
	// Default options
	const defaultOptions = {
		audioBitrate: '192k',
		audioChannels: 2,
		audioSampleRate: 44100,
	};

	// Merge options
	const mergedOptions = { ...defaultOptions, ...options };

	// Verify input file exists
	if (!fs.existsSync(inputVideoPath)) {
		throw new Error(`Input video file does not exist: ${inputVideoPath}`);
	}

	// Ensure output directory exists
	const outputDir = path.dirname(outputMp3Path);
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	// Build FFmpeg command arguments
	const args = [
		'-i',
		inputVideoPath,
		'-vn', // No video stream
		'-acodec',
		'libmp3lame', // Use mp3 encoder
		'-ab',
		mergedOptions.audioBitrate, // Audio bitrate
		'-ac',
		mergedOptions.audioChannels.toString(), // Number of audio channels
		'-ar',
		mergedOptions.audioSampleRate.toString(), // Audio sample rate
		'-y', // Overwrite output file
		outputMp3Path,
	];

	try {
		console.log(`Starting conversion: ${inputVideoPath} -> ${outputMp3Path}`);
		const { stdout, stderr } = await execFileAsync(getFFmpegExecutable(ffmpegPath), args);
		console.log(`Conversion successful: ${outputMp3Path}`);
		return { stdout, stderr, outputPath: outputMp3Path };
	} catch (error) {
		console.error(`Conversion failed:`, error);
		throw new Error(`Video to MP3 conversion failed: ${error.message}`);
	}
}
