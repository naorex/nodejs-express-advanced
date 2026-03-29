import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 設定読み込み
dotenv.config();
const { MONGODB_INSTANCE_URL } = process.env;

const app = express();
app.use(express.urlencoded({ extended: true }));

// MongoDB へ接続
mongoose
  .connect(MONGODB_INSTANCE_URL)
  .then(() => {
    console.log('Success: Connected to MongoDB');
  })
  .catch((error) => {
    console.log(error);
    console.error('Failure: Unconnected to MongoDB');
  });

const Schema = mongoose.Schema;

const BlogSchema = new Schema({
  title: String,
  summary: String,
  image: String,
  textBody: String,
});

const BlogModel = mongoose.model('Blog', BlogSchema);

// ブログ関係の機能
app.get('/', (req, res) => {
  res.send('Hello');
});

// Create an article
app.get('/blog/create', (req, res) => {
  res.sendFile(__dirname + '/views/blogCreate.html');
});

app.post('/blog/create', (req, res) => {
  console.log('req の中身', req.body);
  BlogModel.create(req.body)
    .then(() => {
      console.log('データの書き込みが成功');
      res.send('ブログデータの投稿が成功');
    })
    .catch((error) => {
      console.log(error);
      console.log('データの書き込みが失敗');
      res.send('ブログデータの投稿が失敗');
    });
});

// Read All articles

// Read Single article

// Update article

// Delete article

app.listen(3000, () => {
  console.log('Listening on localhost port 3000');
});
