import { onMount } from 'svelte';
import Serializer from './Serializer';
import { get, writable, type Writable } from 'svelte/store';
import type { ProblemInstance } from '$lib/instance/ProblemInstance';
import type { Certificate } from '$lib/solve/Certificate';
import type { ReductionStore } from '$lib/state/ReductionStore.svelte';

type PI = ProblemInstance;
type CR = Certificate;

export type LocalStorage<
    I extends PI,
    O extends PI,
    IC extends CR,
    OC extends CR,
> = {
    value: Writable<ReductionStore<I,O,IC,OC>>,
    save: () => void,
};

export function useLocalStorage<
    I extends PI,
    O extends PI,
    IC extends CR,
    OC extends CR,
>(
    key: string, 
    initialValue: ReductionStore<I,O,IC,OC>,
    opt: {
        serialize: (obj: any) => string,
        revive: (obj: any) => ReductionStore<I,O,IC,OC>,
    } = {
        serialize: (obj: any) => Serializer.serialize(obj),
        revive: (obj: any) => Serializer.revive(obj),
    }
): LocalStorage<I,O,IC,OC> {
    let value = writable(initialValue);

    onMount(() => {
        const currentValue = localStorage.getItem(key);
        if (currentValue) {
            const revived = opt.revive(JSON.parse(currentValue))
            value.set(revived);
        }
    });

    const save = () => {
        if (get(value)) {
            const serialized = JSON.stringify(opt.serialize(get(value)));
            localStorage.setItem(key, serialized);
        } else {
            localStorage.removeItem(key);
        }
    };

    return {
        value: value,
        save: () => save(),
    };
};
