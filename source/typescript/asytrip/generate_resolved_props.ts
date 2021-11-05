import {
    getResolvedType, JSONFilter, TypeIsNotNull,
    TypeIsNull, TypeIsStruct, TypeIsVector,
    TypesAre,
    TypesInclude,
    TypesRequiresDynamic
} from './common.js';
import { ASYTRIPContext, ASYTRIPStruct, ASYTRIPType, ASYTRIPTypeObj, getTypeString, ResolvedProp } from './types.js';

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
        const prop: ResolvedProp = {
            REQUIRES_DYNAMIC,
            HAVE_STRUCT,
            HAVE_STRUCT_VECTORS,
            name: n,
            type: "",
            HAS_NULL,
            types: real_types,
            prop: p,
            structs
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
