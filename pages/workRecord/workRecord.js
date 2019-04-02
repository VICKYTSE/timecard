// pages/workRecord/workRecord.js
const app = getApp()
var util = require('../../utils/util.js');
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selected: 0,
    list: ['今日记录', '往日记录', '待处理'],
    userName: '',
    userId: '',
    userInfo:[],
    currentTime: '',
    currentDate: '',
    listData: [],
    taskIndex: -1,
    listData: [],
    status: -1,
    isSetTime: 0,
    statusArray: [{ "value": -1, "desc": '所有' }, { "value": 0, "desc": '上班' }, { "value": 1, "desc": '下班' }, { "value": 2, "desc": '缺卡' }, { "value": 3, "desc": '异常' }],
    statusIndex:-1,
    selectedId:[],
    selectedUserId:[],
    selectedName:[],
    selectedAll:false,
    pastListData:[],
    errorListData:[],
  },

  selected: function (e) {
    let that = this
    console.log(e)
    let index = e.currentTarget.dataset.index
    console.log("index", index)
    if (index == 0) {
      that.setData({
        selected: 0
      })
    } else if (index == 1) {
      that.setData({
        selected: 1
      })
    } else {
      that.setData({
        selected: 2
      })
    }
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
      currentDate: date
    });
    if (that.data.isSetTime == 0) {
      setTimeout(function () {
        that.changeTime()
      }, 1000)
    }
  },

  /**
   * 设置时间
   */
  bindTimeChange: function (e) {

    this.setData({
      isSetTime: 1,
      currentTime: e.detail.value
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
   *  项目下拉列表
   */
  bindtaskPickerChange: function (e) {
    var that = this;
    that.setData({
      taskIndex: e.detail.value
    })

    //本地缓存设置时间  新增8.20
    wx.setStorageSync('chooseProject', this.data.taskIndex);

    //获取打卡记录
    that.getRecord();
    that.getPastRecord();
    that.getErrorRecord();
  },

  /**
   *  状态下拉列表
   */
  bindstatusPickerChange: function (e) {
    var that = this
    that.setData({
      statusIndex: e.detail.value
    });
    that.setData({
      status:that.data.statusArray[that.data.statusIndex].value
    });

    //本地缓存设置时间  新增8.20
    wx.setStorageSync('status', this.data.status);

    //刷新打卡记录
    that.getRecord();
    that.getPastRecord();
    that.getErrorRecord();
  },


  /**
   *  工号输入框
   */

  bindinputId: function (e) {
    this.setData({
      inputId: e.detail.value
    })
  },

  /**
  * 获取打卡记录
  */
  getRecord: function (e) {
    //获取打卡记录  
    var that = this;
    var emptyArray = new Array
    that.setData({
      selectedAll:false,
      selectedName:emptyArray,
      selectedId:emptyArray,
      selectedUserId:emptyArray
    })

    let cookie = wx.getStorageSync('cookieKey');
    let header = {'Content-Type': 'application/x-www-form-urlencoded'};
    if (cookie) {
      header.Cookie = cookie;
    }
    
    wx.request({
      url: app.globalData.url +'/workRecord/getByLeaderAndProjectAndStatusAndDate',
      data: {
        leaderId: that.data.userId,
        projectId: that.data.taskArray[that.data.taskIndex].id,
        status: that.data.status,
        date: that.data.currentDate
      },
      header:header,
      //header: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      success: function (res) {
      },
      fail: function (res) {
        console.log(res)
      },
      complete: function (res) {
        if (res && res.header && res.header['Content-Type'] == "text/html") {   //开启了新的会话
          that.logout()
        }   //注销
        if (res.data.code == 0) {
          console.log(res)
          console.log(that.data.userId + "  " + that.data.taskArray[that.data.taskIndex].id
            + "  " + that.data.status + "  " + that.data.currentDate)
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
  * 获取三日(包括今日)内异常打卡记录
  */
  getErrorRecord: function (e) {
    //获取打卡记录  
    var that = this;
    that.setData({
      errorListData: []
    })
    that.onGetErrorRecord(0)
    that.onGetErrorRecord(1)
    that.onGetErrorRecord(2)

    console.log(that.data.errorListData)
    
  },

  /**
  * 获取前三日打卡记录
  */
  getPastRecord: function (e) {
    //获取打卡记录  
    var that = this;
    that.setData({
      pastListData:[]
    })
    that.onGetPastRecord(1)
    that.onGetPastRecord(2)
    that.onGetPastRecord(3)

    console.log(that.data.pastListData)
  },

  /**
   * deleteById
   */
  deleteById:function(e){
    var that = this
    var id = e.currentTarget.dataset.id

    let cookie = wx.getStorageSync('cookieKey');
    let header = {'Content-Type': 'application/x-www-form-urlencoded'};
    if (cookie) {
      header.Cookie = cookie;
    }

    wx.request({
      url: app.globalData.url+'/workRecord/deleteById',
      data: {
        id:id
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
          that.logout()
        }   //注销
        that.getRecord();
      }
    })
  },

  /**
   * deleteByIdBatch
   */
  deleteByIdBatch:function(e){
    var that = this
    if (that.data.selectedId.length == 0) {
      wx.showToast({
        title: '请勾选记录',
        icon: 'loading'
      })
      return     }
    var ids = that.data.selectedId
    /*var id1 = JSON.stringify(ids)
    var id2 = JSON.parse(id1)
    console.log(id2)
    console.log(that.data.selectedId)
    wx.request({
      url: 'https://47.97.124.111/workRecord/deleteByIdBatch',
      data: {
        ids:id2
      },
      header: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      },
      complete: function (res) {
        that.getRecord();
      }
    })*/
    let cookie = wx.getStorageSync('cookieKey');
    let header = { 'Content-Type': 'application/x-www-form-urlencoded' };
    if (cookie) {
      header.Cookie = cookie;
    }

    for(var i=0;i<ids.length;i++)
    {
      var id = ids[i];
      
      wx.request({
        url: app.globalData.url+'/workRecord/deleteById',
        data: {
          id: id
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
            that.logout()
          }   //注销
          that.getRecord();
        }
      })
    }
  },

  /**
   * 全选
   */
  bindSelectAll:function(e){
    var that = this;
   // var list = that.data.listData
    var type = e.currentTarget.dataset.type
    console.log(type)
    if (type == 0) {
      var list = that.data.listData
    }
    else if (type == 1) {
      var list = that.data.pastListData
    }
    else if (type == 2) {
      var list = that.data.errorListData
    }

    if(list.length!=0){

    var selectedAll = that.data.selectedAll
    selectedAll = !selectedAll
    for(var i=0;i<list.length;i++)
    {
      if(list[i].selected=='')
        {list[i].selected =false;}
      list[i].selected = !list[i].selected;
    }

      if (type == 0) {
        that.setData({
          listData: list,
          selectedAll: selectedAll
          
        })
      }
      else if (type == 1) {
        that.setData({
          pastListData: list,
          selectedAll: selectedAll
        })
      }
      else if (type == 2) {
        that.setData({
          errorListData: list,
          selectedAll: selectedAll
        })
      }

    var listId = []
    var listUserId = []
    var listName = []
    for (var i = 0; i < list.length; i++) {
      if (list[i].selected) {
        listId.push(list[i].workRecordId);
        listUserId.push(list[i].userId);
        listName.push(list[i].userName)
      }
    }
    that.setData({
      selectedId: listId,
      selectedUserId: listUserId,
      selectedName: listName
    })  
    
    }
  },

  /**
   * bindCheckbox
   */
  bindCheckbox:function(e){
    var that = this
    var index = e.currentTarget.dataset.index
    var type = e.currentTarget.dataset.type
    if(type == 0){
      var list = that.data.listData
    }
    else if(type == 1)
    {
      var list = that.data.pastListData
    }
    else if(type == 2){
      var list = that.data.errorListData
    }
    
    //var list = that.data.listData
    if(list[index].selected==''){
      list[index].selected=false
    }
    list[index].selected = !list[index].selected

    if (type == 0) {
      that.setData({
        listData: list
      })    
    } 
    else if (type == 1) 
    {
      that.setData({
        pastListData: list
      })  
    } 
    else if (type == 2) 
    {
      that.setData({
        errorListData: list
      })  
    }

    var listId = []
    var listUserId = []
    var listName = []
    for (var i = 0; i < list.length; i++) {
      if (list[i].selected) {
        listId.push(list[i].workRecordId);
        listUserId.push(list[i].userId);
        listName.push(list[i].userName);
      }
    }
    that.setData({
      selectedId: listId,
      selectedUserId: listUserId,
      selectedName:listName
    })  
  },

  /**
   * addBatch
   */
  addBatch:function(e){
    var that = this;
    var listData = JSON.stringify(that.data.listData)
    var selectedId = JSON.stringify(that.data.selectedId)
    var selectedUserId = JSON.stringify(that.data.selectedUserId)
    var taskArray = JSON.stringify(that.data.taskArray)
    var selectedName = JSON.stringify(that.data.selectedName)
    if(that.data.taskIndex== -1){
  wx.showToast({
    title: '请选择项目',
    icon: 'loading'
  })
}
    else{
      wx.navigateTo({
      url: '../workRecord/addBatch?listData=' + listData +"&selectedId="+selectedId+'&selectedUserId='+selectedUserId+'&taskArray='+taskArray+'&selectedName='+selectedName
    })
    }
  },

  /**
   * updateBatch
   */
  updateBatch:function(){
    var that = this;
    var listData = JSON.stringify(that.data.listData)
    var selectedId = JSON.stringify(that.data.selectedId)
    var selectedUserId = JSON.stringify(that.data.selectedUserId)
    var taskArray = JSON.stringify(that.data.taskArray)
    var selectedName = JSON.stringify(that.data.selectedName)
    if (that.data.selectedId.length==0){
      wx.showToast({
        title: '请勾选记录',
        icon:'loading'
      })
    }
    else{
    wx.navigateTo({
      url: '../workRecord/updateBatch?listData=' + listData + "&selectedId=" + selectedId + '&selectedUserId=' + selectedUserId + '&taskArray=' + taskArray + '&selectedName=' + selectedName
    })
    }
  },
  /**
   * update
   */
  update:function(e){
    var that = this;
    var name = new Array();
    var id = new Array();
    var userId = new Array();
    id.push(e.currentTarget.dataset.id)
    name.push(e.currentTarget.dataset.name)
    userId.push(e.currentTarget.dataset.userid)
    var listData = JSON.stringify(that.data.listData)
    var selectedId = JSON.stringify(id)
    var selectedUserId = JSON.stringify(userId)
    var taskArray = JSON.stringify(that.data.taskArray)
    var selectedName = JSON.stringify(name)
    wx.navigateTo({
      url: '../workRecord/updateBatch?listData=' + listData + "&selectedId=" + selectedId + '&selectedUserId=' + selectedUserId + '&taskArray=' + taskArray + '&selectedName=' + selectedName
    })
  },

  /**
   * 刷新
   */
  refresh:function(){
    var that = this
    that.setData({
      statusIndex:0,
      status:-1
    })
    that.getRecord();   //刷新打卡记录
    that.getPastRecord();
    that.getErrorRecord();
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
  bindCheck: function (e) {

    var that = this
    if (that.data.taskIndex == -1) {
      wx.showToast({
        title: '请选择项目',
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
        leaderId: that.data.userId,
        projectId: that.data.taskArray[that.data.taskIndex].id,
        startLongitude: that.data.startLongitude,
        startLatitude: that.data.startLatitude,
        startTime: that.data.currentDate + ' ' + that.data.currentTime
      },
      header:header,
      //header: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      success: function (res) {

        if (res.data.code == -1 || res.data.code == 33 || res.data.code == 73 || res.data.code == 72 || res.data.code == 74 || res.data.code == 71) {
          console.log(res.data.message)
          wx.showToast({
            title: '打卡失败',
            icon: 'loading'
          })
        }

      },
      fail: function (e) {
        console.log(res)
      },
      complete: function (res) {
        if (res && res.header && res.header['Content-Type'] == "text/html") {   //开启了新的会话
          that.logout()
        }   //注销
        //更新打卡记录
        that.getRecord();
      }
    })
  },

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

    //读缓存的状态类型
    try {
      var status = wx.getStorageSync('status');
      if (status) {
        that.setData({
          status: status
        })
      }
    } catch (e) {
      // Do something when catch error
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var userId = wx.getStorageSync('userId');
    that.setData({
      userId: userId
    })
    var userInfo = wx.getStorageSync('userInfo');
    that.setData({
      userInfo: userInfo,
      userName: userInfo.name
    })
    that.getPlaceInfo()
    that.getTaskArray()
    that.getPastRecord()
    
  },

  /**
   * 获取项目
   */
  getTaskArray: function () {
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
  logout: function () {
    console.log('logout')
    wx.clearStorageSync()   //清空缓存
    wx.reLaunch({
      url: '../login/login'
    })
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
    if (that.data.taskIndex != -1) {
      that.getRecord();
      that.getPastRecord();
      that.getErrorRecord();
    }
    that.loadStorage();          //获取本地缓存 新增8.20
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
    
  },

  onGetPastRecord: function (i) {
    //获取打卡记录  
    var that = this;
    var emptyArray = new Array
    that.setData({
      selectedAll: false,
      selectedName: emptyArray,
      selectedId: emptyArray,
      selectedUserId: emptyArray

    })

    let cookie = wx.getStorageSync('cookieKey');
    let header = { 'Content-Type': 'application/x-www-form-urlencoded' };
    if (cookie) {
      header.Cookie = cookie;
    }
    var date = new Date();
    var date_s = date.getTime();
    date.setTime(date_s - i*60 * 60 * 24 * 1000)
    var dateTime = util.formatTime1(date);
    wx.request({
      url: app.globalData.url + '/workRecord/getByLeaderAndProjectAndStatusAndDate',
      data: {
        leaderId: that.data.userId,
        projectId: that.data.taskArray[that.data.taskIndex].id,
        status: that.data.status,
        date: dateTime
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
          that.logout()
        }   //注销
        if (res.data.code == 0) {
          console.log(res)
          console.log(dateTime)
        }
        else {
          console.log(res)
        }
        var list = that.data.pastListData
        for (var j in res.data.data){
          list.push(res.data.data[j])
        }
        that.setData({
          pastListData:list 
        })
      }
    })
  },

  onGetErrorRecord: function (i) {
    //获取打卡记录  
    var that = this;
    var emptyArray = new Array
    that.setData({
      selectedAll: false,
      selectedName: emptyArray,
      selectedId: emptyArray,
      selectedUserId: emptyArray

    })

    let cookie = wx.getStorageSync('cookieKey');
    let header = { 'Content-Type': 'application/x-www-form-urlencoded' };
    if (cookie) {
      header.Cookie = cookie;
    }
    var date = new Date();
    var date_s = date.getTime();
    date.setTime(date_s - i * 60 * 60 * 24 * 1000)
    var dateTime = util.formatTime1(date);
    wx.request({
      url: app.globalData.url + '/workRecord/getByLeaderAndProjectAndStatusAndDate',
      data: {
        leaderId: that.data.userId,
        projectId: that.data.taskArray[that.data.taskIndex].id,
        status: 3,
        date: dateTime
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
          that.logout()
        }   //注销
        if (res.data.code == 0) {
          console.log(res)
          console.log(dateTime)
        }
        else {
          console.log(res)
        }
        var list = that.data.errorListData
        for (var j in res.data.data) {
          list.push(res.data.data[j])
        }
        that.setData({
          errorListData: list
        })
      }
    })
  }
})