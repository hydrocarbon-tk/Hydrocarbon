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
    line: number;
    _type: number;
    previous_type: number; //JS ONLY
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
        this.active_token_productions = 0;
        this._type = 0;
        this.line = 0;
        this.current_byte = 0;
        this.previous_type = 0;
    }
    setToken(type_in: number, byte_length_in: number, token_length_in: number): number {
        this._type = type_in;
        this.byte_length = byte_length_in;
        this.token_length = token_length_in;
        return type_in;
    }
    get_byte_at(index: number): number {
        return this.input[index];
    };
    getType(USE_UNICODE: boolean) {
        let t: number = this._type;

        if (this.END())
            return 1;

        if ((t) == 0) {
            if (!(USE_UNICODE) || this.current_byte < 128) {
                t = getTypeAt(this.current_byte);
            }
            else {
                let code_point: number = get_utf8_code_point_at(this.byte_offset, this.input);
                this.byte_length = get_ut8_byte_length_from_code_point(code_point);
                t = getTypeAt(code_point);
            };
        };
        return t;
    }
    isSym(USE_UNICODE: boolean): boolean {
        if (this._type == 0 && this.getType(USE_UNICODE) == 2) {
            this.byte_length = get_ut8_byte_length_from_code_point(
                get_utf8_code_point_at(this.byte_offset, this.input)
            );
            this._type = 2;
        };
        return this._type == 2;
    }
    isNL(): boolean {
        if (this._type == 0 && (this.current_byte) == 10 || (this.current_byte) == 13) {
            this._type = 7;
        };
        return this._type == 7;
    }
    isSP(USE_UNICODE: boolean): boolean {
        if (this._type == 0 && (this.current_byte) == 32) {
            this._type = 8;
        };
        return this._type == 8;
    }
    isNum(): boolean {
        if (this._type == 0) {
            if (this.getType(false) == 5) {
                let l = this.input.length;
                let off = this.byte_offset;
                while ((off++ < l) && 47 < this.input[off] && this.input[off] < 58) {
                    this.byte_length += 1;
                    this.token_length += 1;
                };
                this._type = 5;
                return true;
            }

            else
                return false;
        }

        else
            return this._type == 5;
    }
    isUniID(): boolean {
        if (this._type == 0) {
            if (this.getType(true) == 3) {
                let l: number = this.input.length;
                let off: number = this.byte_offset;
                let prev_byte_len: number = this.byte_length;
                while ((off + this.byte_length) < l) {
                    let code_point = get_utf8_code_point_at(this.byte_offset + this.byte_length, this.input);
                    if ((96 & char_lu_table[code_point]) > 0) {
                        this.byte_length += get_ut8_byte_length_from_code_point(code_point);
                        prev_byte_len = this.byte_length;
                        this.token_length += 1;
                    }
                    else {
                        break;
                    };
                };
                this.byte_length = prev_byte_len;
                this._type = 3;
                return true;
            }

            else
                return false;
        }

        else
            return this._type == 3;
    }

    copy_in_place(): Lexer {
        const destination = new Lexer(this.input, this.input_len);
        destination.sync(this);
        return destination;
    }
    sync(source: Lexer) {

        this.byte_offset = source.byte_offset;
        this.byte_length = source.byte_length;
        this.token_length = source.token_length;
        this.token_offset = source.token_offset;
        this.prev_byte_offset = source.byte_offset;
        this.prev_token_offset = source.token_offset;
        this.line = source.line;
        this._type = source._type;
        this.current_byte = source.current_byte;
        this.active_token_productions = source.active_token_productions;
    }

    sync_offsets() {
        this.prev_byte_offset = this.byte_offset;
        this.prev_token_offset = this.token_offset;
    }

    peek_unroll_sync(source: Lexer) {

        this.byte_offset = source.byte_offset;
        this.byte_length = source.byte_length;
        this.token_length = source.token_length;
        this.token_offset = source.token_offset;
        this.prev_byte_offset = source.prev_byte_offset;
        this.prev_token_offset = source.prev_token_offset;
        this.line = source.line;
        this._type = source._type;
        this.current_byte = source.current_byte;
        this.active_token_productions = source.active_token_productions;
    }

    set_token_span_to(source: Lexer) {
        this.byte_length = source.prev_byte_offset - this.byte_offset;
        this.token_length = source.prev_token_offset - this.token_offset;
        this._type = source._type;
    };
    next() {
        this.byte_offset += this.byte_length;
        this.token_offset += this.token_length;
        this.previous_type = this._type;

        if (this.input.length <= this.byte_offset) {
            this._type = 1;
            this.byte_length = 0;
            this.token_length = 0;
            this.current_byte = 0;
        }
        else {
            this.current_byte = this.input[this.byte_offset];
            if (this.current_byte == 10)
                this.line += 1;

            this._type = 0;
            this.byte_length = 1;
            this.token_length = 1;
        };
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

export function compare(
    lexer: Lexer,
    data_offset: number,
    sequence_offset: number,
    byte_length: number,
    sequence: Uint8Array
): number {
    let i = data_offset;
    let j = sequence_offset;
    let len = j + byte_length;
    for (; j < len; i++, j++)
        if ((lexer.get_byte_at(i) != sequence[j]))
            return j - sequence_offset;
    ;
    return byte_length;
}
