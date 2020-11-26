"use strict"

// 块大小
const BLOCKSIZE = 32768;    // 8 mem pages
// 块数
const BLOCKS_TO_GENERATE = 2048;


const crypto = require('crypto');
const fs = require('fs');

var filepath = process.argv[2];

// 若未指定filepath，则输出流
const outStream = (filepath === undefined) ? 
	process.stdout :
	fs.createWriteStream(filepath);

outStream.setDefaultEncoding('ascii');


// 随机数buffer
const BUFSIZE = 4 * BLOCKSIZE;    // 4x8=32bit    32 mem pages
var buf = Buffer.allocUnsafe(BUFSIZE);

// 字符buffer
const STRBUFFSIZE = 12 * BLOCKSIZE;    // "-2147483648\n" 最多12个字符
var strBuff = Buffer.alloc(STRBUFFSIZE);

function generateBlock() {
	crypto.randomFillSync(buf);
	let dataview = new DataView(buf.buffer);
	let bytesWritten = 0;
	for (let i = 0; i < BUFSIZE; i += 4) {
		let x = dataview.getInt32(i);
		let numlength = strBuff.write(`${x}\n`, bytesWritten);
		bytesWritten += numlength;
	}
	return strBuff.slice(0, bytesWritten);
};

// 挑战, [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER]
function generateChallengeBlock() {
	//
}

// Override console to stderr
const myConsole = new console.Console(process.stderr);
var label = `${BLOCKS_TO_GENERATE*BLOCKSIZE} random integers`;
myConsole.time(label);

// stdout stream will never trigger this event
outStream.on('close', () => {
	myConsole.log(`Random file ${filepath} generated.`);
})

for (let i = 0; i < BLOCKS_TO_GENERATE; i++) {
	outStream.write(generateBlock());
}

myConsole.timeEnd(label);
