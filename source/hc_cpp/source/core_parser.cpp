#include "hc_cpp/include/core_parser.h"
namespace HYDROCARBON
{
    /////////////////////////////////////////////
    // PARSER STATE
    /////////////////////////////////////////////

    ParserState::ParserState(u8 *input_buffer, u32 input_len_in)
        : lexer()
    {
        stack.reserve(64);
        stash.reserve(64);
        rules.reserve(512);

        origin = nullptr;

        input = input_buffer;

        state = createState(1);
        input_len = input_len_in;
        origin_fork = 0;
        prod = -1;

        VALID = true;
        COMPLETED = false;
        refs = 0;
    }
    void ParserState::sync(ParserState *ptr)
    {
        if ((ptr) == this)
            return;
    }

    u32 ParserState::get_stack_len()
    {
        return stack.size();
    }

    u32 ParserState::get_rules_len()
    {
        return rules.size();
    }
    u32 ParserState::get_input_len()
    {
        return input_len;
    }

    void ParserState::push_fn(StackFunction stack_val, i32 stash_val)
    {
        stack.push_back(stack_val);
        stash.push_back(stash_val);
    }

    Input ParserState::get_input_array()
    {
        Input input_out = {input, input_len};
        return input_out;
    }

    u8 ParserState::get_byte_from_input(u32 index)
    {
        return input[index];
    }

    void ParserState::reset(Lexer &origin, u32 stack_ptr, u32 rules_ptr)
    {
        rules.resize(rules_ptr);
        stack.resize(stack_ptr);
        stash.resize(stack_ptr);

        lexer.sync(origin);
    }

    ParserState &ParserState::fork(ParserStateBuffer &process_buffer)
    {
        ParserState *fork = process_buffer.get_recycled_ParserState(*this);
        ParserState &forked_state = *fork;

        auto len = get_stack_len();
        for (u32 i = 0; i < len; i++)
        {
            forked_state.stash.push_back(stash[i]);
            forked_state.stack.push_back(stack[i]);
        }

        //Increment the refs count to prevent the
        //ParserState from being recycled.
        refs++;
        forked_state.origin = this;
        forked_state.origin_fork = get_rules_len();
        forked_state.active_token_productions = active_token_productions;
        forked_state.lexer.sync(lexer);
        forked_state.state = state;
        forked_state.prod = prod;
        forked_state.VALID = true;

        process_buffer.add_state_pointer(fork);

        return *fork;
    }

    void ParserState::add_rule(u32 val)
    {
        rules.push_back(val);
    }

    /////////////////////////////////////////////
    // PARSER STATE Iterator
    /////////////////////////////////////////////

    ParserStateIterator::ParserStateIterator(ParserState &state)
    {
        auto *active = &state;

        refs.push_back(active);

        while (active->origin)
        {
            active = active->origin;
            refs.push_back(active);
        }

        auto last = refs.back();

        refs.pop_back();

        current = last;
        limit = refs.size() > 0 ? refs.back()->origin_fork : last->get_rules_len();
        index = 0;
        valid = true;
    }

    bool ParserStateIterator::is_valid()
    {
        return valid;
    }

    u16 ParserStateIterator::next()
    {
        if (index >= limit)
        {
            if (refs.size() > 0)
            {
                auto last = refs.back();
                refs.pop_back();
                index = 0;
                limit = refs.size() > 0 ? refs.back()->origin_fork : last->get_rules_len();
                current = last;
            }
            else
            {
                valid = false;
                return 0;
            }
        }

        return current->rules[index++];
    }

    /////////////////////////////////////////////
    // PARSER STATE BUFFER
    /////////////////////////////////////////////

    ParserStateBuffer::ParserStateBuffer() {}

