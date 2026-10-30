import { Components, Theme } from '@mui/material/styles';

export const MuiButton: Components<Theme>['MuiButton'] = {
  styleOverrides: {
    outlined: ({ theme }) => ({
      '&.Mui-disabled': {
        color: (theme.vars ?? theme).palette.grey['500'],
      },
    }),
  },
};
