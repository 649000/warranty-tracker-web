export const paths = {
  home: '/',
  auth: { 
    signIn: '/login', 
    signUp: '/register', 
    resetPassword: '/auth/reset-password' 
  },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    settings: '/dashboard/settings',
  },
} as const;

export type Paths = typeof paths[keyof typeof paths];