    ParserState *ParserStateBuffer::remove_state_at_index(i32 index)
    {
        auto temp_location = data[index];
        data.erase(data.begin() + index);
        return temp_location;
    }
    u32 ParserStateBuffer::len()
    {
        return data.size();
    }
    ParserState *ParserStateBuffer::create_data(u8 *input, u32 input_len)
    {
        ParserState *state = new ParserState{input, input_len};

        data.push_back(state);

        return state;
    }
    void ParserStateBuffer::add_state_pointer(ParserState *state)
    {
        data.push_back(state);
    }
    u32 ParserStateBuffer::add_state_pointer_and_sort(ParserState *state_pointer)
    {
        auto index = 0;

        while (index < data.size())
        {
            auto exist_ref = data[index];

            if (state_pointer->VALID &&
                (!exist_ref->VALID))
            {
                break;
            }
            else
            {
                if (exist_ref->lexer.byte_offset < state_pointer->lexer.byte_offset)
                {
                    break;
                }
            }
            index++;
        }

        data.insert(data.begin() + index, state_pointer);

        return data.size();
    }
    bool ParserStateBuffer::have_valid()
    {
        return data.size() > 0 && data[0]->VALID;
    }
    ParserState *ParserStateBuffer::get_valid_parser_state()
    {
        if (have_valid())
        {
            return remove_state_at_index(0);
        }
        return nullptr;
    }
    ParserState &ParserStateBuffer::get_mut_state(u32 index)
    {
        return *data[index];
    }
    ParserState &ParserStateBuffer::get_ref_state(u32 index)
    {
        return *data[index];
    }

    ParserState *ParserStateBuffer::get_recycled_ParserState(ParserState &state)
    {
        if (len() > 0)
        {
            auto i = 0;
            while (i < len())
            {
                auto ref = data[i];

                if (!ref->VALID && ref->refs < 1)
                {
                    auto invalid_state = remove_state_at_index(i);

                    invalid_state->rules.clear();

                    return invalid_state;
                }

                i++;
            }
        }

        return new ParserState(state.input, state.input_len);
    }

    /////////////////////////////////////////////
    // LEXER
    /////////////////////////////////////////////

    Lexer ::Lexer()
    {
        byte_offset = 0;
        byte_length = 0;
        token_length = 0;
        token_offset = 0;
        prev_byte_offset = 0;
        _type = 0;
        line = 0;
        current_byte = 0;
    }
    i32 Lexer ::setToken(i32 type_in, u32 byte_length_in, u32 token_length_in)
    {
        _type = type_in;
        byte_length = byte_length_in;
        token_length = token_length_in;
        return type_in;
    }
    u32 Lexer ::getType(Input input_struct, bool USE_UNICODE)
    {
        u32 t = _type;
        if (END(input_struct))
            return 1;
        ;
        if ((t) == 0)
        {
            if (!(USE_UNICODE) || current_byte < 128)
            {
                t = getTypeAt(current_byte);
            }
            else
            {
                u32 code_point = utf8ToCodePoint(byte_offset, input_struct);
                byte_length = getUTF8ByteLengthFromCodePoint(code_point);
                t = getTypeAt(code_point);
            }
        }
        return t;
    }
    bool Lexer ::isSym(Input input_struct, bool USE_UNICODE)
    {
        if (_type == 0 && getType(input_struct, USE_UNICODE) == 2)
        {
            _type = 2;
        }
        return _type == 2;
    }
    bool Lexer ::isNL()
    {
        if (_type == 0 && (current_byte) == 10 || (current_byte) == 13)
        {
            _type = 7;
        }
        return _type == 7;
    }
    bool Lexer ::isSP(bool USE_UNICODE)
    {
        if (_type == 0 && (current_byte) == 32)
        {
            _type = 8;
        }
        return _type == 8;
    }
    bool Lexer ::isNum(Input input_struct)
    {
        if (_type == 0)
        {
            if (getType(input_struct, false) == 5)
            {
                u32 l = input_struct.length;
                u32 off = byte_offset;
                while ((off++ < l) && 47 < input_struct.input[off] && input_struct.input[off] < 58)
                {
                    byte_length += 1;
                    token_length += 1;
                }
                _type = 5;
                return true;
            }
            else
                return false;
        }
        else
            return _type == 5;
    }
    bool Lexer ::isUniID(Input input_struct)
    {
        if (_type == 0)
        {
            if (getType(input_struct, true) == 3)
            {
                u32 l = input_struct.length;
                u32 off = byte_offset;
                u32 prev_byte_len = byte_length;
                while ((off + byte_length) < l)
                {
                    u32 code_point = utf8ToCodePoint(byte_offset + byte_length, input_struct);
                    if ((96 & char_lu_table[code_point]) > 0)
                    {
                        byte_length += getUTF8ByteLengthFromCodePoint(code_point);
                        prev_byte_len = byte_length;
                        token_length += 1;
                    }
                    else
                    {
                        break;
                    }
                }
                byte_length = prev_byte_len;
                _type = 3;
                return true;
            }
            else
                return false;
        }
        else
            return _type == 3;
    }

