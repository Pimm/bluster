const path = require('path');
const babel = require('rollup-plugin-babel');
const cleanup = require('rollup-plugin-cleanup');

const packageConfiguration = require('./package.json');

export default {
	input: path.join('source', 'index.js'),
	output: [
		{
			format: 'esm',
			file: path.join('compiled', 'esm', `${packageConfiguration.name}.js`)
		},
		{
			format: 'cjs',
			file: path.join('compiled', 'cjs', `${packageConfiguration.name}.js`)
		}
	],
	plugins: [
		babel(),
		cleanup({
			sourcemap: false
		})
	]
};