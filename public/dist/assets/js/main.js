const mainPort = 'sunsurely.shop';
const mainToken = localStorage.getItem('cookie');
const expiration = localStorage.getItem('tokenExpiration');
const isTokenExpired = new Date().getTime() > expiration;

if (!mainToken || isTokenExpired) {
  localStorage.setItem('cookie', '');
  localStorage.setItem('tokenExpiration', '');
  $('#createRecord ').css('visibility', 'hidden');
  $('.daterange-btn').css('visibility', 'hidden');
  $('.place-holder-record').text(
    '로그인 후 체성분 관리 기능을 이용할 수 있습니다.',
  );
  const inoutBtn = $('#logout-button');
  $(inoutBtn).text('Login');
  $('.profile-button').css('display', 'none');
  setTimeout(() => {
    alert('로그인이 필요한 기능입니다.');
  }, 500);
} else {
  const inoutBtn = $('#logout-button');
  $(inoutBtn).html('<i class="fas fa-sign-out-alt"></i> Logout');
}

let nowPage = 1;
let orderList = 'normal';
let totalPages = 0;

$(document).ready(function () {
  initializeList(1, 10);
  initializeChart();
  getBodyResults();

  $('.daterange-cus').daterangepicker({
    startDate: moment().subtract(1, 'years'),
    endDate: moment(),
    locale: {
      format: 'YYYY-MM-DD',
    },
  });
});

const modal = $('#modal-background');

$('.modal-up').on('click', () => {
  $(modal).css('display', 'block');
});

$('.cancel-regist').on('click', () => {
  $(modal).css('display', 'none');
});

async function initializeChart() {
  const bmrArr = [];
  const weightArr = [];
  const muscleArr = [];
  const fatArr = [];
  const dateArr = [];
  const recentDatas = $('.recent-bodyData');

  try {
    const { data } = await getRecordData(1, 7);
    const records = data.pageinatedUsersRecords;

    for (const rec of records) {
      bmrArr.push(rec.bmr);
      weightArr.push(rec.weight);
      muscleArr.push(rec.muscle);
      fatArr.push(rec.fat);

      const date = new Date(rec.createdAt);
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');

      const recordDate = `${year}.${month}.${day}`;

      dateArr.push(recordDate);
    }
  } catch (error) {
    console.error('Error message:', error.response.data.message);
  }

  dateArr.reverse();
  bmrArr.reverse();
  weightArr.reverse();
  muscleArr.reverse();
  fatArr.reverse();

  $(recentDatas[0]).text(
    weightArr[weightArr.length - 1] !== undefined
      ? `${weightArr[weightArr.length - 1]} kg`
      : 'kg',
  );
  $(recentDatas[1]).text(
    fatArr[fatArr.length - 1] !== undefined
      ? `${fatArr[fatArr.length - 1]} %`
      : '%',
  );
  $(recentDatas[2]).text(
    muscleArr[muscleArr.length - 1] !== undefined
      ? `${muscleArr[muscleArr.length - 1]} kg`
      : 'kg',
  );
  $(recentDatas[3]).text(
    bmrArr[bmrArr.length - 1] !== undefined
      ? `${bmrArr[bmrArr.length - 1]} kcal`
      : 'kcal',
  );

  initChart('myChart', bmrArr, dateArr, 50, '기초대사량(kcal)');
  initChart('myChart2', weightArr, dateArr, 5, '체중(kg)');
  initChart('myChart3', muscleArr, dateArr, 5, '골격근량(kg)');
  initChart('myChart4', fatArr, dateArr, 5, '체지방률(%)');
}

