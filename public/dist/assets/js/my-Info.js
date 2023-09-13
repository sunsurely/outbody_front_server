const myinfoPort = '3.39.237.124';

// 로그인 여부 확인
const accessToken = localStorage.getItem('cookie');

$(document).ready(function () {
  initMyPage();
});

$(document).ready(function () {
  $('#eyeCurrent').on('click', function (event) {
    event.preventDefault();
    if ($('#current').attr('type') == 'text') {
      $('#current').attr('type', 'password');
      $(this).removeClass('fa-eye-slash');
      $(this).addClass('fa-eye');
    } else if ($('#current').attr('type') == 'password') {
      $('#current').attr('type', 'text');
      $(this).removeClass('fa-eye');
      $(this).addClass('fa-eye-slash');
    }
  });

  $('#eyeNew').on('click', function (event) {
    event.preventDefault();
    if ($('#newpw').attr('type') == 'text') {
      $('#newpw').attr('type', 'password');
      $(this).removeClass('.fas fa-eye-slash');
      $(this).addClass('.fas fa-eye');
    } else if ($('#newpw').attr('type') == 'password') {
      $('#newpw').attr('type', 'text');
      $(this).removeClass('.fas fa-eye');
      $(this).addClass('.fas fa-eye-slash');
    }
  });

  $('#eyeConfirm').on('click', function (event) {
    event.preventDefault();
    if ($('#confirmpw').attr('type') == 'text') {
      $('#confirmpw').attr('type', 'password');
      $(this).removeClass('.fas fa-eye-slash');
      $(this).addClass('.fas fa-eye');
    } else if ($('#confirmpw').attr('type') == 'password') {
      $('#confirmpw').attr('type', 'text');
      $(this).removeClass('.fas fa-eye');
      $(this).addClass('.fas fa-eye-slash');
    }
  });
});

// 1. 정보수정 모달
document.getElementById('userInfoEdit').onclick = function (e) {
  e.preventDefault();
  $('#infoEditModal').modal('show');
};
document.getElementById('editcancel').onclick = function () {
  $('#infoEditModal').modal('hide');
};

// 2. 비밀번호수정 모달
document.getElementById('passwordEdit').onclick = function (e) {
  e.preventDefault();
  $('#pwEditModal').modal('show');
};
document.getElementById('passwordcancel').onclick = function () {
  $('#pwEditModal').modal('hide');
};

// 3. 회원탈퇴 모달
document.getElementById('signout').onclick = function (e) {
  e.preventDefault();
  $('#signoutModal').modal('show');
};
document.getElementById('signoutcancel').onclick = function () {
  $('#signoutModal').modal('hide');
};

// 4. 친구찾기 모달
document.getElementById('searchfriend').onclick = function (e) {
  e.preventDefault();
  $('#searchfriendModal').modal('show');
};
document.getElementById('searchfriendCancel').onclick = function () {
  $('#searchfriendModal').modal('hide');
};

