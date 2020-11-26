"use strict"

const ALPHA_OFFSET = 'A'.charCodeAt(0);

function isRomanCiphered(plain, ciphered) {

	function alphaFreq(textArray) {
		textArray = textArray.toUpperCase().split('');
		let freq = new Array(26);
		freq.fill(0);

		textArray.forEach(alpha => {
			let i = alpha.charCodeAt(0) - ALPHA_OFFSET;
			if (i >= 0 && i < 26) {
				freq[i]++;
			} else {
				throw Error('Charcter out of range!');
			}
		});

		return freq;
	}

	function arrayEqual(A, B) {
		A.sort()
		B.sort()
		return JSON.stringify(A.sort()) === JSON.stringify(B.sort());
	}

	let plainFreq    = alphaFreq(   plain);
	let cipheredFreq = alphaFreq(ciphered);

	let isIdenticalFreq = arrayEqual(plainFreq, cipheredFreq);

	return isIdenticalFreq ? 'YES' : 'NO';
}


isRomanCiphered('supercalifragilisticexpialidocious', 'bupercalifragilisticexpialidocious')
/*
NO
*/


isRomanCiphered('VICTORIOUS', 'WJDUPSJPVT')
/*
YES
*/

isRomanCiphered('VICTORIOUS', 'IVOTCIRSUO')
/*
YES
*/

isRomanCiphered('VICTORIOUS', 'JWPUDJSTVP')
/*
YES
*/
