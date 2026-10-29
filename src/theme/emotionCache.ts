import { createEmotionCache } from '@mui/material-nextjs/v16-pagesRouter';

export function createAppEmotionCache() {
  return createEmotionCache({ key: 'mui', enableCssLayer: true });
}
