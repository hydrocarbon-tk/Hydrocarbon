#include "../include/core_parser.h" 
 namespace HYDROCARBON { 
 unsigned int action_ptr = 0;
unsigned int data_array_len  = 0;
unsigned int fork_array_len  = 0;
ParserData* root_data = 0;
ParserData* tip_data = 0;
ParserData** data_array=new ParserData*[64];
DataRef** fork_array=new DataRef*[64];
ParserData** out_array=new ParserData*[64];
unsigned int out_array_len  = 0;
unsigned int getUTF8ByteLengthFromCodePoint (unsigned int code_point ){if( ( code_point ) == 0 ){return 1;} else if( ( code_point  & 0x7F ) == code_point  ){return 1;} else if( ( code_point  & 0x7FF ) == code_point  ){return 2;} else if( ( code_point  & 0xFFFF ) == code_point  ){return 3;} else {return 4;};}
unsigned int utf8ToCodePoint (unsigned int index, unsigned char* buffer){unsigned char a = buffer[index];unsigned char flag = 14;if( a  & 0x80 ){flag  = a  & 0xF0;unsigned char b = buffer[index + 1];if( flag  & 0xE0 ){flag  = a  & 0xF8;unsigned char c = buffer[index + 2];if( ( flag ) == 0xF0 ){return ( ( a  & 0x7 ) << 18 ) | ( ( b  & 0x3F ) << 12 ) | ( ( c  & 0x3F ) << 6 ) | ( buffer[index + 3] & 0x3F );} else if( ( flag ) == 0xE0 ){return ( ( a  & 0xF ) << 12 ) | ( ( b  & 0x3F ) << 6 ) | ( c  & 0x3F );};} else if( ( flag ) == 0xC ){return ( ( a  & 0x1F ) << 6 ) | b  & 0x3F;};} else return a;return 0;}
unsigned int getTypeAt (unsigned int code_point ){return ( char_lu_table[code_point] & 0x1F );}
unsigned int createState(unsigned int ENABLE_STACK_OUTPUT){return 1 | ( ENABLE_STACK_OUTPUT  << 1 );}

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
     ParserData::ParserData(unsigned int input_len_in, unsigned int rules_len_in, Lexer* lexer_in){lexer  = lexer_in;state  = createState( 1 );prod  = 0;VALID  = false;COMPLETED  = false;stack_ptr  = 0;input_ptr  = 0;rules_ptr  = 0;input_len  = input_len_in;rules_len  = rules_len_in;origin_fork  = 0; origin = 0;if( input_len_in  > 0 ){input=new unsigned char[input_len_in];};rules=new unsigned short[rules_len_in];;;}
    void ParserData::sync(ParserData* ptr){if( ( ptr ) == this  )return;;};

    
     ParserDataBuffer::ParserDataBuffer(){len  = 0;;}
    void ParserDataBuffer::addDataPointer(ParserData* ptr){data[len ++] = ptr;}
    void ParserDataBuffer::removeDataAtIndex(int index){len --;unsigned int j = index;for(  ; j  < len ; j ++ ) {data[j] = data[j + 1];};};

    
    
    
    
    
    
    
     DataRef::DataRef(ParserData* ptr_in, bool VALID_in, unsigned int depth_in, unsigned int byte_offset_in, unsigned int byte_length_in, unsigned int line_in){byte_offset  = byte_offset_in;byte_length  = byte_length_in;line  = line_in;ptr  = ptr_in;VALID  = VALID_in;depth  = depth_in;command_offset  = 0;;};

    
    
    
    
    
    
    
     Lexer ::Lexer (){byte_offset  = 0;byte_length  = 0;token_length  = 0;token_offset  = 0;prev_byte_offset  = 0;type  = 0;line  = 0;current_byte  = 0;}
    int Lexer ::setToken(int type_in, unsigned int byte_length_in, unsigned int token_length_in){type  = type_in;byte_length  = byte_length_in;token_length  = token_length_in;return type_in;}
    unsigned int Lexer ::getType (bool USE_UNICODE, ParserData& data){unsigned int t = type;if( END( data ) )return 1;;if( ( t ) == 0 ){if( ( ! ( USE_UNICODE ) || current_byte  < 128 ) ){t  = getTypeAt( current_byte );} else {unsigned int code_point = utf8ToCodePoint( byte_offset, data.input );byte_length  = getUTF8ByteLengthFromCodePoint( code_point );t  = getTypeAt( code_point );};};return t;}
    bool  Lexer ::isSym (bool USE_UNICODE, ParserData& data){if( ( ( type ) == 0 && getType( USE_UNICODE, data ) == 2 ) ){type  = 2;};return ( type  ) == 2;}
    bool  Lexer ::isNL (){if( ( ( type ) == 0 && ( current_byte ) == 10 || ( current_byte ) == 13 ) ){type  = 7;};return ( type  ) == 7;}
    bool  Lexer ::isSP (bool USE_UNICODE, ParserData& data){if( ( ( type ) == 0 && ( current_byte ) == 32 ) ){type  = 8
;};return ( type  ) == 8
;}
    bool  Lexer ::isNum (ParserData& data){if( ( type ) == 0 ){if( getType( false, data ) == 5 ){unsigned int l  = data.input_len;unsigned int off  = byte_offset;while( ( off ++ < l ) && 47 < data.input[off] && data.input[off] < 58 ) {byte_length  += 1;token_length  += 1;};type  = 5;return true;} else return false;} else return ( type ) == 5
;}
    bool  Lexer ::isUniID (ParserData& data){if( ( ( type ) == 0 ) ){if( ( getType( true, data ) == 3 ) ){unsigned int l  = data.input_len;unsigned int off = byte_offset;unsigned int prev_byte_len = byte_length;while( ( off  + byte_length ) < l ) {unsigned int code_point = utf8ToCodePoint( byte_offset  + byte_length, data.input );if( ( ( ( 96 ) & char_lu_table[code_point] ) > 0 ) ){byte_length  += getUTF8ByteLengthFromCodePoint( code_point );prev_byte_len  = byte_length;token_length  += 1;} else {break;};};byte_length  = prev_byte_len;type  = 3;return true;} else return false;} else return ( type ) == 3;}
    Lexer* Lexer ::copy(){Lexer* destination  = new Lexer(  );Lexer& destination_ref  = * destination;destination_ref.byte_offset  = byte_offset;destination_ref.byte_length  = byte_length;destination_ref.token_length  = token_length;destination_ref.token_offset  = token_offset;destination_ref.prev_byte_offset  = prev_byte_offset;destination_ref.line  = line;destination_ref.byte_length  = byte_length;destination_ref.current_byte  = current_byte;return destination
;}
    Lexer  Lexer ::copyInPlace(){Lexer  destination  = Lexer(  );destination.byte_offset  = byte_offset;destination.byte_length  = byte_length;destination.token_length  = token_length;destination.token_offset  = token_offset;destination.prev_byte_offset  = prev_byte_offset;destination.line  = line;destination.byte_length  = byte_length;destination.current_byte  = current_byte;return destination
;}
    Lexer& Lexer ::sync(Lexer& source){byte_offset  = source.byte_offset;byte_length  = source.byte_length;token_length  = source.token_length;token_offset  = source.token_offset;prev_byte_offset  = source.prev_byte_offset;line  = source.line;type  = source.type;current_byte  = source.current_byte;return * this;}
    Lexer& Lexer ::slice(Lexer& source){byte_length  = byte_offset  - source.byte_offset;token_length  = token_offset  - source.token_offset;byte_offset  = source.byte_offset;token_offset  = source.token_offset;current_byte  = source.current_byte;line  = source.line;type  = source.type;return * this;}
    Lexer& Lexer ::next(ParserData& data){byte_offset  += byte_length;token_offset  += token_length;if( ( data.input_len  <= byte_offset ) ){type  = 1;byte_length  = 0;token_length  = 0;current_byte  = 0;} else {current_byte  = data.input[byte_offset];if( ( current_byte ) == 10 )line  += 1;;type  = 0;byte_length  = 1;token_length  = 1;};return * this;}
    bool  Lexer ::END(ParserData& data){return byte_offset  >= data.input_len
;};
unsigned int compare(ParserData& data, unsigned int data_offset, unsigned int sequence_offset, unsigned int byte_length){unsigned int i = data_offset;unsigned int j = sequence_offset;unsigned int len = j + byte_length;for(  ; j < len ; i ++, j ++ ) if( ( data.input[i] != data.sequence[j] ) )return j  - sequence_offset;;return byte_length;}
ParserData* create_parser_data_object(unsigned int input_len, unsigned int rules_len){Lexer* lexer = new Lexer(  );ParserData* parser_data = new ParserData( input_len, rules_len, lexer );return parser_data
;}
ParserData* fork(ParserData& data, ParserDataBuffer& data_buffer){ParserData* fork = create_parser_data_object( 0, data.rules_len  - data.rules_ptr
 );( * tip_data ) . next  = fork;tip_data  = fork;ParserData& fork_ref = * fork;unsigned int i = 0;for(  ; i  < data.stack_ptr  + 1 ; i ++ ) {fork_ref.stash[i] = data.stash[i];fork_ref.stack[i] = data.stack[i];};fork_ref.stack_ptr  = data.stack_ptr;fork_ref.input_ptr  = data.input_ptr;fork_ref.input_len  = data.input_len;fork_ref.origin_fork  = data.rules_ptr  + data.origin_fork;fork_ref.origin  = & data;fork_ref.lexer  = ( * data.lexer ) . copy(  );fork_ref.state  = data.state;fork_ref.prod  = data.prod;fork_ref.input  = data.input;data_buffer.addDataPointer( fork );return fork;}
bool  isOutputEnabled(unsigned int state){return 0 != ( state  & 2 );}
void  set_action(unsigned int val, ParserData& data){if( ( data.rules_ptr  > data.rules_len ) )return;;data.rules[data.rules_ptr ++] = val;}
void add_reduce(unsigned int state, ParserData& data, unsigned int sym_len, unsigned int body, bool  DNP){if( isOutputEnabled( state ) ){unsigned int total = body  + sym_len;if( ( total ) == 0 )return;;if( body  > 0xFF || sym_len  > 0x1F ){unsigned int low = ( 1 << 2 ) | ( body  << 3 );unsigned int high = sym_len;set_action( low, data );set_action( high, data );} else {unsigned int low = ( ( sym_len  & 0x1F ) << 3 ) | ( ( body  & 0xFF ) << 8 );set_action( low, data );};};}
void add_shift(ParserData& data, unsigned int tok_len){if( tok_len  < 0 )return;;if( tok_len  > 0x1FFF ){unsigned int low = 1 | ( 1 << 2 ) | ( ( tok_len  >> 13 ) & 0xFFF8 );unsigned int high = ( tok_len  & 0xFFFF );set_action( low, data );set_action( high, data );} else {unsigned int low = 1 | ( ( tok_len  << 3 ) & 0xFFF8 );set_action( low, data );};}
void add_skip(ParserData& data, unsigned int skip_delta){if( skip_delta  < 1 )return;;if( skip_delta  > 0x1FFF ){unsigned int low = 2 | ( 1 << 2 ) | ( ( skip_delta  >> 13 ) & 0xFFF8 );unsigned int high = ( skip_delta  & 0xFFFF );set_action( low, data );set_action( high, data );} else {unsigned int low = 2 | ( ( skip_delta  << 3 ) & 0xFFF8 );set_action( low, data );};}
unsigned int mark(unsigned int val, ParserData& data){return action_ptr ;}
void  reset(ParserData& data, Lexer& origin, unsigned int s_ptr, unsigned int r_ptr){data.rules_ptr  = r_ptr;data.stack_ptr  = s_ptr;( * data.lexer ) . sync( origin );}
bool  consume(Lexer& l, ParserData& data, unsigned int state){l.prev_byte_offset  = l.byte_offset  + l.byte_length;if( isOutputEnabled( state ) )add_shift( data, l.token_length );;l.next( data );return true;}
void pushFN(ParserData& data, StackFunction _fn_ref, int stash){data.stack[++ data.stack_ptr] = _fn_ref;data.stash[data.stack_ptr] = stash;data.stash[data.stack_ptr  + 1] = stash;}
bool stepKernel(ParserData& data, Lexer& lexer, ParserDataBuffer& data_buffer, int stack_base){int ptr = data.stack_ptr;StackFunction  _fn = data.stack[ptr];unsigned int stash = data.stash[ptr];data.stack_ptr --;int result = _fn( lexer, data, data_buffer, data.state, data.prod, stash );data.prod  = result;if( ( result < 0 || data.stack_ptr  < stack_base ) ){return false;};return true;}
int insertData(ParserData* data, ParserData** resolved, int resolved_len, int resolved_max){ParserData& in_ref = * data;unsigned int index = 0;for(  ; index  < resolved_len ; index ++ ) {ParserData& exist_ref = * resolved[index];if( in_ref.VALID  ){if( ( ! exist_ref.VALID ) ){break;};} else {if( ( ! exist_ref.VALID  && ( exist_ref.input_ptr  < in_ref.input_ptr ) ) ){break;};};};if( ( index  < resolved_max ) ){unsigned int i = resolved_len;if( i  > resolved_max  - 1 )i  = resolved_max  - 1;;for(  ; i  > index ; i -- ) {resolved[i] = resolved[i - 1];};resolved[index] = data;return resolved_len  + 1;};return resolved_max;}
int run(ParserData* origin, ParserData** resolved, int resolved_len, int resolved_max, unsigned int base, unsigned int prod_id){;ParserDataBuffer data_buffer ;data_buffer.addDataPointer( origin );while( ( data_buffer.len  > 0 ) ) {int i = 0;for(  ; i  < data_buffer.len ; i ++ ) {ParserData& data = * data_buffer.data[i];if( ( ! stepKernel( data, * data.lexer, data_buffer, base ) ) ){data.COMPLETED  = true;data.VALID  = ( data.prod ) == prod_id;data_buffer.removeDataAtIndex( i -- );resolved_len  = insertData( & data, resolved, resolved_len, resolved_max
 );};};};return resolved_len ;}
void  clear_data(){ParserData* curr = root_data;if( ( curr ) ){ParserData* next = ( * curr ) . next;while( ( curr ) ) {next  = ( ( * curr ) . next );delete[]  ( ( * curr ) . input );delete[]  ( ( * curr ) . rules );delete  ( ( * curr ) . lexer );delete  curr;curr  = next;};};unsigned int i = 0;for(  ; i  < fork_array_len ; i ++ ) {delete  fork_array[i];};fork_array_len  = 0;out_array_len  = 0;data_array_len  = 0;}
unsigned char* init_data(unsigned int input_len, unsigned int rules_len){clear_data(  );ParserData* data = create_parser_data_object( input_len, rules_len
 );data_array[0] = data;return ( * data ) . input;}
DataRef** get_fork_pointers(){unsigned int i = 0;for(  ; i  < out_array_len ; i ++ ) {ParserData& data = * out_array[i];DataRef* fork = new DataRef( out_array[i], ( data.VALID ), ( data.origin_fork  + data.rules_ptr ), ( * data.lexer ) . byte_offset, ( * data.lexer ) . byte_length, ( * data.lexer ) . line
 );fork_array_len ++;fork_array[i] = fork;};return fork_array;}
int block64Consume(ParserData* data, unsigned short* block, unsigned int offset, unsigned int block_offset, unsigned int limit){ParserData* containing_data = data;int end = ( * containing_data ) . origin_fork  + ( * data ) . rules_ptr;while( ( ( * containing_data ) . origin_fork  > offset ) ) {end  = ( * containing_data ) . origin_fork;containing_data  = ( * containing_data ) . origin;};int start = ( * containing_data ) . origin_fork;offset  -= start;end  -= start;unsigned int ptr = offset;if( ( ptr  >= end ) )return limit  - block_offset;;while( ( block_offset  < limit ) ) {block[block_offset ++] = ( * containing_data ) . rules[ptr ++];if( ( ptr  >= end ) )return block64Consume( data, block, ptr  + start, block_offset, limit );;};return 0;}
unsigned short* get_next_command_block(DataRef* fork){DataRef& fork_ref = * fork;unsigned int remainder = block64Consume( fork_ref.ptr, fork_ref.command_block, fork_ref.command_offset, 0, 64 );fork_ref.command_offset  += 64 - remainder;if( ( remainder  > 0 ) )fork_ref.command_block[64 - remainder] = 0;;return fork_ref.command_block;}
unsigned int recognize(unsigned int input_byte_length, unsigned int production, unsigned char* sequence_lu, StackFunction
 _fn_ref){ParserData& data_ref = * data_array[0];data_ref.sequence  = sequence_lu;data_ref.stack[0] = _fn_ref;data_ref.stash[0] = 0;data_ref.input_len  = input_byte_length;( * data_ref.lexer ) . next( data_ref );root_data  = & data_ref;tip_data  = & data_ref;out_array_len  = run( & data_ref, out_array, out_array_len, 64, 0, production );return out_array_len;} 
 }