const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors({
  origin: 'http://localhost:3000',  
  credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, 'public/dist')));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dist', 'index-0.html'));
});


app.listen(port, () => {
  console.log(port, '포트로 서버가 실행중입니다.');
});