function block64Consume(data, block, offset, block_offset) {
    //128 byte block allocation
    //Find offset block

    let containing_data = data,
        end = containing_data.origin_fork + data.rules_ptr;

    //Find closest root
    while (containing_data.origin_fork > offset) {
        end = containing_data.origin_fork;
        containing_data = containing_data.origin;
    }

    let start = containing_data.origin_fork;

    offset -= start;
    end -= start;

    //Fill block with new data
    let ptr = offset,
        limit = 64;

    if (ptr >= end) return block_offset - limit;

    while (block_offset < limit) {
        block[block_offset++] = containing_data.rules[ptr++];
        if (ptr >= end)
            return block64Consume(data, block, ptr + start, block_offset);
    }
}

const block = new Uint16Array;

const leaves = (function generateDataTree(parent = null, offset = 0, depth = 0) {
    const seed = Math.random();
    const data = Array(5 + ((seed * 20) | 0)).fill(1).map((i, j) => j + offset);
    const node = {
        rules: data,
        rules_ptr: data.length,
        origin_fork: offset,
        origin: parent
    };

    let leaves = [];
    if (depth < 4) {
        for (let i = 0; i < ((seed * 10) | 0) + 1; i++)
            leaves = leaves.concat(generateDataTree(node, offset + ((Math.random() * (data.length - 2)) | 0) + 2, depth + 1));
    } else
        leaves.push(node);

    return leaves;
})();

const block = [];
block64Consume(leaves[0], block, 0, 0);
console.log(block, leaves[0]);

assert_group(() => {

    assert(inspect, block[block.length - 1] == leaves[0].rules[leaves[0].rules.length - 1]);

    for (var i = 0; i < block.length; i++) {
        assert(block[i] == i);
    }
});