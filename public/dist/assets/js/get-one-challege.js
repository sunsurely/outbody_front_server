const getOneChallengePort = '52.79.176.121';
// const getOneChallengePort = 'localhost';

const urlParams = new URLSearchParams(window.location.search);
const challengeId = urlParams.get('id');

const getAccessToken = localStorage.getItem('cookie');
const expiration = localStorage.getItem('tokenExpiration');
const isTokenExpired = new Date().getTime() > expiration;

if (!getAccessToken || !isTokenExpired) {
  localStorage.setItem('cookie', '');
  localStorage.setItem('tokenExpiration', '');
  alert('로그인이 필요한 기능입니다.');
  location.href = 'login.html';
}

window.onload = function () {
  getChallengeDetail();
  getChallengers();
};

// 도전 상세 조회 (도전)
async function getChallengeDetail() {
  axios
    .get(`http://${getOneChallengePort}:3000/challenge/${challengeId}`, {
      headers: {
        Authorization: getAccessToken,
      },
    })
    .then((response) => {
      const challenge = response.data.data;

      // 남은 시간 설정
      const endDate = new Date(challenge.endDate);
      const twoHourBefore = endDate.getTime() - 2 * 60 * 60 * 1000;

      function formatTimeRemaining(timeDifference) {
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor(
          (timeDifference % (1000 * 60 * 60)) / (1000 * 60),
        );
        const seconds = Math.floor(timeDifference / 1000) % 60;

        return `${days}일 ${hours}시간 ${minutes}분 ${seconds}초`;
      }

      function updateTime() {
        const now = new Date();
        const timeDifference = twoHourBefore - now;

        if (timeDifference <= 0) {
          // 도전 종료 시간이 지났을 때의 처리
          $('#countdown').text('도전이 종료되었습니다.');
        } else {
          // 남은 시간을 재가공하여 HTML에 최신화
          const formattedTimeRemaining = formatTimeRemaining(timeDifference);
          $('#countdown').text(formattedTimeRemaining);
        }
      }

      // 초기 최신화
      updateTime();

      // 1분마다 최신화
      setInterval(updateTime, 1000);

      const profileImage = challenge.userImageUrl
        ? `https://inflearn-nest-cat.s3.amazonaws.com/${challenge.userImageUrl}`
        : `assets/img/avatar/avatar-1.png`;

      const challengeDetail = document.querySelector('#challenge-detail');
      challengeDetail.innerHTML = `<div class="card card-primary">
          <div class="card-header">
            <h4>${challenge.title}</h4>
            <div class="card-header-action">
              <a id="enter-challenge" class="btn btn-primary" style="color: white;">도전 입장</a>
              <a id="leave-challenge" class="btn btn-primary" style="color: white;">도전 퇴장</a>
              <a class="btn btn-secondary" style="color: white;">${
                challenge.userNumber
              } / ${challenge.userNumberLimit}명</a>
              <a id="delete-challenge" class="btn btn-danger" style="color: white;">삭제</a>
            </div>
          </div>
          <div class="card-body">
            <div class="section-title mt-0">설명</div>
            <p>${challenge.description}</p>
            <div class="section-title mt-0" style="margin-bottom: 20px;">기간</div>          
            <button class="btn btn-primary" style="margin-bottom: 20px;">시작일
              <span class="badge badge-transparent">${
                challenge.startDate
              }</span>
              &nbsp종료일 <span class="badge badge-transparent">${
                challenge.endDate
              }</span>&nbsp
            </button>
            <button class="btn btn-primary" style="margin-bottom: 20px;">
              도전 종료까지 <span id="countdown" class="badge badge-transparent"></span>&nbsp남음
            </button>
            <div class="section-title mt-0" style="margin-bottom: 20px;">목표</div>
            <button class="btn btn-primary" style="margin-bottom: 20px;">
              오운완 출석<span class="badge badge-transparent">${
                challenge.goalAttend
              }일</span>
            </button>
            <button class="btn btn-primary" style="margin-bottom: 20px;">
              체중 <span class="badge badge-transparent">-${
                challenge.goalWeight
              }kg</span>
            </button>
            <button class="btn btn-primary" style="margin-bottom: 20px;">
              골격근량 <span class="badge badge-transparent">+${
                challenge.goalMuscle
              }kg</span>
            </button>
            <button class="btn btn-primary" style="margin-bottom: 20px;">
              체지방률 <span class="badge badge-transparent">-${
                challenge.goalFat
              }%</span>
            </button>
            <div class="section-title mt-0" style="margin-bottom: 20px;">점수</div>
            <button class="btn btn-danger" style="margin-bottom: 10px;">
              실패 시<span class="badge badge-transparent">-${
                challenge.entryPoint
              }점</span>
            </button>
            <button class="btn btn-success" style="margin-bottom: 10px;">
              성공 시 최대<span class="badge badge-transparent">+${
                challenge.userNumber * challenge.entryPoint
              }점</span>
            </button>
          </div>
          <div class="card-footer bg-whitesmoke">
            <ul class="list-unstyled list-unstyled-border" style="margin-top: 20px;">
              <li class="media">
                <img alt="image" style="border-radius:50%; width:50px; height:50px; margin-right: 15px;" src="${profileImage}">
                <div class="media-body">
                  <div class="mt-0 mb-1 font-weight-bold">${
                    challenge.userName
                  }</div>
                  <div class="font-1000-bold"><i class="fas fa-circle"></i> ${
                    challenge.userPoint
                  }점</div>
                </div>
              </li>
            </ul>
          </div>
        </div>`;
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
}

// 도전 상세 조회 (도전자)
async function getChallengers() {
  axios
    .get(
      `http://${getOneChallengePort}:3000/challenge/${challengeId}/challengers`,
      {
        headers: {
          Authorization: getAccessToken,
        },
      },
    )
    .then((response) => {
      const challengerCardHeader = document.querySelector(
        '#challenger-card-header',
      );
      challengerCardHeader.innerHTML = `
        <div class="card card-primary">
          <div class="card-header">
            <h4>참가자 목록</h4>
            <div class="card-header-action">
              <a id="send-invitation-button" href="get-post.html?id=${challengeId}" class="btn btn-primary" style="color: white;">오운완 인증</a>
              <a class="btn btn-primary" style="color: white;" data-toggle="modal" data-target="#createModal">친구 초대</a>
            </div>
          </div>
          <div class="card-body">
            <ul id="challenger-list" class="list-unstyled list-unstyled-border">
            </ul>
          </div>
        </div>`;
      const challengerList = document.querySelector('#challenger-list');
      challengerList.innerHTML += response.data.data
        .map((challenger) => {
          const profileImage = challenger.user.imgUrl
            ? `https://inflearn-nest-cat.s3.amazonaws.com/${challenger.user.imgUrl}`
            : `assets/img/avatar/avatar-1.png`;

          return `<li class="media">
            <img alt="image" style="border-radius:50%; width:50px; height:50px; margin-right: 15px;"
            src="${profileImage}">
            <div class="media-body">
              <div class="mt-0 mb-1 font-weight-bold">${challenger.user.name}</div>
              <div class="font-1000-bold"><i class="fas fa-circle"></i> ${challenger.user.point}점</div>
            </div>
          </li>`;
        })
        .join('');
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
}

// 도전 입장
document.addEventListener('click', async (event) => {
  const target = event.target;

  if (target.matches('#enter-challenge')) {
    await axios
      .post(
        `http://${getOneChallengePort}:3000/challenge/${challengeId}/enter`,
        null,
        {
          headers: {
            Authorization: getAccessToken,
          },
        },
      )
      .then((response) => {
        if (response.data.success === true) {
          alert('도전 입장 완료');
          location.reload();
        }
      })
      .catch((error) => {
        alert(error.response.data.message);
      });
  }
});

// 도전 퇴장
document.addEventListener('click', async (event) => {
  const target = event.target;

  if (target.matches('#leave-challenge')) {
    const leaveConfirm = confirm('정말로 퇴장하시겠습니까?');

    if (leaveConfirm) {
      await axios
        .delete(
          `http://${getOneChallengePort}:3000/challenge/${challengeId}/leave`,
          {
            headers: {
              Authorization: getAccessToken,
            },
          },
        )
        .then((response) => {
          if (response.data.success === true) {
            alert('도전 퇴장 완료');
            location.reload();
          }
        })
        .catch((error) => {
          alert(error.response.data.message);
        });
    }
  }
});

// 도전 삭제
document.addEventListener('click', async (event) => {
  const target = event.target;

  if (target.matches('#delete-challenge')) {
    const deleteConfirm = confirm('정말로 삭제하시겠습니까?');

    if (deleteConfirm) {
      await axios
        .delete(`http://${getOneChallengePort}:3000/challenge/${challengeId}`, {
          headers: {
            Authorization: getAccessToken,
          },
        })
        .then((response) => {
          alert('도전 삭제 완료');
          location.reload();
        })
        .catch((error) => {
          alert(error.response.data.message);
        });
    }
  }
});

// 도전 초대
$('#send-invitation-button').on('click', async () => {
  const emailInput = $('#search-email-input').val();

  const searchedFriend = $('#searched-friend');
  $(searchedFriend).html('');

  let userResponse, followResponse;

  try {
    userResponse = await axios.get(
      `http://${getOneChallengePort}:3000/user/me/searchEmail/?email=${emailInput}`,
      {
        headers: {
          Authorization: getAccessToken,
        },
      },
    );
  } catch (error) {
    console.error(error.response.message);
  }

  const friend = userResponse.data.data;

  try {
    followResponse = await axios.get(
      `http://${getOneChallengePort}:3000/follow/${friend.id}/isFollowed`,
      {
        headers: {
          Authorization: getAccessToken,
        },
      },
    );
  } catch (error) {
    console.error(error.response.message);
  }

  const isFollowed = followResponse.data.data;

  if (isFollowed) {
    const temp = `
    <div class="card card-primary">
      <div class="card-body">
        <div id=${friend.id}>
          <img class="rounded-circle" src=${
            friend.imgUrl
              ? `https://inflearn-nest-cat.s3.amazonaws.com/${friend.imgUrl}`
              : 'assets/img/avatar/avatar-1.png'
          } style="width:50px; margin-right:10px">
          <span> ${friend.name}(${friend.email})</span>
        </div>
      </div>
    </div>`;
    $(searchedFriend).html(temp);
  }

  $('#send-invitation').on('click', async () => {
    const data = {
      email: friend.email,
    };

    await axios
      .post(
        `http://${getOneChallengePort}:3000/challenge/${challengeId}/invite`,
        data,
        {
          headers: {
            Authorization: getAccessToken,
          },
        },
      )
      .then((response) => {
        alert(
          `${friend.name}(${friend.email})님에게 도전 초대문을 보냈습니다.`,
        );
        location.reload();
      })
      .catch((error) => {
        alert(error.response.data.message);
      });
  });
});