async function getBodyResults() {
  try {
    const { data } = await axios.get(
      `https://${mainPort}/record/result/detail`,
      {
        headers: {
          Authorization: mainToken,
        },
        withCredentials: true,
      },
    );

    const avgDatas = data.data.avgDatas;
    const stdWeight = data.data.stdWeight;
    const stdFat = data.data.stdFat;
    const stdMuscle = data.data.stdMuscle;

    const resWeight = data.data.resWeight;
    const resFat = data.data.resFat;
    const resMuscle = data.data.resMuscle;

    let diet = '';
    let workout = '';

    if (resWeight > 5 && resFat < -5 && resMuscle > 5) {
      diet =
        '마른 비만은 근육 생성에 도움이 되는 육류, 생선, 계란, 두부 등 단백질 섭취량을 늘리고 통곡물, 채소, 해조류 위주 식단으로 구성하시면 좋습니다. 규칙적인 식사를 정량으로 하면서 체지방을 천천히 감소시키는 게 중요합니다.';
      workout =
        '유산소 운동과 근력 운동의 비율은 2대 1 정도가 적당합니다. 공간에 제약받지 않고 할 수 있는 근력 운동으로는 팔굽혀펴기, 윗몸일으키기 등이 있습니다. 주 3회 이상, 30분 이상 실시하세요.';
    } else if (resWeight > 5 && resFat > 5 && resMuscle === 0) {
      diet =
        '체지방률이 표준 미만입니다. 고단백, 고열량 식품 위주로 규칙적인 식단을 구성해야 하며, 불규칙한 식사는 소화기관의 기능을 저하시켜 체중 증가를 방해하기 때문에 규칙적으로 식사를 해야 합니다.';
      workout =
        '과도한 유산소 운동은 지양하고, 근력운동에 비중을 더 주고 규칙적으로 운동해야 합니다. 공간에 제약받지 않고 할 수 있는 근력 운동으로는 팔굽혀펴기, 윗몸일으키기 등이 있습니다. 주 3회 이상, 30분 이상 실시하세요.';
    } else if (resWeight > 5 && resFat > 5 && resMuscle > 0) {
      diet =
        '적당한 근육량을 가지고 있지만 표준의 체지방률을 유지하는 것이 건강에 큰 도움이 됩니다. 적당량의 탄수화물과 고단백 식단을 꾸준히 섭취하세요.';
      workout =
        '표준 이상의 근육량을 유지하려면 꾸준한 근력 운동과 건강한 식단을 병행하세요.';
    } else if (resWeight < -5 && resFat < -5 && resMuscle > 5) {
      diet =
        '체지방량이 표준을 초과하며 근육량이 표준 미만이므로 고단백 저탄수화물의 식단으로 관리가 필요한 상태입니다. 더불어 식이섬유가 풍부한 오이나 당근 등 채소를 많이 드세요.';
      workout =
        '유산소 운동뿐만 아니라 근력운동을 병행해야 체중 감소에 도움이 됩니다. 하루에 30분 이상 걷고 체중을 이용한 팔굽혀펴기, 윗몸일으키기 등을 주 3회 30분 이상 실시하세요.';
    } else if (resWeight < -5 && resFat < -5 && resMuscle === 0) {
      diet =
        '근육량은 표준이지만 체지방률을 낮추기 위해 고단백 저탄수화물의 식단으로 관리가 필요한 상태입니다. 더불어 식이섬유가 풍부한 오이나 당근 등 채소를 많이 드세요.';
      workout =
        '근육량의 손실을 최소한으로 줄이면서 체지방을 감소시키기 위해서는 유산소 운동과 더불어 근력 운동을 주 3회 이상 실시하는 것이 도움이 됩니다.';
    } else if (resWeight === 0 && resFat === 0 && resMuscle === 0) {
      diet =
        '모든 수치가 정상 범주에 속해있으며, 지금처럼만 관리한다면 건강한 몸을 유지할 수 있습니다.';
      workout =
        '모든 수치가 정상 범주에 속해있으며, 지금처럼만 관리한다면 건강한 몸을 유지할 수 있습니다.';
    } else {
      diet =
        '표준에 가까운 체성분 수치이므로, 건강한 식단을 꾸준히 유지하세요.';
      workout =
        '표준에 가까운 체성분 수치이므로, 유산소 운동과 근력 운동을 꾸준히 실시하세요.';
    }

    $('#food-result').text(diet);
    $('#workout-result').text(workout);

    const bodyResults = $('.body-result');
    const avgWeight = $('#avg-weight');
    const avgFat = $('#avg-fat');
    const avgMuscle = $('#avg-muscle');

    $(bodyResults[0]).text(`${stdWeight}kg`);
    $(bodyResults[1]).text(
      resWeight < 0 ? `${resWeight}kg` : `+${resWeight}kg`,
    );
    $(bodyResults[2]).text(`${stdFat}%`);
    $(bodyResults[3]).text(resFat < 0 ? `${resFat}%` : `+${resFat}%`);
    $(bodyResults[4]).text(`${stdMuscle}kg`);
    $(bodyResults[5]).text(
      resMuscle < 0 ? `${resMuscle}kg` : `+${resMuscle}kg`,
    );

    $(avgWeight).text(
      `평균 체중 :  ${avgDatas.avgWgt ? avgDatas.avgWgt : ''}(kg)`,
    );
    $(avgFat).text(
      `평균 체지방률 :  ${avgDatas.avgFat ? avgDatas.avgFat : ''}(%)`,
    );
    $(avgMuscle).text(
      `평균 골격근량 :  ${avgDatas.avgMus ? avgDatas.avgMus : ''}(kg)`,
    );
  } catch (error) {
    console.error('Error message:', error.response.data.message);
  }
}

