const userInfoParams = new URLSearchParams(window.location.search);
const userId = userInfoParams.get('id');

console.log(userId);

const accessTokenForUser = localStorage.getItem('cookie');

$(document).ready(function () {
  userPage();
});

// 오운완 목록 모달
$('#postlist').click(function (e) {
  e.preventDefault();
  $('#postlistModal').modal('show');
});

$('#backtopage').click(function () {
  $('#postlistModal').modal('hide');
});

// 자동실행함수, 사용자 정보조회
async function userPage() {
  try {
    const { data } = await axios.get(`http://localhost:3000/user/${userId}`, {
      headers: {
        Authorization: accessTokenForUser,
      },
    });

    const rankData = await axios.get('http://localhost:3000/user/me/rank', {
      headers: {
        Authorization: accessTokenForUser,
      },
    });

    const user = data.data;
    const userRank = rankData.data;

    console.log(user);
    console.log(userRank);

    if (!user.description) {
      user.description = '';
    }
    // if (user.imgUrl === null) {
    //   user.imgUrl = 'assets/img/avatar/avatar-1.png';
    // }

    // let userImg = `<div class="author-box-left">
    //                   <img alt="image" src="${user.imgUrl}" class="rounded-circle author-box-picture" />
    //                   <div class="clearfix"></div>
    //                   <a href="#" class="btn btn-primary mt-3 follow-btn" data-follow-action="alert('follow clicked');"
    //                     data-unfollow-action="alert('unfollow clicked');">Follow</a>
    //                 </div>`;
    // $('.userImg-Box').html(userImg);

    let userBox = `<div class="author-box-details">
                      <div class="author-box-name">
                        <a href="#" id="nametag">${user.name}</a>
                      </div>
                      <div class="author-box-description">
                        <p id="descriptiontag">
                          ${user.description}
                        </p>
                      </div>
                      <div class="mb-2 mt-3">
                      </div>
                      <div class="w-100 d-sm-none"></div>
                      <div class="float-right mt-sm-0 mt-3">
                        <button class="btn btn-primary" id="postlist" data-toggle="modal" data-target="#exampleModal"
                          style="display: inline-block">
                          오운완 목록보기 <i class="fas fa-chevron-right"></i>
                        </button>
                      </div>
                    </div>`;

    $('.user-head').html(userBox);

    let userInfoTop = `<div class="profile-widget-items">
                        <div class="profile-widget-item">
                          <div class="profile-widget-item-label">Point</div>
                          <div class="profile-widget-item-value" id="pointtag">
                            ${user.point}
                          </div>
                        </div>
                        <div class="profile-widget-item">
                          <div class="profile-widget-item-label">Ranks</div>
                          <div class="profile-widget-item-value" id="rankstag">
                            ${userRank.data}
                          </div>
                        </div>
                        <div class="profile-widget-item">
                          <div class="profile-widget-item-label">Friends</div>
                          <div class="profile-widget-item-value" id="friendtag">
                            54
                          </div>
                        </div>
                      </div>`;
    $('.profile-widget-header').html(userInfoTop);

    let userInfoBottom = `<div class="profile-widget-description pb-0">
                            <div class="form-group col-md-6 col-12">
                              <br />
                              <h4>Information</h4>
                              <br />
                              <label>E-mail: </label>
                              <div id="emailtag">${user.email}</div>
                              <div class="invalid-feedback"></div>
                            </div>
                            <div class="form-group col-md-6 col-12">
                              <label>Gender: </label>
                              <div id="gendertag">${user.gender}</div>
                              <div class="invalid-feedback"></div>
                            </div>
                            <div class="form-group col-md-6 col-12">
                              <label>Birthday: </label>
                              <div id="birthdaytag">${user.birthday}</div>
                              <div class="invalid-feedback"></div>
                            </div>
                            <div class="form-group col-md-6 col-12">
                              <label>CreatedAt: </label>
                              <div id="createdAttag">August 15th, 2023</div>
                              <div class="invalid-feedback"></div>
                            </div>
                            <br />
                          </div>`;
    $('.userInfo-Bottom').html(userInfoBottom);
  } catch (error) {
    console.error(error.response.data.message);
  }

  // 유저 추천목록 (나와 follow관계가 아닌 유저들 추천목록)
  try {
    const response = await axios.get(
      'http://localhost:3000/user/me/recommendation',
      {
        headers: {
          Authorization: accessTokenForUser,
        },
      },
    );

    $('#users-carousel').html(recommendedUser);

    const recommendations = response.data;
    const usersCarousel = $('#users-carousel');
    recommendations.forEach((user) => {
      const userItem = `
        <div class="user-item">
          <img alt="image" src="${user.imgUrl}" class="img-fluid" />
          <div class="user-details">
            <div class="user-name">${user.name}</div>
            <div class="user-email">${user.email}</div>
            <div class="user-cta">
              <button class="btn ${
                user.followed
                  ? 'btn-danger following-btn'
                  : 'btn-primary follow-btn'
              }"
                      data-user-id="${user.id}"
                      data-action="${user.followed ? 'unfollow' : 'follow'}">
                ${user.followed ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>
        </div>
      `;
      usersCarousel.append(userItem);
    });
    // Follow 또는 Unfollow 버튼 클릭 처리
    // (follow-btn: 친구요청), (following-btn: 현재 친구상태, 누르면 친구취소)
    $('.follow-btn, .following-btn').on('click', async function () {
      const action = $(this).data('action');
      const targetUserId = $(this).data('user-id');

      try {
        //친구요청(follow)
        if (action === 'follow') {
          await axios
            .post(
              `http://localhost:3000/follow/${Number(targetUserId)}/request`,
              null,
              {
                headers: { Authorization: accessTokenForUser },
              },
            )
            .then((response) => {
              alert(`${response.data.name}님에게 친구요청을 보냈습니다.`);
            });

          //친구취소(unfollow)
        } else if (action === 'unfollow') {
          await axios
            .delete(`http://localhost:3000/follow/${Number(targetUserId)}`, {
              headers: { Authorization: accessTokenForUser },
            })
            .then((response) => {
              alert(`${response.data.name}님과 친구 취소되었습니다.`);
            });
        }

        // 버튼 상태 변경 및 메시지 출력 (버튼이 2개있는게 아니라, 버튼1개로 누를때마다 follow(친구요청), following(친구취소)이 바뀌는 형태)
        const buttonText = action === 'follow' ? 'Following' : 'Follow';
        $(this)
          .removeClass('btn-primary btn-danger')
          .addClass(action === 'follow' ? 'btn-danger' : 'btn-primary');
        $(this).text(buttonText);
        alert(
          `${action === 'follow' ? 'Followed' : 'Unfollowed'} ${
            recommendations.find((user) => user.id === targetUserId).name
          }`,
        );
      } catch (error) {
        console.error('Error:', error.response.data.message);
      }
    });
  } catch (error) {
    console.error('Error:', error.response.data.message);
  }
}
