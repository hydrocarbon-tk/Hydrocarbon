export var StateActionEnum;
(function (StateActionEnum) {
    StateActionEnum[StateActionEnum["ERROR"] = 0] = "ERROR";
    StateActionEnum[StateActionEnum["ACCEPT"] = 1] = "ACCEPT";
    StateActionEnum[StateActionEnum["SHIFT"] = 2] = "SHIFT";
    StateActionEnum[StateActionEnum["REDUCE"] = 3] = "REDUCE";
    StateActionEnum[StateActionEnum["FORK_ACTION"] = 4] = "FORK_ACTION";
    StateActionEnum[StateActionEnum["FORK"] = 4] = "FORK";
    StateActionEnum[StateActionEnum["GOTO"] = 5] = "GOTO";
    StateActionEnum[StateActionEnum["DO_NOTHING"] = 6] = "DO_NOTHING";
    StateActionEnum[StateActionEnum["IGNORE"] = 6] = "IGNORE";
})(StateActionEnum || (StateActionEnum = {}));
