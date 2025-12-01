import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ROLES } from 'src/shared/constants';
import { getCurrentDateWithoutHour } from 'src/shared/util';
import { PASSWORD_LENGTH } from 'src/modules/Authentication/Login';
import { RegisterUserRequest } from '../models';
import { DRIVING_LICENSE_TYPES } from '../constants';

export const registerUserValidator = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dob: z.date().optional(),
    drivingLicenseType: z.nativeEnum(DRIVING_LICENSE_TYPES).nullable().optional(),

    phoneNumber: z.string().regex(/^\+1\d{10}$/, 'Phone number must be a valid Canadian number (e.g. +14165551234)'),
    email: z.string().email('Email must be valid'),
    password: z.string().min(PASSWORD_LENGTH, 'Password is required'),
    confirmPassword: z.string().min(PASSWORD_LENGTH, 'Confirm password is required'),
    roles: z
      .array(z.string(), { required_error: 'At least one role is required' })
      .nonempty('At least one role is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });
export const initialRegisterUserData = {
  firstName: '',
  lastName: '',
  dob: getCurrentDateWithoutHour(),
  phoneNumber: '',
  drivingLicenseType: DRIVING_LICENSE_TYPES.G_1,
  email: '',
  password: '',
  confirmPassword: '',
  roles: [ROLES.EMPLOYEE],
};

export function useRegisterUserForm() {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterUserRequest>({
    resolver: zodResolver(registerUserValidator),
    defaultValues: initialRegisterUserData,
  });

  return {
    control,
    formHandleSubmit: handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  };
}
