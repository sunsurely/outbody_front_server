const urlParams = new URLSearchParams(window.location.search);
const challengeId = urlParams.get('id');

const accessToken = localStorage.getItem('cookie');
('use strict');
let nowPage = 1;
let orderList = 'normal';
let totalPages = 0;

$(document).ready(function () {
  totalrankPage(1, 10);
  friendRankPage(1, 10);
});

//전체랭킹
async function totalrankPage(page, pageSize) {
  const totalTable = $('#total-table');
  const totalPagenationTag = $('#total-pagenation');
  const totalPrevButton = `<li id="prev_button" class="page-item"><a class="page-link">◀</a></li>`;
  const totalNextButton = `<li id="next_button" class="page-item"><a class="page-link">▶</a></li>`;
  let pageNumbers = '';
  let pageNumbersHtml = '';
  let totalRankHtml = '';

  orderList = 'normal';
  const data = await getTotaldata(page, pageSize);
  const totalranks = data.data.paginationTotalRanks;
  totalPages = data.data.totalPages;

  for (let i = 1; i <= data.data.totalPages; i++) {
    pageNumbers += `<li class="page-item page_number">
    <a class="page-link">${i}</a>
  </li>`;
  }

  let num = 1;
  let totalTemp = '';

  for (ranker of totalranks) {
    const level =
      ranker.point >= 15000
        ? 'Gold'
        : ranker.point >= 12000
        ? 'Silver'
        : ranker.point >= 9000
        ? 'Bronze'
        : 'Iron';

    const temp = `<tr>
 <th scope="row">${num}</th>
 <td>${ranker.name}</td>
 <td>${ranker.createdAt}</td>
 <td>${level}</td>
 <td>${ranker.point}</td>
</tr> `;
    totalTemp += temp;
    num++;
  }

  pageNumbersHtml = totalPrevButton + pageNumbers + totalNextButton;
  totalTable.html(totalTemp);
  totalPagenationTag.html(
    `<ul class="pagination justify-content-center">${pageNumbersHtml}</ul>`,
  );
  const prevBtn = $('#prev_button');
  const nextBtn = $('#next_button');
  const pages = $('.page_number');

  $(prevBtn).click(async () => {
    if (orderList === 'normal') {
      if (nowPage > 1) {
        $(pages).find('.page-link').css('background-color', '');
        $(pages).find('.page-link').css('color', '');

        try {
          const { data } = await getTotaldata(nowPage - 1, 10);
          const ranks = data.paginationTotalRanks;
          setTotalRankList(ranks);
          nowPage -= 1;
          totalRankHtml = '';

          $(pages)
            .eq(nowPage - 1)
            .find('.page-link')
            .css('background-color', 'blue');
          $(pages)
            .eq(nowPage - 1)
            .find('.page-link')
            .css('color', 'white');
        } catch (error) {
          console.log('Error Message', error.response.data.message);
        }
      }
    }
  });

  $(nextBtn).click(async () => {
    if (orderList === 'normal') {
      if (nowPage > 0 && nowPage < totalPages) {
        $(pages).find('.page-link').css('background-color', '');
        $(pages).find('.page-link').css('color', '');

        try {
          const { data } = await getTotaldata(nowPage + 1, 10);
          const ranks = data.paginationTotalRanks;
          setTotalRankList(ranks);
          nowPage += 1;
          totalRankHtml = '';

          $(pages)
            .eq(nowPage - 1)
            .find('.page-link')
            .css('background-color', 'blue');
          $(pages)
            .eq(nowPage - 1)
            .find('.page-link')
            .css('color', 'white');
        } catch (error) {
          console.log('Error Message', error.response.data.message);
        }
      }
    }
  });

  $(pages).each((idx, page) => {
    $(page).click(async () => {
      if (orderList === 'normal') {
        $(pages).find('.page-link').css('background-color', '');
        $(pages).find('.page-link').css('color', '');

        try {
          const pageNumber = parseInt($(page).find('.page-link').text());
          const { data } = await getTotaldata(pageNumber, pageSize);
          const ranks = data.paginationTotalRanks;
          setTotalRankList(ranks);

          $(page).find('.page-link').css('background-color', 'blue');
          $(page).find('.page-link').css('color', 'white');
          nowPage = pageNumber;

          totalRankHtml = '';
        } catch (error) {
          console.error('Error message:', error.response.data.message);
        }
      }
    });
  });
}

