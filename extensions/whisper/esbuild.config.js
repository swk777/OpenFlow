const esbuild = require('esbuild');
const { argv } = require('process');
const path = require('path');

const isDev = argv.includes('--dev');
const isWatch = argv.includes('--watch');

const outdir = 'dist';

/** @type {import('esbuild').BuildOptions} */
const buildOptions = {
	entryPoints: ['src/main.js'],
	bundle: true,
	outdir: outdir,
	platform: 'node',
	target: 'node16',
	minify: !isDev,
	sourcemap: isDev,
	metafile: true,
	define: {
		'process.env.NODE_ENV': isDev ? '"development"' : '"production"',
	},
	format: 'cjs',
	plugins: [
		{
			name: 'copy-config',
			setup(build) {
				build.onEnd(() => {
					esbuild
						.build({
							entryPoints: ['src/config.json'],
							outdir: outdir,
							allowOverwrite: true,
							bundle: false,
							write: true,
						})
						.catch(() => {
							console.error('Failed to copy config.json');
						});
				});
			},
		},
	],
};

async function build() {
	try {
		if (isWatch) {
			const ctx = await esbuild.context(buildOptions);
			await ctx.watch();
			console.log('Watching for changes...');
		} else {
			const result = await esbuild.build(buildOptions);

			const { metafile } = result;
			const outputs = Object.keys(metafile.outputs);
			const mainOutput = outputs.find((output) => output.endsWith('main.js'));
			if (mainOutput) {
				const outSize = metafile.outputs[mainOutput].bytes;
				console.log(`✓ Build complete: ${(outSize / 1024).toFixed(2)} KB`);
			} else {
				console.log('✓ Build complete');
			}
		}
	} catch (error) {
		console.error('Build failed:', error);
		process.exit(1);
	}
}

build();
