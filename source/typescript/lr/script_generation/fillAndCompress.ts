import { compress } from "./compress.js";
//*
export function fillAndCompress(array) {
    const copy = array.slice();
    // Fill out empty entries in state_map with -1 
    for (let i = 0; i < copy.length; i++)
        if (copy[i] === undefined)
            copy[i] = -1;
    // Compress state map by reducing -1 entries and series of duplicate values
    return copy.reduce(compress, []).map(n => n.toString(36)).join(";");
}
