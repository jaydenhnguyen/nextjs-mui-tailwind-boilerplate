import { z } from 'zod';
import { Button, Stack } from '@mui/material';
import {
  ControlCheckbox,
  ControlErrorMessage,
  ControlPasswordField,
  ControlRadioGroup,
  ControlSelect,
  ControlSwitch,
  ControlTextField,
  Form,
  useZodForm,
} from 'src/components';

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
  nickname: z.string().max(5),
  age: z.coerce.number<string>().int().min(18, 'Must be 18+'),
  role: z.string().min(1, 'Pick a role'),
  tags: z.array(z.string()).min(1, 'Pick at least one tag'),
  plan: z.number({ error: 'Pick a plan' }),
  terms: z.literal(true, { error: 'You must accept the terms' }),
  newsletter: z.boolean(),
});

export default function FormTest() {
  const form = useZodForm(schema, {
    defaultValues: {
      email: '',
      password: '',
      nickname: '',
      age: '',
      role: '',
      tags: [],
      terms: false as true,
      newsletter: false,
    },
  });
  const { control } = form;

  const onSubmit = (values: z.output<typeof schema>) => {
    console.warn(values.age.toFixed(0));
    form.setError('root.server', { message: 'Server says no (test)' });
  };

  return (
    <Form form={form} onSubmit={onSubmit} className="flex max-w-md flex-col gap-4 p-6">
      <ControlTextField control={control} name="email" label="Email" required />
      <ControlPasswordField control={control} name="password" label="Password" />
      <ControlTextField
        control={control}
        name="nickname"
        label="Nickname (no reserved space)"
        reserveMessageSpace={false}
      />
      <ControlTextField control={control} name="age" label="Age" type="number" />
      <ControlSelect
        control={control}
        name="role"
        label="Role"
        emptyOptionLabel="None"
        options={[
          { label: 'Admin', value: 'admin' },
          { label: 'User', value: 'user' },
        ]}
      />
      <ControlSelect
        control={control}
        name="tags"
        label="Tags"
        multiple
        options={[
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ]}
      />
      <ControlRadioGroup
        control={control}
        name="plan"
        label="Plan"
        row
        options={[
          { label: 'Free', value: 1 },
          { label: 'Pro', value: 2 },
        ]}
      />
      <ControlCheckbox
        control={control}
        name="terms"
        label="I accept the terms"
        required
        checkboxProps={{ color: 'secondary' }}
      />
      <ControlSwitch control={control} name="newsletter" label="Newsletter" />
      {/* @ts-expect-error a name that isn't in the schema must fail */}
      <ControlTextField control={control} name="nope" label="Nope" />
      <ControlErrorMessage control={control} name="root.server" />
      <Stack direction="row">
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </Form>
  );
}
