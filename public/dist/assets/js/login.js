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
    .post('http://localhost:3000/auth/login', {
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
        alert('관리자 페이지로 이동합니다.');
        location.href = 'admin.html';
      } else {
        // setCookie('Authorization', response.data.data.accessToken, 2);
        alert('반갑습니다 회원님!');
        location.href = `main.html?id=${response.data.data.userId}`;
      }
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
};
$('#login-btn').click(login);

// function setCookie(cookieName, cookieValue, expirationHour) {
//   const date = new Date();
//   date.setTime(date.getTime() + expirationHour * 60 * 60 * 1000);
//   const expires = `expires=${date.toUTCString()}`;
//   document.cookie = `${cookieName}=${encodeURIComponent(
//     `Bearer ${cookieValue}`,
//   )}; ${expires}; path=/`;
// }

// function getCookie() {
//   const cookies = document.cookie.split(';');
//   for (const cookie of cookies) {
//     const [name, value] = cookie.trim().split('=');
//     if (name === 'Authorization') {
//       return decodeURIComponent(value);
//     }
//   }
// }

// function deleteCookie() {
//   const cookies = document.cookie.split(';');
//   for (const cookie of cookies) {
//     const [name, value] = cookie.trim().split('=');
//     if (name.trim() === 'Authorization') {
//       document.cookie = `${name}=; expires=Sat, 01 Jan 2000 00:00:00 UTC; path=/;`;
//     }
//   }
// }

// 카카오 로그인
// const kakaoLogin = async () => {
//   try {
//     await axios.get(`http://localhost:3000/auth/kakao/redirect`);
//   } catch (error) {
//     // alert(error.response.data.message);
//     console.error('Error message:', error);
//   }
// };
// $('.kakao-btn').click(kakaoLogin);

// 카카오 로그인
// 배포하고 리다이렉트 URI 설정해야 요청보낼 수 있음
const kakaoLogin = async () => {
  window.location.href = `https://accounts.kakao.com/login/?continue=https%3A%2F%2Fkauth.kakao.com%2Foauth%2Fauthorize%3Fresponse_type%3Dcode%26redirect_uri%3Dhttp%253A%252F%252Flocalhost%253A3000%252Fauth%252Fkakao%252Foauth%26through_account%3Dtrue%26client_id%3Ddae6d4e105dcbf37d7fb9fdedec4f936#login`;
};
$('.kakao-btn').click(kakaoLogin);
