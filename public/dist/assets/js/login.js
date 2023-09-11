// 로그인
const login = async () => {
  if (!$('#email').val()) {
    alert('계정(e-mail)을 입력해주세요');
    return;
  }
  if (!$('#password').val()) {
    alert('비밀번호를 입력해주세요');
    return;
  }

  await axios
    .post('http://3.34.132.157/auth/login', {
      email: $('#email').val(),
      password: $('#password').val(),
    })
    .then((response) => {
      console.log('response', response.data.data);
      localStorage.setItem(
        `cookie`,
        `Bearer ${response.data.data.accessToken}`,
      );
      if (response.data.data.status === 'admin') {
        location.href = 'admin.html';
      } else {
        alert('반갑습니다 회원님!');
        location.href = `main.html?id=${response.data.data.userId}`;
      }
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
};
$('#login-btn').click(login);
