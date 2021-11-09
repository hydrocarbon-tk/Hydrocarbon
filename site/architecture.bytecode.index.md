## Pointer

![Pointer SVG](./resources/img/Pointer.0.bytecode.svg)


Every state is represented by a series of 32bit instructions stored in 
the bytecode buffer. A 32bit pointer is used to locate the head of a state's 
instruction sequence offset from the 0th index of the bytecode buffer. When parsing, 
an entry pointer is passed as an argument to the recognizer to start the parsing at 
a suitable entry state.

The actual pointer index is stored in the first 24bits of the pointer word, giving an address range of 
0x000000 to 0xFFFFFF and a maximum bytecode size of 16,777,216 words or 68MB. 

The uppermost 8bits are reserved as "meta" data, including three flag bits:
- `GT` - bit 25 - Indicates pointed to state is a GOTO. This is used to determine fork join points. 
- `NM` - bit 26 - Indicates the state is active during normal mode parsing.
- `FL` - bit 27 - Indicates the state is active during fail mode parsing.

The last 4 bit (`Instruction`) is reserved for instruction data. This allows a full state pointer
to serve as both an inline instruction as well as a plain state pointer. This 
feature is leveraged with GOTO instruction, allowing such words to be simply copied to 
the state stack when it is decoded.

# Instructions




## Pass

![Pass SVG](./resources/img/Pass.0.bytecode.svg)



#### Assembly name: `END_`

Sets the ERROR flag to `0x0` then exits the instruction decoder 
and returns control to the state decoder.



## Consume

![Consume SVG](./resources/img/Consume.0.bytecode.svg)



#### Assembly name: `EAT_`



## GOTO

![GOTO SVG](./resources/img/GOTO.0.bytecode.svg)



#### Assembly name: `GOTO`
    


## Set Production

![Set Production SVG](./resources/img/Set_Production.0.bytecode.svg)



#### Assembly name: `EAT_`
    


## Reduce Accumulated

![Reduce Accumulated SVG](./resources/img/Reduce_Accumulated.0.bytecode.svg)



#### Assembly name: `EAT_`
    


## Reduce Normal

![Reduce Normal SVG](./resources/img/Reduce_Normal.0.bytecode.svg)



#### Assembly name: `RED_`
    


## Token Length

![Token Length SVG](./resources/img/Token_Length.0.bytecode.svg)



#### Assembly name: `TKLN`
    


## Token Assign

![Token Assign SVG](./resources/img/Token_Assign.0.bytecode.svg)



#### Assembly name: `TKID`
    


## Token Assign And Consume

![Token Assign And Consume SVG](./resources/img/Token_Assign_And_Consume.0.bytecode.svg)



#### Assembly name: `TKCS`
    


## Fork To

![Fork To SVG](./resources/img/Fork_To.0.bytecode.svg)



#### Assembly name: `FORK`
    


## Scan Back Until

![Scan Back Until SVG](./resources/img/Scan_Back_Until.0.bytecode.svg)



#### Assembly name: `SCNB`
    


## Scan Until

![Scan Until SVG](./resources/img/Scan_Until.0.bytecode.svg)



#### Assembly name: `SCNF`
    


## Table Branch

![Table Branch SVG](./resources/img/Table_Branch.0.bytecode.svg)
![Table Branch SVG](./resources/img/Table_Branch.1.bytecode.svg)
![Table Branch SVG](./resources/img/Table_Branch.2.bytecode.svg)



#### Assembly name: `JMPT`
    


## Hash Branch

![Hash Branch SVG](./resources/img/Hash_Branch.0.bytecode.svg)
![Hash Branch SVG](./resources/img/Hash_Branch.1.bytecode.svg)
![Hash Branch SVG](./resources/img/Hash_Branch.2.bytecode.svg)



#### Assembly name: `HASH`
    


## Set Fail State

![Set Fail State SVG](./resources/img/Set_Fail_State.0.bytecode.svg)



#### Assembly name: `SETF`
    


## Repeat

![Repeat SVG](./resources/img/Repeat.0.bytecode.svg)



#### Assembly name: `RPT_`
    


## Not Used

![Not Used SVG](./resources/img/Not_Used.0.bytecode.svg)





## Fail

![Fail SVG](./resources/img/Fail.0.bytecode.svg)



#### Assembly name: `FAIL`
    


## Fall Through

![Fall Through SVG](./resources/img/Fall_Through.0.bytecode.svg)



#### Assembly name: `FALL`
    