async function initializeList(page, pageSize) {
  const recordTable = $('#record-table');
  const pagenationTag = $('#record-pagenation');
  const prevButton = `<li id="prev_button" class="page-item"><a class="page-link">이전</a></li>`;
  const nextButton = `<li id="next_button" class="page-item"><a class="page-link">다음</a></li>`;
  let pageNumbers = '';
  let pageNumbersHtml = '';
  let recordsHtml = '';

  orderList = 'normal';
  const data = await getRecordData(page, pageSize);

  if (data) {
    $('.place-holder-record').html('');
    $('.total-record').css('display', 'block');
    $('.table-responsive').css('display', 'block');
    $('#myChart').css('display', 'block');
    $('#myChart1').css('display', 'block');
    $('#myChart2').css('display', 'block');
    $('#myChart3').css('display', 'block');
    $('.main-footer').css('display', 'block');
    const records = data.data.pageinatedUsersRecords;
    totalPages = data.data.totalPages;
    for (let i = 1; i <= data.data.totalPages; i++) {
      pageNumbers += `<li class="page-item page_number">
        <a class="page-link">${i}</a>
      </li>`;
    }

    records.forEach((record) => {
      const date = new Date(record.createdAt);
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');

      const recordDate = `${year}.${month}.${day}`;

      const temp = `  <tr style="border-bottom:solid 2px rgba(0,0,0,0.1)">
      <td>
        <div style="margin-top:10px; ">${recordDate}</div>
      </td>
      <td>
        <p href="#" class="font-weight-600" style="margin-top:25px;">${record.weight}kg</p>
      </td>
      <td>
        <p href="#" class="font-weight-600" style="margin-top:25px;">${record.fat}%</p>
      </td>
      <td>
        <p href="#" class="font-weight-600" style="margin-top:25px;">${record.muscle}kg</p>
      </td>
      <td>
        <p href="#" class="font-weight-600" style="margin-top:25px;">${record.bmr}kcal</p>
      </td>
    </tr>`;

      recordsHtml += temp;
    });

    pageNumbersHtml = prevButton + pageNumbers + nextButton;
    recordTable.html(recordsHtml);
    pagenationTag.html(pageNumbersHtml);
    const prevBtn = $('#prev_button');
    const nextBtn = $('#next_button');
    const pages = $('.page_number');

    $(prevBtn).click(async () => {
      if (orderList === 'normal') {
        if (nowPage > 1) {
          try {
            $(pages).find('.page-link').css('background-color', '');
            $(pages).find('.page-link').css('color', '');

            const { data } = await getRecordData(nowPage - 1, 10);
            const records = data.pageinatedUsersRecords;
            setRecordList(records);
            nowPage -= 1;
            recordsHtml = '';

            $(pages)
              .eq(nowPage - 1)
              .find('.page-link')
              .css('background-color', 'rgb(103,119,239)');
            $(pages)
              .eq(nowPage - 1)
              .find('.page-link')
              .css('color', 'white');
          } catch (error) {
            console.error('Error message:', error.response.data.message);
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
            const { data } = await getRecordData(nowPage + 1, 10);
            const records = data.pageinatedUsersRecords;
            setRecordList(records);
            nowPage += 1;
            recordsHtml = '';

            $(pages)
              .eq(nowPage - 1)
              .find('.page-link')
              .css('background-color', 'rgb(103,119,239)');
            $(pages)
              .eq(nowPage - 1)
              .find('.page-link')
              .css('color', 'white');
          } catch (error) {
            console.error('Error message:', error.response.data.message);
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
            const { data } = await getRecordData(
              parseInt($(page).find('.page-link').text()),
              10,
            );
            const records = data.pageinatedUsersRecords;
            setRecordList(records);

            $(page)
              .find('.page-link')
              .css('background-color', 'rgb(103,119,239)');
            $(page).find('.page-link').css('color', 'white');
            nowPage = parseInt($(page).find('.page-link').text());

            recordsHtml = '';
          } catch (error) {
            console.error('Error message:', error.response.data.message);
          }
        }
      });
    });

    $('.daterange-btn').on('click', async function () {
      $('.page_number').find('.page-link').css('background-color', '');
      $('.page_number').find('.page-link').css('color', '');
      nowPage = 1;
      const recordTable = $('#record-table');
      const pagenationTag = $('#record-pagenation');
      const prevButton = `<li id="prev_button" class="page-item"><a class="page-link">이전</a></li>`;
      const nextButton = `<li id="next_button" class="page-item"><a class="page-link">다음</a></li>`;
      let pageNumbers = '';
      let pageNumbersHtml = '';
      let recordsHtml = '';

      orderList = 'date';
      const range = $('.daterange-cus').data('daterangepicker');
      const startDate = range.startDate.format('YYYY-MM-DD');
      const endDate = range.endDate.format('YYYY-MM-DD');

      const data = await getDateRangeRecord(startDate, endDate, 1);

      const records = data.data.pageinatedUsersRecords;

      totalPages = data.data.totalPages;
      for (let i = 1; i <= data.data.totalPages; i++) {
        pageNumbers += `<li class="page-item page_number">
          <a class="page-link">${i}</a>
        </li>`;
      }

      records.forEach((record) => {
        const date = new Date(record.createdAt);
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        const recordDate = `${year}.${month}.${day}`;

        const temp = `  <tr style="border-bottom:solid 2px rgba(0,0,0,0.1)">
      <td>
        <div style="margin-top:10px; ">${recordDate}</div>
      </td>
      <td>
        <p href="#" class="font-weight-600" style="margin-top:25px;">${record.weight}kg</p>
      </td>
      <td>
        <p href="#" class="font-weight-600" style="margin-top:25px;">${record.fat}%</p>
      </td>
      <td>
        <p href="#" class="font-weight-600" style="margin-top:25px;">${record.muscle}kg</p>
      </td>
      <td>
        <p href="#" class="font-weight-600" style="margin-top:25px;">${record.bmr}kcal</p>
      </td>
    </tr>`;
        recordsHtml += temp;
      });

      pageNumbersHtml = prevButton + pageNumbers + nextButton;
      recordTable.html(recordsHtml);
      pagenationTag.html(pageNumbersHtml);
      $('.page_number')
        .eq(0)
        .find('.page-link')
        .css('background-color', 'rgb(103,119,239)');
      $('.page_number').eq(0).find('.page-link').css('color', 'white');
      const prevBtn = $('#prev_button');
      const nextBtn = $('#next_button');
      const pages = $('.page_number');

      $(prevBtn).click(async () => {
        if (orderList === 'date') {
          if (nowPage > 1) {
            const range = $('.daterange-cus').data('daterangepicker');
            const startDate = range.startDate.format('YYYY-MM-DD');
            const endDate = range.endDate.format('YYYY-MM-DD');

            try {
              $(pages).find('.page-link').css('background-color', '');
              $(pages).find('.page-link').css('color', '');

              const { data } = await getDateRangeRecord(
                startDate,
                endDate,
                nowPage - 1,
              );
              const records = data.pageinatedUsersRecords;
              setRecordList(records);
              nowPage -= 1;
              recordsHtml = '';

              $(pages)
                .eq(nowPage - 1)
                .find('.page-link')
                .css('background-color', 'blue');
              $(pages)
                .eq(nowPage - 1)
                .find('.page-link')
                .css('color', 'white');
            } catch (error) {
              console.error('Error message:', error.response.data.message);
            }
          }
        }
      });

      $(nextBtn).click(async () => {
        if (orderList === 'date') {
          if (nowPage > 0 && nowPage < totalPages) {
            const range = $('.daterange-cus').data('daterangepicker');
            const startDate = range.startDate.format('YYYY-MM-DD');
            const endDate = range.endDate.format('YYYY-MM-DD');

            $(pages).find('.page-link').css('background-color', '');
            $(pages).find('.page-link').css('color', '');
            try {
              const { data } = await getDateRangeRecord(
                startDate,
                endDate,
                nowPage + 1,
              );
              const records = data.pageinatedUsersRecords;
              setRecordList(records);
              nowPage += 1;
              recordsHtml = '';

              $(pages)
                .eq(nowPage - 1)
                .find('.page-link')
                .css('background-color', 'rgb(103,119,239)');
              $(pages)
                .eq(nowPage - 1)
                .find('.page-link')
                .css('color', 'white');
            } catch (error) {
              console.error('Error message:', error.response.data.message);
            }
          }
        }
      });

      $(pages).each((idx, page) => {
        $(page).click(async () => {
          if (orderList === 'date') {
            const range = $('.daterange-cus').data('daterangepicker');
            const startDate = range.startDate.format('YYYY-MM-DD');
            const endDate = range.endDate.format('YYYY-MM-DD');
            $(pages).find('.page-link').css('background-color', '');
            $(pages).find('.page-link').css('color', '');
            nowPage = parseInt($(page).find('.page-link').text());
            try {
              const { data } = await getDateRangeRecord(
                startDate,
                endDate,
                nowPage,
              );
              const records = data.pageinatedUsersRecords;
              setRecordList(records);

              $(page)
                .find('.page-link')
                .css('background-color', 'rgb(103,119,239)');
              $(page).find('.page-link').css('color', 'white');

              recordsHtml = '';
            } catch (error) {
              console.error('Error message:', error.response.data.message);
            }
          }
        });
      });
    });
  }
}

