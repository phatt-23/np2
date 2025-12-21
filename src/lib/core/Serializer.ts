// 
// Created by phatt-23 on 12/10/2025
// 


// custom simple serializer
abstract class Serializer {
    // decorator that makes classes serializable
    // by giving them a __type property
    // and registering them into Serializer's class registry
    static SerializableClass(typeName?: string) {
        return function(target: any) {
            const name = typeName ?? target.name;
            target.prototype.__type = name;
            Serializer.registerClass(name, target);
        }
    }

    // serealizes the object into a POJO with __type annotations
    // by which revive can pick correct class and revive the object 
    // into a that class instance
    static serialize(obj: any): any {
        if (obj == null) {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(Serializer.serialize) as any;
        }

        if (obj instanceof Set) {
            return {
                __type: 'Set',
                values: Array.from(obj).map(Serializer.serialize)
            };
        }

        if (obj instanceof Map) {
            return {
                __type: 'Map',
                entries: Array
                    .from(obj.entries())
                    .map(([k, v]) => [
                        Serializer.serialize(k),
                        Serializer.serialize(v)
                    ]),
            };
        }

        if (typeof obj === 'object') {
            if (Array.isArray(obj)) {
                return obj.map(Serializer.serialize);
            }

            const ctor = obj.constructor;
            const typeName = obj.__type ?? ctor.name;
            const plain: any = { __type: typeName };

            for (const [key, value] of Object.entries(obj)) {
                plain[key] = Serializer.serialize(value);
            }

            return plain;
        }

        return obj;
    }

    // deserealizes object of type any into T 
    // if the class T was hasn't been registered (by decorating the class),
    // it will throw an error
    static revive<T>(obj: any): T {
        if (obj == null) {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(Serializer.revive) as any;
        }

        if (obj.__type === 'Set') {
            return new Set(obj.values.map(Serializer.revive)) as any;
        }

        if (obj.__type === 'Map') {
            return new Map(obj.entries.map(([k, v]: any) => [
                Serializer.revive(k), 
                Serializer.revive(v)
            ])) as any;
        }

        if (obj.__type) {
            const ctor = Serializer.getClass(obj.__type);
            if (!ctor) {
                throw new Error(`Serializer - Unknown class: ${obj.__type}`);
            }

            const instance = Object.create(ctor.prototype);

            for (const [key, value] of Object.entries(obj)) {
                if (key !== '__type') {
                    instance[key] = Serializer.revive(value);
                }
            }

            return instance;
        }

        return obj;
    }

    // helpers for registering and getting class from registry
    static registerClass(name: string, ctor: any) {
        Serializer.classRegistry.set(name, ctor);
    }

    static getClass(name: string): any {
        return Serializer.classRegistry.get(name);
    }

    // maps class name to class type
    private static classRegistry = new Map<string, any>();
}

export default Serializer;

// have to register this manually
Serializer.registerClass(Object.name, Object);