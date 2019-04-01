// pages/onDuty/onDuty.js
//上班打卡
const app = getApp()
var util = require('../../utils/util.js');
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
  userName:'',
  userInfo:[],
  userId:'',
  setStartTime:'',
  currentTime:'',
  currentDate:'',
  listData:[],
  taskIndex:-1,
  listData: [],
  inputId: '',
  startLongitude: '',
  startLatitude: '',
  startTime: '',
  status:0,
  isSetTime:0,

  recordWaysArray: [{ "value": -1, "desc": '刷卡' }, { "value": 0, "desc": '手动' }],
  recordWaysIndex: 0,
  
  isCheckBtnUsed:true,
  focusFlag: true
  },


  /**
   *  默认当前时间日期
   */
  changeTime: function (e) {
    var that = this;
    var time = util.formatTime(new Date());
    var date = util.formatTime1(new Date());
    this.setData({
      currentTime: time,
      currentDate:date
    });
    if(that.data.isSetTime==0)
    {
    setTimeout(function () {
      that.changeTime()
    }, 500)
    }
  },

  /**
   * 设置时间
   */
  bindTimeChange:function(e){
    this.setData({
      isSetTime:1,
      currentTime:e.detail.value
    })
  },

  /**
   * 设置日期
   */
  bindDateChange: function (e) {
    this.setData({
      isSetTime: 1,
      currentDate: e.detail.value
    })
  },
  
   /**
   * 设置规定上下班时间
   */
  bindSetTimeChange:function(e){
    this.setData({
      isSetTime: 1,
      setStartTime: e.detail.value
    });

    //本地缓存设置时间  新增8.20
    wx.setStorageSync('setStartTime', this.data.setStartTime);
  },

  /**
   *  项目下拉列表
   */
  bindtaskPickerChange: function (e) {
    this.setData({
      taskIndex: e.detail.value,
    })
    var that = this;
    var projectId = that.data.taskArray[that.data.taskIndex].id
    wx.setStorageSync('projectId', projectId)
    wx.setStorageSync('chooseProject', that.data.taskIndex);
    
    //本地缓存选择项目  新增8.20
    //获取打卡记录
    that.getRecord();
  },

  /**
   *  工号输入框
   */

  bindinputId:function(e){
    var that = this;
    if (that.data.recordWaysIndex==0){
      //刷卡模式
      that.setData({
        inputId: e.detail.value
      });
      //var inputIdText = e.detail.value;
      //if (inputIdText.length == 10) {
      //  that.setData({
          //inputId: 'ba00002'
      //    inputId:  inputIdText
      //  });
      //  this.bindCheck();
     // }
    }
    else if (this.data.recordWaysIndex == 1){
      //手动模式
      that.setData({
        inputId: e.detail.value
      });
    }

  },

  lostBindEvent:function(){
    this.setData({
      focusFlag:true
    })
  },

  /**
  * 获取打卡记录
  */
  getRecord: function (e) {
    //获取打卡记录  
    var that = this;

    let cookie = wx.getStorageSync('cookieKey');
    let header = { 'Content-Type': 'application/x-www-form-urlencoded' };
    if (cookie) {
      header.Cookie = cookie;
    }
    var projectId = wx.getStorageSync('projectId')

    wx.request({
      url: app.globalData.url + '/workRecord/getByLeaderAndProjectAndStatusAndDate',
      data: {
        leaderId: that.data.userId,
        projectId:projectId,
        //projectId:that.data.taskArray[that.data.taskIndex].id,
        status:that.data.status,
        date: that.data.currentDate
      },
      header: header,
      //header: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      success: function (res) {

      },
      fail: function (res) {
        console.log(res)
      },
      complete: function (res) {
        if (res && res.header && res.header['Content-Type'] == "text/html") {   //开启了新的会话
          that.logout()   //注销
        }
        if (res.data.code == 0) {
          console.log(res)
        }
        else {
          console.log(res)
        }
        that.setData({
          listData: res.data.data
        })

      }

    })
  },

  /**
   *  获取当前经纬度
   */

  getPlaceInfo: function () {
    var that = this
    wx.getLocation({     //获取打卡地址
      type: 'gcj02',
      success: function (res) {
        that.setData({
          startLatitude:res.latitude ,
          startLongitude:res.longitude
        })
        var demo = new QQMapWX({
          key: 'BJBBZ-6SUKO-6INW2-SFQ2M-Z6VD3-SNFSZ' // 必填
        });
        var Location = res.latitude + ',' + res.longitude
        demo.reverseGeocoder({
          location: Location,
          success: function (res) {
          },
          fail: function (res) {
            console.log(res);
          },
        });
      },

    })
   /* setTimeout(function () {
      that.getPlaceInfo()
    }, 5 * 60000)   //五分钟刷新一次*/
  },

  /**
   * 打卡按钮
   */
  bindCheck:function(e){

    var that = this
    if(that.data.taskIndex==-1){
      wx.showToast({
        title: '请选择项目',
        icon:'loading'
      })
    }
    else if (that.data.setStartTime == '') {
      wx.showToast({
        title: '请设置规定时间',
        icon: 'loading'
      })
    }

    let cookie = wx.getStorageSync('cookieKey');
    let header = { 'Content-Type': 'application/x-www-form-urlencoded' };
    if (cookie) {
      header.Cookie = cookie;
    }

    //上班打卡
    wx.request({                  
      url: app.globalData.url+'/workRecord/onDuty',         
      data: {
        userId: that.data.inputId,
        leaderId:that.data.userId,
        projectId:that.data.taskArray[that.data.taskIndex].id,
        startLongitude: that.data.startLongitude,
        startLatitude:  that.data.startLatitude,
        //startTime:that.data.currentDate+' '+that.data.currentTime     
        startTime:that.data.currentDate+' '+that.data.setStartTime
      },
      header:header,
      //header: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      success:function(res){

        console.log(res.data)

        if (res.data.code == -1 || res.data.code == 33 || res.data.code == 73 || res.data.code == 72 || res.data.code == 74 || res.data.code == 71){
          var mes = res.data.message
          wx.showToast({
            title: mes.slice(5),
            icon: 'loading'
          })
        }
      },
      fail:function(res)
      {
        console.log(res)
      },
      complete:function(res){
        if (res && res.header && res.header['Content-Type'] == "text/html") {   //开启了新的会话
          that.logout()   //注销
        }
        //更新打卡记录,清空文本
        setTimeout(function () {
          that.setData({ inputId: '' });
          that.getRecord();
          that.lostBindEvent(); //重新聚焦
        }, 100);//延迟时间 这里是2秒
       
      }
    })
  },

  
  /**
   * 打卡方式选择
   */
  bindrecordWayPickerChange:function(e){
    var that = this;
    that.setData({
      recordWaysIndex: e.detail.value
    });
    that.changeRechordMod(that.data.recordWaysIndex);
  },

