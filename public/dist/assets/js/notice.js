$(document).ready(function () {
  initMessagesBox();
  initLogBox();
});

//친구 & 도전  초대 메세지함  , 초대 수락기능 같이 구현
async function initMessagesBox() {
  const messageBox = $('.dropdown-list-message');
  $(messageBox).html('');
  let followResponse, challengeResponse;
  try {
    followResponse = await axios.get('http://localhost:3000/follow/request', {
      headers: { Authorization: accessToken },
    });
  } catch (error) {
    console.error('Error message:', error.response.data.message);
  }

  try {
    challengeResponse = await axios.get(
      'http://localhost:3000/challenge/invite/list',
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
    const diffInMilliseconds = now - msgDate;
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

    let msgTime;

    if (diffInDays >= 1) {
      msgTime = `${diffInDays}일전`;
    } else {
      msgTime = `${diffInHours}시간전`;
    }

    const id = res.userId;

    const temp = `
     
       <a href="user-info.html?userId=${res.userId}">
          <img
            alt="image"
            src="${res.imgUrl ? res.imgUrl : 'assets/img/avatar/avatar-1.png'}"
            class="rounded-circle"
            style="width:50px; htight:50px;"
          />
       </a>
        <div class="is-online"></div>
    
      <div class="dropdown-item-desc">      
        <p id="inviteUserMessage" style="margin-bottom:0px;">${res.message}</p>
   
        <button id="accept${id}"
          class="btn btn-sm btn ${
            res.invitedId ? 'accept-challenge' : 'accept-friend'
          }"
          style="margin-bottom:20px; margin-left:250px"
        >
          수락
        </button>
        <button
        id="cancel${id}"
          class="btn btn-sm btn ${
            res.invitedId ? 'deny-challenge' : 'deny-friend'
          }" 
          style="margin-bottom:20px;"
        >
          거절
        </button>
        <span style="font-size:12px; margin-top:0px; margin-left:10px; font-weight:bold"; >${msgTime}</span>
      </div>
    `;

    $(messageBox).append(temp);
  }

  $('.accept-friend').each(function (idx, acc) {
    $(acc).on('click', async function (e) {
      e.preventDefault();
      const tagId = $(this).attr('id');
      const id = tagId.charAt(tagId.length - 1);
      const data = { response: 'yes' };
      await axios.post(`http://localhost:3000/follow/${id}/accept`, data, {
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
      const id = tagId.charAt(tagId.length - 1);
      const data = { response: 'no' };
      await axios.post(`http://localhost:3000/follow/${id}/accept`, data, {
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
        await axios.post(`http://localhost:3000/challenge/${id}/accept`, data, {
          headers: { Authorization: accessToken },
        });

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
        await axios.post(`http://localhost:3000/challenge/${id}/accept`, data, {
          headers: { Authorization: accessToken },
        });

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
      'http://localhost:3000/challenge/message/log',
      {
        headers: { Authorization: accessToken },
      },
    );

    const logMessages = data.data;
    let logTemp = '';
    for (const log of logMessages) {
      const now = new Date();
      const msgDate = new Date(log.createdAt);
      const diffInMilliseconds = now - msgDate;
      const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

      let msgTime;

      if (diffInDays >= 1) {
        msgTime = `${diffInDays}일전`;
      } else {
        msgTime = `${diffInHours}시간전`;
      }

      const temp = ` <a href="#" class="dropdown-item dropdown-item-unread">
      <div class="dropdown-item-desc">
       ${log.message}
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
