const accessToken = localStorage.getItem('cookie');

let nowPage = 1;

$(document).ready(function () {
  getAllPosts(1, 10);
});

// 모든 도전 게시글의 오운완 전부 다 조회 (비공개도전 제외)
const getAllPosts = async (page, pageSize) => {
  try {
    const response = await axios.get(
      `http://3.39.237.124:3000/challenge/publishedpost/allpost/?page=${page}&pageSize=${pageSize}`,
      {
        headers: {
          Authorization: accessToken,
        },
      },
    );
    console.log(response.data.data);

    let allPosts = '';

    response.data.data.pagenatedTotalPosts.forEach((post) => {
      console.log(post);
      const profileImage = post.user.imgUrl
        ? `https://inflearn-nest-cat.s3.amazonaws.com/${post.user.imgUrl}`
        : `assets/img/avatar/avatar-1.png`;

      const userId = post.userId;

      const createdAt = new Date(post.createdAt);

      const year = createdAt.getFullYear();
      const month = (createdAt.getMonth() + 1).toString().padStart(2, '0');
      const day = createdAt.getDate().toString().padStart(2, '0');

      const formattedDate = `${year}년 ${month}월 ${day}일`;

      let temphtml = `<div class="col-12 col-md-4 col-lg-3">
          <article class="article article-style-c">
            <div class="article-header">
              <div class="article-image"
              style="background-image: url(https://inflearn-nest-cat.s3.amazonaws.com/${post.imgUrl});
              background-position: center; background-size: cover;">
              </div>
            </div>
            <div class="article-details">
              <div class="article-title">
                <h2 class="ellipsis">
                  <a href="post-comment.html?cid=${post.challenges.id}&pid=${post.id}">${post.description}</a>
                </h2>
              </div>
              <div class="article-user">
                <img alt="image" src="${profileImage}">
                <div class="article-user-details">
                  <div class="user-detail-name">
                    <a href="user-Info.html?id=${userId}">${post.user.name}</a>
                    <div class="font-1000-bold"><i class="fas fa-circle"></i> ${post.user.point}점</div>
                    <div style="margin-top: 20px">
                      <p style="color: gray;">작성일: ${formattedDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>`;
      allPosts += temphtml;
    });
    $('#postcardList').html(allPosts);
  } catch (error) {
    console.log(error);
  }

  const pagenationTag = $('#total-posts');
  const prevButton = `<li id="prev_button" class="page-item"><a class="page-link">이전</a></li>`;
  const nextButton = `<li id="next_button" class="page-item"><a class="page-link">다음</a></li>`;

  let pageNumbers = '';
  let pageNumbersHtml = '';

  const data = await getTotaldata(page, pageSize);
  totalPages = data.data.data.totalPages;

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers += `<li class="page-item page_number">
                      <a id="nowPage-${i}" class="page-link">${i}</a>
                    </li>`;
  }

  pageNumbersHtml = prevButton + pageNumbers + nextButton;
  pagenationTag.html(
    `<ul class="pagination justify-content-center">${pageNumbersHtml}</ul>`,
  );

  const prevBtn = $('#prev_button');
  const nextBtn = $('#next_button');
  const pages = $('.page_number');

  console.log(nowPage);

  $(pages)
    .find(`#nowPage-${nowPage}`)
    .css('background-color', 'rgb(103,119,239)');
  $(pages).find(`#nowPage-${nowPage}`).css('color', 'white');

  // 이전
  $(prevBtn).click(async () => {
    if (nowPage > 1) {
      $(pages).find('.page-link').css('background-color', '');
      $(pages).find('.page-link').css('color', '');

      try {
        const { data } = await getTotaldata(nowPage - 1, 10);
        const posts = data.data.pagenatedTotalPosts;

        setTotalPost(posts);

        nowPage -= 1;

        $(pages)
          .find(`#nowPage-${nowPage}`)
          .css('background-color', 'rgb(103,119,239)');
        $(pages).find(`#nowPage-${nowPage}`).css('color', 'white');
      } catch (error) {
        console.log('Error Message', error.response.data.message);
      }
    }
  });

  // 다음
  $(nextBtn).click(async () => {
    console.log('next', nowPage);
    if (nowPage > 0 && nowPage < totalPages) {
      $(pages).find('.page-link').css('background-color', '');
      $(pages).find('.page-link').css('color', '');

      try {
        const { data } = await getTotaldata(nowPage + 1, 10);
        const posts = data.data.pagenatedTotalPosts;

        setTotalPost(posts);

        nowPage += 1;

        $(pages)
          .find(`#nowPage-${nowPage}`)
          .css('background-color', 'rgb(103,119,239)');
        $(pages).find(`#nowPage-${nowPage}`).css('color', 'white');
      } catch (error) {
        console.log(error);
      }
    }
  });

  // 숫자
  $(pages).each((index, page) => {
    $(page).click(async () => {
      $(pages).find('.page-link').css('background-color', '');
      $(pages).find('.page-link').css('color', '');

      try {
        const pageNumber = parseInt($(page).find('.page-link').text());

        const { data } = await getTotaldata(pageNumber, pageSize);
        const posts = data.data.pagenatedTotalPosts;

        setTotalPost(posts);

        $(page)
          .find(`#nowPage-${nowPage}`)
          .css('background-color', 'rgb(103,119,239)');
        $(page).find(`#nowPage-${nowPage}`).css('color', 'white');

        nowPage = pageNumber;
      } catch (error) {
        console.error('Error message:', error.response.data.message);
      }
    });
  });

  async function getTotaldata(page, pageSize) {
    const data = await axios.get(
      `http://3.39.237.124:3000/challenge/publishedpost/allpost/?page=${page}&pageSize=${pageSize}`,
      {
        headers: {
          Authorization: ` ${accessToken}`,
        },
      },
    );
    return data;
  }

  async function setTotalPost(posts) {
    let allPosts = '';

    posts.forEach((post) => {
      const profileImage = post.user.imgUrl
        ? `https://inflearn-nest-cat.s3.amazonaws.com/${post.user.imgUrl}`
        : `assets/img/avatar/avatar-1.png`;

      const userId = post.userId;

      const createdAt = new Date(post.createdAt);

      const year = createdAt.getFullYear();
      const month = (createdAt.getMonth() + 1).toString().padStart(2, '0');
      const day = createdAt.getDate().toString().padStart(2, '0');

      const formattedDate = `${year}년 ${month}월 ${day}일`;

      let temphtml = `<div class="col-12 col-md-4 col-lg-2">
          <article class="article article-style-c">
            <div class="article-header">
              <div class="article-image"
              style="background-image: url(https://inflearn-nest-cat.s3.amazonaws.com/${post.imgUrl});
              background-position: center; background-size: cover;">
              </div>
            </div>
            <div class="article-details">
              <div class="article-title">
                <h2 class="ellipsis">
                  <a href="post-comment.html?cid=${post.challenges.id}&pid=${post.id}">${post.description}</a>
                </h2>
              </div>
              <div class="article-user">
                <img alt="image" src="${profileImage}">
                <div class="article-user-details">
                  <div class="user-detail-name">
                    <a href="user-Info.html?id=${userId}">${post.user.name}</a>
                    <div class="font-1000-bold"><i class="fas fa-circle"></i> ${post.user.point}점</div>
                    <div style="margin-top: 20px">
                      <p style="color: gray;">작성일: ${formattedDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>`;
      allPosts += temphtml;
    });
    $('#postcardList').html(allPosts);
  }
};
