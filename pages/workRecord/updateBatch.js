// pages/workRecord/updateBatch.js
const app = getApp()
var util = require('../../utils/util.js');
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listData: [],
    selectedUserId: [],
    selectedId: [],
    selectedName: [],
    currentTime: '',
    currentDate: '',
    taskArray: '',
    taskIndex: -1,
    startTime: '',
    startDate: '',
    endTime: '',
    endDate: '',
    startLongitude: '',
    startLatitude: '',
    endlatitude: '',
    endLongitude: '',
    userId:'',
    statusArray: [{ "value": 0, "desc": '上班' }, { "value": 1, "desc": '下班' }, { "value": 2, "desc": '缺卡' }, { "value": 3, "desc": '异常' }],
    statusIndex: -1,
    note: '',
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
      currentDate: date,
      startTime: time,
      endTime: time,
      startDate: date,
      endDate: date
    });

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
          startLatitude: res.latitude,
          startLongitude: res.longitude
        })
        that.setData({
          endLatitude: res.latitude,
          endLongitude: res.longitude
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
   * 设置上班时间
   */
  bindStartTimeChange: function (e) {

    this.setData({
      startTime: e.detail.value
    })
  },

  /**
   * 设置上班日期
   */
  bindStartDateChange: function (e) {
    this.setData({
      startDate: e.detail.value
    })
  },
  /**
 * 设置下班时间
 */
  bindEndTimeChange: function (e) {

    this.setData({
      endTime: e.detail.value
    })
  },

  /**
   * 设置下班日期
   */
  bindEndDateChange: function (e) {
    this.setData({
      endDate: e.detail.value
    })
  },

  /**
   *  项目下拉列表
   */
  bindtaskPickerChange: function (e) {
    var that = this;
    that.setData({
      taskIndex: e.detail.value
    })
  },
  /**
   *  状态下拉列表
   */
  bindstatusPickerChange: function (e) {
    var that = this
    that.setData({
      statusIndex: e.detail.value
    })
    that.setData({
      status: that.data.statusArray[that.data.statusIndex].value
    })

  },
  /**
   * addBatch
   */
  addBatch: function (e) {
    var that = this;
    var taksIndex = that.data.taskIndex
    if (taksIndex == -1) {
      wx.showToast({
        title: '请选择项目',
        icon: 'loading'
      })
    }
    var statusIndex = that.data.statusIndex
    if (statusIndex == -1) {
      wx.showToast({
        title: '请选择状态',
        icon: 'loading'
      })
    }
    function Record() { }
    var record = new Record();
    record.ids = that.data.selectedId
    record.leaderId = that.data.userId
    record.projectId = that.data.taskArray[that.data.taskIndex].id
    record.startLongitude = that.data.startLongitude
    record.startLatitude = that.data.startLatitude
    record.startTime = that.data.startDate+' '+that.data.startTime
    record.endLongitude = that.data.endLongitude
    record.endLatitude = that.data.endLatitude
    record.endTime = that.data.endDate+" "+that.data.endTime
    record.note = that.data.note
    record.status = that.data.status

    let cookie = wx.getStorageSync('cookieKey');
    let header = { 'Content-Type': 'application/x-www-form-urlencoded' };
    if (cookie) {
      header.Cookie = cookie;
    }

    wx.request({
      url: app.globalData.url+'/workRecord/updateBatch',
      data: {
        ids:record.ids,
        leaderId: record.leaderId,
        projectId: record.projectId,
        startLongitude: record.startLongitude,
        startLatitude: record.startLatitude,
        startTime: record.startTime,
        endLongitude: record.endLongitude,
        endLatitude: record.endLatitude,
        endTime: record.endTime,
        note: record.note,
        status: record.status
      },
      header:header,
      //header: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      success: function (res) {
        console.log(res)
        
      },
      fail: function (res) {
        console.log(res)
      },
      complete: function (res) {
        if (res && res.header && res.header['Content-Type'] == "text/html") {   //开启了新的会话
          that.logout()   }//注销
        console.log(record)
        if (res.data.code == 0) {
          wx.navigateBack({
          })
        }
        else{
          var mes = res.data.message
          wx.showToast({
            title: mes.slice(5),
            icon: 'loading'
          })
        }
      }
    })
  },

  /**
 * 注销
 */
  logout: function () {
    console.log('logout')
    wx.clearStorageSync()   //清空缓存
    wx.navigateTo({
      url: '../login/login'
    })
  },

  /**
   * noteInput
   */
  noteInput: function (e) {
    var that = this
    var note = e.detail.value
    that.setData({
      note: note
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var listData = JSON.parse(options.listData)
    var selectedId = JSON.parse(options.selectedId)
    var selectedUserId = JSON.parse(options.selectedUserId)
    var taskArray = JSON.parse(options.taskArray)
    var selectedName = JSON.parse(options.selectedName)
    that.setData({
      listData: listData,
      selectedId: selectedId,
      selectedUserId: selectedUserId,
      taskArray: taskArray,
      selectedName: selectedName
    })
    that.changeTime()
    that.getPlaceInfo()
  },
  loadStorage: function (e) {
    var that = this;
    //读缓存的项目名称
    var chooseProject = wx.getStorageSync('chooseProject');
    if (chooseProject) {
      that.setData({
        taskIndex: chooseProject
      })
    }
    try {
      var userId = wx.getStorageSync('userId');
      var startTime = wx.getStorageSync('setStartTime');
      var endTime = wx.getStorageSync('setEndTime');
      if (userId) {
        that.setData({
          userId: userId,
        })
      }
      console.log(that.data.userId)
      if (startTime) {
        that.setData({
          startTime: startTime,
        })
      }
      if (endTime) {
        that.setData({
          endTime: endTime
        })
      }

    } catch (e) {
      // Do something when catch error
    }

    //读缓存的状态类型
    try {
      var status = wx.getStorageSync('status');
      if (status) {
        that.setData({
          statuse: status
        })
      }
    } catch (e) {
      // Do something when catch error
    }
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
    var that = this;
    that.loadStorage();
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