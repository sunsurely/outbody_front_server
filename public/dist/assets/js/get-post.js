const postParams = new URLSearchParams(window.location.search);
const challengeId = postParams.get('id');

// 로그인 여부 확인
const accessToken = localStorage.getItem('cookie');

let nowPage = 1;
let totalPages = 0;

$(document).ready(function () {
  getPosts(1, 1);
});

// 오운완 전체 조회
const getPosts = async (page, pageSize) => {
  try {
    const response = await axios.get(
      `http://3.39.237.124:3000/challenge/${challengeId}/post/?page=${page}&pageSize=${pageSize}`,
      {
        headers: {
          Authorization: accessToken,
        },
      },
    );
    console.log(response.data.data.result);
    const posts = response.data.data.result;

    let allPosts = '';

    posts.forEach((post) => {
      console.log(post);
      const profileImage = post.userImageUrl
        ? `https://inflearn-nest-cat.s3.amazonaws.com/${post.userImageUrl}`
        : `assets/img/avatar/avatar-1.png`;

      const userId = post.userId;

      const createdAt = new Date(post.createdAt);

      const year = createdAt.getFullYear();
      const month = (createdAt.getMonth() + 1).toString().padStart(2, '0');
      const day = createdAt.getDate().toString().padStart(2, '0');

      const formattedDate = `${year}년 ${month}월 ${day}일`;

      let temphtml = `<div class="col-12 col-md-2">
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
                  <a href="post-comment.html?cid=${challengeId}&pid=${post.id}">${post.description}</a>
                </h2>
              </div>
              <div class="article-user">
                <img alt="image" src="${profileImage}">
                <div class="article-user-details">
                  <div class="user-detail-remove">
                    <a href="#" class="btn btn-icon btn-primary"><i class="fas fa-times delPost-btn" postId=${post.id}></i></a>
                  </div>
                  <div class="user-detail-name">
                    <a href="user-info.html?id=${userId}">${post.userName}</a>
                    <div class="font-1000-bold"><i class="fas fa-circle"></i> ${post.userPoint}점</div>
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
    $('.row').html(allPosts);
  } catch (error) {
    console.log(error.response.data.message);
  }

  const pagenationTag = $('#total-posts');
  const prevButton = `<li id="prev_button" class="page-item"><a class="page-link">이전</a></li>`;
  const nextButton = `<li id="next_button" class="page-item"><a class="page-link">다음</a></li>`;

  let pageNumbers = '';
  let pageNumbersHtml = '';

  const response = await getTotalpost(page, pageSize);
  totalPages = response.data.data.totalPages;

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
        const { data } = await getTotalpost(nowPage - 1, 1);
        const posts = data.data.result;
        console.log(posts);

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
    if (nowPage > 0 && nowPage < totalPages) {
      $(pages).find('.page-link').css('background-color', '');
      $(pages).find('.page-link').css('color', '');

      try {
        const { data } = await getTotalpost(nowPage + 1, 1);
        const posts = data.data.result;
        console.log(posts);

        setTotalPost(posts);

        nowPage += 1;

        $(pages)
          .find(`#nowPage-${nowPage}`)
          .css('background-color', 'rgb(103,119,239)');
        $(pages).find(`#nowPage-${nowPage}`).css('color', 'white');
      } catch (error) {
        console.log('Error Message', error.response.data.message);
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

        const { data } = await getTotalpost(pageNumber, pageSize);
        const posts = data.data.result;

        setTotalPost(posts);

        $(page).find('.page-link').css('background-color', 'rgb(103,119,239)');
        $(page).find('.page-link').css('color', 'white');

        nowPage = pageNumber;

        getTotalHtml = '';
      } catch (error) {
        console.error('Error message:', error.response.data.message);
      }
    });
  });

  async function getTotalpost(page, pageSize) {
    const data = await axios.get(
      `http://3.39.237.124:3000/challenge/${challengeId}/post/?page=${page}&pageSize=${pageSize}`,
      {
        headers: {
          Authorization: ` ${accessToken}`,
        },
      },
    );
    orderList = 'normal';
    return data;
  }

  async function setTotalPost(posts) {
    let allPosts = '';

    posts.forEach((post) => {
      const profileImage = post.userImageUrl
        ? `https://inflearn-nest-cat.s3.amazonaws.com/${post.userImageUrl}`
        : `assets/img/avatar/avatar-1.png`;

      const userId = post.userId;

      const createdAt = new Date(post.createdAt);

      const year = createdAt.getFullYear();
      const month = (createdAt.getMonth() + 1).toString().padStart(2, '0');
      const day = createdAt.getDate().toString().padStart(2, '0');

      const formattedDate = `${year}년 ${month}월 ${day}일`;

      let temphtml = `<div class="col-12 col-md-2">
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
                  <a href="post-comment.html?cid=${challengeId}&pid=${post.id}">${post.description}</a>
                </h2>
              </div>
              <div class="article-user">
                <img alt="image" src="${profileImage}">
                <div class="article-user-details">
                  <div class="user-detail-remove">
                    <a href="#" class="btn btn-icon btn-primary"><i class="fas fa-times delPost-btn" postId=${post.id}></i></a>
                  </div>
                  <div class="user-detail-name">
                    <a href="user-info.html?id=${userId}">${post.userName}</a>
                    <div class="font-1000-bold"><i class="fas fa-circle"></i> ${post.userPoint}점</div>
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
    $('.row').html(allPosts);
  }
};

// 오운완 생성 (재용 수정)
const createPost = async () => {
  try {
    const description = $('.desc_input').val();
    if (!description) {
      alert('내용을 입력해주세요');
      return;
    }

    const postImage = $('#post-image-upload')[0].files[0];
    if (!postImage) {
      alert('사진을 선택해주세요');
      return;
    }

    const formData = new FormData();
    formData.append('image', postImage);
    formData.append('description', description);

    await axios
      .post(
        `http://3.39.237.124:3000/challenge/${challengeId}/post`,
        formData,
        {
          headers: {
            Authorization: accessToken,
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      .then((response) => {
        alert('오운완 생성이 완료되었습니다.');
        location.reload();
      })
      .catch((error) => {
        alert(error.response.data.message);
      });
  } catch (error) {
    alert(error.response.data.message);
  }
};
$('#create-button').click(createPost);

// 올린 사진 미리보기
const image = document.querySelector('#post-image-upload');
image.addEventListener('change', (event) => {
  const reader = new FileReader();
  reader.readAsDataURL(event.target.files[0]);

  reader.onload = function (event) {
    const profileImage = document.createElement('img');
    profileImage.setAttribute('src', event.target.result);
    profileImage.style.maxWidth = '50%';
    profileImage.style.display = 'block';
    profileImage.style.margin = '0 auto';
    document.querySelector('#image-container').appendChild(profileImage);
  };
});

// 오운완 삭제
const deletePost = async (postId) => {
  try {
    await axios.delete(
      `http://3.39.237.124:3000/challenge/${challengeId}/post/${postId}`,
      {
        headers: {
          Authorization: accessToken,
        },
      },
    );

    alert('오운완 삭제가 완료 되었습니다.');
    location.reload();
  } catch (error) {
    alert(error.response.data.message);
  }
};
$(document).on('click', '.delPost-btn', function () {
  deletePost($(this).attr('postId'));
});
