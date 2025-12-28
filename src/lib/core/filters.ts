//
// Created by phatt-23 on 11/10/2025
//

export function onlyUnique(value: any, index: any, array: string | any[]) {
    return array.indexOf(value) === index;
}

export function trimStartingZeros(x: string) {
    let i = 0;

    while (i < x.length && x[i] == '0') {
        i++;
    }

    return x.slice(i);
}