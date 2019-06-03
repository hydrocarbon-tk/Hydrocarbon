/** PROPERTY BINDING DECLARATION **/

import binding from "./binding.mjs";
import types from "./types.mjs";
export default class extends binding {
    constructor(sym) {
        super([sym[0], sym[2]]);
    }
    get type( ){return types.prop_bind}
    render() { return `${this.id.type > 4 ? `[${this.id.render()}]` : this.id.render()} : ${this.init.render()}` }
}