/**
 * 刷卡和手动模式切换
 */
  changeRechordMod:function(mode){
    var that=this;
    if (mode == 0) {
      //刷卡模式

       //打卡按钮不可用
      that.setData({
        isCheckBtnUsed:true
      });    
    }
    else if (mode == 1) {
      //手动模式

      //打卡按钮可用
      that.setData({
        isCheckBtnUsed: false
      });    
    }
  },


  /**
   * 加载页面时读取本地缓存数据
   */
  loadStorage: function (e) {
      var that = this;
       //读缓存的项目名称
      try {
        var chooseProject = wx.getStorageSync('chooseProject');
        if (chooseProject) {
          that.setData({
            taskIndex: chooseProject
          })
        }
      } catch (e) {
        // Do something when catch error
      }

      //读缓存的设置时间
      try {
        var setStartTime = wx.getStorageSync('setStartTime');
        if (setStartTime) {
          that.setData({
            setStartTime: setStartTime
          })
        }
      } catch (e) {
        // Do something when catch error
      }
  },
  /**
   * 获取项目
   */
  getTaskArray:function(){
    var that = this; 
    let cookie = wx.getStorageSync('cookieKey');
    let header = { 'Content-Type': 'application/x-www-form-urlencoded' };
    if (cookie) {
      header.Cookie = cookie;
    }
    var userId = wx.getStorageSync('userId');
    wx.request({
      url: app.globalData.url + '/project/getByLeaderAndStaue0',
      data: { id: userId },
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: header,
      //header: { 'Content-Type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        console.log(res)
        // success
        that.setData({
          taskArray: res.data.data
        })
        if (res.data.code == 0) {
          //console.log(res.data.data)
        }
        else {
          //console.log(res.data)
        }
      },
      fail: function (res) {
        console.log(res.data)
        // fail
      },
      complete: function (res) {
        // complete
        if (res && res.header && res.header['Content-Type'] == "text/html") {   //开启了新的会话
          that.logout()   //注销
        }
      }
    })
  },

  /**
   * 注销
   */
  logout:function(){
    console.log('logout')
    wx.clearStorageSync()   //清空缓存
    wx.reLaunch({
      url: '../login/login'
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var userId = wx.getStorageSync('userId');
    var password = wx.getStorageSync('userPassword')
    that.setData({
      userId:userId
    })
    var userInfo = wx.getStorageSync('userInfo');
    that.setData({
      userInfo: userInfo,
      userName: userInfo.name
    })
    that.getPlaceInfo()
    that.getTaskArray()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    that.changeTime();
   // that.getTaskArray();
    that.loadStorage();          //获取本地缓存 新增8.20
    console.log(that.data.taskIndex)
    if (that.data.taskIndex != -1) {  //获取打卡记录
      that.getRecord();
    }
    //that.loadStorage();          //获取本地缓存 新增8.20
    //if (that.data.taskIndex != -1) {
    //  that.getRecord();
   // }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})


