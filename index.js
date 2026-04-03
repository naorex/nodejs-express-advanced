import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';

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
app.use('/public', express.static('public'));

// Session
app.use(
  session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 },
  })
);

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

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const BlogModel = mongoose.model('Blog', BlogSchema);
const UserModel = mongoose.model('User', UserSchema);

// Create an article
app.get('/blog/create', (req, res) => {
  // res.sendFile(__dirname + '/views/blogCreate.html');
  if (req.session.userId) {
    res.render('blogCreate');
  } else {
    res.redirect('/user/login');
  }
});

app.post('/blog/create', (req, res) => {
  // console.log('req の中身', req.body);
  BlogModel.create(req.body)
    .then(() => {
      res.redirect('/');
      // console.log('データの書き込みが成功');
      // res.send('ブログデータの投稿が成功');
    })
    .catch((error) => {
      res.render('error', { message: '/blog/create のエラー' });
      // console.log('データの書き込みが失敗');
      // res.send('ブログデータの投稿が失敗');
    });
});

// Read All articles
app.get('/', async (req, res) => {
  const allBlogs = await BlogModel.find(); // 取得完了まで待つ
  // console.log('allBlogsの中身', allBlogs);
  // console.log('reqの中身', req);
  // res.send('全ブログデータを読み取りました');
  // res.render('index', { allBlogs }); // ejs用は .render()
  res.render('index', {
    allBlogs: allBlogs,
    session: req.session.userId, // ログインしているユーザーにのみ /blog/create を表示させたいため、userId を session に渡す
  });
});

// Read Single article
app.get('/blog/:id', async (req, res) => {
  const singleBlog = await BlogModel.findById(req.params.id);
  // console.log('singleBlogの中身:', singleBlog);
  // res.send('個別の記事ページ');
  // res.render('blogRead', { singleBlog });
  res.render('blogRead', {
    singleBlog: singleBlog,
    session: req.session.userId,
  });
});

// Update article
app.get('/blog/update/:id', async (req, res) => {
  const singleBlog = await BlogModel.findById(req.params.id);
  // console.log('singleBlogの中身:', singleBlog);
  // res.send('個別の記事編集ページ');
  res.render('blogUpdate', { singleBlog });
});

app.post('/blog/update/:id', (req, res) => {
  BlogModel.updateOne({ _id: req.params.id }, req.body)
    .then(() => {
      res.redirect('/');
      // console.log('データの編集が成功');
      // res.send('ブログデータの編集が成功');
    })
    .catch((error) => {
      // console.log(error);
      res.render('error', { message: '/blog/update のエラー' });
      // console.log('データの編集が失敗');
      // res.send('ブログデータの編集が失敗');
    });
});

// Delete article
app.get('/blog/delete/:id', async (req, res) => {
  const singleBlog = await BlogModel.findById(req.params.id);
  // console.log('singleBlogの中身:', singleBlog);
  // res.send('個別の記事削除ページ');
  res.render('blogDelete', { singleBlog });
});

app.post('/blog/delete/:id', (req, res) => {
  BlogModel.deleteOne({ _id: req.params.id })
    .then(() => {
      res.redirect('/');
      // console.log('データの削除が成功');
      // res.send('ブログデータの削除が成功');
    })
    .catch((error) => {
      // console.log(error);
      res.render('error', { message: '/blog/delete のエラー' });
      // console.log('データの削除が失敗');
      // res.send('ブログデータの削除が失敗');
    });
});

// Create user
app.get('/user/create', (req, res) => {
  res.render('userCreate');
});

app.post('/user/create', (req, res) => {
  UserModel.create(req.body)
    .then(() => {
      res.redirect('/');
      // console.log('ユーザーデータの書き込みが成功');
      // res.send('ユーザーデータの登録が成功');
    })
    .catch((error) => {
      // console.log(error);
      res.render('error', { message: 'user/create のエラー' });
      // console.log('ユーザーデータの書き込みが失敗');
      // res.send('ユーザーデータの登録が失敗');
    });
});

// Login
app.get('/user/login', (req, res) => {
  res.render('login');
});

app.post('/user/login', (req, res) => {
  UserModel.findOne({ email: req.body.email })
    .then((savedData) => {
      if (savedData) {
        if (req.body.password === savedData.password) {
          req.session.userId = savedData._id.toString();
          // res.send('ログイン成功');
          res.redirect('/');
        } else {
          // res.send('パスワードが間違っている');
          res.render('error', { message: '/user/login のエラー' });
        }
      } else {
        // res.send('ユーザーが存在しません');
        res.render('error', { message: '/user/login のエラー' });
      }
    })
    .catch(() => {
      // res.send('エラー発生');
      res.render('error', { message: '/user/login のエラー' });
    });
});

// app
app.listen(3000, () => {
  console.log('Listening on localhost port 3000');
});
