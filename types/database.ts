export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export type Database = {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string;
          published: boolean;
          created_at: string;
          updated_at: string;
          tags: string[];
          category?: string;
          cover_image?: string;
          read_time?: number;
          likes: number;
          quiz?: QuizQuestion[];
          notified_at?: string;
        };
        Insert: {
          title: string;
          slug: string;
          content: string;
          excerpt: string;
          published: boolean;
          tags?: string[];
          category?: string;
          cover_image?: string;
          read_time?: number;
          quiz?: QuizQuestion[];
        };
        Update: {
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string;
          published?: boolean;
          tags?: string[];
          category?: string;
          cover_image?: string;
          read_time?: number;
          quiz?: QuizQuestion[];
          notified_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          name: string;
          email: string;
          message: string;
          created_at: string;
          read: boolean;
        };
        Insert: {
          name: string;
          email: string;
          message: string;
        };
        Update: {
          read?: boolean;
        };
      };
      analytics: {
        Row: {
          id: string;
          page: string;
          visitor_id: string;
          user_agent?: string;
          created_at: string;
        };
        Insert: {
          page: string;
          visitor_id: string;
          user_agent?: string;
        };
        Update: never;
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at: string;
        };
        Insert: {
          session_id: string;
          role: 'user' | 'assistant';
          content: string;
        };
        Update: never;
      };
      subscribers: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          unsubscribe_token: string;
        };
        Insert: {
          email: string;
        };
        Update: never;
      };
    };
  };
};
