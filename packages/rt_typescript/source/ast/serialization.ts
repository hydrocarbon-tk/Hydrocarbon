import {
    ByteReader, ByteWriter, F32Type, F64Type, I16Type, I32Type, I64Type, I8Type,
    StringType, StructVectorType, TokenType, VectorType, Token
} from '@hctoolkit/common';

import { ASTNode } from './ast_node';

export function SerializeType<T>(obj: T, writer: ByteWriter) {
    if (typeof obj == "string") {
        writer.write_string(obj);
    } else if (typeof obj == "number") {
        writer.write_byte(F64Type);
        writer.write_double_word(obj);
    } else if (obj instanceof Token) {
        obj.serialize(writer);
    }
}

export function SerializeStructVector<T extends ASTNode<any>>(vector: T[], writer: ByteWriter) {
    writer.write_byte(StructVectorType);
    writer.write_word(vector.length);
    for (const struct of vector)
        struct.serialize(writer);
}

export function DeserializeStructVector<T extends ASTNode<R>, R = any>(
    reader: ByteReader,
    domain_deserializer: (reader: ByteReader) => T
): T[] {
    if (reader.assert_byte(StructVectorType)) {
        const length = reader.read_word();
        const array: T[] = [];
        for (let i = 0; i < length; i++) {
            array.push(Deserialize(reader, domain_deserializer));
        }
        return array;
    }
    return [];
}

export function SerializeVector(vector: any[], writer: ByteWriter) {
    writer.write_byte(VectorType);
    writer.write_word(vector.length);
    for (const obj of vector) {
        SerializeType(obj, writer);
    }
}

export function DeserializeVector<T extends ASTNode<any>>(
    reader: ByteReader,
    domain_deserializer: (reader: ByteReader) => T
): any[] {
    if (reader.assert_byte(VectorType)) {
        const length = reader.read_word();
        const array: any[] = [];

        for (let i = 0; i < length; i++) {
            array.push(Deserialize(reader, domain_deserializer));
        }

        return array;
    }
    return [];
}


export function Deserialize<T extends ASTNode<any>>(
    reader: ByteReader,
    domain_deserializer: (reader: ByteReader) => T
): any {
    switch (reader.peek_byte()) {
        case StructVectorType:
            return DeserializeStructVector<T>(reader, domain_deserializer);
            break;
        case VectorType:
            return DeserializeVector(reader, domain_deserializer);
            break;
        case F64Type:
            reader.assert_byte(F64Type);
            return reader.read_double_word();
            break;
        case F32Type:
            reader.assert_byte(F32Type);
            return reader.read_word();
            break;
        case I64Type:
            reader.assert_byte(I64Type);
            return reader.read_double_word();
            break;
        case I32Type:
            reader.assert_byte(I32Type);
            return reader.read_word();
            break;
        case I16Type:
            reader.assert_byte(I16Type);
            return reader.read_short();
            break;
        case I8Type:
            reader.assert_byte(I8Type);
            return reader.read_byte();
            break;
        case StringType:
            return reader.read_string();
            break;
        case TokenType:
            return Token.Deserialize(reader);
            break;
        default:
            return domain_deserializer(reader);

    }
}
