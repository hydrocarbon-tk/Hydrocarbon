
#pragma once
#include "./lookup_table.h"
#include "./type_defs.h"
namespace HYDROCARBON
{
    /*
 * Retrieves the number of UTF8 elements (bytes) required to 
 * store the given code point
 */
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

    u32 get_utf8_code_point_from(u32 word)
    {
        if ((word & 0x80000000) > 0)
        {
            let a = (word >> 24) & 0xFF;
            let b = (word >> 16) & 0xFF;
            let c = (word >> 8) & 0xFF;
            let d = (word >> 0) & 0xFF;

            if ((word & 0xE0C00000) == 0xC0800000)
            {
                return ((a & 0x1F) << 6) | b & 0x3Fl
            }
            else if ((word & 0xF0C0C000) == 0xE0808000)
            {
                return ((a & 0xF) << 12) | ((b & 0x3F) << 6) | (c & 0x3F);
            }
            else if ((word & 0xF8C0C0C0) == 0xF0808080)
            {
                return ((a & 0x7) << 18) | ((b & 0x3F) << 12) | ((c & 0x3F) << 6) | (d & 0x3F);
            }
            else
            {
                return 0;
            }
        }
        else
        {
            return (word >> 24) & 0xFF;
        }
    }

    u32 getTypeAt(u32 codepoint)
    {
        return CHAR_LU_TYPE[codepoint];
    }
}