// 체성분 등록
$('.regist-record').click(async () => {
  const bodyDatas = $('.body-data');
  const isvalidInput = true;

  function isNumericInput(input) {
    return /^\d+$/.test(input);
  }

  function isFourDigitInteger(input) {
    return /^\d{1,4}$/.test(input);
  }

  bodyDatas.each((index, element) => {
    const value = $(element).val();

    if (!isNumericInput(value) || !isFourDigitInteger(value)) {
      isvalidInput = false;
      return false;
    }

    if (!isvalidInput) {
      alert('4자리 이하의 정수만 입력 가능합니다.');
      return;
    }
  });

  const height = parseInt($(bodyDatas[0]).val());
  const weight = parseInt($(bodyDatas[1]).val());
  const fat = parseInt($(bodyDatas[2]).val());
  const muscle = parseInt($(bodyDatas[3]).val());
  const bmr = parseInt($(bodyDatas[4]).val());

  const data = { height, weight, fat, muscle, bmr };

  try {
    await axios.post(`https://${mainPort}/record`, data, {
      headers: {
        Authorization: `${mainToken}`,
      },
      withCredentials: true,
    });
    alert('체성분 등록 완료');
    window.location.reload();
  } catch (error) {
    alert(error.response.data.message);
  }
});

async function getRecordData(page, pageSize) {
  try {
    const data = await axios(
      `https://${mainPort}/record/page/?page=${page}&pageSize=${pageSize}`,
      {
        headers: {
          Authorization: mainToken,
        },
        withCredentials: true,
      },
    );
    orderList = 'normal';
    return data.data;
  } catch (error) {
    console.error(error.response.data.message);
  }
}

