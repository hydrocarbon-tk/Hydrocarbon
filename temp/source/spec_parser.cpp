#include "../include/spec_parser.h" 
 namespace myParser { 
 using namespace HYDROCARBON; 
 int branch_23533b88b98ddaf7(Lexer& l, ParserData& data, ParserDataBuffer& db, unsigned int state, unsigned int prod, unsigned int prod_start){add_reduce( state, data, 1, 4 );return $A_list_3_goto( l, data, db, state, 3, prod_start );}

int branch_2775a71ce4f52201(Lexer& l, ParserData& data, ParserDataBuffer& db, unsigned int state, unsigned int prod, unsigned int prod_start){add_reduce( state, data, 3, 5 );return prod_start;}

int branch_5918a25f46072194(Lexer& l, ParserData& data, ParserDataBuffer& db, unsigned int state, unsigned int prod, unsigned int prod_start){return 1;}

int branch_64e0297d24ac6066(Lexer& l, ParserData& data, ParserDataBuffer& db, unsigned int state, unsigned int prod, unsigned int prod_start){return 0;}

int branch_881813e0b3d55eb6(Lexer& l, ParserData& data, ParserDataBuffer& db, unsigned int state, unsigned int prod, unsigned int prod_start){return $A_list_3_goto( l, data, db, state, 3, prod_start );}

int branch_b28513a96e5ce08b(Lexer& l, ParserData& data, ParserDataBuffer& db, unsigned int state, unsigned int prod, unsigned int prod_start){scan_19c55a0a089a2f23( l, data, state );if( ( l.type  == 10 ) ){consume( l, data, state );scan_c9cf7ac12827f468( l, data, state );if( ( l.type  == 11 ) ){consume( l, data, state );scan_c94a6e3624128cfe( l, data, state );if( ( l.type  == 3 ) ){consume( l, data, state );scan_eb1fda3ef65fd0f6( l, data, state );if( ( l.type  == 12 ) ){consume( l, data, state );add_reduce( state, data, 7, 1 );return prod_start;};};};};}

bool inter_scan_82b2797a2fb0240a(Lexer& l, ParserData& data){{l.setToken( 10, 1, 1 );return true;};return false;}

bool inter_scan_8ead1e5bc3303a08(Lexer& l, ParserData& data){{l.setToken( 13, 1, 1 );return true;};return false;}

void scan_19c55a0a089a2f23(Lexer& l, ParserData& data, unsigned int state){skip_a69409e78426a9f8( l/*[ sp ]*/, data, state );if( data.input[l.byte_offset ] == 41 ){l.setToken( 10, 1, 1 );return;};}

void scan_1d8c1f9069fcd82e(Lexer& l, ParserData& data, unsigned int state){skip_a69409e78426a9f8( l/*[ sp ]*/, data, state );if( data.input[l.byte_offset ] == 44 ){l.setToken( 13, 1, 1 );return;};}

void scan_4747dbfb51336a43(Lexer& l, ParserData& data, unsigned int state){skip_a69409e78426a9f8( l/*[ sp ]*/, data, state );if( l.type  > 0 )return;;if( data.input[l.byte_offset ] == 44 ){if( inter_scan_8ead1e5bc3303a08( l, data ) ){return;};} else if( data.input[l.byte_offset ] == 41 ){if( inter_scan_82b2797a2fb0240a( l, data ) ){return;};};}

void scan_733454b9d888ea54(Lexer& l, ParserData& data, unsigned int state){skip_a69409e78426a9f8( l/*[ sp ]*/, data, state );if( data.input[l.byte_offset ] == 40 ){l.setToken( 9, 1, 1 );return;};}

void scan_bf960626929f308d(Lexer& l, ParserData& data, unsigned int state){skip_a69409e78426a9f8( l/*[ sp ]*/, data, state );if( l.type  > 0 )return;;if( data.input[l.byte_offset ] == 41 ){l.setToken( 10, 1, 1 );return;};if( l.isUniID( data ) ){return;};}

void scan_c94a6e3624128cfe(Lexer& l, ParserData& data, unsigned int state){skip_a69409e78426a9f8( l/*[ sp ]*/, data, state );if( l.isUniID( data ) ){return;};}

void scan_c9cf7ac12827f468(Lexer& l, ParserData& data, unsigned int state){skip_a69409e78426a9f8( l/*[ sp ]*/, data, state );if( data.input[l.byte_offset ] == 123 ){l.setToken( 11, 1, 1 );return;};}

void scan_eb1fda3ef65fd0f6(Lexer& l, ParserData& data, unsigned int state){skip_a69409e78426a9f8( l/*[ sp ]*/, data, state );if( data.input[l.byte_offset ] == 125 ){l.setToken( 12, 1, 1 );return;};}

void  skip_a69409e78426a9f8(Lexer& l, ParserData& data, unsigned int state){if( l.type  > 0 )return;;if( ( state ) == 0 )return;;unsigned int off = l.token_offset;while( 1 ) {sym_scan_a69409e78426a9f8( l, data, state );if( ! ( l.type  == 8 ) ){break;};l.next( data );};if( isOutputEnabled( state ) )add_skip( data, l.token_offset  - off );;}

void sym_scan_a69409e78426a9f8(Lexer& l, ParserData& data, unsigned int state){if( l.type  > 0 )return;;if( l.isSP( true, data ) ){return;};}

int $start(Lexer& l, ParserData& data, ParserDataBuffer& db, unsigned int state, unsigned int prod, unsigned int prod_start){pushFN( data, & branch_64e0297d24ac6066, data.rules_ptr );return $A( l, data, db, state, data.rules_ptr, prod_start );}

int $A(Lexer& l, ParserData& data, ParserDataBuffer& db, unsigned int state, unsigned int prod, unsigned int prod_start){scan_c94a6e3624128cfe( l, data, state );if( l.type  == 3 ){consume( l, data, state );scan_733454b9d888ea54( l, data, state );if( l.type  == 9 ){consume( l, data, state );scan_bf960626929f308d( l, data, state );if( l.type  == 10 ){pushFN( data, & branch_5918a25f46072194, 0 );consume( l, data, state );scan_c9cf7ac12827f468( l, data, state );if( ( l.type  == 11 ) ){consume( l, data, state );scan_c94a6e3624128cfe( l, data, state );if( ( l.type  == 3 ) ){consume( l, data, state );scan_eb1fda3ef65fd0f6( l, data, state );if( ( l.type  == 12 ) ){consume( l, data, state );add_reduce( state, data, 6, 2 );return prod_start;};};};return - 1;} else {pushFN( data, & branch_5918a25f46072194, 0 );pushFN( data, & branch_b28513a96e5ce08b, data.rules_ptr );return $A_list_3( l, data, db, state, data.rules_ptr, prod_start );};};};return - 1;}

int $B(Lexer& l, ParserData& data, ParserDataBuffer& db, unsigned int state, unsigned int prod, unsigned int prod_start){scan_c94a6e3624128cfe( l, data, state );if( l.type  == 3 ){consume( l, data, state );add_reduce( state, data, 1, 3 );return 2;};return - 1;}

int $A_list_3(Lexer& l, ParserData& data, ParserDataBuffer& db, unsigned int state, unsigned int prod, unsigned int prod_start){pushFN( data, & branch_23533b88b98ddaf7, data.rules_ptr );return $B( l, data, db, state, data.rules_ptr, prod_start );}

int $A_list_3_goto(Lexer& l, ParserData& data, ParserDataBuffer& db, unsigned int state, unsigned int prod, unsigned int prod_start){scan_4747dbfb51336a43( l, data, state );scan_1d8c1f9069fcd82e( l, data, state );if( l.type  == 13 ){pushFN( data, & branch_881813e0b3d55eb6, 0 );consume( l, data, state );pushFN( data, & branch_2775a71ce4f52201, data.rules_ptr );return $B( l, data, db, state, data.rules_ptr, prod_start );};return ( prod  == 3 ) ? prod  : - 1;} 
 }