// 내 정보 수정 (재용 작성)
$('#update-userInfo-button').click(updateUserInfo);
accessToken;
async function updateUserInfo() {
  const profileImage = $('#profile-image-upload')[0].files[0];
  const birthday = $('#user-birthday').val();
  const description = $('#user-description').val();
  const myName = $('#user-name').val();

  const formData = new FormData();
  formData.append('image', profileImage);
  formData.append('birthday', birthday);
  formData.append('description', description);
  formData.append('name', myName);

  await axios
    .patch(`http://${myinfoPort}:3000/user/me`, formData, {
      headers: {
        Authorization: accessToken,
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((response) => {
      if (response.data.success === true) {
        alert('내 정보 수정이 완료되었습니다.');
        location.reload();
      }
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
}

// 글자 수 실시간
$('#user-description').on('input', function () {
  const description = $(this).val();
  const maxLength = parseInt($(this).attr('maxlength'));
  const charCount = description.length;
  $('#description-char-count').text(charCount + '/' + maxLength);
});

// 올린 사진 미리보기
const image = document.querySelector('#profile-image-upload');
image.addEventListener('change', (event) => {
  const reader = new FileReader();
  reader.readAsDataURL(event.target.files[0]);

  reader.onload = function (event) {
    const profileImage = document.createElement('img');
    profileImage.setAttribute('src', event.target.result);
    profileImage.style.maxWidth = '50%';
    profileImage.style.display = 'block';
    profileImage.style.margin = '0 auto';
    document.querySelector('#image-container').appendChild(profileImage);
  };
});

//내 정보 조회
async function initMyPage() {
  const pointTag = $('#my-point');
  const rankTag = $('#my-rank');
  const friendTag = $('#friend-count');
  const nameTag = $('#descriptionName');
  const description = $('#self-description');
  const email = $('#emailaddress');
  const birthday = $('#bdaytag');
  const gender = $('#mygender');
  const createdAt = $('#createdate');
  const myFriends = $('#my-friends-list');
  const profileImg = $('#profile-image');

  try {
    const { data } = await axios.get(
      `http://${myinfoPort}:3000/user/me/profile`,
      {
        headers: {
          Authorization: accessToken,
        },
      },
    );

    const challengeId = data.data.challengeId;
    if (challengeId) {
      const challengeData = await axios.get(
        `http://${myinfoPort}:3000/challenge/${challengeId}`,
        {
          headers: {
            Authorization: accessToken,
          },
        },
      );

      const title = $('#title');
      const challengeDesc = $('#desc');
      const date = $('#date');

      $(title).text(`제목: ${challengeData.data.data.title}`);
      $(challengeDesc).text(
        `설명: ${challengeData.data.data.description.replace(/<[^>]*>/g, '')}`,
      );
      $(date).text(
        `도전 기간: ${challengeData.data.data.startDate} ~ ${challengeData.data.data.endDate}`,
      );
    }

    const rankData = await axios.get(`http://${myinfoPort}:3000/user/me/rank`, {
      headers: {
        Authorization: accessToken,
      },
    });

    const myData = data.data.rest;

    const followersInfo = data.data.followersInfo;
    // const followerId = followersInfo.followId;
    $(pointTag).text(myData.point);
    $(friendTag).text(followersInfo.length);
    $(nameTag).text(myData.name);
    if (challengeId) {
      $('#challenge-card').on('click', () => {
        window.location.href = `get-one-challenge.html?id=${challengeId}`;
      });
    }

    $(description).text(myData.description);
    $(rankTag).text(rankData.data.data);
    $(email).text(myData.email);
    $(birthday).text(myData.birthday ? myData.birthday : '미입력');
    $(gender).text(myData.gender ? myData.gender : '미입력');
    let num = 1;
    let followTemp = '';
    for (const follower of followersInfo) {
      const temp = `<tr>
      <th style="padding-top: 15px;" scope="row">${num}</th>
      <td style="padding-top: 15px;">${follower.name}</td>
      <td style="padding-top: 15px;">${follower.email}</td>
      <td style="padding-top: 15px;">${follower.point}점</td>
      <td style="padding-top: 15px;">${follower.ranking}위</td>
      <td>
        <div followerId="${follower.id}" class="btn btn-primary delete-friend-button" style="border-radius: 15px;">
          친구 삭제
        </div>
      </td>
    </tr>`;
      followTemp += temp;
      num++;
    }
    $(profileImg).attr(
      'src',
      myData.imgUrl
        ? `https://inflearn-nest-cat.s3.amazonaws.com/${myData.imgUrl}`
        : 'assets/img/avatar/avatar-1.png',
    );
    $(myFriends).html(followTemp);
    const date = new Date(myData.createdAt);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const myCreatedAt = `${year}.${month}.${day}`;
    $(createdAt).text(myCreatedAt);
  } catch (error) {
    console.error('Error message:', error.response.data.message);
  }
}

// 친구 삭제
$(document).on('click', '.delete-friend-button', function () {
  deleteFriend($(this).attr('followerId'));
});
async function deleteFriend(followerId) {
  try {
    await axios.delete(`http://${myinfoPort}:3000/follow/${followerId}`, {
      headers: {
        Authorization: accessToken,
      },
    });
    alert('친구 삭제 완료');
    location.reload();
  } catch (error) {
    alert(error.response.data.message);
    location.reload();
  }
}

// 비밀번호변경 (성공)
async function editPassword() {
  const current = $('#current').val();
  const newpw = $('#newpw').val();
  const confirmpw = $('#confirmpw').val();

  // console.log('현재 비밀번호', current);
  // console.log('새로운 비밀번호', newpw);
  // console.log('컨펌 비밀번호', confirmpw);

  if (current === '') {
    alert('현재 비밀번호를 입력해주세요.');
    return;
  } else if (newpw === '') {
    alert('변경할 비밀번호를 입력해주세요.');
    return;
  } else if (confirmpw === '') {
    alert('변경 비밀번호 확인을 입력해주세요.');
    return;
  } else if (newpw !== confirmpw) {
    alert('변경 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
    return;
  }

  const data = {
    password: current,
    newPassword: newpw,
  };

  await axios
    .patch(`http://3.34.131.11:8080/user/me/password`, data, {
      headers: {
        Authorization: accessToken,
      },
    })
    .then((response) => {
      if (response.data) {
        alert(`회원님의 비밀번호가 변경되었습니다.`);
      } else {
        alert('비밀번호 변경에 실패했습니다.');
      }
    })
    .catch((error) => {
      console.error('Error message:', error.response.data.message);
    });
}

//회원탈퇴
const signoutBtn = $('#signout-btn');
$(signoutBtn).click(async () => {
  const password = $('#signoutpassword').val();
  const data = { password };
  try {
    await axios.delete(`http://${myinfoPort}:3000/user/me/signout`, {
      data,
      headers: { Authorization: accessToken },
    });

    alert('서비스를 탈퇴하셨습니다');
  } catch (error) {
    console.error('Error message:', error.response.data.message);
  }
});

//친구찾기 , 친구요청 보내기
$('#searchFriendByEmail').on('click', async () => {
  const email = $('#searchEmail').val();
  const searchUser = $('#searched-friend');
  $(searchUser).html('');
  try {
    const response = await axios.get(
      `http://${myinfoPort}:3000/user/me/searchEmail/?email=${email}`,
      {
        headers: {
          Authorization: accessToken,
        },
      },
    );

    const user = response.data.data;
    const userEmail = user.email;
    const index = userEmail.indexOf('@');
    const preString = userEmail.slice(0, 3);
    const nextString = userEmail.slice(index, index + 3);

    const emailText = `${preString}***${nextString}***`;

    const temp = `
    <div class="card card-primary">
      <div class="card-body">
        <div id=${user.id}>
          <img class="rounded-circle" src=${
            user.imgUrl
              ? `https://inflearn-nest-cat.s3.amazonaws.com/${user.imgUrl}`
              : 'assets/img/avatar/avatar-1.png'
          } style="width:50px; margin-right:10px">
          <span>${user.name}(${emailText})</span>
        </div>
      </div>
    </div>`;
    $(searchUser).html(temp);

    const userId = user.id;
    $('#send-invite').on('click', async () => {
      const isChecked = $('#invite-checkbox').prop('checked');
      try {
        if (isChecked) {
          await axios.post(
            `http://${myinfoPort}:3000/follow/${userId}/request`,
            {},
            {
              headers: { Authorization: accessToken },
            },
          );
          alert(`${user.name}(${user.email})님에게 친구요청을 보냈습니다.`);
          window.location.reload();
        } else {
          alert('안내 사항에 동의해주세요.');
        }
      } catch (error) {
        alert(error.response.data.message);
      }
    });
  } catch (error) {
    alert(error.response.data.message);
  }
});
