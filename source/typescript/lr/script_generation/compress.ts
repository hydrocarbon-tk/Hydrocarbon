export function compress(array, st) {
    const
        num = parseInt(st),
        l = array.length - 1;

    if (l >= 0) {
        if (+array[l] < 0 && num < 0)
            array[l]--;
        else if (((+array[l] >> 1) & 0x3FFF) == num)
            array[l] = (array[l] + (0x1 << 15)) | 1;
        else
            array.push(num << 1);
    } else
        array.push(num << 1);

    return array;
}