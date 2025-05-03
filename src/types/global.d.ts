
declare global {
  interface User {
    id: string;
    email: string;
    created_at: string;
    name?: string;
    user_metadata?: {
      name?: string;
      avatar_url?: string;
      location?: string;
      bio?: string;
      [key: string]: any;
    };
  }

  interface Session {
    access_token: string;
    expires_at: number;
    user: User;
  }
}

export {};
