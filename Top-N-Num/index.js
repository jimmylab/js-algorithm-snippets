"use strict"

// TODO: memory cost and performace test
// TODO: stream style or event style
// TODO: flush stream after SIGINT


// 数据流向：输入流->chunk->fragment->number


const fs = require('fs');
const MinHeap = require('./MinHeap');
// const Readable = require('stream').Readable;


const TOP_N_LIMIT = 100;    // 前N个大数

const MAX_FRAG = 1024 * 1024;
// const MAX_FRAG = 16;    // Small fragment size, for testing


var filepath = process.argv[2];


var input;
// 若定义filepath，则默认stdin为输入流
try {
	input = (filepath === undefined) ?
		process.stdin :
		fs.createReadStream(filepath, {
			flags: 'r',            // 只读
			encoding: null,        // 不设置编码，将收获Buffer
			// encoding: 'utf8',   // 指定了编码，将收获String
			highWaterMark: 4 * 1024 * 1024,    // 4MB each time
			// highWaterMark: 64,     // Small chunk size, for testing
		})
	;

	var heap = new MinHeap();
	var residue = '';
	var count = 0;

	var onNumber = function(x) {
		if (count < TOP_N_LIMIT) {
			heap.insert(x);
			count++;
		} else {
			if (x <= heap.getMin()) return;
			heap.insert(x);
			heap.extractMin();
		}
	}

	var onEnd = function() {
		let TOP_N_Num = heap.toArray().sort((a, b) => {
			return (a < b) - (a > b);
		});
		console.log(`The top ${TOP_N_LIMIT} numbers:`);
		console.log(TOP_N_Num.join('\n'));
	};

	/* var numStream = new Readable();
	numStream._read = function noop() {};
	numStream.on('data', data => {
		console.log(data);
	}); */

	input
		.on('data', chunk => {
			let len = chunk.length;
			for (let i = 0; i < len; ) {
				let frag = chunk.slice(i, i += MAX_FRAG);
				frag = frag.toString('utf8').split('\n');
				frag[0] = residue + frag[0];
				residue = frag.pop();
				frag.forEach(line => {
					let num = parseInt(line);
					if (!isNaN(num)) {
						onNumber(num);
						//numStream.push(num);
					}
				});
			}
		})
		.on('end', () => {
			onEnd();
		});
	
	// Handle Ctrl+C
	process.on('SIGINT', () => {
		// input.end();
		console.log();
		onEnd();
		process.exit(0);
	});

} catch(errInput) {
	console.log(errInput);
}
