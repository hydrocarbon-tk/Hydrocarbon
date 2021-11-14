/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */

export function formatArray(state_buffer: Iterable<any>, array_row_size: number) {
    return Array.from(state_buffer)
        .reduce((r, v, i) => {

            if (r.length == 0)
                return [v + ""];
            else if (r[r.length - 1].length >= array_row_size)
                r.push(v);


            else
                r[r.length - 1] += "," + v;
            return r;
        }, []).map(d => d + ",").join("\n");
}
