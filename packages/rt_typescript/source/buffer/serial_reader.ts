import { ByteReader, StringType } from "@hctoolkit/common";

export class SerialReader extends ByteReader {
    buffer: ArrayBuffer;
    cursor: number;
    dv: DataView;
    interned_strings: Map<number, string>;

    constructor(buffer: ArrayBuffer) {
        super();
        this.buffer = buffer;
        this.cursor = 0;
        this.dv = new DataView(this.buffer);
        this.interned_strings = new Map;
    }
    peek_double() { return this.dv.getFloat64(this.cursor); }
    peek_float() { return this.dv.getFloat32(this.cursor); }
    peek_double_word() { return this.dv.getFloat64(this.cursor); }
    peek_word() { return this.dv.getUint32(this.cursor); }
    peek_short() { return this.dv.getUint16(this.cursor); }
    peek_byte() { return this.dv.getUint8(this.cursor); }
    assert_double(val: number) { if (this.read_double() == val) { return true; } return false; }
    assert_double_word(val: number) { if (this.read_double_word() == val) { return true; } return false; }
    assert_float(val: number) { if (this.read_float() == (val >>> 0)) { return true; } return false; }
    assert_word(val: number) { if (this.read_word() == (val >>> 0)) { return true; } return false; }
    assert_short(val: number) { if (this.read_short() == (val >>> 0)) { return true; } return false; }
    assert_byte(val: number) { if (this.read_byte() == (val >>> 0)) { return true; } return false; }
    read_float() { const val = this.peek_float(); this.cursor += 4; return val; }
    read_double() { const val = this.peek_double(); this.cursor += 8; return val; }
    read_double_word() { const val = this.peek_double_word(); this.cursor += 8; return val; }
    read_word() { const val = this.peek_word(); this.cursor += 4; return val >>> 0; }
    read_short() { const val = this.peek_short(); this.cursor += 2; return val >>> 0; }
    read_byte() { const val = this.peek_byte(); this.cursor += 1; return val >>> 0; }
    read_string(): string {

        const ptr = this.cursor;

        if (this.assert_byte(StringType)) {

            let str: string[] = [];

            while (true) {

                let code_point = 0;

                let byte = this.read_byte();

                if (byte == 0xFF || byte == 0xF8) {
                    if (byte == 0xFF) {
                        const string = (str.join(""));
                        this.interned_strings.set(ptr, string);
                        return string;
                    } else if (byte == 0xF8) {
                        const ptr = this.read_short();
                        return <string>this.interned_strings.get(ptr);
                    }
                    break;
                }

                if (byte & 0x80) {

                    const a = byte;

                    if ((a & 0xF8) == 0xF0) {
                        code_point = ((a & 0x7) << 18)
                            | ((this.read_byte() & 0x3F) << 12)
                            | ((this.read_byte() & 0x3F) << 6)
                            | (this.read_byte() & 0x3F);
                    } else if ((a & 0xF0) == 0xE0) {
                        code_point = ((a & 0xF) << 12) | ((this.read_byte() & 0x3F) << 6) | (this.read_byte() & 0x3F);
                    } else if ((a & 0xE0) == 0xC0) {
                        code_point = ((a & 0x1F) << 6) | this.read_byte() & 0x3F;
                    } else {
                        throw new Error("Error Parsing UTF8 String");
                    }
                } else {
                    code_point = byte & 0xFF;
                }

                str.push(String.fromCodePoint(code_point));
            }

            if (!this.assert_word(0xFF))
                throw new Error("Could not decode string");
        }

        return "";
    }
}
