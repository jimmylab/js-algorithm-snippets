'use strict'

// REF1: https://github.com/substack/stream-handbook （灵活运用stream）
// REF2: https://nodejs.org/api/stream.html          （官方文档）
// REF3: https://github.com/nodejs/readable-stream   （官方源码值得一看！墙裂推荐！）
// REF4: https://devhints.io/nodejs-stream           （也不错）

// Constants
const DEBUG = true && (require.main === module);   // 直接启动才能开启Debug

// Modules
const fs = require('fs');
// var Transform = require('stream').Transform;
const { Transform } = require('stream');



var assert;

var test = function() {
	var srcStream = fs.createReadStream('test.txt', {
		flags: 'r',
		encoding: null,
		highWaterMark: 16
	});

	var numStream = (() => {
		let residue = '';
		let stream = new Transform({
			objectMode: true,
			transform: (chunk, encoding, done) => {
				let fragments = chunk.toString('utf8').split('\n');
				fragments[0] = `${residue}${fragments[0]}`;
				residue = fragments.pop();

				let len = fragments.length;
				for (let i=0; i < len; i++) {
					let num = parseInt(fragments[i], 10);
					if (isNaN(num)) {
						// console.log(`Ignoring non-number "${line}"`);
					} else if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
						// console.log(`Ignoring overflowed "${line}"`);
					} else {
						stream.push(num);
					}
				}
				done(null);
			},
			final: (done) => {
				if (residue.trim() !== '') {
					let num = parseInt(residue, 10);
					if (isNaN(num)) {
						// console.log(`Ignoring non-number "${line}"`);
					} else if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
						// console.log(`Ignoring overflowed "${line}"`);
					} else {
						stream.push(num);
					}
				}
				console.log('_final');
				done(null);
			}
		});
		return stream;
	}) ();
	
	numStream
	.on('data', (num) => {
		console.log(`${typeof num} ${JSON.stringify(num)}`);
	})
	.on('end', () => {
		console.log('onEnd')
	})
	.on('finish', () => {
		console.log('onFinish')
	})

	srcStream.pipe(numStream);
}


if (DEBUG) {
	assert = require('assert');
	test();
}

