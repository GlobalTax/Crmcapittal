export interface Subscriber {
  id: string;
  email: string;
  segment: string;
  created_at: string;
  verified: boolean;
  unsubscribed: boolean;
}

export interface CreateSubscriberData {
  email: string;
  segment?: string;
  verified?: boolean;
  unsubscribed?: boolean;
}