export function deepEqual(a: any, b: any) {
    if (a === b) return true;
    const typeOfA = typeof a;
    if (typeOfA !== typeof b) return false;

    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length != b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) return false;
        }
        return true;
    }

    if (typeOfA === 'object') {
        const entriesOfA = Object.entries(a);
        const entriesOfB = Object.entries(b);
        if (entriesOfA.length !== entriesOfB.length) return false;
        for (const [k, v] of entriesOfA) {
            if (!deepEqual(v, b[k])) return false;
        }

        return true;
    }

    return a === b;
}
