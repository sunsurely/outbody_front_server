const accessToken = localStorage.getItem('cookie');

const filterApplyButton = document.querySelector('#filter-apply-button');
filterApplyButton.addEventListener('click', () => {
  const option = $('#challenge-filter').val();
  getChallenges(option);
});

// 도전 목록 조회
async function getChallenges(option) {
  await axios
    .get(`http://localhost:3000/challenge?filter=${option}`, {
      headers: {
        Authorization: accessToken,
      },
    })
    .then((response) => {
      console.log(response.data.data);

      const challengeTable = document.querySelector('#challenge-table');
      challengeTable.innerHTML = `<tr>
          <th>제목</th>
          <th>기간</th>
          <th>목표</th>
          <th>점수</th>
          <th>인원</th>
          <th>작성자</th>
          <th>공개 여부</th>
          <th></th>
        </tr>`;
      challengeTable.innerHTML += response.data.data
        .map((challenge) => {
          let publicView = challenge.publicView;
          if (publicView === true) {
            publicView = '전체';
          } else if (publicView === false) {
            publicView = '비공개';
          }

          return `<tr id="${challenge.id}">
          <td>${challenge.title}</td>
          <td>${challenge.startDate} ~ ${challenge.endDate} (${
            challenge.challengeWeek
          }주)</td>
          <td>
            <button class="btn btn-primary">
              오운완 출석<span class="badge badge-transparent">${
                challenge.goalAttend
              }일</span>
            </button>
            <button class="btn btn-primary">
              체중 <span class="badge badge-transparent">-${
                challenge.goalWeight
              }kg</span>
            </button>
            <button class="btn btn-primary">
              골격근량 <span class="badge badge-transparent">+${
                challenge.goalMuscle
              }kg</span>
            </button>
            <button class="btn btn-primary">
              체지방률 <span class="badge badge-transparent">-${
                challenge.goalFat
              }%</span>
            </button>
          </td>
          <td>
            <button class="btn btn-danger">
              실패 시<span class="badge badge-transparent">-${
                challenge.entryPoint
              }점</span>
            </button>
            <button class="btn btn-success">
              성공 시 최대<span class="badge badge-transparent">+${
                challenge.entryPoint * challenge.userNumber
              }점</span>
            </button>
          </td>
          <td>${challenge.userNumber} / ${challenge.userNumberLimit}명</td>
          <td>
            <img id="profile-image" alt="image"
            src="https://inflearn-nest-cat.s3.amazonaws.com/${
              challenge.hostImageUrl
            }"
            class="rounded-circle" width="35" data-toggle="title" title="">
            <div class="d-inline-block ml-1">${challenge.hostName}</div>
          </td>
          <td>${publicView}</td>
          <td>
            <a href="get-one-challenge.html?id=${challenge.id}">
              <button class="btn btn-primary" style="border-radius: 15px;">
                보기
              </button>
            </a>
          </td>
          </tr>`;
        })
        .join('');
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
}
