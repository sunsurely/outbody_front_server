const postParams = new URLSearchParams(window.location.search);
const challengeId = postParams.get('id');
console.log('challengeId', challengeId);

const accessToken = localStorage.getItem('cookie');

let nowPage = 1;
let orderList = 'normal';
let totalPages = 0;

$(document).ready(function () {
  getPosts(1, 10);
});

// 오운완 전체 조회(페이지네이션)
const getPosts = async (page, pageSize) => {
  try {
    const response = await axios.get(
      `http://localhost:3000/challenge/${challengeId}/post/?page=${page}&pageSize=${pageSize}`,
      {
        headers: {
          Authorization: accessToken,
        },
      },
    );
    console.log(response);
    console.log(response.data.data);
    console.log(challengeId);

    let allPosts = '';
    console.log(response.data.data);
    response.data.data.forEach((post) => {
      const profileImage = post.userImageUrl
        ? `https://inflearn-nest-cat.s3.amazonaws.com/${post.userImageUrl}`
        : `assets/img/avatar/avatar-1.png`;

      const createdAt = post.createdAt;
      const date = new Date(createdAt);
      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      const month = months[date.getMonth()];
      const day = date.getDate();

      const ordinalSuffix = getOrdinalSuffix(day);
      const formattedDate = `${month} ${day}${ordinalSuffix}, ${date.getFullYear()}`;

      function getOrdinalSuffix(day) {
        if (day >= 11 && day <= 13) {
          return 'th';
        }
        switch (day % 10) {
          case 1:
            return 'st';
          case 2:
            return 'nd';
          case 3:
            return 'rd';
          default:
            return 'th';
        }
      }

      const userId = post.userId;
      console.log('userId', userId);
      let temphtml = `<div class="col-12 col-md-4 ">
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
                    <p>${formattedDate}</p>
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
    // alert(error.response.data.message);
  }

  const pagenationTag = $('#total-posts');
  const prevButton = `<li id="prev_button" class="page-item"><a class="page-link">◀</a></li>`;
  const nextButton = `<li id="next_button" class="page-item"><a class="page-link">▶</a></li>`;

  let pageNumbers = '';
  let pageNumbersHtml = '';
  let getTotalHtml = '';

  orderList = 'normal';
  const data = await getTotalpost(page, pageSize);
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
          const { data } = await getTotalpost(nowPage - 1, 10);
          const allPost = data.result;
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
          const { data } = await getTotalpost(nowPage + 1, 10);
          const allPost = data.result;
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
          const { data } = await getTotalpost(pageNumber, pageSize);
          const allPost = data.result;
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
  async function getTotalpost(page, pageSize) {
    const data = await axios.get(
      `http://localhost:3000/challenge/${challengeId}/post/?page=${page}&pageSize=${pageSize}`,
      {
        headers: {
          Authorization: ` ${accessToken}`,
        },
      },
    );
    console.log('data', data);
    console.log('challengeId', challengeId);
    orderList = 'normal';
    return data;
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
      .post(`http://localhost:3000/challenge/${challengeId}/post`, formData, {
        headers: {
          Authorization: accessToken,
          'Content-Type': 'multipart/form-data',
        },
      })
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
      `http://localhost:3000/challenge/${challengeId}/post/${postId}/?page=${page}&pageSize=${pageSize}`,
      {
        headers: {
          Authorization: accessToken,
        },
      },
    );

    alert('오운완 삭제가 완료 되었습니다.');
    location.reload();
  } catch (error) {
    console.error('Error message:', error.response.data.message);
    alert(error.response.data.message);
    location.reload();
  }
};
$(document).on('click', '.delPost-btn', function () {
  deletePost($(this).attr('postid'));
});
