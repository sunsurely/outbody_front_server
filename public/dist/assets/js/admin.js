// 로그인 여부 확인
const accessToken = localStorage.getItem('cookie');

// 1. 블랙리스트 생성모달
document.getElementById('addBlackList').onclick = function (e) {
  e.preventDefault();
  $('#blackListUseradd').modal('show');
};
document.getElementById('cancelBlackList').onclick = function () {
  $('#blackListUseradd').modal('hide');
};

// 2. 회원탈퇴 생성모달
document.getElementById('removeUser').onclick = function (e) {
  e.preventDefault();
  $('#withdrawal').modal('show');
};
document.getElementById('canceldelete').onclick = function () {
  $('#withdrawal').modal('hide');
};

// 이메일로 회원 조회 & 블랙리스트 생성 (성공)
$('#findBlackList').on('click', async () => {
  const email = $('#searchEmail').val();
  if (!email) {
    alert('E-mail을 입력해주세요');
    return;
  }
  const searchedUser = $('#searched-user');
  $(searchedUser).html('');
  try {
    const response = await axios.get(`http://localhost:3000/user/me/searchEmail/?email=${email}`, {
      headers: {
        Authorization: accessToken,
      },
    });
    const user = response.data.data;
    const userEmail = user.email;
    const userId = user.id;

    const temp = `<div id=${userId}><img  class="rounded-circle" src=${
      user.imgUrl ? user.imgUrl : 'assets/img/avatar/avatar-1.png'
    } style="width:50px; margin-right:10px"><span>${user.name}(${userEmail})</span></div> <br/> `;
    $(searchedUser).html(temp);

    $('#createBlackList').on('click', async () => {
      const email = $('#searchEmail').val();
      const description = $('#description').val();
      if (!description) {
        alert('신고 사유를 입력해주세요');
        return;
      }
      const data = { email, description };
      try {
        await axios.post(`http://localhost:3000/blacklist`, data, {
          headers: { Authorization: accessToken },
        });
        alert(`${user.name}(${user.email})님을 블랙리스트에 등록했습니다.`);
        window.location.reload();
      } catch (error) {
        alert(error.response.data.message);
      }
    });
  } catch (error) {
    alert(error.response.data.message);
  }
});

// 이메일로 블랙리스트 조회 (블랙리스트만 조회가능) & 강제 탈퇴

$('#findwithdrawal').on('click', async () => {
  const userEmail = $('#withdrawalEmail').val();
  if (!userEmail) {
    alert('E-mail을 입력해주세요');
    return;
  }
  const withdrawUser = $('#searched-withdraw-user');
  $(withdrawUser).html('');

  try {
    const response = await axios.get(`http://localhost:3000/user/me/searchEmail/?email=${email}`, {
      headers: {
        Authorization: accessToken,
      },
    });
    const user = response.data.data;
    const userEmail = user.email;
    const userId = user.id;

    const userInfoHTML = `
    <div id=${userId}>
      <span>Email: ${userEmail}</span><br />
      <span>User ID: ${userId}</span><br />
      <span>Created At: ${user.createdAt}</span>
    </div> <br/>`;
    $(withdrawUser).html(userInfoHTML);

    $('#deleteUser').on('click', async () => {
      const email = $('#searchEmail').val();
      const description = $('#withdrawaldescription').val();
      if (!description) {
        alert('해당 회원의 계정삭제 사유를 입력해주세요');
        return;
      }
      const data = { email, description };
      try {
        await axios.delete(`http://localhost:3000/blacklist/withdraw`, data, {
          headers: { Authorization: accessToken },
        });
        alert(`${user.email} 해당 계정을 OutBody 서비스에서 삭제했습니다.`);
        window.location.reload();
      } catch (error) {
        alert(error);
      }
    });
  } catch (error) {
    alert(error);
  }
});

$(document).ready(function () {
  checkAdmin();
  recordPage(1, 10);
});

('use strict');
let nowPage = 1;
let orderList = 'normal';
let totalPages = 0;