async function getTotaldata(page, pageSize) {
  const data = await axios.get(
    `http://localhost:3000/rank/total/page/?page=${page}&pageSize=${pageSize}`,
    {
      headers: {
        Authorization: ` ${accessToken}`,
      },
    },
  );
  orderList = 'normal';
  return data.data;
}

// 친구랭킹
async function friendRankPage(page, pageSize) {
  const friendTable = $('#friend-table');
  const friendPagenationTag = $('#friend-pagenation');
  const friendPrevButton = `<li id="prev_button" class="page-item"><a class="page-link">◀</a></li>`;
  const friendNextButton = `<li id="next_button" class="page-item"><a class="page-link">▶</a></li>`;
  let pageNumbers = '';
  let pageNumbersHtml = '';
  let friendRankHtml = '';

  orderList = 'normal';
  const data = await getFriendData(page, pageSize);
  const friendRanks = data.data.paginationFollowerRanks;
  totalPages = data.data.totalPages;

  for (let i = 1; i <= data.data.totalPages; i++) {
    pageNumbers += `<li class="page-item page_number">
    <a class="page-link">${i}</a>
  </li>`;
  }

  let num = 1;
  let totalTemp = '';

  for (ranker of friendRanks) {
    const level =
      ranker.point >= 15000
        ? 'Gold'
        : ranker.point >= 12000
        ? 'Silver'
        : ranker.point >= 9000
        ? 'Bronze'
        : 'Iron';

    const temp = `<tr>
 <th scope="row">${num}</th>
 <td>${ranker.name}</td>
 <td>${ranker.createdAt}</td>
 <td>${level}</td>
 <td>${ranker.point}</td>
</tr> `;
    totalTemp += temp;
    num++;
  }

  pageNumbersHtml = friendPrevButton + pageNumbers + friendNextButton;
  friendTable.html(totalTemp);
  friendPagenationTag.html(
    `<ul class="pagination justify-content-center">${pageNumbersHtml}</ul>`,
  );
  const prevBtn = $('#prev_button');
  const nextBtn = $('#next_button');
  const pages = $('.page_number');

  $(prevBtn).click(async () => {
    if (orderList === 'normal') {
      if (nowPage > 1) {
        $(pages).find('.page-link').css('background-color', '');
        $(pages).find('.page-link').css('color', '');

        try {
          const { data } = await getFriendData(nowPage - 1, 10);
          const ranks = data.paginationFollowerRanks;
          setFriendRankList(ranks);
          nowPage -= 1;
          friendRankHtml = '';

          $(pages)
            .eq(nowPage - 1)
            .find('.page-link')
            .css('background-color', 'blue');
          $(pages)
            .eq(nowPage - 1)
            .find('.page-link')
            .css('color', 'white');
        } catch (error) {
          console.log('Error Message', error.response.data.message);
        }
      }
    }
  });

  $(nextBtn).click(async () => {
    if (orderList === 'normal') {
      if (nowPage > 0 && nowPage < totalPages) {
        $(pages).find('.page-link').css('background-color', '');
        $(pages).find('.page-link').css('color', '');

        try {
          const { data } = await getFriendData(nowPage + 1, 10);
          const ranks = data.paginationFollowerRanks;
          setFriendRankList(ranks);
          nowPage += 1;
          friendRankHtml = '';

          $(pages)
            .eq(nowPage - 1)
            .find('.page-link')
            .css('background-color', 'blue');
          $(pages)
            .eq(nowPage - 1)
            .find('.page-link')
            .css('color', 'white');
        } catch (error) {
          console.log('Error Message', error.response.data.message);
        }
      }
    }
  });

  $(pages).each((idx, page) => {
    $(page).click(async () => {
      if (orderList === 'normal') {
        $(pages).find('.page-link').css('background-color', '');
        $(pages).find('.page-link').css('color', '');

        try {
          const { data } = await getFriendData(
            parseInt($(page).find('.page-link').text()),
            10,
          );
          const ranks = data.paginationFollowerRanks;
          setFriendRankList(ranks);

          $(page).find('.page-link').css('background-color', 'blue');
          $(page).find('.page-link').css('color', 'white');
          nowPage = parseInt($(page).find('.page-link').text());

          friendRankHtml = '';
        } catch (error) {
          console.error('Error message:', error.response.data.message);
        }
      }
    });
  });
}

async function getFriendData(page, pageSize) {
  const data = await axios.get(
    `http://localhost:3000/rank/followings/page/?page=${page}&pageSize=${pageSize}`,
    {
      headers: {
        Authorization: ` ${accessToken}`,
      },
    },
  );
  orderList = 'normal';
  return data.data;
}
