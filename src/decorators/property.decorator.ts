export function Property(className = 'fields', defaultValue: unknown = undefined): PropertyDecorator {
    return (target: Record<string, unknown>, name: string, descriptor: PropertyDescriptor = null): void => {
        if (defaultValue !== undefined) {
            target[name] = defaultValue;
        }

        Reflect.defineMetadata(className, true, target, name);
    };
}
