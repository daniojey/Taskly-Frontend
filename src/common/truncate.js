export function truncateString(str, maxLength) {
    if (typeof str !== 'string') {
        return str;
    }


    const res = str.length > maxLength ? str.slice(0, maxLength - 1 ) + '...' : str;
    return res;
}