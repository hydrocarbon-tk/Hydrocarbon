use super::lookup_table::CHAR_LU_TABLE;

pub fn get_utf8_byte_length_from_code_point(codepoint: u32) -> u32 {
    if (codepoint) == 0 {
        return 1;
    } else if (codepoint & 0x7F) == codepoint {
        return 1;
    } else if (codepoint & 0x7FF) == codepoint {
        return 2;
    } else if (codepoint & 0xFFFF) == codepoint {
        return 3;
    } else {
        return 4;
    }
}

pub fn get_token_length_from_code_point(codepoint: u32) -> u32 {
    if codepoint > 0xFFFF {
        return 2;
    }
    return 1;
}

pub fn get_utf8_code_point_from(word: u32) -> u32 {
    if (word & 0x80000000) > 0 {
        let a = (word >> 24) & 0xFF;
        let b = (word >> 16) & 0xFF;
        let c = (word >> 8) & 0xFF;
        let d = (word >> 0) & 0xFF;

        if (word & 0xE0C00000) == 0xC0800000 {
            ((a & 0x1F) << 6) | b & 0x3F
        } else if (word & 0xF0C0C000) == 0xE0808000 {
            ((a & 0xF) << 12) | ((b & 0x3F) << 6) | (c & 0x3F)
        } else if (word & 0xF8C0C0C0) == 0xF0808080 {
            ((a & 0x7) << 18) | ((b & 0x3F) << 12) | ((c & 0x3F) << 6) | (d & 0x3F)
        } else {
            0
        }
    } else {
        (word >> 24) & 0xFF
    }
}

pub fn get_token_class_from_codepoint(codepoint: u32) -> u32 {
    (CHAR_LU_TABLE[codepoint as usize] & 0x1F) as u32
}
