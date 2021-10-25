pub fn get_utf8_byte_length_from_code_point(code_point: u32) -> u32 {
    if (code_point) == 0 {
        return 1;
    } else if (code_point & 0x7F) == code_point {
        return 1;
    } else if (code_point & 0x7FF) == code_point {
        return 2;
    } else if (code_point & 0xFFFF) == code_point {
        return 3;
    } else {
        return 4;
    }
}

pub fn get_token_length_from_code_point(code_point: u32) -> u32 {
    if code_point > 0xFFFF {
        return 2;
    }
    return 1;
}

pub fn get_utf8_code_point_at(index: usize, buffer: &[u8]) -> u32 {
    let a: u32 = buffer[(index + 0)] as u32;
    let b: u32 = buffer[(index + 1)] as u32;
    let c: u32 = buffer[(index + 2)] as u32;
    let d: u32 = buffer[(index + 3)] as u32;

    let flag: u32 = a << 24 | b << 16 | c << 8 | d;

    if (flag & 0x80000000) > 0 {
        if (flag & 0xE0C00000) == 0xC0800000 {
            return ((a & 0x1F) << 6) | b;
        }

        if (flag & 0xF0C0C000) == 0xE0808000 {
            return ((a & 0xF) << 12) | (b << 6) | c;
        }

        if (flag & 0xF8C0C0C0) == 0xF0808080 {
            return ((a & 0x7) << 18) | (b << 12) | (c << 6) | d;
        }
    } else {
        return a;
    };

    0
}
