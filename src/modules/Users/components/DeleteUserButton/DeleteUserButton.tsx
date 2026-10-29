import { IconButton, Tooltip } from '@mui/material';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import { useConfirm } from 'src/components/ConfirmDialog';
import { User } from '../../models';
import { useDeleteUser } from '../../hooks';

export function DeleteUserButton({ user }: { user: User }) {
  const confirm = useConfirm();
  const { mutate: deleteUser, isPending } = useDeleteUser();

  const fullName = `${user.firstName} ${user.lastName}`;

  const handleClick = async () => {
    const confirmed = await confirm({
      title: `Delete ${fullName}?`,
      description: "They'll lose access right away. This can't be undone.",
      confirmText: 'Delete',
      destructive: true,
    });
    if (confirmed) deleteUser(user.id);
  };

  return (
    <Tooltip title="Delete">
      <IconButton aria-label={`Delete ${fullName}`} onClick={handleClick} disabled={isPending} size="small">
        <DeleteOutlined fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
