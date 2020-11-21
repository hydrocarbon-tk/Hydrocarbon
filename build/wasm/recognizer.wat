(module
 (type $i32_=>_none (func (param i32)))
 (type $i32_i32_=>_i32 (func (param i32 i32) (result i32)))
 (type $i32_i32_=>_none (func (param i32 i32)))
 (type $i32_=>_i32 (func (param i32) (result i32)))
 (type $i32_i32_i32_=>_none (func (param i32 i32 i32)))
 (type $none_=>_none (func))
 (type $none_=>_i32 (func (result i32)))
 (type $i32_f64_=>_i32 (func (param i32 f64) (result i32)))
 (type $i32_f64_i32_=>_i32 (func (param i32 f64 i32) (result i32)))
 (type $i32_i32_i32_i32_=>_none (func (param i32 i32 i32 i32)))
 (type $i32_i32_i32_=>_i32 (func (param i32 i32 i32) (result i32)))
 (type $i64_=>_i32 (func (param i64) (result i32)))
 (import "env" "memory" (memory $0 70 100))
 (data (i32.const 4579340) "(\00\00\00\01\00\00\00\00\00\00\00\01\00\00\00(\00\00\00a\00l\00l\00o\00c\00a\00t\00i\00o\00n\00 \00t\00o\00o\00 \00l\00a\00r\00g\00e\00")
 (data (i32.const 4579404) "\1e\00\00\00\01\00\00\00\00\00\00\00\01\00\00\00\1e\00\00\00~\00l\00i\00b\00/\00r\00t\00/\00p\00u\00r\00e\00.\00t\00s\00")
 (data (i32.const 4579468) "\1e\00\00\00\01\00\00\00\00\00\00\00\01\00\00\00\1e\00\00\00~\00l\00i\00b\00/\00r\00t\00/\00t\00l\00s\00f\00.\00t\00s\00")
 (data (i32.const 4579532) "\00\00\00\00\01\00\00\00\00\00\00\00\01\00\00\00\00\00\00\00")
 (data (i32.const 4579564) "\08\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\08\00\00\00\01\00\00\00\04\00\00\00")
 (data (i32.const 4579596) "\04\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\04\00\00\00\04\00\00\00")
 (data (i32.const 4579628) "\04\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\04\00\00\00\01\00\00\00")
 (data (i32.const 4579660) "4\00\00\00\01\00\00\00\00\00\00\00\00\00\00\004\00\00\00\12\00\00\00\13\00\00\00#\00\00\00%\00\00\006\00\00\007\00\00\00;\00\00\00<\00\00\00=\00\00\00>\00\00\00?\00\00\00N\00\00\00O\00\00\00")
 (data (i32.const 4579740) "\\\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\\\00\00\00\11\00\00\00\12\00\00\00\13\00\00\00\14\00\00\00#\00\00\00%\00\00\00(\00\00\00)\00\00\00*\00\00\00+\00\00\00,\00\00\00.\00\00\001\00\00\006\00\00\007\00\00\00:\00\00\00;\00\00\00<\00\00\00=\00\00\00>\00\00\00?\00\00\00N\00\00\00O\00\00\00")
 (data (i32.const 4579852) "8\00\00\00\01\00\00\00\00\00\00\00\00\00\00\008\00\00\00\12\00\00\00\13\00\00\00\14\00\00\00#\00\00\006\00\00\007\00\00\00:\00\00\00;\00\00\00<\00\00\00=\00\00\00>\00\00\00?\00\00\00N\00\00\00O\00\00\00")
 (data (i32.const 4579932) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\01\00\00\00\00\00\00\00")
 (data (i32.const 4579964) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\02\00\00\00\00\00\00\00")
 (data (i32.const 4579996) "$\00\00\00\01\00\00\00\00\00\00\00\01\00\00\00$\00\00\00I\00n\00d\00e\00x\00 \00o\00u\00t\00 \00o\00f\00 \00r\00a\00n\00g\00e\00")
 (data (i32.const 4580060) "&\00\00\00\01\00\00\00\00\00\00\00\01\00\00\00&\00\00\00~\00l\00i\00b\00/\00s\00t\00a\00t\00i\00c\00a\00r\00r\00a\00y\00.\00t\00s\00")
 (data (i32.const 4580124) "\1c\00\00\00\01\00\00\00\00\00\00\00\01\00\00\00\1c\00\00\00I\00n\00v\00a\00l\00i\00d\00 \00l\00e\00n\00g\00t\00h\00")
 (data (i32.const 4580172) "&\00\00\00\01\00\00\00\00\00\00\00\01\00\00\00&\00\00\00~\00l\00i\00b\00/\00a\00r\00r\00a\00y\00b\00u\00f\00f\00e\00r\00.\00t\00s\00")
 (data (i32.const 4580236) "$\00\00\00\01\00\00\00\00\00\00\00\01\00\00\00$\00\00\00K\00e\00y\00 \00d\00o\00e\00s\00 \00n\00o\00t\00 \00e\00x\00i\00s\00t\00")
 (data (i32.const 4580300) "\16\00\00\00\01\00\00\00\00\00\00\00\01\00\00\00\16\00\00\00~\00l\00i\00b\00/\00m\00a\00p\00.\00t\00s\00")
 (data (i32.const 4580348) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\03\00\00\00\00\00\00\00")
 (data (i32.const 4580380) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\04\00\00\00\00\00\00\00")
 (data (i32.const 4580412) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\05\00\00\00\00\00\00\00")
 (data (i32.const 4580444) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\06\00\00\00\00\00\00\00")
 (data (i32.const 4580476) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\07\00\00\00\00\00\00\00")
 (data (i32.const 4580508) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\08\00\00\00\00\00\00\00")
 (data (i32.const 4580540) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\t\00\00\00\00\00\00\00")
 (data (i32.const 4580572) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\n\00\00\00\00\00\00\00")
 (data (i32.const 4580604) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\0b\00\00\00\00\00\00\00")
 (data (i32.const 4580636) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\0c\00\00\00\00\00\00\00")
 (data (i32.const 4580668) "8\00\00\00\01\00\00\00\00\00\00\00\00\00\00\008\00\00\00\0c\00\00\00\0d\00\00\00\0f\00\00\00\10\00\00\00\1f\00\00\00 \00\00\00$\00\00\00%\00\00\006\00\00\007\00\00\008\00\00\009\00\00\00N\00\00\00O\00\00\00")
 (data (i32.const 4580748) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\0d\00\00\00\00\00\00\00")
 (data (i32.const 4580780) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\0e\00\00\00\00\00\00\00")
 (data (i32.const 4580812) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\0f\00\00\00\00\00\00\00")
 (data (i32.const 4580844) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\10\00\00\00\00\00\00\00")
 (data (i32.const 4580876) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\11\00\00\00\00\00\00\00")
 (data (i32.const 4580908) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\12\00\00\00\00\00\00\00")
 (data (i32.const 4580940) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\13\00\00\00\00\00\00\00")
 (data (i32.const 4580972) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\14\00\00\00\00\00\00\00")
 (data (i32.const 4581004) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\15\00\00\00\00\00\00\00")
 (data (i32.const 4581036) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\16\00\00\00\00\00\00\00")
 (data (i32.const 4581068) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\17\00\00\00\00\00\00\00")
 (data (i32.const 4581100) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\18\00\00\00\00\00\00\00")
 (data (i32.const 4581132) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\19\00\00\00\00\00\00\00")
 (data (i32.const 4581164) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\1a\00\00\00\00\00\00\00")
 (data (i32.const 4581196) "L\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00L\00\00\00\0c\00\00\00\0d\00\00\00\12\00\00\00\13\00\00\00\1f\00\00\00 \00\00\00$\00\00\00%\00\00\00\'\00\00\006\00\00\007\00\00\008\00\00\00;\00\00\00<\00\00\00=\00\00\00>\00\00\00?\00\00\00N\00\00\00O\00\00\00")
 (data (i32.const 4581292) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\1b\00\00\00\00\00\00\00")
 (data (i32.const 4581324) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\1c\00\00\00\00\00\00\00")
 (data (i32.const 4581356) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\1d\00\00\00\00\00\00\00")
 (data (i32.const 4581388) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\1e\00\00\00\00\00\00\00")
 (data (i32.const 4581420) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\1f\00\00\00\00\00\00\00")
 (data (i32.const 4581452) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00 \00\00\00\00\00\00\00")
 (data (i32.const 4581484) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00!\00\00\00\00\00\00\00")
 (data (i32.const 4581516) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\"\00\00\00\00\00\00\00")
 (data (i32.const 4581548) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00#\00\00\00\00\00\00\00")
 (data (i32.const 4581580) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00$\00\00\00\00\00\00\00")
 (data (i32.const 4581612) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00%\00\00\00\00\00\00\00")
 (data (i32.const 4581644) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00&\00\00\00\00\00\00\00")
 (data (i32.const 4581676) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00\'\00\00\00\00\00\00\00")
 (data (i32.const 4581708) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00(\00\00\00\00\00\00\00")
 (data (i32.const 4581740) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00)\00\00\00\00\00\00\00")
 (data (i32.const 4581772) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00*\00\00\00\00\00\00\00")
 (data (i32.const 4581804) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00+\00\00\00\00\00\00\00")
 (data (i32.const 4581836) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00,\00\00\00\00\00\00\00")
 (data (i32.const 4581868) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00-\00\00\00\00\00\00\00")
 (data (i32.const 4581900) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00.\00\00\00\00\00\00\00")
 (data (i32.const 4581932) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00/\00\00\00\00\00\00\00")
 (data (i32.const 4581964) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\000\00\00\00\00\00\00\00")
 (data (i32.const 4581996) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\001\00\00\00\00\00\00\00")
 (data (i32.const 4582028) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\002\00\00\00\00\00\00\00")
 (data (i32.const 4582060) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\003\00\00\00\00\00\00\00")
 (data (i32.const 4582092) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\004\00\00\00\00\00\00\00")
 (data (i32.const 4582124) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\005\00\00\00\00\00\00\00")
 (data (i32.const 4582156) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\006\00\00\00\00\00\00\00")
 (data (i32.const 4582188) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\007\00\00\00\00\00\00\00")
 (data (i32.const 4582220) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\008\00\00\00\00\00\00\00")
 (data (i32.const 4582252) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\009\00\00\00\00\00\00\00")
 (data (i32.const 4582284) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00:\00\00\00\00\00\00\00")
 (data (i32.const 4582316) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00;\00\00\00\00\00\00\00")
 (data (i32.const 4582348) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00<\00\00\00\00\00\00\00")
 (data (i32.const 4582380) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00=\00\00\00\00\00\00\00")
 (data (i32.const 4582412) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00>\00\00\00\00\00\00\00")
 (data (i32.const 4582444) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00?\00\00\00\00\00\00\00")
 (data (i32.const 4582476) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00@\00\00\00\00\00\00\00")
 (data (i32.const 4582508) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00A\00\00\00\00\00\00\00")
 (data (i32.const 4582540) "\08\00\00\00\01\00\00\00\00\00\00\00\07\00\00\00\08\00\00\00B\00\00\00\00\00\00\00")
 (data (i32.const 4582576) "\t\00\00\00 \00\00\00\00\00\00\00 \00\00\00\00\00\00\00 \00\00\00\00\00\00\00\"\01\00\00\00\00\00\00$\01\00\00\00\00\00\00\"\t\00\00\00\00\00\00 \00\00\00\00\00\00\00 \00\00\00\00\00\00\000A4\00\00\00\00\00")
 (import "env" "abort" (func $~lib/builtins/abort (param i32 i32 i32 i32)))
 (table $0 67 funcref)
 (elem (i32.const 1) $start:input~anonymous|0 $start:input~anonymous|1 $start:input~anonymous|2 $start:input~anonymous|3 $start:input~anonymous|4 $start:input~anonymous|5 $start:input~anonymous|6 $start:input~anonymous|7 $start:input~anonymous|8 $start:input~anonymous|9 $start:input~anonymous|10 $start:input~anonymous|11 $start:input~anonymous|12 $start:input~anonymous|13 $start:input~anonymous|14 $start:input~anonymous|15 $start:input~anonymous|16 $start:input~anonymous|17 $start:input~anonymous|18 $start:input~anonymous|19 $start:input~anonymous|20 $start:input~anonymous|21 $start:input~anonymous|22 $start:input~anonymous|23 $start:input~anonymous|24 $start:input~anonymous|25 $start:input~anonymous|26 $start:input~anonymous|27 $start:input~anonymous|28 $start:input~anonymous|29 $start:input~anonymous|30 $start:input~anonymous|31 $start:input~anonymous|32 $start:input~anonymous|33 $start:input~anonymous|34 $start:input~anonymous|35 $start:input~anonymous|36 $start:input~anonymous|37 $start:input~anonymous|38 $start:input~anonymous|39 $start:input~anonymous|40 $start:input~anonymous|41 $start:input~anonymous|42 $start:input~anonymous|43 $start:input~anonymous|43 $start:input~anonymous|43 $start:input~anonymous|43 $start:input~anonymous|47 $start:input~anonymous|48 $start:input~anonymous|49 $start:input~anonymous|50 $start:input~anonymous|51 $start:input~anonymous|52 $start:input~anonymous|53 $start:input~anonymous|54 $start:input~anonymous|54 $start:input~anonymous|56 $start:input~anonymous|57 $start:input~anonymous|58 $start:input~anonymous|59 $start:input~anonymous|60 $start:input~anonymous|61 $start:input~anonymous|62 $start:input~anonymous|63 $start:input~anonymous|64 $start:input~anonymous|65)
 (global $~lib/rt/tlsf/ROOT (mut i32) (i32.const 0))
 (global $input/mark_ (mut i32) (i32.const 0))
 (global $input/action_ptr (mut i32) (i32.const 0))
 (global $input/error_ptr (mut i32) (i32.const 0))
 (global $input/stack_ptr (mut i32) (i32.const 0))
 (global $input/str (mut i32) (i32.const 4579552))
 (global $input/FAILED (mut i32) (i32.const 0))
 (global $input/prod (mut i32) (i32.const -1))
 (global $input/const__ (mut i32) (i32.const 0))
 (global $input/const_1_ (mut i32) (i32.const 0))
 (global $input/const_0_ (mut i32) (i32.const 0))
 (global $input/const_2_ (mut i32) (i32.const 0))
 (global $input/const_3_ (mut i32) (i32.const 0))
 (global $input/const_4_ (mut i32) (i32.const 0))
 (global $input/idm404 (mut i32) (i32.const 0))
 (global $~argumentsLength (mut i32) (i32.const 0))
 (global $input/idm232 (mut i32) (i32.const 0))
 (global $input/tym232 (mut i32) (i32.const 0))
 (global $input/idm117 (mut i32) (i32.const 0))
 (global $input/tym117 (mut i32) (i32.const 0))
 (global $input/idm121r (mut i32) (i32.const 0))
 (global $input/tym121r (mut i32) (i32.const 0))
 (global $input/idm120 (mut i32) (i32.const 0))
 (global $input/idm235r (mut i32) (i32.const 0))
 (global $input/tym235r (mut i32) (i32.const 0))
 (global $input/tym59r (mut i32) (i32.const 0))
 (global $input/tym216r (mut i32) (i32.const 0))
 (global $input/idm298 (mut i32) (i32.const 0))
 (global $input/tym298 (mut i32) (i32.const 0))
 (global $input/idm355 (mut i32) (i32.const 0))
 (global $input/idm305r (mut i32) (i32.const 0))
 (global $input/tym305r (mut i32) (i32.const 0))
 (global $input/idm304 (mut i32) (i32.const 0))
 (global $input/tym304 (mut i32) (i32.const 0))
 (global $input/idm356r (mut i32) (i32.const 0))
 (global $input/tym356r (mut i32) (i32.const 0))
 (global $input/idm357 (mut i32) (i32.const 0))
 (global $input/idm238r (mut i32) (i32.const 0))
 (global $input/tym238r (mut i32) (i32.const 0))
 (global $input/idm323 (mut i32) (i32.const 0))
 (global $input/tym323 (mut i32) (i32.const 0))
 (global $input/idm246 (mut i32) (i32.const 0))
 (global $input/idm246r (mut i32) (i32.const 0))
 (global $input/tym246r (mut i32) (i32.const 0))
 (global $input/idm309 (mut i32) (i32.const 0))
 (global $input/const_6_ (mut i32) (i32.const 0))
 (global $input/idm371r (mut i32) (i32.const 0))
 (global $input/tym371r (mut i32) (i32.const 0))
 (global $input/idm324 (mut i32) (i32.const 0))
 (global $input/idm336r (mut i32) (i32.const 0))
 (global $input/tym336r (mut i32) (i32.const 0))
 (global $input/idm301 (mut i32) (i32.const 0))
 (global $input/tym301 (mut i32) (i32.const 0))
 (global $input/idm252r (mut i32) (i32.const 0))
 (global $input/tym252r (mut i32) (i32.const 0))
 (global $input/const_7_ (mut i32) (i32.const 0))
 (global $input/idm92r (mut i32) (i32.const 0))
 (global $input/tym92r (mut i32) (i32.const 0))
 (global $input/idm226r (mut i32) (i32.const 0))
 (global $input/tym226r (mut i32) (i32.const 0))
 (global $input/idm249 (mut i32) (i32.const 0))
 (global $input/tym249 (mut i32) (i32.const 0))
 (global $input/idm326 (mut i32) (i32.const 0))
 (global $input/idm308r (mut i32) (i32.const 0))
 (global $input/tym308r (mut i32) (i32.const 0))
 (global $input/idm358r (mut i32) (i32.const 0))
 (global $input/tym358r (mut i32) (i32.const 0))
 (global $input/idm346r (mut i32) (i32.const 0))
 (global $input/tym346r (mut i32) (i32.const 0))
 (global $input/idm197r (mut i32) (i32.const 0))
 (global $input/tym197r (mut i32) (i32.const 0))
 (global $input/idm243 (mut i32) (i32.const 0))
 (global $input/idm243r (mut i32) (i32.const 0))
 (global $input/tym243r (mut i32) (i32.const 0))
 (global $input/idm333r (mut i32) (i32.const 0))
 (global $input/tym333r (mut i32) (i32.const 0))
 (global $input/idm241r (mut i32) (i32.const 0))
 (global $input/tym241r (mut i32) (i32.const 0))
 (global $input/idm339 (mut i32) (i32.const 0))
 (global $input/idm256r (mut i32) (i32.const 0))
 (global $input/tym256r (mut i32) (i32.const 0))
 (global $input/idm366r (mut i32) (i32.const 0))
 (global $input/tym366r (mut i32) (i32.const 0))
 (global $input/idm29r (mut i32) (i32.const 0))
 (global $input/tym29r (mut i32) (i32.const 0))
 (global $input/idm181r (mut i32) (i32.const 0))
 (global $input/tym181r (mut i32) (i32.const 0))
 (global $input/idm30 (mut i32) (i32.const 0))
 (global $input/idm33 (mut i32) (i32.const 0))
 (global $input/idm98r (mut i32) (i32.const 0))
 (global $input/tym98r (mut i32) (i32.const 0))
 (global $input/idm228r (mut i32) (i32.const 0))
 (global $input/tym228r (mut i32) (i32.const 0))
 (global $input/idm42r (mut i32) (i32.const 0))
 (global $input/tym42r (mut i32) (i32.const 0))
 (global $input/idm200r (mut i32) (i32.const 0))
 (global $input/tym200r (mut i32) (i32.const 0))
 (global $~lib/rt/__rtti_base i32 (i32.const 4582576))
 (export "memory" (memory $0))
 (export "__new" (func $~lib/rt/pure/__new))
 (export "__renew" (func $~lib/rt/pure/__renew))
 (export "__retain" (func $~lib/rt/pure/__retain))
 (export "__release" (func $~lib/rt/pure/__release))
 (export "__rtti_base" (global $~lib/rt/__rtti_base))
 (export "main" (func $input/main))
 (export "default" (func $input/main))
 (start $~start)
 (func $~lib/rt/tlsf/removeBlock (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $1
  i32.load
  local.tee $2
  i32.const 1
  i32.and
  i32.eqz
  if
   i32.const 0
   i32.const 4579488
   i32.const 272
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $2
  i32.const -4
  i32.and
  local.tee $2
  i32.const 1073741820
  i32.lt_u
  i32.const 0
  local.get $2
  i32.const 12
  i32.ge_u
  select
  i32.eqz
  if
   i32.const 0
   i32.const 4579488
   i32.const 274
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $2
  i32.const 256
  i32.lt_u
  if
   local.get $2
   i32.const 4
   i32.shr_u
   local.set $2
  else
   local.get $2
   i32.const 31
   local.get $2
   i32.clz
   i32.sub
   local.tee $3
   i32.const 4
   i32.sub
   i32.shr_u
   i32.const 16
   i32.xor
   local.set $2
   local.get $3
   i32.const 7
   i32.sub
   local.set $3
  end
  local.get $2
  i32.const 16
  i32.lt_u
  i32.const 0
  local.get $3
  i32.const 23
  i32.lt_u
  select
  i32.eqz
  if
   i32.const 0
   i32.const 4579488
   i32.const 287
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $1
  i32.load offset=8
  local.set $4
  local.get $1
  i32.load offset=4
  local.tee $5
  if
   local.get $5
   local.get $4
   i32.store offset=8
  end
  local.get $4
  if
   local.get $4
   local.get $5
   i32.store offset=4
  end
  local.get $1
  local.get $0
  local.get $2
  local.get $3
  i32.const 4
  i32.shl
  i32.add
  i32.const 2
  i32.shl
  i32.add
  i32.load offset=96
  i32.eq
  if
   local.get $0
   local.get $2
   local.get $3
   i32.const 4
   i32.shl
   i32.add
   i32.const 2
   i32.shl
   i32.add
   local.get $4
   i32.store offset=96
   local.get $4
   i32.eqz
   if
    local.get $0
    local.get $3
    i32.const 2
    i32.shl
    i32.add
    local.tee $4
    i32.load offset=4
    i32.const -2
    local.get $2
    i32.rotl
    i32.and
    local.set $1
    local.get $4
    local.get $1
    i32.store offset=4
    local.get $1
    i32.eqz
    if
     local.get $0
     local.get $0
     i32.load
     i32.const -2
     local.get $3
     i32.rotl
     i32.and
     i32.store
    end
   end
  end
 )
 (func $~lib/rt/tlsf/insertBlock (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  local.get $1
  i32.eqz
  if
   i32.const 0
   i32.const 4579488
   i32.const 200
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $1
  i32.load
  local.tee $4
  i32.const 1
  i32.and
  i32.eqz
  if
   i32.const 0
   i32.const 4579488
   i32.const 202
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $1
  i32.const 4
  i32.add
  local.get $1
  i32.load
  i32.const -4
  i32.and
  i32.add
  local.tee $5
  i32.load
  local.tee $2
  i32.const 1
  i32.and
  if
   local.get $4
   i32.const -4
   i32.and
   i32.const 4
   i32.add
   local.get $2
   i32.const -4
   i32.and
   i32.add
   local.tee $3
   i32.const 1073741820
   i32.lt_u
   if
    local.get $0
    local.get $5
    call $~lib/rt/tlsf/removeBlock
    local.get $1
    local.get $3
    local.get $4
    i32.const 3
    i32.and
    i32.or
    local.tee $4
    i32.store
    local.get $1
    i32.const 4
    i32.add
    local.get $1
    i32.load
    i32.const -4
    i32.and
    i32.add
    local.tee $5
    i32.load
    local.set $2
   end
  end
  local.get $4
  i32.const 2
  i32.and
  if
   local.get $1
   i32.const 4
   i32.sub
   i32.load
   local.tee $3
   i32.load
   local.tee $7
   i32.const 1
   i32.and
   i32.eqz
   if
    i32.const 0
    i32.const 4579488
    i32.const 223
    i32.const 16
    call $~lib/builtins/abort
    unreachable
   end
   local.get $7
   i32.const -4
   i32.and
   i32.const 4
   i32.add
   local.get $4
   i32.const -4
   i32.and
   i32.add
   local.tee $8
   i32.const 1073741820
   i32.lt_u
   if (result i32)
    local.get $0
    local.get $3
    call $~lib/rt/tlsf/removeBlock
    local.get $3
    local.get $8
    local.get $7
    i32.const 3
    i32.and
    i32.or
    local.tee $4
    i32.store
    local.get $3
   else
    local.get $1
   end
   local.set $1
  end
  local.get $5
  local.get $2
  i32.const 2
  i32.or
  i32.store
  local.get $4
  i32.const -4
  i32.and
  local.tee $3
  i32.const 1073741820
  i32.lt_u
  i32.const 0
  local.get $3
  i32.const 12
  i32.ge_u
  select
  i32.eqz
  if
   i32.const 0
   i32.const 4579488
   i32.const 238
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $5
  local.get $3
  local.get $1
  i32.const 4
  i32.add
  i32.add
  i32.ne
  if
   i32.const 0
   i32.const 4579488
   i32.const 239
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $5
  i32.const 4
  i32.sub
  local.get $1
  i32.store
  local.get $3
  i32.const 256
  i32.lt_u
  if
   local.get $3
   i32.const 4
   i32.shr_u
   local.set $3
  else
   local.get $3
   i32.const 31
   local.get $3
   i32.clz
   i32.sub
   local.tee $4
   i32.const 4
   i32.sub
   i32.shr_u
   i32.const 16
   i32.xor
   local.set $3
   local.get $4
   i32.const 7
   i32.sub
   local.set $6
  end
  local.get $3
  i32.const 16
  i32.lt_u
  i32.const 0
  local.get $6
  i32.const 23
  i32.lt_u
  select
  i32.eqz
  if
   i32.const 0
   i32.const 4579488
   i32.const 255
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  local.get $3
  local.get $6
  i32.const 4
  i32.shl
  i32.add
  i32.const 2
  i32.shl
  i32.add
  i32.load offset=96
  local.set $4
  local.get $1
  i32.const 0
  i32.store offset=4
  local.get $1
  local.get $4
  i32.store offset=8
  local.get $4
  if
   local.get $4
   local.get $1
   i32.store offset=4
  end
  local.get $0
  local.get $3
  local.get $6
  i32.const 4
  i32.shl
  i32.add
  i32.const 2
  i32.shl
  i32.add
  local.get $1
  i32.store offset=96
  local.get $0
  local.get $0
  i32.load
  i32.const 1
  local.get $6
  i32.shl
  i32.or
  i32.store
  local.get $0
  local.get $6
  i32.const 2
  i32.shl
  i32.add
  local.tee $0
  local.get $0
  i32.load offset=4
  i32.const 1
  local.get $3
  i32.shl
  i32.or
  i32.store offset=4
 )
 (func $~lib/rt/tlsf/addMemory (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  local.get $1
  local.get $2
  i32.gt_u
  if
   i32.const 0
   i32.const 4579488
   i32.const 380
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $1
  i32.const 19
  i32.add
  i32.const -16
  i32.and
  i32.const 4
  i32.sub
  local.set $1
  local.get $2
  i32.const -16
  i32.and
  local.get $0
  i32.load offset=1568
  local.tee $2
  if
   local.get $1
   local.get $2
   i32.const 4
   i32.add
   i32.lt_u
   if
    i32.const 0
    i32.const 4579488
    i32.const 387
    i32.const 16
    call $~lib/builtins/abort
    unreachable
   end
   local.get $2
   local.get $1
   i32.const 16
   i32.sub
   i32.eq
   if
    local.get $2
    i32.load
    local.set $4
    local.get $1
    i32.const 16
    i32.sub
    local.set $1
   end
  else
   local.get $1
   local.get $0
   i32.const 1572
   i32.add
   i32.lt_u
   if
    i32.const 0
    i32.const 4579488
    i32.const 400
    i32.const 5
    call $~lib/builtins/abort
    unreachable
   end
  end
  local.get $1
  i32.sub
  local.tee $2
  i32.const 20
  i32.lt_u
  if
   return
  end
  local.get $1
  local.get $4
  i32.const 2
  i32.and
  local.get $2
  i32.const 8
  i32.sub
  local.tee $2
  i32.const 1
  i32.or
  i32.or
  i32.store
  local.get $1
  i32.const 0
  i32.store offset=4
  local.get $1
  i32.const 0
  i32.store offset=8
  local.get $2
  local.get $1
  i32.const 4
  i32.add
  i32.add
  local.tee $2
  i32.const 2
  i32.store
  local.get $0
  local.get $2
  i32.store offset=1568
  local.get $0
  local.get $1
  call $~lib/rt/tlsf/insertBlock
 )
 (func $~lib/rt/tlsf/initialize
  (local $0 i32)
  (local $1 i32)
  memory.size
  local.tee $0
  i32.const 70
  i32.lt_s
  if (result i32)
   i32.const 70
   local.get $0
   i32.sub
   memory.grow
   i32.const 0
   i32.lt_s
  else
   i32.const 0
  end
  if
   unreachable
  end
  i32.const 4582656
  i32.const 0
  i32.store
  i32.const 4584224
  i32.const 0
  i32.store
  loop $for-loop|0
   local.get $1
   i32.const 23
   i32.lt_u
   if
    local.get $1
    i32.const 2
    i32.shl
    i32.const 4582656
    i32.add
    i32.const 0
    i32.store offset=4
    i32.const 0
    local.set $0
    loop $for-loop|1
     local.get $0
     i32.const 16
     i32.lt_u
     if
      local.get $0
      local.get $1
      i32.const 4
      i32.shl
      i32.add
      i32.const 2
      i32.shl
      i32.const 4582656
      i32.add
      i32.const 0
      i32.store offset=96
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|1
     end
    end
    local.get $1
    i32.const 1
    i32.add
    local.set $1
    br $for-loop|0
   end
  end
  i32.const 4582656
  i32.const 4584228
  memory.size
  i32.const 16
  i32.shl
  call $~lib/rt/tlsf/addMemory
  i32.const 4582656
  global.set $~lib/rt/tlsf/ROOT
 )
 (func $~lib/rt/tlsf/prepareSize (param $0 i32) (result i32)
  local.get $0
  i32.const 1073741820
  i32.ge_u
  if
   i32.const 4579360
   i32.const 4579488
   i32.const 461
   i32.const 30
   call $~lib/builtins/abort
   unreachable
  end
  i32.const 12
  local.get $0
  i32.const 19
  i32.add
  i32.const -16
  i32.and
  i32.const 4
  i32.sub
  local.get $0
  i32.const 12
  i32.le_u
  select
 )
 (func $~lib/rt/tlsf/searchBlock (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  local.get $1
  i32.const 256
  i32.lt_u
  if
   local.get $1
   i32.const 4
   i32.shr_u
   local.set $1
  else
   i32.const 31
   local.get $1
   i32.const 1
   i32.const 27
   local.get $1
   i32.clz
   i32.sub
   i32.shl
   i32.add
   i32.const 1
   i32.sub
   local.get $1
   local.get $1
   i32.const 536870910
   i32.lt_u
   select
   local.tee $1
   i32.clz
   i32.sub
   local.set $2
   local.get $1
   local.get $2
   i32.const 4
   i32.sub
   i32.shr_u
   i32.const 16
   i32.xor
   local.set $1
   local.get $2
   i32.const 7
   i32.sub
   local.set $2
  end
  local.get $1
  i32.const 16
  i32.lt_u
  i32.const 0
  local.get $2
  i32.const 23
  i32.lt_u
  select
  i32.eqz
  if
   i32.const 0
   i32.const 4579488
   i32.const 333
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  local.get $2
  i32.const 2
  i32.shl
  i32.add
  i32.load offset=4
  i32.const -1
  local.get $1
  i32.shl
  i32.and
  local.tee $1
  if (result i32)
   local.get $0
   local.get $1
   i32.ctz
   local.get $2
   i32.const 4
   i32.shl
   i32.add
   i32.const 2
   i32.shl
   i32.add
   i32.load offset=96
  else
   local.get $0
   i32.load
   i32.const -1
   local.get $2
   i32.const 1
   i32.add
   i32.shl
   i32.and
   local.tee $1
   if (result i32)
    local.get $0
    local.get $1
    i32.ctz
    local.tee $1
    i32.const 2
    i32.shl
    i32.add
    i32.load offset=4
    local.tee $2
    i32.eqz
    if
     i32.const 0
     i32.const 4579488
     i32.const 346
     i32.const 18
     call $~lib/builtins/abort
     unreachable
    end
    local.get $0
    local.get $2
    i32.ctz
    local.get $1
    i32.const 4
    i32.shl
    i32.add
    i32.const 2
    i32.shl
    i32.add
    i32.load offset=96
   else
    i32.const 0
   end
  end
 )
 (func $~lib/rt/tlsf/prepareBlock (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  local.get $1
  i32.load
  local.set $3
  local.get $2
  i32.const 4
  i32.add
  i32.const 15
  i32.and
  if
   i32.const 0
   i32.const 4579488
   i32.const 360
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $3
  i32.const -4
  i32.and
  local.get $2
  i32.sub
  local.tee $4
  i32.const 16
  i32.ge_u
  if
   local.get $1
   local.get $2
   local.get $3
   i32.const 2
   i32.and
   i32.or
   i32.store
   local.get $2
   local.get $1
   i32.const 4
   i32.add
   i32.add
   local.tee $1
   local.get $4
   i32.const 4
   i32.sub
   i32.const 1
   i32.or
   i32.store
   local.get $0
   local.get $1
   call $~lib/rt/tlsf/insertBlock
  else
   local.get $1
   local.get $3
   i32.const -2
   i32.and
   i32.store
   local.get $1
   i32.const 4
   i32.add
   local.tee $0
   local.get $1
   i32.load
   i32.const -4
   i32.and
   i32.add
   local.get $0
   local.get $1
   i32.load
   i32.const -4
   i32.and
   i32.add
   i32.load
   i32.const -3
   i32.and
   i32.store
  end
 )
 (func $~lib/rt/tlsf/allocateBlock (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  local.get $1
  call $~lib/rt/tlsf/prepareSize
  local.tee $2
  call $~lib/rt/tlsf/searchBlock
  local.tee $1
  i32.eqz
  if
   i32.const 4
   memory.size
   local.tee $1
   i32.const 16
   i32.shl
   i32.const 4
   i32.sub
   local.get $0
   i32.load offset=1568
   i32.ne
   i32.shl
   local.get $2
   i32.const 1
   i32.const 27
   local.get $2
   i32.clz
   i32.sub
   i32.shl
   i32.const 1
   i32.sub
   i32.add
   local.get $2
   local.get $2
   i32.const 536870910
   i32.lt_u
   select
   i32.add
   i32.const 65535
   i32.add
   i32.const -65536
   i32.and
   i32.const 16
   i32.shr_u
   local.set $3
   local.get $1
   local.get $3
   local.get $1
   local.get $3
   i32.gt_s
   select
   memory.grow
   i32.const 0
   i32.lt_s
   if
    local.get $3
    memory.grow
    i32.const 0
    i32.lt_s
    if
     unreachable
    end
   end
   local.get $0
   local.get $1
   i32.const 16
   i32.shl
   memory.size
   i32.const 16
   i32.shl
   call $~lib/rt/tlsf/addMemory
   local.get $0
   local.get $2
   call $~lib/rt/tlsf/searchBlock
   local.tee $1
   i32.eqz
   if
    i32.const 0
    i32.const 4579488
    i32.const 498
    i32.const 16
    call $~lib/builtins/abort
    unreachable
   end
  end
  local.get $2
  local.get $1
  i32.load
  i32.const -4
  i32.and
  i32.gt_u
  if
   i32.const 0
   i32.const 4579488
   i32.const 500
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  local.get $1
  call $~lib/rt/tlsf/removeBlock
  local.get $0
  local.get $1
  local.get $2
  call $~lib/rt/tlsf/prepareBlock
  local.get $1
 )
 (func $~lib/rt/pure/__new (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  i32.const 1073741804
  i32.gt_u
  if
   i32.const 4579360
   i32.const 4579424
   i32.const 275
   i32.const 30
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  i32.const 16
  i32.add
  local.set $2
  global.get $~lib/rt/tlsf/ROOT
  i32.eqz
  if
   call $~lib/rt/tlsf/initialize
  end
  global.get $~lib/rt/tlsf/ROOT
  local.get $2
  call $~lib/rt/tlsf/allocateBlock
  i32.const 4
  i32.add
  local.tee $3
  i32.const 4
  i32.sub
  local.tee $2
  i32.const 0
  i32.store offset=4
  local.get $2
  i32.const 0
  i32.store offset=8
  local.get $2
  local.get $1
  i32.store offset=12
  local.get $2
  local.get $0
  i32.store offset=16
  local.get $3
  i32.const 16
  i32.add
 )
 (func $~lib/rt/tlsf/checkUsedBlock (param $0 i32) (result i32)
  (local $1 i32)
  local.get $0
  i32.const 4
  i32.sub
  local.set $1
  local.get $0
  i32.const 15
  i32.and
  i32.eqz
  i32.const 0
  local.get $0
  select
  if (result i32)
   local.get $1
   i32.load
   i32.const 1
   i32.and
   i32.eqz
  else
   i32.const 0
  end
  i32.eqz
  if
   i32.const 0
   i32.const 4579488
   i32.const 563
   i32.const 3
   call $~lib/builtins/abort
   unreachable
  end
  local.get $1
 )
 (func $~lib/memory/memory.copy (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  block $~lib/util/memory/memmove|inlined.0
   local.get $2
   local.set $4
   local.get $0
   local.get $1
   i32.eq
   br_if $~lib/util/memory/memmove|inlined.0
   local.get $0
   local.get $1
   i32.lt_u
   if
    local.get $1
    i32.const 7
    i32.and
    local.get $0
    i32.const 7
    i32.and
    i32.eq
    if
     loop $while-continue|0
      local.get $0
      i32.const 7
      i32.and
      if
       local.get $4
       i32.eqz
       br_if $~lib/util/memory/memmove|inlined.0
       local.get $4
       i32.const 1
       i32.sub
       local.set $4
       local.get $0
       local.tee $2
       i32.const 1
       i32.add
       local.set $0
       local.get $1
       local.tee $3
       i32.const 1
       i32.add
       local.set $1
       local.get $2
       local.get $3
       i32.load8_u
       i32.store8
       br $while-continue|0
      end
     end
     loop $while-continue|1
      local.get $4
      i32.const 8
      i32.ge_u
      if
       local.get $0
       local.get $1
       i64.load
       i64.store
       local.get $4
       i32.const 8
       i32.sub
       local.set $4
       local.get $0
       i32.const 8
       i32.add
       local.set $0
       local.get $1
       i32.const 8
       i32.add
       local.set $1
       br $while-continue|1
      end
     end
    end
    loop $while-continue|2
     local.get $4
     if
      local.get $0
      local.tee $2
      i32.const 1
      i32.add
      local.set $0
      local.get $1
      local.tee $3
      i32.const 1
      i32.add
      local.set $1
      local.get $2
      local.get $3
      i32.load8_u
      i32.store8
      local.get $4
      i32.const 1
      i32.sub
      local.set $4
      br $while-continue|2
     end
    end
   else
    local.get $1
    i32.const 7
    i32.and
    local.get $0
    i32.const 7
    i32.and
    i32.eq
    if
     loop $while-continue|3
      local.get $0
      local.get $4
      i32.add
      i32.const 7
      i32.and
      if
       local.get $4
       i32.eqz
       br_if $~lib/util/memory/memmove|inlined.0
       local.get $0
       local.get $4
       i32.const 1
       i32.sub
       local.tee $4
       i32.add
       local.get $1
       local.get $4
       i32.add
       i32.load8_u
       i32.store8
       br $while-continue|3
      end
     end
     loop $while-continue|4
      local.get $4
      i32.const 8
      i32.ge_u
      if
       local.get $0
       local.get $4
       i32.const 8
       i32.sub
       local.tee $4
       i32.add
       local.get $1
       local.get $4
       i32.add
       i64.load
       i64.store
       br $while-continue|4
      end
     end
    end
    loop $while-continue|5
     local.get $4
     if
      local.get $0
      local.get $4
      i32.const 1
      i32.sub
      local.tee $4
      i32.add
      local.get $1
      local.get $4
      i32.add
      i32.load8_u
      i32.store8
      br $while-continue|5
     end
    end
   end
  end
 )
 (func $~lib/rt/tlsf/freeBlock (param $0 i32) (param $1 i32)
  local.get $1
  local.get $1
  i32.load
  i32.const 1
  i32.or
  i32.store
  local.get $0
  local.get $1
  call $~lib/rt/tlsf/insertBlock
 )
 (func $~lib/rt/tlsf/moveBlock (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  local.get $0
  local.get $2
  call $~lib/rt/tlsf/allocateBlock
  local.tee $2
  i32.const 4
  i32.add
  local.get $1
  i32.const 4
  i32.add
  local.get $1
  i32.load
  i32.const -4
  i32.and
  call $~lib/memory/memory.copy
  local.get $1
  i32.const 4582652
  i32.ge_u
  if
   local.get $0
   local.get $1
   call $~lib/rt/tlsf/freeBlock
  end
  local.get $2
 )
 (func $~lib/rt/pure/__renew (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  local.get $1
  i32.const 1073741804
  i32.gt_u
  if
   i32.const 4579360
   i32.const 4579424
   i32.const 288
   i32.const 30
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  i32.const 16
  i32.sub
  local.set $0
  global.get $~lib/rt/tlsf/ROOT
  i32.eqz
  if
   call $~lib/rt/tlsf/initialize
  end
  local.get $1
  i32.const 16
  i32.add
  local.set $2
  local.get $0
  i32.const 4582652
  i32.lt_u
  if
   global.get $~lib/rt/tlsf/ROOT
   local.get $0
   call $~lib/rt/tlsf/checkUsedBlock
   local.get $2
   call $~lib/rt/tlsf/moveBlock
   local.set $0
  else
   block $__inlined_func$~lib/rt/tlsf/reallocateBlock
    global.get $~lib/rt/tlsf/ROOT
    local.set $3
    local.get $0
    call $~lib/rt/tlsf/checkUsedBlock
    local.set $0
    block $folding-inner0
     local.get $2
     call $~lib/rt/tlsf/prepareSize
     local.tee $5
     local.get $0
     i32.load
     local.tee $6
     i32.const -4
     i32.and
     local.tee $4
     i32.le_u
     br_if $folding-inner0
     local.get $0
     i32.const 4
     i32.add
     local.get $0
     i32.load
     i32.const -4
     i32.and
     i32.add
     local.tee $7
     i32.load
     local.tee $8
     i32.const 1
     i32.and
     if
      local.get $5
      local.get $4
      i32.const 4
      i32.add
      local.get $8
      i32.const -4
      i32.and
      i32.add
      local.tee $4
      i32.le_u
      if
       local.get $3
       local.get $7
       call $~lib/rt/tlsf/removeBlock
       local.get $0
       local.get $4
       local.get $6
       i32.const 3
       i32.and
       i32.or
       i32.store
       br $folding-inner0
      end
     end
     local.get $3
     local.get $0
     local.get $2
     call $~lib/rt/tlsf/moveBlock
     local.set $0
     br $__inlined_func$~lib/rt/tlsf/reallocateBlock
    end
    local.get $3
    local.get $0
    local.get $5
    call $~lib/rt/tlsf/prepareBlock
   end
  end
  local.get $0
  i32.const 4
  i32.add
  local.tee $0
  i32.const 4
  i32.sub
  local.get $1
  i32.store offset=16
  local.get $0
  i32.const 16
  i32.add
 )
 (func $~lib/rt/pure/__retain (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  i32.const 4582652
  i32.gt_u
  if
   local.get $0
   i32.const 20
   i32.sub
   local.tee $1
   i32.load offset=4
   local.tee $2
   i32.const -268435456
   i32.and
   local.get $2
   i32.const 1
   i32.add
   i32.const -268435456
   i32.and
   i32.ne
   if
    i32.const 0
    i32.const 4579424
    i32.const 109
    i32.const 3
    call $~lib/builtins/abort
    unreachable
   end
   local.get $1
   local.get $2
   i32.const 1
   i32.add
   i32.store offset=4
   local.get $1
   i32.load
   i32.const 1
   i32.and
   if
    i32.const 0
    i32.const 4579424
    i32.const 112
    i32.const 14
    call $~lib/builtins/abort
    unreachable
   end
  end
  local.get $0
 )
 (func $~lib/rt/pure/__release (param $0 i32)
  local.get $0
  i32.const 4582652
  i32.gt_u
  if
   local.get $0
   i32.const 20
   i32.sub
   call $~lib/rt/pure/decrement
  end
 )
 (func $~lib/rt/__newArray (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  i32.const 16
  i32.const 3
  call $~lib/rt/pure/__new
  local.set $2
  local.get $0
  i32.const 2
  i32.shl
  local.tee $4
  i32.const 0
  call $~lib/rt/pure/__new
  local.set $3
  local.get $1
  if
   local.get $3
   local.get $1
   local.get $4
   call $~lib/memory/memory.copy
  end
  local.get $2
  local.get $3
  call $~lib/rt/pure/__retain
  i32.store
  local.get $2
  local.get $3
  i32.store offset=4
  local.get $2
  local.get $4
  i32.store offset=8
  local.get $2
  local.get $0
  i32.store offset=12
  local.get $2
 )
 (func $~lib/staticarray/StaticArray.fromArray<u32> (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  i32.load offset=12
  i32.const 2
  i32.shl
  local.tee $1
  i32.const 4
  call $~lib/rt/pure/__new
  local.tee $2
  local.get $0
  i32.load offset=4
  local.get $1
  call $~lib/memory/memory.copy
  local.get $2
  call $~lib/rt/pure/__retain
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/set_action (param $0 i32)
  (local $1 i32)
  global.get $input/action_ptr
  local.tee $1
  i32.const 1
  i32.add
  global.set $input/action_ptr
  local.get $1
  i32.const 2
  i32.shl
  i32.const 382976
  i32.add
  local.get $0
  i32.store
 )
 (func $input/add_reduce (param $0 i32) (param $1 i32)
  local.get $0
  i32.const 16383
  i32.and
  i32.const 2
  i32.shl
  i32.const 1
  i32.or
  local.get $1
  i32.const 16
  i32.shl
  i32.or
  call $input/set_action
 )
 (func $start:input~anonymous|0 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 1
  i32.const 5
  call $input/add_reduce
  i32.const 3
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 1
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|1 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 2
  i32.const 4
  call $input/add_reduce
  i32.const 3
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 2
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $~lib/staticarray/StaticArray<u32>#__get (param $0 i32) (param $1 i32) (result i32)
  local.get $1
  local.get $0
  i32.const 20
  i32.sub
  i32.load offset=16
  i32.const 2
  i32.shr_u
  i32.ge_u
  if
   i32.const 4580016
   i32.const 4580080
   i32.const 95
   i32.const 41
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  local.get $1
  i32.const 2
  i32.shl
  i32.add
  i32.load
 )
 (func $~lib/string/String#codePointAt (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  local.get $1
  local.get $0
  i32.const 20
  i32.sub
  i32.load offset=16
  i32.const 1
  i32.shr_u
  local.tee $2
  i32.ge_u
  if
   i32.const -1
   return
  end
  i32.const 1
  local.get $2
  local.get $1
  i32.const 1
  i32.add
  i32.eq
  local.get $0
  local.get $1
  i32.const 1
  i32.shl
  i32.add
  i32.load16_u
  local.tee $2
  i32.const 64512
  i32.and
  i32.const 55296
  i32.ne
  select
  if
   local.get $2
   return
  end
  local.get $0
  local.get $1
  i32.const 1
  i32.shl
  i32.add
  i32.load16_u offset=2
  local.tee $0
  i32.const 64512
  i32.and
  i32.const 56320
  i32.ne
  if
   local.get $2
   return
  end
  local.get $0
  local.get $2
  i32.const 10
  i32.shl
  i32.add
  i32.const -56613888
  i32.add
 )
 (func $~lib/string/String#charCodeAt (param $0 i32) (param $1 i32) (result i32)
  local.get $1
  local.get $0
  i32.const 20
  i32.sub
  i32.load offset=16
  i32.const 1
  i32.shr_u
  i32.ge_u
  if
   i32.const -1
   return
  end
  local.get $0
  local.get $1
  i32.const 1
  i32.shl
  i32.add
  i32.load16_u
 )
 (func $input/Lexer#next (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  global.get $input/str
  i32.const 20
  i32.sub
  i32.load offset=16
  i32.const 1
  i32.shr_u
  local.set $5
  i32.const 1
  local.set $1
  local.get $0
  i32.load offset=12
  local.get $0
  i32.load offset=8
  i32.add
  local.set $2
  local.get $0
  i32.const 0
  i32.store
  local.get $0
  i32.const 0
  i32.store offset=4
  local.get $2
  local.tee $3
  local.get $5
  i32.ge_s
  if
   local.get $0
   local.get $5
   i32.store offset=12
   local.get $0
   i32.const 0
   i32.store offset=8
   local.get $0
   call $~lib/rt/pure/__retain
   return
  end
  block $break|0
   block $case6|0
    block $case5|0
     block $case4|0
      block $case3|0
       block $case2|0
        block $case0|0
         global.get $input/str
         local.get $2
         call $~lib/string/String#codePointAt
         i32.const 1
         i32.shl
         i32.load16_u
         i32.const 255
         i32.and
         i32.const 1
         i32.sub
         br_table $case2|0 $case3|0 $case4|0 $case5|0 $case6|0 $case0|0
        end
        i32.const 6
        local.set $4
        local.get $0
        i32.const 6
        i32.store offset=4
        br $break|0
       end
       loop $while-continue|2
        local.get $2
        i32.const 1
        i32.add
        local.tee $2
        local.get $5
        i32.lt_s
        if (result i32)
         global.get $input/str
         local.get $2
         call $~lib/string/String#codePointAt
         i32.const 1
         i32.shl
         i32.load16_u
         i32.const 8
         i32.shr_u
         i32.const 6
         i32.and
        else
         i32.const 0
        end
        br_if $while-continue|2
       end
       i32.const 3
       local.set $4
       local.get $0
       i32.const 3
       i32.store offset=4
       local.get $2
       local.get $3
       i32.sub
       local.set $1
       br $break|0
      end
      i32.const 1
      local.set $4
      local.get $0
      i32.const 1
      i32.store offset=4
      br $break|0
     end
     i32.const 2
     local.set $1
    end
    i32.const 4
    local.set $4
    local.get $0
    i32.const 4
    i32.store offset=4
    br $break|0
   end
   i32.const 2
   local.set $4
   local.get $0
   i32.const 2
   i32.store offset=4
   loop $while-continue|3
    local.get $2
    i32.const 1
    i32.add
    local.tee $2
    local.get $5
    i32.lt_s
    if (result i32)
     global.get $input/str
     local.get $2
     call $~lib/string/String#codePointAt
     i32.const 1
     i32.shl
     i32.load16_u
     i32.const 8
     i32.shr_u
     i32.const 4
     i32.and
    else
     i32.const 0
    end
    br_if $while-continue|3
   end
   local.get $2
   local.get $3
   i32.sub
   local.set $1
  end
  local.get $4
  i32.const 3
  i32.eq
  if
   global.get $input/str
   local.get $3
   call $~lib/string/String#charCodeAt
   local.tee $2
   i32.const 83
   i32.eq
   if (result i32)
    global.get $input/str
    local.get $3
    i32.const 1
    i32.add
    call $~lib/string/String#charCodeAt
    i32.const 89
    i32.eq
    if (result i32)
     global.get $input/str
     local.get $3
     i32.const 2
     i32.add
     call $~lib/string/String#charCodeAt
     i32.const 77
     i32.eq
     if (result i32)
      global.get $input/str
      local.get $3
      i32.const 3
      i32.add
      call $~lib/string/String#charCodeAt
      i32.const 66
      i32.eq
      if (result i32)
       global.get $input/str
       local.get $3
       i32.const 4
       i32.add
       call $~lib/string/String#charCodeAt
       i32.const 79
       i32.eq
       if (result i32)
        global.get $input/str
        local.get $3
        i32.const 5
        i32.add
        call $~lib/string/String#charCodeAt
        i32.const 76
        i32.eq
        if (result i32)
         local.get $1
         i32.const 6
         i32.le_s
         if (result i32)
          i32.const 7
          local.set $4
          local.get $0
          i32.const 22
          i32.store offset=4
          i32.const 6
         else
          local.get $1
         end
        else
         local.get $1
        end
       else
        local.get $1
       end
      else
       local.get $1
      end
     else
      local.get $1
     end
    else
     local.get $1
    end
   else
    local.get $2
    i32.const 80
    i32.eq
    if (result i32)
     global.get $input/str
     local.get $3
     i32.const 1
     i32.add
     call $~lib/string/String#charCodeAt
     i32.const 82
     i32.eq
     if (result i32)
      global.get $input/str
      local.get $3
      i32.const 2
      i32.add
      call $~lib/string/String#charCodeAt
      i32.const 69
      i32.eq
      if (result i32)
       global.get $input/str
       local.get $3
       i32.const 3
       i32.add
       call $~lib/string/String#charCodeAt
       i32.const 67
       i32.eq
       if (result i32)
        local.get $1
        i32.const 4
        i32.le_s
        if (result i32)
         i32.const 7
         local.set $4
         local.get $0
         i32.const 23
         i32.store offset=4
         i32.const 4
        else
         local.get $1
        end
       else
        local.get $1
       end
      else
       local.get $1
      end
     else
      local.get $1
     end
    else
     local.get $2
     i32.const 73
     i32.eq
     if (result i32)
      global.get $input/str
      local.get $3
      i32.const 1
      i32.add
      call $~lib/string/String#charCodeAt
      local.tee $2
      i32.const 71
      i32.eq
      if (result i32)
       global.get $input/str
       local.get $3
       i32.const 2
       i32.add
       call $~lib/string/String#charCodeAt
       i32.const 78
       i32.eq
       if (result i32)
        local.get $1
        i32.const 3
        i32.le_s
        if
         i32.const 7
         local.set $4
         local.get $0
         i32.const 42
         i32.store offset=4
         i32.const 3
         local.set $1
        end
        global.get $input/str
        local.get $3
        i32.const 3
        i32.add
        call $~lib/string/String#charCodeAt
        i32.const 79
        i32.eq
        if (result i32)
         global.get $input/str
         local.get $3
         i32.const 4
         i32.add
         call $~lib/string/String#charCodeAt
         i32.const 82
         i32.eq
         if (result i32)
          global.get $input/str
          local.get $3
          i32.const 5
          i32.add
          call $~lib/string/String#charCodeAt
          i32.const 69
          i32.eq
          if (result i32)
           local.get $1
           i32.const 6
           i32.le_s
           if (result i32)
            i32.const 7
            local.set $4
            local.get $0
            i32.const 24
            i32.store offset=4
            i32.const 6
           else
            local.get $1
           end
          else
           local.get $1
          end
         else
          local.get $1
         end
        else
         local.get $1
        end
       else
        local.get $1
       end
      else
       local.get $2
       i32.const 77
       i32.eq
       if (result i32)
        global.get $input/str
        local.get $3
        i32.const 2
        i32.add
        call $~lib/string/String#charCodeAt
        i32.const 80
        i32.eq
        if (result i32)
         global.get $input/str
         local.get $3
         i32.const 3
         i32.add
         call $~lib/string/String#charCodeAt
         i32.const 79
         i32.eq
         if (result i32)
          global.get $input/str
          local.get $3
          i32.const 4
          i32.add
          call $~lib/string/String#charCodeAt
          i32.const 82
          i32.eq
          if (result i32)
           global.get $input/str
           local.get $3
           i32.const 5
           i32.add
           call $~lib/string/String#charCodeAt
           i32.const 84
           i32.eq
           if (result i32)
            local.get $1
            i32.const 6
            i32.le_s
            if (result i32)
             i32.const 7
             local.set $4
             local.get $0
             i32.const 30
             i32.store offset=4
             i32.const 6
            else
             local.get $1
            end
           else
            local.get $1
           end
          else
           local.get $1
          end
         else
          local.get $1
         end
        else
         local.get $1
        end
       else
        local.get $1
       end
      end
     else
      local.get $2
      i32.const 69
      i32.eq
      if (result i32)
       local.get $1
       i32.const 1
       i32.le_s
       if
        i32.const 7
        local.set $4
        local.get $0
        i32.const 72
        i32.store offset=4
        i32.const 1
        local.set $1
       end
       global.get $input/str
       local.get $3
       i32.const 1
       i32.add
       call $~lib/string/String#charCodeAt
       local.tee $2
       i32.const 82
       i32.eq
       if (result i32)
        global.get $input/str
        local.get $3
        i32.const 2
        i32.add
        call $~lib/string/String#charCodeAt
        i32.const 82
        i32.eq
        if (result i32)
         local.get $1
         i32.const 3
         i32.le_s
         if
          i32.const 7
          local.set $4
          local.get $0
          i32.const 41
          i32.store offset=4
          i32.const 3
          local.set $1
         end
         global.get $input/str
         local.get $3
         i32.const 3
         i32.add
         call $~lib/string/String#charCodeAt
         i32.const 79
         i32.eq
         if (result i32)
          global.get $input/str
          local.get $3
          i32.const 4
          i32.add
          call $~lib/string/String#charCodeAt
          i32.const 82
          i32.eq
          if (result i32)
           local.get $1
           i32.const 5
           i32.le_s
           if (result i32)
            i32.const 7
            local.set $4
            local.get $0
            i32.const 25
            i32.store offset=4
            i32.const 5
           else
            local.get $1
           end
          else
           local.get $1
          end
         else
          local.get $1
         end
        else
         local.get $1
        end
       else
        local.get $2
        i32.const 88
        i32.eq
        if (result i32)
         global.get $input/str
         local.get $3
         i32.const 2
         i32.add
         call $~lib/string/String#charCodeAt
         local.tee $2
         i32.const 84
         i32.eq
         if (result i32)
          local.get $1
          i32.const 3
          i32.le_s
          if (result i32)
           i32.const 7
           local.set $4
           local.get $0
           i32.const 27
           i32.store offset=4
           i32.const 3
          else
           local.get $1
          end
         else
          local.get $2
          i32.const 67
          i32.eq
          if (result i32)
           local.get $1
           i32.const 3
           i32.le_s
           if (result i32)
            i32.const 7
            local.set $4
            local.get $0
            i32.const 40
            i32.store offset=4
            i32.const 3
           else
            local.get $1
           end
          else
           local.get $1
          end
         end
        else
         local.get $1
        end
       end
      else
       local.get $2
       i32.const 78
       i32.eq
       if (result i32)
        global.get $input/str
        local.get $3
        i32.const 1
        i32.add
        call $~lib/string/String#charCodeAt
        i32.const 65
        i32.eq
        if (result i32)
         global.get $input/str
         local.get $3
         i32.const 2
         i32.add
         call $~lib/string/String#charCodeAt
         i32.const 77
         i32.eq
         if (result i32)
          global.get $input/str
          local.get $3
          i32.const 3
          i32.add
          call $~lib/string/String#charCodeAt
          i32.const 69
          i32.eq
          if (result i32)
           local.get $1
           i32.const 4
           i32.le_s
           if (result i32)
            i32.const 7
            local.set $4
            local.get $0
            i32.const 26
            i32.store offset=4
            i32.const 4
           else
            local.get $1
           end
          else
           local.get $1
          end
         else
          local.get $1
         end
        else
         local.get $1
        end
       else
        local.get $2
        i32.const 65
        i32.eq
        if (result i32)
         local.get $1
         i32.const 1
         i32.le_s
         if
          i32.const 7
          local.set $4
          local.get $0
          i32.const 68
          i32.store offset=4
          i32.const 1
          local.set $1
         end
         global.get $input/str
         local.get $3
         i32.const 1
         i32.add
         call $~lib/string/String#charCodeAt
         i32.const 83
         i32.eq
         if (result i32)
          local.get $1
          i32.const 2
          i32.le_s
          if (result i32)
           i32.const 7
           local.set $4
           local.get $0
           i32.const 28
           i32.store offset=4
           i32.const 2
          else
           local.get $1
          end
         else
          local.get $1
         end
        else
         local.get $2
         i32.const 97
         i32.eq
         if (result i32)
          local.get $1
          i32.const 1
          i32.le_s
          if
           i32.const 7
           local.set $4
           local.get $0
           i32.const 64
           i32.store offset=4
           i32.const 1
           local.set $1
          end
          global.get $input/str
          local.get $3
          i32.const 1
          i32.add
          call $~lib/string/String#charCodeAt
          i32.const 115
          i32.eq
          if (result i32)
           local.get $1
           i32.const 2
           i32.le_s
           if
            i32.const 7
            local.set $4
            local.get $0
            i32.const 29
            i32.store offset=4
            i32.const 2
            local.set $1
           end
           global.get $input/str
           local.get $3
           i32.const 2
           i32.add
           call $~lib/string/String#charCodeAt
           i32.const 115
           i32.eq
           if (result i32)
            global.get $input/str
            local.get $3
            i32.const 3
            i32.add
            call $~lib/string/String#charCodeAt
            i32.const 101
            i32.eq
            if (result i32)
             global.get $input/str
             local.get $3
             i32.const 4
             i32.add
             call $~lib/string/String#charCodeAt
             i32.const 114
             i32.eq
             if (result i32)
              global.get $input/str
              local.get $3
              i32.const 5
              i32.add
              call $~lib/string/String#charCodeAt
              i32.const 116
              i32.eq
              if (result i32)
               local.get $1
               i32.const 6
               i32.le_s
               if (result i32)
                i32.const 7
                local.set $4
                local.get $0
                i32.const 59
                i32.store offset=4
                i32.const 6
               else
                local.get $1
               end
              else
               local.get $1
              end
             else
              local.get $1
             end
            else
             local.get $1
            end
           else
            local.get $1
           end
          else
           local.get $1
          end
         else
          local.get $2
          i32.const 70
          i32.eq
          if (result i32)
           local.get $1
           i32.const 1
           i32.le_s
           if
            i32.const 7
            local.set $4
            local.get $0
            i32.const 73
            i32.store offset=4
            i32.const 1
            local.set $1
           end
           global.get $input/str
           local.get $3
           i32.const 1
           i32.add
           call $~lib/string/String#charCodeAt
           i32.const 79
           i32.eq
           if (result i32)
            global.get $input/str
            local.get $3
            i32.const 2
            i32.add
            call $~lib/string/String#charCodeAt
            i32.const 82
            i32.eq
            if (result i32)
             global.get $input/str
             local.get $3
             i32.const 3
             i32.add
             call $~lib/string/String#charCodeAt
             i32.const 75
             i32.eq
             if (result i32)
              local.get $1
              i32.const 4
              i32.le_s
              if (result i32)
               i32.const 7
               local.set $4
               local.get $0
               i32.const 38
               i32.store offset=4
               i32.const 4
              else
               local.get $1
              end
             else
              local.get $1
             end
            else
             local.get $1
            end
           else
            local.get $1
           end
          else
           local.get $2
           i32.const 82
           i32.eq
           if (result i32)
            global.get $input/str
            local.get $3
            i32.const 1
            i32.add
            call $~lib/string/String#charCodeAt
            local.tee $2
            i32.const 83
            i32.eq
            if (result i32)
             global.get $input/str
             local.get $3
             i32.const 2
             i32.add
             call $~lib/string/String#charCodeAt
             i32.const 84
             i32.eq
             if (result i32)
              local.get $1
              i32.const 3
              i32.le_s
              if (result i32)
               i32.const 7
               local.set $4
               local.get $0
               i32.const 43
               i32.store offset=4
               i32.const 3
              else
               local.get $1
              end
             else
              local.get $1
             end
            else
             local.get $2
             i32.const 69
             i32.eq
             if (result i32)
              global.get $input/str
              local.get $3
              i32.const 2
              i32.add
              call $~lib/string/String#charCodeAt
              i32.const 68
              i32.eq
              if (result i32)
               local.get $1
               i32.const 3
               i32.le_s
               if (result i32)
                i32.const 7
                local.set $4
                local.get $0
                i32.const 44
                i32.store offset=4
                i32.const 3
               else
                local.get $1
               end
              else
               local.get $1
              end
             else
              local.get $1
             end
            end
           else
            local.get $2
            i32.const 101
            i32.eq
            if (result i32)
             local.get $1
             i32.const 1
             i32.le_s
             if
              i32.const 7
              local.set $4
              local.get $0
              i32.const 67
              i32.store offset=4
              i32.const 1
              local.set $1
             end
             global.get $input/str
             local.get $3
             i32.const 1
             i32.add
             call $~lib/string/String#charCodeAt
             i32.const 114
             i32.eq
             if (result i32)
              global.get $input/str
              local.get $3
              i32.const 2
              i32.add
              call $~lib/string/String#charCodeAt
              i32.const 104
              i32.eq
              if (result i32)
               local.get $1
               i32.const 3
               i32.le_s
               if (result i32)
                i32.const 7
                local.set $4
                local.get $0
                i32.const 48
                i32.store offset=4
                i32.const 3
               else
                local.get $1
               end
              else
               local.get $1
              end
             else
              local.get $1
             end
            else
             local.get $2
             i32.const 99
             i32.eq
             if (result i32)
              local.get $1
              i32.const 1
              i32.le_s
              if
               i32.const 7
               local.set $4
               local.get $0
               i32.const 51
               i32.store offset=4
               i32.const 1
               local.set $1
              end
              global.get $input/str
              local.get $3
              i32.const 1
              i32.add
              call $~lib/string/String#charCodeAt
              i32.const 115
              i32.eq
              if (result i32)
               global.get $input/str
               local.get $3
               i32.const 2
               i32.add
               call $~lib/string/String#charCodeAt
               i32.const 116
               i32.eq
               if (result i32)
                global.get $input/str
                local.get $3
                i32.const 3
                i32.add
                call $~lib/string/String#charCodeAt
                i32.const 114
                i32.eq
                if (result i32)
                 local.get $1
                 i32.const 4
                 i32.le_s
                 if (result i32)
                  i32.const 7
                  local.set $4
                  local.get $0
                  i32.const 50
                  i32.store offset=4
                  i32.const 4
                 else
                  local.get $1
                 end
                else
                 local.get $1
                end
               else
                local.get $1
               end
              else
               local.get $1
              end
             else
              local.get $2
              i32.const 114
              i32.eq
              if (result i32)
               local.get $1
               i32.const 1
               i32.le_s
               if
                i32.const 7
                local.set $4
                local.get $0
                i32.const 53
                i32.store offset=4
                i32.const 1
                local.set $1
               end
               global.get $input/str
               local.get $3
               i32.const 1
               i32.add
               call $~lib/string/String#charCodeAt
               i32.const 101
               i32.eq
               if (result i32)
                global.get $input/str
                local.get $3
                i32.const 2
                i32.add
                call $~lib/string/String#charCodeAt
                i32.const 116
                i32.eq
                if (result i32)
                 global.get $input/str
                 local.get $3
                 i32.const 3
                 i32.add
                 call $~lib/string/String#charCodeAt
                 i32.const 117
                 i32.eq
                 if (result i32)
                  global.get $input/str
                  local.get $3
                  i32.const 4
                  i32.add
                  call $~lib/string/String#charCodeAt
                  i32.const 114
                  i32.eq
                  if (result i32)
                   global.get $input/str
                   local.get $3
                   i32.const 5
                   i32.add
                   call $~lib/string/String#charCodeAt
                   i32.const 110
                   i32.eq
                   if (result i32)
                    local.get $1
                    i32.const 6
                    i32.le_s
                    if (result i32)
                     i32.const 7
                     local.set $4
                     local.get $0
                     i32.const 52
                     i32.store offset=4
                     i32.const 6
                    else
                     local.get $1
                    end
                   else
                    local.get $1
                   end
                  else
                   local.get $1
                  end
                 else
                  local.get $1
                 end
                else
                 local.get $1
                end
               else
                local.get $1
               end
              else
               local.get $2
               i32.const 102
               i32.eq
               if (result i32)
                local.get $1
                i32.const 1
                i32.le_s
                if (result i32)
                 i32.const 7
                 local.set $4
                 local.get $0
                 i32.const 55
                 i32.store offset=4
                 i32.const 1
                else
                 local.get $1
                end
               else
                local.get $2
                i32.const 115
                i32.eq
                if (result i32)
                 global.get $input/str
                 local.get $3
                 i32.const 1
                 i32.add
                 call $~lib/string/String#charCodeAt
                 i32.const 104
                 i32.eq
                 if (result i32)
                  global.get $input/str
                  local.get $3
                  i32.const 2
                  i32.add
                  call $~lib/string/String#charCodeAt
                  i32.const 105
                  i32.eq
                  if (result i32)
                   global.get $input/str
                   local.get $3
                   i32.const 3
                   i32.add
                   call $~lib/string/String#charCodeAt
                   i32.const 102
                   i32.eq
                   if (result i32)
                    global.get $input/str
                    local.get $3
                    i32.const 4
                    i32.add
                    call $~lib/string/String#charCodeAt
                    i32.const 116
                    i32.eq
                    if (result i32)
                     local.get $1
                     i32.const 5
                     i32.le_s
                     if (result i32)
                      i32.const 7
                      local.set $4
                      local.get $0
                      i32.const 60
                      i32.store offset=4
                      i32.const 5
                     else
                      local.get $1
                     end
                    else
                     local.get $1
                    end
                   else
                    local.get $1
                   end
                  else
                   local.get $1
                  end
                 else
                  local.get $1
                 end
                else
                 local.get $2
                 i32.const 103
                 i32.eq
                 if (result i32)
                  local.get $1
                  i32.const 1
                  i32.le_s
                  if (result i32)
                   i32.const 7
                   local.set $4
                   local.get $0
                   i32.const 61
                   i32.store offset=4
                   i32.const 1
                  else
                   local.get $1
                  end
                 else
                  local.get $2
                  i32.const 116
                  i32.eq
                  if (result i32)
                   local.get $1
                   i32.const 1
                   i32.le_s
                   if (result i32)
                    i32.const 7
                    local.set $4
                    local.get $0
                    i32.const 62
                    i32.store offset=4
                    i32.const 1
                   else
                    local.get $1
                   end
                  else
                   local.get $2
                   i32.const 98
                   i32.eq
                   if (result i32)
                    local.get $1
                    i32.const 1
                    i32.le_s
                    if (result i32)
                     i32.const 7
                     local.set $4
                     local.get $0
                     i32.const 65
                     i32.store offset=4
                     i32.const 1
                    else
                     local.get $1
                    end
                   else
                    local.get $2
                    i32.const 100
                    i32.eq
                    if (result i32)
                     local.get $1
                     i32.const 1
                     i32.le_s
                     if (result i32)
                      i32.const 7
                      local.set $4
                      local.get $0
                      i32.const 66
                      i32.store offset=4
                      i32.const 1
                     else
                      local.get $1
                     end
                    else
                     local.get $2
                     i32.const 66
                     i32.eq
                     if (result i32)
                      local.get $1
                      i32.const 1
                      i32.le_s
                      if (result i32)
                       i32.const 7
                       local.set $4
                       local.get $0
                       i32.const 69
                       i32.store offset=4
                       i32.const 1
                      else
                       local.get $1
                      end
                     else
                      local.get $2
                      i32.const 67
                      i32.eq
                      if (result i32)
                       local.get $1
                       i32.const 1
                       i32.le_s
                       if (result i32)
                        i32.const 7
                        local.set $4
                        local.get $0
                        i32.const 70
                        i32.store offset=4
                        i32.const 1
                       else
                        local.get $1
                       end
                      else
                       local.get $2
                       i32.const 68
                       i32.eq
                       if (result i32)
                        local.get $1
                        i32.const 1
                        i32.le_s
                        if (result i32)
                         i32.const 7
                         local.set $4
                         local.get $0
                         i32.const 71
                         i32.store offset=4
                         i32.const 1
                        else
                         local.get $1
                        end
                       else
                        local.get $1
                       end
                      end
                     end
                    end
                   end
                  end
                 end
                end
               end
              end
             end
            end
           end
          end
         end
        end
       end
      end
     end
    end
   end
   local.set $1
  end
  i32.const 1
  local.get $4
  i32.const 3
  i32.eq
  local.get $4
  i32.const 6
  i32.eq
  select
  if
   global.get $input/str
   local.get $3
   call $~lib/string/String#charCodeAt
   local.tee $2
   i32.const 40
   i32.eq
   if (result i32)
    i32.const 5
    local.set $4
    local.get $0
    i32.const 37
    i32.store offset=4
    global.get $input/str
    local.get $3
    i32.const 1
    i32.add
    call $~lib/string/String#charCodeAt
    local.tee $1
    i32.const 40
    i32.eq
    if (result i32)
     local.get $0
     i32.const 10
     i32.store offset=4
     i32.const 2
    else
     local.get $1
     i32.const 42
     i32.eq
     if (result i32)
      local.get $0
      i32.const 15
      i32.store offset=4
      i32.const 2
     else
      local.get $1
      i32.const 43
      i32.eq
      if (result i32)
       local.get $0
       i32.const 16
       i32.store offset=4
       i32.const 2
      else
       i32.const 1
      end
     end
    end
   else
    local.get $2
    i32.const 41
    i32.eq
    if (result i32)
     i32.const 5
     local.set $4
     local.get $0
     i32.const 39
     i32.store offset=4
     global.get $input/str
     local.get $3
     i32.const 1
     i32.add
     call $~lib/string/String#charCodeAt
     i32.const 41
     i32.eq
     if (result i32)
      local.get $0
      i32.const 11
      i32.store offset=4
      i32.const 2
     else
      i32.const 1
     end
    else
     local.get $2
     i32.const 60
     i32.eq
     if (result i32)
      global.get $input/str
      local.get $3
      i32.const 1
      i32.add
      call $~lib/string/String#charCodeAt
      i32.const 62
      i32.eq
      if (result i32)
       i32.const 5
       local.set $4
       local.get $0
       i32.const 12
       i32.store offset=4
       i32.const 2
      else
       local.get $1
      end
     else
      local.get $2
      i32.const 43
      i32.eq
      if (result i32)
       global.get $input/str
       local.get $3
       i32.const 1
       i32.add
       call $~lib/string/String#charCodeAt
       i32.const 62
       i32.eq
       if (result i32)
        i32.const 5
        local.set $4
        local.get $0
        i32.const 13
        i32.store offset=4
        i32.const 2
       else
        local.get $1
       end
      else
       local.get $2
       i32.const 61
       i32.eq
       if (result i32)
        global.get $input/str
        local.get $3
        i32.const 1
        i32.add
        call $~lib/string/String#charCodeAt
        i32.const 62
        i32.eq
        if (result i32)
         i32.const 5
         local.set $4
         local.get $0
         i32.const 14
         i32.store offset=4
         i32.const 2
        else
         local.get $1
        end
       else
        local.get $2
        i32.const 58
        i32.eq
        if (result i32)
         i32.const 5
         local.set $4
         local.get $0
         i32.const 49
         i32.store offset=4
         global.get $input/str
         local.get $3
         i32.const 1
         i32.add
         call $~lib/string/String#charCodeAt
         i32.const 58
         i32.eq
         if (result i32)
          local.get $0
          i32.const 17
          i32.store offset=4
          i32.const 2
         else
          i32.const 1
         end
        else
         local.get $2
         i32.const 964
         i32.eq
         if (result i32)
          i32.const 5
          local.set $4
          local.get $0
          i32.const 18
          i32.store offset=4
          i32.const 1
         else
          local.get $2
          i32.const 952
          i32.eq
          if (result i32)
           i32.const 5
           local.set $4
           local.get $0
           i32.const 19
           i32.store offset=4
           i32.const 1
          else
           local.get $2
           i32.const 603
           i32.eq
           if (result i32)
            i32.const 5
            local.set $4
            local.get $0
            i32.const 20
            i32.store offset=4
            i32.const 1
           else
            local.get $2
            i32.const 64
            i32.eq
            if (result i32)
             i32.const 5
             local.set $4
             local.get $0
             i32.const 21
             i32.store offset=4
             i32.const 1
            else
             local.get $2
             i32.const 9474
             i32.eq
             if (result i32)
              i32.const 5
              local.set $4
              local.get $0
              i32.const 31
              i32.store offset=4
              i32.const 1
             else
              local.get $2
              i32.const 124
              i32.eq
              if (result i32)
               i32.const 5
               local.set $4
               local.get $0
               i32.const 32
               i32.store offset=4
               i32.const 1
              else
               local.get $2
               i32.const 8594
               i32.eq
               if (result i32)
                i32.const 5
                local.set $4
                local.get $0
                i32.const 33
                i32.store offset=4
                i32.const 1
               else
                local.get $2
                i32.const 62
                i32.eq
                if (result i32)
                 i32.const 5
                 local.set $4
                 local.get $0
                 i32.const 34
                 i32.store offset=4
                 i32.const 1
                else
                 local.get $2
                 i32.const 91
                 i32.eq
                 if (result i32)
                  i32.const 5
                  local.set $4
                  local.get $0
                  i32.const 35
                  i32.store offset=4
                  i32.const 1
                 else
                  local.get $2
                  i32.const 93
                  i32.eq
                  if (result i32)
                   i32.const 5
                   local.set $4
                   local.get $0
                   i32.const 36
                   i32.store offset=4
                   i32.const 1
                  else
                   local.get $2
                   i32.const 94
                   i32.eq
                   if (result i32)
                    i32.const 5
                    local.set $4
                    local.get $0
                    i32.const 45
                    i32.store offset=4
                    i32.const 1
                   else
                    local.get $2
                    i32.const 123
                    i32.eq
                    if (result i32)
                     i32.const 5
                     local.set $4
                     local.get $0
                     i32.const 46
                     i32.store offset=4
                     i32.const 1
                    else
                     local.get $2
                     i32.const 125
                     i32.eq
                     if (result i32)
                      i32.const 5
                      local.set $4
                      local.get $0
                      i32.const 47
                      i32.store offset=4
                      i32.const 1
                     else
                      local.get $2
                      i32.const 8614
                      i32.eq
                      if (result i32)
                       i32.const 5
                       local.set $4
                       local.get $0
                       i32.const 54
                       i32.store offset=4
                       i32.const 1
                      else
                       local.get $2
                       i32.const 35
                       i32.eq
                       if (result i32)
                        i32.const 5
                        local.set $4
                        local.get $0
                        i32.const 56
                        i32.store offset=4
                        i32.const 1
                       else
                        local.get $2
                        i32.const 63
                        i32.eq
                        if (result i32)
                         i32.const 5
                         local.set $4
                         local.get $0
                         i32.const 57
                         i32.store offset=4
                         i32.const 1
                        else
                         local.get $2
                         i32.const 36
                         i32.eq
                         if (result i32)
                          i32.const 5
                          local.set $4
                          local.get $0
                          i32.const 79
                          i32.store offset=4
                          global.get $input/str
                          local.get $3
                          i32.const 1
                          i32.add
                          call $~lib/string/String#charCodeAt
                          i32.const 101
                          i32.eq
                          if (result i32)
                           global.get $input/str
                           local.get $3
                           i32.const 2
                           i32.add
                           call $~lib/string/String#charCodeAt
                           i32.const 111
                           i32.eq
                           if (result i32)
                            global.get $input/str
                            local.get $3
                            i32.const 3
                            i32.add
                            call $~lib/string/String#charCodeAt
                            i32.const 102
                            i32.eq
                            if (result i32)
                             local.get $0
                             i32.const 58
                             i32.store offset=4
                             i32.const 4
                            else
                             i32.const 1
                            end
                           else
                            i32.const 1
                           end
                          else
                           i32.const 1
                          end
                         else
                          local.get $2
                          i32.const 92
                          i32.eq
                          if (result i32)
                           i32.const 5
                           local.set $4
                           local.get $0
                           i32.const 63
                           i32.store offset=4
                           i32.const 1
                          else
                           local.get $2
                           i32.const 34
                           i32.eq
                           if (result i32)
                            i32.const 5
                            local.set $4
                            local.get $0
                            i32.const 74
                            i32.store offset=4
                            i32.const 1
                           else
                            local.get $2
                            i32.const 39
                            i32.eq
                            if (result i32)
                             i32.const 5
                             local.set $4
                             local.get $0
                             i32.const 75
                             i32.store offset=4
                             i32.const 1
                            else
                             local.get $2
                             i32.const 47
                             i32.eq
                             if (result i32)
                              i32.const 5
                              local.set $4
                              local.get $0
                              i32.const 76
                              i32.store offset=4
                              i32.const 1
                             else
                              local.get $2
                              i32.const 45
                              i32.eq
                              if (result i32)
                               i32.const 5
                               local.set $4
                               local.get $0
                               i32.const 77
                               i32.store offset=4
                               i32.const 1
                              else
                               local.get $2
                               i32.const 95
                               i32.eq
                               if (result i32)
                                i32.const 5
                                local.set $4
                                local.get $0
                                i32.const 78
                                i32.store offset=4
                                i32.const 1
                               else
                                local.get $1
                               end
                              end
                             end
                            end
                           end
                          end
                         end
                        end
                       end
                      end
                     end
                    end
                   end
                  end
                 end
                end
               end
              end
             end
            end
           end
          end
         end
        end
       end
      end
     end
    end
   end
   local.set $1
  end
  local.get $0
  local.get $4
  i32.store
  local.get $0
  local.get $3
  i32.store offset=12
  local.get $0
  local.get $1
  i32.store offset=8
  local.get $0
  call $~lib/rt/pure/__retain
 )
 (func $input/_skip (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.set $0
  local.get $1
  call $~lib/rt/pure/__retain
  local.set $4
  local.get $0
  i32.load offset=12
  local.set $5
  loop $while-continue|0
   block $input/lm|inlined.0 (result i32)
    local.get $0
    call $~lib/rt/pure/__retain
    local.set $1
    local.get $4
    call $~lib/rt/pure/__retain
    local.tee $3
    i32.const 20
    i32.sub
    i32.load offset=16
    i32.const 2
    i32.shr_u
    local.set $6
    i32.const 0
    local.set $2
    loop $for-loop|1
     local.get $2
     local.get $6
     i32.lt_s
     if
      local.get $3
      local.get $2
      call $~lib/staticarray/StaticArray<u32>#__get
      local.tee $7
      local.get $1
      i32.load offset=4
      i32.eq
      if (result i32)
       i32.const 1
      else
       local.get $7
       local.get $1
       i32.load
       i32.eq
      end
      if
       local.get $3
       call $~lib/rt/pure/__release
       local.get $1
       call $~lib/rt/pure/__release
       i32.const 1
       br $input/lm|inlined.0
      end
      local.get $2
      i32.const 1
      i32.add
      local.set $2
      br $for-loop|1
     end
    end
    local.get $3
    call $~lib/rt/pure/__release
    local.get $1
    call $~lib/rt/pure/__release
    i32.const 0
   end
   if
    local.get $0
    call $input/Lexer#next
    call $~lib/rt/pure/__release
    br $while-continue|0
   end
  end
  local.get $0
  i32.load offset=12
  local.get $5
  i32.sub
  local.tee $1
  i32.const 0
  i32.gt_s
  if
   local.get $1
   i32.const 2
   i32.shl
   i32.const 3
   i32.or
   call $input/set_action
  end
  local.get $0
  call $~lib/rt/pure/__release
  local.get $4
  call $~lib/rt/pure/__release
 )
 (func $~lib/memory/memory.fill (param $0 i32) (param $1 i32)
  (local $2 i32)
  block $~lib/util/memory/memset|inlined.0
   local.get $1
   i32.eqz
   br_if $~lib/util/memory/memset|inlined.0
   local.get $0
   i32.const 0
   i32.store8
   local.get $0
   local.get $1
   i32.add
   i32.const 4
   i32.sub
   local.tee $2
   i32.const 0
   i32.store8 offset=3
   local.get $1
   i32.const 2
   i32.le_u
   br_if $~lib/util/memory/memset|inlined.0
   local.get $0
   i32.const 0
   i32.store8 offset=1
   local.get $0
   i32.const 0
   i32.store8 offset=2
   local.get $2
   i32.const 0
   i32.store8 offset=2
   local.get $2
   i32.const 0
   i32.store8 offset=1
   local.get $1
   i32.const 6
   i32.le_u
   br_if $~lib/util/memory/memset|inlined.0
   local.get $0
   i32.const 0
   i32.store8 offset=3
   local.get $2
   i32.const 0
   i32.store8
   local.get $1
   i32.const 8
   i32.le_u
   br_if $~lib/util/memory/memset|inlined.0
   local.get $0
   i32.const 0
   local.get $0
   i32.sub
   i32.const 3
   i32.and
   local.tee $2
   i32.add
   local.tee $0
   i32.const 0
   i32.store
   local.get $0
   local.get $1
   local.get $2
   i32.sub
   i32.const -4
   i32.and
   local.tee $2
   i32.add
   i32.const 28
   i32.sub
   local.tee $1
   i32.const 0
   i32.store offset=24
   local.get $2
   i32.const 8
   i32.le_u
   br_if $~lib/util/memory/memset|inlined.0
   local.get $0
   i32.const 0
   i32.store offset=4
   local.get $0
   i32.const 0
   i32.store offset=8
   local.get $1
   i32.const 0
   i32.store offset=16
   local.get $1
   i32.const 0
   i32.store offset=20
   local.get $2
   i32.const 24
   i32.le_u
   br_if $~lib/util/memory/memset|inlined.0
   local.get $0
   i32.const 0
   i32.store offset=12
   local.get $0
   i32.const 0
   i32.store offset=16
   local.get $0
   i32.const 0
   i32.store offset=20
   local.get $0
   i32.const 0
   i32.store offset=24
   local.get $1
   i32.const 0
   i32.store
   local.get $1
   i32.const 0
   i32.store offset=4
   local.get $1
   i32.const 0
   i32.store offset=8
   local.get $1
   i32.const 0
   i32.store offset=12
   local.get $0
   local.get $0
   i32.const 4
   i32.and
   i32.const 24
   i32.add
   local.tee $1
   i32.add
   local.set $0
   local.get $2
   local.get $1
   i32.sub
   local.set $1
   loop $while-continue|0
    local.get $1
    i32.const 32
    i32.ge_u
    if
     local.get $0
     i64.const 0
     i64.store
     local.get $0
     i64.const 0
     i64.store offset=8
     local.get $0
     i64.const 0
     i64.store offset=16
     local.get $0
     i64.const 0
     i64.store offset=24
     local.get $1
     i32.const 32
     i32.sub
     local.set $1
     local.get $0
     i32.const 32
     i32.add
     local.set $0
     br $while-continue|0
    end
   end
  end
 )
 (func $~lib/arraybuffer/ArrayBuffer#constructor (param $0 i32) (result i32)
  (local $1 i32)
  local.get $0
  i32.const 1073741820
  i32.gt_u
  if
   i32.const 4580144
   i32.const 4580192
   i32.const 49
   i32.const 43
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  i32.const 0
  call $~lib/rt/pure/__new
  local.tee $1
  local.get $0
  call $~lib/memory/memory.fill
  local.get $1
  call $~lib/rt/pure/__retain
 )
 (func $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor (result i32)
  (local $0 i32)
  i32.const 24
  i32.const 8
  call $~lib/rt/pure/__new
  call $~lib/rt/pure/__retain
  local.tee $0
  i32.const 16
  call $~lib/arraybuffer/ArrayBuffer#constructor
  i32.store
  local.get $0
  i32.const 3
  i32.store offset=4
  local.get $0
  i32.const 64
  call $~lib/arraybuffer/ArrayBuffer#constructor
  i32.store offset=8
  local.get $0
  i32.const 4
  i32.store offset=12
  local.get $0
  i32.const 0
  i32.store offset=16
  local.get $0
  i32.const 0
  i32.store offset=20
  local.get $0
 )
 (func $~lib/util/hash/hash64 (param $0 i64) (result i32)
  (local $1 i32)
  local.get $0
  i32.wrap_i64
  local.tee $1
  i32.const 255
  i32.and
  i32.const -2128831035
  i32.xor
  i32.const 16777619
  i32.mul
  local.get $1
  i32.const 8
  i32.shr_u
  i32.const 255
  i32.and
  i32.xor
  i32.const 16777619
  i32.mul
  local.get $1
  i32.const 16
  i32.shr_u
  i32.const 255
  i32.and
  i32.xor
  i32.const 16777619
  i32.mul
  local.get $1
  i32.const 24
  i32.shr_u
  i32.xor
  i32.const 16777619
  i32.mul
  local.get $0
  i64.const 32
  i64.shr_u
  i32.wrap_i64
  local.tee $1
  i32.const 255
  i32.and
  i32.xor
  i32.const 16777619
  i32.mul
  local.get $1
  i32.const 8
  i32.shr_u
  i32.const 255
  i32.and
  i32.xor
  i32.const 16777619
  i32.mul
  local.get $1
  i32.const 16
  i32.shr_u
  i32.const 255
  i32.and
  i32.xor
  i32.const 16777619
  i32.mul
  local.get $1
  i32.const 24
  i32.shr_u
  i32.xor
  i32.const 16777619
  i32.mul
 )
 (func $~lib/map/Map<f64,%28input/Lexer%29=>void>#find (param $0 i32) (param $1 f64) (param $2 i32) (result i32)
  local.get $0
  i32.load
  local.get $2
  local.get $0
  i32.load offset=4
  i32.and
  i32.const 2
  i32.shl
  i32.add
  i32.load
  local.set $0
  loop $while-continue|0
   local.get $0
   if
    local.get $0
    i32.load offset=12
    i32.const 1
    i32.and
    if (result i32)
     i32.const 0
    else
     local.get $1
     local.get $0
     f64.load
     f64.eq
    end
    if
     local.get $0
     return
    end
    local.get $0
    i32.load offset=12
    i32.const -2
    i32.and
    local.set $0
    br $while-continue|0
   end
  end
  i32.const 0
 )
 (func $~lib/map/Map<f64,%28input/Lexer%29=>void>#has (param $0 i32) (param $1 f64) (result i32)
  local.get $0
  local.get $1
  local.get $1
  i64.reinterpret_f64
  call $~lib/util/hash/hash64
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#find
  i32.const 0
  i32.ne
 )
 (func $~lib/map/Map<f64,%28input/Lexer%29=>void>#get (param $0 i32) (param $1 f64) (result i32)
  local.get $0
  local.get $1
  local.get $1
  i64.reinterpret_f64
  call $~lib/util/hash/hash64
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#find
  local.tee $0
  i32.eqz
  if
   i32.const 4580256
   i32.const 4580320
   i32.const 104
   i32.const 17
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  i32.load offset=8
  call $~lib/rt/pure/__retain
 )
 (func $input/set_error (param $0 i32)
  (local $1 i32)
  global.get $input/error_ptr
  local.tee $1
  i32.const 1
  i32.add
  global.set $input/error_ptr
  local.get $1
  i32.const 255
  i32.and
  i32.const 2
  i32.shl
  i32.const 4577280
  i32.add
  local.get $0
  i32.store
 )
 (func $input/soft_fail (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.set $0
  i32.const 1
  global.set $input/FAILED
  local.get $0
  i32.load offset=12
  call $input/set_error
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/fail (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.set $0
  i32.const -1
  global.set $input/prod
  local.get $0
  call $input/soft_fail
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|2 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $1
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm404
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm404
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $2
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $2
   call $~lib/rt/pure/__release
  else
   local.get $0
   call $input/fail
  end
  local.get $0
  call $~lib/rt/pure/__release
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $1
  call $~lib/rt/pure/__release
 )
 (func $input/_no_check (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  i32.load offset=8
  i32.const 2
  i32.shl
  i32.const 2
  i32.or
  call $input/set_action
  local.get $0
  call $input/Lexer#next
  call $~lib/rt/pure/__release
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/setProduction (param $0 i32)
  local.get $0
  global.get $input/FAILED
  i32.const 1
  i32.ne
  i32.mul
  global.get $input/FAILED
  i32.const 0
  i32.ne
  i32.add
  global.set $input/prod
 )
 (func $input/_with_skip (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.set $0
  local.get $1
  call $~lib/rt/pure/__retain
  local.set $3
  global.get $input/FAILED
  if
   local.get $0
   call $~lib/rt/pure/__release
   local.get $3
   call $~lib/rt/pure/__release
   return
  end
  local.get $2
  if (result i32)
   local.get $2
   local.get $0
   i32.load offset=4
   i32.eq
  else
   i32.const 1
  end
  if (result i32)
   i32.const 1
  else
   local.get $2
   local.get $0
   i32.load
   i32.eq
  end
  if
   local.get $0
   call $~lib/rt/pure/__retain
   local.set $1
   local.get $3
   call $~lib/rt/pure/__retain
   local.set $2
   local.get $1
   i32.load offset=8
   i32.const 2
   i32.shl
   i32.const 2
   i32.or
   call $input/set_action
   local.get $1
   call $input/Lexer#next
   call $~lib/rt/pure/__release
   local.get $1
   local.get $2
   call $input/_skip
   local.get $1
   call $~lib/rt/pure/__release
   local.get $2
   call $~lib/rt/pure/__release
  else
   local.get $0
   call $input/soft_fail
  end
  local.get $0
  call $~lib/rt/pure/__release
  local.get $3
  call $~lib/rt/pure/__release
 )
 (func $input/$fn$js_function_start_symbol (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  i32.load offset=4
  i32.const 54
  i32.eq
  if
   local.get $0
   call $input/_no_check
   global.get $input/FAILED
   i32.eqz
   if
    i32.const 43
    call $input/setProduction
    local.get $0
    call $~lib/rt/pure/__release
    return
   end
  else
   local.get $0
   i32.load offset=4
   i32.const 55
   i32.eq
   if
    local.get $0
    call $input/_no_check
    global.get $input/FAILED
    i32.eqz
    if
     local.get $0
     global.get $input/const__
     i32.const 49
     call $input/_with_skip
     global.get $input/FAILED
     i32.eqz
     if
      i32.const 43
      call $input/setProduction
      i32.const 2
      i32.const 0
      call $input/add_reduce
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
    end
   end
  end
  local.get $0
  call $input/fail
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$sym$identifier (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $1
  global.get $input/const__
  call $input/_skip
  local.get $1
  call $~lib/rt/pure/__retain
  local.tee $2
  global.get $input/const__
  call $input/_skip
  local.get $2
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const_0_
  call $input/_skip
  global.get $input/idm232
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm232
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $3
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $3
   call $~lib/rt/pure/__release
  else
   global.get $input/tym232
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym232
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $3
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $3
    call $~lib/rt/pure/__release
   else
    local.get $0
    call $input/fail
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
  block $__inlined_func$input/$def$js_identifier
   global.get $input/FAILED
   i32.eqz
   if
    i32.const 99
    call $input/setProduction
    br $__inlined_func$input/$def$js_identifier
   end
   local.get $2
   call $input/fail
  end
  local.get $2
  call $~lib/rt/pure/__release
  global.get $input/FAILED
  i32.eqz
  if
   i32.const 77
   call $input/setProduction
   local.get $1
   call $~lib/rt/pure/__release
   return
  end
  local.get $1
  call $input/fail
  local.get $1
  call $~lib/rt/pure/__release
 )
 (func $input/$sym$js_identifier (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $1
  global.get $input/const__
  call $input/_skip
  local.get $1
  global.get $input/const__
  i32.const 3
  call $input/_with_skip
  block $__inlined_func$input/$def$id
   global.get $input/FAILED
   i32.eqz
   if
    i32.const 91
    call $input/setProduction
    br $__inlined_func$input/$def$id
   end
   local.get $1
   call $input/fail
  end
  local.get $1
  call $~lib/rt/pure/__release
  global.get $input/FAILED
  i32.eqz
  if
   i32.const 78
   call $input/setProduction
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  local.get $0
  call $input/fail
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$sym$generated_symbol (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $1
  global.get $input/const__
  call $input/_skip
  local.get $1
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $__inlined_func$input/$sym$generated_symbol_group_141_106
   local.get $0
   i32.load offset=4
   i32.const 19
   i32.eq
   if
    local.get $0
    call $input/_no_check
    global.get $input/FAILED
    i32.eqz
    if
     i32.const 67
     call $input/setProduction
     br $__inlined_func$input/$sym$generated_symbol_group_141_106
    end
   else
    local.get $0
    i32.load offset=4
    i32.const 61
    i32.eq
    if
     local.get $0
     call $input/_no_check
     global.get $input/FAILED
     i32.eqz
     if
      local.get $0
      global.get $input/const__
      i32.const 49
      call $input/_with_skip
      global.get $input/FAILED
      i32.eqz
      if
       i32.const 67
       call $input/setProduction
       i32.const 2
       i32.const 0
       call $input/add_reduce
       br $__inlined_func$input/$sym$generated_symbol_group_141_106
      end
     end
    end
   end
   local.get $0
   call $input/fail
  end
  local.get $0
  call $~lib/rt/pure/__release
  global.get $input/FAILED
  i32.eqz
  if
   local.get $1
   call $input/$sym$identifier
   global.get $input/FAILED
   i32.eqz
   if
    i32.const 68
    call $input/setProduction
    i32.const 2
    i32.const 62
    call $input/add_reduce
    local.get $1
    call $~lib/rt/pure/__release
    return
   end
  end
  local.get $1
  call $input/fail
  local.get $1
  call $~lib/rt/pure/__release
 )
 (func $input/$sym$literal_symbol (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $1
  global.get $input/const__
  call $input/_skip
  local.get $1
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $__inlined_func$input/$sym$literal_symbol_group_144_107
   local.get $0
   i32.load offset=4
   i32.const 18
   i32.eq
   if
    local.get $0
    call $input/_no_check
    global.get $input/FAILED
    i32.eqz
    if
     i32.const 69
     call $input/setProduction
     br $__inlined_func$input/$sym$literal_symbol_group_144_107
    end
   else
    local.get $0
    i32.load offset=4
    i32.const 62
    i32.eq
    if
     local.get $0
     call $input/_no_check
     global.get $input/FAILED
     i32.eqz
     if
      local.get $0
      global.get $input/const__
      i32.const 49
      call $input/_with_skip
      global.get $input/FAILED
      i32.eqz
      if
       i32.const 69
       call $input/setProduction
       i32.const 2
       i32.const 0
       call $input/add_reduce
       br $__inlined_func$input/$sym$literal_symbol_group_144_107
      end
     end
    end
   end
   local.get $0
   call $input/fail
  end
  local.get $0
  call $~lib/rt/pure/__release
  global.get $input/FAILED
  i32.eqz
  if
   local.get $1
   call $~lib/rt/pure/__retain
   local.tee $0
   global.get $input/const__
   call $input/_skip
   block $__inlined_func$input/$sym$literal_symbol_group_046_108
    block $folding-inner0
     local.get $0
     i32.load offset=4
     i32.const 78
     i32.eq
     if (result i32)
      i32.const 1
     else
      local.get $0
      i32.load offset=4
      i32.const 79
      i32.eq
     end
     if (result i32)
      i32.const 1
     else
      local.get $0
      i32.load
      i32.const 3
      i32.eq
     end
     if (result i32)
      i32.const 1
     else
      local.get $0
      i32.load
      i32.const 7
      i32.eq
     end
     if
      local.get $0
      call $input/$sym$identifier
      global.get $input/FAILED
      i32.eqz
      br_if $folding-inner0
     else
      local.get $0
      i32.load
      i32.const 2
      i32.eq
      if
       local.get $0
       call $~lib/rt/pure/__retain
       local.tee $2
       global.get $input/const__
       call $input/_skip
       local.get $2
       global.get $input/const__
       i32.const 2
       call $input/_with_skip
       block $__inlined_func$input/$def$natural
        global.get $input/FAILED
        i32.eqz
        if
         i32.const 90
         call $input/setProduction
         br $__inlined_func$input/$def$natural
        end
        local.get $2
        call $input/fail
       end
       local.get $2
       call $~lib/rt/pure/__release
       global.get $input/FAILED
       i32.eqz
       br_if $folding-inner0
      end
     end
     local.get $0
     call $input/fail
     br $__inlined_func$input/$sym$literal_symbol_group_046_108
    end
    i32.const 70
    call $input/setProduction
   end
   local.get $0
   call $~lib/rt/pure/__release
   global.get $input/FAILED
   i32.eqz
   if
    i32.const 71
    call $input/setProduction
    i32.const 2
    i32.const 63
    call $input/add_reduce
    local.get $1
    call $~lib/rt/pure/__release
    return
   end
  end
  local.get $1
  call $input/fail
  local.get $1
  call $~lib/rt/pure/__release
 )
 (func $input/$sym$escaped_symbol (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $1
  global.get $input/const__
  call $input/_skip
  local.get $1
  global.get $input/const__
  i32.const 63
  call $input/_with_skip
  global.get $input/FAILED
  i32.eqz
  if
   local.get $1
   call $~lib/rt/pure/__retain
   local.tee $0
   global.get $input/const__
   call $input/_skip
   block $__inlined_func$input/$sym$escaped_symbol_group_050_109
    block $folding-inner0
     local.get $0
     i32.load
     i32.const 3
     i32.eq
     if
      local.get $0
      call $input/_no_check
      global.get $input/FAILED
      i32.eqz
      br_if $folding-inner0
     else
      local.get $0
      i32.load
      i32.const 5
      i32.eq
      if
       local.get $0
       call $input/_no_check
       global.get $input/FAILED
       i32.eqz
       br_if $folding-inner0
      else
       local.get $0
       i32.load
       i32.const 6
       i32.eq
       if
        local.get $0
        call $input/_no_check
        global.get $input/FAILED
        i32.eqz
        br_if $folding-inner0
       end
      end
     end
     local.get $0
     call $input/fail
     br $__inlined_func$input/$sym$escaped_symbol_group_050_109
    end
    i32.const 72
    call $input/setProduction
   end
   local.get $0
   call $~lib/rt/pure/__release
   global.get $input/FAILED
   i32.eqz
   if
    i32.const 73
    call $input/setProduction
    i32.const 2
    i32.const 64
    call $input/add_reduce
    local.get $1
    call $~lib/rt/pure/__release
    return
   end
  end
  local.get $1
  call $input/fail
  local.get $1
  call $~lib/rt/pure/__release
 )
 (func $input/$sym$assert_function_symbol (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  i32.load offset=4
  i32.const 59
  i32.eq
  if
   local.get $0
   call $input/_no_check
   global.get $input/FAILED
   i32.eqz
   if
    local.get $0
    global.get $input/const__
    i32.const 49
    call $input/_with_skip
    global.get $input/FAILED
    i32.eqz
    if
     local.get $0
     call $input/$sym$identifier
     global.get $input/FAILED
     i32.eqz
     if
      i32.const 66
      call $input/setProduction
      i32.const 3
      i32.const 60
      call $input/add_reduce
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
    end
   end
  else
   local.get $0
   i32.load offset=4
   i32.const 60
   i32.eq
   if
    local.get $0
    call $input/_no_check
    global.get $input/FAILED
    i32.eqz
    if
     local.get $0
     global.get $input/const__
     i32.const 49
     call $input/_with_skip
     global.get $input/FAILED
     i32.eqz
     if
      local.get $0
      call $input/$sym$identifier
      global.get $input/FAILED
      i32.eqz
      if
       i32.const 66
       call $input/setProduction
       i32.const 3
       i32.const 61
       call $input/add_reduce
       local.get $0
       call $~lib/rt/pure/__release
       return
      end
     end
    end
   end
  end
  local.get $0
  call $input/fail
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$sym$terminal_symbol (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner0
   local.get $0
   i32.load offset=4
   i32.const 19
   i32.eq
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load offset=4
    i32.const 61
    i32.eq
   end
   if
    local.get $0
    call $input/$sym$generated_symbol
    global.get $input/FAILED
    i32.eqz
    br_if $folding-inner0
   else
    local.get $0
    i32.load offset=4
    i32.const 18
    i32.eq
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load offset=4
     i32.const 62
     i32.eq
    end
    if
     local.get $0
     call $input/$sym$literal_symbol
     global.get $input/FAILED
     i32.eqz
     br_if $folding-inner0
    else
     local.get $0
     i32.load offset=4
     i32.const 63
     i32.eq
     if
      local.get $0
      call $input/$sym$escaped_symbol
      global.get $input/FAILED
      i32.eqz
      br_if $folding-inner0
     else
      local.get $0
      i32.load offset=4
      i32.const 59
      i32.eq
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 60
       i32.eq
      end
      if
       local.get $0
       call $input/$sym$assert_function_symbol
       global.get $input/FAILED
       i32.eqz
       br_if $folding-inner0
      else
       local.get $0
       call $input/_no_check
       global.get $input/FAILED
       i32.eqz
       if
        i32.const 61
        call $input/setProduction
        i32.const 1
        i32.const 54
        call $input/add_reduce
        local.get $0
        call $~lib/rt/pure/__release
        return
       end
      end
     end
    end
   end
   local.get $0
   call $input/fail
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  i32.const 61
  call $input/setProduction
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$fn$js_primitive (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const_1_
  call $input/_skip
  block $folding-inner0
   local.get $0
   i32.load
   i32.const 3
   i32.eq
   if
    local.get $0
    call $input/_no_check
    global.get $input/FAILED
    i32.eqz
    br_if $folding-inner0
   else
    local.get $0
    i32.load
    i32.const 2
    i32.eq
    if
     local.get $0
     call $input/_no_check
     global.get $input/FAILED
     i32.eqz
     br_if $folding-inner0
    else
     local.get $0
     i32.load
     i32.const 1
     i32.eq
     if
      local.get $0
      call $input/_no_check
      global.get $input/FAILED
      i32.eqz
      br_if $folding-inner0
     else
      local.get $0
      i32.load
      i32.const 6
      i32.eq
      if
       local.get $0
       call $input/_no_check
       global.get $input/FAILED
       i32.eqz
       br_if $folding-inner0
      else
       local.get $0
       i32.load
       i32.const 5
       i32.eq
       if
        local.get $0
        call $input/_no_check
        global.get $input/FAILED
        i32.eqz
        br_if $folding-inner0
       else
        local.get $0
        i32.load
        i32.const 7
        i32.eq
        if
         local.get $0
         call $input/_no_check
         global.get $input/FAILED
         i32.eqz
         br_if $folding-inner0
        else
         local.get $0
         call $~lib/rt/pure/__retain
         local.tee $1
         global.get $input/const__
         call $input/_skip
         local.get $1
         call $input/$sym$terminal_symbol
         block $__inlined_func$input/$fn$js_primitive_group_033_101
          global.get $input/FAILED
          i32.eqz
          if
           i32.const 40
           call $input/setProduction
           br $__inlined_func$input/$fn$js_primitive_group_033_101
          end
          local.get $1
          call $input/fail
         end
         local.get $1
         call $~lib/rt/pure/__release
         global.get $input/FAILED
         i32.eqz
         if
          i32.const 41
          call $input/setProduction
          i32.const 1
          i32.const 51
          call $input/add_reduce
          local.get $0
          call $~lib/rt/pure/__release
          return
         end
        end
       end
      end
     end
    end
   end
   local.get $0
   call $input/fail
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  i32.const 41
  call $input/setProduction
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State119 (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const_1_
  call $input/_skip
  global.get $input/idm121r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm121r
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
   local.get $0
   call $~lib/rt/pure/__release
   return
  else
   global.get $input/tym121r
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym121r
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
    local.get $0
    call $~lib/rt/pure/__release
    return
   else
    local.get $0
    call $input/fail
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/Lexer#copy (param $0 i32) (param $1 i32) (result i32)
  local.get $1
  call $~lib/rt/pure/__retain
  local.tee $1
  local.get $0
  i32.load offset=12
  i32.store offset=12
  local.get $1
  local.get $0
  i32.load offset=4
  i32.store offset=4
  local.get $1
  local.get $0
  i32.load
  i32.store
  local.get $1
  local.get $0
  i32.load offset=8
  i32.store offset=8
  local.get $1
 )
 (func $input/Lexer#constructor (result i32)
  (local $0 i32)
  i32.const 16
  i32.const 6
  call $~lib/rt/pure/__new
  call $~lib/rt/pure/__retain
  local.tee $0
  i32.const 0
  i32.store
  local.get $0
  i32.const 0
  i32.store offset=4
  local.get $0
  i32.const 0
  i32.store offset=8
  local.get $0
  i32.const 0
  i32.store offset=12
  local.get $0
  i32.const 0
  i32.store
  local.get $0
  i32.const 0
  i32.store offset=4
  local.get $0
  i32.const 0
  i32.store offset=8
  local.get $0
  i32.const 0
  i32.store offset=12
  local.get $0
 )
 (func $input/Lexer#copy@varargs (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  block $1of1
   block $0of1
    block $outOfRange
     global.get $~argumentsLength
     br_table $0of1 $1of1 $outOfRange
    end
    unreachable
   end
   call $input/Lexer#constructor
   local.tee $1
   local.set $2
  end
  local.get $0
  local.get $2
  call $input/Lexer#copy
  local.get $1
  call $~lib/rt/pure/__release
 )
 (func $input/State120 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const_1_
  call $input/_skip
  global.get $input/idm120
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm120
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
  else
   global.get $input/tym117
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym117
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $0
    i32.load offset=4
    i32.const 47
    i32.ne
    if
     local.get $0
     call $input/$fn$js_primitive
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    else
     local.get $0
     call $input/fail
    end
   end
  end
  global.get $input/stack_ptr
  local.set $3
  loop $while-continue|0
   local.get $3
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case3|1
      block $case2|1
       global.get $input/prod
       i32.const 39
       i32.sub
       br_table $case2|1 $case3|1 $break|1 $break|1 $case3|1
      end
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    local.get $0
    call $~lib/rt/pure/__retain
    local.tee $1
    global.get $input/const_1_
    call $input/_skip
    global.get $input/idm235r
    local.get $1
    i32.load offset=4
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
    if
     i32.const 1
     global.set $~argumentsLength
     local.get $1
     global.get $input/idm235r
     local.get $1
     i32.load offset=4
     f64.convert_i32_s
     call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
     local.tee $2
     i32.load
     call_indirect (type $i32_=>_none)
     local.get $2
     call $~lib/rt/pure/__release
    else
     global.get $input/tym235r
     local.get $1
     i32.load
     f64.convert_i32_s
     call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
     if
      i32.const 1
      global.set $~argumentsLength
      local.get $1
      global.get $input/tym235r
      local.get $1
      i32.load
      f64.convert_i32_s
      call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
      local.tee $2
      i32.load
      call_indirect (type $i32_=>_none)
      local.get $2
      call $~lib/rt/pure/__release
     else
      local.get $1
      call $input/fail
     end
    end
    local.get $1
    call $~lib/rt/pure/__release
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/Lexer#sync (param $0 i32) (param $1 i32)
  local.get $1
  call $~lib/rt/pure/__retain
  local.tee $1
  local.get $0
  call $input/Lexer#copy
  call $~lib/rt/pure/__release
  local.get $1
  call $~lib/rt/pure/__release
 )
 (func $input/$fn$js_data (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const_1_
  call $input/_skip
  global.get $input/idm117
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm117
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
  else
   global.get $input/tym117
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym117
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $0
    i32.load offset=4
    i32.const 47
    i32.ne
    if
     local.get $0
     call $input/$fn$js_primitive
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    else
     local.get $0
     call $input/fail
    end
   end
  end
  global.get $input/stack_ptr
  local.set $2
  loop $while-continue|0
   local.get $2
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case3|1
      block $case2|1
       block $case1|1
        block $case0|1
         global.get $input/prod
         i32.const 39
         i32.sub
         br_table $case2|1 $case3|1 $case1|1 $case0|1 $case3|1
        end
        local.get $0
        call $input/State119
        br $break|1
       end
       local.get $0
       call $input/State119
       br $break|1
      end
      local.get $0
      global.get $input/const_1_
      call $input/_skip
      local.get $0
      i32.load offset=4
      i32.const 47
      i32.eq
      if
       local.get $0
       call $~lib/rt/pure/__release
       return
      end
      i32.const 0
      global.set $~argumentsLength
      local.get $0
      call $input/Lexer#copy@varargs
      local.set $1
      global.get $input/action_ptr
      global.set $input/mark_
      global.get $input/mark_
      local.set $3
      global.get $input/prod
      local.set $4
      global.get $input/stack_ptr
      local.set $5
      local.get $1
      call $input/State120
      global.get $input/FAILED
      if
       local.get $4
       global.set $input/prod
       i32.const 0
       global.set $input/FAILED
       local.get $5
       global.set $input/stack_ptr
       local.get $3
       global.set $input/action_ptr
       local.get $0
       call $~lib/rt/pure/__release
       local.get $1
       call $~lib/rt/pure/__release
       return
      else
       local.get $0
       local.get $1
       call $input/Lexer#sync
      end
      local.get $1
      call $~lib/rt/pure/__release
      br $break|1
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|3 (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $1
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  call $input/$fn$js_function_start_symbol
  local.get $0
  call $input/$sym$identifier
  local.get $0
  global.get $input/const__
  call $input/_skip
  block $__inlined_func$input/$fn$referenced_function
   local.get $0
   i32.load offset=4
   i32.const 45
   i32.eq
   if
    local.get $0
    call $input/_no_check
    global.get $input/FAILED
    i32.eqz
    if
     local.get $0
     call $input/$sym$js_identifier
     global.get $input/FAILED
     i32.eqz
     if
      i32.const 34
      call $input/setProduction
      i32.const 4
      i32.const 43
      call $input/add_reduce
      br $__inlined_func$input/$fn$referenced_function
     end
    end
   else
    local.get $0
    i32.load offset=4
    i32.const 46
    i32.eq
    if
     local.get $0
     call $input/_no_check
     global.get $input/FAILED
     i32.eqz
     if
      local.get $0
      call $input/$fn$js_data
      global.get $input/FAILED
      i32.eqz
      if
       local.get $0
       global.get $input/const__
       i32.const 47
       call $input/_with_skip
       global.get $input/FAILED
       i32.eqz
       if
        i32.const 34
        call $input/setProduction
        i32.const 5
        i32.const 44
        call $input/add_reduce
        br $__inlined_func$input/$fn$referenced_function
       end
      end
     end
    end
   end
   local.get $0
   call $input/fail
  end
  local.get $0
  call $~lib/rt/pure/__release
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $1
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|4 (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $1
  call $input/_no_check
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $1
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  i32.load offset=4
  i32.const 12
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 13
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 54
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 55
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 56
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.eqz
  end
  if
   i32.const 19
   global.set $input/prod
   global.get $input/stack_ptr
   i32.const 1
   i32.sub
   global.set $input/stack_ptr
  else
   local.get $0
   call $input/fail
  end
  local.get $0
  call $~lib/rt/pure/__release
  local.get $1
  call $~lib/rt/pure/__release
 )
 (func $input/$cm$comment_primitive (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const_1_
  call $input/_skip
  block $folding-inner0
   local.get $0
   i32.load
   i32.const 6
   i32.eq
   if
    local.get $0
    call $input/_no_check
    global.get $input/FAILED
    i32.eqz
    br_if $folding-inner0
   else
    local.get $0
    i32.load
    i32.const 5
    i32.eq
    if
     local.get $0
     call $input/_no_check
     global.get $input/FAILED
     i32.eqz
     br_if $folding-inner0
    else
     local.get $0
     i32.load
     i32.const 3
     i32.eq
     if
      local.get $0
      call $input/_no_check
      global.get $input/FAILED
      i32.eqz
      br_if $folding-inner0
     else
      local.get $0
      i32.load
      i32.const 2
      i32.eq
      if
       local.get $0
       call $input/_no_check
       global.get $input/FAILED
       i32.eqz
       br_if $folding-inner0
      else
       local.get $0
       i32.load
       i32.const 1
       i32.eq
       if
        local.get $0
        call $input/_no_check
        global.get $input/FAILED
        i32.eqz
        br_if $folding-inner0
       else
        local.get $0
        i32.load
        i32.const 7
        i32.eq
        if
         local.get $0
         call $input/_no_check
         global.get $input/FAILED
         i32.eqz
         br_if $folding-inner0
        end
       end
      end
     end
    end
   end
   local.get $0
   call $input/fail
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  i32.const 48
  call $input/setProduction
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State60 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  i32.load
  i32.const 1
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 2
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 3
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 5
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 6
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 7
   i32.eq
  end
  if
   local.get $0
   call $input/$cm$comment_primitive
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
  else
   local.get $0
   call $input/fail
  end
  global.get $input/stack_ptr
  local.set $2
  loop $while-continue|0
   local.get $2
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $1
       i32.const 48
       i32.ne
       if
        local.get $1
        i32.const 47
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       call $~lib/rt/pure/__retain
       local.set $1
       global.get $input/tym216r
       local.get $1
       i32.load
       f64.convert_i32_s
       call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
       if
        i32.const 1
        global.set $~argumentsLength
        local.get $1
        global.get $input/tym216r
        local.get $1
        i32.load
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
        local.tee $3
        i32.load
        call_indirect (type $i32_=>_none)
        local.get $3
        call $~lib/rt/pure/__release
       else
        local.get $1
        call $input/fail
       end
       local.get $1
       call $~lib/rt/pure/__release
       br $break|1
      end
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$cm$comment_data (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  i32.load
  i32.const 1
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 2
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 3
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 5
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 6
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 7
   i32.eq
  end
  if
   local.get $0
   call $input/$cm$comment_primitive
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
  else
   local.get $0
   call $input/fail
  end
  global.get $input/stack_ptr
  local.set $3
  loop $while-continue|0
   local.get $3
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $1
       i32.const 48
       i32.ne
       if
        local.get $1
        i32.const 47
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       call $~lib/rt/pure/__retain
       local.set $1
       global.get $input/tym59r
       local.get $1
       i32.load
       f64.convert_i32_s
       call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
       if
        i32.const 1
        global.set $~argumentsLength
        local.get $1
        global.get $input/tym59r
        local.get $1
        i32.load
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
        local.tee $2
        i32.load
        call_indirect (type $i32_=>_none)
        local.get $2
        call $~lib/rt/pure/__release
       else
        local.get $1
        call $input/fail
       end
       br $break|1
      end
      local.get $0
      i32.load
      if (result i32)
       local.get $0
       i32.load
       i32.const 4
       i32.eq
      else
       i32.const 1
      end
      if
       local.get $0
       call $~lib/rt/pure/__release
       return
      end
      i32.const 0
      global.set $~argumentsLength
      local.get $0
      call $input/Lexer#copy@varargs
      local.set $1
      global.get $input/action_ptr
      global.set $input/mark_
      global.get $input/mark_
      local.set $2
      global.get $input/prod
      local.set $4
      global.get $input/stack_ptr
      local.set $5
      local.get $1
      call $input/State60
      global.get $input/FAILED
      if
       local.get $4
       global.set $input/prod
       i32.const 0
       global.set $input/FAILED
       local.get $5
       global.set $input/stack_ptr
       local.get $2
       global.set $input/action_ptr
       local.get $0
       call $~lib/rt/pure/__release
       local.get $1
       call $~lib/rt/pure/__release
       return
      else
       local.get $0
       local.get $1
       call $input/Lexer#sync
      end
      br $break|1
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    local.get $1
    call $~lib/rt/pure/__release
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$cm$comment (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $1
  global.get $input/const__
  call $input/_skip
  local.get $1
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  global.get $input/const_1_
  i32.const 56
  call $input/_with_skip
  block $__inlined_func$input/$cm$cm
   global.get $input/FAILED
   i32.eqz
   if
    local.get $0
    call $input/$cm$comment_data
    global.get $input/FAILED
    i32.eqz
    if
     local.get $0
     call $~lib/rt/pure/__retain
     local.tee $2
     global.get $input/const_0_
     call $input/_skip
     local.get $2
     global.get $input/const__
     i32.const 4
     call $input/_with_skip
     block $__inlined_func$input/$cm$comment_delimiter
      global.get $input/FAILED
      i32.eqz
      if
       i32.const 46
       call $input/setProduction
       br $__inlined_func$input/$cm$comment_delimiter
      end
      local.get $2
      call $input/fail
     end
     local.get $2
     call $~lib/rt/pure/__release
     global.get $input/FAILED
     i32.eqz
     if
      i32.const 45
      call $input/setProduction
      i32.const 3
      i32.const 53
      call $input/add_reduce
      br $__inlined_func$input/$cm$cm
     end
    end
   end
   local.get $0
   call $input/fail
  end
  local.get $0
  call $~lib/rt/pure/__release
  global.get $input/FAILED
  i32.eqz
  if
   i32.const 44
   call $input/setProduction
   local.get $1
   call $~lib/rt/pure/__release
   return
  end
  local.get $1
  call $input/fail
  local.get $1
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|5 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  call $input/$cm$comment
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$sym$production_id (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  call $input/$sym$identifier
  global.get $input/FAILED
  i32.eqz
  if
   i32.const 76
   call $input/setProduction
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  local.get $0
  call $input/fail
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$sym$imported_production_symbol (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  call $input/$sym$production_id
  global.get $input/FAILED
  i32.eqz
  if
   local.get $0
   global.get $input/const__
   i32.const 17
   call $input/_with_skip
   global.get $input/FAILED
   i32.eqz
   if
    local.get $0
    call $input/$sym$identifier
    global.get $input/FAILED
    i32.eqz
    if
     i32.const 75
     call $input/setProduction
     i32.const 3
     i32.const 66
     call $input/add_reduce
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
   end
  end
  local.get $0
  call $input/fail
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$prd$production_group_013_103 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  call $input/$sym$imported_production_symbol
  global.get $input/FAILED
  i32.eqz
  if
   i32.const 23
   call $input/setProduction
   i32.const 1
   i32.const 20
   call $input/add_reduce
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  local.get $0
  call $input/fail
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$prd$production_start_symbol (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner0
   local.get $0
   i32.load offset=4
   i32.const 33
   i32.eq
   if
    local.get $0
    call $input/_no_check
    global.get $input/FAILED
    i32.eqz
    br_if $folding-inner0
   else
    local.get $0
    i32.load offset=4
    i32.const 34
    i32.eq
    if
     local.get $0
     call $input/_no_check
     global.get $input/FAILED
     i32.eqz
     br_if $folding-inner0
    end
   end
   local.get $0
   call $input/fail
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  i32.const 25
  call $input/setProduction
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State305 (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm305r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm305r
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
   local.get $0
   call $~lib/rt/pure/__release
   return
  else
   global.get $input/tym305r
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym305r
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
    local.get $0
    call $~lib/rt/pure/__release
    return
   else
    local.get $0
    call $input/fail
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State304 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm304
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm304
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
  else
   global.get $input/tym304
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym304
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $0
    call $input/fail
   end
  end
  global.get $input/stack_ptr
  local.set $3
  loop $while-continue|0
   local.get $3
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $1
       i32.const 29
       i32.ne
       if
        local.get $1
        i32.const 28
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       call $~lib/rt/pure/__retain
       local.tee $1
       global.get $input/const__
       call $input/_skip
       global.get $input/idm356r
       local.get $1
       i32.load offset=4
       f64.convert_i32_s
       call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
       if
        i32.const 1
        global.set $~argumentsLength
        local.get $1
        global.get $input/idm356r
        local.get $1
        i32.load offset=4
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
        local.tee $2
        i32.load
        call_indirect (type $i32_=>_none)
        local.get $2
        call $~lib/rt/pure/__release
       else
        global.get $input/tym356r
        local.get $1
        i32.load
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
        if
         i32.const 1
         global.set $~argumentsLength
         local.get $1
         global.get $input/tym356r
         local.get $1
         i32.load
         f64.convert_i32_s
         call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
         local.tee $2
         i32.load
         call_indirect (type $i32_=>_none)
         local.get $2
         call $~lib/rt/pure/__release
        else
         local.get $1
         call $input/fail
        end
       end
       local.get $1
       call $~lib/rt/pure/__release
       br $break|1
      end
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State355 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner0
   global.get $input/idm355
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/idm355
    local.get $0
    i32.load offset=4
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $0
    i32.load offset=4
    i32.const 12
    i32.eq
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load offset=4
     i32.const 13
     i32.eq
    end
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load offset=4
     i32.const 54
     i32.eq
    end
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load offset=4
     i32.const 55
     i32.eq
    end
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load offset=4
     i32.const 56
     i32.eq
    end
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load
     i32.eqz
    end
    if
     i32.const 4
     i32.const 22
     call $input/add_reduce
     i32.const 24
     global.set $input/prod
     global.get $input/stack_ptr
     i32.const 4
     i32.sub
     global.set $input/stack_ptr
     br $folding-inner0
    else
     local.get $0
     call $input/fail
    end
   end
   global.get $input/stack_ptr
   local.set $2
   loop $while-continue|0
    local.get $2
    global.get $input/stack_ptr
    i32.le_u
    if
     block $break|1
      block $case4|1
       block $case1|1
        global.get $input/prod
        local.tee $1
        i32.const 44
        i32.ne
        if
         local.get $1
         i32.const 27
         i32.eq
         br_if $case1|1
         local.get $1
         i32.const 24
         i32.eq
         local.get $1
         i32.const 28
         i32.eq
         i32.or
         br_if $folding-inner0
         br $case4|1
        end
        local.get $0
        call $input/State305
        br $break|1
       end
       local.get $0
       call $input/State304
       br $break|1
      end
      local.get $0
      call $input/fail
      br $folding-inner0
     end
     global.get $input/prod
     i32.const 0
     i32.ge_s
     if
      global.get $input/stack_ptr
      i32.const 1
      i32.add
      global.set $input/stack_ptr
     end
     br $while-continue|0
    end
   end
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State298 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm298
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm298
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
  else
   global.get $input/tym298
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym298
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $0
    call $input/fail
   end
  end
  global.get $input/stack_ptr
  local.set $1
  loop $while-continue|0
   local.get $1
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $2
       i32.const 28
       i32.ne
       if
        local.get $2
        i32.const 24
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       call $input/State355
       br $break|1
      end
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State357 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner0
   global.get $input/idm357
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/idm357
    local.get $0
    i32.load offset=4
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $0
    i32.load offset=4
    i32.const 12
    i32.eq
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load offset=4
     i32.const 13
     i32.eq
    end
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load offset=4
     i32.const 54
     i32.eq
    end
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load offset=4
     i32.const 55
     i32.eq
    end
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load offset=4
     i32.const 56
     i32.eq
    end
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load
     i32.eqz
    end
    if
     i32.const 4
     i32.const 24
     call $input/add_reduce
     i32.const 24
     global.set $input/prod
     global.get $input/stack_ptr
     i32.const 4
     i32.sub
     global.set $input/stack_ptr
     br $folding-inner0
    else
     local.get $0
     call $input/fail
    end
   end
   global.get $input/stack_ptr
   local.set $2
   loop $while-continue|0
    local.get $2
    global.get $input/stack_ptr
    i32.le_u
    if
     block $break|1
      block $case5|1
       block $case2|1
        block $case1|1
         global.get $input/prod
         local.tee $1
         i32.const 44
         i32.ne
         if
          local.get $1
          i32.const 27
          i32.eq
          br_if $case1|1
          local.get $1
          i32.const 22
          i32.eq
          br_if $case2|1
          local.get $1
          i32.const 24
          i32.eq
          local.get $1
          i32.const 28
          i32.eq
          i32.or
          br_if $folding-inner0
          br $case5|1
         end
         local.get $0
         call $input/State305
         br $break|1
        end
        local.get $0
        call $input/State304
        br $break|1
       end
       local.get $0
       call $~lib/rt/pure/__retain
       local.tee $1
       global.get $input/const__
       call $input/_skip
       local.get $1
       i32.load offset=4
       i32.const 12
       i32.eq
       if (result i32)
        i32.const 1
       else
        local.get $1
        i32.load offset=4
        i32.const 13
        i32.eq
       end
       if (result i32)
        i32.const 1
       else
        local.get $1
        i32.load offset=4
        i32.const 54
        i32.eq
       end
       if (result i32)
        i32.const 1
       else
        local.get $1
        i32.load offset=4
        i32.const 55
        i32.eq
       end
       if (result i32)
        i32.const 1
       else
        local.get $1
        i32.load offset=4
        i32.const 56
        i32.eq
       end
       if (result i32)
        i32.const 1
       else
        local.get $1
        i32.load
        i32.eqz
       end
       if
        i32.const 5
        i32.const 21
        call $input/add_reduce
        i32.const 24
        global.set $input/prod
        global.get $input/stack_ptr
        i32.const 5
        i32.sub
        global.set $input/stack_ptr
       else
        local.get $1
        call $input/fail
       end
       local.get $1
       call $~lib/rt/pure/__release
       br $break|1
      end
      local.get $0
      call $input/fail
      br $folding-inner0
     end
     global.get $input/prod
     i32.const 0
     i32.ge_s
     if
      global.get $input/stack_ptr
      i32.const 1
      i32.add
      global.set $input/stack_ptr
     end
     br $while-continue|0
    end
   end
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State297 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm298
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm298
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
  else
   global.get $input/tym298
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym298
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $0
    call $input/fail
   end
  end
  global.get $input/stack_ptr
  local.set $1
  loop $while-continue|0
   local.get $1
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $2
       i32.const 28
       i32.ne
       if
        local.get $2
        i32.const 24
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       call $input/State357
       br $break|1
      end
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State35 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  i32.load offset=4
  i32.const 78
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 79
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 3
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 7
   i32.eq
  end
  if
   global.get $input/action_ptr
   global.set $input/mark_
   global.get $input/mark_
   local.set $4
   global.get $input/stack_ptr
   local.set $3
   i32.const 0
   global.set $~argumentsLength
   local.get $0
   call $input/Lexer#copy@varargs
   local.tee $2
   call $~lib/rt/pure/__retain
   local.tee $1
   global.get $input/const__
   call $input/_skip
   local.get $1
   call $input/$sym$production_id
   block $__inlined_func$input/$prd$production_group_08_100
    global.get $input/FAILED
    i32.eqz
    if
     i32.const 20
     call $input/setProduction
     i32.const 1
     i32.const 19
     call $input/add_reduce
     br $__inlined_func$input/$prd$production_group_08_100
    end
    local.get $1
    call $input/fail
   end
   local.get $1
   call $~lib/rt/pure/__release
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
   global.get $input/FAILED
   if
    local.get $4
    global.set $input/action_ptr
    i32.const 0
    global.set $input/FAILED
    local.get $3
    global.set $input/stack_ptr
    local.get $0
    call $input/$prd$production_group_013_103
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
   else
    local.get $0
    local.get $2
    call $input/Lexer#sync
   end
   local.get $2
   call $~lib/rt/pure/__release
  else
   local.get $0
   call $input/fail
  end
  global.get $input/stack_ptr
  local.set $4
  loop $while-continue|0
   local.get $4
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case3|1
      block $case2|1
       block $case1|1
        block $case0|1
         global.get $input/prod
         i32.const 20
         i32.sub
         br_table $case1|1 $case3|1 $case3|1 $case0|1 $case2|1 $case3|1
        end
        local.get $0
        call $~lib/rt/pure/__retain
        local.tee $1
        global.get $input/const__
        call $input/_skip
        local.get $1
        i32.load offset=4
        i32.const 33
        i32.eq
        if (result i32)
         i32.const 1
        else
         local.get $1
         i32.load offset=4
         i32.const 34
         i32.eq
        end
        if
         local.get $1
         call $input/$prd$production_start_symbol
         global.get $input/stack_ptr
         i32.const 1
         i32.add
         global.set $input/stack_ptr
        else
         local.get $1
         call $input/fail
        end
        global.get $input/stack_ptr
        local.set $2
        loop $while-continue|00
         local.get $2
         global.get $input/stack_ptr
         i32.le_u
         if
          block $__inlined_func$input/State209
           block $break|11
            block $case2|12
             global.get $input/prod
             local.tee $3
             i32.const 25
             i32.ne
             if
              local.get $3
              i32.const 24
              i32.eq
              br_if $__inlined_func$input/State209
              br $case2|12
             end
             local.get $1
             call $input/State298
             br $break|11
            end
            local.get $1
            call $input/fail
            br $__inlined_func$input/State209
           end
           global.get $input/prod
           i32.const 0
           i32.ge_s
           if
            global.get $input/stack_ptr
            i32.const 1
            i32.add
            global.set $input/stack_ptr
           end
           br $while-continue|00
          end
         end
        end
        br $break|1
       end
       local.get $0
       call $~lib/rt/pure/__retain
       local.tee $1
       global.get $input/const__
       call $input/_skip
       local.get $1
       i32.load offset=4
       i32.const 33
       i32.eq
       if (result i32)
        i32.const 1
       else
        local.get $1
        i32.load offset=4
        i32.const 34
        i32.eq
       end
       if
        local.get $1
        call $input/$prd$production_start_symbol
        global.get $input/stack_ptr
        i32.const 1
        i32.add
        global.set $input/stack_ptr
       else
        local.get $1
        call $input/fail
       end
       global.get $input/stack_ptr
       local.set $2
       loop $while-continue|04
        local.get $2
        global.get $input/stack_ptr
        i32.le_u
        if
         block $__inlined_func$input/State208
          block $break|15
           block $case2|16
            global.get $input/prod
            local.tee $3
            i32.const 25
            i32.ne
            if
             local.get $3
             i32.const 24
             i32.eq
             br_if $__inlined_func$input/State208
             br $case2|16
            end
            local.get $1
            call $input/State297
            br $break|15
           end
           local.get $1
           call $input/fail
           br $__inlined_func$input/State208
          end
          global.get $input/prod
          i32.const 0
          i32.ge_s
          if
           global.get $input/stack_ptr
           i32.const 1
           i32.add
           global.set $input/stack_ptr
          end
          br $while-continue|04
         end
        end
       end
       br $break|1
      end
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    local.get $1
    call $~lib/rt/pure/__release
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|6 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  call $input/_no_check
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $0
  call $input/State35
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State348 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner0
   global.get $input/idm355
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/idm355
    local.get $0
    i32.load offset=4
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $0
    i32.load offset=4
    i32.const 12
    i32.eq
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load offset=4
     i32.const 13
     i32.eq
    end
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load offset=4
     i32.const 54
     i32.eq
    end
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load offset=4
     i32.const 55
     i32.eq
    end
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load offset=4
     i32.const 56
     i32.eq
    end
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load
     i32.eqz
    end
    if
     i32.const 4
     i32.const 23
     call $input/add_reduce
     i32.const 24
     global.set $input/prod
     global.get $input/stack_ptr
     i32.const 4
     i32.sub
     global.set $input/stack_ptr
     br $folding-inner0
    else
     local.get $0
     call $input/fail
    end
   end
   global.get $input/stack_ptr
   local.set $2
   loop $while-continue|0
    local.get $2
    global.get $input/stack_ptr
    i32.le_u
    if
     block $break|1
      block $case4|1
       block $case1|1
        global.get $input/prod
        local.tee $1
        i32.const 44
        i32.ne
        if
         local.get $1
         i32.const 27
         i32.eq
         br_if $case1|1
         local.get $1
         i32.const 24
         i32.eq
         local.get $1
         i32.const 28
         i32.eq
         i32.or
         br_if $folding-inner0
         br $case4|1
        end
        local.get $0
        call $input/State305
        br $break|1
       end
       local.get $0
       call $input/State304
       br $break|1
      end
      local.get $0
      call $input/fail
      br $folding-inner0
     end
     global.get $input/prod
     i32.const 0
     i32.ge_s
     if
      global.get $input/stack_ptr
      i32.const 1
      i32.add
      global.set $input/stack_ptr
     end
     br $while-continue|0
    end
   end
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State291 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm298
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm298
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
  else
   global.get $input/tym298
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym298
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $0
    call $input/fail
   end
  end
  global.get $input/stack_ptr
  local.set $1
  loop $while-continue|0
   local.get $1
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $2
       i32.const 28
       i32.ne
       if
        local.get $2
        i32.const 24
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       call $input/State348
       br $break|1
      end
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State36 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  i32.load offset=4
  i32.const 78
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 79
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 3
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 7
   i32.eq
  end
  if
   local.get $0
   call $input/$prd$production_group_013_103
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
  else
   local.get $0
   call $input/fail
  end
  global.get $input/stack_ptr
  local.set $2
  loop $while-continue|0
   local.get $2
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $1
       i32.const 23
       i32.ne
       if
        local.get $1
        i32.const 24
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       call $~lib/rt/pure/__retain
       local.tee $1
       global.get $input/const__
       call $input/_skip
       local.get $1
       i32.load offset=4
       i32.const 33
       i32.eq
       if (result i32)
        i32.const 1
       else
        local.get $1
        i32.load offset=4
        i32.const 34
        i32.eq
       end
       if
        local.get $1
        call $input/$prd$production_start_symbol
        global.get $input/stack_ptr
        i32.const 1
        i32.add
        global.set $input/stack_ptr
       else
        local.get $1
        call $input/fail
       end
       global.get $input/stack_ptr
       local.set $3
       loop $while-continue|00
        local.get $3
        global.get $input/stack_ptr
        i32.le_u
        if
         block $__inlined_func$input/State192
          block $break|11
           block $case2|12
            global.get $input/prod
            local.tee $4
            i32.const 25
            i32.ne
            if
             local.get $4
             i32.const 24
             i32.eq
             br_if $__inlined_func$input/State192
             br $case2|12
            end
            local.get $1
            call $input/State291
            br $break|11
           end
           local.get $1
           call $input/fail
           br $__inlined_func$input/State192
          end
          global.get $input/prod
          i32.const 0
          i32.ge_s
          if
           global.get $input/stack_ptr
           i32.const 1
           i32.add
           global.set $input/stack_ptr
          end
          br $while-continue|00
         end
        end
       end
       local.get $1
       call $~lib/rt/pure/__release
       br $break|1
      end
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|7 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  call $input/_no_check
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $0
  call $input/State36
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State238 (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm238r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm238r
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
   local.get $0
   call $~lib/rt/pure/__release
   return
  else
   global.get $input/tym238r
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym238r
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
    local.get $0
    call $~lib/rt/pure/__release
    return
   else
    local.get $0
    call $input/fail
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$pb$production_bodies (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm304
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm304
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
  else
   global.get $input/tym304
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym304
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $0
    call $input/fail
   end
  end
  global.get $input/stack_ptr
  local.set $4
  loop $while-continue|0
   local.get $4
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $1
       i32.const 29
       i32.ne
       if
        local.get $1
        i32.const 28
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       call $input/State238
       br $break|1
      end
      local.get $0
      global.get $input/const__
      call $input/_skip
      local.get $0
      i32.load offset=4
      i32.const 12
      i32.eq
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 13
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 39
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 54
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 55
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load
       i32.eqz
      end
      if
       local.get $0
       call $~lib/rt/pure/__release
       return
      end
      i32.const 0
      global.set $~argumentsLength
      local.get $0
      call $input/Lexer#copy@varargs
      local.set $2
      global.get $input/action_ptr
      global.set $input/mark_
      global.get $input/mark_
      local.set $5
      global.get $input/prod
      local.set $6
      global.get $input/stack_ptr
      local.set $7
      local.get $2
      call $~lib/rt/pure/__retain
      local.tee $1
      global.get $input/const__
      call $input/_skip
      global.get $input/idm355
      local.get $1
      i32.load offset=4
      f64.convert_i32_s
      call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
      if
       i32.const 1
       global.set $~argumentsLength
       local.get $1
       global.get $input/idm355
       local.get $1
       i32.load offset=4
       f64.convert_i32_s
       call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
       local.tee $3
       i32.load
       call_indirect (type $i32_=>_none)
       local.get $3
       call $~lib/rt/pure/__release
      else
       local.get $1
       call $input/fail
      end
      global.get $input/stack_ptr
      local.set $8
      loop $while-continue|00
       local.get $8
       global.get $input/stack_ptr
       i32.le_u
       if
        block $__inlined_func$input/State239
         block $break|11
          block $case3|1
           block $case1|13
            global.get $input/prod
            local.tee $3
            i32.const 44
            i32.ne
            if
             local.get $3
             i32.const 27
             i32.eq
             br_if $case1|13
             local.get $3
             i32.const 28
             i32.eq
             br_if $__inlined_func$input/State239
             br $case3|1
            end
            local.get $1
            call $input/State305
            br $break|11
           end
           local.get $1
           call $input/State304
           br $break|11
          end
          local.get $1
          call $input/fail
          br $__inlined_func$input/State239
         end
         global.get $input/prod
         i32.const 0
         i32.ge_s
         if
          global.get $input/stack_ptr
          i32.const 1
          i32.add
          global.set $input/stack_ptr
         end
         br $while-continue|00
        end
       end
      end
      local.get $1
      call $~lib/rt/pure/__release
      global.get $input/FAILED
      if
       local.get $6
       global.set $input/prod
       i32.const 0
       global.set $input/FAILED
       local.get $7
       global.set $input/stack_ptr
       local.get $5
       global.set $input/action_ptr
       local.get $0
       call $~lib/rt/pure/__release
       local.get $2
       call $~lib/rt/pure/__release
       return
      else
       local.get $0
       local.get $2
       call $input/Lexer#sync
      end
      local.get $2
      call $~lib/rt/pure/__release
      br $break|1
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|8 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  call $input/$pb$production_bodies
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$pb$production_bodies_group_04_100 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner0
   local.get $0
   i32.load offset=4
   i32.const 31
   i32.eq
   if
    local.get $0
    call $input/_no_check
    global.get $input/FAILED
    i32.eqz
    br_if $folding-inner0
   else
    local.get $0
    i32.load offset=4
    i32.const 32
    i32.eq
    if
     local.get $0
     call $input/_no_check
     global.get $input/FAILED
     i32.eqz
     br_if $folding-inner0
    end
   end
   local.get $0
   call $input/fail
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  i32.const 27
  call $input/setProduction
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|9 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  call $input/$pb$production_bodies_group_04_100
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|10 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.set $1
  global.get $input/action_ptr
  global.set $input/mark_
  global.get $input/mark_
  local.set $4
  global.get $input/stack_ptr
  local.set $5
  i32.const 0
  global.set $~argumentsLength
  local.get $1
  call $input/Lexer#copy@varargs
  local.tee $3
  call $~lib/rt/pure/__retain
  local.tee $2
  global.get $input/const__
  call $input/_skip
  local.get $2
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $__inlined_func$input/$prd$production_group_010_101
   block $folding-inner0
    local.get $0
    i32.load offset=4
    i32.const 31
    i32.eq
    if
     local.get $0
     call $input/_no_check
     global.get $input/FAILED
     i32.eqz
     br_if $folding-inner0
    else
     local.get $0
     i32.load offset=4
     i32.const 32
     i32.eq
     if
      local.get $0
      call $input/_no_check
      global.get $input/FAILED
      i32.eqz
      br_if $folding-inner0
     end
    end
    local.get $0
    call $input/fail
    br $__inlined_func$input/$prd$production_group_010_101
   end
   i32.const 21
   call $input/setProduction
  end
  local.get $0
  call $~lib/rt/pure/__release
  block $__inlined_func$input/$prd$production_group_111_102
   global.get $input/FAILED
   i32.eqz
   if
    local.get $2
    call $~lib/rt/pure/__retain
    local.tee $0
    global.get $input/const__
    call $input/_skip
    local.get $0
    global.get $input/const__
    i32.const 48
    call $input/_with_skip
    block $__inlined_func$input/$fn$error_function
     global.get $input/FAILED
     i32.eqz
     if
      local.get $0
      global.get $input/const__
      i32.const 49
      call $input/_with_skip
      global.get $input/FAILED
      i32.eqz
      if
       local.get $0
       global.get $input/const_1_
       i32.const 46
       call $input/_with_skip
       global.get $input/FAILED
       i32.eqz
       if
        local.get $0
        call $input/$fn$js_data
        global.get $input/FAILED
        i32.eqz
        if
         local.get $0
         global.get $input/const__
         i32.const 47
         call $input/_with_skip
         global.get $input/FAILED
         i32.eqz
         if
          local.get $0
          global.get $input/const_1_
          i32.const 46
          call $input/_with_skip
          global.get $input/FAILED
          i32.eqz
          if
           local.get $0
           call $input/$fn$js_data
           global.get $input/FAILED
           i32.eqz
           if
            local.get $0
            global.get $input/const__
            i32.const 47
            call $input/_with_skip
            global.get $input/FAILED
            i32.eqz
            if
             i32.const 35
             call $input/setProduction
             i32.const 8
             i32.const 45
             call $input/add_reduce
             br $__inlined_func$input/$fn$error_function
            end
           end
          end
         end
        end
       end
      end
     end
     local.get $0
     call $input/fail
    end
    local.get $0
    call $~lib/rt/pure/__release
    global.get $input/FAILED
    i32.eqz
    if
     i32.const 22
     call $input/setProduction
     i32.const 2
     i32.const 0
     call $input/add_reduce
     br $__inlined_func$input/$prd$production_group_111_102
    end
   end
   local.get $2
   call $input/fail
  end
  local.get $2
  call $~lib/rt/pure/__release
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  global.get $input/FAILED
  if
   local.get $4
   global.set $input/action_ptr
   i32.const 0
   global.set $input/FAILED
   local.get $5
   global.set $input/stack_ptr
   local.get $1
   call $input/$pb$production_bodies_group_04_100
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
  else
   local.get $1
   local.get $3
   call $input/Lexer#sync
  end
  local.get $3
  call $~lib/rt/pure/__release
  local.get $1
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|11 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 2
  i32.const 27
  call $input/add_reduce
  i32.const 28
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 2
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $input/_pk (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.set $0
  local.get $1
  call $~lib/rt/pure/__retain
  local.set $3
  local.get $0
  call $input/Lexer#next
  call $~lib/rt/pure/__release
  local.get $3
  if
   loop $while-continue|0
    block $input/lm|inlined.1 (result i32)
     local.get $0
     call $~lib/rt/pure/__retain
     local.set $1
     local.get $3
     call $~lib/rt/pure/__retain
     local.tee $4
     i32.const 20
     i32.sub
     i32.load offset=16
     i32.const 2
     i32.shr_u
     local.set $5
     i32.const 0
     local.set $2
     loop $for-loop|1
      local.get $2
      local.get $5
      i32.lt_s
      if
       local.get $4
       local.get $2
       call $~lib/staticarray/StaticArray<u32>#__get
       local.tee $6
       local.get $1
       i32.load offset=4
       i32.eq
       if (result i32)
        i32.const 1
       else
        local.get $6
        local.get $1
        i32.load
        i32.eq
       end
       if
        local.get $4
        call $~lib/rt/pure/__release
        local.get $1
        call $~lib/rt/pure/__release
        i32.const 1
        br $input/lm|inlined.1
       end
       local.get $2
       i32.const 1
       i32.add
       local.set $2
       br $for-loop|1
      end
     end
     local.get $4
     call $~lib/rt/pure/__release
     local.get $1
     call $~lib/rt/pure/__release
     i32.const 0
    end
    if
     local.get $0
     call $input/Lexer#next
     call $~lib/rt/pure/__release
     br $while-continue|0
    end
   end
  end
  local.get $3
  call $~lib/rt/pure/__release
  local.get $0
 )
 (func $~lib/staticarray/StaticArray<u32>#indexOf (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  i32.const 20
  i32.sub
  i32.load offset=16
  i32.const 2
  i32.shr_u
  local.tee $3
  i32.eqz
  i32.const 1
  local.get $3
  select
  if
   i32.const -1
   return
  end
  loop $while-continue|0
   local.get $2
   local.get $3
   i32.lt_s
   if
    local.get $1
    local.get $0
    local.get $2
    i32.const 2
    i32.shl
    i32.add
    i32.load
    i32.eq
    if
     local.get $2
     return
    end
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $while-continue|0
   end
  end
  i32.const -1
 )
 (func $input/State309 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm309
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm309
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
  else
   global.get $input/const_6_
   local.get $0
   i32.load offset=4
   call $~lib/staticarray/StaticArray<u32>#indexOf
   i32.const 0
   i32.ge_s
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load
    i32.eqz
   end
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load
    i32.const 3
    i32.eq
   end
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load
    i32.const 5
    i32.eq
   end
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load
    i32.const 6
    i32.eq
   end
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load
    i32.const 7
    i32.eq
   end
   if
    local.get $0
    call $input/fail
   else
    local.get $0
    call $input/$sym$terminal_symbol
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
   end
  end
  global.get $input/stack_ptr
  local.set $4
  loop $while-continue|0
   local.get $4
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $1
       i32.const 61
       i32.ne
       if
        local.get $1
        i32.const 63
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       call $~lib/rt/pure/__retain
       local.tee $2
       global.get $input/const__
       call $input/_skip
       local.get $2
       i32.load offset=4
       i32.const 39
       i32.eq
       if
        local.get $2
        call $input/_no_check
        global.get $input/stack_ptr
        i32.const 1
        i32.add
        global.set $input/stack_ptr
        local.get $2
        call $~lib/rt/pure/__retain
        local.tee $1
        global.get $input/const__
        call $input/_skip
        global.get $input/idm371r
        local.get $1
        i32.load offset=4
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
        if
         i32.const 1
         global.set $~argumentsLength
         local.get $1
         global.get $input/idm371r
         local.get $1
         i32.load offset=4
         f64.convert_i32_s
         call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
         local.tee $3
         i32.load
         call_indirect (type $i32_=>_none)
         local.get $3
         call $~lib/rt/pure/__release
        else
         global.get $input/tym371r
         local.get $1
         i32.load
         f64.convert_i32_s
         call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
         if
          i32.const 1
          global.set $~argumentsLength
          local.get $1
          global.get $input/tym371r
          local.get $1
          i32.load
          f64.convert_i32_s
          call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
          local.tee $3
          i32.load
          call_indirect (type $i32_=>_none)
          local.get $3
          call $~lib/rt/pure/__release
         else
          local.get $1
          call $input/fail
         end
        end
        local.get $1
        call $~lib/rt/pure/__release
       else
        local.get $2
        call $input/fail
       end
       local.get $2
       call $~lib/rt/pure/__release
       br $break|1
      end
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State246 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner0
   global.get $input/idm246
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/idm246
    local.get $0
    i32.load offset=4
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    global.get $input/idm246r
    local.get $0
    i32.load offset=4
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
    if
     i32.const 1
     global.set $~argumentsLength
     local.get $0
     global.get $input/idm246r
     local.get $0
     i32.load offset=4
     f64.convert_i32_s
     call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
     local.tee $1
     i32.load
     call_indirect (type $i32_=>_none)
     local.get $1
     call $~lib/rt/pure/__release
     br $folding-inner0
    else
     global.get $input/tym246r
     local.get $0
     i32.load
     f64.convert_i32_s
     call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
     if
      i32.const 1
      global.set $~argumentsLength
      local.get $0
      global.get $input/tym246r
      local.get $0
      i32.load
      f64.convert_i32_s
      call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
      local.tee $1
      i32.load
      call_indirect (type $i32_=>_none)
      local.get $1
      call $~lib/rt/pure/__release
      br $folding-inner0
     else
      local.get $0
      call $input/fail
     end
    end
   end
   global.get $input/stack_ptr
   local.set $2
   loop $while-continue|0
    local.get $2
    global.get $input/stack_ptr
    i32.le_u
    if
     block $break|1
      block $case3|1
       global.get $input/prod
       local.tee $1
       i32.const 62
       i32.ne
       if
        local.get $1
        i32.const 31
        i32.eq
        local.get $1
        i32.const 63
        i32.eq
        i32.or
        br_if $folding-inner0
        br $case3|1
       end
       local.get $0
       call $input/State309
       br $break|1
      end
      local.get $0
      call $input/fail
      br $folding-inner0
     end
     global.get $input/prod
     i32.const 0
     i32.ge_s
     if
      global.get $input/stack_ptr
      i32.const 1
      i32.add
      global.set $input/stack_ptr
     end
     br $while-continue|0
    end
   end
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State248 (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm246r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm246r
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
   local.get $0
   call $~lib/rt/pure/__release
   return
  else
   global.get $input/tym246r
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym246r
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
    local.get $0
    call $~lib/rt/pure/__release
    return
   else
    local.get $0
    call $input/fail
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State336 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner0
   global.get $input/idm246
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/idm246
    local.get $0
    i32.load offset=4
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    global.get $input/idm336r
    local.get $0
    i32.load offset=4
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
    if
     i32.const 1
     global.set $~argumentsLength
     local.get $0
     global.get $input/idm336r
     local.get $0
     i32.load offset=4
     f64.convert_i32_s
     call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
     local.tee $1
     i32.load
     call_indirect (type $i32_=>_none)
     local.get $1
     call $~lib/rt/pure/__release
     br $folding-inner0
    else
     global.get $input/tym336r
     local.get $0
     i32.load
     f64.convert_i32_s
     call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
     if
      i32.const 1
      global.set $~argumentsLength
      local.get $0
      global.get $input/tym336r
      local.get $0
      i32.load
      f64.convert_i32_s
      call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
      local.tee $1
      i32.load
      call_indirect (type $i32_=>_none)
      local.get $1
      call $~lib/rt/pure/__release
      br $folding-inner0
     else
      local.get $0
      call $input/fail
     end
    end
   end
   global.get $input/stack_ptr
   local.set $2
   loop $while-continue|0
    local.get $2
    global.get $input/stack_ptr
    i32.le_u
    if
     block $break|1
      block $case3|1
       global.get $input/prod
       local.tee $1
       i32.const 62
       i32.ne
       if
        local.get $1
        i32.const 31
        i32.eq
        local.get $1
        i32.const 63
        i32.eq
        i32.or
        br_if $folding-inner0
        br $case3|1
       end
       local.get $0
       call $input/State309
       br $break|1
      end
      local.get $0
      call $input/fail
      br $folding-inner0
     end
     global.get $input/prod
     i32.const 0
     i32.ge_s
     if
      global.get $input/stack_ptr
      i32.const 1
      i32.add
      global.set $input/stack_ptr
     end
     br $while-continue|0
    end
   end
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State334 (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm336r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm336r
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
   local.get $0
   call $~lib/rt/pure/__release
   return
  else
   global.get $input/tym336r
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym336r
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
    local.get $0
    call $~lib/rt/pure/__release
    return
   else
    local.get $0
    call $input/fail
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State324 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm324
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm324
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
  else
   global.get $input/tym323
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym323
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $0
    call $input/fail
   end
  end
  global.get $input/stack_ptr
  local.set $1
  loop $while-continue|0
   local.get $1
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case4|1
      block $case3|1
       block $case2|1
        block $case1|1
         global.get $input/prod
         local.tee $2
         i32.const 63
         i32.ne
         if
          local.get $2
          i32.const 31
          i32.sub
          br_table $case3|1 $case4|1 $case2|1 $case4|1 $case4|1 $case4|1 $case4|1 $case1|1 $case4|1
         end
         local.get $0
         call $input/State336
         br $break|1
        end
        local.get $0
        call $input/State334
        br $break|1
       end
       local.get $0
       call $input/State334
       br $break|1
      end
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$pb$body_entries (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm323
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm323
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
  else
   global.get $input/tym323
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym323
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $0
    call $input/fail
   end
  end
  global.get $input/stack_ptr
  local.set $2
  loop $while-continue|0
   local.get $2
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case4|1
      block $case3|1
       block $case2|1
        block $case1|1
         global.get $input/prod
         local.tee $1
         i32.const 63
         i32.ne
         if
          local.get $1
          i32.const 31
          i32.sub
          br_table $case3|1 $case4|1 $case2|1 $case4|1 $case4|1 $case4|1 $case4|1 $case1|1 $case4|1
         end
         local.get $0
         call $input/State246
         br $break|1
        end
        local.get $0
        call $input/State248
        br $break|1
       end
       local.get $0
       call $input/State248
       br $break|1
      end
      local.get $0
      global.get $input/const__
      call $input/_skip
      local.get $0
      i32.load offset=4
      i32.const 12
      i32.eq
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 13
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 31
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 32
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 36
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 39
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 56
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load
       i32.eqz
      end
      if
       local.get $0
       call $~lib/rt/pure/__release
       return
      end
      i32.const 0
      global.set $~argumentsLength
      local.get $0
      call $input/Lexer#copy@varargs
      local.set $1
      global.get $input/action_ptr
      global.set $input/mark_
      global.get $input/mark_
      local.set $3
      global.get $input/prod
      local.set $4
      global.get $input/stack_ptr
      local.set $5
      local.get $1
      call $input/State324
      global.get $input/FAILED
      if
       local.get $4
       global.set $input/prod
       i32.const 0
       global.set $input/FAILED
       local.get $5
       global.set $input/stack_ptr
       local.get $3
       global.set $input/action_ptr
       local.get $0
       call $~lib/rt/pure/__release
       local.get $1
       call $~lib/rt/pure/__release
       return
      else
       local.get $0
       local.get $1
       call $input/Lexer#sync
      end
      local.get $1
      call $~lib/rt/pure/__release
      br $break|1
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$fn$reduce_function (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  call $input/$fn$js_function_start_symbol
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $1
  global.get $input/const__
  call $input/_skip
  block $__inlined_func$input/$fn$reduce_function_group_07_100
   block $folding-inner0
    local.get $1
    i32.load offset=4
    i32.const 50
    i32.eq
    if
     local.get $1
     call $input/_no_check
     global.get $input/FAILED
     i32.eqz
     br_if $folding-inner0
    else
     local.get $1
     i32.load offset=4
     i32.const 51
     i32.eq
     if
      local.get $1
      call $input/_no_check
      global.get $input/FAILED
      i32.eqz
      br_if $folding-inner0
     else
      local.get $1
      i32.load offset=4
      i32.const 52
      i32.eq
      if
       local.get $1
       call $input/_no_check
       global.get $input/FAILED
       i32.eqz
       br_if $folding-inner0
      else
       local.get $1
       i32.load offset=4
       i32.const 53
       i32.eq
       if
        local.get $1
        call $input/_no_check
        global.get $input/FAILED
        i32.eqz
        br_if $folding-inner0
       end
      end
     end
    end
    local.get $1
    call $input/fail
    br $__inlined_func$input/$fn$reduce_function_group_07_100
   end
   i32.const 36
   call $input/setProduction
  end
  local.get $1
  call $~lib/rt/pure/__release
  local.get $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner00
   local.get $0
   i32.load offset=4
   i32.const 46
   i32.eq
   if
    local.get $0
    call $input/_no_check
    global.get $input/FAILED
    i32.eqz
    if
     local.get $0
     call $input/$fn$js_data
     global.get $input/FAILED
     i32.eqz
     if
      local.get $0
      global.get $input/const__
      i32.const 47
      call $input/_with_skip
      global.get $input/FAILED
      i32.eqz
      if
       i32.const 37
       call $input/setProduction
       i32.const 5
       i32.const 46
       call $input/add_reduce
       br $folding-inner00
      end
     end
    end
   else
    local.get $0
    i32.load offset=4
    i32.const 45
    i32.eq
    if
     local.get $0
     call $input/_no_check
     global.get $input/FAILED
     i32.eqz
     if
      local.get $0
      call $input/$sym$js_identifier
      global.get $input/FAILED
      i32.eqz
      if
       i32.const 37
       call $input/setProduction
       i32.const 4
       i32.const 47
       call $input/add_reduce
       br $folding-inner00
      end
     end
    else
     local.get $0
     i32.load offset=4
     i32.const 14
     i32.eq
     if
      local.get $0
      call $input/_no_check
      global.get $input/FAILED
      i32.eqz
      if
       local.get $0
       call $input/$sym$js_identifier
       global.get $input/FAILED
       i32.eqz
       if
        i32.const 37
        call $input/setProduction
        i32.const 4
        i32.const 48
        call $input/add_reduce
        br $folding-inner00
       end
      end
     end
    end
   end
   local.get $0
   call $input/fail
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$pb$entries (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner0
   global.get $input/const_2_
   local.get $0
   i32.load offset=4
   call $~lib/staticarray/StaticArray<u32>#indexOf
   i32.const 0
   i32.ge_s
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load
    i32.const 3
    i32.eq
   end
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load
    i32.const 5
    i32.eq
   end
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load
    i32.const 6
    i32.eq
   end
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load
    i32.const 7
    i32.eq
   end
   if
    local.get $0
    call $input/$pb$body_entries
    local.get $0
    global.get $input/const__
    call $input/_skip
    local.get $0
    i32.load offset=4
    i32.const 54
    i32.eq
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load offset=4
     i32.const 55
     i32.eq
    end
    if
     local.get $0
     call $input/$fn$reduce_function
     global.get $input/FAILED
     i32.eqz
     if
      i32.const 30
      call $input/setProduction
      i32.const 2
      i32.const 30
      call $input/add_reduce
      br $folding-inner0
     end
    else
     global.get $input/FAILED
     i32.eqz
     if
      i32.const 30
      call $input/setProduction
      i32.const 1
      i32.const 33
      call $input/add_reduce
      br $folding-inner0
     end
    end
   else
    local.get $0
    i32.load offset=4
    i32.const 20
    i32.eq
    if
     local.get $0
     call $~lib/rt/pure/__retain
     local.tee $1
     global.get $input/const__
     call $input/_skip
     local.get $1
     global.get $input/const__
     i32.const 20
     call $input/_with_skip
     block $__inlined_func$input/$sym$empty_symbol
      global.get $input/FAILED
      i32.eqz
      if
       i32.const 65
       call $input/setProduction
       i32.const 1
       i32.const 59
       call $input/add_reduce
       br $__inlined_func$input/$sym$empty_symbol
      end
      local.get $1
      call $input/fail
     end
     local.get $1
     call $~lib/rt/pure/__release
     global.get $input/FAILED
     i32.eqz
     if
      i32.const 30
      call $input/setProduction
      i32.const 1
      i32.const 31
      call $input/add_reduce
      br $folding-inner0
     end
    else
     local.get $0
     i32.load offset=4
     i32.const 58
     i32.eq
     if
      local.get $0
      call $~lib/rt/pure/__retain
      local.tee $1
      global.get $input/const__
      call $input/_skip
      local.get $1
      global.get $input/const__
      i32.const 0
      call $input/_with_skip
      block $__inlined_func$input/$sym$EOF_symbol
       global.get $input/FAILED
       i32.eqz
       if
        i32.const 64
        call $input/setProduction
        i32.const 1
        i32.const 58
        call $input/add_reduce
        br $__inlined_func$input/$sym$EOF_symbol
       end
       local.get $1
       call $input/fail
      end
      local.get $1
      call $~lib/rt/pure/__release
      global.get $input/FAILED
      i32.eqz
      if
       i32.const 30
       call $input/setProduction
       i32.const 1
       i32.const 32
       call $input/add_reduce
       br $folding-inner0
      end
     end
    end
   end
   local.get $0
   call $input/fail
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$pb$production_body (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner0
   local.get $0
   i32.load offset=4
   i32.const 37
   i32.eq
   if
    i32.const 0
    global.set $~argumentsLength
    local.get $0
    call $input/Lexer#copy@varargs
    local.tee $3
    global.get $input/const__
    call $input/_pk
    local.set $1
    global.get $input/FAILED
    if (result i32)
     i32.const 0
    else
     local.get $1
     i32.load offset=4
     i32.const 38
     i32.eq
    end
    if
     local.get $0
     call $~lib/rt/pure/__retain
     local.tee $2
     global.get $input/const__
     call $input/_skip
     local.get $2
     global.get $input/const__
     i32.const 37
     call $input/_with_skip
     block $__inlined_func$input/$pb$force_fork
      global.get $input/FAILED
      i32.eqz
      if
       local.get $2
       global.get $input/const__
       i32.const 38
       call $input/_with_skip
       global.get $input/FAILED
       i32.eqz
       if
        local.get $2
        global.get $input/const__
        i32.const 39
        call $input/_with_skip
        global.get $input/FAILED
        i32.eqz
        if
         i32.const 32
         call $input/setProduction
         i32.const 3
         i32.const 37
         call $input/add_reduce
         br $__inlined_func$input/$pb$force_fork
        end
       end
      end
      local.get $2
      call $input/fail
     end
     local.get $2
     call $~lib/rt/pure/__release
     global.get $input/FAILED
     i32.eqz
     if
      local.get $0
      call $input/$pb$entries
      global.get $input/FAILED
      i32.eqz
      if
       i32.const 29
       call $input/setProduction
       i32.const 2
       i32.const 28
       call $input/add_reduce
       br $folding-inner0
      end
     end
    else
     global.get $input/FAILED
     if (result i32)
      i32.const 0
     else
      global.get $input/const_3_
      local.get $1
      i32.load offset=4
      call $~lib/staticarray/StaticArray<u32>#indexOf
      i32.const 0
      i32.ge_s
     end
     if (result i32)
      i32.const 1
     else
      local.get $1
      i32.load
      i32.const 2
      i32.eq
     end
     if (result i32)
      i32.const 1
     else
      local.get $1
      i32.load
      i32.const 3
      i32.eq
     end
     if (result i32)
      i32.const 1
     else
      local.get $1
      i32.load
      i32.const 5
      i32.eq
     end
     if (result i32)
      i32.const 1
     else
      local.get $1
      i32.load
      i32.const 6
      i32.eq
     end
     if (result i32)
      i32.const 1
     else
      local.get $1
      i32.load
      i32.const 7
      i32.eq
     end
     if
      local.get $0
      call $input/$pb$entries
      global.get $input/FAILED
      i32.eqz
      if
       i32.const 29
       call $input/setProduction
       i32.const 1
       i32.const 29
       call $input/add_reduce
       br $folding-inner0
      end
     end
    end
    local.get $3
    call $~lib/rt/pure/__release
    local.get $1
    call $~lib/rt/pure/__release
   else
    global.get $input/const_4_
    local.get $0
    i32.load offset=4
    call $~lib/staticarray/StaticArray<u32>#indexOf
    i32.const 0
    i32.ge_s
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load
     i32.const 3
     i32.eq
    end
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load
     i32.const 5
     i32.eq
    end
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load
     i32.const 6
     i32.eq
    end
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load
     i32.const 7
     i32.eq
    end
    if
     local.get $0
     call $input/$pb$entries
     global.get $input/FAILED
     i32.eqz
     if
      i32.const 29
      call $input/setProduction
      i32.const 1
      i32.const 29
      call $input/add_reduce
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
    end
   end
   local.get $0
   call $input/fail
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  local.get $0
  call $~lib/rt/pure/__release
  local.get $3
  call $~lib/rt/pure/__release
  local.get $1
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|12 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  call $input/$pb$production_body
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|13 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 3
  i32.const 26
  call $input/add_reduce
  i32.const 28
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 3
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|14 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 1
  i32.const 25
  call $input/add_reduce
  i32.const 28
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 1
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|15 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  call $input/$fn$js_primitive
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|16 (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $1
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  global.get $input/const_1_
  i32.const 46
  call $input/_with_skip
  block $__inlined_func$input/$fn$js_data_block
   global.get $input/FAILED
   i32.eqz
   if
    local.get $0
    call $input/$fn$js_data
    global.get $input/FAILED
    i32.eqz
    if
     local.get $0
     global.get $input/const_1_
     i32.const 47
     call $input/_with_skip
     global.get $input/FAILED
     i32.eqz
     if
      i32.const 42
      call $input/setProduction
      i32.const 3
      i32.const 52
      call $input/add_reduce
      br $__inlined_func$input/$fn$js_data_block
     end
    end
   end
   local.get $0
   call $input/fail
  end
  local.get $0
  call $~lib/rt/pure/__release
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $1
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|17 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  call $input/_no_check
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $0
  call $input/State119
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|18 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 39
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 1
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|19 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 2
  i32.const 12
  call $input/add_reduce
  i32.const 39
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 2
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|20 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 1
  i32.const 5
  call $input/add_reduce
  i32.const 54
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 1
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|21 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 2
  i32.const 4
  call $input/add_reduce
  i32.const 54
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 2
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|22 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 1
  i32.const 5
  call $input/add_reduce
  i32.const 5
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 1
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|23 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 2
  i32.const 4
  call $input/add_reduce
  i32.const 5
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 2
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|24 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 1
  i32.const 27
  call $input/add_reduce
  i32.const 47
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 1
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|25 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 2
  i32.const 12
  call $input/add_reduce
  i32.const 47
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 2
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $input/State252 (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm252r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm252r
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
   local.get $0
   call $~lib/rt/pure/__release
   return
  else
   global.get $input/tym252r
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym252r
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
    local.get $0
    call $~lib/rt/pure/__release
    return
   else
    local.get $0
    call $input/fail
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$sym$symbol (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm301
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm301
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
  else
   global.get $input/tym301
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym301
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $0
    call $input/fail
   end
  end
  global.get $input/stack_ptr
  local.set $4
  loop $while-continue|0
   local.get $4
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case7|1
      block $case6|1
       block $case5|1
        block $case4|1
         block $case3|1
          block $case2|1
           block $case1|1
            block $case0|1
             global.get $input/prod
             i32.const 63
             i32.sub
             br_table $case6|1 $case7|1 $case7|1 $case5|1 $case7|1 $case4|1 $case7|1 $case7|1 $case3|1 $case7|1 $case2|1 $case1|1 $case0|1 $case7|1
            end
            local.get $0
            call $input/State252
            br $break|1
           end
           local.get $0
           call $input/State252
           br $break|1
          end
          local.get $0
          call $input/State252
          br $break|1
         end
         local.get $0
         call $input/State252
         br $break|1
        end
        local.get $0
        call $input/State252
        br $break|1
       end
       local.get $0
       call $input/State252
       br $break|1
      end
      local.get $0
      global.get $input/const__
      call $input/_skip
      global.get $input/const_7_
      local.get $0
      i32.load offset=4
      call $~lib/staticarray/StaticArray<u32>#indexOf
      i32.const 0
      i32.ge_s
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load
       i32.eqz
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load
       i32.const 3
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load
       i32.const 5
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load
       i32.const 6
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load
       i32.const 7
       i32.eq
      end
      if
       local.get $0
       call $~lib/rt/pure/__release
       return
      end
      i32.const 0
      global.set $~argumentsLength
      local.get $0
      call $input/Lexer#copy@varargs
      local.set $2
      global.get $input/action_ptr
      global.set $input/mark_
      global.get $input/mark_
      local.set $5
      global.get $input/prod
      local.set $6
      global.get $input/stack_ptr
      local.set $7
      local.get $2
      call $~lib/rt/pure/__retain
      local.tee $1
      global.get $input/const__
      call $input/_skip
      global.get $input/idm246
      local.get $1
      i32.load offset=4
      f64.convert_i32_s
      call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
      if
       i32.const 1
       global.set $~argumentsLength
       local.get $1
       global.get $input/idm246
       local.get $1
       i32.load offset=4
       f64.convert_i32_s
       call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
       local.tee $3
       i32.load
       call_indirect (type $i32_=>_none)
       local.get $3
       call $~lib/rt/pure/__release
      else
       local.get $1
       call $input/fail
      end
      global.get $input/stack_ptr
      local.set $3
      loop $while-continue|00
       local.get $3
       global.get $input/stack_ptr
       i32.le_u
       if
        block $__inlined_func$input/State303
         block $break|11
          block $case2|12
           global.get $input/prod
           local.tee $8
           i32.const 62
           i32.ne
           if
            local.get $8
            i32.const 63
            i32.eq
            br_if $__inlined_func$input/State303
            br $case2|12
           end
           local.get $1
           call $input/State309
           br $break|11
          end
          local.get $1
          call $input/fail
          br $__inlined_func$input/State303
         end
         global.get $input/prod
         i32.const 0
         i32.ge_s
         if
          global.get $input/stack_ptr
          i32.const 1
          i32.add
          global.set $input/stack_ptr
         end
         br $while-continue|00
        end
       end
      end
      local.get $1
      call $~lib/rt/pure/__release
      global.get $input/FAILED
      if
       local.get $6
       global.set $input/prod
       i32.const 0
       global.set $input/FAILED
       local.get $7
       global.set $input/stack_ptr
       local.get $5
       global.set $input/action_ptr
       local.get $0
       call $~lib/rt/pure/__release
       local.get $2
       call $~lib/rt/pure/__release
       return
      else
       local.get $0
       local.get $2
       call $input/Lexer#sync
      end
      local.get $2
      call $~lib/rt/pure/__release
      br $break|1
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|26 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  call $input/$sym$symbol
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State91 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  i32.load offset=4
  i32.const 18
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 19
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 59
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 60
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 61
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 62
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 63
   i32.eq
  end
  if
   local.get $0
   call $input/$sym$terminal_symbol
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
  else
   local.get $0
   i32.load offset=4
   i32.const 39
   i32.eq
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load
    i32.eqz
   end
   if
    local.get $0
    call $input/fail
   else
    local.get $0
    call $input/$sym$terminal_symbol
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
   end
  end
  global.get $input/stack_ptr
  local.set $3
  loop $while-continue|0
   local.get $3
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $1
       i32.const 61
       i32.ne
       if
        local.get $1
        i32.const 50
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       call $~lib/rt/pure/__retain
       local.tee $1
       global.get $input/const__
       call $input/_skip
       global.get $input/idm226r
       local.get $1
       i32.load offset=4
       f64.convert_i32_s
       call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
       if
        i32.const 1
        global.set $~argumentsLength
        local.get $1
        global.get $input/idm226r
        local.get $1
        i32.load offset=4
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
        local.tee $2
        i32.load
        call_indirect (type $i32_=>_none)
        local.get $2
        call $~lib/rt/pure/__release
       else
        global.get $input/tym226r
        local.get $1
        i32.load
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
        if
         i32.const 1
         global.set $~argumentsLength
         local.get $1
         global.get $input/tym226r
         local.get $1
         i32.load
         f64.convert_i32_s
         call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
         local.tee $2
         i32.load
         call_indirect (type $i32_=>_none)
         local.get $2
         call $~lib/rt/pure/__release
        else
         local.get $1
         call $input/fail
        end
       end
       local.get $1
       call $~lib/rt/pure/__release
       br $break|1
      end
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$sym$condition_symbol_list (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  i32.load offset=4
  i32.const 18
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 19
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 59
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 60
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 61
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 62
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 63
   i32.eq
  end
  if
   local.get $0
   call $input/$sym$terminal_symbol
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
  else
   local.get $0
   i32.load offset=4
   i32.const 39
   i32.eq
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load
    i32.eqz
   end
   if
    local.get $0
    call $input/fail
   else
    local.get $0
    call $input/$sym$terminal_symbol
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
   end
  end
  global.get $input/stack_ptr
  local.set $3
  loop $while-continue|0
   local.get $3
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $1
       i32.const 61
       i32.ne
       if
        local.get $1
        i32.const 50
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       call $~lib/rt/pure/__retain
       local.tee $1
       global.get $input/const__
       call $input/_skip
       global.get $input/idm92r
       local.get $1
       i32.load offset=4
       f64.convert_i32_s
       call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
       if
        i32.const 1
        global.set $~argumentsLength
        local.get $1
        global.get $input/idm92r
        local.get $1
        i32.load offset=4
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
        local.tee $2
        i32.load
        call_indirect (type $i32_=>_none)
        local.get $2
        call $~lib/rt/pure/__release
       else
        global.get $input/tym92r
        local.get $1
        i32.load
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
        if
         i32.const 1
         global.set $~argumentsLength
         local.get $1
         global.get $input/tym92r
         local.get $1
         i32.load
         f64.convert_i32_s
         call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
         local.tee $2
         i32.load
         call_indirect (type $i32_=>_none)
         local.get $2
         call $~lib/rt/pure/__release
        else
         local.get $1
         call $input/fail
        end
       end
       br $break|1
      end
      local.get $0
      global.get $input/const__
      call $input/_skip
      local.get $0
      i32.load offset=4
      i32.const 39
      i32.eq
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load
       i32.eqz
      end
      if
       local.get $0
       call $~lib/rt/pure/__release
       return
      end
      i32.const 0
      global.set $~argumentsLength
      local.get $0
      call $input/Lexer#copy@varargs
      local.set $1
      global.get $input/action_ptr
      global.set $input/mark_
      global.get $input/mark_
      local.set $2
      global.get $input/prod
      local.set $4
      global.get $input/stack_ptr
      local.set $5
      local.get $1
      call $input/State91
      global.get $input/FAILED
      if
       local.get $4
       global.set $input/prod
       i32.const 0
       global.set $input/FAILED
       local.get $5
       global.set $input/stack_ptr
       local.get $2
       global.set $input/action_ptr
       local.get $0
       call $~lib/rt/pure/__release
       local.get $1
       call $~lib/rt/pure/__release
       return
      else
       local.get $0
       local.get $1
       call $input/Lexer#sync
      end
      br $break|1
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    local.get $1
    call $~lib/rt/pure/__release
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$pb$condition_clause (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  call $input/_no_check
  local.get $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner0
   local.get $0
   i32.load offset=4
   i32.const 40
   i32.eq
   if
    local.get $0
    call $input/_no_check
    global.get $input/FAILED
    i32.eqz
    if
     local.get $0
     call $input/$sym$condition_symbol_list
     global.get $input/FAILED
     i32.eqz
     if
      local.get $0
      global.get $input/const__
      i32.const 39
      call $input/_with_skip
      global.get $input/FAILED
      i32.eqz
      if
       i32.const 33
       call $input/setProduction
       i32.const 4
       i32.const 38
       call $input/add_reduce
       br $folding-inner0
      end
     end
    end
   else
    local.get $0
    i32.load offset=4
    i32.const 41
    i32.eq
    if
     local.get $0
     call $input/_no_check
     global.get $input/FAILED
     i32.eqz
     if
      local.get $0
      call $input/$sym$condition_symbol_list
      global.get $input/FAILED
      i32.eqz
      if
       local.get $0
       global.get $input/const__
       i32.const 39
       call $input/_with_skip
       global.get $input/FAILED
       i32.eqz
       if
        i32.const 33
        call $input/setProduction
        i32.const 4
        i32.const 39
        call $input/add_reduce
        br $folding-inner0
       end
      end
     end
    else
     local.get $0
     i32.load offset=4
     i32.const 42
     i32.eq
     if
      local.get $0
      call $input/_no_check
      global.get $input/FAILED
      i32.eqz
      if
       local.get $0
       call $input/$sym$condition_symbol_list
       global.get $input/FAILED
       i32.eqz
       if
        local.get $0
        global.get $input/const__
        i32.const 39
        call $input/_with_skip
        global.get $input/FAILED
        i32.eqz
        if
         i32.const 33
         call $input/setProduction
         i32.const 4
         i32.const 40
         call $input/add_reduce
         br $folding-inner0
        end
       end
      end
     else
      local.get $0
      i32.load offset=4
      i32.const 43
      i32.eq
      if
       local.get $0
       call $input/_no_check
       global.get $input/FAILED
       i32.eqz
       if
        local.get $0
        call $input/$sym$condition_symbol_list
        global.get $input/FAILED
        i32.eqz
        if
         local.get $0
         global.get $input/const__
         i32.const 39
         call $input/_with_skip
         global.get $input/FAILED
         i32.eqz
         if
          i32.const 33
          call $input/setProduction
          i32.const 4
          i32.const 41
          call $input/add_reduce
          br $folding-inner0
         end
        end
       end
      else
       local.get $0
       i32.load offset=4
       i32.const 44
       i32.eq
       if
        local.get $0
        call $input/_no_check
        global.get $input/FAILED
        i32.eqz
        if
         local.get $0
         call $input/$sym$symbol
         global.get $input/FAILED
         i32.eqz
         if
          local.get $0
          global.get $input/const__
          i32.const 39
          call $input/_with_skip
          global.get $input/FAILED
          i32.eqz
          if
           i32.const 33
           call $input/setProduction
           i32.const 4
           i32.const 42
           call $input/add_reduce
           br $folding-inner0
          end
         end
        end
       end
      end
     end
    end
   end
   local.get $0
   call $input/fail
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|27 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.set $0
  global.get $input/action_ptr
  global.set $input/mark_
  global.get $input/mark_
  local.set $2
  global.get $input/stack_ptr
  local.set $3
  i32.const 0
  global.set $~argumentsLength
  local.get $0
  call $input/Lexer#copy@varargs
  local.tee $1
  call $input/$sym$symbol
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  global.get $input/FAILED
  if
   local.get $2
   global.set $input/action_ptr
   i32.const 0
   global.set $input/FAILED
   local.get $3
   global.set $input/stack_ptr
   local.get $0
   call $input/$pb$condition_clause
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
  else
   local.get $0
   local.get $1
   call $input/Lexer#sync
  end
  local.get $1
  call $~lib/rt/pure/__release
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$fn$function_clause (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  call $input/$fn$js_function_start_symbol
  local.get $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  i32.load offset=4
  i32.const 46
  i32.eq
  if
   local.get $0
   call $input/_no_check
   global.get $input/FAILED
   i32.eqz
   if
    local.get $0
    call $input/$fn$js_data
    global.get $input/FAILED
    i32.eqz
    if
     local.get $0
     global.get $input/const__
     i32.const 47
     call $input/_with_skip
     global.get $input/FAILED
     i32.eqz
     if
      i32.const 38
      call $input/setProduction
      i32.const 4
      i32.const 49
      call $input/add_reduce
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
    end
   end
  else
   local.get $0
   i32.load offset=4
   i32.const 45
   i32.eq
   if
    local.get $0
    call $input/_no_check
    global.get $input/FAILED
    i32.eqz
    if
     local.get $0
     call $input/$sym$js_identifier
     global.get $input/FAILED
     i32.eqz
     if
      i32.const 38
      call $input/setProduction
      i32.const 3
      i32.const 50
      call $input/add_reduce
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
    end
   end
  end
  local.get $0
  call $input/fail
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|28 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  call $input/$fn$function_clause
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State326 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm326
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm326
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
  else
   global.get $input/tym323
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym323
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $0
    call $input/fail
   end
  end
  global.get $input/stack_ptr
  local.set $1
  loop $while-continue|0
   local.get $1
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case4|1
      block $case3|1
       block $case2|1
        block $case1|1
         global.get $input/prod
         local.tee $2
         i32.const 63
         i32.ne
         if
          local.get $2
          i32.const 31
          i32.sub
          br_table $case3|1 $case4|1 $case2|1 $case4|1 $case4|1 $case4|1 $case4|1 $case1|1 $case4|1
         end
         local.get $0
         call $input/State336
         br $break|1
        end
        local.get $0
        call $input/State334
        br $break|1
       end
       local.get $0
       call $input/State334
       br $break|1
      end
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State249 (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm249
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm249
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
  else
   global.get $input/tym249
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym249
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $0
    call $input/fail
   end
  end
  global.get $input/stack_ptr
  local.set $1
  loop $while-continue|0
   local.get $1
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     global.get $input/prod
     i32.const 31
     i32.eq
     if
      local.get $0
      global.get $input/const__
      call $input/_skip
      local.get $0
      i32.load offset=4
      i32.const 12
      i32.eq
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 13
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 31
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 32
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 39
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 56
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load
       i32.eqz
      end
      if
       local.get $0
       call $~lib/rt/pure/__release
       return
      end
      local.get $0
      call $input/State326
      br $break|1
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|29 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  call $input/_no_check
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $0
  call $input/State249
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|30 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  call $input/$pb$body_entries
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|31 (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $1
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $__inlined_func$input/$sym$symbol_group_032_105
   block $folding-inner0
    local.get $0
    i32.load offset=4
    i32.const 16
    i32.eq
    if
     local.get $0
     call $input/_no_check
     global.get $input/FAILED
     i32.eqz
     br_if $folding-inner0
    else
     local.get $0
     i32.load offset=4
     i32.const 15
     i32.eq
     if
      local.get $0
      call $input/_no_check
      global.get $input/FAILED
      i32.eqz
      br_if $folding-inner0
     end
    end
    local.get $0
    call $input/fail
    br $__inlined_func$input/$sym$symbol_group_032_105
   end
   i32.const 62
   call $input/setProduction
  end
  local.get $0
  call $~lib/rt/pure/__release
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $1
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|32 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $2
  call $input/_no_check
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $2
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm308r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm308r
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
  else
   global.get $input/tym308r
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym308r
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $0
    call $input/fail
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
  local.get $2
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|33 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 1
  i32.const 34
  call $input/add_reduce
  i32.const 31
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 1
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|34 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.set $0
  global.get $input/action_ptr
  global.set $input/mark_
  global.get $input/mark_
  local.set $2
  global.get $input/stack_ptr
  local.set $3
  i32.const 0
  global.set $~argumentsLength
  local.get $0
  call $input/Lexer#copy@varargs
  local.tee $1
  call $input/$pb$condition_clause
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  global.get $input/FAILED
  if
   local.get $2
   global.set $input/action_ptr
   i32.const 0
   global.set $input/FAILED
   local.get $3
   global.set $input/stack_ptr
   local.get $0
   call $input/$sym$symbol
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
  else
   local.get $0
   local.get $1
   call $input/Lexer#sync
  end
  local.get $1
  call $~lib/rt/pure/__release
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|35 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $2
  call $input/_no_check
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $2
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm358r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm358r
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
  else
   global.get $input/tym358r
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym358r
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $0
    call $input/fail
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
  local.get $2
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|36 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 2
  i32.const 56
  call $input/add_reduce
  i32.const 63
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 2
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|37 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  call $input/$sym$terminal_symbol
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|38 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $2
  call $input/_no_check
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $2
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm346r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm346r
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
  else
   global.get $input/tym346r
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym346r
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $0
    call $input/fail
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
  local.get $2
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|39 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 2
  i32.const 35
  call $input/add_reduce
  i32.const 31
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 2
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|40 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 3
  i32.const 36
  call $input/add_reduce
  i32.const 31
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 3
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|41 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 3
  i32.const 57
  call $input/add_reduce
  i32.const 63
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 3
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|42 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 4
  i32.const 57
  call $input/add_reduce
  i32.const 63
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 4
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|43 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $2
  call $input/_no_check
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $2
  call $~lib/rt/pure/__retain
  local.set $0
  global.get $input/idm197r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm197r
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
  else
   global.get $input/tym197r
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym197r
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $0
    call $input/fail
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
  local.get $2
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|47 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 100
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 1
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|48 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  call $input/$sym$generated_symbol
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|49 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.set $0
  global.get $input/action_ptr
  global.set $input/mark_
  global.get $input/mark_
  local.set $1
  global.get $input/stack_ptr
  local.set $3
  i32.const 0
  global.set $~argumentsLength
  local.get $0
  call $input/Lexer#copy@varargs
  local.tee $2
  call $input/$sym$imported_production_symbol
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  global.get $input/FAILED
  if
   local.get $1
   global.set $input/action_ptr
   i32.const 0
   global.set $input/FAILED
   local.get $3
   global.set $input/stack_ptr
   local.get $0
   call $~lib/rt/pure/__retain
   local.tee $1
   global.get $input/const__
   call $input/_skip
   local.get $1
   call $input/$sym$identifier
   block $__inlined_func$input/$sym$production_symbol
    global.get $input/FAILED
    i32.eqz
    if
     i32.const 74
     call $input/setProduction
     i32.const 1
     i32.const 65
     call $input/add_reduce
     br $__inlined_func$input/$sym$production_symbol
    end
    local.get $1
    call $input/fail
   end
   local.get $1
   call $~lib/rt/pure/__release
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
  else
   local.get $0
   local.get $2
   call $input/Lexer#sync
  end
  local.get $2
  call $~lib/rt/pure/__release
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|50 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  call $input/$sym$literal_symbol
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|51 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  call $input/$sym$escaped_symbol
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|52 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  call $input/$sym$assert_function_symbol
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State243 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner0
   global.get $input/idm243
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/idm243
    local.get $0
    i32.load offset=4
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    global.get $input/tym323
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
    if
     i32.const 1
     global.set $~argumentsLength
     local.get $0
     global.get $input/tym323
     local.get $0
     i32.load
     f64.convert_i32_s
     call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
     local.tee $1
     i32.load
     call_indirect (type $i32_=>_none)
     local.get $1
     call $~lib/rt/pure/__release
    else
     global.get $input/idm243r
     local.get $0
     i32.load offset=4
     f64.convert_i32_s
     call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
     if
      i32.const 1
      global.set $~argumentsLength
      local.get $0
      global.get $input/idm243r
      local.get $0
      i32.load offset=4
      f64.convert_i32_s
      call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
      local.tee $1
      i32.load
      call_indirect (type $i32_=>_none)
      local.get $1
      call $~lib/rt/pure/__release
      br $folding-inner0
     else
      global.get $input/tym243r
      local.get $0
      i32.load
      f64.convert_i32_s
      call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
      if
       i32.const 1
       global.set $~argumentsLength
       local.get $0
       global.get $input/tym243r
       local.get $0
       i32.load
       f64.convert_i32_s
       call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
       local.tee $1
       i32.load
       call_indirect (type $i32_=>_none)
       local.get $1
       call $~lib/rt/pure/__release
       br $folding-inner0
      else
       local.get $0
       call $input/fail
      end
     end
    end
   end
   global.get $input/stack_ptr
   local.set $3
   loop $while-continue|0
    local.get $3
    global.get $input/stack_ptr
    i32.le_u
    if
     block $break|1
      block $case6|1
       block $case3|1
        block $case2|1
         block $case1|1
          global.get $input/prod
          local.tee $1
          i32.const 63
          i32.ne
          if
           block $tablify|0
            local.get $1
            i32.const 33
            i32.sub
            br_table $case3|1 $tablify|0 $tablify|0 $tablify|0 $case2|1 $case1|1 $tablify|0
           end
           local.get $1
           i32.const 30
           i32.eq
           local.get $1
           i32.const 31
           i32.eq
           i32.or
           br_if $folding-inner0
           br $case6|1
          end
          local.get $0
          call $input/State336
          br $break|1
         end
         local.get $0
         call $input/State334
         br $break|1
        end
        local.get $0
        call $~lib/rt/pure/__retain
        local.tee $1
        global.get $input/const__
        call $input/_skip
        global.get $input/idm333r
        local.get $1
        i32.load offset=4
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
        if
         i32.const 1
         global.set $~argumentsLength
         local.get $1
         global.get $input/idm333r
         local.get $1
         i32.load offset=4
         f64.convert_i32_s
         call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
         local.tee $2
         i32.load
         call_indirect (type $i32_=>_none)
         local.get $2
         call $~lib/rt/pure/__release
        else
         global.get $input/tym333r
         local.get $1
         i32.load
         f64.convert_i32_s
         call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
         if
          i32.const 1
          global.set $~argumentsLength
          local.get $1
          global.get $input/tym333r
          local.get $1
          i32.load
          f64.convert_i32_s
          call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
          local.tee $2
          i32.load
          call_indirect (type $i32_=>_none)
          local.get $2
          call $~lib/rt/pure/__release
         else
          local.get $1
          call $input/fail
         end
        end
        local.get $1
        call $~lib/rt/pure/__release
        br $break|1
       end
       local.get $0
       call $input/State334
       br $break|1
      end
      local.get $0
      call $input/fail
      br $folding-inner0
     end
     global.get $input/prod
     i32.const 0
     i32.ge_s
     if
      global.get $input/stack_ptr
      i32.const 1
      i32.add
      global.set $input/stack_ptr
     end
     br $while-continue|0
    end
   end
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State339 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm339
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm339
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
  else
   local.get $0
   call $input/fail
  end
  global.get $input/stack_ptr
  local.set $2
  loop $while-continue|0
   local.get $2
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case4|1
      block $case3|1
       block $case1|1
        global.get $input/prod
        local.tee $1
        i32.const 44
        i32.ne
        if
         local.get $1
         i32.const 27
         i32.eq
         br_if $case1|1
         local.get $1
         i32.const 63
         i32.eq
         local.get $1
         i32.const 28
         i32.eq
         i32.or
         br_if $case3|1
         br $case4|1
        end
        local.get $0
        call $input/State305
        br $break|1
       end
       local.get $0
       call $input/State304
       br $break|1
      end
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State302 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm298
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm298
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
  else
   global.get $input/tym298
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym298
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $0
    call $input/fail
   end
  end
  global.get $input/stack_ptr
  local.set $3
  loop $while-continue|0
   local.get $3
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case5|1
      block $case4|1
       block $case3|1
        block $case2|1
         block $case1|1
          global.get $input/prod
          local.tee $1
          i32.const 63
          i32.ne
          if
           local.get $1
           i32.const 28
           i32.sub
           br_table $case4|1 $case3|1 $case2|1 $case1|1 $case5|1
          end
          local.get $0
          global.get $input/const__
          call $input/_skip
          global.get $input/const_7_
          local.get $0
          i32.load offset=4
          call $~lib/staticarray/StaticArray<u32>#indexOf
          i32.const 0
          i32.ge_s
          if (result i32)
           i32.const 1
          else
           local.get $0
           i32.load
           i32.eqz
          end
          if (result i32)
           i32.const 1
          else
           local.get $0
           i32.load
           i32.const 3
           i32.eq
          end
          if (result i32)
           i32.const 1
          else
           local.get $0
           i32.load
           i32.const 5
           i32.eq
          end
          if (result i32)
           i32.const 1
          else
           local.get $0
           i32.load
           i32.const 6
           i32.eq
          end
          if (result i32)
           i32.const 1
          else
           local.get $0
           i32.load
           i32.const 7
           i32.eq
          end
          if
           local.get $0
           call $~lib/rt/pure/__release
           return
          end
          local.get $0
          call $input/State246
          br $break|1
         end
         local.get $0
         call $input/State243
         br $break|1
        end
        local.get $0
        call $~lib/rt/pure/__retain
        local.tee $1
        global.get $input/const__
        call $input/_skip
        global.get $input/idm241r
        local.get $1
        i32.load offset=4
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
        if
         i32.const 1
         global.set $~argumentsLength
         local.get $1
         global.get $input/idm241r
         local.get $1
         i32.load offset=4
         f64.convert_i32_s
         call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
         local.tee $2
         i32.load
         call_indirect (type $i32_=>_none)
         local.get $2
         call $~lib/rt/pure/__release
        else
         global.get $input/tym241r
         local.get $1
         i32.load
         f64.convert_i32_s
         call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
         if
          i32.const 1
          global.set $~argumentsLength
          local.get $1
          global.get $input/tym241r
          local.get $1
          i32.load
          f64.convert_i32_s
          call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
          local.tee $2
          i32.load
          call_indirect (type $i32_=>_none)
          local.get $2
          call $~lib/rt/pure/__release
         else
          local.get $1
          call $input/fail
         end
        end
        local.get $1
        call $~lib/rt/pure/__release
        br $break|1
       end
       local.get $0
       call $input/State238
       br $break|1
      end
      local.get $0
      call $input/State339
      br $break|1
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|53 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  call $input/_no_check
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $0
  call $input/State302
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|54 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $2
  call $input/_no_check
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $2
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm256r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm256r
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
  else
   global.get $input/tym256r
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym256r
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $0
    call $input/fail
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
  local.get $2
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|56 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 1
  i32.const 54
  call $input/add_reduce
  i32.const 63
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 1
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|57 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 63
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 1
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|58 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.set $0
  global.get $input/action_ptr
  global.set $input/mark_
  global.get $input/mark_
  local.set $2
  global.get $input/stack_ptr
  local.set $3
  i32.const 0
  global.set $~argumentsLength
  local.get $0
  call $input/Lexer#copy@varargs
  local.tee $1
  call $input/$fn$reduce_function
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  global.get $input/FAILED
  if
   local.get $2
   global.set $input/action_ptr
   i32.const 0
   global.set $input/FAILED
   local.get $3
   global.set $input/stack_ptr
   local.get $0
   call $input/$fn$function_clause
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
  else
   local.get $0
   local.get $1
   call $input/Lexer#sync
  end
  local.get $1
  call $~lib/rt/pure/__release
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|59 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 1
  i32.const 33
  call $input/add_reduce
  i32.const 30
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 1
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|60 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 1
  i32.const 29
  call $input/add_reduce
  i32.const 29
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 1
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|61 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $2
  call $input/_no_check
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $2
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm366r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm366r
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $1
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $1
   call $~lib/rt/pure/__release
  else
   global.get $input/tym366r
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym366r
    local.get $0
    i32.load
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
    local.tee $1
    i32.load
    call_indirect (type $i32_=>_none)
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $0
    call $input/fail
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
  local.get $2
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|62 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 2
  i32.const 30
  call $input/add_reduce
  i32.const 30
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 2
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|63 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 3
  i32.const 55
  call $input/add_reduce
  i32.const 63
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 3
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|64 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 1
  i32.const 5
  call $input/add_reduce
  i32.const 50
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 1
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|65 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 2
  i32.const 4
  call $input/add_reduce
  i32.const 50
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 2
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $~lib/map/Map<f64,%28input/Lexer%29=>void>#rehash (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  local.get $1
  i32.const 1
  i32.add
  local.tee $3
  i32.const 2
  i32.shl
  call $~lib/arraybuffer/ArrayBuffer#constructor
  local.set $5
  local.get $3
  i32.const 3
  i32.shl
  i32.const 3
  i32.div_s
  local.tee $6
  i32.const 4
  i32.shl
  call $~lib/arraybuffer/ArrayBuffer#constructor
  local.set $3
  local.get $0
  i32.load offset=8
  local.tee $4
  local.get $0
  i32.load offset=16
  i32.const 4
  i32.shl
  i32.add
  local.set $7
  local.get $3
  local.set $2
  loop $while-continue|0
   local.get $4
   local.get $7
   i32.ne
   if
    local.get $4
    i32.load offset=12
    i32.const 1
    i32.and
    i32.eqz
    if
     local.get $2
     local.get $4
     f64.load
     f64.store
     local.get $2
     local.get $4
     i32.load offset=8
     i32.store offset=8
     local.get $2
     local.get $5
     local.get $4
     f64.load
     i64.reinterpret_f64
     call $~lib/util/hash/hash64
     local.get $1
     i32.and
     i32.const 2
     i32.shl
     i32.add
     local.tee $8
     i32.load
     i32.store offset=12
     local.get $8
     local.get $2
     i32.store
     local.get $2
     i32.const 16
     i32.add
     local.set $2
    end
    local.get $4
    i32.const 16
    i32.add
    local.set $4
    br $while-continue|0
   end
  end
  local.get $5
  local.tee $4
  local.get $0
  i32.load
  local.tee $2
  i32.ne
  if
   local.get $4
   call $~lib/rt/pure/__retain
   local.set $4
   local.get $2
   call $~lib/rt/pure/__release
  end
  local.get $0
  local.get $4
  i32.store
  local.get $0
  local.get $1
  i32.store offset=4
  local.get $3
  local.tee $1
  local.get $0
  i32.load offset=8
  local.tee $4
  i32.ne
  if
   local.get $1
   call $~lib/rt/pure/__retain
   local.set $1
   local.get $4
   call $~lib/rt/pure/__release
  end
  local.get $0
  local.get $1
  i32.store offset=8
  local.get $0
  local.get $6
  i32.store offset=12
  local.get $0
  local.get $0
  i32.load offset=20
  i32.store offset=16
  local.get $5
  call $~lib/rt/pure/__release
  local.get $3
  call $~lib/rt/pure/__release
 )
 (func $~lib/map/Map<f64,%28input/Lexer%29=>void>#set (param $0 i32) (param $1 f64) (param $2 i32) (result i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $2
  call $~lib/rt/pure/__retain
  local.set $2
  local.get $0
  local.get $1
  local.get $1
  i64.reinterpret_f64
  call $~lib/util/hash/hash64
  local.tee $5
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#find
  local.tee $3
  if
   local.get $2
   local.get $3
   i32.load offset=8
   local.tee $4
   i32.ne
   if
    local.get $3
    local.get $2
    call $~lib/rt/pure/__retain
    i32.store offset=8
    local.get $4
    call $~lib/rt/pure/__release
   end
  else
   local.get $0
   i32.load offset=16
   local.get $0
   i32.load offset=12
   i32.eq
   if
    local.get $0
    local.get $0
    i32.load offset=20
    local.get $0
    i32.load offset=12
    i32.const 3
    i32.mul
    i32.const 4
    i32.div_s
    i32.lt_s
    if (result i32)
     local.get $0
     i32.load offset=4
    else
     local.get $0
     i32.load offset=4
     i32.const 1
     i32.shl
     i32.const 1
     i32.or
    end
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#rehash
   end
   local.get $0
   i32.load offset=8
   call $~lib/rt/pure/__retain
   local.set $4
   local.get $0
   local.get $0
   i32.load offset=16
   local.tee $3
   i32.const 1
   i32.add
   i32.store offset=16
   local.get $4
   local.get $3
   i32.const 4
   i32.shl
   i32.add
   local.tee $3
   local.get $1
   f64.store
   local.get $3
   local.get $2
   call $~lib/rt/pure/__retain
   i32.store offset=8
   local.get $0
   local.get $0
   i32.load offset=20
   i32.const 1
   i32.add
   i32.store offset=20
   local.get $3
   local.get $0
   i32.load
   local.get $5
   local.get $0
   i32.load offset=4
   i32.and
   i32.const 2
   i32.shl
   i32.add
   local.tee $5
   i32.load
   i32.store offset=12
   local.get $5
   local.get $3
   i32.store
   local.get $4
   call $~lib/rt/pure/__release
  end
  local.get $0
  call $~lib/rt/pure/__retain
  local.get $2
  call $~lib/rt/pure/__release
 )
 (func $start:input
  (local $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  i32.const 2
  i32.const 4579584
  call $~lib/rt/__newArray
  call $~lib/rt/pure/__retain
  local.tee $0
  call $~lib/staticarray/StaticArray.fromArray<u32>
  global.set $input/const__
  i32.const 1
  i32.const 4579616
  call $~lib/rt/__newArray
  call $~lib/rt/pure/__retain
  call $~lib/staticarray/StaticArray.fromArray<u32>
  global.set $input/const_1_
  i32.const 1
  i32.const 4579648
  call $~lib/rt/__newArray
  call $~lib/rt/pure/__retain
  local.tee $1
  call $~lib/staticarray/StaticArray.fromArray<u32>
  global.set $input/const_0_
  i32.const 13
  i32.const 4579680
  call $~lib/rt/__newArray
  call $~lib/rt/pure/__retain
  call $~lib/staticarray/StaticArray.fromArray<u32>
  global.set $input/const_2_
  i32.const 23
  i32.const 4579760
  call $~lib/rt/__newArray
  call $~lib/rt/pure/__retain
  local.tee $2
  call $~lib/staticarray/StaticArray.fromArray<u32>
  global.set $input/const_3_
  i32.const 14
  i32.const 4579872
  call $~lib/rt/__newArray
  call $~lib/rt/pure/__retain
  local.tee $3
  call $~lib/staticarray/StaticArray.fromArray<u32>
  global.set $input/const_4_
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm404
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm232
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym232
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm117
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym117
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm121r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym121r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm120
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm235r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym235r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym59r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym216r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm298
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym298
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm355
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm305r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym305r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm356r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym356r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm357
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm238r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym238r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm323
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym323
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm246
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm246r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym246r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm309
  i32.const 14
  i32.const 4580688
  call $~lib/rt/__newArray
  call $~lib/rt/pure/__retain
  local.tee $4
  call $~lib/staticarray/StaticArray.fromArray<u32>
  global.set $input/const_6_
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm371r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym371r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm324
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm336r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym336r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm301
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym301
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm252r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym252r
  i32.const 19
  i32.const 4581216
  call $~lib/rt/__newArray
  call $~lib/rt/pure/__retain
  local.tee $5
  call $~lib/staticarray/StaticArray.fromArray<u32>
  global.set $input/const_7_
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm92r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym92r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm226r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym226r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm249
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym249
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm326
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm308r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym308r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm358r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym358r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm346r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym346r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm197r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym197r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm243
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm243r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym243r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm333r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym333r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm241r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym241r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm339
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm256r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym256r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm366r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym366r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm29r
  global.get $input/idm29r
  f64.const 12
  i32.const 4579952
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm29r
  f64.const 13
  i32.const 4579952
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm29r
  f64.const 54
  i32.const 4579952
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm29r
  f64.const 55
  i32.const 4579952
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm29r
  f64.const 20
  i32.const 4579952
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm29r
  f64.const 21
  i32.const 4579952
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm29r
  f64.const 56
  i32.const 4579952
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym29r
  global.get $input/tym29r
  f64.const 0
  i32.const 4579952
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm181r
  global.get $input/idm181r
  f64.const 12
  i32.const 4579984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm181r
  f64.const 13
  i32.const 4579984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm181r
  f64.const 54
  i32.const 4579984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm181r
  f64.const 55
  i32.const 4579984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm181r
  f64.const 20
  i32.const 4579984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm181r
  f64.const 21
  i32.const 4579984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm181r
  f64.const 56
  i32.const 4579984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym181r
  global.get $input/tym181r
  f64.const 0
  i32.const 4579984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm30
  global.get $input/idm30
  f64.const 12
  i32.const 4580368
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm30
  f64.const 13
  i32.const 4580368
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm30
  f64.const 54
  i32.const 4580400
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm30
  f64.const 55
  i32.const 4580400
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm30
  f64.const 20
  i32.const 4580432
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm33
  global.get $input/idm33
  f64.const 12
  i32.const 4580368
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm33
  f64.const 13
  i32.const 4580368
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm33
  f64.const 56
  i32.const 4580464
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm33
  f64.const 54
  i32.const 4580400
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm33
  f64.const 55
  i32.const 4580400
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm404
  f64.const 12
  i32.const 4580496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm404
  f64.const 13
  i32.const 4580528
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm298
  f64.const 37
  i32.const 4580560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm298
  f64.const 19
  i32.const 4580560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm298
  f64.const 61
  i32.const 4580560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm298
  f64.const 78
  i32.const 4580560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm298
  f64.const 79
  i32.const 4580560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm298
  f64.const 18
  i32.const 4580560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm298
  f64.const 62
  i32.const 4580560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm298
  f64.const 63
  i32.const 4580560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm298
  f64.const 59
  i32.const 4580560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm298
  f64.const 60
  i32.const 4580560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm298
  f64.const 54
  i32.const 4580560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm298
  f64.const 55
  i32.const 4580560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm298
  f64.const 35
  i32.const 4580560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm298
  f64.const 20
  i32.const 4580560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm298
  f64.const 58
  i32.const 4580560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym298
  f64.const 3
  i32.const 4580560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym298
  f64.const 7
  i32.const 4580560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym298
  f64.const 6
  i32.const 4580560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym298
  f64.const 5
  i32.const 4580560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm355
  f64.const 31
  i32.const 4580592
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm355
  f64.const 32
  i32.const 4580592
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm355
  f64.const 56
  i32.const 4580464
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm357
  f64.const 31
  i32.const 4580624
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm357
  f64.const 32
  i32.const 4580624
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm357
  f64.const 56
  i32.const 4580464
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm305r
  f64.const 31
  i32.const 4580656
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm305r
  f64.const 32
  i32.const 4580656
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm305r
  f64.const 56
  i32.const 4580656
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm305r
  f64.const 39
  i32.const 4580656
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm305r
  f64.const 12
  i32.const 4580656
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm305r
  f64.const 13
  i32.const 4580656
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm305r
  f64.const 54
  i32.const 4580656
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm305r
  f64.const 55
  i32.const 4580656
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym305r
  f64.const 0
  i32.const 4580656
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm304
  f64.const 37
  i32.const 4580768
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm304
  f64.const 19
  i32.const 4580768
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm304
  f64.const 61
  i32.const 4580768
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm304
  f64.const 78
  i32.const 4580768
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm304
  f64.const 79
  i32.const 4580768
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm304
  f64.const 18
  i32.const 4580768
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm304
  f64.const 62
  i32.const 4580768
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm304
  f64.const 63
  i32.const 4580768
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm304
  f64.const 59
  i32.const 4580768
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm304
  f64.const 60
  i32.const 4580768
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm304
  f64.const 54
  i32.const 4580768
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm304
  f64.const 55
  i32.const 4580768
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm304
  f64.const 35
  i32.const 4580768
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm304
  f64.const 20
  i32.const 4580768
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm304
  f64.const 58
  i32.const 4580768
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym304
  f64.const 3
  i32.const 4580768
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym304
  f64.const 7
  i32.const 4580768
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym304
  f64.const 6
  i32.const 4580768
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym304
  f64.const 5
  i32.const 4580768
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm356r
  f64.const 31
  i32.const 4580800
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm356r
  f64.const 32
  i32.const 4580800
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm356r
  f64.const 56
  i32.const 4580800
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm356r
  f64.const 39
  i32.const 4580800
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm356r
  f64.const 12
  i32.const 4580800
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm356r
  f64.const 13
  i32.const 4580800
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm356r
  f64.const 54
  i32.const 4580800
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm356r
  f64.const 55
  i32.const 4580800
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym356r
  f64.const 0
  i32.const 4580800
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm238r
  f64.const 31
  i32.const 4580832
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm238r
  f64.const 32
  i32.const 4580832
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm238r
  f64.const 56
  i32.const 4580832
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm238r
  f64.const 39
  i32.const 4580832
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm238r
  f64.const 12
  i32.const 4580832
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm238r
  f64.const 13
  i32.const 4580832
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm238r
  f64.const 54
  i32.const 4580832
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm238r
  f64.const 55
  i32.const 4580832
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym238r
  f64.const 0
  i32.const 4580832
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm117
  f64.const 19
  i32.const 4580864
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm117
  f64.const 61
  i32.const 4580864
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm117
  f64.const 18
  i32.const 4580864
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm117
  f64.const 62
  i32.const 4580864
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm117
  f64.const 63
  i32.const 4580864
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm117
  f64.const 59
  i32.const 4580864
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm117
  f64.const 60
  i32.const 4580864
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm117
  f64.const 58
  i32.const 4580864
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm117
  f64.const 46
  i32.const 4580896
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm117
  f64.const 20
  i32.const 4580928
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym117
  f64.const 3
  i32.const 4580864
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym117
  f64.const 2
  i32.const 4580864
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym117
  f64.const 1
  i32.const 4580864
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym117
  f64.const 6
  i32.const 4580864
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym117
  f64.const 5
  i32.const 4580864
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym117
  f64.const 7
  i32.const 4580864
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm121r
  f64.const 47
  i32.const 4580960
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm121r
  f64.const 19
  i32.const 4580960
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm121r
  f64.const 61
  i32.const 4580960
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm121r
  f64.const 18
  i32.const 4580960
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm121r
  f64.const 62
  i32.const 4580960
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm121r
  f64.const 63
  i32.const 4580960
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm121r
  f64.const 59
  i32.const 4580960
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm121r
  f64.const 60
  i32.const 4580960
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm121r
  f64.const 58
  i32.const 4580960
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm121r
  f64.const 46
  i32.const 4580960
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym121r
  f64.const 3
  i32.const 4580960
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym121r
  f64.const 2
  i32.const 4580960
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym121r
  f64.const 1
  i32.const 4580960
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym121r
  f64.const 6
  i32.const 4580960
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym121r
  f64.const 5
  i32.const 4580960
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym121r
  f64.const 7
  i32.const 4580960
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym121r
  f64.const 88
  i32.const 4580960
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm120
  f64.const 19
  i32.const 4580864
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm120
  f64.const 61
  i32.const 4580864
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm120
  f64.const 18
  i32.const 4580864
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm120
  f64.const 62
  i32.const 4580864
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm120
  f64.const 63
  i32.const 4580864
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm120
  f64.const 59
  i32.const 4580864
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm120
  f64.const 60
  i32.const 4580864
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm120
  f64.const 58
  i32.const 4580864
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm120
  f64.const 46
  i32.const 4580896
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm235r
  f64.const 47
  i32.const 4580992
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm235r
  f64.const 19
  i32.const 4580992
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm235r
  f64.const 61
  i32.const 4580992
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm235r
  f64.const 18
  i32.const 4580992
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm235r
  f64.const 62
  i32.const 4580992
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm235r
  f64.const 63
  i32.const 4580992
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm235r
  f64.const 59
  i32.const 4580992
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm235r
  f64.const 60
  i32.const 4580992
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm235r
  f64.const 58
  i32.const 4580992
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm235r
  f64.const 46
  i32.const 4580992
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym235r
  f64.const 3
  i32.const 4580992
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym235r
  f64.const 2
  i32.const 4580992
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym235r
  f64.const 1
  i32.const 4580992
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym235r
  f64.const 6
  i32.const 4580992
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym235r
  f64.const 5
  i32.const 4580992
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym235r
  f64.const 7
  i32.const 4580992
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym235r
  f64.const 88
  i32.const 4580992
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm98r
  global.get $input/idm98r
  f64.const 19
  i32.const 4581024
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm98r
  f64.const 61
  i32.const 4581024
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm98r
  f64.const 18
  i32.const 4581024
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm98r
  f64.const 62
  i32.const 4581024
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm98r
  f64.const 63
  i32.const 4581024
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym98r
  global.get $input/tym98r
  f64.const 4
  i32.const 4581024
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym98r
  f64.const 88
  i32.const 4581024
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym98r
  f64.const 0
  i32.const 4581024
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm228r
  global.get $input/idm228r
  f64.const 19
  i32.const 4581056
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm228r
  f64.const 61
  i32.const 4581056
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm228r
  f64.const 18
  i32.const 4581056
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm228r
  f64.const 62
  i32.const 4581056
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm228r
  f64.const 63
  i32.const 4581056
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym228r
  global.get $input/tym228r
  f64.const 4
  i32.const 4581056
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym228r
  f64.const 88
  i32.const 4581056
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym228r
  f64.const 0
  i32.const 4581056
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm42r
  global.get $input/idm42r
  f64.const 19
  i32.const 4581088
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm42r
  f64.const 61
  i32.const 4581088
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm42r
  f64.const 18
  i32.const 4581088
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm42r
  f64.const 62
  i32.const 4581088
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm42r
  f64.const 63
  i32.const 4581088
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym42r
  global.get $input/tym42r
  f64.const 6
  i32.const 4581088
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym42r
  f64.const 3
  i32.const 4581088
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym42r
  f64.const 88
  i32.const 4581088
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym42r
  f64.const 4
  i32.const 4581088
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym42r
  f64.const 0
  i32.const 4581088
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm200r
  global.get $input/idm200r
  f64.const 19
  i32.const 4581120
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 61
  i32.const 4581120
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 18
  i32.const 4581120
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 62
  i32.const 4581120
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 63
  i32.const 4581120
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym200r
  global.get $input/tym200r
  f64.const 6
  i32.const 4581120
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym200r
  f64.const 3
  i32.const 4581120
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym200r
  f64.const 88
  i32.const 4581120
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym200r
  f64.const 4
  i32.const 4581120
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym200r
  f64.const 0
  i32.const 4581120
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym59r
  f64.const 4
  i32.const 4581152
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym59r
  f64.const 6
  i32.const 4581152
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym59r
  f64.const 5
  i32.const 4581152
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym59r
  f64.const 3
  i32.const 4581152
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym59r
  f64.const 2
  i32.const 4581152
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym59r
  f64.const 1
  i32.const 4581152
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym59r
  f64.const 7
  i32.const 4581152
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym59r
  f64.const 0
  i32.const 4581152
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym216r
  f64.const 4
  i32.const 4581184
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym216r
  f64.const 6
  i32.const 4581184
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym216r
  f64.const 5
  i32.const 4581184
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym216r
  f64.const 3
  i32.const 4581184
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym216r
  f64.const 2
  i32.const 4581184
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym216r
  f64.const 1
  i32.const 4581184
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym216r
  f64.const 7
  i32.const 4581184
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym216r
  f64.const 0
  i32.const 4581184
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm323
  f64.const 19
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm323
  f64.const 61
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm323
  f64.const 78
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm323
  f64.const 79
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm323
  f64.const 18
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm323
  f64.const 62
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm323
  f64.const 63
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm323
  f64.const 59
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm323
  f64.const 60
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm323
  f64.const 37
  i32.const 4581344
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm323
  f64.const 54
  i32.const 4581376
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm323
  f64.const 55
  i32.const 4581376
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm323
  f64.const 35
  i32.const 4581408
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym323
  f64.const 3
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym323
  f64.const 7
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym323
  f64.const 6
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym323
  f64.const 5
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm249
  f64.const 19
  i32.const 4581440
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm249
  f64.const 61
  i32.const 4581440
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm249
  f64.const 78
  i32.const 4581440
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm249
  f64.const 79
  i32.const 4581440
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm249
  f64.const 18
  i32.const 4581440
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm249
  f64.const 62
  i32.const 4581440
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm249
  f64.const 63
  i32.const 4581440
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm249
  f64.const 59
  i32.const 4581440
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm249
  f64.const 60
  i32.const 4581440
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm249
  f64.const 37
  i32.const 4581440
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm249
  f64.const 54
  i32.const 4581440
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm249
  f64.const 55
  i32.const 4581440
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm249
  f64.const 35
  i32.const 4581440
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym249
  f64.const 3
  i32.const 4581440
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym249
  f64.const 7
  i32.const 4581440
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym249
  f64.const 6
  i32.const 4581440
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym249
  f64.const 5
  i32.const 4581440
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246
  f64.const 16
  i32.const 4581472
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246
  f64.const 15
  i32.const 4581472
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246
  f64.const 57
  i32.const 4581504
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 54
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 55
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 37
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 19
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 61
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 78
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 79
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 18
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 62
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 63
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 59
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 60
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 31
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 32
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 56
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 39
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 12
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 13
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 36
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym246r
  f64.const 3
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym246r
  f64.const 7
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym246r
  f64.const 6
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym246r
  f64.const 5
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym246r
  f64.const 0
  i32.const 4581536
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm324
  f64.const 54
  i32.const 4581376
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm324
  f64.const 55
  i32.const 4581376
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm324
  f64.const 37
  i32.const 4581568
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm324
  f64.const 19
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm324
  f64.const 61
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm324
  f64.const 78
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm324
  f64.const 79
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm324
  f64.const 18
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm324
  f64.const 62
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm324
  f64.const 63
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm324
  f64.const 59
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm324
  f64.const 60
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm326
  f64.const 54
  i32.const 4581376
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm326
  f64.const 55
  i32.const 4581376
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm326
  f64.const 37
  i32.const 4581568
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm326
  f64.const 19
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm326
  f64.const 61
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm326
  f64.const 78
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm326
  f64.const 79
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm326
  f64.const 18
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm326
  f64.const 62
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm326
  f64.const 63
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm326
  f64.const 59
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm326
  f64.const 60
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm326
  f64.const 36
  i32.const 4581600
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 54
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 57
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 16
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 15
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 55
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 37
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 19
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 61
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 78
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 79
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 18
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 62
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 63
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 59
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 60
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 31
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 32
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 56
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 39
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 12
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 13
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 36
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym308r
  f64.const 3
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym308r
  f64.const 7
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym308r
  f64.const 6
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym308r
  f64.const 5
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym308r
  f64.const 0
  i32.const 4581632
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm309
  f64.const 19
  i32.const 4581664
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm309
  f64.const 61
  i32.const 4581664
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm309
  f64.const 18
  i32.const 4581664
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm309
  f64.const 62
  i32.const 4581664
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm309
  f64.const 63
  i32.const 4581664
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm309
  f64.const 59
  i32.const 4581664
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm309
  f64.const 60
  i32.const 4581664
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm309
  f64.const 39
  i32.const 4581696
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm336r
  f64.const 54
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm336r
  f64.const 55
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm336r
  f64.const 37
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm336r
  f64.const 19
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm336r
  f64.const 61
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm336r
  f64.const 78
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm336r
  f64.const 79
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm336r
  f64.const 18
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm336r
  f64.const 62
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm336r
  f64.const 63
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm336r
  f64.const 59
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm336r
  f64.const 60
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm336r
  f64.const 31
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm336r
  f64.const 32
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm336r
  f64.const 56
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm336r
  f64.const 39
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm336r
  f64.const 12
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm336r
  f64.const 13
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm336r
  f64.const 36
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym336r
  f64.const 3
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym336r
  f64.const 7
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym336r
  f64.const 6
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym336r
  f64.const 5
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym336r
  f64.const 0
  i32.const 4581728
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm358r
  f64.const 54
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm358r
  f64.const 55
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm358r
  f64.const 37
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm358r
  f64.const 19
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm358r
  f64.const 61
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm358r
  f64.const 78
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm358r
  f64.const 79
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm358r
  f64.const 18
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm358r
  f64.const 62
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm358r
  f64.const 63
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm358r
  f64.const 59
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm358r
  f64.const 60
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm358r
  f64.const 31
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm358r
  f64.const 32
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm358r
  f64.const 56
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm358r
  f64.const 39
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm358r
  f64.const 12
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm358r
  f64.const 13
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm358r
  f64.const 36
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym358r
  f64.const 3
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym358r
  f64.const 7
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym358r
  f64.const 6
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym358r
  f64.const 5
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym358r
  f64.const 0
  i32.const 4581760
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 54
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 57
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 16
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 15
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 55
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 37
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 19
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 61
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 78
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 79
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 18
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 62
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 63
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 59
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 60
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 31
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 32
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 56
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 39
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 12
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 13
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 36
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym346r
  f64.const 3
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym346r
  f64.const 7
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym346r
  f64.const 6
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym346r
  f64.const 5
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym346r
  f64.const 0
  i32.const 4581792
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm371r
  f64.const 54
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm371r
  f64.const 57
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm371r
  f64.const 16
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm371r
  f64.const 15
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm371r
  f64.const 55
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm371r
  f64.const 37
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm371r
  f64.const 19
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm371r
  f64.const 61
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm371r
  f64.const 78
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm371r
  f64.const 79
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm371r
  f64.const 18
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm371r
  f64.const 62
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm371r
  f64.const 63
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm371r
  f64.const 59
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm371r
  f64.const 60
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm371r
  f64.const 31
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm371r
  f64.const 32
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm371r
  f64.const 56
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm371r
  f64.const 39
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm371r
  f64.const 12
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm371r
  f64.const 13
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm371r
  f64.const 36
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym371r
  f64.const 3
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym371r
  f64.const 7
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym371r
  f64.const 6
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym371r
  f64.const 5
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym371r
  f64.const 0
  i32.const 4581824
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm232
  f64.const 78
  i32.const 4581856
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm232
  f64.const 79
  i32.const 4581888
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym232
  f64.const 3
  i32.const 4581920
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym232
  f64.const 7
  i32.const 4581952
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 17
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 78
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 79
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 45
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 46
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 33
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 34
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 19
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 61
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 18
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 62
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 63
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 59
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 60
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 39
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 57
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 16
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 15
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 54
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 55
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 37
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 36
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 31
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 32
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 56
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 12
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 13
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm197r
  f64.const 47
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym197r
  f64.const 3
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym197r
  f64.const 7
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym197r
  f64.const 2
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym197r
  f64.const 6
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym197r
  f64.const 6
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym197r
  f64.const 6
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym197r
  f64.const 6
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym197r
  f64.const 88
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym197r
  f64.const 4
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym197r
  f64.const 0
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym197r
  f64.const 5
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym197r
  f64.const 6
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym197r
  f64.const 6
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym197r
  f64.const 1
  i32.const 4581984
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm301
  f64.const 19
  i32.const 4582016
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm301
  f64.const 61
  i32.const 4582016
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm301
  f64.const 78
  i32.const 4582048
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm301
  f64.const 79
  i32.const 4582048
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm301
  f64.const 18
  i32.const 4582080
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm301
  f64.const 62
  i32.const 4582080
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm301
  f64.const 63
  i32.const 4582112
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm301
  f64.const 59
  i32.const 4582144
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm301
  f64.const 60
  i32.const 4582144
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm301
  f64.const 37
  i32.const 4582176
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym301
  f64.const 3
  i32.const 4582048
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym301
  f64.const 7
  i32.const 4582048
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym301
  f64.const 6
  i32.const 4582208
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym301
  f64.const 5
  i32.const 4582240
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm256r
  f64.const 54
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm256r
  f64.const 57
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm256r
  f64.const 16
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm256r
  f64.const 15
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm256r
  f64.const 55
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm256r
  f64.const 37
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm256r
  f64.const 19
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm256r
  f64.const 61
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm256r
  f64.const 78
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm256r
  f64.const 79
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm256r
  f64.const 18
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm256r
  f64.const 62
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm256r
  f64.const 63
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm256r
  f64.const 59
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm256r
  f64.const 60
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm256r
  f64.const 31
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm256r
  f64.const 32
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm256r
  f64.const 56
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm256r
  f64.const 39
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm256r
  f64.const 12
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm256r
  f64.const 13
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm256r
  f64.const 36
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym256r
  f64.const 3
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym256r
  f64.const 7
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym256r
  f64.const 6
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym256r
  f64.const 5
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym256r
  f64.const 0
  i32.const 4582272
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm252r
  f64.const 54
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm252r
  f64.const 57
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm252r
  f64.const 16
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm252r
  f64.const 15
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm252r
  f64.const 55
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm252r
  f64.const 37
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm252r
  f64.const 19
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm252r
  f64.const 61
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm252r
  f64.const 78
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm252r
  f64.const 79
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm252r
  f64.const 18
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm252r
  f64.const 62
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm252r
  f64.const 63
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm252r
  f64.const 59
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm252r
  f64.const 60
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm252r
  f64.const 31
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm252r
  f64.const 32
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm252r
  f64.const 56
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm252r
  f64.const 39
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm252r
  f64.const 12
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm252r
  f64.const 13
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm252r
  f64.const 36
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym252r
  f64.const 3
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym252r
  f64.const 7
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym252r
  f64.const 6
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym252r
  f64.const 5
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym252r
  f64.const 0
  i32.const 4582304
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm243
  f64.const 54
  i32.const 4582336
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm243
  f64.const 55
  i32.const 4582336
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm243
  f64.const 37
  i32.const 4581568
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm243
  f64.const 19
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm243
  f64.const 61
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm243
  f64.const 78
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm243
  f64.const 79
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm243
  f64.const 18
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm243
  f64.const 62
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm243
  f64.const 63
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm243
  f64.const 59
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm243
  f64.const 60
  i32.const 4581312
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm243r
  f64.const 54
  i32.const 4582368
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm243r
  f64.const 55
  i32.const 4582368
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm243r
  f64.const 31
  i32.const 4582368
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm243r
  f64.const 32
  i32.const 4582368
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm243r
  f64.const 56
  i32.const 4582368
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm243r
  f64.const 39
  i32.const 4582368
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm243r
  f64.const 12
  i32.const 4582368
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm243r
  f64.const 13
  i32.const 4582368
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym243r
  f64.const 0
  i32.const 4582368
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm241r
  f64.const 31
  i32.const 4582400
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm241r
  f64.const 32
  i32.const 4582400
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm241r
  f64.const 56
  i32.const 4582400
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm241r
  f64.const 39
  i32.const 4582400
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm241r
  f64.const 12
  i32.const 4582400
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm241r
  f64.const 13
  i32.const 4582400
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm241r
  f64.const 54
  i32.const 4582400
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm241r
  f64.const 55
  i32.const 4582400
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym241r
  f64.const 0
  i32.const 4582400
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm339
  f64.const 31
  i32.const 4580592
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm339
  f64.const 32
  i32.const 4580592
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm339
  f64.const 56
  i32.const 4580464
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm339
  f64.const 39
  i32.const 4582432
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm333r
  f64.const 31
  i32.const 4582464
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm333r
  f64.const 32
  i32.const 4582464
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm333r
  f64.const 56
  i32.const 4582464
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm333r
  f64.const 39
  i32.const 4582464
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm333r
  f64.const 12
  i32.const 4582464
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm333r
  f64.const 13
  i32.const 4582464
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm333r
  f64.const 54
  i32.const 4582464
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm333r
  f64.const 55
  i32.const 4582464
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym333r
  f64.const 0
  i32.const 4582464
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm366r
  f64.const 54
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm366r
  f64.const 57
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm366r
  f64.const 16
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm366r
  f64.const 15
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm366r
  f64.const 55
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm366r
  f64.const 37
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm366r
  f64.const 19
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm366r
  f64.const 61
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm366r
  f64.const 78
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm366r
  f64.const 79
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm366r
  f64.const 18
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm366r
  f64.const 62
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm366r
  f64.const 63
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm366r
  f64.const 59
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm366r
  f64.const 60
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm366r
  f64.const 31
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm366r
  f64.const 32
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm366r
  f64.const 56
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm366r
  f64.const 39
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm366r
  f64.const 12
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm366r
  f64.const 13
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm366r
  f64.const 36
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym366r
  f64.const 3
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym366r
  f64.const 7
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym366r
  f64.const 6
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym366r
  f64.const 5
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym366r
  f64.const 0
  i32.const 4582496
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm92r
  f64.const 39
  i32.const 4582528
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm92r
  f64.const 19
  i32.const 4582528
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm92r
  f64.const 61
  i32.const 4582528
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm92r
  f64.const 18
  i32.const 4582528
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm92r
  f64.const 62
  i32.const 4582528
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm92r
  f64.const 63
  i32.const 4582528
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm92r
  f64.const 59
  i32.const 4582528
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm92r
  f64.const 60
  i32.const 4582528
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym92r
  f64.const 88
  i32.const 4582528
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym92r
  f64.const 0
  i32.const 4582528
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm226r
  f64.const 39
  i32.const 4582560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm226r
  f64.const 19
  i32.const 4582560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm226r
  f64.const 61
  i32.const 4582560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm226r
  f64.const 18
  i32.const 4582560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm226r
  f64.const 62
  i32.const 4582560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm226r
  f64.const 63
  i32.const 4582560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm226r
  f64.const 59
  i32.const 4582560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm226r
  f64.const 60
  i32.const 4582560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym226r
  f64.const 88
  i32.const 4582560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym226r
  f64.const 0
  i32.const 4582560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  local.get $0
  call $~lib/rt/pure/__release
  local.get $4
  call $~lib/rt/pure/__release
  local.get $1
  call $~lib/rt/pure/__release
  local.get $5
  call $~lib/rt/pure/__release
  local.get $2
  call $~lib/rt/pure/__release
  local.get $3
  call $~lib/rt/pure/__release
 )
 (func $input/$sym$ignore_symbol (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner0
   local.get $0
   i32.load offset=4
   i32.const 19
   i32.eq
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load offset=4
    i32.const 61
    i32.eq
   end
   if
    local.get $0
    call $input/$sym$generated_symbol
    global.get $input/FAILED
    i32.eqz
    br_if $folding-inner0
   else
    local.get $0
    i32.load offset=4
    i32.const 18
    i32.eq
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load offset=4
     i32.const 62
     i32.eq
    end
    if
     local.get $0
     call $input/$sym$literal_symbol
     global.get $input/FAILED
     i32.eqz
     br_if $folding-inner0
    else
     local.get $0
     i32.load offset=4
     i32.const 63
     i32.eq
     if
      local.get $0
      call $input/$sym$escaped_symbol
      global.get $input/FAILED
      i32.eqz
      br_if $folding-inner0
     else
      local.get $0
      call $input/_no_check
      global.get $input/FAILED
      i32.eqz
      if
       i32.const 60
       call $input/setProduction
       i32.const 1
       i32.const 54
       call $input/add_reduce
       local.get $0
       call $~lib/rt/pure/__release
       return
      end
     end
    end
   end
   local.get $0
   call $input/fail
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  i32.const 60
  call $input/setProduction
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State97 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const_0_
  call $input/_skip
  local.get $0
  i32.load offset=4
  i32.const 18
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 19
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 61
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 62
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 63
   i32.eq
  end
  if
   local.get $0
   call $input/$sym$ignore_symbol
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
  else
   local.get $0
   i32.load
   if (result i32)
    local.get $0
    i32.load
    i32.const 4
    i32.eq
   else
    i32.const 1
   end
   if
    local.get $0
    call $input/fail
   else
    local.get $0
    call $input/$sym$ignore_symbol
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
   end
  end
  global.get $input/stack_ptr
  local.set $3
  loop $while-continue|0
   local.get $3
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $1
       i32.const 60
       i32.ne
       if
        local.get $1
        i32.const 54
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       call $~lib/rt/pure/__retain
       local.tee $1
       global.get $input/const_0_
       call $input/_skip
       global.get $input/idm228r
       local.get $1
       i32.load offset=4
       f64.convert_i32_s
       call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
       if
        i32.const 1
        global.set $~argumentsLength
        local.get $1
        global.get $input/idm228r
        local.get $1
        i32.load offset=4
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
        local.tee $2
        i32.load
        call_indirect (type $i32_=>_none)
        local.get $2
        call $~lib/rt/pure/__release
       else
        global.get $input/tym228r
        local.get $1
        i32.load
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
        if
         i32.const 1
         global.set $~argumentsLength
         local.get $1
         global.get $input/tym228r
         local.get $1
         i32.load
         f64.convert_i32_s
         call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
         local.tee $2
         i32.load
         call_indirect (type $i32_=>_none)
         local.get $2
         call $~lib/rt/pure/__release
        else
         local.get $1
         call $input/fail
        end
       end
       local.get $1
       call $~lib/rt/pure/__release
       br $break|1
      end
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$sym$ignore_symbols (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const_0_
  call $input/_skip
  local.get $0
  i32.load offset=4
  i32.const 18
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 19
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 61
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 62
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 63
   i32.eq
  end
  if
   local.get $0
   call $input/$sym$ignore_symbol
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
  else
   local.get $0
   i32.load
   if (result i32)
    local.get $0
    i32.load
    i32.const 4
    i32.eq
   else
    i32.const 1
   end
   if
    local.get $0
    call $input/fail
   else
    local.get $0
    call $input/$sym$ignore_symbol
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
   end
  end
  global.get $input/stack_ptr
  local.set $3
  loop $while-continue|0
   local.get $3
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $1
       i32.const 60
       i32.ne
       if
        local.get $1
        i32.const 54
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       call $~lib/rt/pure/__retain
       local.tee $1
       global.get $input/const_0_
       call $input/_skip
       global.get $input/idm98r
       local.get $1
       i32.load offset=4
       f64.convert_i32_s
       call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
       if
        i32.const 1
        global.set $~argumentsLength
        local.get $1
        global.get $input/idm98r
        local.get $1
        i32.load offset=4
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
        local.tee $2
        i32.load
        call_indirect (type $i32_=>_none)
        local.get $2
        call $~lib/rt/pure/__release
       else
        global.get $input/tym98r
        local.get $1
        i32.load
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
        if
         i32.const 1
         global.set $~argumentsLength
         local.get $1
         global.get $input/tym98r
         local.get $1
         i32.load
         f64.convert_i32_s
         call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
         local.tee $2
         i32.load
         call_indirect (type $i32_=>_none)
         local.get $2
         call $~lib/rt/pure/__release
        else
         local.get $1
         call $input/fail
        end
       end
       br $break|1
      end
      local.get $0
      global.get $input/const_0_
      call $input/_skip
      local.get $0
      i32.load
      if (result i32)
       local.get $0
       i32.load
       i32.const 4
       i32.eq
      else
       i32.const 1
      end
      if
       local.get $0
       call $~lib/rt/pure/__release
       return
      end
      i32.const 0
      global.set $~argumentsLength
      local.get $0
      call $input/Lexer#copy@varargs
      local.set $1
      global.get $input/action_ptr
      global.set $input/mark_
      global.get $input/mark_
      local.set $2
      global.get $input/prod
      local.set $4
      global.get $input/stack_ptr
      local.set $5
      local.get $1
      call $input/State97
      global.get $input/FAILED
      if
       local.get $4
       global.set $input/prod
       i32.const 0
       global.set $input/FAILED
       local.get $5
       global.set $input/stack_ptr
       local.get $2
       global.set $input/action_ptr
       local.get $0
       call $~lib/rt/pure/__release
       local.get $1
       call $~lib/rt/pure/__release
       return
      else
       local.get $0
       local.get $1
       call $input/Lexer#sync
      end
      br $break|1
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    local.get $1
    call $~lib/rt/pure/__release
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$sym$grouped_symbol_group_012_103 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  i32.load
  i32.const 6
  i32.ne
  if
   local.get $0
   i32.load
   drop
  end
  local.get $0
  call $input/_no_check
  global.get $input/FAILED
  i32.eqz
  if
   i32.const 57
   call $input/setProduction
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  local.get $0
  call $input/fail
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State202 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  call $input/fail
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State100 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  i32.load
  i32.const 3
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 6
   i32.eq
  end
  if
   local.get $0
   call $input/$sym$grouped_symbol_group_012_103
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
  else
   local.get $0
   i32.load
   if (result i32)
    local.get $0
    i32.load
    i32.const 1
    i32.eq
   else
    i32.const 1
   end
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load
    i32.const 4
    i32.eq
   end
   if
    local.get $0
    call $input/fail
   else
    local.get $0
    call $input/$sym$grouped_symbol_group_012_103
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
   end
  end
  global.get $input/stack_ptr
  local.set $1
  loop $while-continue|0
   local.get $1
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $2
       i32.const 57
       i32.ne
       if
        local.get $2
        i32.const 59
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       call $input/State202
       br $break|1
      end
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$sym$grouped_symbol (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  i32.load
  i32.const 3
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 6
   i32.eq
  end
  if
   local.get $0
   call $input/$sym$grouped_symbol_group_012_103
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
  else
   local.get $0
   i32.load
   if (result i32)
    local.get $0
    i32.load
    i32.const 1
    i32.eq
   else
    i32.const 1
   end
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load
    i32.const 4
    i32.eq
   end
   if
    local.get $0
    call $input/fail
   else
    local.get $0
    call $input/$sym$grouped_symbol_group_012_103
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
   end
  end
  global.get $input/stack_ptr
  local.set $2
  loop $while-continue|0
   local.get $2
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $1
       i32.const 59
       i32.ne
       if
        local.get $1
        i32.const 57
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       i32.load
       if (result i32)
        local.get $0
        i32.load
        i32.const 1
        i32.eq
       else
        i32.const 1
       end
       if (result i32)
        i32.const 1
       else
        local.get $0
        i32.load
        i32.const 4
        i32.eq
       end
       if
        local.get $0
        call $~lib/rt/pure/__release
        return
       end
       i32.const 0
       global.set $~argumentsLength
       local.get $0
       call $input/Lexer#copy@varargs
       local.set $1
       global.get $input/action_ptr
       global.set $input/mark_
       global.get $input/mark_
       local.set $3
       global.get $input/prod
       local.set $4
       global.get $input/stack_ptr
       local.set $5
       local.get $1
       call $input/State100
       global.get $input/FAILED
       if
        local.get $4
        global.set $input/prod
        i32.const 0
        global.set $input/FAILED
        local.get $5
        global.set $input/stack_ptr
        local.get $3
        global.set $input/action_ptr
        local.get $0
        call $~lib/rt/pure/__release
        local.get $1
        call $~lib/rt/pure/__release
        return
       else
        local.get $0
        local.get $1
        call $input/Lexer#sync
       end
       local.get $1
       call $~lib/rt/pure/__release
       br $break|1
      end
      local.get $0
      call $input/State202
      br $break|1
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$sym$lexer_symbol (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner0
   local.get $0
   i32.load offset=4
   i32.const 19
   i32.eq
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load offset=4
    i32.const 61
    i32.eq
   end
   if
    local.get $0
    call $input/$sym$generated_symbol
    global.get $input/FAILED
    i32.eqz
    br_if $folding-inner0
   else
    local.get $0
    i32.load offset=4
    i32.const 18
    i32.eq
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load offset=4
     i32.const 62
     i32.eq
    end
    if
     local.get $0
     call $input/$sym$literal_symbol
     global.get $input/FAILED
     i32.eqz
     br_if $folding-inner0
    else
     local.get $0
     i32.load offset=4
     i32.const 63
     i32.eq
     if
      local.get $0
      call $input/$sym$escaped_symbol
      global.get $input/FAILED
      i32.eqz
      br_if $folding-inner0
     else
      local.get $0
      call $input/$sym$grouped_symbol
      global.get $input/FAILED
      i32.eqz
      if
       block $__inlined_func$input/$sym$grouped_delimiter
        block $folding-inner00
         local.get $0
         call $~lib/rt/pure/__retain
         local.tee $1
         i32.load
         i32.const 4
         i32.eq
         if
          local.get $1
          call $input/_no_check
          global.get $input/FAILED
          i32.eqz
          br_if $folding-inner00
         else
          local.get $1
          i32.load
          i32.const 1
          i32.eq
          if
           local.get $1
           call $input/_no_check
           global.get $input/FAILED
           i32.eqz
           br_if $folding-inner00
          end
         end
         local.get $1
         call $input/fail
         br $__inlined_func$input/$sym$grouped_delimiter
        end
        i32.const 56
        call $input/setProduction
       end
       local.get $1
       call $~lib/rt/pure/__release
       global.get $input/FAILED
       i32.eqz
       if
        i32.const 55
        call $input/setProduction
        i32.const 2
        i32.const 54
        call $input/add_reduce
        local.get $0
        call $~lib/rt/pure/__release
        return
       end
      end
     end
    end
   end
   local.get $0
   call $input/fail
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  i32.const 55
  call $input/setProduction
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State41 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const_0_
  call $input/_skip
  local.get $0
  i32.load offset=4
  i32.const 18
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 19
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 61
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 62
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 63
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 3
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 6
   i32.eq
  end
  if
   local.get $0
   call $input/$sym$lexer_symbol
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
  else
   local.get $0
   i32.load
   if (result i32)
    local.get $0
    i32.load
    i32.const 4
    i32.eq
   else
    i32.const 1
   end
   if
    local.get $0
    call $input/fail
   else
    local.get $0
    call $input/$sym$lexer_symbol
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
   end
  end
  global.get $input/stack_ptr
  local.set $3
  loop $while-continue|0
   local.get $3
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $1
       i32.const 55
       i32.ne
       if
        local.get $1
        i32.const 5
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       call $~lib/rt/pure/__retain
       local.tee $1
       global.get $input/const_0_
       call $input/_skip
       global.get $input/idm200r
       local.get $1
       i32.load offset=4
       f64.convert_i32_s
       call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
       if
        i32.const 1
        global.set $~argumentsLength
        local.get $1
        global.get $input/idm200r
        local.get $1
        i32.load offset=4
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
        local.tee $2
        i32.load
        call_indirect (type $i32_=>_none)
        local.get $2
        call $~lib/rt/pure/__release
       else
        global.get $input/tym200r
        local.get $1
        i32.load
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
        if
         i32.const 1
         global.set $~argumentsLength
         local.get $1
         global.get $input/tym200r
         local.get $1
         i32.load
         f64.convert_i32_s
         call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
         local.tee $2
         i32.load
         call_indirect (type $i32_=>_none)
         local.get $2
         call $~lib/rt/pure/__release
        else
         local.get $1
         call $input/fail
        end
       end
       local.get $1
       call $~lib/rt/pure/__release
       br $break|1
      end
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$pre$symbols_preamble_HC_listbody2_101 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const_0_
  call $input/_skip
  local.get $0
  i32.load offset=4
  i32.const 18
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 19
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 61
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 62
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 63
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 3
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 6
   i32.eq
  end
  if
   local.get $0
   call $input/$sym$lexer_symbol
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
  else
   local.get $0
   i32.load
   if (result i32)
    local.get $0
    i32.load
    i32.const 4
    i32.eq
   else
    i32.const 1
   end
   if
    local.get $0
    call $input/fail
   else
    local.get $0
    call $input/$sym$lexer_symbol
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
   end
  end
  global.get $input/stack_ptr
  local.set $3
  loop $while-continue|0
   local.get $3
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $1
       i32.const 55
       i32.ne
       if
        local.get $1
        i32.const 5
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       call $~lib/rt/pure/__retain
       local.tee $1
       global.get $input/const_0_
       call $input/_skip
       global.get $input/idm42r
       local.get $1
       i32.load offset=4
       f64.convert_i32_s
       call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
       if
        i32.const 1
        global.set $~argumentsLength
        local.get $1
        global.get $input/idm42r
        local.get $1
        i32.load offset=4
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
        local.tee $2
        i32.load
        call_indirect (type $i32_=>_none)
        local.get $2
        call $~lib/rt/pure/__release
       else
        global.get $input/tym42r
        local.get $1
        i32.load
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
        if
         i32.const 1
         global.set $~argumentsLength
         local.get $1
         global.get $input/tym42r
         local.get $1
         i32.load
         f64.convert_i32_s
         call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
         local.tee $2
         i32.load
         call_indirect (type $i32_=>_none)
         local.get $2
         call $~lib/rt/pure/__release
        else
         local.get $1
         call $input/fail
        end
       end
       br $break|1
      end
      local.get $0
      global.get $input/const_0_
      call $input/_skip
      local.get $0
      i32.load
      if (result i32)
       local.get $0
       i32.load
       i32.const 4
       i32.eq
      else
       i32.const 1
      end
      if
       local.get $0
       call $~lib/rt/pure/__release
       return
      end
      i32.const 0
      global.set $~argumentsLength
      local.get $0
      call $input/Lexer#copy@varargs
      local.set $1
      global.get $input/action_ptr
      global.set $input/mark_
      global.get $input/mark_
      local.set $2
      global.get $input/prod
      local.set $4
      global.get $input/stack_ptr
      local.set $5
      local.get $1
      call $input/State41
      global.get $input/FAILED
      if
       local.get $4
       global.set $input/prod
       i32.const 0
       global.set $input/FAILED
       local.get $5
       global.set $input/stack_ptr
       local.get $2
       global.set $input/action_ptr
       local.get $0
       call $~lib/rt/pure/__release
       local.get $1
       call $~lib/rt/pure/__release
       return
      else
       local.get $0
       local.get $1
       call $input/Lexer#sync
      end
      br $break|1
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    local.get $1
    call $~lib/rt/pure/__release
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$pre$import_preamble_group_019_103 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner0
   local.get $0
   i32.load
   i32.const 3
   i32.eq
   if
    local.get $0
    call $input/_no_check
    global.get $input/FAILED
    i32.eqz
    br_if $folding-inner0
   else
    local.get $0
    i32.load
    i32.const 7
    i32.eq
    if
     local.get $0
     call $input/_no_check
     global.get $input/FAILED
     i32.eqz
     br_if $folding-inner0
    else
     local.get $0
     i32.load
     i32.const 6
     i32.eq
     if
      local.get $0
      call $input/_no_check
      global.get $input/FAILED
      i32.eqz
      br_if $folding-inner0
     else
      local.get $0
      i32.load
      i32.const 5
      i32.eq
      if
       local.get $0
       call $input/_no_check
       global.get $input/FAILED
       i32.eqz
       br_if $folding-inner0
      end
     end
    end
   end
   local.get $0
   call $input/fail
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  i32.const 13
  call $input/setProduction
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State4 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const_1_
  call $input/_skip
  local.get $0
  i32.load
  i32.const 3
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 5
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 6
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 7
   i32.eq
  end
  if
   local.get $0
   call $input/$pre$import_preamble_group_019_103
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
  else
   local.get $0
   call $input/fail
  end
  global.get $input/stack_ptr
  local.set $2
  loop $while-continue|0
   local.get $2
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $1
       i32.const 13
       i32.ne
       if
        local.get $1
        i32.const 14
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       call $~lib/rt/pure/__retain
       local.tee $1
       global.get $input/const_1_
       call $input/_skip
       local.get $1
       i32.load
       if (result i32)
        local.get $1
        i32.load
        i32.const 1
        i32.eq
       else
        i32.const 1
       end
       if (result i32)
        i32.const 1
       else
        local.get $1
        i32.load
        i32.const 3
        i32.eq
       end
       if (result i32)
        i32.const 1
       else
        local.get $1
        i32.load
        i32.const 5
        i32.eq
       end
       if (result i32)
        i32.const 1
       else
        local.get $1
        i32.load
        i32.const 6
        i32.eq
       end
       if (result i32)
        i32.const 1
       else
        local.get $1
        i32.load
        i32.const 7
        i32.eq
       end
       if
        i32.const 2
        i32.const 12
        call $input/add_reduce
        i32.const 14
        global.set $input/prod
        global.get $input/stack_ptr
        i32.const 2
        i32.sub
        global.set $input/stack_ptr
       else
        local.get $1
        call $input/fail
       end
       local.get $1
       call $~lib/rt/pure/__release
       br $break|1
      end
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$pre$import_preamble_HC_listbody1_104 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const_1_
  call $input/_skip
  local.get $0
  i32.load
  i32.const 3
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 5
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 6
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 7
   i32.eq
  end
  if
   local.get $0
   call $input/$pre$import_preamble_group_019_103
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
  else
   local.get $0
   call $input/fail
  end
  global.get $input/stack_ptr
  local.set $2
  loop $while-continue|0
   local.get $2
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $1
       i32.const 14
       i32.ne
       if
        local.get $1
        i32.const 13
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       global.get $input/const_1_
       call $input/_skip
       local.get $0
       i32.load
       if (result i32)
        local.get $0
        i32.load
        i32.const 1
        i32.eq
       else
        i32.const 1
       end
       if
        local.get $0
        call $~lib/rt/pure/__release
        return
       end
       i32.const 0
       global.set $~argumentsLength
       local.get $0
       call $input/Lexer#copy@varargs
       local.set $1
       global.get $input/action_ptr
       global.set $input/mark_
       global.get $input/mark_
       local.set $3
       global.get $input/prod
       local.set $4
       global.get $input/stack_ptr
       local.set $5
       local.get $1
       call $input/State4
       global.get $input/FAILED
       if
        local.get $4
        global.set $input/prod
        i32.const 0
        global.set $input/FAILED
        local.get $5
        global.set $input/stack_ptr
        local.get $3
        global.set $input/action_ptr
        local.get $0
        call $~lib/rt/pure/__release
        local.get $1
        call $~lib/rt/pure/__release
        return
       else
        local.get $0
        local.get $1
        call $input/Lexer#sync
       end
       br $break|1
      end
      local.get $0
      call $~lib/rt/pure/__retain
      local.tee $1
      global.get $input/const_1_
      call $input/_skip
      local.get $1
      i32.load
      if (result i32)
       local.get $1
       i32.load
       i32.const 1
       i32.eq
      else
       i32.const 1
      end
      if (result i32)
       i32.const 1
      else
       local.get $1
       i32.load
       i32.const 3
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $1
       i32.load
       i32.const 5
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $1
       i32.load
       i32.const 6
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $1
       i32.load
       i32.const 7
       i32.eq
      end
      if
       i32.const 1
       i32.const 13
       call $input/add_reduce
       i32.const 14
       global.set $input/prod
       global.get $input/stack_ptr
       i32.const 1
       i32.sub
       global.set $input/stack_ptr
      else
       local.get $1
       call $input/fail
      end
      br $break|1
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    local.get $1
    call $~lib/rt/pure/__release
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$pre$import_preamble_HC_listbody4_105 (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $1
  global.get $input/const_1_
  call $input/_skip
  local.get $1
  i32.load
  i32.const 1
  i32.eq
  if
   local.get $1
   call $input/_no_check
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
   local.get $1
   call $~lib/rt/pure/__retain
   local.tee $0
   global.get $input/const_1_
   call $input/_skip
   local.get $0
   i32.load offset=4
   i32.const 28
   i32.eq
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load offset=4
    i32.const 29
    i32.eq
   end
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load
    i32.eqz
   end
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load
    i32.const 1
    i32.eq
   end
   if
    i32.const 1
    i32.const 5
    call $input/add_reduce
    i32.const 15
    global.set $input/prod
    global.get $input/stack_ptr
    i32.const 1
    i32.sub
    global.set $input/stack_ptr
   else
    local.get $0
    call $input/fail
   end
   local.get $0
   call $~lib/rt/pure/__release
  else
   local.get $1
   call $input/fail
  end
  local.get $1
  call $~lib/rt/pure/__release
 )
 (func $input/$pre$import_preamble_group_021_106 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner0
   local.get $0
   i32.load offset=4
   i32.const 28
   i32.eq
   if
    local.get $0
    call $input/_no_check
    global.get $input/FAILED
    i32.eqz
    br_if $folding-inner0
   else
    local.get $0
    i32.load offset=4
    i32.const 29
    i32.eq
    if
     local.get $0
     call $input/_no_check
     global.get $input/FAILED
     i32.eqz
     br_if $folding-inner0
    end
   end
   local.get $0
   call $input/fail
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  i32.const 16
  call $input/setProduction
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$pre$import_preamble (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  call $input/_no_check
  local.get $0
  global.get $input/const_1_
  i32.const 30
  call $input/_with_skip
  local.get $0
  global.get $input/const_1_
  call $input/_skip
  local.get $0
  i32.load
  i32.const 1
  i32.eq
  if
   local.get $0
   call $~lib/rt/pure/__retain
   local.tee $2
   global.get $input/const_1_
   call $input/_skip
   local.get $2
   i32.load
   i32.const 1
   i32.eq
   if
    local.get $2
    call $input/_no_check
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
    local.get $2
    call $~lib/rt/pure/__retain
    local.tee $1
    global.get $input/const_1_
    call $input/_skip
    local.get $1
    i32.load
    if (result i32)
     local.get $1
     i32.load
     i32.const 1
     i32.eq
    else
     i32.const 1
    end
    if (result i32)
     i32.const 1
    else
     local.get $1
     i32.load
     i32.const 3
     i32.eq
    end
    if (result i32)
     i32.const 1
    else
     local.get $1
     i32.load
     i32.const 5
     i32.eq
    end
    if (result i32)
     i32.const 1
    else
     local.get $1
     i32.load
     i32.const 6
     i32.eq
    end
    if (result i32)
     i32.const 1
    else
     local.get $1
     i32.load
     i32.const 7
     i32.eq
    end
    if
     i32.const 1
     i32.const 5
     call $input/add_reduce
     i32.const 12
     global.set $input/prod
     global.get $input/stack_ptr
     i32.const 1
     i32.sub
     global.set $input/stack_ptr
    else
     local.get $1
     call $input/fail
    end
    local.get $1
    call $~lib/rt/pure/__release
   else
    local.get $2
    call $input/fail
   end
   local.get $2
   call $~lib/rt/pure/__release
   global.get $input/FAILED
   i32.eqz
   if
    local.get $0
    call $input/$pre$import_preamble_HC_listbody1_104
    global.get $input/FAILED
    i32.eqz
    if
     local.get $0
     call $input/$pre$import_preamble_HC_listbody4_105
     global.get $input/FAILED
     i32.eqz
     if
      local.get $0
      call $input/$pre$import_preamble_group_021_106
      global.get $input/FAILED
      i32.eqz
      if
       local.get $0
       call $input/$sym$identifier
       global.get $input/FAILED
       i32.eqz
       if
        local.get $0
        global.get $input/const__
        i32.const 4
        call $input/_with_skip
        global.get $input/FAILED
        i32.eqz
        if
         i32.const 17
         call $input/setProduction
         i32.const 8
         i32.const 14
         call $input/add_reduce
         local.get $0
         call $~lib/rt/pure/__release
         return
        end
       end
      end
     end
    end
   end
  else
   local.get $0
   i32.load
   i32.const 3
   i32.eq
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load
    i32.const 5
    i32.eq
   end
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load
    i32.const 6
    i32.eq
   end
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load
    i32.const 7
    i32.eq
   end
   if
    local.get $0
    call $input/$pre$import_preamble_HC_listbody1_104
    global.get $input/FAILED
    i32.eqz
    if
     local.get $0
     call $input/$pre$import_preamble_HC_listbody4_105
     global.get $input/FAILED
     i32.eqz
     if
      local.get $0
      call $input/$pre$import_preamble_group_021_106
      global.get $input/FAILED
      i32.eqz
      if
       local.get $0
       call $input/$sym$identifier
       global.get $input/FAILED
       i32.eqz
       if
        local.get $0
        global.get $input/const__
        i32.const 4
        call $input/_with_skip
        global.get $input/FAILED
        i32.eqz
        if
         i32.const 17
         call $input/setProduction
         i32.const 7
         i32.const 14
         call $input/add_reduce
         local.get $0
         call $~lib/rt/pure/__release
         return
        end
       end
      end
     end
    end
   end
  end
  local.get $0
  call $input/fail
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$pre$preamble_clause (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner0
   local.get $0
   i32.load offset=4
   i32.const 21
   i32.eq
   if
    i32.const 0
    global.set $~argumentsLength
    local.get $0
    call $input/Lexer#copy@varargs
    local.tee $3
    global.get $input/const__
    call $input/_pk
    local.set $2
    global.get $input/FAILED
    if (result i32)
     i32.const 0
    else
     local.get $2
     i32.load offset=4
     i32.const 24
     i32.eq
    end
    if
     local.get $0
     call $~lib/rt/pure/__retain
     local.tee $1
     global.get $input/const__
     call $input/_skip
     local.get $1
     global.get $input/const__
     i32.const 21
     call $input/_with_skip
     block $__inlined_func$input/$pre$ignore_preamble
      global.get $input/FAILED
      i32.eqz
      if
       local.get $1
       global.get $input/const__
       i32.const 24
       call $input/_with_skip
       global.get $input/FAILED
       i32.eqz
       if
        local.get $1
        call $input/$sym$ignore_symbols
        global.get $input/FAILED
        i32.eqz
        if
         local.get $1
         global.get $input/const__
         i32.const 4
         call $input/_with_skip
         global.get $input/FAILED
         i32.eqz
         if
          i32.const 8
          call $input/setProduction
          i32.const 4
          i32.const 8
          call $input/add_reduce
          br $__inlined_func$input/$pre$ignore_preamble
         end
        end
       end
      end
      local.get $1
      call $input/fail
     end
     local.get $1
     call $~lib/rt/pure/__release
     global.get $input/FAILED
     i32.eqz
     br_if $folding-inner0
    else
     global.get $input/FAILED
     if (result i32)
      i32.const 0
     else
      local.get $2
      i32.load offset=4
      i32.const 22
      i32.eq
     end
     if
      local.get $0
      call $~lib/rt/pure/__retain
      local.tee $1
      global.get $input/const__
      call $input/_skip
      local.get $1
      global.get $input/const__
      i32.const 21
      call $input/_with_skip
      block $__inlined_func$input/$pre$symbols_preamble
       global.get $input/FAILED
       i32.eqz
       if
        local.get $1
        global.get $input/const__
        i32.const 22
        call $input/_with_skip
        global.get $input/FAILED
        i32.eqz
        if
         local.get $1
         call $input/$pre$symbols_preamble_HC_listbody2_101
         global.get $input/FAILED
         i32.eqz
         if
          local.get $1
          global.get $input/const__
          i32.const 4
          call $input/_with_skip
          global.get $input/FAILED
          i32.eqz
          if
           i32.const 6
           call $input/setProduction
           i32.const 4
           i32.const 6
           call $input/add_reduce
           br $__inlined_func$input/$pre$symbols_preamble
          end
         end
        end
       end
       local.get $1
       call $input/fail
      end
      local.get $1
      call $~lib/rt/pure/__release
      global.get $input/FAILED
      i32.eqz
      br_if $folding-inner0
     else
      global.get $input/FAILED
      if (result i32)
       i32.const 0
      else
       local.get $2
       i32.load offset=4
       i32.const 23
       i32.eq
      end
      if
       local.get $0
       call $~lib/rt/pure/__retain
       local.tee $1
       global.get $input/const__
       call $input/_skip
       local.get $1
       global.get $input/const__
       i32.const 21
       call $input/_with_skip
       block $__inlined_func$input/$pre$precedence_preamble
        global.get $input/FAILED
        i32.eqz
        if
         local.get $1
         global.get $input/const__
         i32.const 23
         call $input/_with_skip
         global.get $input/FAILED
         i32.eqz
         if
          local.get $1
          call $input/$sym$terminal_symbol
          global.get $input/FAILED
          i32.eqz
          if
           local.get $1
           global.get $input/const_0_
           i32.const 2
           call $input/_with_skip
           global.get $input/FAILED
           i32.eqz
           if
            local.get $1
            global.get $input/const__
            i32.const 4
            call $input/_with_skip
            global.get $input/FAILED
            i32.eqz
            if
             i32.const 7
             call $input/setProduction
             i32.const 5
             i32.const 7
             call $input/add_reduce
             br $__inlined_func$input/$pre$precedence_preamble
            end
           end
          end
         end
        end
        local.get $1
        call $input/fail
       end
       local.get $1
       call $~lib/rt/pure/__release
       global.get $input/FAILED
       i32.eqz
       br_if $folding-inner0
      else
       global.get $input/FAILED
       if (result i32)
        i32.const 0
       else
        local.get $2
        i32.load offset=4
        i32.const 26
        i32.eq
       end
       if
        local.get $0
        call $~lib/rt/pure/__retain
        local.tee $1
        global.get $input/const__
        call $input/_skip
        local.get $1
        global.get $input/const__
        i32.const 21
        call $input/_with_skip
        block $__inlined_func$input/$pre$name_preamble
         global.get $input/FAILED
         i32.eqz
         if
          local.get $1
          global.get $input/const__
          i32.const 26
          call $input/_with_skip
          global.get $input/FAILED
          i32.eqz
          if
           local.get $1
           call $input/$sym$identifier
           global.get $input/FAILED
           i32.eqz
           if
            local.get $1
            global.get $input/const__
            i32.const 4
            call $input/_with_skip
            global.get $input/FAILED
            i32.eqz
            if
             i32.const 10
             call $input/setProduction
             i32.const 4
             i32.const 10
             call $input/add_reduce
             br $__inlined_func$input/$pre$name_preamble
            end
           end
          end
         end
         local.get $1
         call $input/fail
        end
        local.get $1
        call $~lib/rt/pure/__release
        global.get $input/FAILED
        i32.eqz
        br_if $folding-inner0
       else
        global.get $input/FAILED
        if (result i32)
         i32.const 0
        else
         local.get $2
         i32.load offset=4
         i32.const 27
         i32.eq
        end
        if
         local.get $0
         call $~lib/rt/pure/__retain
         local.tee $1
         global.get $input/const__
         call $input/_skip
         local.get $1
         global.get $input/const__
         i32.const 21
         call $input/_with_skip
         block $__inlined_func$input/$pre$ext_preamble
          global.get $input/FAILED
          i32.eqz
          if
           local.get $1
           global.get $input/const__
           i32.const 27
           call $input/_with_skip
           global.get $input/FAILED
           i32.eqz
           if
            local.get $1
            call $input/$sym$identifier
            global.get $input/FAILED
            i32.eqz
            if
             local.get $1
             global.get $input/const__
             i32.const 4
             call $input/_with_skip
             global.get $input/FAILED
             i32.eqz
             if
              i32.const 11
              call $input/setProduction
              i32.const 4
              i32.const 11
              call $input/add_reduce
              br $__inlined_func$input/$pre$ext_preamble
             end
            end
           end
          end
          local.get $1
          call $input/fail
         end
         local.get $1
         call $~lib/rt/pure/__release
         global.get $input/FAILED
         i32.eqz
         br_if $folding-inner0
        else
         global.get $input/FAILED
         if (result i32)
          i32.const 0
         else
          local.get $2
          i32.load offset=4
          i32.const 25
          i32.eq
         end
         if
          local.get $0
          call $~lib/rt/pure/__retain
          local.tee $1
          global.get $input/const__
          call $input/_skip
          local.get $1
          global.get $input/const__
          i32.const 21
          call $input/_with_skip
          block $__inlined_func$input/$pre$error_preamble
           global.get $input/FAILED
           i32.eqz
           if
            local.get $1
            global.get $input/const__
            i32.const 25
            call $input/_with_skip
            global.get $input/FAILED
            i32.eqz
            if
             local.get $1
             call $input/$sym$ignore_symbols
             global.get $input/FAILED
             i32.eqz
             if
              local.get $1
              global.get $input/const__
              i32.const 4
              call $input/_with_skip
              global.get $input/FAILED
              i32.eqz
              if
               i32.const 9
               call $input/setProduction
               i32.const 4
               i32.const 9
               call $input/add_reduce
               br $__inlined_func$input/$pre$error_preamble
              end
             end
            end
           end
           local.get $1
           call $input/fail
          end
          local.get $1
          call $~lib/rt/pure/__release
          global.get $input/FAILED
          i32.eqz
          br_if $folding-inner0
         else
          global.get $input/FAILED
          if (result i32)
           i32.const 0
          else
           local.get $2
           i32.load offset=4
           i32.const 30
           i32.eq
          end
          if
           local.get $0
           call $input/$pre$import_preamble
           global.get $input/FAILED
           i32.eqz
           br_if $folding-inner0
          end
         end
        end
       end
      end
     end
    end
    local.get $3
    call $~lib/rt/pure/__release
    local.get $2
    call $~lib/rt/pure/__release
   else
    local.get $0
    i32.load offset=4
    i32.const 56
    i32.eq
    if
     local.get $0
     call $input/$cm$comment
     global.get $input/FAILED
     i32.eqz
     if
      i32.const 4
      call $input/setProduction
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
    end
   end
   local.get $0
   call $input/fail
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  i32.const 4
  call $input/setProduction
  local.get $0
  call $~lib/rt/pure/__release
  local.get $3
  call $~lib/rt/pure/__release
  local.get $2
  call $~lib/rt/pure/__release
 )
 (func $input/State28 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  i32.load offset=4
  i32.const 21
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 56
   i32.eq
  end
  if
   local.get $0
   call $input/$pre$preamble_clause
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
  else
   local.get $0
   call $input/fail
  end
  global.get $input/stack_ptr
  local.set $3
  loop $while-continue|0
   local.get $3
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $1
       i32.const 4
       i32.ne
       if
        local.get $1
        i32.const 3
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       call $~lib/rt/pure/__retain
       local.tee $1
       global.get $input/const__
       call $input/_skip
       global.get $input/idm181r
       local.get $1
       i32.load offset=4
       f64.convert_i32_s
       call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
       if
        i32.const 1
        global.set $~argumentsLength
        local.get $1
        global.get $input/idm181r
        local.get $1
        i32.load offset=4
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
        local.tee $2
        i32.load
        call_indirect (type $i32_=>_none)
        local.get $2
        call $~lib/rt/pure/__release
       else
        global.get $input/tym181r
        local.get $1
        i32.load
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
        if
         i32.const 1
         global.set $~argumentsLength
         local.get $1
         global.get $input/tym181r
         local.get $1
         i32.load
         f64.convert_i32_s
         call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
         local.tee $2
         i32.load
         call_indirect (type $i32_=>_none)
         local.get $2
         call $~lib/rt/pure/__release
        else
         local.get $1
         call $input/fail
        end
       end
       local.get $1
       call $~lib/rt/pure/__release
       br $break|1
      end
      local.get $0
      call $~lib/rt/pure/__release
      return
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$pre$preamble (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  i32.load offset=4
  i32.const 21
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 56
   i32.eq
  end
  if
   local.get $0
   call $input/$pre$preamble_clause
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
  else
   local.get $0
   call $input/fail
  end
  global.get $input/stack_ptr
  local.set $3
  loop $while-continue|0
   local.get $3
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $1
       i32.const 4
       i32.ne
       if
        local.get $1
        i32.const 3
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       call $~lib/rt/pure/__retain
       local.tee $1
       global.get $input/const__
       call $input/_skip
       global.get $input/idm29r
       local.get $1
       i32.load offset=4
       f64.convert_i32_s
       call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
       if
        i32.const 1
        global.set $~argumentsLength
        local.get $1
        global.get $input/idm29r
        local.get $1
        i32.load offset=4
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
        local.tee $2
        i32.load
        call_indirect (type $i32_=>_none)
        local.get $2
        call $~lib/rt/pure/__release
       else
        global.get $input/tym29r
        local.get $1
        i32.load
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
        if
         i32.const 1
         global.set $~argumentsLength
         local.get $1
         global.get $input/tym29r
         local.get $1
         i32.load
         f64.convert_i32_s
         call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
         local.tee $2
         i32.load
         call_indirect (type $i32_=>_none)
         local.get $2
         call $~lib/rt/pure/__release
        else
         local.get $1
         call $input/fail
        end
       end
       br $break|1
      end
      local.get $0
      global.get $input/const__
      call $input/_skip
      local.get $0
      i32.load offset=4
      i32.const 12
      i32.eq
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 13
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 20
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 54
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 55
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load
       i32.eqz
      end
      if
       local.get $0
       call $~lib/rt/pure/__release
       return
      end
      i32.const 0
      global.set $~argumentsLength
      local.get $0
      call $input/Lexer#copy@varargs
      local.set $1
      global.get $input/action_ptr
      global.set $input/mark_
      global.get $input/mark_
      local.set $2
      global.get $input/prod
      local.set $4
      global.get $input/stack_ptr
      local.set $5
      local.get $1
      call $input/State28
      global.get $input/FAILED
      if
       local.get $4
       global.set $input/prod
       i32.const 0
       global.set $input/FAILED
       local.get $5
       global.set $input/stack_ptr
       local.get $2
       global.set $input/action_ptr
       local.get $0
       call $~lib/rt/pure/__release
       local.get $1
       call $~lib/rt/pure/__release
       return
      else
       local.get $0
       local.get $1
       call $input/Lexer#sync
      end
      br $break|1
     end
     local.get $0
     call $input/fail
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
    local.get $1
    call $~lib/rt/pure/__release
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State33 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $1
  global.get $input/const__
  call $input/_skip
  global.get $input/idm33
  local.get $1
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $1
   global.get $input/idm33
   local.get $1
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $0
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $0
   call $~lib/rt/pure/__release
  else
   local.get $1
   call $input/fail
  end
  global.get $input/stack_ptr
  local.set $2
  loop $while-continue|0
   local.get $2
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case4|1
      block $case3|1
       block $case2|1
        block $case1|1
         global.get $input/prod
         local.tee $0
         i32.const 44
         i32.ne
         if
          local.get $0
          i32.const 34
          i32.eq
          br_if $case1|1
          local.get $0
          i32.const 24
          i32.eq
          br_if $case2|1
          local.get $0
          i32.const 19
          i32.eq
          br_if $case3|1
          br $case4|1
         end
         local.get $1
         call $~lib/rt/pure/__retain
         local.tee $0
         global.get $input/const__
         call $input/_skip
         local.get $0
         i32.load offset=4
         i32.const 12
         i32.eq
         if (result i32)
          i32.const 1
         else
          local.get $0
          i32.load offset=4
          i32.const 13
          i32.eq
         end
         if (result i32)
          i32.const 1
         else
          local.get $0
          i32.load offset=4
          i32.const 54
          i32.eq
         end
         if (result i32)
          i32.const 1
         else
          local.get $0
          i32.load offset=4
          i32.const 55
          i32.eq
         end
         if (result i32)
          i32.const 1
         else
          local.get $0
          i32.load offset=4
          i32.const 56
          i32.eq
         end
         if (result i32)
          i32.const 1
         else
          local.get $0
          i32.load
          i32.eqz
         end
         if
          i32.const 2
          i32.const 1
          call $input/add_reduce
          i32.const 19
          global.set $input/prod
          global.get $input/stack_ptr
          i32.const 2
          i32.sub
          global.set $input/stack_ptr
         else
          local.get $0
          call $input/fail
         end
         br $break|1
        end
        local.get $1
        call $~lib/rt/pure/__retain
        local.tee $0
        global.get $input/const__
        call $input/_skip
        local.get $0
        i32.load offset=4
        i32.const 12
        i32.eq
        if (result i32)
         i32.const 1
        else
         local.get $0
         i32.load offset=4
         i32.const 13
         i32.eq
        end
        if (result i32)
         i32.const 1
        else
         local.get $0
         i32.load offset=4
         i32.const 54
         i32.eq
        end
        if (result i32)
         i32.const 1
        else
         local.get $0
         i32.load offset=4
         i32.const 55
         i32.eq
        end
        if (result i32)
         i32.const 1
        else
         local.get $0
         i32.load offset=4
         i32.const 56
         i32.eq
        end
        if (result i32)
         i32.const 1
        else
         local.get $0
         i32.load
         i32.eqz
        end
        if
         i32.const 2
         i32.const 18
         call $input/add_reduce
         i32.const 19
         global.set $input/prod
         global.get $input/stack_ptr
         i32.const 2
         i32.sub
         global.set $input/stack_ptr
        else
         local.get $0
         call $input/fail
        end
        br $break|1
       end
       local.get $1
       call $~lib/rt/pure/__retain
       local.tee $0
       global.get $input/const__
       call $input/_skip
       local.get $0
       i32.load offset=4
       i32.const 12
       i32.eq
       if (result i32)
        i32.const 1
       else
        local.get $0
        i32.load offset=4
        i32.const 13
        i32.eq
       end
       if (result i32)
        i32.const 1
       else
        local.get $0
        i32.load offset=4
        i32.const 54
        i32.eq
       end
       if (result i32)
        i32.const 1
       else
        local.get $0
        i32.load offset=4
        i32.const 55
        i32.eq
       end
       if (result i32)
        i32.const 1
       else
        local.get $0
        i32.load offset=4
        i32.const 56
        i32.eq
       end
       if (result i32)
        i32.const 1
       else
        local.get $0
        i32.load
        i32.eqz
       end
       if
        i32.const 2
        i32.const 17
        call $input/add_reduce
        i32.const 19
        global.set $input/prod
        global.get $input/stack_ptr
        i32.const 2
        i32.sub
        global.set $input/stack_ptr
       else
        local.get $0
        call $input/fail
       end
       br $break|1
      end
      local.get $1
      call $~lib/rt/pure/__release
      return
     end
     local.get $1
     call $input/fail
     local.get $1
     call $~lib/rt/pure/__release
     return
    end
    local.get $0
    call $~lib/rt/pure/__release
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $1
  call $~lib/rt/pure/__release
 )
 (func $input/$prd$productions (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $1
  global.get $input/const__
  call $input/_skip
  global.get $input/idm30
  local.get $1
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $1
   global.get $input/idm30
   local.get $1
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
   local.tee $0
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $0
   call $~lib/rt/pure/__release
  else
   local.get $1
   call $input/fail
  end
  global.get $input/stack_ptr
  local.set $2
  loop $while-continue|0
   local.get $2
   global.get $input/stack_ptr
   i32.le_u
   if
    block $break|1
     block $case3|1
      block $case2|1
       block $case1|1
        global.get $input/prod
        local.tee $0
        i32.const 34
        i32.ne
        if
         local.get $0
         i32.const 24
         i32.eq
         br_if $case1|1
         local.get $0
         i32.const 19
         i32.eq
         br_if $case2|1
         br $case3|1
        end
        local.get $1
        call $~lib/rt/pure/__retain
        local.tee $0
        global.get $input/const__
        call $input/_skip
        local.get $0
        i32.load offset=4
        i32.const 12
        i32.eq
        if (result i32)
         i32.const 1
        else
         local.get $0
         i32.load offset=4
         i32.const 13
         i32.eq
        end
        if (result i32)
         i32.const 1
        else
         local.get $0
         i32.load offset=4
         i32.const 54
         i32.eq
        end
        if (result i32)
         i32.const 1
        else
         local.get $0
         i32.load offset=4
         i32.const 55
         i32.eq
        end
        if (result i32)
         i32.const 1
        else
         local.get $0
         i32.load offset=4
         i32.const 56
         i32.eq
        end
        if (result i32)
         i32.const 1
        else
         local.get $0
         i32.load
         i32.eqz
        end
        if
         i32.const 1
         i32.const 16
         call $input/add_reduce
         i32.const 19
         global.set $input/prod
         global.get $input/stack_ptr
         i32.const 1
         i32.sub
         global.set $input/stack_ptr
        else
         local.get $0
         call $input/fail
        end
        br $break|1
       end
       local.get $1
       call $~lib/rt/pure/__retain
       local.tee $0
       global.get $input/const__
       call $input/_skip
       local.get $0
       i32.load offset=4
       i32.const 12
       i32.eq
       if (result i32)
        i32.const 1
       else
        local.get $0
        i32.load offset=4
        i32.const 13
        i32.eq
       end
       if (result i32)
        i32.const 1
       else
        local.get $0
        i32.load offset=4
        i32.const 54
        i32.eq
       end
       if (result i32)
        i32.const 1
       else
        local.get $0
        i32.load offset=4
        i32.const 55
        i32.eq
       end
       if (result i32)
        i32.const 1
       else
        local.get $0
        i32.load offset=4
        i32.const 56
        i32.eq
       end
       if (result i32)
        i32.const 1
       else
        local.get $0
        i32.load
        i32.eqz
       end
       if
        i32.const 1
        i32.const 15
        call $input/add_reduce
        i32.const 19
        global.set $input/prod
        global.get $input/stack_ptr
        i32.const 1
        i32.sub
        global.set $input/stack_ptr
       else
        local.get $0
        call $input/fail
       end
       br $break|1
      end
      local.get $1
      global.get $input/const__
      call $input/_skip
      local.get $1
      i32.load
      i32.eqz
      if
       local.get $1
       call $~lib/rt/pure/__release
       return
      end
      i32.const 0
      global.set $~argumentsLength
      local.get $1
      call $input/Lexer#copy@varargs
      local.set $0
      global.get $input/action_ptr
      global.set $input/mark_
      global.get $input/mark_
      local.set $3
      global.get $input/prod
      local.set $4
      global.get $input/stack_ptr
      local.set $5
      local.get $0
      call $input/State33
      global.get $input/FAILED
      if
       local.get $4
       global.set $input/prod
       i32.const 0
       global.set $input/FAILED
       local.get $5
       global.set $input/stack_ptr
       local.get $3
       global.set $input/action_ptr
       local.get $1
       call $~lib/rt/pure/__release
       local.get $0
       call $~lib/rt/pure/__release
       return
      else
       local.get $1
       local.get $0
       call $input/Lexer#sync
      end
      br $break|1
     end
     local.get $1
     call $input/fail
     local.get $1
     call $~lib/rt/pure/__release
     return
    end
    local.get $0
    call $~lib/rt/pure/__release
    global.get $input/prod
    i32.const 0
    i32.ge_s
    if
     global.get $input/stack_ptr
     i32.const 1
     i32.add
     global.set $input/stack_ptr
    end
    br $while-continue|0
   end
  end
  local.get $1
  call $~lib/rt/pure/__release
 )
 (func $input/$head (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  i32.load offset=4
  i32.const 21
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 56
   i32.eq
  end
  if
   local.get $0
   call $input/$pre$preamble
   global.get $input/FAILED
   i32.eqz
   if
    local.get $0
    call $input/$prd$productions
    global.get $input/FAILED
    i32.eqz
    if
     i32.const 1
     call $input/setProduction
     i32.const 2
     i32.const 2
     call $input/add_reduce
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
   end
  else
   local.get $0
   i32.load offset=4
   i32.const 12
   i32.eq
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load offset=4
    i32.const 13
    i32.eq
   end
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load offset=4
    i32.const 20
    i32.eq
   end
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load offset=4
    i32.const 54
    i32.eq
   end
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load offset=4
    i32.const 55
    i32.eq
   end
   if
    local.get $0
    call $input/$prd$productions
    global.get $input/FAILED
    i32.eqz
    if
     i32.const 1
     call $input/setProduction
     i32.const 1
     i32.const 3
     call $input/add_reduce
     local.get $0
     call $~lib/rt/pure/__release
     return
    end
   end
  end
  local.get $0
  call $input/fail
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/main (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $2
  local.tee $0
  global.get $input/str
  local.tee $1
  i32.ne
  if
   local.get $0
   call $~lib/rt/pure/__retain
   local.set $0
   local.get $1
   call $~lib/rt/pure/__release
  end
  local.get $0
  global.set $input/str
  call $input/Lexer#constructor
  local.tee $0
  call $input/Lexer#next
  call $~lib/rt/pure/__release
  i32.const -1
  global.set $input/prod
  i32.const 0
  global.set $input/stack_ptr
  i32.const 0
  global.set $input/error_ptr
  i32.const 0
  global.set $input/action_ptr
  i32.const 0
  global.set $input/FAILED
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $1
  global.get $input/const__
  call $input/_skip
  local.get $1
  call $input/$head
  block $__inlined_func$input/$hydrocarbon
   global.get $input/FAILED
   i32.eqz
   if
    i32.const 0
    call $input/setProduction
    i32.const 1
    i32.const 1
    call $input/add_reduce
    br $__inlined_func$input/$hydrocarbon
   end
   local.get $1
   call $input/fail
  end
  local.get $1
  call $~lib/rt/pure/__release
  i32.const 0
  call $input/set_action
  i32.const 0
  call $input/set_error
  global.get $input/FAILED
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=12
   global.get $input/str
   i32.const 20
   i32.sub
   i32.load offset=16
   i32.const 1
   i32.shr_u
   i32.lt_s
  end
  local.get $0
  call $~lib/rt/pure/__release
  local.get $2
  call $~lib/rt/pure/__release
 )
 (func $~start
  call $start:input
 )
 (func $~lib/rt/pure/decrement (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  local.get $0
  i32.load offset=4
  local.tee $3
  i32.const 268435455
  i32.and
  local.set $1
  local.get $0
  i32.load
  i32.const 1
  i32.and
  if
   i32.const 0
   i32.const 4579424
   i32.const 122
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $1
  i32.const 1
  i32.eq
  if
   block $__inlined_func$~lib/rt/__visit_members
    block $folding-inner0
     block $switch$1$default
      block $switch$1$case$10
       block $switch$1$case$9
        block $switch$1$case$4
         local.get $0
         i32.const 20
         i32.add
         local.tee $1
         i32.const 8
         i32.sub
         i32.load
         br_table $__inlined_func$~lib/rt/__visit_members $__inlined_func$~lib/rt/__visit_members $switch$1$case$4 $folding-inner0 $__inlined_func$~lib/rt/__visit_members $folding-inner0 $__inlined_func$~lib/rt/__visit_members $switch$1$case$9 $switch$1$case$10 $switch$1$default
        end
        local.get $1
        i32.load
        local.tee $1
        if
         local.get $1
         call $~lib/rt/pure/__visit
        end
        br $__inlined_func$~lib/rt/__visit_members
       end
       local.get $1
       i32.load offset=4
       call $~lib/rt/pure/__visit
       br $__inlined_func$~lib/rt/__visit_members
      end
      local.get $1
      i32.load
      call $~lib/rt/pure/__visit
      local.get $1
      i32.load offset=8
      local.tee $4
      local.tee $2
      local.get $1
      i32.load offset=16
      i32.const 4
      i32.shl
      i32.add
      local.set $1
      loop $while-continue|0
       local.get $1
       local.get $2
       i32.gt_u
       if
        local.get $2
        i32.load offset=12
        i32.const 1
        i32.and
        i32.eqz
        if
         local.get $2
         i32.load offset=8
         call $~lib/rt/pure/__visit
        end
        local.get $2
        i32.const 16
        i32.add
        local.set $2
        br $while-continue|0
       end
      end
      local.get $4
      call $~lib/rt/pure/__visit
      br $__inlined_func$~lib/rt/__visit_members
     end
     unreachable
    end
    local.get $1
    i32.load
    call $~lib/rt/pure/__visit
   end
   local.get $3
   i32.const -2147483648
   i32.and
   if
    i32.const 0
    i32.const 4579424
    i32.const 126
    i32.const 18
    call $~lib/builtins/abort
    unreachable
   end
   global.get $~lib/rt/tlsf/ROOT
   local.get $0
   call $~lib/rt/tlsf/freeBlock
  else
   local.get $1
   i32.eqz
   if
    i32.const 0
    i32.const 4579424
    i32.const 136
    i32.const 16
    call $~lib/builtins/abort
    unreachable
   end
   local.get $0
   local.get $1
   i32.const 1
   i32.sub
   local.get $3
   i32.const -268435456
   i32.and
   i32.or
   i32.store offset=4
  end
 )
 (func $~lib/rt/pure/__visit (param $0 i32)
  local.get $0
  i32.const 4582652
  i32.lt_u
  if
   return
  end
  local.get $0
  i32.const 20
  i32.sub
  call $~lib/rt/pure/decrement
 )
)
