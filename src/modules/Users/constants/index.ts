import { createFieldNames } from 'src/shared/util';
import { RegisterUserRequest } from '../models';

export enum DRIVING_LICENSE_TYPES {
  G_1 = 'G1',
  G_2 = 'G2',
  FULL_G = 'FULL_G',
}

export const REGISTER_USER_FIELD_NAMES = createFieldNames<RegisterUserRequest>()({
  firstName: 'firstName',
  lastName: 'lastName',
  dob: 'dob',
  phoneNumber: 'phoneNumber',
  drivingLicenseType: 'drivingLicenseType',
  email: 'email',
  password: 'password',
  confirmPassword: 'confirmPassword',
  roles: 'roles',
});
