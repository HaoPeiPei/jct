// pages/ddxq/ddxq.js
var app = getApp();
var imgRoot = app.globalData.imgRoot;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderDetails:
    [
      { src_1: imgRoot+'/images/gbtd.png', orderTitle: '服务订单', src_2: imgRoot+'/images/3_46.png', nav_URL:"fwdd/fwdd"},
      { src_1: imgRoot+'/images/ydjp.png', orderTitle: '机票订单', src_2: imgRoot+'/images/3_46.png', nav_URL: "jpdd/jpdd" },
      /* { src_1: imgRoot+'/images/jd.png', orderTitle: '酒店订单', src_2: imgRoot+'/images/3_46.png', nav_URL: "sx/sx"}, */
      { src_1: imgRoot+'/images/dpc.png', orderTitle: '代泊车订单', src_2: imgRoot+'/images/3_46.png', nav_URL: "dbcdd/dbcdd" },
      { src_1: imgRoot+'/images/jsj.png', orderTitle: '接送机订单', src_2: imgRoot+'/images/3_46.png', nav_URL: "jsjdd/jsjdd" }
    ]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  //跳转到订单列表
  toOrderList(e){
    //检查memberID,无去登陆页面
    if(app.globalData.memberId == ''){
      wx.navigateTo({
        url: '/pages/logIndex/logIndex',
      })
    }else{
      let url = e.currentTarget.dataset.url;
      wx.navigateTo({
        url: url,
      })
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