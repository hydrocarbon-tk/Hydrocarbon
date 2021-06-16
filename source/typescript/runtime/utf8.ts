
export function fillByteBufferWithUTF8FromString(string, buffer: Uint8Array, max_length) {

    let i = 0, j = 0, l = string.length;

    for (; i < l && j < max_length - 4; i++) {

        const code_point = string.codePointAt(i);

        if ((code_point & 0x7F) == code_point) {
            buffer[j++] = (code_point & 0x7F);
        } else if ((code_point & 0x7FF) == code_point) {
            buffer[j++] = 0xC0 | ((code_point >> 6) & 0x1F);
            buffer[j++] = 0x80 | ((code_point & 0x3F));
        } else if ((code_point & 0xFFFF) == code_point) {
            buffer[j++] = 0xE0 | ((code_point >> 12) & 0xF);
            buffer[j++] = 0x80 | ((code_point >> 6) & 0x3F);
            buffer[j++] = 0x80 | ((code_point & 0x3F));
            if (code_point > 65535) {
                i++; l++;
            }
        } else {
            if (code_point > 65535) {
                i++; l++;
            }
            buffer[j++] = 0xF0 | ((code_point >> 18) & 0x7);
            buffer[j++] = 0x80 | ((code_point >> 12) & 0x3F);
            buffer[j++] = 0x80 | ((code_point >> 6) & 0x3F);
            buffer[j++] = 0x80 | ((code_point & 0x3F));
            i++;
        }
    }

    //Ensure input is null terminated
    buffer[j] = 0;

    return j;
}
