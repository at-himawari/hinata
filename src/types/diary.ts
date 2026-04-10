export type MoodValue = 1 | 2 | 3 | 4 | 5;

export type DiaryEntry = {
  id: string;
  date: string;
  mood: MoodValue;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type DraftEntry = {
  date: string;
  mood?: MoodValue;
  body: string;
  updatedAt: string;
};

export type AppSettings = {
  notificationEnabled: boolean;
  notificationTime: string;
};
