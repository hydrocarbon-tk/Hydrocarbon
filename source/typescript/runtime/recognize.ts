import {
    KernelStateBuffer,
    run
} from './kernel_next.js';
import { fillByteBufferWithUTF8FromString } from './common/utf8.js';

export function recognize(
    instructions: Uint32Array,
    input: string,
    start_pointer: number,
): {
    valid: KernelStateBuffer,
    invalid: KernelStateBuffer;
} {
    const temp_buffer = new Uint8Array((input.length + 1) * 4);

    const actual_length = fillByteBufferWithUTF8FromString(input, temp_buffer, temp_buffer.length);

    const input_buffer = new Uint8Array(temp_buffer.buffer, 0, actual_length);

    return run(
        instructions,
        input_buffer,
        input_buffer.length,
        start_pointer
    );
}