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

            const query = `INSERT INTO users (username, password) VALUES ('${username}', '${hashedPassword}')`;
            await this.db.executeSQL(query);

            const token = this.generateAccessToken(username);   
            
            res.status(201).json({ message: 'User registered successfully', token: token });
            
            } catch (error) {
                console.error('Error during registration:', error);
                res.status(500).json({ error: 'Error registering user' });
        };
    };
}