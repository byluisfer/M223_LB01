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
      //console.log(decoded)
      const username = decoded.username; // Get the username from the decod token
  
      // Find the user_id using the username
      const userQuery = `SELECT id FROM users WHERE username = '${username}'`;
      const userResult: any = await this.db.executeSQL(userQuery);

      // console.log(userResult);
  
      const userId = userResult[0].id; // Get the user_id from the result

      // console.log(userId);

      const query = `INSERT INTO tweets (user_id, content) VALUES (${userId}, '${content}');`;
      await this.db.executeSQL(query);
  
      const tweet = { username, content };
      res.status(201).json({ message: '👍 Tweet created successfully.', tweet });
    } catch (error) {
      console.error('👎 Error creating tweet:', error);
      res.status(500).json({ error: 'Error creating tweet.' });
    }
  }; 
  
  seeTweets = async (req: any, res: Response) => {
    try {
      const username = req.user.username; /// To get the username
      // console.log(username);
      const query = 'SELECT tweets.id, tweets.content, users.username FROM tweets INNER JOIN users ON tweets.user_id = users.id';
      const tweets = await this.db.executeSQL(query);

      // console.log(tweets);

      res.status(200).json({ username, tweets }); // To save the tweets and username in JSON
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
      // console.log(userId)

      // Only to delete the OURS tweets
      const deleteQuery = `DELETE FROM tweets WHERE id = ${tweetID} AND user_id = ${userId}`;
      await this.db.executeSQL(deleteQuery);

      res.status(201).json({ message: '👍 Tweet delete successfully.' })
    } catch (error) {
      console.error('👎 Error deleting tweet:', error);
      res.status(500).json({ error: 'Error deleting tweet.' });
    }
  }

  editTweets = async (req: any, res: Response) => {
    try {
      const { tweetID, newContent } = req.body; // Get the tweetID and newContent (the new content that we will edit) from the request body
      // console.log(req.body);
      const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
  
      if (!tweetID || !newContent || !token) {
        return res.status(400).json({ error: '⚠️ TweetID, newContent and token are required.' });
      }
  
      // Verify and decode the jwt token
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
      const username = decoded.username; // Get the username from the decod token
  
      // Find the user_id using the username
      const userQuery = `SELECT id FROM users WHERE username = '${username}'`;
      const userResult: any = await this.db.executeSQL(userQuery);
  
      const userId = userResult[0].id; // Get the user_id from the result
  
      // Verifica que el tweet pertenezca al usuario
      const tweetQuery = `SELECT * FROM tweets WHERE id = ${tweetID} AND user_id = ${userId}`;
      const tweetResult: any = await this.db.executeSQL(tweetQuery);
  
      if (tweetResult.length === 0) {
        return res.status(403).json({ error: 'You can only edit your own tweets.' });
      }
  
      // Update the tweet content
      const updateQuery = `UPDATE tweets SET content = '${newContent}' WHERE id = ${tweetID}`;
      await this.db.executeSQL(updateQuery);
  
      res.status(201).json({ message: '👍 Tweet updated successfully.' });
    } catch (error) {
      console.error('👎 Error editing tweet:', error);
      res.status(500).json({ error: 'Error editing tweet.' });
    }
  };  

  seeMyTweets = async (req: any, res: Response) => {
    try {
      const username = req.user.username; // To get the username

      const query = `SELECT tweets.id, users.username, tweets.content FROM tweets INNER JOIN users ON tweets.user_id = users.id WHERE users.username = '${username}'`; // Filter to the authentificate username
      const tweets = await this.db.executeSQL(query);

      res.status(200).json({ tweets, username }); // To save the tweets and username in JSON
    } catch (error) {
      console.error('Error loading user tweets:', error);
      res.status(500).json({ error: 'Error loading user tweets.' });
    }
  };
}