    Lexer Lexer ::copyInPlace()
    {
        Lexer destination = Lexer();
        destination.byte_offset = byte_offset;
        destination.byte_length = byte_length;
        destination.token_length = token_length;
        destination.token_offset = token_offset;
        destination.prev_byte_offset = prev_byte_offset;
        destination.line = line;
        destination.byte_length = byte_length;
        destination.current_byte = current_byte;
        return destination;
    }
    Lexer &Lexer ::sync(Lexer &source)
    {
        byte_offset = source.byte_offset;
        byte_length = source.byte_length;
        token_length = source.token_length;
        token_offset = source.token_offset;
        prev_byte_offset = source.prev_byte_offset;
        line = source.line;
        _type = source._type;
        current_byte = source.current_byte;
        return *this;
    }
    Lexer &Lexer ::slice(Lexer &source)
    {
        byte_length = byte_offset - source.byte_offset;
        token_length = token_offset - source.token_offset;
        byte_offset = source.byte_offset;
        token_offset = source.token_offset;
        current_byte = source.current_byte;
        line = source.line;
        _type = source._type;
        return *this;
    }
    Lexer &Lexer ::next(Input input_struct)
    {
        byte_offset += byte_length;
        token_offset += token_length;
        if (input_struct.length <= byte_offset)
        {
            _type = 1;
            byte_length = 0;
            token_length = 0;
            current_byte = 0;
        }
        else
        {
            current_byte = input_struct.input[byte_offset];
            if ((current_byte) == 10)
                line += 1;

            _type = 0;
            byte_length = 1;
            token_length = 1;
        }
        return *this;
    }
    bool Lexer ::END(Input input_struct) { return byte_offset >= input_struct.length; }

    /////////////////////////////////////////////
    // OTHER FUNCTIONS
    /////////////////////////////////////////////

    u32 getUTF8ByteLengthFromCodePoint(u32 code_point)
    {
        if ((code_point) == 0)
        {
            return 1;
        }
        else if ((code_point & 0x7F) == code_point)
        {
            return 1;
        }
        else if ((code_point & 0x7FF) == code_point)
        {
            return 2;
        }
        else if ((code_point & 0xFFFF) == code_point)
        {
            return 3;
        }
        else
        {
            return 4;
        }
    }

    u32 utf8ToCodePoint(u32 index, Input input_struct)
    {
        u8 a = input_struct.input[index];
        u8 flag = 14;
        if (a & 0x80)
        {
            flag = a & 0xF0;
            u8 b = input_struct.input[index + 1];
            if (flag & 0xE0)
            {
                flag = a & 0xF8;
                u8 c = input_struct.input[index + 2];
                if ((flag) == 0xF0)
                {
                    return ((a & 0x7) << 18) | ((b & 0x3F) << 12) | ((c & 0x3F) << 6) | (input_struct.input[index + 3] & 0x3F);
                }
                else if ((flag) == 0xE0)
                {
                    return ((a & 0xF) << 12) | ((b & 0x3F) << 6) | (c & 0x3F);
                }
            }
            else if ((flag) == 0xC)
            {
                return ((a & 0x1F) << 6) | b & 0x3F;
            }
        }
        else
            return a;
        return 0;
    }

    u32 getTypeAt(u32 code_point) { return (char_lu_table[code_point] & 0x1F); }

    u32 createState(u32 ENABLE_STACK_OUTPUT) { return 1 | (ENABLE_STACK_OUTPUT << 1); }

    bool token_production(ParserState &state, StackFunction production, u32 pid, u32 _type, u32 tk_flag)
    {
        auto &l = state.lexer;

        if ((l._type) == _type)
            return true;

        if (state.active_token_productions & tk_flag)
            return false;

        state.active_token_productions |= tk_flag;

        u32 stack_ptr = state.get_stack_len();
        u32 rules_ptr = state.get_rules_len();
        u32 state_cache = state.state;
        Lexer copy = l.copyInPlace();

        ParserStateBuffer data_buffer;

        bool ACTIVE = true;

        state.push_fn(production, 0);

        state.state = 0;

        while (ACTIVE)
            ACTIVE = step_kernel(state, data_buffer, stack_ptr);

        state.state = state_cache;

        state.active_token_productions ^= tk_flag;

        if (state.prod == pid)
        {
            state.stash.resize(stack_ptr);
            state.stack.resize(stack_ptr);
            l.slice(copy);
            l._type = _type;
            return true;
        }
        else
            state.reset(copy, stack_ptr, rules_ptr);

        return false;
    }

