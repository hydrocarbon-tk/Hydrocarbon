export const init_table = lu_table => {
    char_lu_table = lu_table;
};

export let char_lu_table: Uint8Array = null;

/////////////////////////////////////////////
// LEXER
/////////////////////////////////////////////

export class Lexer {
    byte_offset: number;
    token_offset: number;
    token_length: number;
    byte_length: number;
    prev_byte_offset: number;
    prev_token_offset: number;
    skip_token_offset: number;
    line: number;
    token_type: number;
    current_byte: number;
    input: Uint8Array;
    input_len: number;
    active_token_productions: number;
    constructor(input_buffer: Uint8Array, input_len_in: number) {
        this.input = input_buffer;
        this.input_len = input_len_in;
        this.byte_offset = 0;
        this.byte_length = 0;
        this.token_length = 0;
        this.token_offset = 0;
        this.prev_byte_offset = 0;
        this.prev_token_offset = 0;
        this.skip_token_offset = 0;
        this.active_token_productions = 0;
        this.token_type = 0;
        this.line = 0;
        this.current_byte = 0;
    }

    code_point() {
        const cp = get_utf8_code_point_at(this.byte_offset, this.input);
        this.byte_length = get_ut8_byte_length_from_code_point(cp);
        this.token_length = get_token_length_from_code_point(cp);
        return cp;
    }

    class() {
        return getTypeAt(this.code_point());
    }

    byte() {
        this.byte_length = 1;
        this.token_length = 1;
        return this.current_byte;
    }

    copy_in_place(): Lexer {
        const destination = new Lexer(this.input, this.input_len);
        destination.peek_unroll_sync(this);
        return destination;
    }

    peek_unroll_sync(source: Lexer) {

        this.byte_offset = source.byte_offset;
        this.byte_length = source.byte_length;
        this.token_length = source.token_length;
        this.token_offset = source.token_offset;
        this.prev_byte_offset = source.prev_byte_offset;
        this.prev_token_offset = source.prev_token_offset;
        this.line = source.line;
        this.token_type = source.token_type;
        this.current_byte = source.current_byte;
        this.active_token_productions = source.active_token_productions;
    }

    peek() {
        this.byte_offset += this.byte_length;
        this.token_offset += this.token_length;

        if (this.input.length <= this.byte_offset) {
            this.token_type = 1;
            this.byte_length = 0;
            this.token_length = 0;
            this.current_byte = 0;
        } else {

            this.current_byte = this.input[this.byte_offset];

            if (this.current_byte == 10)
                this.line += 1;

            this.token_type = 0;
            this.byte_length = 1;
            this.token_length = 1;
        };
    }

    reset() {
        if (this.prev_byte_offset != this.byte_offset) {
            this.byte_offset = this.prev_byte_offset;
            this.prev_token_offset = this.token_offset;
            this.token_length = 1;
            this.byte_length = 1;
            this.token_type = 0;
        }
    }

    next() {
        this.peek();
        this.prev_byte_offset = this.byte_offset;
        this.prev_token_offset = this.token_offset;
    }
    END(): boolean { return this.byte_offset >= this.input.length; };
}
/////////////////////////////////////////////
// OTHER FUNCTIONS
/////////////////////////////////////////////
function get_ut8_byte_length_from_code_point(code_point: number): number {
    if ((code_point) == 0) {
        return 1;
    }
    else if ((code_point & 0x7F) == code_point) {
        return 1;
    }
    else if ((code_point & 0x7FF) == code_point) {
        return 2;
    }
    else if ((code_point & 0xFFFF) == code_point) {
        return 3;
    }
    else {
        return 4;
    };
}

function get_token_length_from_code_point(code_point: number): number {
    if (code_point > 0xFFFF)
        return 2;
    return 1;
}

function get_utf8_code_point_at(index: number, buffer: Uint8Array): number {
    const flag = +buffer[index + 0] << 24
        | (buffer[index + 1] ?? 0) << 16
        | (buffer[index + 2] ?? 0) << 8
        | (buffer[index + 3] ?? 0);

    const a = buffer[index + 0];
    const b = (+buffer[index + 1] & 0x3F);
    const c = (+buffer[index + 2] & 0x3F);
    const d = (+buffer[index + 3] & 0x3F);

    if (flag & 0x80000000) {

        if ((flag & 0xE0C00000) >>> 0 == 0xC0800000)
            return ((a & 0x1F) << 6) | b;

        if ((flag & 0xF0C0C000) >>> 0 == 0xE0808000)
            return ((a & 0xF) << 12) | (b << 6) | c;

        if ((flag & 0xF8C0C0C0) >>> 0 == 0xF0808080)
            return ((a & 0x7) << 18) | (b << 12) | (c << 6) | d;

    } else
        return a;

    return 0;
}

function getTypeAt(code_point: number): number { return (char_lu_table[code_point] & 0x1F); }

