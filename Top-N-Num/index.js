"use strict"

// TODO: memory cost and performace test

const fs = require('fs');
const { Transform } = require('stream');
const MinHeap = require('./MinHeap');

// Constants
const TOP_N_LIMIT = 100;    // 前N个大数
const MAX_FRAG = 1024 * 1024;
// const MAX_FRAG = 16;    // Small fragment size, for testing

const filepath = process.argv[2];


/**
 * 将文本字节流分割解析为数字流
 * @see https://strongloop.com/strongblog/practical-examples-of-the-new-node-js-streams-api/
 */
 class NumberStream extends Transform {
	constructor() {
		super({ objectMode: true });
		this.remainData = null;
	}
	writeNum(line) {
		let num = parseInt(line, 10);
		if (isNaN(num)) {
			console.log(`[Warning] Ignoring non-number "${line}"`);
		} else if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
			console.log(`[Warning] Ignoring overflowed "${line}"`);
		} else {
			this.push(num);
		}
	}
	_transform(chunk, encoding, done) {
		let data = chunk.toString('utf-8');
		if (this.remainData)
			data = this.remainData + data;
		let lines = data.split('\n');
		this.remainData = lines.pop();
		lines.map(line => this.writeNum(line));
		done();
	}
	_flush(done) {
		if (this.remainData) this.writeNum(this.remainData);
		this.remainData = null;
		done();
	}
}


let input;
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

	const heap = new MinHeap();
	let count = 0;

	function onNumber(x) {
		if (count < TOP_N_LIMIT) {
			heap.insert(x);
			count++;
		} else {
			if (x <= heap.getMin()) return;
			heap.insert(x);
			heap.extractMin();
		}
	}

	function onEnd() {
		let TOP_N_Num = heap.toArray().sort((a, b) => {
			return (a < b) - (a > b);
		});
		console.log(`The top ${TOP_N_LIMIT} numbers:`);
		console.log(TOP_N_Num.join('\n'));
	};

	const numberStream = new NumberStream();
	input.pipe(numberStream);
	numberStream.on('data', onNumber)
	numberStream.on('end', onEnd)

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
