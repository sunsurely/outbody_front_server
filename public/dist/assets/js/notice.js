$(document).ready(function () {
  initMessagesBox();
  initLogBox();
});

//친구 & 도전  초대 메세지함  , 초대 수락기능 같이 구현
async function initMessagesBox() {
  const messageBox = $('.dropdown-item-unread');
  $(messageBox).html('');
  let followResponse, challengeResponse;
  try {
    followResponse = await axios.get(
      'http://3.39.237.124:3000/follow/request',
      {
        headers: { Authorization: accessToken },
      },
    );
  } catch (error) {
    console.error('Error message:', error.response.data.message);
  }

  try {
    challengeResponse = await axios.get(
      'http://3.39.237.124:3000/challenge/invite/list',
      {
        headers: {
          Authorization: accessToken,
        },
      },
    );
  } catch (error) {
    console.error('Error message:', error.response.data.message);
  }
  let mergedResponse;

  if (challengeResponse && followResponse) {
    mergedResponse = [
      ...followResponse.data.data,
      ...challengeResponse.data.data,
    ];
  } else if (challengeResponse && !followResponse) {
    mergedResponse = [...challengeResponse.data.data];
  } else if (!challengeResponse && followResponse) {
    mergedResponse = [...followResponse.data.data];
  } else {
    mergedResponse = [];
  }

  const sortedResponse = mergedResponse.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  for (const res of sortedResponse) {
    const now = new Date();
    const msgDate = new Date(res.createdAt);
    const nineHoursInMilliseconds = 9 * 60 * 60 * 1000;
    const diffInMilliseconds = now - msgDate - nineHoursInMilliseconds;
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

    let msgTime;

    if (diffInDays >= 1) {
      msgTime = `${diffInDays}일 전`;
    } else if (diffInHours >= 1) {
      msgTime = `${diffInHours}시간 전`;
    } else if (diffInHours < 1) {
      msgTime = `${diffInMinutes}분 전`;
    }

    const id = res.userId;
    const profileImage = res.imgUrl
      ? `https://inflearn-nest-cat.s3.amazonaws.com/${res.imgUrl}`
      : `assets/img/avatar/avatar-1.png`;

    const parts = res.message.split('님이');
    const userInfo = parts[0].trim();
    const message = parts[1].trim();

    const temp = `
          <div class="dropdown-item-avatar">
            <img alt="image" src="${profileImage}" class="rounded-circle" style="width:50px; htight:50px;"/>
          </div>
          <div class="dropdown-item-desc">
            <a href="user-info.html?id=${res.userId}">${userInfo}</a>      
            <p id="inviteUserMessage" style="margin-bottom:0px;">님이 ${message}.</p>
            <span style="font-size:12px; font-weight:bold";>${msgTime}</span>
            <button id="accept${id}"
            class="btn btn-primary btn-sm btn ${
              res.invitedId ? 'accept-challenge' : 'accept-friend'
            }" style="margin-left:200px"
            > 수락 </button>
            <button id="cancel${id}"
              class="btn btn-primary btn-sm btn ${
                res.invitedId ? 'deny-challenge' : 'deny-friend'
              }" style=""
            > 거절 </button>
          </div>
        `;

    $(messageBox).append(temp);
  }

  $('.accept-friend').each(function (idx, acc) {
    $(acc).on('click', async function (e) {
      e.preventDefault();
      const tagId = $(this).attr('id');
      const id = parseInt(tagId.match(/\d+/)[0], 10);
      const data = { response: 'yes' };
      await axios.post(`http://3.39.237.124:3000/follow/${id}/accept`, data, {
        headers: { Authorization: accessToken },
      });

      alert('친구요청을 수락했습니다.');
      window.location.reload();
    });
  });

  $('.deny-friend').each(function (idx, acc) {
    $(acc).on('click', async function (e) {
      e.preventDefault();
      const tagId = $(this).attr('id');
      const id = parseInt(tagId.match(/\d+/)[0], 10);
      const data = { response: 'no' };
      await axios.post(`http://3.39.237.124:3000/follow/${id}/accept`, data, {
        headers: { Authorization: accessToken },
      });

      alert('친구요청을 거절했습니다.');
      window.location.reload();
    });
  });

  $('.accept-challenge').each(function (idx, acc) {
    $(acc).on('click', async function (e) {
      try {
        const tagId = $(this).attr('id');
        const id = tagId.charAt(tagId.length - 1);
        const data = { response: 'yes' };
        e.preventDefault();
        await axios.post(
          `http://3.39.237.124:3000/challenge/${id}/accept`,
          data,
          {
            headers: { Authorization: accessToken },
          },
        );

        alert(`도전방 초대를 수락했습니다.`);
        window.location.reload();
      } catch (error) {
        console.error(error.response.data.message);
      }
    });
  });

  $('.deny-challenge').each(function (idx, acc) {
    $(acc).on('click', async function (e) {
      try {
        const tagId = $(this).attr('id');
        const id = tagId.charAt(tagId.length - 1);
        const data = { response: 'no' };
        await axios.post(
          `http://3.39.237.124:3000/challenge/${id}/accept`,
          data,
          {
            headers: { Authorization: accessToken },
          },
        );

        alert(`도전방 초대를 거절했습니다.`);
        window.location.reload();
      } catch (error) {
        alert(error.response.data.message);
      }
    });
  });
}

//도전 관련 로그 조회
async function initLogBox() {
  const logBox = $('#log-box');
  $(logBox).html('');

  try {
    const { data } = await axios.get(
      'http://3.39.237.124:3000/challenge/message/log',
      {
        headers: { Authorization: accessToken },
      },
    );

    const logMessages = data.data;
    let logTemp = '';
    for (const log of logMessages) {
      const now = new Date();
      const msgDate = new Date(log.createdAt);
      const nineHoursInMilliseconds = 9 * 60 * 60 * 1000;
      const diffInMilliseconds = now - msgDate - nineHoursInMilliseconds;
      const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
      const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

      let msgTime;

      if (diffInDays >= 1) {
        msgTime = `${diffInDays}일 전`;
      } else if (diffInHours >= 1) {
        msgTime = `${diffInHours}시간 전`;
      } else if (diffInHours < 1) {
        msgTime = `${diffInMinutes}분 전`;
      }

      const temp = `
        <a href="#" class="dropdown-item dropdown-item-unread">
          <div class="dropdown-item-desc">${log.message}
            <div class="time text-primary">${msgTime}</div>
          </div>
        </a>`;

      logTemp += temp;
    }
    $(logBox).html(logTemp);
  } catch (error) {
    console.error('Error message:', error.response.data.message);
  }
}
