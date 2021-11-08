/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { ASYTRIPContext, ASYTRIPStruct, getTypeString, ResolvedProp } from '../types/index.js';
import {
    getResolvedType, JSONFilter, TypeIsNotNull,
    TypeIsNull, TypeIsStruct, TypeIsVector,
    TypesAre,
    TypesInclude,
    TypesRequiresDynamic
} from './common.js';

type GenTypeInfo = (
    context: ASYTRIPContext,
    prop: ResolvedProp) => string;
/**
 * Generates a list of objects that contain crucial
 * resolved type information for each the structs properties.
 */
export function generateResolvedProps(
    struct: ASYTRIPStruct,
    context: ASYTRIPContext,
    resolved_structs: Map<string, Map<string, ResolvedProp>>,
    getTypeString: getTypeString<any>,
    GenerateTypeString: GenTypeInfo
): ResolvedProp[] {

    const name = struct.name;

    if (resolved_structs.has(name))
        return [...resolved_structs.get(name).values()];

    const resolved_props: Map<string, ResolvedProp> = new Map();

    resolved_structs.set(name, resolved_props);

    const props = [...struct.properties];

    const prop_vals = props.map(([n, p]) => {

        const types = p.types.flatMap(t => getResolvedType(t, context, new Set([struct.name])));

        const real_types = types.filter(TypeIsNotNull);

        const HAS_NULL = TypesInclude(types, TypeIsNull);

        const REQUIRES_DYNAMIC = real_types.length > 0 && TypesRequiresDynamic(real_types);

        const HAVE_STRUCT = TypesInclude(types, TypeIsStruct);
        const HAVE_STRUCT_VECTORS = TypesInclude(types, TypeIsVector) && types.filter(TypeIsVector).some(t => t.types.length > 0 && TypesAre(t.types, TypeIsStruct));

        const structs = [];

        if (HAVE_STRUCT) {
            structs.push(...types.filter(TypeIsStruct)
                .setFilter(JSONFilter)
                .map(s => context.structs.get(s.name)));
        } else if (HAVE_STRUCT_VECTORS) {
            structs.push(...types.filter(TypeIsVector)
                .flatMap(t => t.types)
                .filter(TypeIsStruct)
                .setFilter(JSONFilter)
                .map(s => context.structs.get(s.name))
            );
        }

        const struct_types = getStructClassTypes(structs, context);

        const prop: ResolvedProp = {
            REQUIRES_DYNAMIC,
            HAVE_STRUCT,
            HAVE_STRUCT_VECTORS,
            name: n,
            type: "",
            HAS_NULL,
            types: real_types,
            prop: p,
            structs,
            struct_types
        };

        prop.type = GenerateTypeString(
            context,
            prop
        );

        resolved_props.set(n, prop);

        return resolved_props.get(n);
    });

    return prop_vals;
}

export function getStructClassTypes(structs: ASYTRIPStruct[], context: ASYTRIPContext, _data: {
    classes: string[],
    structs: string[];
} = { classes: [], structs: [] }): { classes: string[], structs: string[]; } {
    const class_groups = [...structs.groupMap((s) => [...s.classes])].filter(
        ([name, g]) => context.class_groups.get(name).length == g.length
    ).sort((a, b) => b[1].length - a[1].length);

    if (class_groups.length > 0 && class_groups[0].length > 1) {

        let longest = class_groups[0];

        _data.classes.push(longest[0]);

        if (longest[1].length < structs.length) {
            const outliers = structs.filter(s => !longest[1].includes(s));

            getStructClassTypes(outliers, context, _data);
        }

    } else {
        _data.structs.push(...structs.map(s => s.name));
    }

    return _data;
}

