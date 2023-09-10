const commentParams = new URLSearchParams(window.location.search);
const challengeIdForComment = commentParams.get('cid');
const postId = commentParams.get('pid');

const accessToken = localStorage.getItem('cookie');

$(document).ready(function () {
  getOnePost();
  getComment();
});

// 오운완 상세 조회
const getOnePost = async () => {
  try {
    const response = await axios.get(
      `http://localhost:3000/challenge/${challengeIdForComment}/post/${postId}/detail`,
      {
        headers: {
          Authorization: accessToken,
        },
      },
    );

    let getPost = '';
    const post = response.data.data;

    const profileImage = post.userImage
      ? `https://inflearn-nest-cat.s3.amazonaws.com/${post.userImage}`
      : `assets/img/avatar/avatar-1.png`;

    let temphtml = `<div class="card-header">
                        <ul class="list-unstyled user-details list-unstyled-border list-unstyled-noborder">
                            <li class="media">
                                <img alt="image" class="mr-3 rounded-circle" width="50"
                                    src="${profileImage}">
                                <div class="media-body">
                                    <div class="media-title">${post.userName}</div>
                                    <div class="font-1000-bold"><i class="fas fa-circle"></i> ${post.userPoint}점</div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="card-body">
                        <div id="carouselExampleIndicators2" class="carousel slide" data-ride="carousel">
                            <div class="carousel-inner">
                                <div class="carousel-item active">
                                    <img class="d-block w-100" src="https://inflearn-nest-cat.s3.amazonaws.com/${post.imgUrl}" style="margin-botton: 20px;">
                                    <h6 style="float: left;">${post.description}</h6>
                                </div>
                            </div>
                        </div>
                    </div>`;
    getPost += temphtml;
    $('#card').html(getPost);
  } catch (error) {
    console.error('Error message:', error.response.data.data.message);
  }
};

// 댓글 조회
const getComment = async () => {
  try {
    const response = await axios.get(
      `http://localhost:3000/challenge/${challengeIdForComment}/post/${postId}/comment`,
      {
        headers: {
          Authorization: accessToken,
        },
      },
    );

    let allComments = '';
    response.data.data.forEach((comment) => {
      const profileImage = comment.userImg
        ? `https://inflearn-nest-cat.s3.amazonaws.com/${comment.userImg}`
        : `assets/img/avatar/avatar-1.png`;

      let temphtml = `<li class="media" id="comment-${comment.commentId}">
                        <img alt="image" class="mr-3 rounded-circle" width="70" src="${profileImage}">
                        <div class="media-body">
                            <div class="media-title mb-1">${comment.username}</div>
                            <div class="media-description text-muted">
                                ${comment.comment}
                            </div>
                            <div class="media-links">
                                <div class="bullet"></div>
                                <a href="#editInput-${comment.commentId}" class="text-primary" data-toggle="collapse">수정</a>
                                <div class="bullet"></div>
                                <a href="#" class='delCmt_btn' commentId="${comment.commentId}">삭제</a>
                                <div class="bullet"></div>
                                <a href="#" class="text-danger" id="report-btn" data-toggle="modal" data-target="#reportModal" commentId="${comment.commentId}">신고</a>
                                <div class="collapse" id="editInput-${comment.commentId}">
                                    <div class="section-title">댓글 수정</div>
                                    <div class="form-group">
                                        <div class="input-group mb-3">
                                            <input type="text" class="form-control" id="updateCmt_input" placeholder="댓글을 입력해주세요" aria-label="">
                                            <div class="input-group-append">
                                                <button class="btn btn-primary" type="button" id="updateCmt_btn" commentId="${comment.commentId}">수정</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>`;
      allComments += temphtml;
    });
    $('#comment-card').html(allComments);
  } catch (error) {
    alert(error.response.data.message);
  }
};

// 댓글 작성
const createComment = async () => {
  try {
    if (!$('#comment_input').val()) {
      alert('댓글을 입력해주세요.');
      return;
    }

    await axios.post(
      `http://localhost:3000/challenge/${challengeIdForComment}/post/${postId}/comment`,
      { comment: $('#comment_input').val() },
      {
        headers: {
          Authorization: accessToken,
        },
      },
    );
    alert('댓글이 작성되었습니다.');
    location.reload();
  } catch (error) {
    alert(error.response.data.message);
    location.reload();
  }
};
// 엔터 키를 눌렀을 때 작성버튼 눌리게
$('#comment_input').keydown((event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    createComment();
  }
});
$('#createCmt_btn').click(createComment);

//댓글 수정
const updateComment = async (commentId) => {
  try {
    if (!$('#updateCmt_input').val()) {
      alert('댓글을 입력해주세요');
      return;
    }

    await axios.patch(
      `http://localhost:3000/challenge/${challengeIdForComment}/post/${postId}/comment/${commentId}`,
      { comment: $('#updateCmt_input').val() },
      {
        headers: {
          Authorization: accessToken,
        },
      },
    );
    alert('댓글이 수정되었습니다.');
    location.reload();
  } catch (error) {
    alert(error.response.data.message);
    location.reload();
  }
};
$(document).on('click', '#updateCmt_btn', function () {
  updateComment($(this).attr('commentid'));
});

// 댓글 삭제
const deleteComment = async (commentId) => {
  try {
    await axios.delete(
      `http://localhost:3000/challenge/${challengeIdForComment}/post/${postId}/comment/${commentId}`,
      {
        headers: {
          Authorization: accessToken,
        },
      },
    );

    alert('댓글이 삭제되었습니다.');
    location.reload();
  } catch (error) {
    console.error('Error message:', error);
  }
};
$(document).on('click', '.delCmt_btn', function () {
  deleteComment($(this).attr('commentid'));
});

// 신고 클릭시 모달
$(document).on('click', '#report-btn', function () {
  const commentId = $(this).attr('commentId');

  $('#reportModal').modal('show');
  $('#reportModal .modal-footer').html(
    `<button type="button" class="btn btn-primary" id="report-button" commentid=${commentId}>신고</button>
    <button type="button" class="btn btn-secondary" data-dismiss="modal">닫기</button>`,
  );
});

// 댓글 신고
const reportComment = async (commentId) => {
  try {
    if (!$('.report_input').val()) {
      alert('신고 사유를 입력해주세요.');
      return;
    }
    if ($('.report_input').val().length < 10) {
      alert('신고 사유를 10자 이상 입력해주세요.');
      return;
    }
    if ($('.report_input').val().length > 100) {
      alert('신고 사유를 100자 이하 입력해주세요.');
      return;
    }

    await axios.post(
      `http://localhost:3000/report/${commentId}`,
      { description: $('.report_input').val() },
      {
        headers: {
          Authorization: accessToken,
        },
      },
    );

    alert('댓글이 신고되었습니다.');
    location.reload();
  } catch (error) {
    console.error('Error message:', error);
  }
};
$(document).on('click', '#report-button', function () {
  reportComment($(this).attr('commentid'));
});
