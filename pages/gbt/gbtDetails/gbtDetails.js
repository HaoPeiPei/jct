// pages/gbt/gbtDetails/gbtDetails.js
var app = getApp();
var wwwRoot = app.globalData.wwwRoot;
var imgRoot = app.globalData.imgRoot;
var httpRequst = require("../../../utils/requst.js");
var WxParse = require('../../../wxParse/wxParse.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    header_text:
    {
      "imgUrls": [imgRoot+"/images/vipHall_1.png", imgRoot+"/images/valet_bg.png", imgRoot+"/images/vipHall_1.png"],
      "left_icon": imgRoot+"/images/back-b.png",
      "title_text": "", "right_icon": imgRoot+"/images/dh-b.png"
    },
    equipment:
    [
      { icon_url: imgRoot+"/images/jbxxs_icon.png", icon_title: "嘉宾休息室" },
      { icon_url: imgRoot+"/images/xc_icon.png", icon_title: "小吃" },
      { icon_url: imgRoot+"/images/hbxsq_icon.png", icon_title: "航班显示器" },
      { icon_url: imgRoot+"/images/ds_icon.png", icon_title: "电视" },
      { icon_url: imgRoot+"/images/gbtxdj_icon.png", icon_title: "广播提醒登机" },
      { icon_url: imgRoot+"/images/csyl_icon.png", icon_title: "茶水/饮料" },
      { icon_url: imgRoot+"/images/tsj_icon.png", icon_title: "台式机" },
      { icon_url: imgRoot+"/images/bgzz_icon.png", icon_title: "报刊杂志" },
    ],
    imgRoot: imgRoot,
    service_info: "",
    buy_info: "",
    refund_info: "",
    purchase_notice:
    [
      "使用方式：购买之后，可直接前往深圳机场T3航站楼C岛岛尾西部航空柜台凭二维码领取VIP贵宾厅使用券，抵达指定休息室出示贵宾厅使用券即可。",
      "登机提示：南航、深航、国航的航班无提醒登机提醒"
    ],
    serviceId: '',
    service: {},
  },
  //立即预约
  catchLjyy:function(){
    var memberId = app.globalData.memberId;
    if(memberId == ""){
      this.toLogin();
    }else{
      wx.navigateTo({
        url: 'qrdd/qrdd?id='+this.data.service.id,
      })
    }
  },
  //返回
  catchBackChange:function(){
    wx.navigateBack({
      delta:1
    })
  },
  //拨打电话
  telephone(e){
    var phoneNumber = e.currentTarget.dataset.phonenumber;
    wx.makePhoneCall({
      phoneNumber: phoneNumber
    });
  },
  //初始化页面数据
  initData(options){
    var serviceId = options.id;
    this.setData({
      serviceId: serviceId
    });
    this.loadServiceImg(serviceId);
    this.loadService(serviceId);
  },
  //载入服务轮播图片
  loadServiceImg(){
    wx.showLoading({
      title: '数据加载中...',
    });
    httpRequst.HttpRequst(true, "/weixin/jctnew/ashx/service.ashx", {action: "getserviceimg", id: this.data.serviceId } , "POST",res => {
      wx.hideLoading();
      if (res.Success) {
        var data = JSON.parse(res.Data);
        var imgUrls = data.map(function(item){
          var imgUrl = wwwRoot+item.img_url
          return imgUrl
        });
        this.setData({
          header_text: Object.assign({},this.data.header_text,{
            imgUrls
          })
        });
      } else {
        wx.showToast({
          title: res.Message,
          icon: "none",
        });
      }
    });
  },
  //载入服务
  loadService(){
    wx.showLoading({
      title: '数据加载中...',
    });
    httpRequst.HttpRequst(false, "/weixin/jctnew/ashx/service.ashx", {action: "getservicebyid", id: this.data.serviceId } , "POST",res => {
      wx.hideLoading();
      if (res.Success) {
        var service = {};
        var service = JSON.parse(res.Data);
        var service_info = service["service_info"];
        var buy_info = service["buy_info"];
        var refund_info = service["refund_info"];
        this.setData({
          header_text: Object.assign({},this.data.header_text,{
          }),
          service: service,
          service_info: WxParse.wxParse('service_info', 'html', service_info, this, 5),
          buy_info: WxParse.wxParse('buy_info', 'html', buy_info, this, 5),
          refund_info: WxParse.wxParse('refund_info', 'html', refund_info, this, 5),
        });
      } else {
        wx.showToast({
          title: res.Message,
          icon: "none",
        });
      }
    });
  },
  //检查memberID,无去登陆页面
  toLogin(){
    if(app.globalData.memberId == ''){
      wx.navigateTo({
        url: 'pages/logIndex/logIndex',
      })
    }
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