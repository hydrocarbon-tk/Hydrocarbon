import { Token } from './token';

export type HCObjIterator<T> = (
    node: ASTNode<T>,
    par: ASTNode<T>,
    replace_prop_index: number,
    replace_array_index: number
) => void;

export class ASTNode<T> {
    constructor(type: T, tok: Token) {
        this.type = type;
        this.tok = tok;
    }

    * iterate(parent: ASTNode<T>, replace_prop_index: number, replace_array_index: number) { }

    replace(node: ASTNode<T>, node_index: number, array_index: number) { }

    /**
     * Render this node back to its source code representation
     */
    render(column: number): string {
        return this.toString();
    }

    toString(): string {
        return this.tok.toString();
    }
    type: T;
    tok: Token;
}

export function* iterate<T>(node: ASTNode<T>) {

    let par = null;

    for (const n of node.iterate(par, -1, -1)) {

        yield { node: n };

    }

}