// pages/register/register.js
//联系手机正则
var mobileReg = /^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|7[0-9])\d{8}$/;
//验证码正则
var regVerify = /^\d{6}$/;
//邀请码正则
var invitCodeReg = /^[0-9|a-z|A-Z]{3,8}$/;
var app = getApp();
var wwwRoot = app.globalData.wwwRoot;
var imgRoot = app.globalData.imgRoot;
var httpRequst = require("../../utils/requst");
var timer;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    header_text:
    {
      left_icon: imgRoot+"/images/back-f.png",
      title_text: "注册",
      right_icon: imgRoot+"/images/dh-f.png",
      "background_url": imgRoot+"/images/login_bg.png"
    },
    imgRoot: imgRoot,
    wait: 120,
    waitStyle: 'c-bg-f4393c',
    waitMsg: '发送验证码',
    mobile: '',
    verifyCode: '',
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
  //发送验证码
  sendVerify(){
    var that = this;
    var mobile = this.data.mobile;
    if (!this.checkMobile(mobile)) {
      wx.showToast({
        title: '请输入正确的手机号!',
        icon: 'none',
      });
      return false;
    }
    if (this.data.wait == 120) {
      that.countDown();
      var params = {
        action: "exists", 
        mobile: mobile
      };
      wx.showLoading({
        title: '加载中',
      });
      httpRequst.HttpRequst(true, "/weixin/miniprogram/ashx/login.ashx", params,"POST",function(res){
        wx.hideLoading()
        setTimeout(()=>{
          wx.showToast({
            title: res.Message,
            icon: 'none',
          });
        },1000)
        if (!res.Success) {
          clearInterval(timer);
          that.setData({
            waitStyle: 'c-bg-f4393c',
            waitMsg: '发送验证码',
            wait: 120,
          });
        }
      });
    }
  },
  //倒计时
  countDown() {
    var that = this;
    timer = setInterval(res=>{
      if (that.data.wait == 0) {
        that.setData({
          waitStyle: 'c-bg-f4393c',
          waitMsg: '发送验证码',
          wait: 120,
        });
        clearInterval(timer);
      } else {
        that.setData({
          waitStyle: 'c-bg-ccc',
          waitMsg: `发送验证码(${that.data.wait--}s)`,
          wait: that.data.wait--,
        });
      };
    },1000)
  },
  //注册
  formSubmit:function(e){
    var _this= this;
    var mobile = e.detail.value.mobile;
    var verifyCode = e.detail.value.verifyCode;
    if (!this.checkMobile(mobile)) {
      wx.showToast({
        title: '请输入正确的手机号!',
        icon: 'none',
      });
      return false;
    }
    else if (!this.checkVerify(verifyCode)) {
      wx.showToast({
        title: '验证码应为6位数字!',
        icon: 'none',
      });
      return false;
    }
    else {
      var params = {
        action: 'register',
        mobile: mobile,
        verifyCode: verifyCode,
        openId: app.globalData.openId,
        unionid: app.globalData.unionid,
      };
      httpRequst.HttpRequst(true, "/weixin/miniprogram/ashx/login.ashx", params,"POST",function(res){
        if(res.Success){
          wx.navigateBack({
            delta: 1, 
          })
        }else{
          setTimeout(()=>{
            wx.showToast({
              title: res.Message,
              icon: 'none',
            });
          },1000);
        }
      }); 
    }
  },
  checkMobile(mobile) {
    return mobileReg.test(mobile) ? true : false;
  },
  checkVerify(verifyCode) {
    return regVerify.test(verifyCode) ? true : false;
  },
  checkInvitCode(invitation) {
    return invitCodeReg.test(invitation) ? true : false;
  },
  //输入验证码，手机号
  bindinput(e){
    var id = e.currentTarget.id;
    this.setData({
      [id]: e.detail.value
    })
  },
  //初始化页面参数
  initData(options){
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