var bluster;
// For regular tests, using the compiled version makes the most sense as it is the most realistic version…
/* istanbul ignore if */
if ('coverage' != process.env.TEST_TYPE) {
	bluster = require('..');
// …however, when testing coverage, the compiled version gives skewed results.
} else /* if ('coverage' == process.env.TEST_TYPE) */ {
	bluster = require('../source');
}

module.exports = bluster;