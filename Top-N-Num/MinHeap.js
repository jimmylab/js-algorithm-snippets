"use strict"

// 常量
const DEBUG = true && (require.main === module);   // 直接启动才能开启Debug
const HEAD = 1;

var _TRACE = DEBUG ? console.log : () => { };

// 工具函数
var randArr = function (min, max, n) {
	return Array(n).fill(0).map(x => Math.floor(Math.random() * (max - min)) + min);
}

var isValidHeap = function (array) {
	for (let i = array.length - 1; i > 1; i--) {
		if (array[i >> 1] > array[i]) {
			return false;
		}
	}
	return true;
}


/*
 * 小根堆
 * 
 * REF1: https://www.youtube.com/watch?annotation_id=annotation_2492575683&feature=iv&src_vid=lAXZGERcDf4&v=oP2-8ysT3QQ#t=1m16s
 * REF2: https://algorithms.tutorialhorizon.com/binary-min-max-heap/
 * 小根堆，“头重脚轻”的二叉树，父亲大于儿子，如左图
 * 用二叉树数组表示，编号从1开始
 * 左儿子编号(i << 1)，右儿子编号(i << 1 | 1)，父亲编号(i >> 1)
 *       0                1
 *   2       5        2       3        0  1  2  3  4  5  6  7
 * 6   3   8   9    4   5   6   7   [NaN, 0, 2, 5, 6, 3, 8, 9]
 */
class MinHeap {
	/*
	 * 创建一个空的小根堆
	 * @constructor
	 */
	constructor() {
		// 数组长度 == 容量 + 1，即从1开始计数，第n个元素，下标刚好也为n
		this.capacity = 0;
		this.array = [NaN];
	}

	/*
	 * 向小根堆插入一个值
	 * @param val 欲插入的值
	 */
	insert(val) {
		this.array.push(NaN);
		this.bubbleUp(++this.capacity, val);
		_TRACE(`cap=${this.capacity}, [${this.array.join(", ")}], ${isValidHeap(this.array)}`);
	}

	/*
	 * 上浮操作
	 * @param tail 尾部元素下标
	 * @param val 尾部元素的值
	 */
	bubbleUp(tail, val) {
		let A = this.array;
		let child = tail;

		while (child > 1) {
			let parent = child >> 1;
			if (A[parent] > val) {
				A[child] = A[parent];
			} else {
				break;
			}
			child = parent;
		}
		A[child] = val;
	}

	/*
	 * 从小根堆中移走并返回最小的值
	 * @returns {number} 小根堆中最小的值
	 */
	extractMin() {
		let A = this.array;
		let n = this.capacity;
		if (!n) {
			return NaN;
		}
		let min = A[HEAD];
		this.sinkDown(--this.capacity, A.pop());
		return min;
	}

	/*
	 * 下沉操作
	 * @param tail 尾部元素下标
	 * @param val 尾部元素的值
	 */
	sinkDown(tail, val) {
		if (tail < HEAD) {
			return;
		}
		let A = this.array;
		// 只需遍历到[尾巴/2]即可，因为往后的元素没孩子了
		let boundary = tail >> 1;
		let i = HEAD;
		while (i <= boundary) {
			let L = i << 1;        // 左孩子:=i*2
			let R = i << 1 ^ 1;    // 右孩子:=i*2+1，(i << 1 | 1)亦可
			let Lval = A[L];
			// 任何数(包括NaN)与NaN比较 == false，此处亦可用Infinity替代，原理见浮点数IEEE-754
			let Rval = (R > tail) ? NaN : A[R];

			let [minChild, minChildVal] = (Rval < Lval) ?
				[R, Rval] :
				[L, Lval]
				;

			if (minChildVal < val) {
				A[i] = minChildVal;
			} else {
				break;
			}
			i = minChild;
		}
		A[i] = val;
	}

	/*
	 * 获取（但不移走）最小值
	 * @returns {number}
	 */
	getMin() {
		return (this.capacity > 0) ? this.array[HEAD] : NaN;
	}

	/*
	 * 导出为普通数组（浅拷贝）
	 * @returns {Array}
	 */
	toArray() {
		return this.array.slice(1);
	}
}

// 导出模块
module.exports = MinHeap;

var assert;

// 测试A：插入、提取测试
var testA = function () {
	var heap = new MinHeap();
	var arr = [7, 5, 3, 9, 8, 2, 6, 4, 1];
	arr.forEach(x => {
		heap.insert(x)
	});

	var heapExtracted = [];
	for (let i = 0; i < 15; i++) {
		let min = heap.extractMin();
		isNaN(min) || heapExtracted.push(min);
		_TRACE(min);
		_TRACE(`cap=${heap.capacity}, [${heap.array.join(", ")}], ${isValidHeap(heap.array)}`);
	}

	// 与普通排序比较答案
	assert.deepEqual(
		heapExtracted,
		arr.sort(),
		'Wrong answer: extract-min'
	);
};

// 测试B：前10个最大值
var testB = function () {
	var heap = new MinHeap();

	var rand = randArr(100, 999, 100);
	_TRACE(`[${rand.join(", ")}]`);

	// 插入元素[0~10)
	rand.slice(0, 10).forEach(x => heap.insert(x));
	// 先插入再提取元素[10~N)，堆容量在11,10之间跳动
	rand.slice(10).forEach(x => {
		// if (x <= heap.getMin()) return;   // 若x比最小值还小，可以不插入堆
		heap.insert(x);
		heap.extractMin();
		_TRACE(`cap=${heap.capacity}, [${heap.array.join(", ")}]`);
	});

	_TRACE(`cap=${heap.capacity}, [${heap.array.join(", ")}]`);

	// 与普通排序比较答案
	assert.deepEqual(
		heap.toArray().sort(),
		rand.sort().slice(-10),
		'Wrong answer: top N number'
	);
};

// 启动测试
if (DEBUG) {
	assert = require('assert');
	testA();
	testB();
}


// 杂七杂八

// ceil(log(2, n))，如log2_ceil(16) = 5，可进一步优化为位运算
var log2_ceil = function (n) {
	if (n < 0)
		return NaN;
	var k = 0;
	for (; n; n >>= 1, ++k);
	return k;
};

// REF: https://www.geeksforgeeks.org/smallest-power-of-2-greater-than-or-equal-to-n/
var min_mask = function (n) {
	n = n - 1;
	n = n | (n >> 1);
	n = n | (n >> 2);
	n = n | (n >> 4);
	n = n | (n >> 8);
	n = n | (n >> 16);
	return n + 1;
}