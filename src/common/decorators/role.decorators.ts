import { SetMetadata } from '@nestjs/common';

import { RoleEnum } from '../enums';

export const ROLES_KEY = 'ROLES_KEY';
/**
 * It takes a list of roles and adds them to the metadata of the decorated function
 * @param {RoleEnum[]} roles - RoleEnum[] - The roles that are allowed to access the route.
 */
export const Roles = (...roles: RoleEnum[]) => SetMetadata(ROLES_KEY, roles);
