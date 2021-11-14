package hc_kernel

// General UTF8 Methods

func get_utf8_code_point_at(index uint32, buffer []uint8) uint32 {
	flag := (uint(buffer[index+0]) << 24)

	a := (uint32(buffer[index+0]))

	if (flag & 0x80000000) > 0 {

		b := (uint32(buffer[index+1]) & 0x3F)

		flag |= (uint(buffer[index+1]) << 16)

		if (flag & 0xE0C00000) == 0xC0800000 {
			return ((a & 0x1F) << 6) | b
		}

		flag |= uint(buffer[index+2]) << 8

		c := (uint32(buffer[index+2]) & 0x3F)

		if (flag & 0xF0C0C000) == 0xE0808000 {
			return ((a & 0xF) << 12) | (b << 6) | c
		}

		flag |= uint(buffer[index+3])

		if (flag & 0xF8C0C0C0) == 0xF0808080 {
			d := (uint32(buffer[index+3]) & 0x3F)
			return ((a & 0x7) << 18) | (b << 12) | (c << 6) | d
		}

	} else {
		return a
	}

	return 0
}

func get_utf8_byte_length_from_code_point(code_point uint32) uint32 {
	if (code_point) == 0 {
		return 1
	} else if (code_point & 0x7F) == code_point {
		return 1
	} else if (code_point & 0x7FF) == code_point {
		return 2
	} else if (code_point & 0xFFFF) == code_point {
		return 3
	} else {
		return 4
	}
}

func get_token_length_from_code_point(code_point uint32) uint32 {
	if code_point > 0xFFFF {
		return 2
	}
	return 1
}

// Primary Structure