    u32 compare(
        ParserState &state,
        u32 data_offset,
        u32 sequence_offset,
        u32 byte_length,
        u8 *sequence)
    {
        u32 i = data_offset;
        u32 j = sequence_offset;
        u32 len = j + byte_length;
        for (; j < len; i++, j++)
            if ((state.input[i] != sequence[j]))
                return j - sequence_offset;
        ;
        return byte_length;
    }

    bool is_output_enabled(u32 state) { return 0 != (state & 2); }

    void add_reduce(ParserState &state, u32 sym_len, u32 body)
    {
        if (is_output_enabled(state.state))
        {
            u32 total = body + sym_len;
            if ((total) == 0)
                return;

            if (body > 0xFF || sym_len > 0x1F)
            {
                u32 low = (1 << 2) | (body << 3);
                u32 high = sym_len;
                state.add_rule(low);
                state.add_rule(high);
            }
            else
            {
                u32 low = ((sym_len & 0x1F) << 3) | ((body & 0xFF) << 8);
                state.add_rule(low);
            }
        }
    }
    void add_shift(ParserState &state, u32 tok_len)
    {
        if (tok_len < 0)
            return;

        if (tok_len > 0x1FFF)
        {
            u32 low = 1 | (1 << 2) | ((tok_len >> 13) & 0xFFF8);
            u32 high = (tok_len & 0xFFFF);
            state.add_rule(low);
            state.add_rule(high);
        }
        else
        {
            u32 low = 1 | ((tok_len << 3) & 0xFFF8);
            state.add_rule(low);
        }
    }
    void add_skip(ParserState &state, u32 skip_delta)
    {
        if (skip_delta < 1)
            return;
        ;
        if (skip_delta > 0x1FFF)
        {
            u32 low = 2 | (1 << 2) | ((skip_delta >> 13) & 0xFFF8);
            u32 high = (skip_delta & 0xFFFF);
            state.add_rule(low);
            state.add_rule(high);
        }
        else
        {
            u32 low = 2 | ((skip_delta << 3) & 0xFFF8);
            state.add_rule(low);
        }
    }

    bool consume(ParserState &state)
    {
        auto &l = state.lexer;

        l.prev_byte_offset = l.byte_offset + l.byte_length;

        if (is_output_enabled(state.state))
            add_shift(state, l.token_length);

        l.next(state.get_input_array());

        return true;
    }

    bool step_kernel(ParserState &state, ParserStateBuffer &data_buffer, u32 base)
    {
        if (state.get_stack_len() > base)
        {

            StackFunction _fn = state.stack.back();
            u32 stash = state.stash.back();
            state.stack.pop_back();
            state.stash.pop_back();

            state.prod = _fn(state, data_buffer, stash);

            if (state.prod < 0)
            {
                return false;
            }

            return true;
        }
        return false;
    }

    i32 run(ParserStateBuffer &process_buffer,
            ParserStateBuffer &invalid_buffer,
            ParserStateBuffer &valid_buffer,
            u32 prod_id)
    {
        while (process_buffer.len() > 0)
        {
            i32 i = 0;
            for (; i < process_buffer.len();)
            {
                ParserState &state = *process_buffer.data[i];
                if (!step_kernel(state, invalid_buffer, 0))
                {
                    state.COMPLETED = true;

                    state.VALID = (state.prod) == prod_id;

                    if (state.VALID)
                    {
                        valid_buffer
                            .add_state_pointer_and_sort(process_buffer.remove_state_at_index(i));
                    }
                    else
                    {
                        invalid_buffer
                            .add_state_pointer_and_sort(process_buffer.remove_state_at_index(i));
                    }
                }
                else
                {
                    i++;
                }
            }

            while (invalid_buffer.have_valid())
                process_buffer.add_state_pointer(invalid_buffer.get_valid_parser_state());
        }
        return valid_buffer.len();
    }

    ParserResultBuffers recognize(
        u8 *input_buffer,
        u32 input_byte_length,
        u32 production_id,
        StackFunction state_function)
    {

        ParserStateBuffer process_buffer;
        ParserResultBuffers result(new ParserStateBuffer(), new ParserStateBuffer());

        auto state = process_buffer.create_data(input_buffer, input_byte_length);

        state->push_fn(state_function, 0);

        state->lexer.next({input_buffer, input_byte_length});

        run(
            process_buffer,
            *result.invalid,
            *result.valid,
            production_id);

        return result;
    }

    i32 set_production(ParserState &, ParserStateBuffer &, i32 prod) { return prod; }
}