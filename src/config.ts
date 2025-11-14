export interface Config {
  site: { name: string; description: string; themeColor: string; url: string };
}

export const config: Config = {
  site: { 
    name: 'Warranty Tracker', 
    description: 'Track your product warranties and manage claims seamlessly',
    themeColor: '#090a0b', 
    url: 'https://warranty-tracker.com', // Update this to your actual domain
  },
};
