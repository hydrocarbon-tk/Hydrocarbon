import {
    getResolvedType, TypeIsNotNull,
    TypeIsNull, TypeIsStruct, TypeIsVector,
    TypesAre,
    TypesInclude,
    TypesRequiresDynamic
} from './common.js';
import { ASYTRIPContext, ASYTRIPStruct, getTypeString, ResolvedProp } from './types.js';

export function generateResolvedProps(
    struct: ASYTRIPStruct,
    context: ASYTRIPContext,
    resolved_structs: Map<string, Map<string, ResolvedProp>>,
    getTypeString: getTypeString<any>) {

    const name = struct.name;

    if (resolved_structs.has(name))
        return [...resolved_structs.get(name).values()];

    const resolved_props: Map<string, ResolvedProp> = new Map();

    resolved_structs.set(name, resolved_props);

    const props = [...struct.properties];

    const prop_vals = props.map(([n, p]) => {
        const types = p.types.flatMap(t => getResolvedType(t, context, new Set([struct.name])));

        let type_string = "interface{}";

        const real_types = types.filter(TypeIsNotNull);

        const HAS_NULL = TypesInclude(types, TypeIsNull);

        const REQUIRES_DYNAMIC = TypesRequiresDynamic(types);

        let type = real_types[0];

        if (TypesAre(real_types, TypeIsStruct)) {
            if (real_types.length > 1)
                type_string = "ASTNode";
            else if (type) {
                type_string = getTypeString(type, context);
                if (HAS_NULL)
                    type_string = `Option<${type_string}>`;
            }
        } else if (REQUIRES_DYNAMIC) {
            type_string = "HCO";
        } else if (TypesAre(real_types, TypeIsVector)) {
            type_string = getTypeString(real_types[0], context);
        } else if (type)
            type_string = getTypeString(type, context);


        else
            type_string = "HCNode";

        resolved_props.set(n, {
            REQUIRES_DYNAMIC,
            name: n,
            type: type_string,
            HAS_NULL,
            types,
            prop: p
        });

        return resolved_props.get(n);
    });

    return prop_vals;
}
