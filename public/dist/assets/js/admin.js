// const adminPort = 'localhost';
const adminPort = '3.39.237.124';

const accessToken = localStorage.getItem('cookie');

// 1. 블랙리스트 생성모달
document.getElementById('addBlackList').onclick = function (e) {
  e.preventDefault();
  $('#blackListUseradd').modal('show');
};
document.getElementById('cancelBlackList').onclick = function () {
  $('#blackListUseradd').modal('hide');
};

// 이메일로 회원 조회 & 블랙리스트 생성 (성공)
$('#findBlackList').on('click', async () => {
  const email = $('#searchEmail').val();
  if (!email) {
    alert('계정(e-mail)을 입력해주세요.');
    return;
  }

  const searchedUser = $('#searched-user');
  $(searchedUser).html('');
  try {
    const response = await axios.get(
      `http://${adminPort}:3000/user/me/searchEmail/?email=${email}`,
      {
        headers: {
          Authorization: accessToken,
        },
      },
    );
    const user = response.data.data;

    const userId = user.id;
    const userEmail = user.email;

    const temp = `<div class="card card-primary">
        <div class="card-body">
          <div id=${userId}>
            <img class="rounded-circle" src=${
              user.imgUrl
                ? `https://inflearn-nest-cat.s3.amazonaws.com/${user.imgUrl}`
                : 'assets/img/avatar/avatar-1.png'
            } style="width:50px; margin-right:10px">
            <span>${user.name}(${userEmail})</span>
          </div>
        </div>
      </div>`;
    $(searchedUser).html(temp);

    $('#createBlackList').on('click', async () => {
      const email = $('#searchEmail').val();
      const description = $('#description').val();
      if (!description) {
        alert('사유를 입력해주세요.');
        return;
      }
      const data = { email, description };
      try {
        await axios.post(`http://${adminPort}/blacklist`, data, {
          headers: { Authorization: accessToken },
        });
        alert(
          `${user.name}(${user.email}) 회원을 영구 정지 회원으로 등록했습니다.`,
        );
        window.location.reload();
      } catch (error) {
        alert(error.response.data.message);
      }
    });
  } catch (error) {
    alert(error.response.data.message);
  }
});

$(document).ready(function () {
  recordPage(1, 10);
});

let nowPage = 1;
let totalPages = 0;

// 신고기록 목록 조회 (페이지네이션)
async function recordPage(page, pageSize) {
  await axios
    .get(`http://${adminPort}/report?page=${page}&pageSize=${pageSize}`, {
      headers: {
        Authorization: accessToken,
      },
    })
    .then((response) => {
      const data = response.data.data.pageinatedReports;
      console.log(data);

      const reportTable = document.querySelector('#report-table');
      setReports(data);

      const pagenationTag = $('.pagination');
      const prevButton = `<li id="prev_button" class="page-item">
                            <a class="page-link">이전</a>
                          </li>`;
      const nextButton = `<li id="next_button" class="page-item">
                            <a class="page-link">다음</a>
                          </li>`;

      let pageNumbers = '';
      let pageNumbersHtml = '';

      const totalPages = response.data.data.totalPages;
      console.log(totalPages);

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

      $(pages)
        .find(`#nowPage-${nowPage}`)
        .css('background-color', 'rgb(103,119,239)');
      $(pages).find(`#nowPage-${nowPage}`).css('color', 'white');

      // Previous Button Clicked
      $(prevBtn).click(async () => {
        if (nowPage > 1) {
          reportTable.innerHTML = '';
          try {
            $(pages).find('.page-link').css('background-color', '');
            $(pages).find('.page-link').css('color', '');

            const { data } = await getReports(nowPage - 1, 10);

            setReports(data.pageinatedReports);

            nowPage -= 1;

            $(pages)
              .find(`#nowPage-${nowPage}`)
              .css('background-color', 'rgb(103,119,239)');
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

            setReports(data.pageinatedReports);

            nowPage += 1;

            $(pages)
              .find(`#nowPage-${nowPage}`)
              .css('background-color', 'rgb(103,119,239)');
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
          $(pages).find('.page-link').css('background-color', '');
          $(pages).find('.page-link').css('color', '');

          try {
            const { data } = await getReports(
              parseInt($(page).find(`.page-link`).text()),
              10,
            );

            setReports(data.pageinatedReports);

            $(pages)
              .find(`#nowPage-${nowPage}`)
              .css('background-color', 'rgb(103,119,239)');
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
      `http://${adminPort}/report?page=${page}&pageSize=${pageSize}`,
      {
        headers: {
          Authorization: accessToken,
        },
      },
    );
    return data;
  } catch (error) {
    alert(error.response.data.message);
  }
}

// 신고 목록 세팅함수
async function setReports(data) {
  const reportTable = document.querySelector('#report-table');
  reportTable.innerHTML = `<tr>
          <th>댓글 내용</th>
          <th>신고 내용</th>
          <th>신고일</th>
          <th></th>
        </tr>`;

  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  reportTable.innerHTML += data
    .map((report) => {
      const formattedDate = formatDate(report.report_createdAt);
      return `<tr id="${report.comment_userId}">
            <td>${report.comment_comment}</span></td>
            <td>${report.report_description}</span></td>
            <td>${formattedDate}</td>
            <td><a href="#" id="${report.comment_userId}" class="blacklist-link">
              <button class="btn btn-primary" style="border-radius: 15px;">
                영구 정지 처리
              </button></a>
            </td>
          </tr>`;
    })
    .join('');
}

// 3. 블랙리스트 추가 생성모달
$(document).on('click', '.blacklist-link', function (event) {
  try {
    event.preventDefault();
    const id = $(this).attr('id');
    const userId = id.charAt(id.length - 1);
    $('#addBlackUser').modal('show');

    $('#blackuser')
      .off('click')
      .on('click', function () {
        const description = $('#blackdescription').val();
        const data = { description };

        axios.post(`http://${adminPort}/blacklist/${userId}`, data, {
          headers: { Authorization: accessToken },
        });
        alert(`해당 회원을 영구 정지 회원으로 등록했습니다.`);
        window.location.reload();
      });
  } catch (error) {
    alert(error.response.data.message);
  }

  // 취소 버튼 클릭 시 모달 창 닫기
  $('#canceluser')
    .off('click')
    .on('click', function () {
      $('#addBlackUser').modal('hide');
    });
});

async function checkAdmin() {
  try {
    const { data } = await axios.get(
      `http://${adminPort}/blacklist/permision`,
      {
        headers: {
          Authorization: accessToken,
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
