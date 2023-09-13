const rankPort = 'localhost';
// const rankPort = '3.39.237.124';

const urlParams = new URLSearchParams(window.location.search);
const challengeId = urlParams.get('id');

// 로그인 여부 확인
const rankToken = localStorage.getItem('cookie');

$(document).ready(function () {
  totalrankPage(1, 10);
  friendRankPage(1, 10);
});

// 전체 순위
async function totalrankPage(page, pageSize) {
  let nowPage = 1;

  const totalTable = $('#total-table');
  const totalPagenationTag = $('#total-pagenation');
  const totalPrevButton = `<li id="prev-button" class="page-item"><a class="page-link">이전</a></li>`;
  const totalNextButton = `<li id="next-button" class="page-item"><a class="page-link">다음</a></li>`;

  let pageNumbers = '';
  let pageNumbersHtml = '';

  const data = await getTotaldata(page, pageSize);
  const totalranks = data.data.paginationTotalRanks;

  let num = 1;
  let totalTemp = '';

  for (ranker of totalranks) {
    const level =
      ranker.point >= 10000
        ? 'Gold'
        : ranker.point >= 7500
        ? 'Silver'
        : ranker.point >= 5000
        ? 'Bronze'
        : 'Iron';

    const temp = `<tr>
      <th scope="row">${num}</th>
      <td>${ranker.name}</td>
      <td>${level}</td>
      <td>${ranker.point}</td>
    </tr> `;
    totalTemp += temp;
    num++;
  }
  totalTable.html(totalTemp);

  const totalPages = data.data.totalPages;

  for (let i = 1; i <= data.data.totalPages; i++) {
    pageNumbers += `<li class="page-item page-number-total">
                      <a id="nowPage-${i}-total" class="page-link">${i}</a>
                    </li>`;
  }

  pageNumbersHtml = totalPrevButton + pageNumbers + totalNextButton;
  totalPagenationTag.html(
    `<ul class="pagination justify-content-center">${pageNumbersHtml}</ul>`,
  );

  const prevBtn = $('#prev-button');
  const nextBtn = $('#next-button');
  const pages = $('.page-number-total');

  $(pages)
    .find(`#nowPage-${nowPage}-total`)
    .css('background-color', 'rgb(103,119,239)');
  $(pages).find(`#nowPage-${nowPage}-total`).css('color', 'white');

  // Previous Button Clicked
  $(prevBtn).click(async () => {
    // console.log(nowPage - 1);
    if (nowPage > 1) {
      $(pages).find('.page-link').css('background-color', '');
      $(pages).find('.page-link').css('color', '');

      try {
        const { data } = await getTotaldata(nowPage - 1, 10);
        const ranks = data.paginationTotalRanks;

        let num = (nowPage - 1) * 10 - 9;
        // console.log(num);
        let totalTemp = '';

        for (ranker of ranks) {
          const level =
            ranker.point >= 10000
              ? 'Gold'
              : ranker.point >= 7500
              ? 'Silver'
              : ranker.point >= 5000
              ? 'Bronze'
              : 'Iron';

          const temp = `<tr>
            <th scope="row">${num}</th>
            <td>${ranker.name}</td>
            <td>${level}</td>
            <td>${ranker.point}</td>
          </tr> `;
          totalTemp += temp;
          num++;
        }
        totalTable.html(totalTemp);

        nowPage -= 1;

        $(pages)
          .find(`#nowPage-${nowPage}-total`)
          .css('background-color', 'rgb(103,119,239)');
        $(pages).find(`#nowPage-${nowPage}-total`).css('color', 'white');
      } catch (error) {
        console.log('Error Message', error.response.data.message);
      }
    }
  });

  // Next Button Clicked
  $(nextBtn).click(async () => {
    // console.log(nowPage);
    if (nowPage > 0 && nowPage < totalPages) {
      $(pages).find('.page-link').css('background-color', '');
      $(pages).find('.page-link').css('color', '');

      try {
        const { data } = await getTotaldata(nowPage + 1, 10);
        const ranks = data.paginationTotalRanks;

        let num = (nowPage + 1) * 10 - 9;
        // console.log(num);
        let totalTemp = '';

        for (ranker of ranks) {
          const level =
            ranker.point >= 10000
              ? 'Gold'
              : ranker.point >= 7500
              ? 'Silver'
              : ranker.point >= 5000
              ? 'Bronze'
              : 'Iron';

          const temp = `<tr>
            <th scope="row">${num}</th>
            <td>${ranker.name}</td>
            <td>${level}</td>
            <td>${ranker.point}</td>
          </tr> `;
          totalTemp += temp;
          num++;
        }
        totalTable.html(totalTemp);

        nowPage += 1;

        $(pages)
          .find(`#nowPage-${nowPage}-total`)
          .css('background-color', 'rgb(103,119,239)');
        $(pages).find(`#nowPage-${nowPage}-total`).css('color', 'white');
      } catch (error) {
        console.log('Error Message', error.response.data.message);
      }
    }
  });

  // Each Page Clicked
  $(pages).each((index, page) => {
    $(page).click(async () => {
      $(pages).find('.page-link').css('background-color', '');
      $(pages).find('.page-link').css('color', '');

      try {
        const pageNumber = parseInt($(page).find('.page-link').text());

        const { data } = await getTotaldata(pageNumber, pageSize);
        const ranks = data.paginationTotalRanks;

        let num = pageNumber * 10 - 9;
        let totalTemp = '';

        for (ranker of ranks) {
          const level =
            ranker.point >= 10000
              ? 'Gold'
              : ranker.point >= 7500
              ? 'Silver'
              : ranker.point >= 5000
              ? 'Bronze'
              : 'Iron';

          const temp = `<tr>
            <th scope="row">${num}</th>
            <td>${ranker.name}</td>
            <td>${level}</td>
            <td>${ranker.point}</td>
          </tr> `;
          totalTemp += temp;
          num++;
        }
        totalTable.html(totalTemp);

        nowPage = pageNumber;
        // console.log(nowPage);

        $(pages)
          .find(`#nowPage-${nowPage}-total`)
          .css('background-color', 'rgb(103,119,239)');
        $(pages).find(`#nowPage-${nowPage}-total`).css('color', 'white');
      } catch (error) {
        console.error('Error message:', error.response.data.message);
      }
    });
  });
}

