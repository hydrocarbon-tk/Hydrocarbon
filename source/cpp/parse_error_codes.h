#pragma once

enum class ParseErrorCode : int {
    InvalidToken           = 10001,
    ErrorStateReached      = 10002,
    InvalidGotoState       = 10003,
    UnexpectedEndOfOutput  = 10004,
    CannotAllocateBuffer   = 10005,
    CannotAllocateSpace    = 10006,
    MaxStatePointerReached = 10007
};