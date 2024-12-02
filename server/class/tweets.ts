import { Database } from '../database';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
process.env.TOKEN_SECRET;

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
      const { content } = req.body;
      const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
  
      if (!content || !token) {
        return res.status(400).json({ error: '⚠️ Content and token are required.' });
      }
  
      // Verify and decode the jwt token
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
      const username = decoded.username; // Get the username from the decod token
  
      // Find the user_id using the username
      const userQuery = `SELECT id FROM users WHERE username = '${username}'`;
      const userResult: any = await this.db.executeSQL(userQuery);

      // console.log(userResult);
  
      const userId = userResult[0].id; // Get the user_id from the result

      // console.log(userId);

      const query = `INSERT INTO tweets (user_id, content) VALUES (${userId}, '${content}');`;
      await this.db.executeSQL(query);
  
      const tweet = { content, username };
      res.status(201).json({ message: '👍 Tweet created successfully.', tweet });
    } catch (error) {
      console.error('👎 Error creating tweet:', error);
      res.status(500).json({ error: 'Error creating tweet.' });
    }
  }; 
  
  seeTweets = async (req: Request, res: Response) => {
    try {
      const query = 'SELECT tweets.id, users.username, tweets.content FROM tweets INNER JOIN users ON tweets.user_id = users.id';
      const tweets = await this.db.executeSQL(query);

      //console.log(tweets);

      res.status(200).json({ tweets }); // To save the tweets in JSON
    } catch (error) {
      console.error('Error loading tweets:', error);
      res.status(500).json({ error: 'Error loading tweets.' });
    }
  };  

  deleteTweets = async (req: Request, res: Response) => {
    try {
      const { tweetID } = req.body
      const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

      if (!tweetID || !token) {
        return res.status(400).json({ error: '⚠️ TweetID and token are required.' });
      }

      // Verify and decode the jwt token
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
      const username = decoded.username; // Get the username from the decod token
  
      // Find the user_id using the username
      const userQuery = `SELECT id FROM users WHERE username = '${username}'`;
      const userResult: any = await this.db.executeSQL(userQuery);

      const userId = userResult[0].id; // Get the user_id from the result

      // Only to delete the OURS tweets
      const deleteQuery = `DELETE FROM tweets WHERE id = ${tweetID} AND user_id = ${userId}`;
      await this.db.executeSQL(deleteQuery);

      res.status(201).json({ message: '👍 Tweet delete successfully.' })
    } catch (error) {
      console.error('👎 Error deleting tweet:', error);
      res.status(500).json({ error: 'Error deleting tweet.' });
    }
  }
}