// 신고기록 목록 조회 (페이지네이션)
async function recordPage(page, pageSize) {
  nowPage = 1;
  await axios
    .get(`http://localhost:3000/report?page=${page}&pageSize=${pageSize}`, {
      headers: {
        Authorization: accessToken,
      },
    })
    .then((response) => {
      const data = response.data.data.pageinatedReports;
      const reportTable = document.querySelector('#report-table');
      reportTable.innerHTML = `<tr>
      <th>신고 Id</th>
      <th>유저 Id</th>
      <th>댓글내용</th>
      <th>신고내용</th>
      <th>신고날짜</th>
      <th></th>
    </tr>`;

      function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }

      reportTable.innerHTML += response.data.data.pageinatedReports
        .map((report) => {
          const formattedDate = formatDate(report.report_createdAt);
          return `<tr id="${report.comment_userId}">
      <td><span class="badge badge-transparent">${report.report_commentId}</span></td>
      <td><span class="badge badge-transparent">${report.comment_userId}</span></td>
      <td><span class="badge badge-transparent">${report.comment_comment}</span></td>
      <td><span class="badge badge-transparent">${report.report_description}</span></td>
      <td><span class="badge badge-transparent">${formattedDate}</span></td>
      <td><a href="#" id="${report.comment_userId}" class="blacklist-link">
      <button class="btn btn-primary" style="border-radius: 15px;">
      블랙리스트 추가
      </button>
      </a>
      </td>
      </tr>`;
        })
        .join('');

      // 블랙리스트 추가버튼 이벤트핸들러
      // 3. 블랙리스트 추가 생성모달 (성공)

      $('.blacklist-link').on('click', function (event) {
        try {
          event.preventDefault();
          const id = $(this).attr('id');
          const userId = id.charAt(id.length - 1);
          $('#addBlackUser').modal('show');

          $('#blackuser').on('click', function () {
            const description = $('#blackdescription').val();
            const data = { description };

            axios.post(`http://localhost:3000/blacklist/${userId}`, data, {
              headers: { Authorization: accessToken },
            });
            alert(`userId: ${userId}님을 블랙리스트에 추가했습니다.`);
          });
        } catch (error) {
          alert('Error message:', error.response.data.message);
        }

        // 취소 버튼 클릭 시 모달 창 닫기
        $('#canceluser').on('click', function () {
          $('#addBlackUser').modal('hide');
        });
      });

      const pagenationTag = $('.pagination');
      const prevButton = `<li id="prev_button" class="page-item">
                            <a class="page-link">previous</a>
                          </li>`;
      const nextButton = `<li id="next_button" class="page-item">
                            <a class="page-link">next</a>
                          </li>`;

      let pageNumbers = '';
      let pageNumbersHtml = '';
      const totalPages = response.data.data.totalPages;

      for (let i = 1; i <= totalPages; i++) {
        pageNumbers += `<li class="page-item page_number">
                        <a id="nowPage-${i}" class="page-link">${i}</a>
                      </li>`;
      }
      pageNumbersHtml = prevButton + pageNumbers + nextButton;
      $(pagenationTag).html(pageNumbersHtml);

      const prevBtn = $('#prev_button');
      const nextBtn = $('#next_button');
      const pages = $('.page_number');

      $(pages).find(`#nowPage-${nowPage}`).css('background-color', 'rgb(103,119,239)');
      $(pages).find(`#nowPage-${nowPage}`).css('color', 'white');

      // Previous Button Clicked
      $(prevBtn).click(async () => {
        if (nowPage > 1) {
          reportTable.innerHTML = '';
          try {
            $(pages).find('.page-link').css('background-color', '');
            $(pages).find('.page-link').css('color', '');

            const { data } = await getReports(nowPage - 1, 10);
            reportTable.innerHTML = `<tr>
      <th>Id</th>
      <th>comment</th>
      <th>description</th>
      <th>createdAt</th>
      <th></th>
    </tr>`;
            reportTable.innerHTML += data.pageinatedReports
              .map((report) => {
                const formattedDate = formatDate(report.report_createdAt);
                return `<tr id="${report.report_id}">
      <td><span class="badge badge-transparent">${report.report_commentId}</span></td>
      <td><span class="badge badge-transparent">${report.comment_comment}</span></td>
      <td><span class="badge badge-transparent">${report.report_description}</span></td>
      <td><span class="badge badge-transparent">${formattedDate}</span></td>
      <td><a href="#" id="${report.report_id}">
      <button class="btn btn-primary" style="border-radius: 15px;">
      블랙리스트 추가
      </button>
      </a>
      </td>
      </tr>`;
              })
              .join('');

            nowPage -= 1;

            $(pages).find(`#nowPage-${nowPage}`).css('background-color', 'rgb(103,119,239)');
            $(pages).find(`#nowPage-${nowPage}`).css('color', 'white');
          } catch (error) {
            alert(error.response.data.message);
          }
        }
      });

      // Next Button Clicked
      $(nextBtn).click(async () => {
        if (nowPage > 0 && nowPage < totalPages) {
          reportTable.innerHTML = '';
          try {
            $(pages).find('.page-link').css('background-color', '');
            $(pages).find('.page-link').css('color', '');

            const { data } = await getReports(nowPage + 1, 10);
            $(reportTable).innerHTML = `<tr>
        <th>Id</th>
        <th>comment</th>
        <th>description</th>
        <th>createdAt</th>
        <th></th>
      </tr>`;
            reportTable.innerHTML += data.pageinatedReports
              .map((report) => {
                const formattedDate = formatDate(report.report_createdAt);
                return `<tr id="${report.report_id}">
        <td><span class="badge badge-transparent">${report.report_commentId}</span></td>
        <td><span class="badge badge-transparent">${report.comment_comment}</span></td>
        <td><span class="badge badge-transparent">${report.report_description}</span></td>
        <td><span class="badge badge-transparent">${formattedDate}</span></td>
        <td><a href="#" id="${report.report_id}">
        <button class="btn btn-primary" style="border-radius: 15px;">
        블랙리스트 추가
        </button>
        </a>
        </td>
        </tr>`;
              })
              .join('');

            nowPage += 1;

            $(pages).find(`#nowPage-${nowPage}`).css('background-color', 'rgb(103,119,239)');
            $(pages).find(`#nowPage-${nowPage}`).css('color', 'white');
          } catch (error) {
            alert(error.response.data.message);
          }
        }
      });
      // Each Page Clicked
      $(pages).each((index, page) => {
        $(page).click(async () => {
          reportTable.innerHTML = '';
          $(pages).find('.page-link').css('color', '');

          try {
            const { data } = await getReports(parseInt($(page).find(`.page-link`).text()), 10);

            reportTable.innerHTML = `<tr>
        <th>Id</th>
        <th>comment</th>
        <th>description</th>
        <th>createdAt</th>
        <th></th>
      </tr>`;
            reportTable.innerHTML += data.pageinatedReports
              .map((report) => {
                const formattedDate = formatDate(report.report_createdAt);
                return `<tr id="${report.report_id}">
        <td><span class="badge badge-transparent">${report.report_commentId}</span></td>
        <td><span class="badge badge-transparent">${report.comment_comment}</span></td>
        <td><span class="badge badge-transparent">${report.report_description}</span></td>
        <td><span class="badge badge-transparent">${formattedDate}</span></td>
        <td><a href="#" id="${report.report_id}">
        <button class="btn btn-primary" style="border-radius: 15px;">
        블랙리스트 추가
        </button>
        </a>
        </td>
        </tr>`;
              })
              .join('');
            nowPage = parseInt($(page).find(`.page-link`).text());

            $(pages).find(`#nowPage-${nowPage}`).css('background-color', 'rgb(103,119,239)');

            $(pages).find(`#nowPage-${nowPage}`).css('color', 'white');
          } catch (error) {
            alert(error.response.data.message);
          }
        });
      });
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
}

// 신고목록 조회함수
async function getReports(page, pageSize) {
  try {
    const { data } = await axios.get(
      `http://localhost:3000/report?page=${page}&pageSize=${pageSize}`,
      {
        headers: {
          Authorization: accessToken,
        },
      }
    );
    return data;
  } catch (error) {
    alert(error.response.data.message);
  }
}

async function checkAdmin() {
  try {
    const { data } = await axios.get(
      `http://localhost:3000/blacklist/permision`,
      {
        headers: {
          Authorization: adminToken,
        },
      },
    );
    const permision = data.data;

    if (!permision) {
      alert('잘못된 접근입니다!');
      window.location.href = '/';
    }
  } catch (error) {
    console.error(error.response.data.message);
  }
}
