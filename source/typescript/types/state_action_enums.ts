export const enum StateActionEnumConst {
    ERROR = 0,
    ACCEPT = 1,
    SHIFT = 2,
    REDUCE = 3,
    FORK_ACTION = 4,
    FORK = 4,
    GOTO = 5,
    DO_NOTHING = 6,
    IGNORE = 6
}
export enum StateActionEnum {
    ERROR = StateActionEnumConst.ERROR,
    ACCEPT = StateActionEnumConst.ACCEPT,
    SHIFT = StateActionEnumConst.SHIFT,
    REDUCE = StateActionEnumConst.REDUCE,
    FORK_ACTION = StateActionEnumConst.FORK_ACTION,
    FORK = StateActionEnumConst.FORK,
    GOTO = StateActionEnumConst.GOTO,
    DO_NOTHING = StateActionEnumConst.DO_NOTHING,
    IGNORE = StateActionEnumConst.IGNORE
}
