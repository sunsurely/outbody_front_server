const accessToken = localStorage.getItem('cookie');

let nowPage = 1;
let orderList = 'normal';
let totalPages = 0;

$(document).ready(function () {
  getAllPosts(1, 10);
});

// 모든 도전 게시글의 오운완 전부 다 조회 (비공개도전 제외)
const getAllPosts = async (page, pageSize) => {
  try {
    const response = await axios.get(
      `http://localhost:3000/challenge/publishedpost/allpost/?page=${page}&pageSize=${pageSize}`,
      {
        headers: {
          Authorization: accessToken,
        },
      },
    );
    console.log(response.data.data);

    let allPosts = '';
    response.data.data.pageinatedTotalPosts.forEach((post) => {
      const profileImage = post.imgUrl
        ? `https://inflearn-nest-cat.s3.amazonaws.com/${post.imgUrl}`
        : `assets/img/avatar/avatar-1.png`;

      const userId = post.userId;
      console.log('userId', userId);
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
              <div class="user-detail-remove">
                <a href="#" class="btn btn-icon btn-primary"><i class="fas fa-times delPost-btn" postId=${post.id}></i></a>
              </div>
              <div class="user-detail-name">
                <a href="http://localhost:3000/user/${userId}">${post.user.name}</a>
                <div class="font-1000-bold"><i class="fas fa-circle"></i> ${post.user.point}점</div>
                </div>
            </div>
          </div>
        </div>
      </article>
    </div>`;
      allPosts += temphtml;

      $('.btn btn-primary').on('click', function (event) {
        event.preventDefault();
        window.location.href = `user-info.html?id=${userId}`;
      });
    });

    $('#postcardList').html(allPosts);
  } catch (error) {
    console.log(error);
  }

  const pagenationTag = $('#total-posts');
  const prevButton = `<li id="prev_button" class="page-item"><a class="page-link">◀</a></li>`;
  const nextButton = `<li id="next_button" class="page-item"><a class="page-link">▶</a></li>`;

  let pageNumbers = '';
  let pageNumbersHtml = '';
  let getTotalHtml = '';

  orderList = 'normal';
  const data = await getTotaldata(page, pageSize);
  totalPages = data.data.totalPages;

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers += `<li class="page-item page_number">
        <a class="page-link">${i}</a>
      </li>`;
  }
  pageNumbersHtml = prevButton + pageNumbers + nextButton;
  pagenationTag.html(
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
          const { data } = await getTotaldata(nowPage - 1, 10); //
          const allPost = data.pageinatedTotalPosts;
          setTotalPost(allPost);
          nowPage -= 1;
          getTotalHtml = '';

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
          const allPost = data.pageinatedTotalPosts;
          setTotalPost(allPost);
          nowPage += 1;
          getTotalHtml = '';

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
          const allPost = data.pageinatedTotalPosts;
          setTotalPost(allPost);

          $(page).find('.page-link').css('background-color', 'blue');
          $(page).find('.page-link').css('color', 'white');
          nowPage = pageNumber;

          getTotalHtml = '';
        } catch (error) {
          console.error('Error message:', error.response.data.message);
        }
      }
    });
  });

  async function getTotaldata(page, pageSize) {
    const data = await axios.get(
      `http://localhost:3000/challenge/publishedpost/allpost/?page=${page}&pageSize=${pageSize}`,
      {
        headers: {
          Authorization: ` ${accessToken}`,
        },
      },
    );
    orderList = 'normal';
    return data;
  }
};
