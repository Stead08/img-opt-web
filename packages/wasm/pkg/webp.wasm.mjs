var createModule = (() => {
	var _scriptName = import.meta.url;

	return async function (moduleArg = {}) {
		var moduleRtn;

		var Module = moduleArg;
		var readyPromiseResolve, readyPromiseReject;
		var readyPromise = new Promise((resolve, reject) => {
			readyPromiseResolve = resolve;
			readyPromiseReject = reject;
		});
		var ENVIRONMENT_IS_WEB = typeof window == 'object';
		var ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != 'undefined';
		var ENVIRONMENT_IS_NODE =
			typeof process == 'object' &&
			typeof process.versions == 'object' &&
			typeof process.versions.node == 'string' &&
			process.type != 'renderer';
		if (ENVIRONMENT_IS_NODE) {
			const { createRequire } = await import('module');
			let dirname = import.meta.url;
			if (dirname.startsWith('data:')) {
				dirname = '/';
			}
			var require = createRequire(dirname);
		}
		var moduleOverrides = Object.assign({}, Module);
		var arguments_ = [];
		var thisProgram = './this.program';
		var quit_ = (status, toThrow) => {
			throw toThrow;
		};
		var scriptDirectory = '';
		function locateFile(path) {
			if (Module['locateFile']) {
				return Module['locateFile'](path, scriptDirectory);
			}
			return scriptDirectory + path;
		}
		var readAsync, readBinary;
		if (ENVIRONMENT_IS_NODE) {
			var fs = require('fs');
			var nodePath = require('path');
			if (!import.meta.url.startsWith('data:')) {
				scriptDirectory = nodePath.dirname(require('url').fileURLToPath(import.meta.url)) + '/';
			}
			readBinary = (filename) => {
				filename = isFileURI(filename) ? new URL(filename) : filename;
				var ret = fs.readFileSync(filename);
				return ret;
			};
			readAsync = async (filename, binary = true) => {
				filename = isFileURI(filename) ? new URL(filename) : filename;
				var ret = fs.readFileSync(filename, binary ? undefined : 'utf8');
				return ret;
			};
			if (!Module['thisProgram'] && process.argv.length > 1) {
				thisProgram = process.argv[1].replace(/\\/g, '/');
			}
			arguments_ = process.argv.slice(2);
			quit_ = (status, toThrow) => {
				process.exitCode = status;
				throw toThrow;
			};
		} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
			if (ENVIRONMENT_IS_WORKER) {
				scriptDirectory = self.location.href;
			} else if (typeof document != 'undefined' && document.currentScript) {
				scriptDirectory = document.currentScript.src;
			}
			if (_scriptName) {
				scriptDirectory = _scriptName;
			}
			if (scriptDirectory.startsWith('blob:')) {
				scriptDirectory = '';
			} else {
				scriptDirectory = scriptDirectory.substr(
					0,
					scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/') + 1
				);
			}
			{
				if (ENVIRONMENT_IS_WORKER) {
					readBinary = (url) => {
						var xhr = new XMLHttpRequest();
						xhr.open('GET', url, false);
						xhr.responseType = 'arraybuffer';
						xhr.send(null);
						return new Uint8Array(xhr.response);
					};
				}
				readAsync = async (url) => {
					if (isFileURI(url)) {
						return new Promise((resolve, reject) => {
							var xhr = new XMLHttpRequest();
							xhr.open('GET', url, true);
							xhr.responseType = 'arraybuffer';
							xhr.onload = () => {
								if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
									resolve(xhr.response);
									return;
								}
								reject(xhr.status);
							};
							xhr.onerror = reject;
							xhr.send(null);
						});
					}
					var response = await fetch(url, { credentials: 'same-origin' });
					if (response.ok) {
						return response.arrayBuffer();
					}
					throw new Error(response.status + ' : ' + response.url);
				};
			}
		} else {
		}
		var out = Module['print'] || console.log.bind(console);
		var err = Module['printErr'] || console.error.bind(console);
		Object.assign(Module, moduleOverrides);
		moduleOverrides = null;
		if (Module['arguments']) arguments_ = Module['arguments'];
		if (Module['thisProgram']) thisProgram = Module['thisProgram'];
		var wasmBinary = Module['wasmBinary'];
		var wasmMemory;
		var ABORT = false;
		var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
		function updateMemoryViews() {
			var b = wasmMemory.buffer;
			Module['HEAP8'] = HEAP8 = new Int8Array(b);
			Module['HEAP16'] = HEAP16 = new Int16Array(b);
			Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
			Module['HEAPU16'] = HEAPU16 = new Uint16Array(b);
			Module['HEAP32'] = HEAP32 = new Int32Array(b);
			Module['HEAPU32'] = HEAPU32 = new Uint32Array(b);
			Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
			Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
		}
		var __ATPRERUN__ = [];
		var __ATINIT__ = [];
		var __ATPOSTRUN__ = [];
		var runtimeInitialized = false;
		function preRun() {
			if (Module['preRun']) {
				if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
				while (Module['preRun'].length) {
					addOnPreRun(Module['preRun'].shift());
				}
			}
			callRuntimeCallbacks(__ATPRERUN__);
		}
		function initRuntime() {
			runtimeInitialized = true;
			callRuntimeCallbacks(__ATINIT__);
		}
		function postRun() {
			if (Module['postRun']) {
				if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
				while (Module['postRun'].length) {
					addOnPostRun(Module['postRun'].shift());
				}
			}
			callRuntimeCallbacks(__ATPOSTRUN__);
		}
		function addOnPreRun(cb) {
			__ATPRERUN__.unshift(cb);
		}
		function addOnInit(cb) {
			__ATINIT__.unshift(cb);
		}
		function addOnPostRun(cb) {
			__ATPOSTRUN__.unshift(cb);
		}
		var runDependencies = 0;
		var dependenciesFulfilled = null;
		function addRunDependency(id) {
			runDependencies++;
			Module['monitorRunDependencies']?.(runDependencies);
		}
		function removeRunDependency(id) {
			runDependencies--;
			Module['monitorRunDependencies']?.(runDependencies);
			if (runDependencies == 0) {
				if (dependenciesFulfilled) {
					var callback = dependenciesFulfilled;
					dependenciesFulfilled = null;
					callback();
				}
			}
		}
		function abort(what) {
			Module['onAbort']?.(what);
			what = 'Aborted(' + what + ')';
			err(what);
			ABORT = true;
			what += '. Build with -sASSERTIONS for more info.';
			var e = new WebAssembly.RuntimeError(what);
			readyPromiseReject(e);
			throw e;
		}
		var dataURIPrefix = 'data:application/octet-stream;base64,';
		var isDataURI = (filename) => filename.startsWith(dataURIPrefix);
		var isFileURI = (filename) => filename.startsWith('file://');
		function findWasmBinary() {
			if (Module['locateFile']) {
				var f = 'webp.wasm.wasm';
				if (!isDataURI(f)) {
					return locateFile(f);
				}
				return f;
			}
			return new URL('webp.wasm.wasm', import.meta.url).href;
		}
		var wasmBinaryFile;
		function getBinarySync(file) {
			if (file == wasmBinaryFile && wasmBinary) {
				return new Uint8Array(wasmBinary);
			}
			if (readBinary) {
				return readBinary(file);
			}
			throw 'both async and sync fetching of the wasm failed';
		}
		async function getWasmBinary(binaryFile) {
			if (!wasmBinary) {
				try {
					var response = await readAsync(binaryFile);
					return new Uint8Array(response);
				} catch {}
			}
			return getBinarySync(binaryFile);
		}
		async function instantiateArrayBuffer(binaryFile, imports) {
			try {
				var binary = await getWasmBinary(binaryFile);
				var instance = await WebAssembly.instantiate(binary, imports);
				return instance;
			} catch (reason) {
				err(`failed to asynchronously prepare wasm: ${reason}`);
				abort(reason);
			}
		}
		async function instantiateAsync(binary, binaryFile, imports) {
			if (
				!binary &&
				typeof WebAssembly.instantiateStreaming == 'function' &&
				!isDataURI(binaryFile) &&
				!isFileURI(binaryFile) &&
				!ENVIRONMENT_IS_NODE &&
				typeof fetch == 'function'
			) {
				try {
					var response = fetch(binaryFile, { credentials: 'same-origin' });
					var instantiationResult = await WebAssembly.instantiateStreaming(response, imports);
					return instantiationResult;
				} catch (reason) {
					err(`wasm streaming compile failed: ${reason}`);
					err('falling back to ArrayBuffer instantiation');
				}
			}
			return instantiateArrayBuffer(binaryFile, imports);
		}
		function getWasmImports() {
			return { a: wasmImports };
		}
		async function createWasm() {
			function receiveInstance(instance, module) {
				wasmExports = instance.exports;
				wasmMemory = wasmExports['d'];
				updateMemoryViews();
				addOnInit(wasmExports['e']);
				removeRunDependency('wasm-instantiate');
				return wasmExports;
			}
			addRunDependency('wasm-instantiate');
			function receiveInstantiationResult(result) {
				receiveInstance(result['instance']);
			}
			var info = getWasmImports();
			if (Module['instantiateWasm']) {
				try {
					return Module['instantiateWasm'](info, receiveInstance);
				} catch (e) {
					err(`Module.instantiateWasm callback failed with error: ${e}`);
					readyPromiseReject(e);
				}
			}
			wasmBinaryFile ??= findWasmBinary();
			try {
				var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info);
				receiveInstantiationResult(result);
				return result;
			} catch (e) {
				readyPromiseReject(e);
				return;
			}
		}
		class ExitStatus {
			name = 'ExitStatus';
			constructor(status) {
				this.message = `Program terminated with exit(${status})`;
				this.status = status;
			}
		}
		Module['ExitStatus'] = ExitStatus;
		var callRuntimeCallbacks = (callbacks) => {
			while (callbacks.length > 0) {
				callbacks.shift()(Module);
			}
		};
		Module['callRuntimeCallbacks'] = callRuntimeCallbacks;
		function getValue(ptr, type = 'i8') {
			if (type.endsWith('*')) type = '*';
			switch (type) {
				case 'i1':
					return HEAP8[ptr];
				case 'i8':
					return HEAP8[ptr];
				case 'i16':
					return HEAP16[ptr >> 1];
				case 'i32':
					return HEAP32[ptr >> 2];
				case 'i64':
					abort('to do getValue(i64) use WASM_BIGINT');
				case 'float':
					return HEAPF32[ptr >> 2];
				case 'double':
					return HEAPF64[ptr >> 3];
				case '*':
					return HEAPU32[ptr >> 2];
				default:
					abort(`invalid type for getValue: ${type}`);
			}
		}
		Module['getValue'] = getValue;
		var noExitRuntime = Module['noExitRuntime'] || true;
		Module['noExitRuntime'] = noExitRuntime;
		function setValue(ptr, value, type = 'i8') {
			if (type.endsWith('*')) type = '*';
			switch (type) {
				case 'i1':
					HEAP8[ptr] = value;
					break;
				case 'i8':
					HEAP8[ptr] = value;
					break;
				case 'i16':
					HEAP16[ptr >> 1] = value;
					break;
				case 'i32':
					HEAP32[ptr >> 2] = value;
					break;
				case 'i64':
					abort('to do setValue(i64) use WASM_BIGINT');
				case 'float':
					HEAPF32[ptr >> 2] = value;
					break;
				case 'double':
					HEAPF64[ptr >> 3] = value;
					break;
				case '*':
					HEAPU32[ptr >> 2] = value;
					break;
				default:
					abort(`invalid type for setValue: ${type}`);
			}
		}
		Module['setValue'] = setValue;
		var stackRestore = (val) => __emscripten_stack_restore(val);
		Module['stackRestore'] = stackRestore;
		var stackSave = () => _emscripten_stack_get_current();
		Module['stackSave'] = stackSave;
		var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder() : undefined;
		Module['UTF8Decoder'] = UTF8Decoder;
		var UTF8ArrayToString = (heapOrArray, idx = 0, maxBytesToRead = NaN) => {
			var endIdx = idx + maxBytesToRead;
			var endPtr = idx;
			while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
			if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
				return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
			}
			var str = '';
			while (idx < endPtr) {
				var u0 = heapOrArray[idx++];
				if (!(u0 & 128)) {
					str += String.fromCharCode(u0);
					continue;
				}
				var u1 = heapOrArray[idx++] & 63;
				if ((u0 & 224) == 192) {
					str += String.fromCharCode(((u0 & 31) << 6) | u1);
					continue;
				}
				var u2 = heapOrArray[idx++] & 63;
				if ((u0 & 240) == 224) {
					u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
				} else {
					u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
				}
				if (u0 < 65536) {
					str += String.fromCharCode(u0);
				} else {
					var ch = u0 - 65536;
					str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
				}
			}
			return str;
		};
		Module['UTF8ArrayToString'] = UTF8ArrayToString;
		var UTF8ToString = (ptr, maxBytesToRead) =>
			ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
		Module['UTF8ToString'] = UTF8ToString;
		var ___assert_fail = (condition, filename, line, func) =>
			abort(
				`Assertion failed: ${UTF8ToString(condition)}, at: ` +
					[
						filename ? UTF8ToString(filename) : 'unknown filename',
						line,
						func ? UTF8ToString(func) : 'unknown function'
					]
			);
		Module['___assert_fail'] = ___assert_fail;
		var __emscripten_memcpy_js = (dest, src, num) => HEAPU8.copyWithin(dest, src, src + num);
		Module['__emscripten_memcpy_js'] = __emscripten_memcpy_js;
		var getHeapMax = () => 2147483648;
		Module['getHeapMax'] = getHeapMax;
		var alignMemory = (size, alignment) => Math.ceil(size / alignment) * alignment;
		Module['alignMemory'] = alignMemory;
		var growMemory = (size) => {
			var b = wasmMemory.buffer;
			var pages = ((size - b.byteLength + 65535) / 65536) | 0;
			try {
				wasmMemory.grow(pages);
				updateMemoryViews();
				return 1;
			} catch (e) {}
		};
		Module['growMemory'] = growMemory;
		var _emscripten_resize_heap = (requestedSize) => {
			var oldSize = HEAPU8.length;
			requestedSize >>>= 0;
			var maxHeapSize = getHeapMax();
			if (requestedSize > maxHeapSize) {
				return false;
			}
			for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
				var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
				overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
				var newSize = Math.min(
					maxHeapSize,
					alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536)
				);
				var replacement = growMemory(newSize);
				if (replacement) {
					return true;
				}
			}
			return false;
		};
		Module['_emscripten_resize_heap'] = _emscripten_resize_heap;
		var getCFunc = (ident) => {
			var func = Module['_' + ident];
			return func;
		};
		Module['getCFunc'] = getCFunc;
		var writeArrayToMemory = (array, buffer) => {
			HEAP8.set(array, buffer);
		};
		Module['writeArrayToMemory'] = writeArrayToMemory;
		var lengthBytesUTF8 = (str) => {
			var len = 0;
			for (var i = 0; i < str.length; ++i) {
				var c = str.charCodeAt(i);
				if (c <= 127) {
					len++;
				} else if (c <= 2047) {
					len += 2;
				} else if (c >= 55296 && c <= 57343) {
					len += 4;
					++i;
				} else {
					len += 3;
				}
			}
			return len;
		};
		Module['lengthBytesUTF8'] = lengthBytesUTF8;
		var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
			if (!(maxBytesToWrite > 0)) return 0;
			var startIdx = outIdx;
			var endIdx = outIdx + maxBytesToWrite - 1;
			for (var i = 0; i < str.length; ++i) {
				var u = str.charCodeAt(i);
				if (u >= 55296 && u <= 57343) {
					var u1 = str.charCodeAt(++i);
					u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
				}
				if (u <= 127) {
					if (outIdx >= endIdx) break;
					heap[outIdx++] = u;
				} else if (u <= 2047) {
					if (outIdx + 1 >= endIdx) break;
					heap[outIdx++] = 192 | (u >> 6);
					heap[outIdx++] = 128 | (u & 63);
				} else if (u <= 65535) {
					if (outIdx + 2 >= endIdx) break;
					heap[outIdx++] = 224 | (u >> 12);
					heap[outIdx++] = 128 | ((u >> 6) & 63);
					heap[outIdx++] = 128 | (u & 63);
				} else {
					if (outIdx + 3 >= endIdx) break;
					heap[outIdx++] = 240 | (u >> 18);
					heap[outIdx++] = 128 | ((u >> 12) & 63);
					heap[outIdx++] = 128 | ((u >> 6) & 63);
					heap[outIdx++] = 128 | (u & 63);
				}
			}
			heap[outIdx] = 0;
			return outIdx - startIdx;
		};
		Module['stringToUTF8Array'] = stringToUTF8Array;
		var stringToUTF8 = (str, outPtr, maxBytesToWrite) =>
			stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
		Module['stringToUTF8'] = stringToUTF8;
		var stackAlloc = (sz) => __emscripten_stack_alloc(sz);
		Module['stackAlloc'] = stackAlloc;
		var stringToUTF8OnStack = (str) => {
			var size = lengthBytesUTF8(str) + 1;
			var ret = stackAlloc(size);
			stringToUTF8(str, ret, size);
			return ret;
		};
		Module['stringToUTF8OnStack'] = stringToUTF8OnStack;
		var ccall = (ident, returnType, argTypes, args, opts) => {
			var toC = {
				string: (str) => {
					var ret = 0;
					if (str !== null && str !== undefined && str !== 0) {
						ret = stringToUTF8OnStack(str);
					}
					return ret;
				},
				array: (arr) => {
					var ret = stackAlloc(arr.length);
					writeArrayToMemory(arr, ret);
					return ret;
				}
			};
			function convertReturnValue(ret) {
				if (returnType === 'string') {
					return UTF8ToString(ret);
				}
				if (returnType === 'boolean') return Boolean(ret);
				return ret;
			}
			var func = getCFunc(ident);
			var cArgs = [];
			var stack = 0;
			if (args) {
				for (var i = 0; i < args.length; i++) {
					var converter = toC[argTypes[i]];
					if (converter) {
						if (stack === 0) stack = stackSave();
						cArgs[i] = converter(args[i]);
					} else {
						cArgs[i] = args[i];
					}
				}
			}
			var ret = func(...cArgs);
			function onDone(ret) {
				if (stack !== 0) stackRestore(stack);
				return convertReturnValue(ret);
			}
			ret = onDone(ret);
			return ret;
		};
		Module['ccall'] = ccall;
		var cwrap = (ident, returnType, argTypes, opts) => {
			var numericArgs =
				!argTypes || argTypes.every((type) => type === 'number' || type === 'boolean');
			var numericRet = returnType !== 'string';
			if (numericRet && numericArgs && !opts) {
				return getCFunc(ident);
			}
			return (...args) => ccall(ident, returnType, argTypes, args, opts);
		};
		Module['cwrap'] = cwrap;
		var wasmImports = { a: ___assert_fail, c: __emscripten_memcpy_js, b: _emscripten_resize_heap };
		var wasmExports;
		createWasm();
		var ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports['e'])();
		var _version = (Module['_version'] = () =>
			(_version = Module['_version'] = wasmExports['f'])());
		var _create_buffer = (Module['_create_buffer'] = (a0, a1) =>
			(_create_buffer = Module['_create_buffer'] = wasmExports['g'])(a0, a1));
		var _destroy_buffer = (Module['_destroy_buffer'] = (a0) =>
			(_destroy_buffer = Module['_destroy_buffer'] = wasmExports['h'])(a0));
		var _encode = (Module['_encode'] = (a0, a1, a2, a3) =>
			(_encode = Module['_encode'] = wasmExports['i'])(a0, a1, a2, a3));
		var _free_result = (Module['_free_result'] = (a0) =>
			(_free_result = Module['_free_result'] = wasmExports['j'])(a0));
		var _get_result_pointer = (Module['_get_result_pointer'] = () =>
			(_get_result_pointer = Module['_get_result_pointer'] = wasmExports['k'])());
		var _get_result_size = (Module['_get_result_size'] = () =>
			(_get_result_size = Module['_get_result_size'] = wasmExports['l'])());
		var __emscripten_stack_restore = (a0) => (__emscripten_stack_restore = wasmExports['n'])(a0);
		var __emscripten_stack_alloc = (a0) => (__emscripten_stack_alloc = wasmExports['o'])(a0);
		var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports['p'])();
		var dynCall_ji = (Module['dynCall_ji'] = (a0, a1) =>
			(dynCall_ji = Module['dynCall_ji'] = wasmExports['q'])(a0, a1));
		var dynCall_jii = (Module['dynCall_jii'] = (a0, a1, a2) =>
			(dynCall_jii = Module['dynCall_jii'] = wasmExports['r'])(a0, a1, a2));
		var dynCall_jiiiii = (Module['dynCall_jiiiii'] = (a0, a1, a2, a3, a4, a5) =>
			(dynCall_jiiiii = Module['dynCall_jiiiii'] = wasmExports['s'])(a0, a1, a2, a3, a4, a5));
		Module['cwrap'] = cwrap;
		var calledRun;
		dependenciesFulfilled = function runCaller() {
			if (!calledRun) run();
			if (!calledRun) dependenciesFulfilled = runCaller;
		};
		function run() {
			if (runDependencies > 0) {
				return;
			}
			preRun();
			if (runDependencies > 0) {
				return;
			}
			function doRun() {
				if (calledRun) return;
				calledRun = true;
				Module['calledRun'] = true;
				if (ABORT) return;
				initRuntime();
				readyPromiseResolve(Module);
				Module['onRuntimeInitialized']?.();
				postRun();
			}
			if (Module['setStatus']) {
				Module['setStatus']('Running...');
				setTimeout(() => {
					setTimeout(() => Module['setStatus'](''), 1);
					doRun();
				}, 1);
			} else {
				doRun();
			}
		}
		if (Module['preInit']) {
			if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
			while (Module['preInit'].length > 0) {
				Module['preInit'].pop()();
			}
		}
		run();
		moduleRtn = readyPromise;

		return moduleRtn;
	};
})();
export default createModule;
