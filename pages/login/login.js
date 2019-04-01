// pages/login/login.js
const app = getApp()
var util = require('../../utils/util.js');
Page({
  data: {
    userId: '',
    userPassword: '',
  },

  formSubmit: function (e) {
    console.log(e.detail.value);//格式 Object {userId: "userId", userPassword: "password"}
    //获得表单数据
    var objData = e.detail.value;
    var code = false;
    if (objData.userId && objData.userPassword) {
      // 同步方式存储表单数据
      wx.setStorageSync('userId', objData.userId);
      wx.setStorageSync('userPassword', objData.userPassword);
      wx.request({
        url: app.globalData.url+'/user/login',           //login
        data: { 
          id: objData.userId,
           password: objData.userPassword
        },
        header: { 'Content-Type': 'application/x-www-form-urlencoded' },
        method: 'POST',
        success: function (res) {
        if(res.data.code == 0){
          console.log(res)
          
          if (res && res.header && res.header['Set-Cookie']) {
            wx.setStorageSync('cookieKey', res.header['Set-Cookie']);//保存Cookie到Storage
          }
          let cookie = wx.getStorageSync('cookieKey');
          let header = {};
          if (cookie) {
            header.Cookie = cookie;
          }
          console.log(cookie)

          wx.setStorageSync('loginFlag', true);

           var userInfo = res.data.data
           wx.setStorageSync('userInfo', userInfo);
                //跳转到成功页面
          wx.switchTab({
            url: '../onDuty/onDuty'
          })
           
          }
           else {
             wx.showToast({
              title: res.data.message.slice(5),
               icon: 'loading'
             })
          }
        },
        fail: function (res) {
          console.log(res.data)
          console.log('绑定失败')
          wx.setStorageSync('userId', '')
          wx.setStorageSync('userPassword', '')          //绑定失败要清除缓存里的失败数据
          wx.showModal({
          title: '失败',
          content: '绑定失败，请重试',
          })
              }})
    }
    else{
      wx.showToast({
        title: "请完整填写账号和密码",
        icon: 'loading'
      })
    }
  },

  //加载完后，处理事件 
  // 如果有本地数据，则直接显示
  onLoad: function (options) {
    var that = this;
    //获取用户公开信息
    
    //获取本地数据
    var userId = wx.getStorageSync('userId');
    var userPassword = wx.getStorageSync('userPassword');

    /*console.log('userId'+userId);
    console.log('userPassword'+userPassword);*/
    var flag = wx.getStorageSync("loginFlag")
    if (userId && userPassword&&flag) {
      this.setData({
        userId: userId,
        userPassword: userPassword
      });

      var url = '/pages/onDuty/onDuty'
      wx.switchTab({
        url: url
      })

    }

  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})