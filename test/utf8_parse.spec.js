function string_to_utf(string, buffer = []) {
    for (let i = 0; i < string.length; i++) {

        const code_point = string.codePointAt(i);

        if ((code_point & 0x7F) == code_point) {
            buffer.push(code_point & 0x7F);
        } else if ((code_point & 0x7FF) == code_point) {
            const
                a = 0xC0 | ((code_point >> 6) & 0x1F),
                b = 0x80 | ((code_point & 0x3F));
            buffer.push(a, b);
        } else if ((code_point & 0xFFFF) == code_point) {
            const
                a = 0xE0 | ((code_point >> 12) & 0xF),
                b = 0x80 | ((code_point >> 6) & 0x3F),
                c = 0x80 | ((code_point & 0x3F));
            buffer.push(a, b, c);
            i++;
        } else {
            const
                a = 0xF0 | ((code_point >> 18) & 0x7),
                b = 0x80 | ((code_point >> 12) & 0x3F),
                c = 0x80 | ((code_point >> 6) & 0x3F),
                d = 0x80 | ((code_point & 0x3F));
            buffer.push(a, b, c, d);
            i++;
        }
    }
    return buffer;
}


assert_group("String to UTF8", () => {
    assert(string_to_utf("🙂") == [0xF0, 0x9F, 0x99, 0x82]);
    assert(string_to_utf("➃") == [0xE2, 0x9E, 0x83]);
    assert(string_to_utf("✍") == [0xE2, 0x9C, 0x8D]);
    assert(string_to_utf("Ɓ") == [0xC6, 0x81]);

    for (var i = 100; i < 127; i++) {
        if (i == 10) continue;
        assert(name("\\" + String.fromCharCode(i) + ` to utf8 [0x${i.toString(16)}]`),
            string_to_utf(String.fromCharCode(i)) == [i]);
    }
});


function utf8ToCodePoint(buffer) {

    const a = buffer[0];

    let flag = 0xE;

    if (a & 0x80) {

        flag = a & 0xF0;

        const b = buffer[1];

        if (flag & 0xE0) {

            flag = a & 0xF8;

            const c = buffer[2];

            if (flag == 0xF0)
                return ((a & 0x7) << 18) | ((b & 0x3F) << 12) | ((c & 0x3F) << 6) | (buffer[3] & 0x3F);

            else if (flag == 0xE0)
                return ((a & 0xF) << 12) | ((b & 0x3F) << 6) | (c & 0x3F);

        } else if (flag == 0xC) return ((a & 0x1F) << 6) | b & 0x3F;

    } else return a;

    return 0;
}

assert_group("UTF8 to String", () => {
    assert(utf8ToCodePoint([0xFF, 0xFF]) == 0);
    assert(utf8ToCodePoint([128, 0xFF]) == 0);
    assert(utf8ToCodePoint([127, 0xFF]) == 127);
    assert(utf8ToCodePoint([129, 0xFF]) == 0);
    assert(utf8ToCodePoint([210, 0xFF]) == 0);
    assert(String.fromCodePoint(utf8ToCodePoint(string_to_utf("🙂"))) == "🙂");
    assert(String.fromCodePoint(utf8ToCodePoint(string_to_utf("➃"))) == "➃");
    assert(String.fromCodePoint(utf8ToCodePoint(string_to_utf("✍"))) == "✍");
    assert(String.fromCodePoint(utf8ToCodePoint(string_to_utf("A"))) == "A");
});

function utf8_1(utf, index) { return utf == index; }

assert_group("Utf8 single byte 0-127", () => {
    assert(utf8_1(0b0001000, 8) == true);
    assert(utf8_1(0b1001000, 8) == false);
    assert(utf8_1(0b0010000, 16) == true);
    assert(utf8_1(0b1000000, 16) == false);
});

function utf8_2(buffer, index) {

    const
        a = buffer[0],
        b = buffer[1];

    return ((a & 0b11100000) == 0b11000000) && index == (((a & 0x1F) << 6) | (b & 0x3F));
}

assert_group("Utf8 two bytes 128-2047", () => {
    assert(utf8_2(string_to_utf("Ɓ"), "Ɓ".codePointAt(0)) == true);
});

function utf8_3(buffer, index) {

    const
        a = buffer[0],
        b = buffer[1],
        c = buffer[2];

    return ((a & 0b11110000) == 0b11100000) && index == (((a & 0xF) << 12) | ((b & 0x3F) << 6) | ((c & 0x3F)));
}

assert_group("Utf8 three bytes 2048-65535", () => {
    assert(utf8_3(string_to_utf("➃"), "➃".codePointAt(0)) == true);
});

function utf8_4(buffer, index) {

    const
        a = buffer[0],
        b = buffer[1],
        c = buffer[2],
        d = buffer[3];

    return ((a & 0b11111000) == 0b11110000) && index == (((a & 0x7) << 18) | ((b & 0x3F) << 12) | ((c & 0x3F) << 6) | (d & 0x3F));
}

assert_group("Utf8 four bytes 65536-1114111", () => {
    assert(utf8_4(string_to_utf("🙂"), "🙂".codePointAt(0)) == true);
    assert(utf8_4(string_to_utf("➃"), "➃".codePointAt(0)) == false);
});

import { characterToUTF8 } from "../build/library/utilities/symbol.js";

assert_group("Hydrocarbon UTF Symbols", () => {
    assert(characterToUTF8(' ') == 'utf8_1(l,32)');
    assert(characterToUTF8('🙂') == 'utf8_4(l,128578)');
    assert(characterToUTF8('➃') == 'utf8_3(l,10115)');
});