async function initChart(chartName, recordArr, dateArr, stepSize, title) {
  var statistics_chart = document.getElementById(chartName).getContext('2d');

  var myChart = new Chart(statistics_chart, {
    type: 'line',
    data: {
      labels: [...dateArr],
      datasets: [
        {
          label: title,
          data: [...recordArr],
          borderWidth: 3,
          borderColor: 'rgb(103,119,239)',
          backgroundColor: 'transparent',
          pointBackgroundColor: 'rgb(103,119,239)',
          pointBorderColor: 'rgb(103,119,239)',
          pointRadius: 2,
          tension: 0,
        },
      ],
    },
    options: {
      plugins: {
        datalabels: {
          align: 'end',
          anchor: 'end',
          formatter: (value, context) => {
            return value + ' kg';
          },
        },
      },
      legend: {
        display: true,
        labels: {
          boxWidth: 0,
          usePointStyle: false,
        },
      },
      scales: {
        yAxes: [
          {
            gridLines: {
              display: true,
              drawBorder: false,
            },
            ticks: {
              stepSize: stepSize,
            },
          },
        ],
        xAxes: [
          {
            gridLines: {
              color: '#fbfbfb',
              lineWidth: 2,
            },
          },
        ],
      },
    },
  });
}

function setRecordList(records) {
  let recordsHtml = '';
  const recordTable = $('#record-table');
  $(recordTable).html('');

  records.forEach((record) => {
    const date = new Date(record.createdAt);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const recordDate = `${year}.${month}.${day}`;

    const temp = `  <tr style="border-bottom:solid 2px rgba(0,0,0,0.1)">
    <td>
      <div style="margin-top:10px; ">${recordDate}</div>
    </td>
    <td>
      <p href="#" class="font-weight-600" style="margin-top:25px;">${record.weight}kg</p>
    </td>
    <td>
      <p href="#" class="font-weight-600" style="margin-top:25px;">${record.fat}%</p>
    </td>
    <td>
      <p href="#" class="font-weight-600" style="margin-top:25px;">${record.muscle}kg</p>
    </td>
    <td>
      <p href="#" class="font-weight-600" style="margin-top:25px;">${record.bmr}kcal</p>
    </td>
  </tr>`;

    recordsHtml += temp;
  });
  recordTable.html(recordsHtml);
}

async function getDateRangeRecord(startDate, endDate, page) {
  const { data } = await axios.get(
    `https://${mainPort}/record/date/period/page/?page=${page}&pageSize=10&start=${startDate}&end=${endDate}`,

    {
      headers: {
        Authorization: mainToken,
      },
      withCredentials: true,
    },
  );

  return data;
}
