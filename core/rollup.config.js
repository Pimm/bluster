const path = require('path');
const babel = require('@rollup/plugin-babel');

const packageConfiguration = require('./package.json');

module.exports = {
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
		babel({ comments: false, babelHelpers: 'bundled' })
	]
};