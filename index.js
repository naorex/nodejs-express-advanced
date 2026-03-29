import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

// 以下はblogCreate.html の場合に使用
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// 設定読み込み
dotenv.config();
const { MONGODB_INSTANCE_URL } = process.env;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

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

// Create an article
app.get('/blog/create', (req, res) => {
  // res.sendFile(__dirname + '/views/blogCreate.html');
  res.render('blogCreate');
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
app.get('/', async (req, res) => {
  const allBlogs = await BlogModel.find(); // 取得完了まで待つ
  console.log('allBlogsの中身', allBlogs);
  // res.send('全ブログデータを読み取りました');
  res.render('index', { allBlogs }); // ejs用は .render()
});

// Read Single article
app.get('/blog/:id', async (req, res) => {
  const singleBlog = await BlogModel.findById(req.params.id);
  console.log('singleBlogの中身:', singleBlog);
  // res.send('個別の記事ページ');
  res.render('blogRead', { singleBlog });
});

// Update article
app.get('/blog/update/:id', async (req, res) => {
  const singleBlog = await BlogModel.findById(req.params.id);
  console.log('singleBlogの中身:', singleBlog);
  res.send('個別の記事編集ページ');
});

app.post('/blog/update/:id', (req, res) => {
  BlogModel.updateOne({ _id: req.params.id }, req.body)
    .then(() => {
      console.log('データの編集が成功');
      res.send('ブログデータの編集が成功');
    })
    .catch((error) => {
      console.log(error);
      console.log('データの編集が失敗');
      res.send('ブログデータの編集が失敗');
    });
});

// Delete article
app.get('/blog/delete/:id', async (req, res) => {
  const singleBlog = await BlogModel.findById(req.params.id);
  console.log('singleBlogの中身:', singleBlog);
  res.send('個別の記事削除ページ');
});

app.post('/blog/delete/:id', (req, res) => {
  BlogModel.deleteOne({ _id: req.params.id })
    .then(() => {
      console.log('データの削除が成功');
      res.send('ブログデータの削除が成功');
    })
    .catch((error) => {
      console.log(error);
      console.log('データの削除が失敗');
      res.send('ブログデータの削除が失敗');
    });
});

// app
app.listen(3000, () => {
  console.log('Listening on localhost port 3000');
});
