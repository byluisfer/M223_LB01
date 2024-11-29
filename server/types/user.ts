import { Database } from '../database';
import { Request, Response } from 'express'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
process.env.TOKEN_SECRET;

export class User {
    public username: string;
    private password: string;

    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    };
};

export class manageUser {
    private db : Database;

    constructor(db: Database) {
        this.db = db
    }

    generateAccessToken(username: string): string {
        return jwt.sign({ username }, process.env.TOKEN_SECRET, { expiresIn: '1000d' });
    }    

    register = async(req: Request, res: Response) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: 'Username and Password required' });
            }            

            const hashedPassword = await bcrypt.hash(password, 10);

            const checkUsernameQuery = `SELECT * FROM users WHERE username = '${username}'`;
            const existedUser = await this.db.executeSQL(checkUsernameQuery);

            if (Array.isArray(existedUser) && existedUser.length > 0) { // https://stackoverflow.com/questions/55530602/property-length-does-not-exists-on-type-okpacket-in-mysql2-module
                return res.status(400).json({ error: 'Username already exists' });
            }

            const query = `INSERT INTO users (username, password) VALUES ('${username}', '${hashedPassword}')`;
            await this.db.executeSQL(query);
            
            res.status(201).json({ message: 'User registered successfully' });
            
            } catch (error) {
                console.error('Error during registration:', error);
                res.status(500).json({ error: 'Error registering user' });
        };
    };

    login = async (req: Request, res: Response) => {
        try {
            const { username, password } = req.body;
    
            if (!username || !password) {
                return res.status(400).json({ error: 'Username and Password required' });
            }
    
            const query = `SELECT * FROM users WHERE username = '${username}'`;
            const users = await this.db.executeSQL(query);
    
            if (!users) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }
    
            const user = users[0]; // Must be only 1 user
            const passwordMatch = await bcrypt.compare(password, user.password);
    
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }
    
            const token = this.generateAccessToken(username);
    
            res.status(200).json({ message: 'Login successful', token });
        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).json({ error: 'Error during login' });
        }
    };    
}