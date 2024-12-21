// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
declare namespace RuntimeExports {
    /**
     * @param {string=} returnType
     * @param {Array=} argTypes
     * @param {Object=} opts
     */
    function cwrap(ident: any, returnType?: string, argTypes?: any[], opts?: any): any;
    const HEAPF32: any;
    const HEAPF64: any;
    const HEAP_DATA_VIEW: any;
    const HEAP8: any;
    const HEAPU8: any;
    const HEAP16: any;
    const HEAPU16: any;
    const HEAP32: any;
    const HEAPU32: any;
    const HEAP64: any;
    const HEAPU64: any;
}
interface WasmModule {
  _version(): number;
  _create_buffer(_0: number, _1: number): number;
  _destroy_buffer(_0: number): void;
  _encode(_0: number, _1: number, _2: number, _3: number): void;
  _free_result(_0: number): void;
  _get_result_pointer(): number;
  _get_result_size(): number;
}

export type MainModule = WasmModule & typeof RuntimeExports;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
