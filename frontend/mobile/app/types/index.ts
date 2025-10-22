// This file is required by Expo Router
// It defines the type structure for the app's navigation

export type RootStackParamList = {
  "(tabs)": undefined;
  "(auth)": undefined;
  "+not-found": undefined;
};

export type TabParamList = {
  index: undefined;
  pets: undefined;
  docs: undefined;
  appointments: undefined;
  chat: undefined;
  profile: undefined;
};

export type PetsStackParamList = {
  index: undefined;
  add: undefined;
  "[id]": {
    id: string;
  };
};

export type DocsStackParamList = {
  index: undefined;
  upload: undefined;
  "[category]": {
    category: string;
    petId?: string;
  };
};

// Default export for Expo Router
export default {};