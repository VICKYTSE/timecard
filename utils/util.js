function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return  [hour, minute].map(formatNumber).join(':')
}

function formatTime1(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('-')
}


function getYMD(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  return [year, month, day].map(formatNumber).join('-')
}

function getHM(date) {
  var hour = date.getHours()
  var minute = date.getMinutes()

  return [hour, minute].map(formatNumber).join(':')
}

function getW(date) {
  var d = date.getDay();
  var arr = ['日', '一', '二', '三', '四', '五', '六'];

  return '星期' + arr[d];
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}



function json2Form(json) {
  var str = [];
  for (var p in json) {
    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));
  }
  return str.join("&");
}


module.exports = {
  formatNumber: formatNumber,
  formatTime: formatTime,
  getYMD: getYMD,
  getHM: getHM,
  getW: getW,
  json2Form: json2Form,
  formatTime1: formatTime1
}
