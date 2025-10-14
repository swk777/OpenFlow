const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

/**
 * 下载YouTube视频
 * @param {string} url - YouTube视频URL
 * @param {object} options - 下载选项
 * @param {string} options.outputPath - 输出路径，默认为当前目录
 * @param {string} options.quality - 视频质量，默认为'highest'
 * @param {string} options.format - 输出格式，默认为'mp4'
 * @param {function} options.onProgress - 进度回调函数
 * @returns {Promise} 返回Promise，包含下载结果
 */
async function downloadYouTubeVideo(url, outputPath, options = {}) {
	try {
		// 默认选项
		const { quality = 'highest', format = 'mp4', onProgress = null } = options;
		console.log(url);
		验证URL;
		if (!ytdl.validateURL(url)) {
			throw new Error('无效的YouTube URL');
		}

		// 获取视频信息
		console.log('正在获取视频信息...');
		const info = await ytdl.getInfo(url);
		console.log(info);
		const title = info.videoDetails.title.replace(/[^\w\s-]/gi, ''); // 移除特殊字符
		const filename = `${title}.${format}`;
		const fullPath = path.join(outputPath, filename);

		console.log(`视频标题: ${info.videoDetails.title}`);
		console.log(`视频时长: ${info.videoDetails.lengthSeconds}秒`);
		console.log(`开始下载到: ${fullPath}`);

		// 创建输出目录
		if (!fs.existsSync(outputPath)) {
			fs.mkdirSync(outputPath, { recursive: true });
		}

		return new Promise((resolve, reject) => {
			// 创建下载流
			const stream = ytdl(url, {
				quality: quality,
				filter: format === 'mp3' ? 'audioonly' : 'videoandaudio',
			});

			// 创建写入流
			const writeStream = fs.createWriteStream(fullPath);

			// 跟踪下载进度
			let downloadedBytes = 0;
			const totalBytes = parseInt(info.formats[0]?.contentLength || 0);

			stream.on('data', (chunk) => {
				downloadedBytes += chunk.length;
				if (onProgress && totalBytes > 0) {
					const progress = ((downloadedBytes / totalBytes) * 100).toFixed(2);
					onProgress(progress, downloadedBytes, totalBytes);
				}
			});

			stream.on('progress', (chunkLength, downloaded, total) => {
				const progress = ((downloaded / total) * 100).toFixed(2);
				console.log(`下载进度: ${progress}% (${downloaded}/${total} bytes)`);

				if (onProgress) {
					onProgress(progress, downloaded, total);
				}
			});

			stream.on('error', (error) => {
				console.error('下载出错:', error);
				reject(error);
			});

			writeStream.on('error', (error) => {
				console.error('文件写入出错:', error);
				reject(error);
			});

			writeStream.on('finish', () => {
				console.log('下载完成!');
				resolve({
					success: true,
					filePath: fullPath,
					title: info.videoDetails.title,
					duration: info.videoDetails.lengthSeconds,
				});
			});

			// 开始下载
			stream.pipe(writeStream);
		});
	} catch (error) {
		console.error('下载失败:', error.message);
		throw error;
	}
}

/**
 * 获取YouTube视频信息（不下载）
 * @param {string} url - YouTube视频URL
 * @returns {Promise} 返回视频信息
 */
async function getYouTubeVideoInfo(url) {
	try {
		// if (!ytdl.validateURL(url)) {
		// 	throw new Error('无效的YouTube URL');
		// }

		const info = await ytdl.getInfo(url);

		return {
			title: info.videoDetails.title,
			description: info.videoDetails.description,
			duration: info.videoDetails.lengthSeconds,
			viewCount: info.videoDetails.viewCount,
			author: info.videoDetails.author.name,
			uploadDate: info.videoDetails.uploadDate,
			thumbnails: info.videoDetails.thumbnails,
			availableFormats: info.formats.map((format) => ({
				quality: format.qualityLabel,
				container: format.container,
				hasAudio: format.hasAudio,
				hasVideo: format.hasVideo,
			})),
		};
	} catch (error) {
		console.error('获取视频信息失败:', error.message);
		throw error;
	}
}

// 使用示例
// async function example() {
// 	const videoUrl = 'https://www.youtube.com/watch?v=VIDEO_ID';

// 	try {
// 		// 下载视频
// 		const result = await downloadYouTubeVideo(videoUrl, {
// 			outputPath: './downloads',
// 			quality: 'highest',
// 			format: 'mp4',
// 			onProgress: (progress, downloaded, total) => {
// 				console.log(`自定义进度显示: ${progress}%`);
// 			},
// 		});

// 		console.log('下载结果:', result);

// 		// 或者只获取视频信息
// 		const info = await getYouTubeVideoInfo(videoUrl);
// 		console.log('视频信息:', info);
// 	} catch (error) {
// 		console.error('操作失败:', error);
// 	}
// }

module.exports = {
	downloadYouTubeVideo,
	getYouTubeVideoInfo,
};
