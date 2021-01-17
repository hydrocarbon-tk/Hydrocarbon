import { SC } from "../utilities/skribble.js";

const this_flags = SC.Member(SC.This(), "flags:unsigned int");

export const createStateCode = (): SC => {
    return SC.Class(
        "State"
    ).addStatement(
        SC.Declare(
            SC.Variable("flags:unsigned int"),
            SC.Variable("prod:int"),
        ),

        SC.Function(
            "constructor"
        ).addStatement(
            SC.Assignment(SC.Member(SC.This(), "flags"), 2),
            SC.Assignment(SC.Member(SC.This(), "prod"), -1),
        ),

        SC.Function(
            "copy:State&",
            SC.Assignment("destination:State&", SC.UnaryPre("new", SC.Call("State")))
        ).addStatement(
            SC.Assignment(SC.Member("destination", "flags"), SC.Member(SC.This(), "flags")),
            SC.UnaryPre(SC.Return, SC.Value("destination"))
        ),

        SC.Function(
            "sync:void",
            SC.Assignment("marker:State", SC.UnaryPre("new", SC.Call("State")))
        ).addStatement(
            SC.Call(SC.Member("marker", "copy"), SC.This())
        ),
        /*
  
      getFAILED(flag){
          return flag & 1
      }*/

        SC.Function("getFAILED:bool")
            .addStatement(
                SC.UnaryPre(SC.Return, SC.Binary(SC.Binary(this_flags, "&", 1), "==", 1))
            ),

        /*
     
        setFAILED(flag, failed){
            this.flags =  (flag & 0xFFFFFFFE ) | failed;
        }*/

        SC.Function("setFAILED:void", "failed:unsigned int")
            .addStatement(
                SC.Assignment(this_flags, SC.Binary(SC.Binary(this_flags, "&", "0xFFFFFFFE"), "|", "failed"))
            ),


        /*
        getENABLE_STACK_OUTPUT(flag){
            return flag & 2
        }*/

        SC.Function("getENABLE_STACK_OUTPUT:unsigned int")
            .addStatement(
                SC.UnaryPre(SC.Return, SC.Binary(SC.Binary(this_flags, "&", 2), ">", 0))
            ),


        /*
        setENABLE_STACK_OUTPUT(flag, enable){
            this.flags = (flag & 0xFFFFFFFD ) | enable;
        }*/

        SC.Function("setENABLE_STACK_OUTPUT:void", "enabled:unsigned int")
            .addStatement(
                SC.Assignment(this_flags, SC.Binary(SC.Binary(this_flags, "&", "0xFFFFFFFD"), "|", "enabled"))
            ),

        /*
        getProd(flag){
            return flag >> 12;
        }*/

        SC.Function("getProd:unsigned int")
            .addStatement(
                SC.UnaryPre(SC.Return, SC.Binary(this_flags, ">>", 12))
            ),

        /*
     
        flag = setProd(flag, prod_val){
            this.flags = (flag & 0xFFF) | (prod_val << 12);
        }*/

        SC.Function("setProd:void", "prod_val:unsigned int")
            .addStatement(
                SC.Assignment(this_flags, SC.Binary(SC.Binary(this_flags, "&", "0xFFF"), "|", SC.Binary("prod_value", "<<", 12)))
            )

    );
};