async function getTotaldata(page, pageSize) {
  const data = await axios.get(
    `http://${rankPort}:3000/rank/total/page/?page=${page}&pageSize=${pageSize}`,
    {
      headers: {
        Authorization: ` ${rankToken}`,
      },
    },
  );
  return data.data;
}

// 친구 순위
async function friendRankPage(page, pageSize) {
  let nowPage = 1;

  const friendTable = $('#friend-table');
  const friendPagenationTag = $('#friend-pagenation');
  const friendPrevButton = `<li id="prev_button" class="page-item"><a class="page-link">이전</a></li>`;
  const friendNextButton = `<li id="next_button" class="page-item"><a class="page-link">다음</a></li>`;

  let pageNumbers = '';
  let pageNumbersHtml = '';

  const data = await getFriendData(page, pageSize);
  const friendRanks = data.data.paginationFollowerRanks;

  let num = 1;
  let totalTemp = '';

  for (ranker of friendRanks) {
    const level =
      ranker.point >= 10000
        ? 'Gold'
        : ranker.point >= 7500
        ? 'Silver'
        : ranker.point >= 5000
        ? 'Bronze'
        : 'Iron';

    const temp = `<tr>
      <th scope="row">${num}</th>
      <td>${ranker.name}</td>
      <td>${level}</td>
      <td>${ranker.point}</td>
    </tr> `;
    totalTemp += temp;
    num++;
  }
  friendTable.html(totalTemp);

  const totalPages = data.data.totalPages;

  for (let i = 1; i <= data.data.totalPages; i++) {
    pageNumbers += `<li class="page-item page-number-friend">
                      <a id="nowPage-${i}-friend" class="page-link">${i}</a>
                    </li>`;
  }

  pageNumbersHtml = friendPrevButton + pageNumbers + friendNextButton;
  friendPagenationTag.html(
    `<ul class="pagination justify-content-center">${pageNumbersHtml}</ul>`,
  );

  const prevBtn = $('#prev_button');
  const nextBtn = $('#next_button');
  const pages = $('.page-number-friend');

  $(pages)
    .find(`#nowPage-${nowPage}-friend`)
    .css('background-color', 'rgb(103,119,239)');
  $(pages).find(`#nowPage-${nowPage}-friend`).css('color', 'white');

  // Previous Button Clicked
  $(prevBtn).click(async () => {
    if (nowPage > 1) {
      $(pages).find('.page-link').css('background-color', '');
      $(pages).find('.page-link').css('color', '');

      try {
        const { data } = await getFriendData(nowPage - 1, 10);
        const ranks = data.paginationFollowerRanks;

        let num = 1;
        let totalTemp = '';

        for (ranker of ranks) {
          const level =
            ranker.point >= 10000
              ? 'Gold'
              : ranker.point >= 7500
              ? 'Silver'
              : ranker.point >= 5000
              ? 'Bronze'
              : 'Iron';

          const temp = `<tr>
            <th scope="row">${num}</th>
            <td>${ranker.name}</td>
            <td>${level}</td>
            <td>${ranker.point}</td>
          </tr> `;
          totalTemp += temp;
          num++;
        }
        friendTable.html(totalTemp);

        nowPage -= 1;

        $(pages)
          .find(`#nowPage-${nowPage}-friend`)
          .css('background-color', 'rgb(103,119,239)');
        $(pages).find(`#nowPage-${nowPage}-friend`).css('color', 'white');
      } catch (error) {
        console.log('Error Message', error.response.data.message);
      }
    }
  });

  // Next Button Clicked
  $(nextBtn).click(async () => {
    if (nowPage > 0 && nowPage < totalPages) {
      $(pages).find('.page-link').css('background-color', '');
      $(pages).find('.page-link').css('color', '');

      try {
        const { data } = await getFriendData(nowPage + 1, 10);
        const ranks = data.paginationFollowerRanks;

        let num = (nowPage + 1) * 10 - 9;
        let totalTemp = '';

        for (ranker of ranks) {
          const level =
            ranker.point >= 10000
              ? 'Gold'
              : ranker.point >= 7500
              ? 'Silver'
              : ranker.point >= 5000
              ? 'Bronze'
              : 'Iron';

          const temp = `<tr>
            <th scope="row">${num}</th>
            <td>${ranker.name}</td>
            <td>${level}</td>
            <td>${ranker.point}</td>
          </tr> `;
          totalTemp += temp;
          num++;
        }
        friendTable.html(totalTemp);

        nowPage += 1;

        $(pages)
          .find(`#nowPage-${nowPage}-friend`)
          .css('background-color', 'rgb(103,119,239)');
        $(pages).find(`#nowPage-${nowPage}-friend`).css('color', 'white');
      } catch (error) {
        console.log('Error Message', error.response.data.message);
      }
    }
  });

  // Each Page Clicked
  $(pages).each((index, page) => {
    $(page).click(async () => {
      $(pages).find('.page-link').css('background-color', '');
      $(pages).find('.page-link').css('color', '');

      try {
        const pageNumber = parseInt($(page).find('.page-link').text());

        const { data } = await getFriendData(pageNumber, pageSize);
        const ranks = data.paginationFollowerRanks;

        let num = pageNumber * 10 - 9;
        let totalTemp = '';

        for (ranker of ranks) {
          const level =
            ranker.point >= 10000
              ? 'Gold'
              : ranker.point >= 7500
              ? 'Silver'
              : ranker.point >= 5000
              ? 'Bronze'
              : 'Iron';

          const temp = `<tr>
            <th scope="row">${num}</th>
            <td>${ranker.name}</td>
            <td>${level}</td>
            <td>${ranker.point}</td>
          </tr> `;
          totalTemp += temp;
          num++;
        }
        friendTable.html(totalTemp);

        nowPage = pageNumber;

        $(pages)
          .find(`#nowPage-${nowPage}-friend`)
          .css('background-color', 'rgb(103,119,239)');
        $(pages).find(`#nowPage-${nowPage}-friend`).css('color', 'white');
      } catch (error) {
        console.error('Error message:', error.response.data.message);
      }
    });
  });
}

async function getFriendData(page, pageSize) {
  const data = await axios.get(
    `http://${rankPort}:3000/rank/followings/page/?page=${page}&pageSize=${pageSize}`,
    {
      headers: {
        Authorization: ` ${rankToken}`,
      },
    },
  );
  return data.data;
}
