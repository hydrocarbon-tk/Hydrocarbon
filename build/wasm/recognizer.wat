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
 (data (i32.const 4579596) "\04\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\04\00\00\00\01\00\00\00")
 (data (i32.const 4579628) "\04\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\04\00\00\00\04\00\00\00")
 (data (i32.const 4579660) "4\00\00\00\01\00\00\00\00\00\00\00\00\00\00\004\00\00\00\1c\00\00\00\1e\00\00\000\00\00\001\00\00\007\00\00\008\00\00\009\00\00\00:\00\00\00;\00\00\00<\00\00\00=\00\00\00L\00\00\00M\00\00\00")
 (data (i32.const 4579740) "8\00\00\00\01\00\00\00\00\00\00\00\00\00\00\008\00\00\00\17\00\00\00\1c\00\00\000\00\00\001\00\00\006\00\00\007\00\00\008\00\00\009\00\00\00:\00\00\00;\00\00\00<\00\00\00=\00\00\00L\00\00\00M\00\00\00")
 (data (i32.const 4579820) "\\\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\\\00\00\00\17\00\00\00\1c\00\00\00\1e\00\00\00!\00\00\00\"\00\00\00#\00\00\00$\00\00\00%\00\00\00\'\00\00\00*\00\00\000\00\00\001\00\00\006\00\00\007\00\00\008\00\00\009\00\00\00:\00\00\00;\00\00\00<\00\00\00=\00\00\00>\00\00\00L\00\00\00M\00\00\00")
 (data (i32.const 4579932) "\1c\00\00\00\01\00\00\00\00\00\00\00\01\00\00\00\1c\00\00\00I\00n\00v\00a\00l\00i\00d\00 \00l\00e\00n\00g\00t\00h\00")
 (data (i32.const 4579980) "&\00\00\00\01\00\00\00\00\00\00\00\01\00\00\00&\00\00\00~\00l\00i\00b\00/\00a\00r\00r\00a\00y\00b\00u\00f\00f\00e\00r\00.\00t\00s\00")
 (data (i32.const 4580044) "$\00\00\00\01\00\00\00\00\00\00\00\01\00\00\00$\00\00\00K\00e\00y\00 \00d\00o\00e\00s\00 \00n\00o\00t\00 \00e\00x\00i\00s\00t\00")
 (data (i32.const 4580108) "\16\00\00\00\01\00\00\00\00\00\00\00\01\00\00\00\16\00\00\00~\00l\00i\00b\00/\00m\00a\00p\00.\00t\00s\00")
 (data (i32.const 4580156) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\01\00\00\00\00\00\00\00")
 (data (i32.const 4580188) "l\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00l\00\00\00\15\00\00\00\16\00\00\00\18\00\00\00\19\00\00\00\1a\00\00\00\1b\00\00\00\1d\00\00\00\1e\00\00\00 \00\00\00&\00\00\00\'\00\00\00(\00\00\000\00\00\001\00\00\002\00\00\003\00\00\004\00\00\005\00\00\006\00\00\007\00\00\008\00\00\009\00\00\00:\00\00\00;\00\00\00<\00\00\00=\00\00\00>\00\00\00")
 (data (i32.const 4580316) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\02\00\00\00\00\00\00\00")
 (data (i32.const 4580348) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\03\00\00\00\00\00\00\00")
 (data (i32.const 4580380) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\04\00\00\00\00\00\00\00")
 (data (i32.const 4580412) "L\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00L\00\00\00\15\00\00\00\16\00\00\00\18\00\00\00\19\00\00\00\1d\00\00\00\1e\00\00\00 \00\00\000\00\00\001\00\00\002\00\00\007\00\00\008\00\00\009\00\00\00:\00\00\00;\00\00\00<\00\00\00=\00\00\00L\00\00\00M\00\00\00")
 (data (i32.const 4580508) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\05\00\00\00\00\00\00\00")
 (data (i32.const 4580540) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\06\00\00\00\00\00\00\00")
 (data (i32.const 4580572) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\07\00\00\00\00\00\00\00")
 (data (i32.const 4580604) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\08\00\00\00\00\00\00\00")
 (data (i32.const 4580636) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\t\00\00\00\00\00\00\00")
 (data (i32.const 4580668) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\n\00\00\00\00\00\00\00")
 (data (i32.const 4580700) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\0b\00\00\00\00\00\00\00")
 (data (i32.const 4580732) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\0c\00\00\00\00\00\00\00")
 (data (i32.const 4580764) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\0d\00\00\00\00\00\00\00")
 (data (i32.const 4580796) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\0e\00\00\00\00\00\00\00")
 (data (i32.const 4580828) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\0f\00\00\00\00\00\00\00")
 (data (i32.const 4580860) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\10\00\00\00\00\00\00\00")
 (data (i32.const 4580892) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\11\00\00\00\00\00\00\00")
 (data (i32.const 4580924) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\12\00\00\00\00\00\00\00")
 (data (i32.const 4580956) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\13\00\00\00\00\00\00\00")
 (data (i32.const 4580988) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\14\00\00\00\00\00\00\00")
 (data (i32.const 4581020) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\15\00\00\00\00\00\00\00")
 (data (i32.const 4581052) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\16\00\00\00\00\00\00\00")
 (data (i32.const 4581084) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\17\00\00\00\00\00\00\00")
 (data (i32.const 4581116) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\18\00\00\00\00\00\00\00")
 (data (i32.const 4581148) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\19\00\00\00\00\00\00\00")
 (data (i32.const 4581180) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\1a\00\00\00\00\00\00\00")
 (data (i32.const 4581212) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\1b\00\00\00\00\00\00\00")
 (data (i32.const 4581244) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\1c\00\00\00\00\00\00\00")
 (data (i32.const 4581276) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\1d\00\00\00\00\00\00\00")
 (data (i32.const 4581308) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\1e\00\00\00\00\00\00\00")
 (data (i32.const 4581340) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\1f\00\00\00\00\00\00\00")
 (data (i32.const 4581372) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00 \00\00\00\00\00\00\00")
 (data (i32.const 4581404) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00!\00\00\00\00\00\00\00")
 (data (i32.const 4581436) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\"\00\00\00\00\00\00\00")
 (data (i32.const 4581468) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00#\00\00\00\00\00\00\00")
 (data (i32.const 4581500) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00$\00\00\00\00\00\00\00")
 (data (i32.const 4581532) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00%\00\00\00\00\00\00\00")
 (data (i32.const 4581564) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00&\00\00\00\00\00\00\00")
 (data (i32.const 4581596) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00\'\00\00\00\00\00\00\00")
 (data (i32.const 4581628) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00(\00\00\00\00\00\00\00")
 (data (i32.const 4581660) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00)\00\00\00\00\00\00\00")
 (data (i32.const 4581692) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00*\00\00\00\00\00\00\00")
 (data (i32.const 4581724) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00+\00\00\00\00\00\00\00")
 (data (i32.const 4581756) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00,\00\00\00\00\00\00\00")
 (data (i32.const 4581788) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00-\00\00\00\00\00\00\00")
 (data (i32.const 4581820) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00.\00\00\00\00\00\00\00")
 (data (i32.const 4581852) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00/\00\00\00\00\00\00\00")
 (data (i32.const 4581884) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\000\00\00\00\00\00\00\00")
 (data (i32.const 4581916) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\001\00\00\00\00\00\00\00")
 (data (i32.const 4581948) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\002\00\00\00\00\00\00\00")
 (data (i32.const 4581980) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\003\00\00\00\00\00\00\00")
 (data (i32.const 4582012) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\004\00\00\00\00\00\00\00")
 (data (i32.const 4582044) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\005\00\00\00\00\00\00\00")
 (data (i32.const 4582076) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\006\00\00\00\00\00\00\00")
 (data (i32.const 4582108) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\007\00\00\00\00\00\00\00")
 (data (i32.const 4582140) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\008\00\00\00\00\00\00\00")
 (data (i32.const 4582172) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\009\00\00\00\00\00\00\00")
 (data (i32.const 4582204) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00:\00\00\00\00\00\00\00")
 (data (i32.const 4582236) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00;\00\00\00\00\00\00\00")
 (data (i32.const 4582268) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00<\00\00\00\00\00\00\00")
 (data (i32.const 4582300) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00=\00\00\00\00\00\00\00")
 (data (i32.const 4582332) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00>\00\00\00\00\00\00\00")
 (data (i32.const 4582364) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00?\00\00\00\00\00\00\00")
 (data (i32.const 4582396) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00@\00\00\00\00\00\00\00")
 (data (i32.const 4582428) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00A\00\00\00\00\00\00\00")
 (data (i32.const 4582460) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00B\00\00\00\00\00\00\00")
 (data (i32.const 4582492) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00C\00\00\00\00\00\00\00")
 (data (i32.const 4582524) "\08\00\00\00\01\00\00\00\00\00\00\00\08\00\00\00\08\00\00\00D\00\00\00\00\00\00\00")
 (data (i32.const 4582560) "\t\00\00\00 \00\00\00\00\00\00\00 \00\00\00\00\00\00\00 \00\00\00\00\00\00\00\"\01\00\00\00\00\00\00$\01\00\00\00\00\00\00\"\t\00\00\00\00\00\00 \00\00\00\00\00\00\000A4\00\00\00\00\00 \00\00\00\00\00\00\00")
 (import "env" "abort" (func $~lib/builtins/abort (param i32 i32 i32 i32)))
 (table $0 69 funcref)
 (elem (i32.const 1) $start:input~anonymous|0 $start:input~anonymous|1 $start:input~anonymous|2 $start:input~anonymous|3 $start:input~anonymous|4 $start:input~anonymous|5 $start:input~anonymous|6 $start:input~anonymous|7 $start:input~anonymous|8 $start:input~anonymous|9 $start:input~anonymous|10 $start:input~anonymous|11 $start:input~anonymous|12 $start:input~anonymous|13 $start:input~anonymous|14 $start:input~anonymous|15 $start:input~anonymous|16 $start:input~anonymous|17 $start:input~anonymous|18 $start:input~anonymous|19 $start:input~anonymous|20 $start:input~anonymous|21 $start:input~anonymous|22 $start:input~anonymous|23 $start:input~anonymous|24 $start:input~anonymous|25 $start:input~anonymous|26 $start:input~anonymous|27 $start:input~anonymous|28 $start:input~anonymous|29 $start:input~anonymous|30 $start:input~anonymous|31 $start:input~anonymous|32 $start:input~anonymous|33 $start:input~anonymous|34 $start:input~anonymous|35 $start:input~anonymous|36 $start:input~anonymous|36 $start:input~anonymous|36 $start:input~anonymous|36 $start:input~anonymous|40 $start:input~anonymous|41 $start:input~anonymous|41 $start:input~anonymous|41 $start:input~anonymous|41 $start:input~anonymous|41 $start:input~anonymous|41 $start:input~anonymous|41 $start:input~anonymous|41 $start:input~anonymous|49 $start:input~anonymous|50 $start:input~anonymous|51 $start:input~anonymous|52 $start:input~anonymous|53 $start:input~anonymous|54 $start:input~anonymous|55 $start:input~anonymous|56 $start:input~anonymous|56 $start:input~anonymous|58 $start:input~anonymous|59 $start:input~anonymous|60 $start:input~anonymous|61 $start:input~anonymous|62 $start:input~anonymous|63 $start:input~anonymous|64 $start:input~anonymous|65 $start:input~anonymous|66 $start:input~anonymous|67)
 (global $~lib/rt/tlsf/ROOT (mut i32) (i32.const 0))
 (global $input/mark_ (mut i32) (i32.const 0))
 (global $input/action_ptr (mut i32) (i32.const 0))
 (global $input/error_ptr (mut i32) (i32.const 0))
 (global $input/stack_ptr (mut i32) (i32.const 0))
 (global $input/str (mut i32) (i32.const 4579552))
 (global $input/FAILED (mut i32) (i32.const 0))
 (global $input/prod (mut i32) (i32.const -1))
 (global $input/const__ (mut i32) (i32.const 0))
 (global $input/const_0_ (mut i32) (i32.const 0))
 (global $input/const_1_ (mut i32) (i32.const 0))
 (global $input/const_4_ (mut i32) (i32.const 0))
 (global $input/const_2_ (mut i32) (i32.const 0))
 (global $input/const_3_ (mut i32) (i32.const 0))
 (global $input/idm286 (mut i32) (i32.const 0))
 (global $~argumentsLength (mut i32) (i32.const 0))
 (global $input/idm261 (mut i32) (i32.const 0))
 (global $input/tym261 (mut i32) (i32.const 0))
 (global $input/const_6_ (mut i32) (i32.const 0))
 (global $input/idm262 (mut i32) (i32.const 0))
 (global $input/tym262 (mut i32) (i32.const 0))
 (global $input/idm101 (mut i32) (i32.const 0))
 (global $input/idm105r (mut i32) (i32.const 0))
 (global $input/idm104 (mut i32) (i32.const 0))
 (global $input/idm257r (mut i32) (i32.const 0))
 (global $input/tym61r (mut i32) (i32.const 0))
 (global $input/tym219r (mut i32) (i32.const 0))
 (global $input/idm295 (mut i32) (i32.const 0))
 (global $input/idm307 (mut i32) (i32.const 0))
 (global $input/idm340 (mut i32) (i32.const 0))
 (global $input/idm311 (mut i32) (i32.const 0))
 (global $input/tym311 (mut i32) (i32.const 0))
 (global $input/idm246r (mut i32) (i32.const 0))
 (global $input/const_7_ (mut i32) (i32.const 0))
 (global $input/idm242 (mut i32) (i32.const 0))
 (global $input/idm315 (mut i32) (i32.const 0))
 (global $input/idm370r (mut i32) (i32.const 0))
 (global $input/idm242r (mut i32) (i32.const 0))
 (global $input/idm341 (mut i32) (i32.const 0))
 (global $input/idm338r (mut i32) (i32.const 0))
 (global $input/idm231r (mut i32) (i32.const 0))
 (global $input/idm344 (mut i32) (i32.const 0))
 (global $input/idm308r (mut i32) (i32.const 0))
 (global $input/idm368r (mut i32) (i32.const 0))
 (global $input/idm362 (mut i32) (i32.const 0))
 (global $input/idm86r (mut i32) (i32.const 0))
 (global $input/idm227r (mut i32) (i32.const 0))
 (global $input/idm241 (mut i32) (i32.const 0))
 (global $input/idm342 (mut i32) (i32.const 0))
 (global $input/idm314r (mut i32) (i32.const 0))
 (global $input/idm392r (mut i32) (i32.const 0))
 (global $input/idm346r (mut i32) (i32.const 0))
 (global $input/idm200r (mut i32) (i32.const 0))
 (global $input/tym200r (mut i32) (i32.const 0))
 (global $input/idm266r (mut i32) (i32.const 0))
 (global $input/tym266r (mut i32) (i32.const 0))
 (global $input/idm236 (mut i32) (i32.const 0))
 (global $input/idm236r (mut i32) (i32.const 0))
 (global $input/idm335r (mut i32) (i32.const 0))
 (global $input/idm234r (mut i32) (i32.const 0))
 (global $input/idm354 (mut i32) (i32.const 0))
 (global $input/idm250r (mut i32) (i32.const 0))
 (global $input/idm376r (mut i32) (i32.const 0))
 (global $input/idm30 (mut i32) (i32.const 0))
 (global $input/idm33 (mut i32) (i32.const 0))
 (global $~lib/rt/__rtti_base i32 (i32.const 4582560))
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
  local.get $3
  local.get $1
  i32.const 4
  i32.add
  i32.add
  local.get $5
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
  i32.const 4582640
  i32.const 0
  i32.store
  i32.const 4584208
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
    i32.const 4582640
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
      i32.const 4582640
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
  i32.const 4582640
  i32.const 4584212
  memory.size
  i32.const 16
  i32.shl
  call $~lib/rt/tlsf/addMemory
  i32.const 4582640
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
       local.get $4
       i32.const 1
       i32.sub
       local.tee $4
       local.get $0
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
       local.get $4
       i32.const 8
       i32.sub
       local.tee $4
       local.get $0
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
      local.get $4
      i32.const 1
      i32.sub
      local.tee $4
      local.get $0
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
  i32.const 4582636
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
  i32.const 4582636
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
  i32.const 4582636
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
  i32.const 4582636
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
  (local $5 i32)
  (local $6 i32)
  i32.const 16
  i32.const 3
  call $~lib/rt/pure/__new
  local.tee $2
  local.get $0
  i32.const 2
  i32.shl
  local.tee $4
  local.set $6
  local.get $4
  i32.const 0
  call $~lib/rt/pure/__new
  local.set $3
  local.get $1
  if
   local.get $3
   local.get $1
   local.get $6
   call $~lib/memory/memory.copy
  end
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
 (func $~lib/staticarray/StaticArray<u32>#includes (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  local.set $2
  i32.const 0
  local.set $0
  block $__inlined_func$~lib/staticarray/StaticArray<u32>#indexOf
   local.get $2
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
    local.set $0
    br $__inlined_func$~lib/staticarray/StaticArray<u32>#indexOf
   end
   loop $while-continue|0
    local.get $0
    local.get $3
    i32.lt_s
    if
     local.get $1
     local.get $2
     local.get $0
     i32.const 2
     i32.shl
     i32.add
     i32.load
     i32.eq
     br_if $__inlined_func$~lib/staticarray/StaticArray<u32>#indexOf
     local.get $0
     i32.const 1
     i32.add
     local.set $0
     br $while-continue|0
    end
   end
   i32.const -1
   local.set $0
  end
  local.get $0
  i32.const 0
  i32.ge_s
 )
 (func $~lib/string/String#codePointAt (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  i32.const 20
  i32.sub
  i32.load offset=16
  i32.const 1
  i32.shr_u
  local.tee $2
  local.set $3
  local.get $1
  local.get $2
  i32.ge_u
  if
   i32.const -1
   return
  end
  i32.const 1
  local.get $3
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
  local.set $4
  i32.const 1
  local.set $1
  local.get $0
  i32.load offset=12
  local.get $0
  i32.load offset=8
  i32.add
  local.tee $5
  local.set $3
  local.get $0
  i32.const 0
  i32.store
  local.get $0
  i32.const 0
  i32.store offset=4
  local.get $3
  local.get $4
  i32.ge_s
  if
   local.get $0
   local.get $4
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
         local.get $5
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
        local.set $2
        local.get $0
        i32.const 6
        i32.store offset=4
        br $break|0
       end
       loop $while-continue|2
        local.get $5
        i32.const 1
        i32.add
        local.tee $5
        local.get $4
        i32.lt_s
        if (result i32)
         global.get $input/str
         local.get $5
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
       local.set $2
       local.get $0
       i32.const 3
       i32.store offset=4
       local.get $5
       local.get $3
       i32.sub
       local.set $1
       br $break|0
      end
      i32.const 1
      local.set $2
      local.get $0
      i32.const 1
      i32.store offset=4
      br $break|0
     end
     i32.const 2
     local.set $1
    end
    i32.const 4
    local.set $2
    local.get $0
    i32.const 4
    i32.store offset=4
    br $break|0
   end
   i32.const 2
   local.set $2
   local.get $0
   i32.const 2
   i32.store offset=4
   loop $while-continue|3
    local.get $5
    i32.const 1
    i32.add
    local.tee $5
    local.get $4
    i32.lt_s
    if (result i32)
     global.get $input/str
     local.get $5
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
   local.get $5
   local.get $3
   i32.sub
   local.set $1
  end
  local.get $2
  i32.const 3
  i32.eq
  if
   global.get $input/str
   local.get $3
   call $~lib/string/String#charCodeAt
   local.tee $4
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
          local.set $2
          local.get $0
          i32.const 11
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
    local.get $4
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
         local.set $2
         local.get $0
         i32.const 12
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
     local.get $4
     i32.const 73
     i32.eq
     if (result i32)
      global.get $input/str
      local.get $3
      i32.const 1
      i32.add
      call $~lib/string/String#charCodeAt
      local.tee $4
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
         local.set $2
         local.get $0
         i32.const 35
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
            local.set $2
            local.get $0
            i32.const 13
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
       local.get $4
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
             local.set $2
             local.get $0
             i32.const 17
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
      local.get $4
      i32.const 69
      i32.eq
      if (result i32)
       local.get $1
       i32.const 1
       i32.le_s
       if
        i32.const 7
        local.set $2
        local.get $0
        i32.const 71
        i32.store offset=4
        i32.const 1
        local.set $1
       end
       global.get $input/str
       local.get $3
       i32.const 1
       i32.add
       call $~lib/string/String#charCodeAt
       local.tee $4
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
          local.set $2
          local.get $0
          i32.const 34
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
            local.set $2
            local.get $0
            i32.const 14
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
        local.get $4
        i32.const 88
        i32.eq
        if (result i32)
         global.get $input/str
         local.get $3
         i32.const 2
         i32.add
         call $~lib/string/String#charCodeAt
         local.tee $4
         i32.const 84
         i32.eq
         if (result i32)
          local.get $1
          i32.const 3
          i32.le_s
          if (result i32)
           i32.const 7
           local.set $2
           local.get $0
           i32.const 16
           i32.store offset=4
           i32.const 3
          else
           local.get $1
          end
         else
          local.get $4
          i32.const 67
          i32.eq
          if (result i32)
           local.get $1
           i32.const 3
           i32.le_s
           if (result i32)
            i32.const 7
            local.set $2
            local.get $0
            i32.const 33
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
       local.get $4
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
            local.set $2
            local.get $0
            i32.const 15
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
        local.get $4
        i32.const 65
        i32.eq
        if (result i32)
         local.get $1
         i32.const 1
         i32.le_s
         if
          i32.const 7
          local.set $2
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
         i32.const 83
         i32.eq
         if (result i32)
          local.get $1
          i32.const 2
          i32.le_s
          if (result i32)
           i32.const 7
           local.set $2
           local.get $0
           i32.const 19
           i32.store offset=4
           i32.const 2
          else
           local.get $1
          end
         else
          local.get $1
         end
        else
         local.get $4
         i32.const 97
         i32.eq
         if (result i32)
          local.get $1
          i32.const 1
          i32.le_s
          if
           i32.const 7
           local.set $2
           local.get $0
           i32.const 63
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
            local.set $2
            local.get $0
            i32.const 20
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
                local.set $2
                local.get $0
                i32.const 55
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
          local.get $4
          i32.const 70
          i32.eq
          if (result i32)
           local.get $1
           i32.const 1
           i32.le_s
           if
            i32.const 7
            local.set $2
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
               local.set $2
               local.get $0
               i32.const 31
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
           local.get $4
           i32.const 82
           i32.eq
           if (result i32)
            global.get $input/str
            local.get $3
            i32.const 1
            i32.add
            call $~lib/string/String#charCodeAt
            local.tee $4
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
               local.set $2
               local.get $0
               i32.const 36
               i32.store offset=4
               i32.const 3
              else
               local.get $1
              end
             else
              local.get $1
             end
            else
             local.get $4
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
                local.set $2
                local.get $0
                i32.const 37
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
            local.get $4
            i32.const 101
            i32.eq
            if (result i32)
             local.get $1
             i32.const 1
             i32.le_s
             if
              i32.const 7
              local.set $2
              local.get $0
              i32.const 66
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
                local.set $2
                local.get $0
                i32.const 41
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
             local.get $4
             i32.const 99
             i32.eq
             if (result i32)
              local.get $1
              i32.const 1
              i32.le_s
              if
               i32.const 7
               local.set $2
               local.get $0
               i32.const 44
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
                  local.set $2
                  local.get $0
                  i32.const 43
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
              local.get $4
              i32.const 114
              i32.eq
              if (result i32)
               local.get $1
               i32.const 1
               i32.le_s
               if
                i32.const 7
                local.set $2
                local.get $0
                i32.const 46
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
                     local.set $2
                     local.get $0
                     i32.const 45
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
               local.get $4
               i32.const 102
               i32.eq
               if (result i32)
                local.get $1
                i32.const 1
                i32.le_s
                if (result i32)
                 i32.const 7
                 local.set $2
                 local.get $0
                 i32.const 49
                 i32.store offset=4
                 i32.const 1
                else
                 local.get $1
                end
               else
                local.get $4
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
                      local.set $2
                      local.get $0
                      i32.const 56
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
                 local.get $4
                 i32.const 103
                 i32.eq
                 if (result i32)
                  local.get $1
                  i32.const 1
                  i32.le_s
                  if (result i32)
                   i32.const 7
                   local.set $2
                   local.get $0
                   i32.const 58
                   i32.store offset=4
                   i32.const 1
                  else
                   local.get $1
                  end
                 else
                  local.get $4
                  i32.const 116
                  i32.eq
                  if (result i32)
                   local.get $1
                   i32.const 1
                   i32.le_s
                   if (result i32)
                    i32.const 7
                    local.set $2
                    local.get $0
                    i32.const 60
                    i32.store offset=4
                    i32.const 1
                   else
                    local.get $1
                   end
                  else
                   local.get $4
                   i32.const 98
                   i32.eq
                   if (result i32)
                    local.get $1
                    i32.const 1
                    i32.le_s
                    if (result i32)
                     i32.const 7
                     local.set $2
                     local.get $0
                     i32.const 64
                     i32.store offset=4
                     i32.const 1
                    else
                     local.get $1
                    end
                   else
                    local.get $4
                    i32.const 100
                    i32.eq
                    if (result i32)
                     local.get $1
                     i32.const 1
                     i32.le_s
                     if (result i32)
                      i32.const 7
                      local.set $2
                      local.get $0
                      i32.const 65
                      i32.store offset=4
                      i32.const 1
                     else
                      local.get $1
                     end
                    else
                     local.get $4
                     i32.const 66
                     i32.eq
                     if (result i32)
                      local.get $1
                      i32.const 1
                      i32.le_s
                      if (result i32)
                       i32.const 7
                       local.set $2
                       local.get $0
                       i32.const 68
                       i32.store offset=4
                       i32.const 1
                      else
                       local.get $1
                      end
                     else
                      local.get $4
                      i32.const 67
                      i32.eq
                      if (result i32)
                       local.get $1
                       i32.const 1
                       i32.le_s
                       if (result i32)
                        i32.const 7
                        local.set $2
                        local.get $0
                        i32.const 69
                        i32.store offset=4
                        i32.const 1
                       else
                        local.get $1
                       end
                      else
                       local.get $4
                       i32.const 68
                       i32.eq
                       if (result i32)
                        local.get $1
                        i32.const 1
                        i32.le_s
                        if (result i32)
                         i32.const 7
                         local.set $2
                         local.get $0
                         i32.const 70
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
  local.get $2
  i32.const 3
  i32.eq
  local.get $2
  i32.const 6
  i32.eq
  select
  if
   global.get $input/str
   local.get $3
   call $~lib/string/String#charCodeAt
   local.tee $4
   i32.const 64
   i32.eq
   if (result i32)
    i32.const 5
    local.set $2
    local.get $0
    i32.const 10
    i32.store offset=4
    i32.const 1
   else
    local.get $4
    i32.const 34
    i32.eq
    if (result i32)
     i32.const 5
     local.set $2
     local.get $0
     i32.const 18
     i32.store offset=4
     i32.const 1
    else
     local.get $4
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
       local.set $2
       local.get $0
       i32.const 21
       i32.store offset=4
       i32.const 2
      else
       local.get $1
      end
     else
      local.get $4
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
        local.set $2
        local.get $0
        i32.const 22
        i32.store offset=4
        i32.const 2
       else
        local.get $1
       end
      else
       local.get $4
       i32.const 603
       i32.eq
       if (result i32)
        i32.const 5
        local.set $2
        local.get $0
        i32.const 23
        i32.store offset=4
        i32.const 1
       else
        local.get $4
        i32.const 9474
        i32.eq
        if (result i32)
         i32.const 5
         local.set $2
         local.get $0
         i32.const 24
         i32.store offset=4
         i32.const 1
        else
         local.get $4
         i32.const 124
         i32.eq
         if (result i32)
          i32.const 5
          local.set $2
          local.get $0
          i32.const 25
          i32.store offset=4
          i32.const 1
         else
          local.get $4
          i32.const 8594
          i32.eq
          if (result i32)
           i32.const 5
           local.set $2
           local.get $0
           i32.const 26
           i32.store offset=4
           i32.const 1
          else
           local.get $4
           i32.const 62
           i32.eq
           if (result i32)
            i32.const 5
            local.set $2
            local.get $0
            i32.const 27
            i32.store offset=4
            i32.const 1
           else
            local.get $4
            i32.const 91
            i32.eq
            if (result i32)
             i32.const 5
             local.set $2
             local.get $0
             i32.const 28
             i32.store offset=4
             i32.const 1
            else
             local.get $4
             i32.const 93
             i32.eq
             if (result i32)
              i32.const 5
              local.set $2
              local.get $0
              i32.const 29
              i32.store offset=4
              i32.const 1
             else
              local.get $4
              i32.const 40
              i32.eq
              if (result i32)
               i32.const 5
               local.set $2
               local.get $0
               i32.const 30
               i32.store offset=4
               global.get $input/str
               local.get $3
               i32.const 1
               i32.add
               call $~lib/string/String#charCodeAt
               local.tee $1
               i32.const 43
               i32.eq
               if (result i32)
                local.get $0
                i32.const 52
                i32.store offset=4
                i32.const 2
               else
                local.get $1
                i32.const 42
                i32.eq
                if (result i32)
                 local.get $0
                 i32.const 53
                 i32.store offset=4
                 i32.const 2
                else
                 i32.const 1
                end
               end
              else
               local.get $4
               i32.const 41
               i32.eq
               if (result i32)
                i32.const 5
                local.set $2
                local.get $0
                i32.const 32
                i32.store offset=4
                i32.const 1
               else
                local.get $4
                i32.const 94
                i32.eq
                if (result i32)
                 i32.const 5
                 local.set $2
                 local.get $0
                 i32.const 38
                 i32.store offset=4
                 i32.const 1
                else
                 local.get $4
                 i32.const 123
                 i32.eq
                 if (result i32)
                  i32.const 5
                  local.set $2
                  local.get $0
                  i32.const 39
                  i32.store offset=4
                  i32.const 1
                 else
                  local.get $4
                  i32.const 125
                  i32.eq
                  if (result i32)
                   i32.const 5
                   local.set $2
                   local.get $0
                   i32.const 40
                   i32.store offset=4
                   i32.const 1
                  else
                   local.get $4
                   i32.const 58
                   i32.eq
                   if (result i32)
                    i32.const 5
                    local.set $2
                    local.get $0
                    i32.const 42
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
                     i32.const 62
                     i32.store offset=4
                     i32.const 2
                    else
                     i32.const 1
                    end
                   else
                    local.get $4
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
                      local.set $2
                      local.get $0
                      i32.const 47
                      i32.store offset=4
                      i32.const 2
                     else
                      local.get $1
                     end
                    else
                     local.get $4
                     i32.const 8614
                     i32.eq
                     if (result i32)
                      i32.const 5
                      local.set $2
                      local.get $0
                      i32.const 48
                      i32.store offset=4
                      i32.const 1
                     else
                      local.get $4
                      i32.const 35
                      i32.eq
                      if (result i32)
                       i32.const 5
                       local.set $2
                       local.get $0
                       i32.const 50
                       i32.store offset=4
                       i32.const 1
                      else
                       local.get $4
                       i32.const 63
                       i32.eq
                       if (result i32)
                        i32.const 5
                        local.set $2
                        local.get $0
                        i32.const 51
                        i32.store offset=4
                        i32.const 1
                       else
                        local.get $4
                        i32.const 36
                        i32.eq
                        if (result i32)
                         i32.const 5
                         local.set $2
                         local.get $0
                         i32.const 77
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
                            i32.const 54
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
                         local.get $4
                         i32.const 952
                         i32.eq
                         if (result i32)
                          i32.const 5
                          local.set $2
                          local.get $0
                          i32.const 57
                          i32.store offset=4
                          i32.const 1
                         else
                          local.get $4
                          i32.const 964
                          i32.eq
                          if (result i32)
                           i32.const 5
                           local.set $2
                           local.get $0
                           i32.const 59
                           i32.store offset=4
                           i32.const 1
                          else
                           local.get $4
                           i32.const 92
                           i32.eq
                           if (result i32)
                            i32.const 5
                            local.set $2
                            local.get $0
                            i32.const 61
                            i32.store offset=4
                            i32.const 1
                           else
                            local.get $4
                            i32.const 39
                            i32.eq
                            if (result i32)
                             i32.const 5
                             local.set $2
                             local.get $0
                             i32.const 73
                             i32.store offset=4
                             i32.const 1
                            else
                             local.get $4
                             i32.const 47
                             i32.eq
                             if (result i32)
                              i32.const 5
                              local.set $2
                              local.get $0
                              i32.const 74
                              i32.store offset=4
                              i32.const 1
                             else
                              local.get $4
                              i32.const 45
                              i32.eq
                              if (result i32)
                               i32.const 5
                               local.set $2
                               local.get $0
                               i32.const 75
                               i32.store offset=4
                               i32.const 1
                              else
                               local.get $4
                               i32.const 95
                               i32.eq
                               if (result i32)
                                i32.const 5
                                local.set $2
                                local.get $0
                                i32.const 76
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
  local.get $2
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
  local.get $0
  call $~lib/rt/pure/__retain
  local.set $0
  local.get $1
  call $~lib/rt/pure/__retain
  local.set $1
  loop $while-continue|0
   local.get $1
   local.get $0
   i32.load
   call $~lib/staticarray/StaticArray<u32>#includes
   if (result i32)
    i32.const 0
   else
    local.get $1
    local.get $0
    i32.load offset=4
    call $~lib/staticarray/StaticArray<u32>#includes
    i32.eqz
   end
   i32.eqz
   if
    local.get $0
    call $input/Lexer#next
    call $~lib/rt/pure/__release
    br $while-continue|0
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
  local.get $1
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
   i32.const 4579952
   i32.const 4580000
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
  i32.const 7
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
   i32.const 4580064
   i32.const 4580128
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
 (func $start:input~anonymous|0 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $1
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm286
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm286
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
 (func $input/add_shift (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $3
  i32.load offset=12
  local.get $3
  i32.load offset=16
  i32.sub
  local.tee $0
  i32.const 3
  i32.shl
  i32.const 1
  i32.or
  local.set $4
  local.get $0
  i32.const 0
  i32.ne
  local.tee $2
  if (result i32)
   local.get $0
   i32.const 36863
   i32.gt_u
   local.tee $0
   if (result i32)
    local.get $0
   else
    local.get $1
    i32.const 36863
    i32.gt_u
   end
  else
   i32.const 0
  end
  if
   local.get $3
   i32.const 0
   call $input/add_shift
   i32.const 1
   local.set $4
   i32.const 0
   local.set $2
  end
  local.get $2
  i32.const 2
  i32.shl
  local.get $1
  i32.const 0
  i32.ne
  i32.const 1
  i32.shl
  i32.or
  local.get $1
  local.get $2
  i32.const 15
  i32.mul
  i32.const 3
  i32.add
  i32.shl
  i32.or
  local.get $4
  i32.or
  call $input/set_action
  local.get $3
  local.get $3
  i32.load offset=12
  local.get $3
  i32.load offset=8
  i32.add
  i32.store offset=16
  local.get $3
  call $~lib/rt/pure/__release
 )
 (func $input/_no_check (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  local.get $0
  i32.load offset=8
  call $input/add_shift
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
   local.get $1
   i32.load offset=8
   call $input/add_shift
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
 (func $input/add_reduce (param $0 i32) (param $1 i32)
  local.get $0
  i32.const 16383
  i32.and
  i32.const 2
  i32.shl
  local.get $1
  i32.const 16
  i32.shl
  i32.or
  call $input/set_action
 )
 (func $input/$fn$js_function_start_symbol (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  i32.load offset=4
  i32.const 48
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
   i32.const 49
   i32.eq
   if
    local.get $0
    call $input/_no_check
    global.get $input/FAILED
    i32.eqz
    if
     local.get $0
     global.get $input/const__
     i32.const 42
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
  local.get $0
  i32.load offset=16
  i32.store offset=16
  local.get $1
 )
 (func $input/Lexer#constructor (result i32)
  (local $0 i32)
  i32.const 20
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
  i32.store offset=16
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
  i32.const 0
  i32.store offset=16
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
   local.tee $2
   local.set $1
  end
  local.get $0
  local.get $1
  call $input/Lexer#copy
  local.get $2
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
 (func $input/$def$js_id_symbols (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.set $0
  global.get $input/idm261
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm261
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
   global.get $input/tym261
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym261
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
     global.get $input/prod
     i32.const 101
     i32.eq
     if
      global.get $input/const_6_
      local.get $0
      i32.load offset=4
      call $~lib/staticarray/StaticArray<u32>#includes
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
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load
       i32.const 4
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
       i32.const 6
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
      local.set $1
      global.get $input/idm262
      local.get $1
      i32.load offset=4
      f64.convert_i32_s
      call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
      if
       i32.const 1
       global.set $~argumentsLength
       local.get $1
       global.get $input/idm262
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
       global.get $input/tym262
       local.get $1
       i32.load
       f64.convert_i32_s
       call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
       if
        i32.const 1
        global.set $~argumentsLength
        local.get $1
        global.get $input/tym262
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
 (func $input/$sym$identifier (param $0 i32)
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
  call $input/$def$js_id_symbols
  block $__inlined_func$input/$def$js_identifier
   global.get $input/FAILED
   i32.eqz
   if
    i32.const 100
    call $input/setProduction
    br $__inlined_func$input/$def$js_identifier
   end
   local.get $1
   call $input/fail
  end
  local.get $1
  call $~lib/rt/pure/__release
  global.get $input/FAILED
  i32.eqz
  if
   i32.const 77
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
    i32.const 92
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
  block $__inlined_func$input/$sym$generated_symbol_group_140_106
   local.get $0
   i32.load offset=4
   i32.const 57
   i32.eq
   if
    local.get $0
    call $input/_no_check
    global.get $input/FAILED
    i32.eqz
    if
     i32.const 67
     call $input/setProduction
     br $__inlined_func$input/$sym$generated_symbol_group_140_106
    end
   else
    local.get $0
    i32.load offset=4
    i32.const 58
    i32.eq
    if
     local.get $0
     call $input/_no_check
     global.get $input/FAILED
     i32.eqz
     if
      local.get $0
      global.get $input/const__
      i32.const 42
      call $input/_with_skip
      global.get $input/FAILED
      i32.eqz
      if
       i32.const 67
       call $input/setProduction
       i32.const 2
       i32.const 0
       call $input/add_reduce
       br $__inlined_func$input/$sym$generated_symbol_group_140_106
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
 (func $input/$sym$literal_symbol_group_045_108 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner0
   local.get $0
   i32.load offset=4
   i32.const 76
   i32.eq
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load offset=4
    i32.const 77
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
     call $~lib/rt/pure/__retain
     local.set $1
     global.get $input/FAILED
     i32.eqz
     if
      local.get $1
      i32.load offset=4
      i32.const 2
      i32.eq
      if (result i32)
       i32.const 1
      else
       local.get $1
       i32.load
       i32.const 2
       i32.eq
      end
      if
       local.get $1
       call $input/_no_check
      else
       local.get $1
       call $input/soft_fail
      end
     end
     local.get $1
     call $~lib/rt/pure/__release
     block $__inlined_func$input/$def$natural
      global.get $input/FAILED
      i32.eqz
      if
       i32.const 91
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
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  i32.const 70
  call $input/setProduction
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$sym$sym_delimter (param $0 i32)
  block $folding-inner0
   local.get $0
   call $~lib/rt/pure/__retain
   local.tee $0
   i32.load offset=4
   i32.const 54
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
     i32.const 4
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
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  i32.const 79
  call $input/setProduction
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$sym$literal_symbol (param $0 i32)
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
  block $__inlined_func$input/$sym$literal_symbol_group_143_107
   local.get $1
   i32.load offset=4
   i32.const 59
   i32.eq
   if
    local.get $1
    call $input/_no_check
    global.get $input/FAILED
    i32.eqz
    if
     i32.const 69
     call $input/setProduction
     br $__inlined_func$input/$sym$literal_symbol_group_143_107
    end
   else
    local.get $1
    i32.load offset=4
    i32.const 60
    i32.eq
    if
     local.get $1
     call $input/_no_check
     global.get $input/FAILED
     i32.eqz
     if
      local.get $1
      global.get $input/const__
      i32.const 42
      call $input/_with_skip
      global.get $input/FAILED
      i32.eqz
      if
       i32.const 69
       call $input/setProduction
       i32.const 2
       i32.const 0
       call $input/add_reduce
       br $__inlined_func$input/$sym$literal_symbol_group_143_107
      end
     end
    end
   end
   local.get $1
   call $input/fail
  end
  local.get $1
  call $~lib/rt/pure/__release
  local.get $0
  call $input/$sym$literal_symbol_group_045_108
  local.get $0
  i32.load offset=4
  i32.const 54
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load
   i32.const 1
   i32.eq
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
   call $input/$sym$sym_delimter
   global.get $input/FAILED
   i32.eqz
   if
    i32.const 71
    call $input/setProduction
    i32.const 3
    i32.const 63
    call $input/add_reduce
    local.get $0
    call $~lib/rt/pure/__release
    return
   end
  else
   global.get $input/FAILED
   i32.eqz
   if
    i32.const 71
    call $input/setProduction
    i32.const 2
    i32.const 63
    call $input/add_reduce
    local.get $0
    call $~lib/rt/pure/__release
    return
   end
  end
  local.get $0
  call $input/fail
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$sym$grouped_symbol_group_013_103 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
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
   local.get $0
   call $input/fail
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  i32.const 57
  call $input/setProduction
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/$sym$escaped_symbol_HC_listbody1_109 (param $0 i32)
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
   call $input/$sym$grouped_symbol_group_013_103
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
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
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $1
       i32.const 72
       i32.ne
       if
        local.get $1
        i32.const 57
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       i32.load offset=4
       i32.const 54
       i32.eq
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
       local.set $3
       global.get $input/action_ptr
       global.set $input/mark_
       global.get $input/mark_
       local.set $5
       global.get $input/prod
       local.set $6
       global.get $input/stack_ptr
       local.set $7
       local.get $3
       call $~lib/rt/pure/__retain
       local.tee $1
       i32.load
       i32.const 3
       i32.eq
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
        local.get $1
        call $input/$sym$grouped_symbol_group_013_103
        global.get $input/stack_ptr
        i32.const 1
        i32.add
        global.set $input/stack_ptr
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
         block $__inlined_func$input/State96
          block $break|11
           block $case2|12
            global.get $input/prod
            local.tee $2
            i32.const 57
            i32.ne
            if
             local.get $2
             i32.const 72
             i32.eq
             br_if $__inlined_func$input/State96
             br $case2|12
            end
            block $__inlined_func$input/State254
             block $folding-inner0
              local.get $1
              call $~lib/rt/pure/__retain
              local.tee $2
              i32.load offset=4
              i32.const 54
              i32.eq
              br_if $folding-inner0
              local.get $2
              i32.load
              if (result i32)
               local.get $2
               i32.load
               i32.const 1
               i32.eq
              else
               i32.const 1
              end
              if (result i32)
               i32.const 1
              else
               local.get $2
               i32.load
               i32.const 3
               i32.eq
              end
              if (result i32)
               i32.const 1
              else
               local.get $2
               i32.load
               i32.const 4
               i32.eq
              end
              if (result i32)
               i32.const 1
              else
               local.get $2
               i32.load
               i32.const 5
               i32.eq
              end
              if (result i32)
               i32.const 1
              else
               local.get $2
               i32.load
               i32.const 6
               i32.eq
              end
              if (result i32)
               i32.const 1
              else
               local.get $2
               i32.load
               i32.const 7
               i32.eq
              end
              br_if $folding-inner0
              local.get $2
              call $input/fail
              br $__inlined_func$input/State254
             end
             i32.const 2
             i32.const 12
             call $input/add_reduce
             i32.const 72
             global.set $input/prod
             global.get $input/stack_ptr
             i32.const 2
             i32.sub
             global.set $input/stack_ptr
            end
            local.get $2
            call $~lib/rt/pure/__release
            br $break|11
           end
           local.get $1
           call $input/fail
           br $__inlined_func$input/State96
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
        local.get $3
        call $~lib/rt/pure/__release
        return
       else
        local.get $0
        local.get $3
        call $input/Lexer#sync
       end
       local.get $3
       call $~lib/rt/pure/__release
       br $break|1
      end
      block $__inlined_func$input/State97
       block $folding-inner00
        local.get $0
        call $~lib/rt/pure/__retain
        local.tee $1
        i32.load offset=4
        i32.const 54
        i32.eq
        br_if $folding-inner00
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
         i32.const 4
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
        br_if $folding-inner00
        local.get $1
        call $input/fail
        br $__inlined_func$input/State97
       end
       i32.const 1
       i32.const 13
       call $input/add_reduce
       i32.const 72
       global.set $input/prod
       global.get $input/stack_ptr
       i32.const 1
       i32.sub
       global.set $input/stack_ptr
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
 (func $input/$sym$escaped_symbol (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  global.get $input/const__
  i32.const 61
  call $input/_with_skip
  global.get $input/FAILED
  i32.eqz
  if
   local.get $0
   call $input/$sym$escaped_symbol_HC_listbody1_109
   global.get $input/FAILED
   i32.eqz
   if
    local.get $0
    call $input/$sym$sym_delimter
    global.get $input/FAILED
    i32.eqz
    if
     i32.const 73
     call $input/setProduction
     i32.const 3
     i32.const 64
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
 (func $input/$sym$EOF_symbol (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  global.get $input/const_1_
  i32.const 54
  call $input/_with_skip
  global.get $input/FAILED
  i32.eqz
  if
   i32.const 64
   call $input/setProduction
   i32.const 1
   i32.const 58
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
 (func $input/$fn$js_primitive (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const_1_
  call $input/_skip
  block $folding-inner0
   local.get $0
   i32.load offset=4
   i32.const 54
   i32.eq
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load offset=4
    i32.const 57
    i32.eq
   end
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load offset=4
    i32.const 58
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
   if
    local.get $0
    call $~lib/rt/pure/__retain
    local.tee $1
    global.get $input/const__
    call $input/_skip
    block $__inlined_func$input/$fn$js_primitive_group_035_101
     block $folding-inner00
      local.get $1
      i32.load offset=4
      i32.const 57
      i32.eq
      if (result i32)
       i32.const 1
      else
       local.get $1
       i32.load offset=4
       i32.const 58
       i32.eq
      end
      if
       local.get $1
       call $input/$sym$generated_symbol
       global.get $input/FAILED
       i32.eqz
       br_if $folding-inner00
      else
       local.get $1
       i32.load offset=4
       i32.const 59
       i32.eq
       if (result i32)
        i32.const 1
       else
        local.get $1
        i32.load offset=4
        i32.const 60
        i32.eq
       end
       if
        local.get $1
        call $input/$sym$literal_symbol
        global.get $input/FAILED
        i32.eqz
        br_if $folding-inner00
       else
        local.get $1
        i32.load offset=4
        i32.const 61
        i32.eq
        if
         local.get $1
         call $input/$sym$escaped_symbol
         global.get $input/FAILED
         i32.eqz
         br_if $folding-inner00
        else
         local.get $1
         i32.load offset=4
         i32.const 54
         i32.eq
         if
          local.get $1
          call $input/$sym$EOF_symbol
          global.get $input/FAILED
          i32.eqz
          br_if $folding-inner00
         end
        end
       end
      end
      local.get $1
      call $input/fail
      br $__inlined_func$input/$fn$js_primitive_group_035_101
     end
     i32.const 40
     call $input/setProduction
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
 (func $input/State103 (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const_1_
  call $input/_skip
  global.get $input/idm105r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm105r
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
    i32.const 39
    global.set $input/prod
    global.get $input/stack_ptr
    i32.const 1
    i32.sub
    global.set $input/stack_ptr
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
 (func $input/State257 (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const_1_
  call $input/_skip
  global.get $input/idm257r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm257r
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
    i32.const 2
    i32.const 12
    call $input/add_reduce
    i32.const 39
    global.set $input/prod
    global.get $input/stack_ptr
    i32.const 2
    i32.sub
    global.set $input/stack_ptr
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
 (func $input/State104 (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const_1_
  call $input/_skip
  global.get $input/idm104
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm104
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
  global.get $input/stack_ptr
  local.set $1
  loop $while-continue|0
   local.get $1
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
    call $input/State257
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
  global.get $input/idm101
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm101
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
        call $input/State103
        br $break|1
       end
       local.get $0
       call $input/State103
       br $break|1
      end
      local.get $0
      i32.load offset=4
      i32.const 40
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
      local.set $3
      global.get $input/prod
      local.set $4
      global.get $input/stack_ptr
      local.set $5
      local.get $1
      call $input/State104
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
 (func $start:input~anonymous|1 (param $0 i32)
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
   i32.const 38
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
    i32.const 39
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
       i32.const 40
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
 (func $start:input~anonymous|2 (param $0 i32)
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
  block $__inlined_func$input/State34
   block $folding-inner0
    local.get $0
    i32.load offset=4
    i32.const 21
    i32.eq
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load offset=4
     i32.const 22
     i32.eq
    end
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load offset=4
     i32.const 48
     i32.eq
    end
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load offset=4
     i32.const 49
     i32.eq
    end
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load offset=4
     i32.const 50
     i32.eq
    end
    br_if $folding-inner0
    local.get $0
    i32.load
    i32.eqz
    br_if $folding-inner0
    local.get $0
    call $input/fail
    br $__inlined_func$input/State34
   end
   i32.const 19
   global.set $input/prod
   global.get $input/stack_ptr
   i32.const 1
   i32.sub
   global.set $input/stack_ptr
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
 (func $input/State62 (param $0 i32)
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
       global.get $input/tym219r
       local.get $1
       i32.load
       f64.convert_i32_s
       call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
       if
        i32.const 1
        global.set $~argumentsLength
        local.get $1
        global.get $input/tym219r
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
       global.get $input/tym61r
       local.get $1
       i32.load
       f64.convert_i32_s
       call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
       if
        i32.const 1
        global.set $~argumentsLength
        local.get $1
        global.get $input/tym61r
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
       local.get $1
       call $~lib/rt/pure/__release
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
      call $input/State62
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
  i32.const 50
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
 (func $start:input~anonymous|3 (param $0 i32)
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
 (func $input/$prd$production_group_08_100 (param $0 i32)
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
   i32.const 20
   call $input/setProduction
   i32.const 1
   i32.const 19
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
   i32.const 62
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
   i32.const 26
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
    i32.const 27
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
 (func $input/State246 (param $0 i32)
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
   local.get $0
   i32.load
   if (result i32)
    local.get $0
    i32.load
    i32.const 3
    i32.eq
   else
    i32.const 1
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
    i32.const 63
    global.set $input/prod
    global.get $input/stack_ptr
    i32.const 1
    i32.sub
    global.set $input/stack_ptr
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
 (func $input/State315 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $1
  global.get $input/const__
  call $input/_skip
  global.get $input/idm315
  local.get $1
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $1
   global.get $input/idm315
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
       local.tee $0
       i32.const 61
       i32.ne
       if
        local.get $0
        i32.const 63
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $1
       call $~lib/rt/pure/__retain
       local.tee $2
       global.get $input/const__
       call $input/_skip
       local.get $2
       i32.load offset=4
       i32.const 32
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
        local.tee $0
        global.get $input/const__
        call $input/_skip
        global.get $input/idm370r
        local.get $0
        i32.load offset=4
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
        if
         i32.const 1
         global.set $~argumentsLength
         local.get $0
         global.get $input/idm370r
         local.get $0
         i32.load offset=4
         f64.convert_i32_s
         call $~lib/map/Map<f64,%28input/Lexer%29=>void>#get
         local.tee $4
         i32.load
         call_indirect (type $i32_=>_none)
         local.get $4
         call $~lib/rt/pure/__release
        else
         local.get $0
         i32.load
         if (result i32)
          local.get $0
          i32.load
          i32.const 3
          i32.eq
         else
          i32.const 1
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
          i32.const 4
          i32.const 57
          call $input/add_reduce
          i32.const 63
          global.set $input/prod
          global.get $input/stack_ptr
          i32.const 4
          i32.sub
          global.set $input/stack_ptr
         else
          local.get $0
          call $input/fail
         end
        end
        local.get $0
        call $~lib/rt/pure/__release
       else
        local.get $2
        call $input/fail
       end
       local.get $2
       call $~lib/rt/pure/__release
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
  global.get $input/idm311
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm311
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
   global.get $input/tym311
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym311
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
            call $input/State246
            br $break|1
           end
           local.get $0
           call $input/State246
           br $break|1
          end
          local.get $0
          call $input/State246
          br $break|1
         end
         local.get $0
         call $input/State246
         br $break|1
        end
        local.get $0
        call $input/State246
        br $break|1
       end
       local.get $0
       call $input/State246
       br $break|1
      end
      global.get $input/const_7_
      local.get $0
      i32.load offset=4
      call $~lib/staticarray/StaticArray<u32>#includes
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
      global.get $input/idm242
      local.get $1
      i32.load offset=4
      f64.convert_i32_s
      call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
      if
       i32.const 1
       global.set $~argumentsLength
       local.get $1
       global.get $input/idm242
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
        block $__inlined_func$input/State313
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
            br_if $__inlined_func$input/State313
            br $case2|12
           end
           local.get $1
           call $input/State315
           br $break|11
          end
          local.get $1
          call $input/fail
          br $__inlined_func$input/State313
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
 (func $input/State242 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner0
   global.get $input/idm242
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/idm242
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
    global.get $input/idm242r
    local.get $0
    i32.load offset=4
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
    if
     i32.const 1
     global.set $~argumentsLength
     local.get $0
     global.get $input/idm242r
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
     local.get $0
     i32.load
     if (result i32)
      local.get $0
      i32.load
      i32.const 3
      i32.eq
     else
      i32.const 1
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
      i32.const 1
      i32.const 34
      call $input/add_reduce
      i32.const 31
      global.set $input/prod
      global.get $input/stack_ptr
      i32.const 1
      i32.sub
      global.set $input/stack_ptr
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
       call $input/State315
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
 (func $input/State240 (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm242r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm242r
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
   local.get $0
   i32.load
   if (result i32)
    local.get $0
    i32.load
    i32.const 3
    i32.eq
   else
    i32.const 1
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
    i32.const 1
    i32.const 34
    call $input/add_reduce
    i32.const 31
    global.set $input/prod
    global.get $input/stack_ptr
    i32.const 1
    i32.sub
    global.set $input/stack_ptr
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
 (func $input/State338 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner0
   global.get $input/idm242
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/idm242
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
    global.get $input/idm338r
    local.get $0
    i32.load offset=4
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
    if
     i32.const 1
     global.set $~argumentsLength
     local.get $0
     global.get $input/idm338r
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
     local.get $0
     i32.load
     if (result i32)
      local.get $0
      i32.load
      i32.const 3
      i32.eq
     else
      i32.const 1
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
      i32.const 2
      i32.const 35
      call $input/add_reduce
      i32.const 31
      global.set $input/prod
      global.get $input/stack_ptr
      i32.const 2
      i32.sub
      global.set $input/stack_ptr
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
       call $input/State315
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
 (func $input/State336 (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm338r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm338r
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
   local.get $0
   i32.load
   if (result i32)
    local.get $0
    i32.load
    i32.const 3
    i32.eq
   else
    i32.const 1
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
    i32.const 2
    i32.const 35
    call $input/add_reduce
    i32.const 31
    global.set $input/prod
    global.get $input/stack_ptr
    i32.const 2
    i32.sub
    global.set $input/stack_ptr
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
 (func $input/State341 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm341
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm341
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
    call $input/$sym$symbol
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
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
         call $input/State338
         br $break|1
        end
        local.get $0
        call $input/State336
        br $break|1
       end
       local.get $0
       call $input/State336
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
  global.get $input/idm340
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm340
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
    call $input/$sym$symbol
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
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
         call $input/State242
         br $break|1
        end
        local.get $0
        call $input/State240
        br $break|1
       end
       local.get $0
       call $input/State240
       br $break|1
      end
      local.get $0
      i32.load offset=4
      i32.const 21
      i32.eq
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 22
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 24
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 25
       i32.eq
      end
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
       i32.load offset=4
       i32.const 32
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 50
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
      call $input/State341
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
    i32.const 43
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
     i32.const 44
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
      i32.const 45
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
       i32.const 46
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
   i32.const 47
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
   else
    local.get $0
    i32.load offset=4
    i32.const 39
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
       i32.const 40
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
     i32.const 38
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
   global.get $input/const_4_
   local.get $0
   i32.load offset=4
   call $~lib/staticarray/StaticArray<u32>#includes
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
    i32.const 48
    i32.eq
    if (result i32)
     i32.const 1
    else
     local.get $0
     i32.load offset=4
     i32.const 49
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
    i32.const 23
    i32.eq
    if
     local.get $0
     call $~lib/rt/pure/__retain
     local.tee $1
     global.get $input/const__
     call $input/_skip
     local.get $1
     global.get $input/const__
     i32.const 23
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
     i32.const 54
     i32.eq
     if
      local.get $0
      call $input/$sym$EOF_symbol
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
 (func $input/_pk (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.set $0
  local.get $1
  call $~lib/rt/pure/__retain
  local.set $1
  local.get $0
  call $input/Lexer#next
  call $~lib/rt/pure/__release
  local.get $0
  local.get $1
  call $input/_skip
  local.get $1
  call $~lib/rt/pure/__release
  local.get $0
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
   global.get $input/const_2_
   local.get $0
   i32.load offset=4
   call $~lib/staticarray/StaticArray<u32>#includes
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
   else
    local.get $0
    i32.load offset=4
    i32.const 30
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
      global.get $input/const_3_
      local.get $1
      i32.load offset=4
      call $~lib/staticarray/StaticArray<u32>#includes
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
     else
      global.get $input/FAILED
      if (result i32)
       i32.const 0
      else
       local.get $1
       i32.load offset=4
       i32.const 31
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
       i32.const 30
       call $input/_with_skip
       block $__inlined_func$input/$pb$force_fork
        global.get $input/FAILED
        i32.eqz
        if
         local.get $2
         global.get $input/const__
         i32.const 31
         call $input/_with_skip
         global.get $input/FAILED
         i32.eqz
         if
          local.get $2
          global.get $input/const__
          i32.const 32
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
      end
     end
     local.get $3
     call $~lib/rt/pure/__release
     local.get $1
     call $~lib/rt/pure/__release
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
 (func $input/State231 (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm231r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm231r
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
   local.get $0
   i32.load
   if
    local.get $0
    call $input/fail
   else
    i32.const 1
    i32.const 25
    call $input/add_reduce
    i32.const 28
    global.set $input/prod
    global.get $input/stack_ptr
    i32.const 1
    i32.sub
    global.set $input/stack_ptr
    local.get $0
    call $~lib/rt/pure/__release
    return
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State308 (param $0 i32)
  (local $1 i32)
  local.get $0
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
   local.get $0
   call $~lib/rt/pure/__release
   return
  else
   local.get $0
   i32.load
   if
    local.get $0
    call $input/fail
   else
    i32.const 2
    i32.const 27
    call $input/add_reduce
    i32.const 28
    global.set $input/prod
    global.get $input/stack_ptr
    i32.const 2
    i32.sub
    global.set $input/stack_ptr
    local.get $0
    call $~lib/rt/pure/__release
    return
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State307 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm307
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm307
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
    call $input/$pb$production_body
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
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
       global.get $input/idm368r
       local.get $1
       i32.load offset=4
       f64.convert_i32_s
       call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
       if
        i32.const 1
        global.set $~argumentsLength
        local.get $1
        global.get $input/idm368r
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
        i32.load
        if
         local.get $1
         call $input/fail
        else
         i32.const 3
         i32.const 26
         call $input/add_reduce
         i32.const 28
         global.set $input/prod
         global.get $input/stack_ptr
         i32.const 3
         i32.sub
         global.set $input/stack_ptr
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
  global.get $input/idm307
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm307
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
    call $input/$pb$production_body
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
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
       call $input/State231
       br $break|1
      end
      local.get $0
      i32.load offset=4
      i32.const 21
      i32.eq
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 22
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
       i32.const 48
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 49
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
      global.get $input/idm344
      local.get $1
      i32.load offset=4
      f64.convert_i32_s
      call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
      if
       i32.const 1
       global.set $~argumentsLength
       local.get $1
       global.get $input/idm344
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
        block $__inlined_func$input/State232
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
             br_if $__inlined_func$input/State232
             br $case3|1
            end
            local.get $1
            call $input/State308
            br $break|11
           end
           local.get $1
           call $input/State307
           br $break|11
          end
          local.get $1
          call $input/fail
          br $__inlined_func$input/State232
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
 (func $input/State344 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner1
   block $folding-inner0
    global.get $input/idm344
    local.get $0
    i32.load offset=4
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
    if
     i32.const 1
     global.set $~argumentsLength
     local.get $0
     global.get $input/idm344
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
     i32.const 21
     i32.eq
     if (result i32)
      i32.const 1
     else
      local.get $0
      i32.load offset=4
      i32.const 22
      i32.eq
     end
     if (result i32)
      i32.const 1
     else
      local.get $0
      i32.load offset=4
      i32.const 48
      i32.eq
     end
     if (result i32)
      i32.const 1
     else
      local.get $0
      i32.load offset=4
      i32.const 49
      i32.eq
     end
     if (result i32)
      i32.const 1
     else
      local.get $0
      i32.load offset=4
      i32.const 50
      i32.eq
     end
     br_if $folding-inner0
     local.get $0
     i32.load
     i32.eqz
     br_if $folding-inner0
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
          br_if $folding-inner1
          br $case4|1
         end
         local.get $0
         call $input/State308
         br $break|1
        end
        local.get $0
        call $input/State307
        br $break|1
       end
       local.get $0
       call $input/fail
       br $folding-inner1
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
   i32.const 4
   i32.const 22
   call $input/add_reduce
   i32.const 24
   global.set $input/prod
   global.get $input/stack_ptr
   i32.const 4
   i32.sub
   global.set $input/stack_ptr
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State295 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm295
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm295
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
    call $input/$pb$production_bodies
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
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
       call $input/State344
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
 (func $input/State362 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner1
   block $folding-inner0
    global.get $input/idm362
    local.get $0
    i32.load offset=4
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
    if
     i32.const 1
     global.set $~argumentsLength
     local.get $0
     global.get $input/idm362
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
     i32.const 21
     i32.eq
     if (result i32)
      i32.const 1
     else
      local.get $0
      i32.load offset=4
      i32.const 22
      i32.eq
     end
     if (result i32)
      i32.const 1
     else
      local.get $0
      i32.load offset=4
      i32.const 48
      i32.eq
     end
     if (result i32)
      i32.const 1
     else
      local.get $0
      i32.load offset=4
      i32.const 49
      i32.eq
     end
     if (result i32)
      i32.const 1
     else
      local.get $0
      i32.load offset=4
      i32.const 50
      i32.eq
     end
     br_if $folding-inner0
     local.get $0
     i32.load
     i32.eqz
     br_if $folding-inner0
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
           br_if $folding-inner1
           br $case5|1
          end
          local.get $0
          call $input/State308
          br $break|1
         end
         local.get $0
         call $input/State307
         br $break|1
        end
        local.get $0
        call $~lib/rt/pure/__retain
        local.tee $1
        global.get $input/const__
        call $input/_skip
        block $__inlined_func$input/State384
         block $folding-inner00
          local.get $1
          i32.load offset=4
          i32.const 21
          i32.eq
          if (result i32)
           i32.const 1
          else
           local.get $1
           i32.load offset=4
           i32.const 22
           i32.eq
          end
          if (result i32)
           i32.const 1
          else
           local.get $1
           i32.load offset=4
           i32.const 48
           i32.eq
          end
          if (result i32)
           i32.const 1
          else
           local.get $1
           i32.load offset=4
           i32.const 49
           i32.eq
          end
          if (result i32)
           i32.const 1
          else
           local.get $1
           i32.load offset=4
           i32.const 50
           i32.eq
          end
          br_if $folding-inner00
          local.get $1
          i32.load
          i32.eqz
          br_if $folding-inner00
          local.get $1
          call $input/fail
          br $__inlined_func$input/State384
         end
         i32.const 5
         i32.const 21
         call $input/add_reduce
         i32.const 24
         global.set $input/prod
         global.get $input/stack_ptr
         i32.const 5
         i32.sub
         global.set $input/stack_ptr
        end
        local.get $1
        call $~lib/rt/pure/__release
        br $break|1
       end
       local.get $0
       call $input/fail
       br $folding-inner1
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
   i32.const 4
   i32.const 24
   call $input/add_reduce
   i32.const 24
   global.set $input/prod
   global.get $input/stack_ptr
   i32.const 4
   i32.sub
   global.set $input/stack_ptr
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State299 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm295
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm295
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
    call $input/$pb$production_bodies
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
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
       call $input/State362
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
  i32.const 76
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 77
   i32.eq
  end
  if
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
   call $input/$prd$production_group_08_100
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
    call $input/$prd$production_group_013_103
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
    i32.const 7
    i32.eq
   end
   if
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
    call $input/$prd$production_group_08_100
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
     call $input/$prd$production_group_013_103
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
        i32.const 26
        i32.eq
        if (result i32)
         i32.const 1
        else
         local.get $1
         i32.load offset=4
         i32.const 27
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
          block $__inlined_func$input/State196
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
              br_if $__inlined_func$input/State196
              br $case2|12
             end
             local.get $1
             call $input/State295
             br $break|11
            end
            local.get $1
            call $input/fail
            br $__inlined_func$input/State196
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
       call $~lib/rt/pure/__retain
       local.tee $1
       global.get $input/const__
       call $input/_skip
       local.get $1
       i32.load offset=4
       i32.const 26
       i32.eq
       if (result i32)
        i32.const 1
       else
        local.get $1
        i32.load offset=4
        i32.const 27
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
         block $__inlined_func$input/State195
          block $break|15
           block $case2|16
            global.get $input/prod
            local.tee $4
            i32.const 25
            i32.ne
            if
             local.get $4
             i32.const 24
             i32.eq
             br_if $__inlined_func$input/State195
             br $case2|16
            end
            local.get $1
            call $input/State299
            br $break|15
           end
           local.get $1
           call $input/fail
           br $__inlined_func$input/State195
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
 (func $start:input~anonymous|4 (param $0 i32)
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
 (func $input/State356 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner1
   block $folding-inner0
    global.get $input/idm344
    local.get $0
    i32.load offset=4
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
    if
     i32.const 1
     global.set $~argumentsLength
     local.get $0
     global.get $input/idm344
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
     i32.const 21
     i32.eq
     if (result i32)
      i32.const 1
     else
      local.get $0
      i32.load offset=4
      i32.const 22
      i32.eq
     end
     if (result i32)
      i32.const 1
     else
      local.get $0
      i32.load offset=4
      i32.const 48
      i32.eq
     end
     if (result i32)
      i32.const 1
     else
      local.get $0
      i32.load offset=4
      i32.const 49
      i32.eq
     end
     if (result i32)
      i32.const 1
     else
      local.get $0
      i32.load offset=4
      i32.const 50
      i32.eq
     end
     br_if $folding-inner0
     local.get $0
     i32.load
     i32.eqz
     br_if $folding-inner0
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
          br_if $folding-inner1
          br $case4|1
         end
         local.get $0
         call $input/State308
         br $break|1
        end
        local.get $0
        call $input/State307
        br $break|1
       end
       local.get $0
       call $input/fail
       br $folding-inner1
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
   i32.const 4
   i32.const 23
   call $input/add_reduce
   i32.const 24
   global.set $input/prod
   global.get $input/stack_ptr
   i32.const 4
   i32.sub
   global.set $input/stack_ptr
  end
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State300 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm295
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm295
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
    call $input/$pb$production_bodies
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
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
       call $input/State356
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
  i32.const 76
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 77
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
   i32.load
   i32.const 3
   i32.eq
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
       i32.const 26
       i32.eq
       if (result i32)
        i32.const 1
       else
        local.get $1
        i32.load offset=4
        i32.const 27
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
         block $__inlined_func$input/State204
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
             br_if $__inlined_func$input/State204
             br $case2|12
            end
            local.get $1
            call $input/State300
            br $break|11
           end
           local.get $1
           call $input/fail
           br $__inlined_func$input/State204
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
 (func $start:input~anonymous|5 (param $0 i32)
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
 (func $start:input~anonymous|6 (param $0 i32)
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
   i32.const 24
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
    i32.const 25
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
 (func $start:input~anonymous|7 (param $0 i32)
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
 (func $start:input~anonymous|8 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.set $2
  global.get $input/action_ptr
  global.set $input/mark_
  global.get $input/mark_
  local.set $4
  global.get $input/stack_ptr
  local.set $5
  i32.const 0
  global.set $~argumentsLength
  local.get $2
  call $input/Lexer#copy@varargs
  local.tee $3
  call $~lib/rt/pure/__retain
  local.tee $1
  global.get $input/const__
  call $input/_skip
  local.get $1
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $__inlined_func$input/$prd$production_group_010_101
   block $folding-inner0
    local.get $0
    i32.load offset=4
    i32.const 24
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
     i32.const 25
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
    local.get $1
    call $~lib/rt/pure/__retain
    local.tee $0
    global.get $input/const__
    call $input/_skip
    local.get $0
    global.get $input/const__
    i32.const 41
    call $input/_with_skip
    block $__inlined_func$input/$fn$error_function
     global.get $input/FAILED
     i32.eqz
     if
      local.get $0
      global.get $input/const__
      i32.const 42
      call $input/_with_skip
      global.get $input/FAILED
      i32.eqz
      if
       local.get $0
       global.get $input/const_1_
       i32.const 39
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
         i32.const 40
         call $input/_with_skip
         global.get $input/FAILED
         i32.eqz
         if
          local.get $0
          global.get $input/const_1_
          i32.const 39
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
            i32.const 40
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
   local.get $5
   global.set $input/stack_ptr
   local.get $2
   call $input/$pb$production_bodies_group_04_100
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
  else
   local.get $2
   local.get $3
   call $input/Lexer#sync
  end
  local.get $3
  call $~lib/rt/pure/__release
  local.get $2
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|9 (param $0 i32)
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
 (func $start:input~anonymous|10 (param $0 i32)
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
 (func $start:input~anonymous|11 (param $0 i32)
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
 (func $start:input~anonymous|12 (param $0 i32)
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
 (func $start:input~anonymous|13 (param $0 i32)
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
 (func $start:input~anonymous|14 (param $0 i32)
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
  i32.const 39
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
     i32.const 40
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
 (func $start:input~anonymous|15 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  call $input/_no_check
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $0
  call $input/State103
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|16 (param $0 i32)
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
 (func $start:input~anonymous|17 (param $0 i32)
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
 (func $start:input~anonymous|18 (param $0 i32)
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
 (func $start:input~anonymous|19 (param $0 i32)
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
 (func $input/$sym$assert_function_symbol (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
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
    i32.const 42
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
   i32.const 56
   i32.eq
   if
    local.get $0
    call $input/_no_check
    global.get $input/FAILED
    i32.eqz
    if
     local.get $0
     global.get $input/const__
     i32.const 42
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
   i32.const 57
   i32.eq
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load offset=4
    i32.const 58
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
     call $input/$sym$literal_symbol
     global.get $input/FAILED
     i32.eqz
     br_if $folding-inner0
    else
     local.get $0
     i32.load offset=4
     i32.const 55
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
      call $input/$sym$assert_function_symbol
      global.get $input/FAILED
      i32.eqz
      br_if $folding-inner0
     else
      local.get $0
      i32.load offset=4
      i32.const 61
      i32.eq
      if
       local.get $0
       call $input/$sym$escaped_symbol
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
  i32.const 61
  call $input/setProduction
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State85 (param $0 i32)
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
  i32.const 55
  i32.eq
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
   i32.load offset=4
   i32.const 57
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 58
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
  if
   local.get $0
   call $input/$sym$terminal_symbol
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
       global.get $input/idm227r
       local.get $1
       i32.load offset=4
       f64.convert_i32_s
       call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
       if
        i32.const 1
        global.set $~argumentsLength
        local.get $1
        global.get $input/idm227r
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
        i32.load
        if
         local.get $1
         call $input/fail
        else
         i32.const 2
         i32.const 4
         call $input/add_reduce
         i32.const 50
         global.set $input/prod
         global.get $input/stack_ptr
         i32.const 2
         i32.sub
         global.set $input/stack_ptr
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
  i32.const 55
  i32.eq
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
   i32.load offset=4
   i32.const 57
   i32.eq
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 58
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
  if
   local.get $0
   call $input/$sym$terminal_symbol
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
       global.get $input/idm86r
       local.get $1
       i32.load offset=4
       f64.convert_i32_s
       call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
       if
        i32.const 1
        global.set $~argumentsLength
        local.get $1
        global.get $input/idm86r
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
        local.get $1
        i32.load
        if
         local.get $1
         call $input/fail
        else
         i32.const 1
         i32.const 5
         call $input/add_reduce
         i32.const 50
         global.set $input/prod
         global.get $input/stack_ptr
         i32.const 1
         i32.sub
         global.set $input/stack_ptr
        end
       end
       local.get $1
       call $~lib/rt/pure/__release
       br $break|1
      end
      local.get $0
      i32.load offset=4
      i32.const 32
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
      call $input/State85
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
   i32.const 33
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
      i32.const 32
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
    i32.const 34
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
       i32.const 32
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
     i32.const 35
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
        i32.const 32
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
      i32.const 36
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
         i32.const 32
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
       i32.const 37
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
          i32.const 32
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
 (func $start:input~anonymous|20 (param $0 i32)
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
  i32.const 38
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
  else
   local.get $0
   i32.load offset=4
   i32.const 39
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
      i32.const 40
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
   end
  end
  local.get $0
  call $input/fail
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|21 (param $0 i32)
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
 (func $start:input~anonymous|22 (param $0 i32)
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
 (func $input/State342 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm342
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm342
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
    call $input/$sym$symbol
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
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
         call $input/State338
         br $break|1
        end
        local.get $0
        call $input/State336
        br $break|1
       end
       local.get $0
       call $input/State336
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
 (func $input/State241 (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm241
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm241
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
    call $input/$pb$body_entries
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
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
      i32.load offset=4
      i32.const 21
      i32.eq
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 22
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 24
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 25
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
       i32.const 50
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
      call $input/State342
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
 (func $start:input~anonymous|23 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  call $input/_no_check
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $0
  call $input/State241
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|24 (param $0 i32)
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
 (func $start:input~anonymous|25 (param $0 i32)
  (local $1 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $1
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $__inlined_func$input/$sym$symbol_group_031_105
   block $folding-inner0
    local.get $0
    i32.load offset=4
    i32.const 52
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
     i32.const 53
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
    br $__inlined_func$input/$sym$symbol_group_031_105
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
 (func $start:input~anonymous|26 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
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
  global.get $input/idm314r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm314r
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
   i32.load
   if (result i32)
    local.get $0
    i32.load
    i32.const 3
    i32.eq
   else
    i32.const 1
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
    i32.const 2
    i32.const 56
    call $input/add_reduce
    i32.const 63
    global.set $input/prod
    global.get $input/stack_ptr
    i32.const 2
    i32.sub
    global.set $input/stack_ptr
   else
    local.get $0
    call $input/fail
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
  local.get $1
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|27 (param $0 i32)
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
 (func $start:input~anonymous|28 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
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
  global.get $input/idm392r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm392r
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
   i32.load
   if (result i32)
    local.get $0
    i32.load
    i32.const 3
    i32.eq
   else
    i32.const 1
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
    i32.const 3
    i32.const 36
    call $input/add_reduce
    i32.const 31
    global.set $input/prod
    global.get $input/stack_ptr
    i32.const 3
    i32.sub
    global.set $input/stack_ptr
   else
    local.get $0
    call $input/fail
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
  local.get $1
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|29 (param $0 i32)
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
 (func $start:input~anonymous|30 (param $0 i32)
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
 (func $start:input~anonymous|31 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
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
   local.tee $2
   i32.load
   call_indirect (type $i32_=>_none)
   local.get $2
   call $~lib/rt/pure/__release
  else
   local.get $0
   i32.load
   if (result i32)
    local.get $0
    i32.load
    i32.const 3
    i32.eq
   else
    i32.const 1
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
    i32.const 3
    i32.const 57
    call $input/add_reduce
    i32.const 63
    global.set $input/prod
    global.get $input/stack_ptr
    i32.const 3
    i32.sub
    global.set $input/stack_ptr
   else
    local.get $0
    call $input/fail
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
  local.get $1
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|32 (param $0 i32)
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
 (func $start:input~anonymous|33 (param $0 i32)
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
 (func $start:input~anonymous|34 (param $0 i32)
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
 (func $start:input~anonymous|35 (param $0 i32)
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
 (func $start:input~anonymous|36 (param $0 i32)
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
  global.get $input/idm200r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm200r
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
   global.get $input/tym200r
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym200r
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
 (func $start:input~anonymous|40 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 101
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 1
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|41 (param $0 i32)
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
  global.get $input/idm266r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm266r
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
   global.get $input/tym266r
   local.get $0
   i32.load
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/tym266r
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
 (func $start:input~anonymous|49 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  i32.const 2
  i32.const 12
  call $input/add_reduce
  i32.const 101
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 2
  i32.sub
  global.set $input/stack_ptr
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|50 (param $0 i32)
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
 (func $start:input~anonymous|51 (param $0 i32)
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
 (func $start:input~anonymous|52 (param $0 i32)
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
 (func $start:input~anonymous|53 (param $0 i32)
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
 (func $start:input~anonymous|54 (param $0 i32)
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
 (func $input/State236 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  block $folding-inner0
   global.get $input/idm236
   local.get $0
   i32.load offset=4
   f64.convert_i32_s
   call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
   if
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    global.get $input/idm236
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
    global.get $input/idm236r
    local.get $0
    i32.load offset=4
    f64.convert_i32_s
    call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
    if
     i32.const 1
     global.set $~argumentsLength
     local.get $0
     global.get $input/idm236r
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
      call $input/$sym$symbol
      global.get $input/stack_ptr
      i32.const 1
      i32.add
      global.set $input/stack_ptr
     else
      local.get $0
      i32.load
      if
       local.get $0
       call $input/fail
      else
       i32.const 1
       i32.const 33
       call $input/add_reduce
       i32.const 30
       global.set $input/prod
       global.get $input/stack_ptr
       i32.const 1
       i32.sub
       global.set $input/stack_ptr
       br $folding-inner0
      end
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
          call $input/State338
          br $break|1
         end
         local.get $0
         call $input/State336
         br $break|1
        end
        local.get $0
        call $~lib/rt/pure/__retain
        local.tee $1
        global.get $input/const__
        call $input/_skip
        global.get $input/idm335r
        local.get $1
        i32.load offset=4
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
        if
         i32.const 1
         global.set $~argumentsLength
         local.get $1
         global.get $input/idm335r
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
         i32.load
         if
          local.get $1
          call $input/fail
         else
          i32.const 2
          i32.const 30
          call $input/add_reduce
          i32.const 30
          global.set $input/prod
          global.get $input/stack_ptr
          i32.const 2
          i32.sub
          global.set $input/stack_ptr
         end
        end
        local.get $1
        call $~lib/rt/pure/__release
        br $break|1
       end
       local.get $0
       call $input/State336
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
 (func $input/State354 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm354
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm354
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
        call $input/State308
        br $break|1
       end
       local.get $0
       call $input/State307
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
 (func $input/State312 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm295
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm295
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
    call $input/$pb$production_bodies
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
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
          global.get $input/const_7_
          local.get $0
          i32.load offset=4
          call $~lib/staticarray/StaticArray<u32>#includes
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
          call $input/State242
          br $break|1
         end
         local.get $0
         call $input/State236
         br $break|1
        end
        local.get $0
        call $~lib/rt/pure/__retain
        local.tee $1
        global.get $input/const__
        call $input/_skip
        global.get $input/idm234r
        local.get $1
        i32.load offset=4
        f64.convert_i32_s
        call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
        if
         i32.const 1
         global.set $~argumentsLength
         local.get $1
         global.get $input/idm234r
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
         i32.load
         if
          local.get $1
          call $input/fail
         else
          i32.const 1
          i32.const 29
          call $input/add_reduce
          i32.const 29
          global.set $input/prod
          global.get $input/stack_ptr
          i32.const 1
          i32.sub
          global.set $input/stack_ptr
         end
        end
        local.get $1
        call $~lib/rt/pure/__release
        br $break|1
       end
       local.get $0
       call $input/State231
       br $break|1
      end
      local.get $0
      call $input/State354
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
 (func $start:input~anonymous|55 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  call $input/_no_check
  global.get $input/stack_ptr
  i32.const 1
  i32.add
  global.set $input/stack_ptr
  local.get $0
  call $input/State312
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|56 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
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
  global.get $input/idm250r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm250r
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
   i32.load
   if (result i32)
    local.get $0
    i32.load
    i32.const 3
    i32.eq
   else
    i32.const 1
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
    i32.const 1
    i32.const 54
    call $input/add_reduce
    i32.const 63
    global.set $input/prod
    global.get $input/stack_ptr
    i32.const 1
    i32.sub
    global.set $input/stack_ptr
   else
    local.get $0
    call $input/fail
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
  local.get $1
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|58 (param $0 i32)
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
 (func $start:input~anonymous|59 (param $0 i32)
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
 (func $start:input~anonymous|60 (param $0 i32)
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
 (func $start:input~anonymous|61 (param $0 i32)
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
 (func $start:input~anonymous|62 (param $0 i32)
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
 (func $start:input~anonymous|63 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
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
  global.get $input/idm376r
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm376r
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
   i32.load
   if (result i32)
    local.get $0
    i32.load
    i32.const 3
    i32.eq
   else
    i32.const 1
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
    i32.const 3
    i32.const 55
    call $input/add_reduce
    i32.const 63
    global.set $input/prod
    global.get $input/stack_ptr
    i32.const 3
    i32.sub
    global.set $input/stack_ptr
   else
    local.get $0
    call $input/fail
   end
  end
  local.get $0
  call $~lib/rt/pure/__release
  local.get $1
  call $~lib/rt/pure/__release
 )
 (func $start:input~anonymous|64 (param $0 i32)
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
 (func $start:input~anonymous|65 (param $0 i32)
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
 (func $start:input~anonymous|66 (param $0 i32)
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
 (func $start:input~anonymous|67 (param $0 i32)
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
  local.tee $1
  call $~lib/staticarray/StaticArray.fromArray<u32>
  global.set $input/const_0_
  i32.const 1
  i32.const 4579648
  call $~lib/rt/__newArray
  call $~lib/rt/pure/__retain
  local.tee $2
  call $~lib/staticarray/StaticArray.fromArray<u32>
  global.set $input/const_1_
  i32.const 13
  i32.const 4579680
  call $~lib/rt/__newArray
  call $~lib/rt/pure/__retain
  call $~lib/staticarray/StaticArray.fromArray<u32>
  global.set $input/const_4_
  i32.const 14
  i32.const 4579760
  call $~lib/rt/__newArray
  call $~lib/rt/pure/__retain
  local.tee $3
  call $~lib/staticarray/StaticArray.fromArray<u32>
  global.set $input/const_2_
  i32.const 23
  i32.const 4579840
  call $~lib/rt/__newArray
  call $~lib/rt/pure/__retain
  local.tee $4
  call $~lib/staticarray/StaticArray.fromArray<u32>
  global.set $input/const_3_
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm286
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm261
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym261
  i32.const 27
  i32.const 4580208
  call $~lib/rt/__newArray
  call $~lib/rt/pure/__retain
  call $~lib/staticarray/StaticArray.fromArray<u32>
  global.set $input/const_6_
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm262
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym262
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm101
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm105r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm257r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym61r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym219r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm295
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm307
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm340
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm311
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym311
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm246r
  i32.const 19
  i32.const 4580432
  call $~lib/rt/__newArray
  call $~lib/rt/pure/__retain
  local.tee $5
  call $~lib/staticarray/StaticArray.fromArray<u32>
  global.set $input/const_7_
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm242
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm315
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm370r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm242r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm341
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm338r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm231r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm344
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm308r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm368r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm362
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm86r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm227r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm241
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm342
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm314r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm392r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm346r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm200r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym200r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm266r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/tym266r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm236
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm236r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm335r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm234r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm354
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm250r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm376r
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm30
  global.get $input/idm30
  f64.const 21
  i32.const 4580176
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm30
  f64.const 22
  i32.const 4580176
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm30
  f64.const 48
  i32.const 4580336
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm30
  f64.const 49
  i32.const 4580336
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm30
  f64.const 23
  i32.const 4580368
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#constructor
  global.set $input/idm33
  global.get $input/idm33
  f64.const 21
  i32.const 4580176
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm33
  f64.const 22
  i32.const 4580176
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm33
  f64.const 50
  i32.const 4580400
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm33
  f64.const 48
  i32.const 4580336
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm33
  f64.const 49
  i32.const 4580336
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm286
  f64.const 21
  i32.const 4580528
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm286
  f64.const 22
  i32.const 4580560
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm295
  f64.const 30
  i32.const 4580592
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm295
  f64.const 48
  i32.const 4580592
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm295
  f64.const 49
  i32.const 4580592
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm295
  f64.const 28
  i32.const 4580592
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm295
  f64.const 57
  i32.const 4580592
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm295
  f64.const 58
  i32.const 4580592
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm295
  f64.const 76
  i32.const 4580592
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm295
  f64.const 77
  i32.const 4580592
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm295
  f64.const 59
  i32.const 4580592
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm295
  f64.const 60
  i32.const 4580592
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm295
  f64.const 61
  i32.const 4580592
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm295
  f64.const 55
  i32.const 4580592
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm295
  f64.const 56
  i32.const 4580592
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm295
  f64.const 23
  i32.const 4580592
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm295
  f64.const 54
  i32.const 4580592
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm344
  f64.const 24
  i32.const 4580624
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm344
  f64.const 25
  i32.const 4580624
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm344
  f64.const 50
  i32.const 4580400
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm362
  f64.const 24
  i32.const 4580656
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm362
  f64.const 25
  i32.const 4580656
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm362
  f64.const 50
  i32.const 4580400
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 24
  i32.const 4580688
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 25
  i32.const 4580688
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 50
  i32.const 4580688
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 32
  i32.const 4580688
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 21
  i32.const 4580688
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 22
  i32.const 4580688
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 48
  i32.const 4580688
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm308r
  f64.const 49
  i32.const 4580688
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm307
  f64.const 30
  i32.const 4580720
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm307
  f64.const 48
  i32.const 4580720
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm307
  f64.const 49
  i32.const 4580720
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm307
  f64.const 28
  i32.const 4580720
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm307
  f64.const 57
  i32.const 4580720
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm307
  f64.const 58
  i32.const 4580720
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm307
  f64.const 76
  i32.const 4580720
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm307
  f64.const 77
  i32.const 4580720
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm307
  f64.const 59
  i32.const 4580720
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm307
  f64.const 60
  i32.const 4580720
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm307
  f64.const 61
  i32.const 4580720
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm307
  f64.const 55
  i32.const 4580720
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm307
  f64.const 56
  i32.const 4580720
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm307
  f64.const 23
  i32.const 4580720
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm307
  f64.const 54
  i32.const 4580720
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm368r
  f64.const 24
  i32.const 4580752
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm368r
  f64.const 25
  i32.const 4580752
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm368r
  f64.const 50
  i32.const 4580752
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm368r
  f64.const 32
  i32.const 4580752
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm368r
  f64.const 21
  i32.const 4580752
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm368r
  f64.const 22
  i32.const 4580752
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm368r
  f64.const 48
  i32.const 4580752
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm368r
  f64.const 49
  i32.const 4580752
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm231r
  f64.const 24
  i32.const 4580784
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm231r
  f64.const 25
  i32.const 4580784
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm231r
  f64.const 50
  i32.const 4580784
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm231r
  f64.const 32
  i32.const 4580784
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm231r
  f64.const 21
  i32.const 4580784
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm231r
  f64.const 22
  i32.const 4580784
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm231r
  f64.const 48
  i32.const 4580784
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm231r
  f64.const 49
  i32.const 4580784
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm101
  f64.const 57
  i32.const 4580816
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm101
  f64.const 58
  i32.const 4580816
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm101
  f64.const 59
  i32.const 4580816
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm101
  f64.const 60
  i32.const 4580816
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm101
  f64.const 61
  i32.const 4580816
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm101
  f64.const 54
  i32.const 4580816
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm101
  f64.const 39
  i32.const 4580848
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm101
  f64.const 23
  i32.const 4580880
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm105r
  f64.const 40
  i32.const 4580912
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm105r
  f64.const 57
  i32.const 4580912
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm105r
  f64.const 58
  i32.const 4580912
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm105r
  f64.const 59
  i32.const 4580912
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm105r
  f64.const 60
  i32.const 4580912
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm105r
  f64.const 61
  i32.const 4580912
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm105r
  f64.const 54
  i32.const 4580912
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm105r
  f64.const 39
  i32.const 4580912
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm104
  f64.const 57
  i32.const 4580816
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm104
  f64.const 58
  i32.const 4580816
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm104
  f64.const 59
  i32.const 4580816
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm104
  f64.const 60
  i32.const 4580816
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm104
  f64.const 61
  i32.const 4580816
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm104
  f64.const 54
  i32.const 4580816
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm104
  f64.const 39
  i32.const 4580848
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm257r
  f64.const 40
  i32.const 4580944
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm257r
  f64.const 57
  i32.const 4580944
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm257r
  f64.const 58
  i32.const 4580944
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm257r
  f64.const 59
  i32.const 4580944
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm257r
  f64.const 60
  i32.const 4580944
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm257r
  f64.const 61
  i32.const 4580944
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm257r
  f64.const 54
  i32.const 4580944
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm257r
  f64.const 39
  i32.const 4580944
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym61r
  f64.const 4
  i32.const 4580976
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym61r
  f64.const 6
  i32.const 4580976
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym61r
  f64.const 5
  i32.const 4580976
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym61r
  f64.const 3
  i32.const 4580976
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym61r
  f64.const 2
  i32.const 4580976
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym61r
  f64.const 1
  i32.const 4580976
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym61r
  f64.const 7
  i32.const 4580976
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym61r
  f64.const 0
  i32.const 4580976
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym219r
  f64.const 4
  i32.const 4581008
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym219r
  f64.const 6
  i32.const 4581008
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym219r
  f64.const 5
  i32.const 4581008
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym219r
  f64.const 3
  i32.const 4581008
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym219r
  f64.const 2
  i32.const 4581008
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym219r
  f64.const 1
  i32.const 4581008
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym219r
  f64.const 7
  i32.const 4581008
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym219r
  f64.const 0
  i32.const 4581008
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm340
  f64.const 30
  i32.const 4581040
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm340
  f64.const 48
  i32.const 4581072
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm340
  f64.const 49
  i32.const 4581072
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm340
  f64.const 57
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm340
  f64.const 58
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm340
  f64.const 76
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm340
  f64.const 77
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm340
  f64.const 59
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm340
  f64.const 60
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm340
  f64.const 61
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm340
  f64.const 55
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm340
  f64.const 56
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm340
  f64.const 28
  i32.const 4581136
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm241
  f64.const 30
  i32.const 4581168
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm241
  f64.const 48
  i32.const 4581168
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm241
  f64.const 49
  i32.const 4581168
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm241
  f64.const 28
  i32.const 4581168
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm241
  f64.const 57
  i32.const 4581168
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm241
  f64.const 58
  i32.const 4581168
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm241
  f64.const 76
  i32.const 4581168
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm241
  f64.const 77
  i32.const 4581168
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm241
  f64.const 59
  i32.const 4581168
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm241
  f64.const 60
  i32.const 4581168
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm241
  f64.const 61
  i32.const 4581168
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm241
  f64.const 55
  i32.const 4581168
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm241
  f64.const 56
  i32.const 4581168
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm242
  f64.const 52
  i32.const 4581200
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm242
  f64.const 53
  i32.const 4581200
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm242
  f64.const 51
  i32.const 4581232
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm242r
  f64.const 48
  i32.const 4581264
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm242r
  f64.const 49
  i32.const 4581264
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm242r
  f64.const 30
  i32.const 4581264
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm242r
  f64.const 57
  i32.const 4581264
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm242r
  f64.const 58
  i32.const 4581264
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm242r
  f64.const 76
  i32.const 4581264
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm242r
  f64.const 77
  i32.const 4581264
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm242r
  f64.const 59
  i32.const 4581264
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm242r
  f64.const 60
  i32.const 4581264
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm242r
  f64.const 61
  i32.const 4581264
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm242r
  f64.const 55
  i32.const 4581264
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm242r
  f64.const 56
  i32.const 4581264
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm242r
  f64.const 24
  i32.const 4581264
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm242r
  f64.const 25
  i32.const 4581264
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm242r
  f64.const 50
  i32.const 4581264
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm242r
  f64.const 32
  i32.const 4581264
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm242r
  f64.const 21
  i32.const 4581264
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm242r
  f64.const 22
  i32.const 4581264
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm242r
  f64.const 29
  i32.const 4581264
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm341
  f64.const 48
  i32.const 4581072
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm341
  f64.const 49
  i32.const 4581072
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm341
  f64.const 30
  i32.const 4581040
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm341
  f64.const 57
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm341
  f64.const 58
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm341
  f64.const 76
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm341
  f64.const 77
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm341
  f64.const 59
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm341
  f64.const 60
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm341
  f64.const 61
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm341
  f64.const 55
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm341
  f64.const 56
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm342
  f64.const 48
  i32.const 4581072
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm342
  f64.const 49
  i32.const 4581072
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm342
  f64.const 30
  i32.const 4581040
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm342
  f64.const 57
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm342
  f64.const 58
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm342
  f64.const 76
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm342
  f64.const 77
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm342
  f64.const 59
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm342
  f64.const 60
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm342
  f64.const 61
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm342
  f64.const 55
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm342
  f64.const 56
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm342
  f64.const 29
  i32.const 4581296
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm314r
  f64.const 57
  i32.const 4581328
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm314r
  f64.const 51
  i32.const 4581328
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm314r
  f64.const 52
  i32.const 4581328
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm314r
  f64.const 53
  i32.const 4581328
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm314r
  f64.const 58
  i32.const 4581328
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm314r
  f64.const 76
  i32.const 4581328
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm314r
  f64.const 77
  i32.const 4581328
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm314r
  f64.const 59
  i32.const 4581328
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm314r
  f64.const 60
  i32.const 4581328
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm314r
  f64.const 61
  i32.const 4581328
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm314r
  f64.const 55
  i32.const 4581328
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm314r
  f64.const 56
  i32.const 4581328
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm314r
  f64.const 30
  i32.const 4581328
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm314r
  f64.const 48
  i32.const 4581328
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm314r
  f64.const 49
  i32.const 4581328
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm314r
  f64.const 24
  i32.const 4581328
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm314r
  f64.const 25
  i32.const 4581328
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm314r
  f64.const 50
  i32.const 4581328
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm314r
  f64.const 32
  i32.const 4581328
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm314r
  f64.const 21
  i32.const 4581328
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm314r
  f64.const 22
  i32.const 4581328
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm314r
  f64.const 29
  i32.const 4581328
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm315
  f64.const 57
  i32.const 4581360
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm315
  f64.const 58
  i32.const 4581360
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm315
  f64.const 59
  i32.const 4581360
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm315
  f64.const 60
  i32.const 4581360
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm315
  f64.const 61
  i32.const 4581360
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm315
  f64.const 55
  i32.const 4581360
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm315
  f64.const 56
  i32.const 4581360
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm315
  f64.const 32
  i32.const 4581392
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm338r
  f64.const 48
  i32.const 4581424
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm338r
  f64.const 49
  i32.const 4581424
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm338r
  f64.const 30
  i32.const 4581424
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm338r
  f64.const 57
  i32.const 4581424
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm338r
  f64.const 58
  i32.const 4581424
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm338r
  f64.const 76
  i32.const 4581424
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm338r
  f64.const 77
  i32.const 4581424
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm338r
  f64.const 59
  i32.const 4581424
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm338r
  f64.const 60
  i32.const 4581424
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm338r
  f64.const 61
  i32.const 4581424
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm338r
  f64.const 55
  i32.const 4581424
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm338r
  f64.const 56
  i32.const 4581424
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm338r
  f64.const 24
  i32.const 4581424
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm338r
  f64.const 25
  i32.const 4581424
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm338r
  f64.const 50
  i32.const 4581424
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm338r
  f64.const 32
  i32.const 4581424
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm338r
  f64.const 21
  i32.const 4581424
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm338r
  f64.const 22
  i32.const 4581424
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm338r
  f64.const 29
  i32.const 4581424
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm392r
  f64.const 29
  i32.const 4581456
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm392r
  f64.const 48
  i32.const 4581456
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm392r
  f64.const 49
  i32.const 4581456
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm392r
  f64.const 30
  i32.const 4581456
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm392r
  f64.const 57
  i32.const 4581456
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm392r
  f64.const 58
  i32.const 4581456
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm392r
  f64.const 76
  i32.const 4581456
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm392r
  f64.const 77
  i32.const 4581456
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm392r
  f64.const 59
  i32.const 4581456
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm392r
  f64.const 60
  i32.const 4581456
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm392r
  f64.const 61
  i32.const 4581456
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm392r
  f64.const 55
  i32.const 4581456
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm392r
  f64.const 56
  i32.const 4581456
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm392r
  f64.const 24
  i32.const 4581456
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm392r
  f64.const 25
  i32.const 4581456
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm392r
  f64.const 50
  i32.const 4581456
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm392r
  f64.const 32
  i32.const 4581456
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm392r
  f64.const 21
  i32.const 4581456
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm392r
  f64.const 22
  i32.const 4581456
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 57
  i32.const 4581488
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 51
  i32.const 4581488
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 52
  i32.const 4581488
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 53
  i32.const 4581488
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 58
  i32.const 4581488
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 76
  i32.const 4581488
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 77
  i32.const 4581488
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 59
  i32.const 4581488
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 60
  i32.const 4581488
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 61
  i32.const 4581488
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 55
  i32.const 4581488
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 56
  i32.const 4581488
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 30
  i32.const 4581488
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 48
  i32.const 4581488
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 49
  i32.const 4581488
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 24
  i32.const 4581488
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 25
  i32.const 4581488
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 50
  i32.const 4581488
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 32
  i32.const 4581488
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 21
  i32.const 4581488
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 22
  i32.const 4581488
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm346r
  f64.const 29
  i32.const 4581488
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm370r
  f64.const 57
  i32.const 4581520
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm370r
  f64.const 51
  i32.const 4581520
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm370r
  f64.const 52
  i32.const 4581520
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm370r
  f64.const 53
  i32.const 4581520
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm370r
  f64.const 58
  i32.const 4581520
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm370r
  f64.const 76
  i32.const 4581520
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm370r
  f64.const 77
  i32.const 4581520
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm370r
  f64.const 59
  i32.const 4581520
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm370r
  f64.const 60
  i32.const 4581520
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm370r
  f64.const 61
  i32.const 4581520
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm370r
  f64.const 55
  i32.const 4581520
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm370r
  f64.const 56
  i32.const 4581520
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm370r
  f64.const 30
  i32.const 4581520
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm370r
  f64.const 48
  i32.const 4581520
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm370r
  f64.const 49
  i32.const 4581520
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm370r
  f64.const 24
  i32.const 4581520
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm370r
  f64.const 25
  i32.const 4581520
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm370r
  f64.const 50
  i32.const 4581520
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm370r
  f64.const 32
  i32.const 4581520
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm370r
  f64.const 21
  i32.const 4581520
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm370r
  f64.const 22
  i32.const 4581520
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm370r
  f64.const 29
  i32.const 4581520
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm261
  f64.const 76
  i32.const 4581552
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm261
  f64.const 77
  i32.const 4581584
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym261
  f64.const 3
  i32.const 4581616
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym261
  f64.const 7
  i32.const 4581648
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 26
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 76
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 77
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 27
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 62
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 38
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 39
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 57
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 58
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 59
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 60
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 61
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 54
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 55
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 56
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 32
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 51
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 52
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 53
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 30
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 48
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 49
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 24
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 25
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 50
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 21
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 22
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 40
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm200r
  f64.const 29
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym200r
  f64.const 3
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym200r
  f64.const 7
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym200r
  f64.const 2
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym200r
  f64.const 6
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym200r
  f64.const 6
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym200r
  f64.const 6
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym200r
  f64.const 6
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym200r
  f64.const 5
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym200r
  f64.const 4
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym200r
  f64.const 0
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym200r
  f64.const 1
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym200r
  f64.const 6
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym200r
  f64.const 6
  i32.const 4581680
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm262
  f64.const 76
  i32.const 4581712
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm262
  f64.const 77
  i32.const 4581744
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym262
  f64.const 3
  i32.const 4581776
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym262
  f64.const 7
  i32.const 4581808
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym262
  f64.const 2
  i32.const 4581840
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym262
  f64.const 6
  i32.const 4581872
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym262
  f64.const 6
  i32.const 4581904
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym262
  f64.const 6
  i32.const 4581936
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 76
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 77
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 26
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 27
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 62
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 38
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 39
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 57
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 58
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 59
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 60
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 61
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 54
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 55
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 56
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 32
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 51
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 52
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 53
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 30
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 48
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 49
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 24
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 25
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 50
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 21
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 22
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 40
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm266r
  f64.const 29
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym266r
  f64.const 3
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym266r
  f64.const 7
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym266r
  f64.const 2
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym266r
  f64.const 6
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym266r
  f64.const 6
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym266r
  f64.const 6
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym266r
  f64.const 6
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym266r
  f64.const 6
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym266r
  f64.const 0
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym266r
  f64.const 6
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym266r
  f64.const 5
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym266r
  f64.const 4
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym266r
  f64.const 1
  i32.const 4581968
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm311
  f64.const 57
  i32.const 4582000
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm311
  f64.const 58
  i32.const 4582000
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm311
  f64.const 76
  i32.const 4582032
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm311
  f64.const 77
  i32.const 4582032
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm311
  f64.const 59
  i32.const 4582064
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm311
  f64.const 60
  i32.const 4582064
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm311
  f64.const 61
  i32.const 4582096
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm311
  f64.const 55
  i32.const 4582128
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm311
  f64.const 56
  i32.const 4582128
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm311
  f64.const 30
  i32.const 4582160
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym311
  f64.const 3
  i32.const 4582032
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym311
  f64.const 7
  i32.const 4582032
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym311
  f64.const 6
  i32.const 4582192
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/tym311
  f64.const 5
  i32.const 4582224
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm250r
  f64.const 57
  i32.const 4582256
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm250r
  f64.const 51
  i32.const 4582256
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm250r
  f64.const 52
  i32.const 4582256
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm250r
  f64.const 53
  i32.const 4582256
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm250r
  f64.const 58
  i32.const 4582256
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm250r
  f64.const 76
  i32.const 4582256
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm250r
  f64.const 77
  i32.const 4582256
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm250r
  f64.const 59
  i32.const 4582256
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm250r
  f64.const 60
  i32.const 4582256
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm250r
  f64.const 61
  i32.const 4582256
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm250r
  f64.const 55
  i32.const 4582256
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm250r
  f64.const 56
  i32.const 4582256
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm250r
  f64.const 30
  i32.const 4582256
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm250r
  f64.const 48
  i32.const 4582256
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm250r
  f64.const 49
  i32.const 4582256
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm250r
  f64.const 24
  i32.const 4582256
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm250r
  f64.const 25
  i32.const 4582256
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm250r
  f64.const 50
  i32.const 4582256
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm250r
  f64.const 32
  i32.const 4582256
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm250r
  f64.const 21
  i32.const 4582256
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm250r
  f64.const 22
  i32.const 4582256
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm250r
  f64.const 29
  i32.const 4582256
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 57
  i32.const 4582288
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 51
  i32.const 4582288
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 52
  i32.const 4582288
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 53
  i32.const 4582288
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 58
  i32.const 4582288
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 76
  i32.const 4582288
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 77
  i32.const 4582288
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 59
  i32.const 4582288
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 60
  i32.const 4582288
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 61
  i32.const 4582288
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 55
  i32.const 4582288
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 56
  i32.const 4582288
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 30
  i32.const 4582288
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 48
  i32.const 4582288
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 49
  i32.const 4582288
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 24
  i32.const 4582288
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 25
  i32.const 4582288
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 50
  i32.const 4582288
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 32
  i32.const 4582288
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 21
  i32.const 4582288
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 22
  i32.const 4582288
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm246r
  f64.const 29
  i32.const 4582288
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm236
  f64.const 48
  i32.const 4582320
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm236
  f64.const 49
  i32.const 4582320
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm236
  f64.const 30
  i32.const 4581040
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm236
  f64.const 57
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm236
  f64.const 58
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm236
  f64.const 76
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm236
  f64.const 77
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm236
  f64.const 59
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm236
  f64.const 60
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm236
  f64.const 61
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm236
  f64.const 55
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm236
  f64.const 56
  i32.const 4581104
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm236r
  f64.const 48
  i32.const 4582352
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm236r
  f64.const 49
  i32.const 4582352
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm236r
  f64.const 24
  i32.const 4582352
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm236r
  f64.const 25
  i32.const 4582352
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm236r
  f64.const 50
  i32.const 4582352
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm236r
  f64.const 32
  i32.const 4582352
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm236r
  f64.const 21
  i32.const 4582352
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm236r
  f64.const 22
  i32.const 4582352
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm234r
  f64.const 24
  i32.const 4582384
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm234r
  f64.const 25
  i32.const 4582384
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm234r
  f64.const 50
  i32.const 4582384
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm234r
  f64.const 32
  i32.const 4582384
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm234r
  f64.const 21
  i32.const 4582384
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm234r
  f64.const 22
  i32.const 4582384
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm234r
  f64.const 48
  i32.const 4582384
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm234r
  f64.const 49
  i32.const 4582384
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm354
  f64.const 24
  i32.const 4580624
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm354
  f64.const 25
  i32.const 4580624
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm354
  f64.const 50
  i32.const 4580400
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm354
  f64.const 32
  i32.const 4582416
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm335r
  f64.const 24
  i32.const 4582448
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm335r
  f64.const 25
  i32.const 4582448
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm335r
  f64.const 50
  i32.const 4582448
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm335r
  f64.const 32
  i32.const 4582448
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm335r
  f64.const 21
  i32.const 4582448
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm335r
  f64.const 22
  i32.const 4582448
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm335r
  f64.const 48
  i32.const 4582448
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm335r
  f64.const 49
  i32.const 4582448
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm376r
  f64.const 57
  i32.const 4582480
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm376r
  f64.const 51
  i32.const 4582480
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm376r
  f64.const 52
  i32.const 4582480
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm376r
  f64.const 53
  i32.const 4582480
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm376r
  f64.const 58
  i32.const 4582480
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm376r
  f64.const 76
  i32.const 4582480
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm376r
  f64.const 77
  i32.const 4582480
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm376r
  f64.const 59
  i32.const 4582480
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm376r
  f64.const 60
  i32.const 4582480
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm376r
  f64.const 61
  i32.const 4582480
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm376r
  f64.const 55
  i32.const 4582480
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm376r
  f64.const 56
  i32.const 4582480
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm376r
  f64.const 30
  i32.const 4582480
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm376r
  f64.const 48
  i32.const 4582480
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm376r
  f64.const 49
  i32.const 4582480
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm376r
  f64.const 24
  i32.const 4582480
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm376r
  f64.const 25
  i32.const 4582480
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm376r
  f64.const 50
  i32.const 4582480
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm376r
  f64.const 32
  i32.const 4582480
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm376r
  f64.const 21
  i32.const 4582480
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm376r
  f64.const 22
  i32.const 4582480
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm376r
  f64.const 29
  i32.const 4582480
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm86r
  f64.const 32
  i32.const 4582512
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm86r
  f64.const 57
  i32.const 4582512
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm86r
  f64.const 58
  i32.const 4582512
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm86r
  f64.const 59
  i32.const 4582512
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm86r
  f64.const 60
  i32.const 4582512
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm86r
  f64.const 61
  i32.const 4582512
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm86r
  f64.const 55
  i32.const 4582512
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm86r
  f64.const 56
  i32.const 4582512
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm227r
  f64.const 32
  i32.const 4582544
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm227r
  f64.const 57
  i32.const 4582544
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm227r
  f64.const 58
  i32.const 4582544
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm227r
  f64.const 59
  i32.const 4582544
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm227r
  f64.const 60
  i32.const 4582544
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm227r
  f64.const 61
  i32.const 4582544
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm227r
  f64.const 55
  i32.const 4582544
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  global.get $input/idm227r
  f64.const 56
  i32.const 4582544
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#set
  call $~lib/rt/pure/__release
  local.get $0
  call $~lib/rt/pure/__release
  local.get $1
  call $~lib/rt/pure/__release
  local.get $2
  call $~lib/rt/pure/__release
  local.get $5
  call $~lib/rt/pure/__release
  local.get $3
  call $~lib/rt/pure/__release
  local.get $4
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
   i32.const 57
   i32.eq
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load offset=4
    i32.const 58
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
     call $input/$sym$literal_symbol
     global.get $input/FAILED
     i32.eqz
     br_if $folding-inner0
    else
     local.get $0
     i32.load offset=4
     i32.const 61
     i32.eq
     if
      local.get $0
      call $input/$sym$escaped_symbol
      global.get $input/FAILED
      i32.eqz
      br_if $folding-inner0
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
 (func $input/State93 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const_0_
  call $input/_skip
  local.get $0
  i32.load offset=4
  i32.const 57
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 58
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
  if
   local.get $0
   call $input/$sym$ignore_symbol
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
       block $__inlined_func$input/State229
        block $folding-inner0
         local.get $1
         i32.load offset=4
         i32.const 57
         i32.eq
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 58
          i32.eq
         end
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 59
          i32.eq
         end
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 60
          i32.eq
         end
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 61
          i32.eq
         end
         br_if $folding-inner0
         local.get $1
         i32.load
         if (result i32)
          local.get $1
          i32.load
          i32.const 4
          i32.eq
         else
          i32.const 1
         end
         br_if $folding-inner0
         local.get $1
         call $input/fail
         br $__inlined_func$input/State229
        end
        i32.const 2
        i32.const 4
        call $input/add_reduce
        i32.const 54
        global.set $input/prod
        global.get $input/stack_ptr
        i32.const 2
        i32.sub
        global.set $input/stack_ptr
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
  i32.const 57
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 58
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
  if
   local.get $0
   call $input/$sym$ignore_symbol
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
       block $__inlined_func$input/State94
        block $folding-inner0
         local.get $1
         i32.load offset=4
         i32.const 57
         i32.eq
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 58
          i32.eq
         end
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 59
          i32.eq
         end
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 60
          i32.eq
         end
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 61
          i32.eq
         end
         br_if $folding-inner0
         local.get $1
         i32.load
         if (result i32)
          local.get $1
          i32.load
          i32.const 4
          i32.eq
         else
          i32.const 1
         end
         br_if $folding-inner0
         local.get $1
         call $input/fail
         br $__inlined_func$input/State94
        end
        i32.const 1
        i32.const 5
        call $input/add_reduce
        i32.const 54
        global.set $input/prod
        global.get $input/stack_ptr
        i32.const 1
        i32.sub
        global.set $input/stack_ptr
       end
       local.get $1
       call $~lib/rt/pure/__release
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
      local.set $3
      global.get $input/prod
      local.set $4
      global.get $input/stack_ptr
      local.set $5
      local.get $1
      call $input/State93
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
 (func $input/$sym$grouped_symbol_HC_listbody1_104 (param $0 i32)
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
   call $input/$sym$grouped_symbol_group_013_103
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
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
     block $case2|1
      block $case1|1
       global.get $input/prod
       local.tee $1
       i32.const 58
       i32.ne
       if
        local.get $1
        i32.const 57
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       i32.load offset=4
       i32.const 54
       i32.eq
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
       local.set $3
       global.get $input/action_ptr
       global.set $input/mark_
       global.get $input/mark_
       local.set $5
       global.get $input/prod
       local.set $6
       global.get $input/stack_ptr
       local.set $7
       local.get $3
       call $~lib/rt/pure/__retain
       local.tee $1
       i32.load
       i32.const 3
       i32.eq
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
        local.get $1
        call $input/$sym$grouped_symbol_group_013_103
        global.get $input/stack_ptr
        i32.const 1
        i32.add
        global.set $input/stack_ptr
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
         block $__inlined_func$input/State91
          block $break|11
           block $case2|12
            global.get $input/prod
            local.tee $2
            i32.const 57
            i32.ne
            if
             local.get $2
             i32.const 58
             i32.eq
             br_if $__inlined_func$input/State91
             br $case2|12
            end
            block $__inlined_func$input/State213
             block $folding-inner0
              local.get $1
              call $~lib/rt/pure/__retain
              local.tee $2
              i32.load offset=4
              i32.const 54
              i32.eq
              br_if $folding-inner0
              local.get $2
              i32.load
              if (result i32)
               local.get $2
               i32.load
               i32.const 1
               i32.eq
              else
               i32.const 1
              end
              if (result i32)
               i32.const 1
              else
               local.get $2
               i32.load
               i32.const 3
               i32.eq
              end
              if (result i32)
               i32.const 1
              else
               local.get $2
               i32.load
               i32.const 4
               i32.eq
              end
              if (result i32)
               i32.const 1
              else
               local.get $2
               i32.load
               i32.const 5
               i32.eq
              end
              if (result i32)
               i32.const 1
              else
               local.get $2
               i32.load
               i32.const 6
               i32.eq
              end
              if (result i32)
               i32.const 1
              else
               local.get $2
               i32.load
               i32.const 7
               i32.eq
              end
              br_if $folding-inner0
              local.get $2
              call $input/fail
              br $__inlined_func$input/State213
             end
             i32.const 2
             i32.const 12
             call $input/add_reduce
             i32.const 58
             global.set $input/prod
             global.get $input/stack_ptr
             i32.const 2
             i32.sub
             global.set $input/stack_ptr
            end
            local.get $2
            call $~lib/rt/pure/__release
            br $break|11
           end
           local.get $1
           call $input/fail
           br $__inlined_func$input/State91
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
        local.get $3
        call $~lib/rt/pure/__release
        return
       else
        local.get $0
        local.get $3
        call $input/Lexer#sync
       end
       local.get $3
       call $~lib/rt/pure/__release
       br $break|1
      end
      block $__inlined_func$input/State55
       block $folding-inner00
        local.get $0
        call $~lib/rt/pure/__retain
        local.tee $1
        i32.load offset=4
        i32.const 54
        i32.eq
        br_if $folding-inner00
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
         i32.const 4
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
        br_if $folding-inner00
        local.get $1
        call $input/fail
        br $__inlined_func$input/State55
       end
       i32.const 1
       i32.const 13
       call $input/add_reduce
       i32.const 58
       global.set $input/prod
       global.get $input/stack_ptr
       i32.const 1
       i32.sub
       global.set $input/stack_ptr
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
   i32.const 57
   i32.eq
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load offset=4
    i32.const 58
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
     call $input/$sym$literal_symbol
     global.get $input/FAILED
     i32.eqz
     br_if $folding-inner0
    else
     local.get $0
     i32.load offset=4
     i32.const 61
     i32.eq
     if
      local.get $0
      call $input/$sym$escaped_symbol
      global.get $input/FAILED
      i32.eqz
      br_if $folding-inner0
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
       call $~lib/rt/pure/__retain
       local.tee $1
       global.get $input/const__
       call $input/_skip
       local.get $1
       call $input/$sym$grouped_symbol_HC_listbody1_104
       block $__inlined_func$input/$sym$grouped_symbol
        local.get $1
        i32.load offset=4
        i32.const 54
        i32.eq
        if (result i32)
         i32.const 1
        else
         local.get $1
         i32.load
         i32.const 1
         i32.eq
        end
        if (result i32)
         i32.const 1
        else
         local.get $1
         i32.load
         i32.const 4
         i32.eq
        end
        if
         local.get $1
         call $input/$sym$sym_delimter
         global.get $input/FAILED
         i32.eqz
         if
          i32.const 59
          call $input/setProduction
          i32.const 2
          i32.const 54
          call $input/add_reduce
          br $__inlined_func$input/$sym$grouped_symbol
         end
        else
         global.get $input/FAILED
         i32.eqz
         if
          i32.const 59
          call $input/setProduction
          i32.const 1
          i32.const 54
          call $input/add_reduce
          br $__inlined_func$input/$sym$grouped_symbol
         end
        end
        local.get $1
        call $input/fail
       end
       local.get $1
       call $~lib/rt/pure/__release
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
 (func $input/State42 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const_0_
  call $input/_skip
  block $folding-inner0
   local.get $0
   i32.load offset=4
   i32.const 57
   i32.eq
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load offset=4
    i32.const 58
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
   br_if $folding-inner0
   local.get $0
   i32.load
   if (result i32)
    local.get $0
    i32.load
    i32.const 3
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
   br_if $folding-inner0
   local.get $0
   call $input/fail
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  i32.const 1
  i32.const 5
  call $input/add_reduce
  i32.const 5
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 1
  i32.sub
  global.set $input/stack_ptr
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State194 (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const_0_
  call $input/_skip
  block $folding-inner0
   local.get $0
   i32.load offset=4
   i32.const 57
   i32.eq
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load offset=4
    i32.const 58
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
   br_if $folding-inner0
   local.get $0
   i32.load
   if (result i32)
    local.get $0
    i32.load
    i32.const 3
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
   br_if $folding-inner0
   local.get $0
   call $input/fail
   local.get $0
   call $~lib/rt/pure/__release
   return
  end
  i32.const 2
  i32.const 4
  call $input/add_reduce
  i32.const 5
  global.set $input/prod
  global.get $input/stack_ptr
  i32.const 2
  i32.sub
  global.set $input/stack_ptr
  local.get $0
  call $~lib/rt/pure/__release
 )
 (func $input/State41 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const_0_
  call $input/_skip
  local.get $0
  i32.load offset=4
  i32.const 57
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 58
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
    call $input/$sym$lexer_symbol
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
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
       i32.const 55
       i32.ne
       if
        local.get $2
        i32.const 5
        i32.eq
        br_if $case1|1
        br $case2|1
       end
       local.get $0
       call $input/State194
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
  i32.const 57
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 58
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
    call $input/$sym$lexer_symbol
    global.get $input/stack_ptr
    i32.const 1
    i32.add
    global.set $input/stack_ptr
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
       call $input/State42
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
      local.set $3
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
 (func $input/$pre$import_preamble_HC_listbody2_102 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const_1_
  call $input/_skip
  local.get $0
  i32.load
  i32.const 1
  i32.eq
  if
   local.get $0
   call $input/_no_check
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
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
     global.get $input/prod
     i32.const 12
     i32.eq
     if
      local.get $0
      i32.load
      if (result i32)
       local.get $0
       i32.load
       i32.const 3
       i32.eq
      else
       i32.const 1
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
      local.set $3
      global.get $input/action_ptr
      global.set $input/mark_
      global.get $input/mark_
      local.set $5
      global.get $input/prod
      local.set $6
      global.get $input/stack_ptr
      local.set $7
      local.get $3
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
        i32.const 2
        i32.const 4
        call $input/add_reduce
        i32.const 12
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
      else
       local.get $2
       call $input/fail
      end
      local.get $2
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
       local.get $3
       call $~lib/rt/pure/__release
       return
      else
       local.get $0
       local.get $3
       call $input/Lexer#sync
      end
      local.get $3
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
 (func $input/State18 (param $0 i32)
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
       call $input/State18
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
 (func $input/$pre$import_preamble_HC_listbody4_105 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const_1_
  call $input/_skip
  local.get $0
  i32.load
  i32.const 1
  i32.eq
  if
   local.get $0
   call $input/_no_check
   global.get $input/stack_ptr
   i32.const 1
   i32.add
   global.set $input/stack_ptr
   local.get $0
   call $~lib/rt/pure/__retain
   local.tee $1
   global.get $input/const_1_
   call $input/_skip
   block $__inlined_func$input/State26
    block $folding-inner0
     local.get $1
     i32.load offset=4
     i32.const 19
     i32.eq
     if (result i32)
      i32.const 1
     else
      local.get $1
      i32.load offset=4
      i32.const 20
      i32.eq
     end
     br_if $folding-inner0
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
     br_if $folding-inner0
     local.get $1
     call $input/fail
     br $__inlined_func$input/State26
    end
    i32.const 1
    i32.const 5
    call $input/add_reduce
    i32.const 15
    global.set $input/prod
    global.get $input/stack_ptr
    i32.const 1
    i32.sub
    global.set $input/stack_ptr
   end
   local.get $1
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
     global.get $input/prod
     i32.const 15
     i32.eq
     if
      local.get $0
      i32.load offset=4
      i32.const 19
      i32.eq
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
      local.set $3
      global.get $input/action_ptr
      global.set $input/mark_
      global.get $input/mark_
      local.set $5
      global.get $input/prod
      local.set $6
      global.get $input/stack_ptr
      local.set $7
      local.get $3
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
       block $__inlined_func$input/State182
        block $folding-inner00
         local.get $1
         i32.load offset=4
         i32.const 19
         i32.eq
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 20
          i32.eq
         end
         br_if $folding-inner00
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
         br_if $folding-inner00
         local.get $1
         call $input/fail
         br $__inlined_func$input/State182
        end
        i32.const 2
        i32.const 4
        call $input/add_reduce
        i32.const 15
        global.set $input/prod
        global.get $input/stack_ptr
        i32.const 2
        i32.sub
        global.set $input/stack_ptr
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
       local.get $3
       call $~lib/rt/pure/__release
       return
      else
       local.get $0
       local.get $3
       call $input/Lexer#sync
      end
      local.get $3
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
 (func $input/$pre$import_preamble_group_021_106 (param $0 i32)
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
   if
    local.get $0
    call $input/_no_check
    global.get $input/FAILED
    i32.eqz
    br_if $folding-inner0
   else
    local.get $0
    i32.load offset=4
    i32.const 20
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
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  call $input/_no_check
  local.get $0
  global.get $input/const_1_
  i32.const 17
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
   call $input/$pre$import_preamble_HC_listbody2_102
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
   i32.const 10
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
     i32.const 13
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
     i32.const 10
     call $input/_with_skip
     block $__inlined_func$input/$pre$ignore_preamble
      global.get $input/FAILED
      i32.eqz
      if
       local.get $1
       global.get $input/const__
       i32.const 13
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
      i32.const 11
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
      i32.const 10
      call $input/_with_skip
      block $__inlined_func$input/$pre$symbols_preamble
       global.get $input/FAILED
       i32.eqz
       if
        local.get $1
        global.get $input/const__
        i32.const 11
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
       i32.const 12
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
       i32.const 10
       call $input/_with_skip
       block $__inlined_func$input/$pre$precedence_preamble
        global.get $input/FAILED
        i32.eqz
        if
         local.get $1
         global.get $input/const__
         i32.const 12
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
        i32.const 15
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
        i32.const 10
        call $input/_with_skip
        block $__inlined_func$input/$pre$name_preamble
         global.get $input/FAILED
         i32.eqz
         if
          local.get $1
          global.get $input/const__
          i32.const 15
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
         i32.const 16
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
         i32.const 10
         call $input/_with_skip
         block $__inlined_func$input/$pre$ext_preamble
          global.get $input/FAILED
          i32.eqz
          if
           local.get $1
           global.get $input/const__
           i32.const 16
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
          i32.const 14
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
          i32.const 10
          call $input/_with_skip
          block $__inlined_func$input/$pre$error_preamble
           global.get $input/FAILED
           i32.eqz
           if
            local.get $1
            global.get $input/const__
            i32.const 14
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
           i32.const 17
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
    i32.const 50
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
 (func $input/$pre$preamble (param $0 i32)
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
  local.get $0
  i32.load offset=4
  i32.const 10
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 50
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
       block $__inlined_func$input/State29
        block $folding-inner0
         local.get $1
         i32.load offset=4
         i32.const 10
         i32.eq
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 21
          i32.eq
         end
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 22
          i32.eq
         end
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 23
          i32.eq
         end
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 48
          i32.eq
         end
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 49
          i32.eq
         end
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 50
          i32.eq
         end
         br_if $folding-inner0
         local.get $1
         i32.load
         i32.eqz
         br_if $folding-inner0
         local.get $1
         call $input/fail
         br $__inlined_func$input/State29
        end
        i32.const 1
        i32.const 5
        call $input/add_reduce
        i32.const 3
        global.set $input/prod
        global.get $input/stack_ptr
        i32.const 1
        i32.sub
        global.set $input/stack_ptr
       end
       local.get $1
       call $~lib/rt/pure/__release
       br $break|1
      end
      local.get $0
      i32.load offset=4
      i32.const 21
      i32.eq
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 22
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 23
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 48
       i32.eq
      end
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load offset=4
       i32.const 49
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
      local.set $3
      global.get $input/action_ptr
      global.set $input/mark_
      global.get $input/mark_
      local.set $5
      global.get $input/prod
      local.set $6
      global.get $input/stack_ptr
      local.set $7
      local.get $3
      call $~lib/rt/pure/__retain
      local.tee $2
      global.get $input/const__
      call $input/_skip
      local.get $2
      i32.load offset=4
      i32.const 10
      i32.eq
      if (result i32)
       i32.const 1
      else
       local.get $2
       i32.load offset=4
       i32.const 50
       i32.eq
      end
      if
       local.get $2
       call $input/$pre$preamble_clause
       global.get $input/stack_ptr
       i32.const 1
       i32.add
       global.set $input/stack_ptr
      else
       local.get $2
       call $input/fail
      end
      global.get $input/stack_ptr
      local.set $8
      loop $while-continue|00
       local.get $8
       global.get $input/stack_ptr
       i32.le_u
       if
        block $__inlined_func$input/State28
         block $break|11
          block $case2|12
           global.get $input/prod
           local.tee $1
           i32.const 4
           i32.ne
           if
            local.get $1
            i32.const 3
            i32.eq
            br_if $__inlined_func$input/State28
            br $case2|12
           end
           local.get $2
           call $~lib/rt/pure/__retain
           local.tee $1
           global.get $input/const__
           call $input/_skip
           block $__inlined_func$input/State183
            block $folding-inner00
             local.get $1
             i32.load offset=4
             i32.const 10
             i32.eq
             if (result i32)
              i32.const 1
             else
              local.get $1
              i32.load offset=4
              i32.const 21
              i32.eq
             end
             if (result i32)
              i32.const 1
             else
              local.get $1
              i32.load offset=4
              i32.const 22
              i32.eq
             end
             if (result i32)
              i32.const 1
             else
              local.get $1
              i32.load offset=4
              i32.const 23
              i32.eq
             end
             if (result i32)
              i32.const 1
             else
              local.get $1
              i32.load offset=4
              i32.const 48
              i32.eq
             end
             if (result i32)
              i32.const 1
             else
              local.get $1
              i32.load offset=4
              i32.const 49
              i32.eq
             end
             if (result i32)
              i32.const 1
             else
              local.get $1
              i32.load offset=4
              i32.const 50
              i32.eq
             end
             br_if $folding-inner00
             local.get $1
             i32.load
             i32.eqz
             br_if $folding-inner00
             local.get $1
             call $input/fail
             br $__inlined_func$input/State183
            end
            i32.const 2
            i32.const 4
            call $input/add_reduce
            i32.const 3
            global.set $input/prod
            global.get $input/stack_ptr
            i32.const 2
            i32.sub
            global.set $input/stack_ptr
           end
           local.get $1
           call $~lib/rt/pure/__release
           br $break|11
          end
          local.get $2
          call $input/fail
          br $__inlined_func$input/State28
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
      local.get $2
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
       local.get $3
       call $~lib/rt/pure/__release
       return
      else
       local.get $0
       local.get $3
       call $input/Lexer#sync
      end
      local.get $3
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
 (func $input/State33 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  global.get $input/idm33
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm33
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
       block $case2|1
        block $case1|1
         global.get $input/prod
         local.tee $1
         i32.const 44
         i32.ne
         if
          local.get $1
          i32.const 34
          i32.eq
          br_if $case1|1
          local.get $1
          i32.const 24
          i32.eq
          br_if $case2|1
          local.get $1
          i32.const 19
          i32.eq
          br_if $case3|1
          br $case4|1
         end
         local.get $0
         call $~lib/rt/pure/__retain
         local.tee $1
         global.get $input/const__
         call $input/_skip
         block $__inlined_func$input/State191
          block $folding-inner0
           local.get $1
           i32.load offset=4
           i32.const 21
           i32.eq
           if (result i32)
            i32.const 1
           else
            local.get $1
            i32.load offset=4
            i32.const 22
            i32.eq
           end
           if (result i32)
            i32.const 1
           else
            local.get $1
            i32.load offset=4
            i32.const 48
            i32.eq
           end
           if (result i32)
            i32.const 1
           else
            local.get $1
            i32.load offset=4
            i32.const 49
            i32.eq
           end
           if (result i32)
            i32.const 1
           else
            local.get $1
            i32.load offset=4
            i32.const 50
            i32.eq
           end
           br_if $folding-inner0
           local.get $1
           i32.load
           i32.eqz
           br_if $folding-inner0
           local.get $1
           call $input/fail
           br $__inlined_func$input/State191
          end
          i32.const 2
          i32.const 1
          call $input/add_reduce
          i32.const 19
          global.set $input/prod
          global.get $input/stack_ptr
          i32.const 2
          i32.sub
          global.set $input/stack_ptr
         end
         local.get $1
         call $~lib/rt/pure/__release
         br $break|1
        end
        local.get $0
        call $~lib/rt/pure/__retain
        local.tee $1
        global.get $input/const__
        call $input/_skip
        block $__inlined_func$input/State192
         block $folding-inner00
          local.get $1
          i32.load offset=4
          i32.const 21
          i32.eq
          if (result i32)
           i32.const 1
          else
           local.get $1
           i32.load offset=4
           i32.const 22
           i32.eq
          end
          if (result i32)
           i32.const 1
          else
           local.get $1
           i32.load offset=4
           i32.const 48
           i32.eq
          end
          if (result i32)
           i32.const 1
          else
           local.get $1
           i32.load offset=4
           i32.const 49
           i32.eq
          end
          if (result i32)
           i32.const 1
          else
           local.get $1
           i32.load offset=4
           i32.const 50
           i32.eq
          end
          br_if $folding-inner00
          local.get $1
          i32.load
          i32.eqz
          br_if $folding-inner00
          local.get $1
          call $input/fail
          br $__inlined_func$input/State192
         end
         i32.const 2
         i32.const 18
         call $input/add_reduce
         i32.const 19
         global.set $input/prod
         global.get $input/stack_ptr
         i32.const 2
         i32.sub
         global.set $input/stack_ptr
        end
        local.get $1
        call $~lib/rt/pure/__release
        br $break|1
       end
       local.get $0
       call $~lib/rt/pure/__retain
       local.tee $1
       global.get $input/const__
       call $input/_skip
       block $__inlined_func$input/State190
        block $folding-inner01
         local.get $1
         i32.load offset=4
         i32.const 21
         i32.eq
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 22
          i32.eq
         end
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 48
          i32.eq
         end
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 49
          i32.eq
         end
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 50
          i32.eq
         end
         br_if $folding-inner01
         local.get $1
         i32.load
         i32.eqz
         br_if $folding-inner01
         local.get $1
         call $input/fail
         br $__inlined_func$input/State190
        end
        i32.const 2
        i32.const 17
        call $input/add_reduce
        i32.const 19
        global.set $input/prod
        global.get $input/stack_ptr
        i32.const 2
        i32.sub
        global.set $input/stack_ptr
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
 (func $input/$prd$productions (param $0 i32)
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
  global.get $input/idm30
  local.get $0
  i32.load offset=4
  f64.convert_i32_s
  call $~lib/map/Map<f64,%28input/Lexer%29=>void>#has
  if
   i32.const 1
   global.set $~argumentsLength
   local.get $0
   global.get $input/idm30
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
     block $case3|1
      block $case2|1
       block $case1|1
        global.get $input/prod
        local.tee $1
        i32.const 34
        i32.ne
        if
         local.get $1
         i32.const 24
         i32.eq
         br_if $case1|1
         local.get $1
         i32.const 19
         i32.eq
         br_if $case2|1
         br $case3|1
        end
        local.get $0
        call $~lib/rt/pure/__retain
        local.tee $1
        global.get $input/const__
        call $input/_skip
        block $__inlined_func$input/State32
         block $folding-inner0
          local.get $1
          i32.load offset=4
          i32.const 21
          i32.eq
          if (result i32)
           i32.const 1
          else
           local.get $1
           i32.load offset=4
           i32.const 22
           i32.eq
          end
          if (result i32)
           i32.const 1
          else
           local.get $1
           i32.load offset=4
           i32.const 48
           i32.eq
          end
          if (result i32)
           i32.const 1
          else
           local.get $1
           i32.load offset=4
           i32.const 49
           i32.eq
          end
          if (result i32)
           i32.const 1
          else
           local.get $1
           i32.load offset=4
           i32.const 50
           i32.eq
          end
          br_if $folding-inner0
          local.get $1
          i32.load
          i32.eqz
          br_if $folding-inner0
          local.get $1
          call $input/fail
          br $__inlined_func$input/State32
         end
         i32.const 1
         i32.const 16
         call $input/add_reduce
         i32.const 19
         global.set $input/prod
         global.get $input/stack_ptr
         i32.const 1
         i32.sub
         global.set $input/stack_ptr
        end
        local.get $1
        call $~lib/rt/pure/__release
        br $break|1
       end
       local.get $0
       call $~lib/rt/pure/__retain
       local.tee $1
       global.get $input/const__
       call $input/_skip
       block $__inlined_func$input/State31
        block $folding-inner00
         local.get $1
         i32.load offset=4
         i32.const 21
         i32.eq
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 22
          i32.eq
         end
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 48
          i32.eq
         end
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 49
          i32.eq
         end
         if (result i32)
          i32.const 1
         else
          local.get $1
          i32.load offset=4
          i32.const 50
          i32.eq
         end
         br_if $folding-inner00
         local.get $1
         i32.load
         i32.eqz
         br_if $folding-inner00
         local.get $1
         call $input/fail
         br $__inlined_func$input/State31
        end
        i32.const 1
        i32.const 15
        call $input/add_reduce
        i32.const 19
        global.set $input/prod
        global.get $input/stack_ptr
        i32.const 1
        i32.sub
        global.set $input/stack_ptr
       end
       local.get $1
       call $~lib/rt/pure/__release
       br $break|1
      end
      local.get $0
      i32.load
      i32.eqz
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
 (func $input/$head (param $0 i32)
  local.get $0
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
  i32.load offset=4
  i32.const 10
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=4
   i32.const 50
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
   i32.const 21
   i32.eq
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load offset=4
    i32.const 22
    i32.eq
   end
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load offset=4
    i32.const 23
    i32.eq
   end
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load offset=4
    i32.const 48
    i32.eq
   end
   if (result i32)
    i32.const 1
   else
    local.get $0
    i32.load offset=4
    i32.const 49
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
  local.tee $1
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
  local.get $1
  call $~lib/rt/pure/__retain
  local.tee $0
  global.get $input/const__
  call $input/_skip
  local.get $0
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
   local.get $0
   call $input/fail
  end
  local.get $0
  call $~lib/rt/pure/__release
  i32.const 0
  call $input/set_action
  i32.const 0
  call $input/set_error
  global.get $input/FAILED
  if (result i32)
   i32.const 1
  else
   local.get $1
   i32.load offset=12
   global.get $input/str
   i32.const 20
   i32.sub
   i32.load offset=16
   i32.const 1
   i32.shr_u
   i32.lt_s
  end
  local.get $1
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
      local.get $1
      i32.load offset=4
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
  i32.const 4582636
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
