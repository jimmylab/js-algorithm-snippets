"use strict"

const BLOCKSIZE = 4096;
const BLOCKS_TO_GENERATE = 1000;


const crypto = require('crypto');
const fs = require('fs');


const BUFSIZE = 7 * BLOCKSIZE;
const STRBUFFSIZE = 18 * BLOCKSIZE;
const POWER1 = 2 ** 45;
const POWER2 = 2 ** 37;
const POWER3 = 2 ** 29;


var filepath = process.argv[2];

var output = (filepath === undefined) ? 
	process.stdout :
	fs.createWriteStream(filepath);

var buf = Buffer.allocUnsafe(BUFSIZE);

var generateBlock = function() {
	crypto.randomFillSync(buf);
	let strBuff = Buffer.alloc(STRBUFFSIZE);
	let i = 0, j = 0;
	while (i < BUFSIZE) {
		let sign = buf[i] >>> 7;
		let x = (
			(buf[i++] & 0x1F) +
			(buf[i++] << 5) +
			(buf[i++] << 13) +
			(buf[i++] << 21) +
			buf[i++] * POWER1 +
			buf[i++] * POWER2 +
			buf[i++] * POWER3
		);
		if (!sign) {
			x = -x;
		}
		let bytes = strBuff.write(`${x}\n`, j, 'ascii');
		j += bytes;
	}
	return strBuff.slice(0, j);
};

output.on('close', () => {
	console.log(`Random file ${filepath} generated.`)
})

for (let i = 0; i < BLOCKS_TO_GENERATE; i++) {
	output.write(generateBlock());
}

