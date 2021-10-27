package hc_recognizer

import "strings"

type Token struct {
	source *[]uint8
	length int
	offset int
	_line  int
	path   *string
}

func newToken(
	source *[]uint8,
	length int,
	offset int,
	line int,
) *Token {

	token := Token{
		source: source,
		length: length,
		offset: offset,
		_line:  line,
		path:   nil,
	}

	return &token
}

func (tok *Token) setPath(path *string) *Token {
	tok.path = path
	return tok
}

func (old *Token) setSource(source *string) *Token {

	buf_source := []uint8(*source)

	new_tok := newToken(
		&buf_source,
		old.length,
		old.offset,
		old._line,
	)

	return new_tok
}

// Max returns the larger of x or y.
func Max(x, y int) int {
	if x < y {
		return y
	}
	return x
}

// Min returns the smaller of x or y.
func Min(x, y int) int {
	if x > y {
		return y
	}
	return x
}

func TokenFromRange(start *Token, end *Token) *Token {
	return newToken(
		start.source,
		end.offset-start.offset+end.length,
		start.offset,
		start._line,
	)
}

func (tok *Token) getSliceRange(start int, end int) (int, int) {

	if start < 0 {
		start = Max(tok.offset, tok.offset+tok.length+start)
	} else {
		start = Min(tok.offset+start, tok.offset+tok.length)
	}

	if end < 0 {
		end = Max(tok.offset, tok.offset+tok.length+end)

	} else {
		end = Min(tok.offset+end, tok.offset+tok.length)

	}

	if end < start {
		end = tok.offset
		start = tok.offset
	}

	return start, end
}

/*
Returns a range object compatible with the LSP specification
for a cursor bounded text range.

https://microsoft.github.io/language-server-protocol/specifications/specification-current/#range
*/
func (tok *Token) getRange(
	start int,
	end int,
) (
	start_line int,
	start_col int,
	end_line int,
	end_col int,
) {

	adjusted_start, adjusted_end := tok.getSliceRange(start, end)

	start_line = tok._line
	start_col = 0
	end_line = tok._line

	for i := adjusted_start; i > 0; i -= 1 {
		start_col++
		if (*tok.source)[i] == 10 {
			break
		}
	}

	end_col = start_col

	for i := adjusted_start; i < adjusted_end; {
		if (*tok.source)[i] == 10 {
			end_line++
			end_col = 0
		}

		i += 1
		end_col += 1
	}

	return
}

/**
 * Return a string slice of the source bounded buy the token
 * or a portion of the token.
 */
func (tok *Token) slice(start int, end int) []uint8 {

	adjusted_start, adjusted_end := tok.getSliceRange(start, end)

	return ((*tok.source)[adjusted_start:adjusted_end])
}

func (tok *Token) String() string {
	return string(tok.slice(0, tok.length))
}

func (tok *Token) len() int {
	return tok.length
}

func (tok *Token) line() int {

	if tok._line < 0 {
		tok._line = 0
		for i := 0; i < tok.offset; i++ {
			if (*tok.source)[i] == 10 {
				tok._line += 1
			}
		}
	}
	return tok._line
}

func (tok *Token) column() int {

	i := tok.offset

	for ; (*tok.source)[i] != ("\n")[0] && i >= 0; i -= 1 {
	}

	return tok.offset - i
}

func (tok *Token) blame() string {
	tab_size := 4
	window_size := 400

	// Get the text from the proceeding and the following lines;
	// If current line is at index 0 then there will be no proceeding line;
	// Likewise for the following line if current line is the last one in the string.

	column := tok.column()
	line_start := tok.offset - column
	char := column
	l := tok.line()
	str := string(*tok.source)
	length := len(str)
	sp := " "

	prev_start := 0
	next_start := 0
	next_end := 0
	i := 0

	//get the start of the proceeding line
	for i = line_start - 1; i > 0 && str[i] != 10; i -= 1 {
	}

	prev_start = i

	//get the end of the current line...
	for i = tok.offset + length; i < length && str[i] != 10; i += 1 {
	}
	next_start = i

	//and the next line
	for i += 1; i < length && str[i] != 10; i += 1 {
	}
	next_end = i

	pointer_pos := char
	if line_start > 0 {
		pointer_pos = char - 1
	}

	for i = line_start; i < tok.offset; i += 1 {
		if str[i] == 11 {
			pointer_pos += tab_size - 1
		}
	}

	prev_start = Max(prev_start, 0)
	line_start = Max(line_start, 0)
	next_start = Max(next_start, 0)
	//find the location of the offending symbol
	prev_start_append := 0
	line_start_append := 0
	next_start_append := 0
	if prev_start > 0 {
		prev_start_append = 1
	}
	if line_start > 0 {
		line_start_append = 1
	}
	if next_start > 0 {
		next_start_append = 1
	}

	prev_line := strings.Replace(strings.Replace(str[prev_start+prev_start_append:line_start], "\n", "", -1), "\t", "    ", -1)
	curr_line := strings.Replace(strings.Replace(str[line_start+line_start_append:next_start], "\n", "", -1), "\t", "    ", -1)
	next_line := strings.Replace(strings.Replace(str[next_start+next_start_append:next_end], "\n", "", -1), "\t", "    ", -1)

	//get the max line length;

	max_length := Max(Max(len(prev_line), len(curr_line)), len(next_line))
	min_length := Min(Min(len(prev_line), len(curr_line)), len(next_line))
	length_diff := max_length - min_length

	//Get the window size;
	w_size := window_size
	w_start := Max(0, Min(pointer_pos-w_size/2, max_length))
	w_end := Max(0, Min(pointer_pos+w_size/2, max_length))
	w_pointer_pos := Max(0, Min(pointer_pos, max_length)) - w_start

	if line_start == 0 {
		w_pointer_pos -= 1
	}

	//append the difference of line lengths to the end of the lines as space characters;

	//prev_line_o := (prev_line + strings.Repeat(sp, length_diff))[w_start:w_end]
	curr_line_o := (curr_line + strings.Repeat(sp, length_diff))[w_start:w_end]
	//next_line_o := (next_line + strings.Repeat(sp, length_diff))[w_start:w_end]

	trunc := ""

	if w_start != 0 {
		trunc = "..."
	}

	error_border := strings.Repeat("====", (len(curr_line_o) + len(line_number(l+4)) + 8 + len(trunc)))

	return strings.Join([]string{
		/* brdr */ error_border,
		///* prev */{{l - 1 > -1 ? line_number(l - 1) + trunc + prev_line_o + (prev_line_o.length < prev_line.length ? "..." : "") : ""}}},
		/* curr */ `${true ? line_number(l) + trunc + curr_line_o + (curr_line_o.length < curr_line.length ? "..." : "") : ""}`,
		/* arrw */ strings.Repeat("-", w_pointer_pos+len(trunc)+len(line_number(l+1))) + "^",
		///* next */`${next_start < str.length ? line_number(l + 1) + trunc + next_line_o + (next_line_o.length < next_line.length ? "..." : "") : ""}`,
		/* brdr */ error_border,
	}, "\n")
}

func line_number(n int) string {

	str := string(" ")
	str += strings.Repeat(" ", 3)
	str += string(n + 1)
	str += " "

	return str
}

func (tok *Token) GetType() uint32 { return 1 }

func (tok *Token) Iterate(yield HCObjIterator, par HCObj) {}

func (tok *Token) Double() float64 { return 0 }
