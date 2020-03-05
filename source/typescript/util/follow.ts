//@ts-nocheck
export const EMPTY_PRODUCTION = "{!--EMPTY_PRODUCTION--!}";

export const isNonTerm = (f) => f.type == "production";

import { FIRST } from "./first.js";

const merge = (follow, first) => {
    first.forEach((v) => {
        if (v !== EMPTY_PRODUCTION)
            follow.add(v);
    });
};

export function FOLLOW(grammar, production) {

    const
        prod = grammar[production],
        table = [];

    if (prod.follow) return grammar[production].follow;

    for (let i = 0; i < grammar.length; i++) {
        grammar[i].follow = new Set();
        table.push(grammar[i].follow);
    }

    table[0].add("$eof"); //End of Line

    for (let i = 0; i < grammar.length; i++) {
        const production = grammar[i];

        for (let i = 0; i < production.bodies.length; i++) {
            const body = production.bodies[i];

            for (let i = 0; i < body.length; i++) {
                const val = body[i];

                if (isNonTerm(val)) {

                    const follow = table[val];

                    for (var j = i + 1; j < body.length; j++) {

                        const
                            val = body[j],
                            body_index = i;

                        if (isNonTerm(val)) {

                            merge(follow, FIRST(grammar, val));

                            if (new Set(FIRST(grammar, val)).has(EMPTY_PRODUCTION))
                                continue;
                        } else {
                            if (val !== EMPTY_PRODUCTION)
                                follow.add(val);
                        }
                        break;
                    }

                }
            }
        }
    }

    for (let production_index = 0; production_index < grammar.length; production_index++) {

        const production = grammar[production_index];

        for (let i = 0; i < production.bodies.length; i++) {

            const body = production.bodies[i];

            for (let i = body.length; i > 0; i--) {

                const val = body[i - 1];

                if (isNonTerm(val)) {

                    if (val !== production_index)
                        merge(table[val], table[production_index]);

                    if (new Set(FIRST(grammar, val)).has(EMPTY_PRODUCTION))
                        continue;
                }

                break;
            }
        }
    }



    return prod.follow;
}