// const userInfoPort = 'http://localhost:3000';
const userInfoPort = 'https://wildbody.shop';

const userInfoParams = new URLSearchParams(window.location.search);
const userId = userInfoParams.get('id');

const userInfoToken = localStorage.getItem('cookie');
const expiration = localStorage.getItem('tokenExpiration');
const isTokenExpired = new Date().getTime() > expiration;

if (!userInfoToken || isTokenExpired) {
  localStorage.setItem('cookie', '');
  localStorage.setItem('tokenExpiration', '');
  const inoutBtn = $('#logout-button');
  $('.profile-button').css('display', 'none');
  $(inoutBtn).text('Login');
  setTimeout(() => {
    alert('로그인이 필요한 기능입니다.');
  }, 500);
}

$(document).ready(function () {
  userPage();
});

// 사용자 정보조회
async function userPage() {
  try {
    const { data } = await axios.get(`${userInfoPort}/user/${userId}`, {
      headers: {
        Authorization: userInfoToken,
      },
    });
    const user = data.data;

    $('#profile-image').attr(
      'src',
      user.imgUrl
        ? `inflearn-nest-cat.s3.amazonaws.com/${user.imgUrl}`
        : 'assets/img/avatar/avatar-1.png',
    );
    $('#user-point').text(user.point);
    $('#user-rank').text(user.ranking);
    $('#nameTag').text(user.name);
    const descriptionText = user.description || '';
    $('#descriptionTag').text(descriptionText);

    const followData = await axios.get(
      `${userInfoPort}/follow/${userId}/isFollowed`,
      {
        headers: {
          Authorization: userInfoToken,
        },
      },
    );
    const isFollowed = followData.data.data;

    const followBtn = $('#follow-user');
    $(followBtn).text(isFollowed ? 'unfollow' : 'follow');

    $(followBtn).on('click', async function () {
      if ($(this).text() === 'follow') {
        try {
          await axios.post(
            `${userInfoPort}/follow/${userId}/request`,
            {},
            {
              headers: { Authorization: userInfoToken },
              withCredentials: true,
            },
          );

          alert('친구 요청을 보냈습니다.');
          window.location.reload();
        } catch (error) {
          alert(error.response.data.message);
          window.location.reload();
        }
      }

      try {
        await axios.delete(`${userInfoPort}/follow/${userId}`, {
          headers: {
            Authorization: userInfoToken,
          },
        });

        alert('친구 목록에서 삭제되었습니다.');
        window.location.reload();
      } catch (error) {
        alert(error.response.data.message);
        window.location.reload();
      }
    });

    const challengeId = data.data.challengeId;
    if (challengeId) {
      $('#challenge-card').on('click', () => {
        window.location.href = `get-one-challenge.html?id=${challengeId}`;
      });
    }
    if (challengeId) {
      const challengeData = await axios.get(
        `${userInfoPort}/challenge/${challengeId}`,
        {
          headers: {
            Authorization: userInfoToken,
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
  } catch (error) {
    console.error(error.response.data.message);
  }
}
