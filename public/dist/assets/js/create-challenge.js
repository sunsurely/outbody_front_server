// 로그인 여부 확인
const accessToken = localStorage.getItem('cookie');

// 도전 세부 설정
let startDate = null;
let endDate = null;

$('.daterange-cus').daterangepicker({
  locale: { format: 'YYYY-MM-DD' },
  drops: 'down',
  opens: 'right',
  singleDatePicker: true,
});

$('#apply-button').click(function () {
  const startDateString = $('.daterange-cus').val();
  startDate = moment(startDateString);

  if (startDate) {
    const today = moment();

    if (startDate.isSameOrBefore(today, 'day')) {
      alert('도전 시작일은 오늘 이후여야 합니다.');
      return;
    }

    $('.daterange-btn span').html(startDate.format('YYYY-MM-DD'));
    $('.daterange-cus').data('daterangepicker').setStartDate(startDate);
  }

  alert('도전 시작일이 적용되었습니다.');
});

$('.week-selector').on('change', function () {
  const selectedWeeks = parseInt($(this).val());
  endDate = startDate.clone().add(selectedWeeks, 'weeks');

  $('.daterange-cus').data('daterangepicker').setStartDate(startDate);
  $('.daterange-cus').data('daterangepicker').setEndDate(endDate);

  $('.daterange-cus').val(
    startDate.format('YYYY-MM-DD') + ' - ' + endDate.format('YYYY-MM-DD'),
  );
});

$('.daterange-cus').prop('readonly', true);

// 도전 생성
const createButton = document.querySelector('#create-challenge-button');
createButton.addEventListener('click', createChallenge);

async function createChallenge() {
  const title = $('#challenge-title').val();
  const description = $('#challenge-description').val();
  if (title === '' || description === '') {
    alert('도전 제목과 도전 내용을 입력해주세요.');
    return;
  }

  if (startDate === null || endDate === null) {
    alert('도전 시작일과 도전 기간을 설정해주세요.');
    return;
  }

  startDate.add(1, 'day');
  endDate.add(1, 'day');

  let publicView = $('#challenge-publicView').val();
  if (publicView === '전체 공개') {
    publicView = true;
  } else if (publicView === '비공개') {
    publicView = false;
  }
  let weight = $('#challenge-weight').val();
  if (weight === '적용 안함') {
    weight = 0;
  } else {
    weight = parseInt(weight);
  }
  let muscle = $('#challenge-muscle').val();
  if (muscle === '적용 안함') {
    muscle = 0;
  } else {
    muscle = parseInt(muscle);
  }
  let fat = $('#challenge-fat').val();
  if (fat === '적용 안함') {
    fat = 0;
  } else {
    fat = parseInt(fat);
  }

  const data = {
    title,
    description,
    startDate: startDate,
    endDate: endDate,
    challengeWeek: parseInt($('#challenge-week').val()),
    userNumberLimit: parseInt($('#challenge-userNumberLimit').val()),
    publicView,
    attend: parseInt($('#challenge-attend').val()),
    weight,
    muscle,
    fat,
  };

  await axios
    .post('http://3.39.237.124:3000/challenge', data, {
      headers: {
        Authorization: accessToken,
      },
    })
    .then((response) => {
      if (response.data.success === true) {
        alert('도전이 생성되었습니다.');
        location.href = `get-challenges.html`;
      }
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
}

// 제목 글자수 실시간작동 (함수바깥으로 빼야 함)
$('#challenge-title').on('input', function () {
  const description = $(this).val();
  const maxLength = parseInt($(this).attr('maxlength'));
  const charCount = description.length;
  $('#title-char-count').text(charCount + '/' + maxLength);
});
