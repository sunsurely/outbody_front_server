const signupPort = '3.38.108.185';
// const signupPort = 'localhost';

// 인증번호 발송 (재용)
$('#sendEmail').click(() => {
  const email = $('#email').val();
  sendEmail(email);
});
async function sendEmail(email) {
  if (!email) {
    alert('계정(e-mail)을 입력해주세요.');
    return;
  }
  await axios
    .post(`http://${signupPort}/user/signup/email`, { email })
    .then((response) => {
      if (response.data.success === true) {
        alert('인증번호가 발송되었습니다.');
      }
    })
    .catch((error) => {
      alert(error);
    });
}

// 회원가입
const signUp = async () => {
  try {
    const name = $('#name').val();
    const email = $('#email').val();
    const verifyNumberInput = $('#verifyNumberInput').val();
    const password = $('#password').val();
    const confirmPassword = $('#confirm_password').val();
    const gender = $('#gender').val();
    const birthday = $('#user-birthday').val();

    if (!name) {
      alert('이름을 입력해주세요');
      return;
    }
    if (!email) {
      alert('계정(e-mail)을 입력해주세요');
      return;
    }
    if (!verifyNumberInput) {
      alert('인증번호를 입력해주세요');
      return;
    }
    if (!password) {
      alert('비밀번호를 입력해주세요');
      return;
    }
    if (!confirmPassword) {
      alert('비밀번호 확인을 입력해주세요');
      return;
    }
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다');
      return;
    }
    if (gender === '-- 선택 --') {
      alert('성별을 선택해주세요');
      return;
    }

    await axios.post(`http://${signupPort}/user/signup`, {
      name,
      email,
      verifyNumberInput: parseInt(verifyNumberInput),
      password,
      gender,
      birthday,
    });

    alert('회원가입이 완료되었습니다.');
    location.href = `login.html`;
  } catch (error) {
    alert(error.response.data.message);
    console.error(error);
  }
};
$('#signUp_btn').click(signUp);
