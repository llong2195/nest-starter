/**
 * @version 1.0.0
 * Initial version
 * @description Support for direct property mapping and transform function
 */
// type MappingConfig<LeftDto, RightDto> = {
//   [K in keyof LeftDto]: keyof RightDto | ((right: RightDto) => LeftDto[K]);
// };

/**
 * Support for optional properties
 * @version 1.0.9
 * @description Support for direct property mapping and transform function
 */
// type PropertyMap<T, U> = {
//   [P in keyof U]: undefined extends U[P]
//     ? T extends Exclude<U[P], undefined>
//       ? P | undefined
//       : never
//     : U[P] extends T
//       ? P
//       : never;
// }[keyof U];

// type MappingConfig<LeftDto, RightDto> = {
//   [K in keyof LeftDto]:
//     | ((right: RightDto) => LeftDto[K])
//     | PropertyMap<LeftDto[K], RightDto>
//     | (undefined extends LeftDto[K] ? undefined : never);
// };

/**
 * Extracts the property names of type `U` whose values match the type `T`.
 *
 * This utility type iterates over the properties of type `U` and checks if the property type extends `T`.
 * If it does, the property name is included in the resulting type; otherwise, it is excluded.
 *
 * @template T - The type to match against the properties of `U`.
 * @template U - The type whose properties are being checked.
 *
 * @example
 * ```typescript
 * interface Example {
 *   id: number;
 *   name: string;
 *   isActive: boolean;
 * }
 *
 * type StringProperties = MatchingPropertyTypes<string, Example>;
 * // Result: "name"
 * ```
 */
type MatchingPropertyTypes<T, U> = {
  [P in keyof U]: U[P] extends T ? P : never;
}[keyof U];

/**
 * Configuration type for mapping properties between two types, `Left` and `Right`.
 *
 * This type allows for two options for each property in `Left`:
 *
 * 1. Direct property mapping with type checking: Ensures that the property in `Right` matches the type of the property in `Left`.
 * 2. Transform function: A function that takes an instance of `Right` and returns the corresponding property value for `Left`.
 *
 * @template Left - The type of the source object.
 * @template Right - The type of the target object.
 */
type DtoMappingConfig<Left, Right> = {
  // Option 1: Direct property mapping with type checking
  [K in keyof Left]:
    | MatchingPropertyTypes<Left[K], Right>
    // Option 2: Transform function
    | ((right: Right) => Left[K]);
};

export class DtoMapper {
  /**
   * Maps properties from a source object to a target object based on a provided configuration.
   *
   * @template LeftDto - The type of the target object.
   * @template RightDto - The type of the source object.
   * @param {RightDto} right - The source object to map from.
   * @param {MappingConfig<LeftDto, RightDto>} config - The configuration object that defines how to map properties from the source to the target.
   * @returns {LeftDto} - The target object with properties mapped from the source object.
   * Maps a RightDto object to a LeftDto object based on the provided mapping configuration.
   * @param right The source object to map from.
   * @param config The mapping configuration.
   * @returns The mapped LeftDto object.
   *
   * @example
   * ```ts
   * type LeftDto = {
   *   id: number;
   *   name: string;
   *   age: number;
   *   job: string;
   * };
   * type RightDto = {
   *   id: number;
   *   fullName: string;
   *   age: number;
   *   jobCompany: string;
   *   jobPosition: string;
   * };
   * const mappingConfig: DtoMappingConfig<LeftDto, RightDto> = {
   *   id: 'id',
   *   name: 'fullName',
   *   age: 'age',
   *   job: (right) => `${right.jobCompany} ${right.jobPosition}`,
   * };
   * const right: RightDto = {
   *   id: 1,
   *   fullName: 'John Doe',
   *   age: 30,
   *   jobCompany: 'Rockyhub',
   *   jobPosition: 'Developer',
   * };
   * const left: LeftDto = DtoMapper.map(right, mappingConfig);
   * console.log(left);
   * {
   *   "id": 1,
   *   "name": "John Doe",
   *   "age": 30,
   *   "job": "Rockyhub Developer"
   * }
   * ```
   *
   */
  static mapper<LeftDto, RightDto>(
    right: RightDto,
    config: DtoMappingConfig<LeftDto, RightDto>,
  ): LeftDto {
    const result = {} as LeftDto;

    for (const key in config) {
      const mapping = config[key];
      if (typeof mapping === 'function') {
        result[key] = mapping(right);
      } else {
        result[key] = (right as Record<string, LeftDto[typeof key]>)[
          mapping as string
        ];
      }
    }
    return result;
  }
}
