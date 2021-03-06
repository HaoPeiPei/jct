// pages/gbt/gbt.js
var app = getApp();
var wwwRoot = app.globalData.wwwRoot;
var imgRoot = app.globalData.imgRoot;
var httpRequst = require("../../utils/requst.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    header_text:
    {
      "left_icon": imgRoot+"/images/back-b.png",
      "title_text": "VIP贵宾厅",
      "right_icon": imgRoot+"/images/dh-b.png"
    },
    content_text:
    [
      { imgUrl: imgRoot+"/images/vipHall_1.png", title_text: "卓怿头等舱休息室", start_item: "08:00", end_item: "24:00", address:"深圳机场T3航站楼"},
      { imgUrl: imgRoot+"/images/vipHall_2.png", title_text: "卓怿头等舱休息室", start_item: "08:00", end_item: "24:00", address: "深圳机场T3航站楼" },
    ],
    wwwRoot: wwwRoot,
    imgRoot: imgRoot,
    cityCode: "",
    vipHall: [],
  },
  //返回
  catchBackChange: function (e) {
    wx.navigateBack({
      delta: 1
    })
  },
  //拨打电话
  telephone(e){
    var phoneNumber = e.currentTarget.dataset.phonenumber;
    wx.makePhoneCall({
      phoneNumber: phoneNumber
    });
  },
  //预定
  book:function(e){
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: 'gbtDetails/gbtDetails?id='+id,
    })
  },
  //初始化页面数据
  initData(options){
    var cityCode = options.cityCode;
    wx.showLoading({
      title: '数据加载中...',
    });
    httpRequst.HttpRequst(false, "/weixin/jctnew/ashx/service.ashx", { action: "getviphalllist", airportCode: cityCode } , "POST",res => {
      wx.hideLoading();
      if (res.Success) {
        this.setData({
          cityCode: cityCode,
          vipHall: JSON.parse(res.Data)
        });
      } else {
        wx.showToast({
          title: res.Message,
          icon: "none",
        });
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initData(options);
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