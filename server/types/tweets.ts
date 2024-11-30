import { Database } from '../database';
import { Request, Response } from 'express';

export class Tweet {
  public content: string;
  public user: string;

  constructor(content: string, user: string) {
    this.content = content;
    this.user = user;
  }
}

export class manageTweet {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  createTweet = async (req: Request, res: Response) => {
    try {
      const { content, user } = req.body;
  
      if (!content || !user) {
        return res.status(400).json({ error: '⚠️ Content and User required.' });
      }
  
      const query = `INSERT INTO tweets (user_id, content) VALUES ((SELECT id FROM users WHERE username = '${user}'), '${content}');`;
      await this.db.executeSQL(query);

      const tweet = new Tweet(content, user);
      res.status(201).json({ message: '👍 Tweet created successfully.', tweet });
    } catch (error) {
      console.error('👎 Error creating tweet:', error);
      res.status(500).json({ error: 'Error creating tweet.' });
    }
  };  
}